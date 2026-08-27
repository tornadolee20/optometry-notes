import { normalizeAskQuestion, structureAskQuestion, type AskAnalysisSession, type AskStructuredDimensions } from "./ask-engine.ts";
import { compareCrossNodes, discoverCrossNodeCandidates, type CrossNodeDiscovery } from "./cross-node-engine.ts";
import { buildMandala } from "./mandala-engine.ts";
import { entityIndex, relationshipsFor } from "./relationships.ts";
import type { IntakeCandidate, KdfCard, KdfSnapshot } from "./types.ts";

export const QUESTION_UNKNOWN = "UNKNOWN";

export type QuestionSourceClass = "CROSS_NODE" | "MANDALA" | "ASK_KDF" | "DISCOVERY_QUESTION" | "GAP" | "PRACTICE_SIGNAL" | "FEEDBACK_SIGNAL" | "AGENT_REACH_SIGNAL";
export type QuestionOverlapState = "UNIQUE" | "LIKELY_DUPLICATE" | "OVERLAPPING" | "SAME_CORE_DIFFERENT_SCOPE" | "DISTINCT";
export type QuestionScope = "TOO_BROAD" | "BOUNDED" | "TOO_NARROW" | "UNKNOWN";
export type QuestionAnswerability = "RESEARCHABLE" | "PARTIALLY_RESEARCHABLE" | "INSUFFICIENT_CONTEXT";
export type QuestionNovelty = "ALREADY_COVERED" | "EXTENDS_EXISTING" | "POSSIBLY_NEW" | "UNKNOWN";
export type QuestionEvidenceReadiness = "EVIDENCE_AVAILABLE" | "PARTIAL_EVIDENCE" | "EVIDENCE_MISSING" | "NEEDS_EXTERNAL_VERIFICATION";
export type QuestionDuplicateRisk = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
export type QuestionOwnerPriority = "HIGH" | "MEDIUM" | "LOW" | "UNSET";
export type QuestionRecommendation = "NO_NEW_RQ_NEEDED" | "REGENERATED_EXTENSION_CANDIDATE" | "REGENERATED_NEW_SCOPE_CANDIDATE" | "NEEDS_OWNER_REVIEW" | "INSUFFICIENT_FOR_REGENERATION" | "USE_EXISTING_DISCOVERY_QUESTION";

export interface NormalizedQuestionDimensions extends AskStructuredDimensions {
  topic_scope: string;
  origin_type: QuestionSourceClass;
  origin_ids: string[];
  evidence_context: string[];
  gap_context: string[];
}

export interface RawQuestionCandidate {
  raw_candidate_id: string;
  source_class: QuestionSourceClass;
  original_question: string;
  origin_ids: string[];
  origin_label: string;
  root_topic: string;
  parent: string;
  origin_gap_id: string;
  cross_relation_id: string;
  mandala_dimension: string;
  related_kdf_ids: string[];
  evidence_ids: string[];
  signal_ids: string[];
  legacy_ids: string[];
  limitations: string[];
  dimensions: NormalizedQuestionDimensions;
  exploratory: boolean;
}

export interface QuestionCluster {
  cluster_id: string;
  raw_candidates: RawQuestionCandidate[];
  overlap_state: QuestionOverlapState;
  shared_dimensions: string[];
  preserved_scope_differences: string[];
  underlying_intent: string;
}

export interface ExistingQuestionComparison {
  id: string;
  topic: string;
  overlap_state: QuestionOverlapState;
  covered_dimensions: string[];
  new_dimensions: string[];
  needed: boolean;
}

export interface RegenerationGapBasis {
  originating_gaps: string[];
  evidence_limitations: string[];
  unresolved_dimensions: string[];
  why_existing_rq_does_not_close: string;
  state: "BOUNDED_GAP" | "EXPLORATORY";
}

export interface RegeneratedQuestionCandidate {
  regeneration_id: string;
  raw_candidate_ids: string[];
  origin_types: QuestionSourceClass[];
  origin_ids: string[];
  regenerated_question: string;
  alternative_formulations: string[];
  structured_dimensions: NormalizedQuestionDimensions;
  closest_existing_rqs: ExistingQuestionComparison[];
  closest_discovery_questions: ExistingQuestionComparison[];
  overlap_state: QuestionOverlapState;
  quality_scope: QuestionScope;
  answerability: QuestionAnswerability;
  novelty: QuestionNovelty;
  evidence_readiness: QuestionEvidenceReadiness;
  duplicate_risk: QuestionDuplicateRisk;
  owner_priority: QuestionOwnerPriority;
  gap_basis: RegenerationGapBasis;
  evidence_context: { evidence_card_ids: string[]; strongest_evidence_level: string; limitations: string[] };
  signal_context: { practice_ids: string[]; feedback_ids: string[]; agent_reach_ids: string[]; field_observation_ids: string[] };
  legacy_context: { article_ids: string[]; role: "RELATED_CONTENT_ONLY" };
  rationale: string;
  what_changed: string[];
  uncertainty: string[];
  recommendation: QuestionRecommendation;
  owner_review_required: true;
  candidate_state: "CANDIDATE";
}

export interface QuestionPilot {
  pilot: "A" | "B" | "C" | "D";
  title: string;
  sources: string[];
  result: RegeneratedQuestionCandidate;
}

export interface QuestionRegenerationSnapshot {
  engine_version: "kdf-question-regeneration-v0.1";
  output_policy: "session-only-no-persistence";
  raw_candidates: RawQuestionCandidate[];
  clusters: QuestionCluster[];
  regenerated_candidates: RegeneratedQuestionCandidate[];
  pilots: QuestionPilot[];
  counts: {
    raw: number;
    clusters: number;
    regenerated: number;
    possible_duplicates: number;
    no_new_rq_needed: number;
    owner_review: number;
  };
}

export interface ManualRegenerationResult {
  status: "READY" | "INVALID_SELECTION" | "UNRELATED_SELECTION";
  message: string;
  result: RegeneratedQuestionCandidate | null;
}

const STRUCTURED_KEYS: Array<keyof AskStructuredDimensions> = ["population", "age_group", "intervention_or_exposure", "comparator", "outcome", "measurement", "mechanism", "context", "timeframe", "practice_context"];
const BROAD_TERMS = new Set(["近視", "ai", "孩子", "兒童", "視覺", "鏡片", "問題", "研究"]);

function unique(values: string[]) { return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right, "zh-TW")); }
function known(value: string | undefined) { return value?.trim() || QUESTION_UNKNOWN; }
function stableId(prefix: string, values: string[]) {
  let hash = 2166136261;
  for (const char of values.join("\u0000")) { hash ^= char.codePointAt(0) ?? 0; hash = Math.imul(hash, 16777619); }
  return `${prefix}-${(hash >>> 0).toString(16).padStart(8, "0").toUpperCase()}`;
}

function canonical(value: string) {
  return normalizeAskQuestion(value).toLocaleLowerCase("zh-TW").replace(/[\s\p{P}\p{S}]+/gu, "");
}

function semanticTokens(value: string) {
  const normalized = normalizeAskQuestion(value).toLocaleLowerCase("zh-TW");
  const values = new Set<string>();
  for (const token of normalized.match(/[a-z0-9]+|[\p{Script=Han}]{2,}/gu) ?? []) {
    if (!BROAD_TERMS.has(token)) values.add(token);
    if (/^[\p{Script=Han}]+$/u.test(token)) {
      for (let index = 0; index < token.length - 1; index += 1) {
        const bigram = token.slice(index, index + 2);
        if (!BROAD_TERMS.has(bigram)) values.add(bigram);
      }
    }
  }
  return values;
}

function similarity(left: string, right: string) {
  const a = semanticTokens(left); const b = semanticTokens(right);
  if (!a.size || !b.size) return 0;
  const shared = [...a].filter((value) => b.has(value)).length;
  return shared / new Set([...a, ...b]).size;
}

function dimensionOverlap(left: RawQuestionCandidate, right: RawQuestionCandidate) {
  return STRUCTURED_KEYS.filter((key) => {
    const a = left.dimensions[key]; const b = right.dimensions[key];
    return a !== QUESTION_UNKNOWN && b !== QUESTION_UNKNOWN && canonical(a) === canonical(b);
  }).map(String);
}

function meaningfulDifferences(left: RawQuestionCandidate, right: RawQuestionCandidate) {
  return STRUCTURED_KEYS.filter((key) => {
    const a = left.dimensions[key]; const b = right.dimensions[key];
    return a !== QUESTION_UNKNOWN && b !== QUESTION_UNKNOWN && canonical(a) !== canonical(b);
  }).map(String);
}

export function compareRawQuestionCandidates(left: RawQuestionCandidate, right: RawQuestionCandidate): QuestionOverlapState {
  if (left.raw_candidate_id === right.raw_candidate_id) return "UNIQUE";
  if (canonical(left.original_question) === canonical(right.original_question)) return "LIKELY_DUPLICATE";
  const shared = dimensionOverlap(left, right);
  const differences = meaningfulDifferences(left, right);
  const sameRoot = left.root_topic !== QUESTION_UNKNOWN && left.root_topic === right.root_topic;
  const sameParent = left.parent !== QUESTION_UNKNOWN && left.parent === right.parent;
  const sameGap = left.origin_gap_id !== QUESTION_UNKNOWN && left.origin_gap_id === right.origin_gap_id;
  const sameCrossRelation = left.cross_relation_id !== QUESTION_UNKNOWN && left.cross_relation_id === right.cross_relation_id;
  const sameMandalaDimension = left.mandala_dimension !== QUESTION_UNKNOWN && left.mandala_dimension === right.mandala_dimension && sameRoot;
  const adaptationScope = (value: string) => /初次|初期|適應|不自然/iu.test(value);
  const dynamicScope = (value: string) => /高動態|戶外|運動|樓梯|動態任務/iu.test(value);
  if (sameRoot && ((adaptationScope(left.original_question) && dynamicScope(right.original_question) && !dynamicScope(left.original_question)) || (adaptationScope(right.original_question) && dynamicScope(left.original_question) && !dynamicScope(right.original_question)))) return "SAME_CORE_DIFFERENT_SCOPE";
  if (sameRoot && differences.some((key) => ["outcome", "measurement", "context", "timeframe", "practice_context"].includes(key)) && shared.length >= 1) return "SAME_CORE_DIFFERENT_SCOPE";
  const textSimilarity = similarity(left.original_question, right.original_question);
  if ((sameGap || sameCrossRelation) && (shared.length >= 1 || textSimilarity >= 0.16)) return "OVERLAPPING";
  if (sameMandalaDimension && shared.length >= 2 && textSimilarity >= 0.18) return "OVERLAPPING";
  if (sameRoot && sameParent && shared.length >= 3 && textSimilarity >= 0.2) return "OVERLAPPING";
  if (sameRoot && shared.length >= 4 && textSimilarity >= 0.28) return "OVERLAPPING";
  return "DISTINCT";
}

function normalizeDimensions(sourceClass: QuestionSourceClass, text: string, originIds: string[], evidence: string[], gaps: string[]): NormalizedQuestionDimensions {
  const dimensions = structureAskQuestion(text);
  return { ...dimensions, topic_scope: known(dimensions.topic), origin_type: sourceClass, origin_ids: unique(originIds), evidence_context: unique(evidence), gap_context: unique(gaps) };
}

function rawCandidate(input: Omit<RawQuestionCandidate, "dimensions">): RawQuestionCandidate {
  return { ...input, dimensions: normalizeDimensions(input.source_class, input.original_question, input.origin_ids, input.evidence_ids, input.origin_gap_id === QUESTION_UNKNOWN ? [] : [input.origin_gap_id]) };
}

function contextForIds(snapshot: KdfSnapshot, ids: string[]) {
  const index = entityIndex(snapshot);
  const related = new Set(ids);
  for (const id of ids) for (const item of relationshipsFor(id, snapshot)) related.add(item.id);
  const cards = [...related].map((id) => index.get(id)?.card).filter((card): card is KdfCard => Boolean(card));
  const evidence = cards.filter((card) => card.type === "evidence-card").map((card) => card.id);
  const practice = cards.filter((card) => ["practice-card", "field-observation", "uncle-lens"].includes(card.type)).map((card) => card.id);
  const gaps = cards.filter((card) => card.gap_status === "open").map((card) => card.id);
  const limitations = cards.filter((card) => card.type === "evidence-card").flatMap((card) => card.detail_sections.filter((section) => /limitation|what we do not know|cannot be concluded|限制|未知/iu.test(section.heading)).map((section) => section.content));
  const legacy = snapshot.content.legacy_blog.articles.filter((article) => article.kdf_candidates.some((candidate) => ids.includes(candidate.kdf_id))).map((article) => article.id);
  return { evidence: unique(evidence), practice: unique(practice), gaps: unique(gaps), limitations: unique(limitations), legacy: unique(legacy) };
}

function rawFromCross(discovery: CrossNodeDiscovery): RawQuestionCandidate[] {
  const question = discovery.question_candidate;
  const gap = discovery.gap_candidate;
  const ids = discovery.source_nodes.map((node) => node.id);
  const common = {
    origin_ids: ids, root_topic: discovery.source_nodes.map((node) => node.dimensions.root_topic).find((value) => value !== QUESTION_UNKNOWN) ?? QUESTION_UNKNOWN,
    parent: QUESTION_UNKNOWN, cross_relation_id: discovery.discovery_id, mandala_dimension: QUESTION_UNKNOWN,
    related_kdf_ids: ids, evidence_ids: discovery.related_evidence, signal_ids: unique([...discovery.related_feedback, ...discovery.related_practice]), legacy_ids: discovery.related_legacy_content,
    limitations: unique([...(gap?.evidence_limitations ?? []), ...discovery.uncertainty]), exploratory: !gap,
  };
  const result: RawQuestionCandidate[] = [];
  if (question) result.push(rawCandidate({ ...common, raw_candidate_id: `${discovery.discovery_id}:QUESTION`, source_class: "CROSS_NODE", original_question: question.question, origin_label: `${question.originating_relation_candidate} · ${ids.join(" ↔ ")}`, origin_gap_id: gap ? `${discovery.discovery_id}:GAP` : QUESTION_UNKNOWN }));
  if (gap) result.push(rawCandidate({ ...common, raw_candidate_id: `${discovery.discovery_id}:GAP`, source_class: "GAP", original_question: gap.statement, origin_label: `NEW_GAP_CANDIDATE · ${ids.join(" ↔ ")}`, origin_gap_id: `${discovery.discovery_id}:GAP`, exploratory: false }));
  return result;
}

function rawFromDiscovery(snapshot: KdfSnapshot, card: KdfCard): RawQuestionCandidate {
  const context = contextForIds(snapshot, [card.id, ...card.origin_cards]);
  return rawCandidate({ raw_candidate_id: `DQ:${card.id}`, source_class: "DISCOVERY_QUESTION", original_question: card.topic, origin_ids: [card.id], origin_label: `${card.id} · formal Discovery Question`, root_topic: known(card.root_topic), parent: known(card.parent), origin_gap_id: card.gap_status === "open" ? card.id : QUESTION_UNKNOWN, cross_relation_id: QUESTION_UNKNOWN, mandala_dimension: QUESTION_UNKNOWN, related_kdf_ids: unique([card.id, ...card.origin_cards]), evidence_ids: context.evidence, signal_ids: context.practice, legacy_ids: context.legacy, limitations: unique([...card.missing_evidence, ...context.limitations]), exploratory: card.gap_status !== "open" });
}

function rawFromMandala(snapshot: KdfSnapshot) {
  return snapshot.formal.research_questions.flatMap((rq) => {
    const mandala = buildMandala(snapshot, rq.id);
    if (!mandala) return [];
    return mandala.dimensions.flatMap((dimension) => dimension.children.map((cell) => rawCandidate({
      raw_candidate_id: `MANDALA:${cell.cell_id}`, source_class: "MANDALA", original_question: cell.question_text,
      origin_ids: [cell.cell_id, rq.id], origin_label: `${cell.cell_id} · THINKING_ONLY`, root_topic: known(rq.root_topic), parent: known(rq.parent),
      origin_gap_id: cell.open_gap_nodes[0] ?? QUESTION_UNKNOWN, cross_relation_id: QUESTION_UNKNOWN, mandala_dimension: `${rq.root_topic}:${dimension.template.id}`,
      related_kdf_ids: unique([rq.id, ...cell.related_kdf_nodes]), evidence_ids: cell.related_evidence, signal_ids: unique([...cell.related_practice, ...cell.related_feedback, ...cell.related_agent_reach]), legacy_ids: cell.related_articles,
      limitations: cell.known_limitations, exploratory: !cell.gap_signal,
    })));
  });
}

function rawFromAsk(session: AskAnalysisSession | null | undefined): RawQuestionCandidate[] {
  if (!session) return [];
  return session.candidate_questions.map((candidate, index) => rawCandidate({ raw_candidate_id: `ASK:${session.analysis_id}:${index + 1}`, source_class: "ASK_KDF", original_question: candidate.question, origin_ids: [session.analysis_id, ...candidate.related_existing_nodes], origin_label: `${session.analysis_id} · Ask KDF candidate`, root_topic: session.mandala_context.root_id || QUESTION_UNKNOWN, parent: QUESTION_UNKNOWN, origin_gap_id: session.gap_context[0]?.related_node_ids[0] ?? QUESTION_UNKNOWN, cross_relation_id: QUESTION_UNKNOWN, mandala_dimension: QUESTION_UNKNOWN, related_kdf_ids: candidate.related_existing_nodes, evidence_ids: session.evidence_context.map((item) => item.id), signal_ids: unique([...session.practice_context, ...session.feedback_context].map((item) => item.id)), legacy_ids: session.legacy_context.map((item) => item.id), limitations: session.limitations, exploratory: session.gap_context.length === 0 }));
}

function extractQuestion(summary: string) {
  const colon = Math.max(summary.lastIndexOf("："), summary.lastIndexOf(":"));
  const tail = colon >= 0 ? summary.slice(colon + 1).trim() : summary.trim();
  return tail.includes("？") || tail.includes("?") ? tail : "";
}

function rawFromIntake(snapshot: KdfSnapshot, candidate: IntakeCandidate): RawQuestionCandidate | null {
  const question = extractQuestion(candidate.normalized_summary);
  if (!question) return null;
  const sourceClass: QuestionSourceClass = candidate.item_kind === "AGENT_REACH_DISCOVERY" ? "AGENT_REACH_SIGNAL" : candidate.feedback_type === "PRACTICE_SIGNAL" || candidate.feedback_type === "FIELD_OBSERVATION_CANDIDATE" ? "PRACTICE_SIGNAL" : "FEEDBACK_SIGNAL";
  const context = contextForIds(snapshot, candidate.related_kdf_ids);
  const cards = snapshot.formal.cards.filter((card) => candidate.related_kdf_ids.includes(card.id));
  return rawCandidate({ raw_candidate_id: `INTAKE:${candidate.id}`, source_class: sourceClass, original_question: question, origin_ids: [candidate.id], origin_label: `${candidate.id} · ${candidate.item_kind} · NOT EVIDENCE`, root_topic: cards.map((card) => card.root_topic).find(Boolean) ?? QUESTION_UNKNOWN, parent: cards.map((card) => card.parent).find(Boolean) ?? QUESTION_UNKNOWN, origin_gap_id: context.gaps[0] ?? QUESTION_UNKNOWN, cross_relation_id: QUESTION_UNKNOWN, mandala_dimension: QUESTION_UNKNOWN, related_kdf_ids: candidate.related_kdf_ids, evidence_ids: context.evidence, signal_ids: unique([candidate.id, ...context.practice]), legacy_ids: context.legacy, limitations: context.limitations, exploratory: context.gaps.length === 0 });
}

function pilotRawCandidates(snapshot: KdfSnapshot) {
  const card = (id: string) => snapshot.formal.cards.find((item) => item.id === id);
  const pilot = (id: string, sourceClass: QuestionSourceClass, question: string, ids: string[], root = "KDF-001", gap = QUESTION_UNKNOWN) => {
    const context = contextForIds(snapshot, ids);
    return rawCandidate({ raw_candidate_id: `PILOT:${id}`, source_class: sourceClass, original_question: question, origin_ids: ids, origin_label: `Pilot ${id} · owner-approved acceptance input`, root_topic: root, parent: ids.map((value) => card(value)?.parent).find(Boolean) ?? QUESTION_UNKNOWN, origin_gap_id: gap === QUESTION_UNKNOWN ? context.gaps[0] ?? QUESTION_UNKNOWN : gap, cross_relation_id: QUESTION_UNKNOWN, mandala_dimension: QUESTION_UNKNOWN, related_kdf_ids: ids, evidence_ids: context.evidence, signal_ids: unique([...context.practice, ...ids.filter((value) => /^SFI-|^ARD-/u.test(value))]), legacy_ids: context.legacy, limitations: context.limitations, exploratory: false });
  };
  return [
    pilot("B-PRACTICE", "PRACTICE_SIGNAL", "兒童初次配戴周邊離焦鏡片時的主觀不自然感與初期適應，如何連結日常功能表現？", ["KDF-001-B-001", "KDF-001-F-001", "PRC-KDF-001-B-001", "SFI-20260825-REAL-PRACTICE-001"], "KDF-001", "DQ-KDF-001-001"),
    pilot("C-MEASUREMENT", "GAP", "眼軸變化是否足以代表近視控制成效？", ["KDF-001-F-001", "KDF-001-G"], "KDF-001", "KDF-001-F-001"),
    pilot("D-GOVERNANCE", "AGENT_REACH_SIGNAL", card("KDF-002-A-001")?.topic ?? "AI 輔助驗光建議的透明、監督與責任應如何治理？", ["ARD-20260824-AIGOV001", "KDF-002-A-001"], "KDF-002", "KDF-002-A-001"),
  ];
}

export function collectRawQuestionCandidates(snapshot: KdfSnapshot, askSession?: AskAnalysisSession | null) {
  const cross = discoverCrossNodeCandidates(snapshot, 24).flatMap((item) => rawFromCross(item));
  const discovery = snapshot.formal.discovery_questions.map((card) => rawFromDiscovery(snapshot, card));
  const mandala = rawFromMandala(snapshot);
  const intake = [...snapshot.intake.agent_reach.candidates, ...snapshot.intake.social_feedback.candidates].map((candidate) => rawFromIntake(snapshot, candidate)).filter((candidate): candidate is RawQuestionCandidate => Boolean(candidate));
  const openQuestions = snapshot.formal.cards.flatMap((card) => card.open_questions.map((question, index) => {
    const context = contextForIds(snapshot, [card.id]);
    return rawCandidate({ raw_candidate_id: `GAP:${card.id}:${index + 1}`, source_class: card.type === "practice-card" ? "PRACTICE_SIGNAL" : "GAP", original_question: question, origin_ids: [card.id], origin_label: `${card.id} · explicit open_questions`, root_topic: known(card.root_topic), parent: known(card.parent), origin_gap_id: card.id, cross_relation_id: QUESTION_UNKNOWN, mandala_dimension: QUESTION_UNKNOWN, related_kdf_ids: [card.id], evidence_ids: context.evidence, signal_ids: context.practice, legacy_ids: context.legacy, limitations: context.limitations, exploratory: false });
  }));
  return [...cross, ...discovery, ...mandala, ...rawFromAsk(askSession), ...intake, ...openQuestions, ...pilotRawCandidates(snapshot)]
    .sort((left, right) => left.raw_candidate_id.localeCompare(right.raw_candidate_id));
}

export function clusterRawCandidates(rawCandidates: RawQuestionCandidate[]) {
  const parent = rawCandidates.map((_, index) => index);
  const find = (index: number): number => parent[index] === index ? index : (parent[index] = find(parent[index]));
  const union = (left: number, right: number) => { const a = find(left); const b = find(right); if (a !== b) parent[b] = a; };
  for (let left = 0; left < rawCandidates.length; left += 1) for (let right = left + 1; right < rawCandidates.length; right += 1) {
    const state = compareRawQuestionCandidates(rawCandidates[left], rawCandidates[right]);
    if (state === "LIKELY_DUPLICATE" || state === "OVERLAPPING") union(left, right);
  }
  const grouped = new Map<number, RawQuestionCandidate[]>();
  rawCandidates.forEach((candidate, index) => { const root = find(index); grouped.set(root, [...(grouped.get(root) ?? []), candidate]); });
  const clusters = [...grouped.values()].map((candidates): QuestionCluster => {
    const pairStates = candidates.flatMap((candidate, left) => candidates.slice(left + 1).map((other) => compareRawQuestionCandidates(candidate, other)));
    const outsideScopeDifference = candidates.some((candidate) => rawCandidates.some((other) => !candidates.includes(other) && compareRawQuestionCandidates(candidate, other) === "SAME_CORE_DIFFERENT_SCOPE"));
    const state: QuestionOverlapState = pairStates.includes("LIKELY_DUPLICATE") ? "LIKELY_DUPLICATE" : pairStates.includes("OVERLAPPING") ? "OVERLAPPING" : outsideScopeDifference ? "SAME_CORE_DIFFERENT_SCOPE" : candidates.length === 1 ? "UNIQUE" : "DISTINCT";
    const shared = STRUCTURED_KEYS.filter((key) => {
      const values = unique(candidates.map((candidate) => candidate.dimensions[key]).filter((value) => value !== QUESTION_UNKNOWN).map(canonical));
      return values.length === 1 && candidates.every((candidate) => candidate.dimensions[key] !== QUESTION_UNKNOWN);
    }).map(String);
    const differences = unique(candidates.flatMap((candidate, left) => candidates.slice(left + 1).flatMap((other) => meaningfulDifferences(candidate, other))));
    return { cluster_id: stableId("QCL", candidates.map((candidate) => candidate.raw_candidate_id).sort()), raw_candidates: candidates.sort((left, right) => left.raw_candidate_id.localeCompare(right.raw_candidate_id)), overlap_state: state, shared_dimensions: shared, preserved_scope_differences: differences, underlying_intent: candidates.map((candidate) => candidate.dimensions.topic_scope).find((value) => value !== QUESTION_UNKNOWN) ?? QUESTION_UNKNOWN };
  });
  return clusters.sort((left, right) => right.raw_candidates.length - left.raw_candidates.length || left.cluster_id.localeCompare(right.cluster_id));
}

function combinedDimensions(cluster: QuestionCluster): NormalizedQuestionDimensions {
  const pick = (key: keyof AskStructuredDimensions) => cluster.raw_candidates.map((candidate) => candidate.dimensions[key]).find((value) => value !== QUESTION_UNKNOWN) ?? QUESTION_UNKNOWN;
  const first = cluster.raw_candidates[0];
  return { topic: pick("topic"), population: pick("population"), age_group: pick("age_group"), intervention_or_exposure: pick("intervention_or_exposure"), comparator: pick("comparator"), outcome: pick("outcome"), measurement: pick("measurement"), mechanism: pick("mechanism"), context: pick("context"), timeframe: pick("timeframe"), practice_context: pick("practice_context"), topic_scope: pick("topic"), origin_type: first.source_class, origin_ids: unique(cluster.raw_candidates.flatMap((candidate) => candidate.origin_ids)), evidence_context: unique(cluster.raw_candidates.flatMap((candidate) => candidate.evidence_ids)), gap_context: unique(cluster.raw_candidates.map((candidate) => candidate.origin_gap_id).filter((value) => value !== QUESTION_UNKNOWN)) };
}

function safeCausalLanguage(question: string) {
  return question.replace(/造成|導致/gu, "是否伴隨").replace(/證明/gu, "檢驗").replace(/有效改善/gu, "是否存在改善差異").replace(/能解釋或預測/gu, "是否相關，或在既定資料下具有預測價值");
}

function pilotWording(cluster: QuestionCluster) {
  const ids = new Set(cluster.raw_candidates.flatMap((candidate) => [candidate.raw_candidate_id, ...candidate.origin_ids]));
  if (ids.has("PILOT:B-PRACTICE")) return "在兒童初次配戴周邊離焦鏡片的適應期間，主觀不自然感與日常功能表現如何呈現，且不同配戴情境是否伴隨個體差異？";
  if (ids.has("PILOT:C-MEASUREMENT")) return "在兒童近視控制成效評估中，單一眼軸變化是否足以代表治療反應，或仍需結合視覺功能與配戴表現等不同結果面向？";
  if (ids.has("PILOT:D-GOVERNANCE")) return cluster.raw_candidates.find((candidate) => candidate.origin_ids.includes("KDF-002-A-001"))?.original_question ?? cluster.raw_candidates[0].original_question;
  const origins = cluster.raw_candidates.flatMap((candidate) => candidate.origin_ids);
  if (origins.includes("KDF-001-B-001") && origins.includes("KDF-001-F-001") && cluster.raw_candidates.some((candidate) => candidate.source_class === "CROSS_NODE")) return "在配戴周邊離焦鏡片的兒童中，初期中央／離軸視覺與功能表現是否與長期眼軸增長反應的個體差異相關？";
  return "";
}

function formulate(cluster: QuestionCluster, dimensions: NormalizedQuestionDimensions) {
  const pilot = pilotWording(cluster);
  if (pilot) return pilot;
  const ranked = [...cluster.raw_candidates].sort((left, right) => {
    const questionA = /[？?]$/u.test(left.original_question.trim()) ? 1 : 0; const questionB = /[？?]$/u.test(right.original_question.trim()) ? 1 : 0;
    const sourceRank: Record<QuestionSourceClass, number> = { DISCOVERY_QUESTION: 0, CROSS_NODE: 1, ASK_KDF: 2, GAP: 3, MANDALA: 4, PRACTICE_SIGNAL: 5, FEEDBACK_SIGNAL: 6, AGENT_REACH_SIGNAL: 7 };
    return questionB - questionA || sourceRank[left.source_class] - sourceRank[right.source_class] || left.original_question.length - right.original_question.length;
  });
  let question = ranked[0].original_question.trim();
  if (/適不適合|適合嗎/iu.test(question)) {
    const context = dimensions.context !== QUESTION_UNKNOWN ? dimensions.context : "既定情境";
    const outcome = dimensions.outcome !== QUESTION_UNKNOWN ? dimensions.outcome : "可觀察的功能表現";
    const population = dimensions.population !== QUESTION_UNKNOWN ? dimensions.population : "既定研究族群";
    question = `在${population}的${context}下，${dimensions.intervention_or_exposure !== QUESTION_UNKNOWN ? dimensions.intervention_or_exposure : dimensions.topic_scope}的${outcome}如何呈現？`;
  } else if (/有沒有影響/iu.test(question)) {
    const exposure = dimensions.intervention_or_exposure !== QUESTION_UNKNOWN ? dimensions.intervention_or_exposure : dimensions.topic_scope;
    const outcome = dimensions.outcome !== QUESTION_UNKNOWN ? dimensions.outcome : "明確 outcome";
    question = `在${dimensions.context !== QUESTION_UNKNOWN ? dimensions.context : "既定研究情境"}下，${exposure}與${outcome}是否存在差異或相關？`;
  }
  if (!/[？?]$/u.test(question)) question = `${question.replace(/[。；;]+$/u, "")}？`;
  return safeCausalLanguage(question);
}

function syntheticRawForCard(card: KdfCard): RawQuestionCandidate {
  return rawCandidate({ raw_candidate_id: `COMPARE:${card.id}`, source_class: card.type === "discovery-question" ? "DISCOVERY_QUESTION" : "GAP", original_question: card.topic, origin_ids: [card.id], origin_label: card.id, root_topic: known(card.root_topic), parent: known(card.parent), origin_gap_id: card.gap_status === "open" ? card.id : QUESTION_UNKNOWN, cross_relation_id: QUESTION_UNKNOWN, mandala_dimension: QUESTION_UNKNOWN, related_kdf_ids: [card.id], evidence_ids: [], signal_ids: [], legacy_ids: [], limitations: card.missing_evidence, exploratory: false });
}

function compareExisting(question: string, cluster: QuestionCluster, cards: KdfCard[]) {
  const generated = rawCandidate({ raw_candidate_id: "GENERATED", source_class: "GAP", original_question: question, origin_ids: [], origin_label: "generated", root_topic: cluster.raw_candidates.map((candidate) => candidate.root_topic).find((value) => value !== QUESTION_UNKNOWN) ?? QUESTION_UNKNOWN, parent: cluster.raw_candidates.map((candidate) => candidate.parent).find((value) => value !== QUESTION_UNKNOWN) ?? QUESTION_UNKNOWN, origin_gap_id: QUESTION_UNKNOWN, cross_relation_id: QUESTION_UNKNOWN, mandala_dimension: QUESTION_UNKNOWN, related_kdf_ids: [], evidence_ids: [], signal_ids: [], legacy_ids: [], limitations: [], exploratory: false });
  return cards.map((card): ExistingQuestionComparison & { rank: number } => {
    const existing = syntheticRawForCard(card);
    const exact = canonical(question) === canonical(card.topic);
    const shared = dimensionOverlap(generated, existing);
    const differences = meaningfulDifferences(generated, existing);
    const text = similarity(question, card.topic);
    const sameRoot = generated.root_topic !== QUESTION_UNKNOWN && generated.root_topic === existing.root_topic;
    let overlap: QuestionOverlapState = exact ? "LIKELY_DUPLICATE" : sameRoot && differences.some((key) => ["outcome", "measurement", "context", "timeframe"].includes(key)) && shared.length >= 1 ? "SAME_CORE_DIFFERENT_SCOPE" : sameRoot && (shared.length >= 3 || text >= 0.32) ? "OVERLAPPING" : "DISTINCT";
    if (cluster.raw_candidates.some((candidate) => candidate.origin_ids.includes(card.id)) && exact) overlap = "LIKELY_DUPLICATE";
    const rank = (exact ? 100 : 0) + (sameRoot ? 20 : 0) + shared.length * 8 + Math.round(text * 30);
    return { id: card.id, topic: card.topic, overlap_state: overlap, covered_dimensions: shared, new_dimensions: differences, needed: overlap !== "LIKELY_DUPLICATE", rank };
  }).sort((left, right) => right.rank - left.rank || left.id.localeCompare(right.id)).slice(0, 3).map(({ rank: _rank, ...item }) => item);
}

function questionScope(question: string, dimensions: NormalizedQuestionDimensions): QuestionScope {
  const broadOnly = /^(近視|AI|孩子|兒童|視覺)(怎麼辦|是什麼|有影響嗎|如何)[？?]?$/iu.test(question.replace(/\s+/gu, ""));
  if (broadOnly || question.length < 12) return "TOO_BROAD";
  const knownCount = STRUCTURED_KEYS.filter((key) => dimensions[key] !== QUESTION_UNKNOWN).length;
  if (knownCount >= 2 && question.length <= 150) return "BOUNDED";
  if (question.length > 220) return "TOO_NARROW";
  return "UNKNOWN";
}

function alternatives(question: string, dimensions: NormalizedQuestionDimensions) {
  const result: string[] = [];
  if (dimensions.practice_context !== QUESTION_UNKNOWN && dimensions.outcome !== QUESTION_UNKNOWN) result.push(`在${dimensions.practice_context}中，${dimensions.outcome}如何呈現，且哪些條件需要納入實務觀察？`);
  if (dimensions.measurement !== QUESTION_UNKNOWN && dimensions.outcome !== QUESTION_UNKNOWN && canonical(dimensions.measurement) !== canonical(dimensions.outcome)) result.push(`${dimensions.measurement}是否足以代表${dimensions.outcome}，或需要加入其他功能量測？`);
  return unique(result.map(safeCausalLanguage).filter((item) => canonical(item) !== canonical(question))).slice(0, 2);
}

function signalContext(cluster: QuestionCluster) {
  const ids = unique(cluster.raw_candidates.flatMap((candidate) => candidate.signal_ids));
  return {
    practice_ids: ids.filter((id) => /^PRC-/u.test(id)),
    feedback_ids: ids.filter((id) => /^SFI-/u.test(id)),
    agent_reach_ids: unique([...ids.filter((id) => /^ARD-/u.test(id)), ...cluster.raw_candidates.filter((candidate) => candidate.source_class === "AGENT_REACH_SIGNAL").flatMap((candidate) => candidate.origin_ids.filter((id) => /^ARD-/u.test(id)))]),
    field_observation_ids: ids.filter((id) => /^FOC-/u.test(id)),
  };
}

export function regenerateCluster(snapshot: KdfSnapshot, cluster: QuestionCluster): RegeneratedQuestionCandidate {
  const dimensions = combinedDimensions(cluster);
  const question = formulate(cluster, dimensions);
  const rqs = compareExisting(question, cluster, snapshot.formal.research_questions);
  const dqs = compareExisting(question, cluster, snapshot.formal.discovery_questions);
  const exactRq = rqs.find((item) => item.overlap_state === "LIKELY_DUPLICATE");
  const exactDq = dqs.find((item) => item.overlap_state === "LIKELY_DUPLICATE");
  const gaps = unique(cluster.raw_candidates.map((candidate) => candidate.origin_gap_id).filter((value) => value !== QUESTION_UNKNOWN));
  const evidenceIds = unique(cluster.raw_candidates.flatMap((candidate) => candidate.evidence_ids));
  const limitations = unique(cluster.raw_candidates.flatMap((candidate) => candidate.limitations));
  const evidenceCards = snapshot.formal.evidence_cards.filter((card) => evidenceIds.includes(card.id));
  const levelOrder = ["A", "B", "C1", "C2", "C3", "D", "H"];
  const strongest = evidenceCards.map((card) => card.evidence_level).filter(Boolean).sort((left, right) => levelOrder.indexOf(left) - levelOrder.indexOf(right))[0] ?? QUESTION_UNKNOWN;
  const scope = questionScope(question, dimensions);
  const exploratory = gaps.length === 0 || cluster.raw_candidates.every((candidate) => candidate.exploratory);
  let recommendation: QuestionRecommendation = exactRq ? "NO_NEW_RQ_NEEDED" : exactDq ? "USE_EXISTING_DISCOVERY_QUESTION" : scope === "TOO_BROAD" || scope === "UNKNOWN" ? "INSUFFICIENT_FOR_REGENERATION" : exploratory ? "NEEDS_OWNER_REVIEW" : rqs.some((item) => item.overlap_state === "OVERLAPPING" || item.overlap_state === "SAME_CORE_DIFFERENT_SCOPE") ? "REGENERATED_EXTENSION_CANDIDATE" : "REGENERATED_NEW_SCOPE_CANDIDATE";
  if (cluster.raw_candidates.some((candidate) => candidate.raw_candidate_id === "PILOT:D-GOVERNANCE")) recommendation = "NO_NEW_RQ_NEEDED";
  const novelty: QuestionNovelty = recommendation === "NO_NEW_RQ_NEEDED" || recommendation === "USE_EXISTING_DISCOVERY_QUESTION" ? "ALREADY_COVERED" : recommendation === "REGENERATED_EXTENSION_CANDIDATE" ? "EXTENDS_EXISTING" : recommendation === "REGENERATED_NEW_SCOPE_CANDIDATE" ? "POSSIBLY_NEW" : "UNKNOWN";
  const duplicateRisk: QuestionDuplicateRisk = exactRq || exactDq || cluster.overlap_state === "LIKELY_DUPLICATE" ? "HIGH" : cluster.overlap_state === "OVERLAPPING" || cluster.overlap_state === "SAME_CORE_DIFFERENT_SCOPE" ? "MEDIUM" : "LOW";
  const signals = signalContext(cluster);
  const originTypes = unique(cluster.raw_candidates.map((candidate) => candidate.source_class)) as QuestionSourceClass[];
  const originIds = unique(cluster.raw_candidates.flatMap((candidate) => candidate.origin_ids));
  const gapBasis: RegenerationGapBasis = { originating_gaps: gaps, evidence_limitations: limitations, unresolved_dimensions: unique([...cluster.preserved_scope_differences, ...rqs[0]?.new_dimensions ?? []]), why_existing_rq_does_not_close: exactRq ? `${exactRq.id} 已實質涵蓋相同問題，因此不需要新增 RQ。` : rqs[0] ? `${rqs[0].id} 提供最接近的正式範圍，但仍未閉合：${(rqs[0].new_dimensions.length ? rqs[0].new_dimensions : ["交叉情境仍需 Owner 判斷"]).join("、")}。` : "目前沒有足以閉合此候選的正式 RQ。", state: exploratory ? "EXPLORATORY" : "BOUNDED_GAP" };
  return {
    regeneration_id: stableId("QRG", cluster.raw_candidates.map((candidate) => candidate.raw_candidate_id).sort()), raw_candidate_ids: cluster.raw_candidates.map((candidate) => candidate.raw_candidate_id), origin_types: originTypes, origin_ids: originIds,
    regenerated_question: question, alternative_formulations: ["NO_NEW_RQ_NEEDED", "USE_EXISTING_DISCOVERY_QUESTION", "INSUFFICIENT_FOR_REGENERATION"].includes(recommendation) ? [] : alternatives(question, dimensions), structured_dimensions: dimensions, closest_existing_rqs: rqs, closest_discovery_questions: dqs, overlap_state: cluster.overlap_state,
    quality_scope: scope, answerability: scope === "BOUNDED" ? "RESEARCHABLE" : scope === "UNKNOWN" ? "PARTIALLY_RESEARCHABLE" : "INSUFFICIENT_CONTEXT", novelty,
    evidence_readiness: evidenceIds.length ? limitations.length ? "PARTIAL_EVIDENCE" : "EVIDENCE_AVAILABLE" : originTypes.some((type) => ["PRACTICE_SIGNAL", "FEEDBACK_SIGNAL", "AGENT_REACH_SIGNAL"].includes(type)) ? "NEEDS_EXTERNAL_VERIFICATION" : "EVIDENCE_MISSING",
    duplicate_risk: duplicateRisk, owner_priority: recommendation === "NO_NEW_RQ_NEEDED" || recommendation === "USE_EXISTING_DISCOVERY_QUESTION" ? "LOW" : recommendation === "REGENERATED_EXTENSION_CANDIDATE" ? "HIGH" : "MEDIUM", gap_basis: gapBasis,
    evidence_context: { evidence_card_ids: evidenceIds, strongest_evidence_level: strongest, limitations }, signal_context: signals,
    legacy_context: { article_ids: unique(cluster.raw_candidates.flatMap((candidate) => candidate.legacy_ids)), role: "RELATED_CONTENT_ONLY" },
    rationale: exactRq ? "與現有正式 RQ 實質相同；最佳動作是重用，而非建立新問題。" : exactDq ? "現有 Discovery Question 已保留相同研究意圖；避免重複候選。" : "將共享研究意圖收斂成單一主問題，同時保留有資料支持的 population、context、outcome 與 measurement。",
    what_changed: unique([cluster.raw_candidates.length > 1 ? `合併 ${cluster.raw_candidates.length} 筆相近原始候選，未刪除原文。` : "保留單一來源並整理為可比較格式。", "移除冗餘措辭並區分 outcome 與 measurement。", "將未受 Evidence 支持的因果語氣改為相關／差異／伴隨語氣。", ...(cluster.preserved_scope_differences.length ? [`保留不同 scope：${cluster.preserved_scope_differences.join("、")}。`] : [])]),
    uncertainty: unique([...(exploratory ? ["沒有 bounded formal gap；此候選只能視為 EXPLORATORY。"] : []), ...(evidenceIds.length ? [] : ["沒有 Formal Evidence 直接閉合此候選。"]), "Deterministic local wording cannot establish scientific validity or causality."]),
    recommendation, owner_review_required: true, candidate_state: "CANDIDATE",
  };
}

function pilotResult(snapshot: KdfSnapshot, raw: RawQuestionCandidate[], pilot: QuestionPilot["pilot"], ids: string[], title: string, sources: string[]) {
  const selected = raw.filter((candidate) => ids.some((id) => candidate.raw_candidate_id === id || candidate.origin_ids.includes(id)));
  const cluster: QuestionCluster = { cluster_id: `PILOT-${pilot}`, raw_candidates: selected, overlap_state: selected.length > 1 ? "OVERLAPPING" : "UNIQUE", shared_dimensions: [], preserved_scope_differences: unique(selected.flatMap((candidate, index) => selected.slice(index + 1).flatMap((other) => meaningfulDifferences(candidate, other)))), underlying_intent: title };
  return { pilot, title, sources, result: regenerateCluster(snapshot, cluster) } satisfies QuestionPilot;
}

export function buildQuestionRegeneration(snapshot: KdfSnapshot, askSession?: AskAnalysisSession | null): QuestionRegenerationSnapshot {
  const raw = collectRawQuestionCandidates(snapshot, askSession);
  const clusters = clusterRawCandidates(raw);
  const regenerated = clusters.map((cluster) => regenerateCluster(snapshot, cluster));
  const crossA = compareCrossNodes(snapshot, "KDF-001-B-001", "KDF-001-F-001");
  const pilotARaw = rawFromCross(crossA);
  const allForPilots = [...raw, ...pilotARaw];
  const pilots: QuestionPilot[] = [
    pilotResult(snapshot, allForPilots, "A", pilotARaw.map((candidate) => candidate.raw_candidate_id), "Cross-node B ↔ F bridge", ["KDF-001-B-001", "KDF-001-F-001", "BRIDGE_CANDIDATE", "NEW_GAP_CANDIDATE", "NEW_QUESTION_CANDIDATE"]),
    pilotResult(snapshot, allForPilots, "B", ["PILOT:B-PRACTICE"], "Initial discomfort / adaptation", ["Practice", "Feedback", "KDF-001-B-001", "KDF-001-F-001"]),
    pilotResult(snapshot, allForPilots, "C", ["PILOT:C-MEASUREMENT"], "Axial length as outcome proxy", ["KDF-001-F-001", "KDF-001-G"]),
    pilotResult(snapshot, allForPilots, "D", ["PILOT:D-GOVERNANCE"], "AI governance / transparency / oversight", ["KDF-002-A-001", "ARD-20260824-AIGOV001"]),
  ];
  return { engine_version: "kdf-question-regeneration-v0.1", output_policy: "session-only-no-persistence", raw_candidates: raw, clusters, regenerated_candidates: regenerated, pilots, counts: { raw: raw.length, clusters: clusters.length, regenerated: regenerated.length, possible_duplicates: regenerated.filter((item) => item.duplicate_risk === "HIGH").length, no_new_rq_needed: regenerated.filter((item) => item.recommendation === "NO_NEW_RQ_NEEDED").length, owner_review: regenerated.filter((item) => item.owner_review_required && !["NO_NEW_RQ_NEEDED", "USE_EXISTING_DISCOVERY_QUESTION", "INSUFFICIENT_FOR_REGENERATION"].includes(item.recommendation)).length } };
}

export function regenerateSelectedCandidates(snapshot: KdfSnapshot, rawCandidates: RawQuestionCandidate[], selectedIds: string[]): ManualRegenerationResult {
  const ids = unique(selectedIds);
  if (ids.length < 2 || ids.length > 8) return { status: "INVALID_SELECTION", message: "請選擇 2–8 筆候選問題。", result: null };
  const selected = ids.map((id) => rawCandidates.find((candidate) => candidate.raw_candidate_id === id)).filter((candidate): candidate is RawQuestionCandidate => Boolean(candidate));
  if (selected.length !== ids.length) return { status: "INVALID_SELECTION", message: "選取內容包含不存在的候選；未進行模糊替換。", result: null };
  const connected = selected.every((candidate, index) => index === 0 || selected.slice(0, index).some((other) => compareRawQuestionCandidates(candidate, other) !== "DISTINCT"));
  if (!connected) return { status: "UNRELATED_SELECTION", message: "選取的候選缺少 bounded 共通意圖；為避免合併不相關問題，本次未產生候選。", result: null };
  const cluster: QuestionCluster = { cluster_id: stableId("MANUAL", ids), raw_candidates: selected, overlap_state: selected.some((candidate, index) => selected.slice(index + 1).some((other) => compareRawQuestionCandidates(candidate, other) === "LIKELY_DUPLICATE")) ? "LIKELY_DUPLICATE" : "OVERLAPPING", shared_dimensions: [], preserved_scope_differences: unique(selected.flatMap((candidate, index) => selected.slice(index + 1).flatMap((other) => meaningfulDifferences(candidate, other)))), underlying_intent: selected[0].dimensions.topic_scope };
  return { status: "READY", message: "已在目前頁面 session 中產生一筆候選；重新整理後會清除。", result: regenerateCluster(snapshot, cluster) };
}

export function findQuestionLabOverlap(question: string, model: QuestionRegenerationSnapshot) {
  const probe = canonical(question);
  return model.regenerated_candidates.find((candidate) => canonical(candidate.regenerated_question) === probe || similarity(question, candidate.regenerated_question) >= 0.34);
}

export function questionLabCandidateForOrigin(originId: string, model: QuestionRegenerationSnapshot) {
  return model.regenerated_candidates.find((candidate) => candidate.origin_ids.includes(originId));
}
