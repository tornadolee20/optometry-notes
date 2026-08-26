import type { IntakeCandidate, KdfCard, KdfSnapshot } from "./types";
import { matchLegacyContent, type ContentOverlapState, type LegacyContentMatch } from "./legacy-search.ts";

export const ASK_UNKNOWN = "UNKNOWN";

export type AskScopeState = "REUSE" | "EXTEND" | "POSSIBLE_DUPLICATE" | "PARTIAL_MATCH" | "NEW_SCOPE" | "UNKNOWN";
export type AskRelationState = "REUSE" | "EXTEND" | "DUPLICATE" | "CASE_VARIATION" | "BRIDGE_CANDIDATE" | "NEW_GAP_CANDIDATE" | "NEW_QUESTION_CANDIDATE" | "INSUFFICIENT_FOR_RELATION";
export type AskConfidence = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
export type AskEvidenceSufficiency = "SUFFICIENT" | "PARTIAL" | "INSUFFICIENT" | "UNKNOWN";
export type AskSuggestedAction = "REVIEW_EXISTING_EVIDENCE" | "SEARCH_EXTERNAL_EVIDENCE" | "COMPARE_EXISTING_NODES" | "FIELD_OBSERVATION_NEEDED" | "OWNER_REVIEW" | "NO_ACTION_NEEDED";

export interface AskStructuredDimensions {
  topic: string;
  population: string;
  age_group: string;
  intervention_or_exposure: string;
  comparator: string;
  outcome: string;
  measurement: string;
  mechanism: string;
  context: string;
  timeframe: string;
  practice_context: string;
}

export interface AskMatchedNode {
  id: string;
  type: string;
  topic: string;
  status: string;
  root_topic: string;
  parent: string;
  score: number;
  matching_concepts: string[];
  reasons: string[];
}

export interface AskGroundedStatement {
  source_id: string;
  source_type: string;
  statement: string;
  basis: string;
}

export interface AskUnknownStatement {
  statement: string;
  basis: string;
  related_node_ids: string[];
}

export interface AskEvidenceItem {
  id: string;
  topic: string;
  related_rq: string;
  evidence_level: string;
  findings: string;
  limitations: string;
  relevance: string;
}

export interface AskSignalItem {
  id: string;
  kind: string;
  title: string;
  status: string;
  route: string;
  reason: string;
  evidence_label: "NOT_FORMAL_EVIDENCE";
}

export interface AskDiscoveryItem {
  id: string;
  topic: string;
  status: string;
  relation_type: string;
  reason: string;
}

export interface AskScopeAssessment {
  state: AskScopeState;
  reason: string;
  related_node_ids: string[];
}

export interface AskRelationAssessment {
  state: AskRelationState;
  related_node_ids: string[];
  shared_dimensions: string[];
  differing_dimensions: string[];
  reason: string;
  confidence: AskConfidence;
  evidence_sufficiency: AskEvidenceSufficiency;
  owner_review_required: boolean;
}

export interface AskMandalaContext {
  eligible: boolean;
  root_id: string;
  template_id: string;
  dimension_count: number;
  reason: string;
}

export interface AskCandidateQuestion {
  question: string;
  origin: string;
  related_existing_nodes: string[];
  new_dimension: string;
  why_not_answered: string;
  evidence_sufficiency: AskEvidenceSufficiency;
  duplicate_risk: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  suggested_next_action: AskSuggestedAction;
}

export interface AskAnalysisSession {
  analysis_id: string;
  original_question: string;
  normalized_question: string;
  structured_dimensions: AskStructuredDimensions;
  matched_nodes: AskMatchedNode[];
  scope_assessment: AskScopeAssessment;
  relation_assessment: AskRelationAssessment;
  known_context: AskGroundedStatement[];
  unknown_context: AskUnknownStatement[];
  evidence_context: AskEvidenceItem[];
  legacy_context: LegacyContentMatch[];
  content_overlap: ContentOverlapState;
  mature_context: AskGroundedStatement[];
  practice_context: AskSignalItem[];
  feedback_context: AskSignalItem[];
  discovery_context: AskDiscoveryItem[];
  gap_context: AskUnknownStatement[];
  mandala_context: AskMandalaContext;
  candidate_questions: AskCandidateQuestion[];
  limitations: string[];
  strongest_node_id: string;
  created_at: string;
}

interface ConceptDefinition {
  key: string;
  label: string;
  aliases: string[];
}

const CONCEPTS: ConceptDefinition[] = [
  { key: "peripheral-defocus", label: "周邊離焦", aliases: ["周邊離焦", "離焦鏡片", "近視控制鏡片", "近視控制框架鏡片", "dims", "halt"] },
  { key: "visual-quality", label: "視覺品質", aliases: ["視覺品質", "中央視力", "低對比", "離軸視覺", "側邊", "周邊視覺", "1.0"] },
  { key: "adaptation", label: "配戴適應", aliases: ["適應", "不自然", "怪怪", "初戴", "一開始", "配戴感受"] },
  { key: "daily-life", label: "真實生活功能", aliases: ["真實生活", "日常", "樓梯", "運動", "戶外", "活動量", "球類", "夜間"] },
  { key: "axial-length", label: "眼軸", aliases: ["眼軸", "眼軸長度", "眼軸變化", "眼軸增長"] },
  { key: "effectiveness", label: "控制成效", aliases: ["控制效果", "控制成效", "成效", "效果", "適合"] },
  { key: "children", label: "兒童", aliases: ["孩子", "兒童", "學童", "小孩"] },
  { key: "individual-difference", label: "個體差異", aliases: ["個體差異", "反應者", "基線", "rpr", "相對周邊屈光"] },
  { key: "long-term", label: "長期", aliases: ["長期", "五年", "5年", "追蹤期間"] },
  { key: "ai", label: "人工智慧", aliases: ["ai", "人工智慧", "機器學習", "生成式ai", "生成式 ai"] },
  { key: "optometry", label: "視光專業", aliases: ["視光", "驗光", "驗光師", "視光機構"] },
  { key: "governance", label: "治理與責任", aliases: ["治理", "責任", "監督", "驗證", "資料保護", "患者告知", "專業義務"] },
  { key: "black-box", label: "黑箱風險", aliases: ["黑箱", "不可解釋", "不透明"] },
  { key: "measurement", label: "量測", aliases: ["量測", "測量", "指標", "視力表", "眼軸變化"] },
];

const STOP_BIGRAMS = new Set(["是否", "真的", "有些", "為什", "什麼", "怎麼", "代表", "可以", "應該", "問題", "孩子", "目前", "一些"]);
const TYPE_PRIORITY: Record<string, number> = { "research-question": 0, "root-topic": 1, "mother-topic": 2, "evidence-card": 3, "mature-knowledge": 4, "discovery-question": 5, "practice-card": 6, "field-observation": 7, "uncle-lens": 8, "content-draft": 9 };
const CONCEPT_WEIGHT: Record<string, number> = { children: 3, "daily-life": 12, adaptation: 12, "axial-length": 15, governance: 13, "black-box": 13, measurement: 10 };

export function normalizeAskQuestion(value: string) {
  return value.normalize("NFKC").replace(/[，。！？；：、,.!?;:()（）「」『』【】]/gu, " ").replace(/\s+/gu, " ").trim();
}

function includesAlias(text: string, alias: string) {
  const normalizedText = text.toLocaleLowerCase("zh-TW");
  const normalizedAlias = alias.toLocaleLowerCase("zh-TW");
  if (/^[a-z0-9]+$/u.test(normalizedAlias)) {
    const escaped = normalizedAlias.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "u").test(normalizedText);
  }
  return normalizedText.includes(normalizedAlias);
}

function detectedConcepts(text: string) {
  return CONCEPTS.filter((concept) => concept.aliases.some((alias) => includesAlias(text, alias)));
}

function hanBigrams(value: string) {
  const output = new Set<string>();
  for (const sequence of value.match(/[\p{Script=Han}]{2,}/gu) ?? []) {
    for (let index = 0; index < sequence.length - 1; index += 1) {
      const token = sequence.slice(index, index + 2);
      if (!STOP_BIGRAMS.has(token)) output.add(token);
    }
  }
  return output;
}

function knownOr(value: string | undefined) {
  return value || ASK_UNKNOWN;
}

export function structureAskQuestion(question: string): AskStructuredDimensions {
  const normalized = normalizeAskQuestion(question);
  const concepts = new Set(detectedConcepts(normalized).map((item) => item.key));
  const defocus = concepts.has("peripheral-defocus");
  const ai = concepts.has("ai");
  const axial = concepts.has("axial-length");
  const adaptation = concepts.has("adaptation");
  const daily = concepts.has("daily-life");
  const topic = defocus ? "周邊離焦鏡片" : ai ? "AI 視光實務治理" : axial ? "近視控制成效" : detectedConcepts(normalized)[0]?.label;
  const outcome = adaptation ? "視覺適應與主觀感受" : axial ? "近視控制成效" : concepts.has("effectiveness") ? "功能適合性與控制效果" : ai && concepts.has("governance") ? "可驗證、可監督的專業建議" : undefined;
  const context = /戶外|活動量|運動|球類/u.test(normalized) ? "高戶外／動態活動" : /一開始|初戴|初期/u.test(normalized) ? "初期配戴" : ai && concepts.has("optometry") ? "視光專業實務" : daily ? "真實生活情境" : undefined;
  const timeframe = /一開始|初戴|初期/u.test(normalized) ? "初期" : concepts.has("long-term") ? "長期追蹤" : undefined;
  return {
    topic: knownOr(topic),
    population: concepts.has("children") ? "children" : ASK_UNKNOWN,
    age_group: concepts.has("children") ? "child / school-age not further specified" : ASK_UNKNOWN,
    intervention_or_exposure: knownOr(defocus ? "周邊離焦／近視控制鏡片" : ai ? "AI-supported optometry workflow" : undefined),
    comparator: /比較|相比|相較|versus|\bvs\b/iu.test(normalized) ? "comparison mentioned but not fully specified" : ASK_UNKNOWN,
    outcome: knownOr(outcome),
    measurement: knownOr(axial ? "眼軸變化" : /視力\s*1\.0|1\.0/u.test(normalized) ? "中央視力" : concepts.has("measurement") ? "measurement mentioned but not fully specified" : undefined),
    mechanism: knownOr(defocus ? "周邊離焦光學與離軸視覺" : ai && concepts.has("black-box") ? "AI 黑箱與治理控制" : undefined),
    context: knownOr(context),
    timeframe: knownOr(timeframe),
    practice_context: knownOr(ai && concepts.has("optometry") ? "驗光專業責任" : daily ? "日常活動與配戴情境" : undefined),
  };
}

function cardMatchText(card: KdfCard) {
  return [card.id, card.topic, card.type, card.root_topic, card.parent, card.research_question, ...card.related, ...card.origin_cards, ...card.missing_evidence, ...card.open_questions].join(" ");
}

function matchedNodes(snapshot: KdfSnapshot, question: string) {
  const normalized = normalizeAskQuestion(question);
  const questionConcepts = detectedConcepts(normalized);
  const questionIds = new Set(normalized.match(/(?:EVC-|MKC-|PRC-|FOC-|ULC-|DQ-)?KDF-[0-9]{3}(?:-[A-Z](?:-[0-9]{3})?)?/giu)?.map((id) => id.toUpperCase()) ?? []);
  const qBigrams = hanBigrams(normalized);
  const direct: AskMatchedNode[] = [];
  for (const card of snapshot.formal.cards) {
    const text = cardMatchText(card);
    const cardConcepts = detectedConcepts(text);
    const cardConceptKeys = new Set(cardConcepts.map((item) => item.key));
    const shared = questionConcepts.filter((item) => cardConceptKeys.has(item.key));
    const topicBigrams = hanBigrams(card.topic);
    const sharedBigrams = [...qBigrams].filter((token) => topicBigrams.has(token));
    const reasons: string[] = [];
    let score = 0;
    if (questionIds.has(card.id)) { score += 100; reasons.push("問題明確提到此 KDF ID"); }
    if (normalized.length >= 4 && normalizeAskQuestion(card.topic).includes(normalized)) { score += 30; reasons.push("問題文字直接出現在節點題目"); }
    if (shared.length) { score += shared.reduce((total, item) => total + (CONCEPT_WEIGHT[item.key] ?? 9), 0); reasons.push(`共享概念：${shared.map((item) => item.label).join("、")}`); }
    if (sharedBigrams.length >= 2) { score += Math.min(8, sharedBigrams.length); reasons.push(`題目詞彙重疊：${sharedBigrams.slice(0, 4).join("、")}`); }
    if (score >= 8) direct.push({ id: card.id, type: card.type, topic: card.topic, status: card.status, root_topic: card.root_topic, parent: card.parent, score, matching_concepts: shared.map((item) => item.label), reasons });
  }
  direct.sort((left, right) => right.score - left.score || (TYPE_PRIORITY[left.type] ?? 99) - (TYPE_PRIORITY[right.type] ?? 99) || left.id.localeCompare(right.id));
  return direct.slice(0, 12);
}

function sectionExcerpt(card: KdfCard, preferred: RegExp, fallback = "") {
  const section = card.detail_sections.find((item) => preferred.test(item.heading)) ?? card.detail_sections.find((item) => item.content.trim());
  const value = section?.content.replace(/[#>*|`\[\]]/gu, " ").replace(/\s+/gu, " ").trim() || fallback;
  return value.length > 280 ? `${value.slice(0, 277)}…` : value;
}

function relatedRoots(matches: AskMatchedNode[]) {
  return new Set(matches.map((item) => item.root_topic || (item.type === "root-topic" ? item.id : "")).filter(Boolean));
}

function evidenceItems(snapshot: KdfSnapshot, matches: AskMatchedNode[]) {
  const ids = new Set(matches.map((item) => item.id));
  return snapshot.formal.evidence_cards.filter((card) => ids.has(card.id) || ids.has(card.parent)).map((card) => ({
    id: card.id,
    topic: card.topic,
    related_rq: card.parent,
    evidence_level: card.evidence_level || ASK_UNKNOWN,
    findings: sectionExcerpt(card, /what we know|what can be concluded|finding|synthesis/iu, "Formal Evidence card exists; open the card for its exact contents."),
    limitations: sectionExcerpt(card, /limitation|what we do not know|cannot be concluded|uncertain/iu, "No separately titled limitation section was projected."),
    relevance: ids.has(card.id) ? "Direct concept match" : "Evidence belongs to a matched Research Question",
  }));
}

function signalRoute(card: KdfCard) {
  return card.type === "research-question" ? `/research/${encodeURIComponent(card.id)}` : card.type === "evidence-card" ? `/evidence/${encodeURIComponent(card.id)}` : `/node/${encodeURIComponent(card.id)}`;
}

function practiceSignals(snapshot: KdfSnapshot, matches: AskMatchedNode[]) {
  const ids = new Set(matches.map((item) => item.id));
  return snapshot.formal.cards.filter((card) => ["practice-card", "field-observation", "uncle-lens"].includes(card.type) && (ids.has(card.id) || ids.has(card.parent))).map((card): AskSignalItem => ({
    id: card.id, kind: card.type, title: card.topic, status: card.status, route: signalRoute(card), reason: ids.has(card.id) ? "Direct deterministic match" : `Linked to matched parent ${card.parent}`, evidence_label: "NOT_FORMAL_EVIDENCE",
  }));
}

function intakeRoute(candidate: IntakeCandidate) {
  return `/feedback/${encodeURIComponent(candidate.id)}`;
}

function feedbackSignals(snapshot: KdfSnapshot, matches: AskMatchedNode[]) {
  const ids = new Set(matches.flatMap((item) => [item.id, item.parent, item.root_topic]).filter(Boolean));
  return [...snapshot.intake.agent_reach.candidates, ...snapshot.intake.social_feedback.candidates]
    .filter((candidate) => candidate.related_kdf_ids.some((id) => ids.has(id)))
    .map((candidate): AskSignalItem => ({ id: candidate.id, kind: candidate.item_kind, title: candidate.feedback_type, status: `${candidate.owner_review_status} / ${candidate.intake_state}`, route: intakeRoute(candidate), reason: `Existing intake relation intersects ${candidate.related_kdf_ids.filter((id) => ids.has(id)).join("、")}`, evidence_label: "NOT_FORMAL_EVIDENCE" }));
}

function discoveryItems(snapshot: KdfSnapshot, matches: AskMatchedNode[]) {
  const ids = new Set(matches.map((item) => item.id));
  return snapshot.formal.discovery_questions.filter((card) => ids.has(card.id) || card.origin_cards.some((id) => ids.has(id))).map((card): AskDiscoveryItem => ({
    id: card.id, topic: card.topic, status: card.status, relation_type: card.relation_type || ASK_UNKNOWN, reason: ids.has(card.id) ? "Direct deterministic match" : `Candidate / Discovery under ${card.root_topic}`,
  }));
}

function scopeAssessment(matches: AskMatchedNode[], dimensions: AskStructuredDimensions): AskScopeAssessment {
  if (!matches.length) return { state: "NEW_SCOPE", reason: "No formal KDF node crossed the conservative deterministic match threshold.", related_node_ids: [] };
  const rqs = matches.filter((item) => item.type === "research-question");
  if (!rqs.length) return { state: "PARTIAL_MATCH", reason: "Relevant formal context exists, but no Research Question directly covers the submitted wording.", related_node_ids: matches.slice(0, 5).map((item) => item.id) };
  const best = rqs[0];
  const differing = [dimensions.context, dimensions.measurement, dimensions.timeframe].filter((value) => value !== ASK_UNKNOWN && !includesAlias(best.topic, value));
  if (best.score >= 100 || normalizeAskQuestion(best.topic) === normalizeAskQuestion(dimensions.topic)) return { state: "POSSIBLE_DUPLICATE", reason: `${best.id} is extremely close to the submitted wording; Owner review is needed before treating it as the same question.`, related_node_ids: [best.id] };
  if (differing.length) return { state: "EXTEND", reason: `${best.id} covers the core topic, while the submitted question adds context, measurement, or timeframe dimensions.`, related_node_ids: [best.id] };
  if (best.matching_concepts.length >= 2) return { state: "REUSE", reason: `${best.id} materially covers the same structured concepts without a clear additional dimension.`, related_node_ids: [best.id] };
  return { state: "PARTIAL_MATCH", reason: `${best.id} is relevant, but the deterministic analysis cannot establish material coverage.`, related_node_ids: [best.id] };
}

function differingDimensions(dimensions: AskStructuredDimensions, best?: AskMatchedNode) {
  if (!best) return Object.entries(dimensions).filter(([, value]) => value !== ASK_UNKNOWN).map(([key]) => key);
  return Object.entries(dimensions).filter(([, value]) => value !== ASK_UNKNOWN && !includesAlias(best.topic, value)).map(([key]) => key);
}

function relationAssessment(scope: AskScopeAssessment, matches: AskMatchedNode[], dimensions: AskStructuredDimensions, evidenceCount: number): AskRelationAssessment {
  const map: Record<AskScopeState, AskRelationState> = { REUSE: "REUSE", EXTEND: "EXTEND", POSSIBLE_DUPLICATE: "DUPLICATE", PARTIAL_MATCH: "NEW_GAP_CANDIDATE", NEW_SCOPE: "NEW_QUESTION_CANDIDATE", UNKNOWN: "INSUFFICIENT_FOR_RELATION" };
  const best = matches[0];
  const shared = best?.matching_concepts ?? [];
  const differing = differingDimensions(dimensions, best);
  const confidence: AskConfidence = !matches.length ? "LOW" : best.score >= 30 ? "HIGH" : best.score >= 16 ? "MEDIUM" : "LOW";
  const evidence: AskEvidenceSufficiency = evidenceCount === 0 ? "INSUFFICIENT" : matches.some((item) => item.type === "evidence-card") ? "SUFFICIENT" : "PARTIAL";
  return { state: map[scope.state], related_node_ids: scope.related_node_ids, shared_dimensions: shared, differing_dimensions: differing, reason: `${scope.reason} This is a UI-only candidate assessment and does not create a KDF relation.`, confidence, evidence_sufficiency: evidence, owner_review_required: true };
}

function groundedContexts(snapshot: KdfSnapshot, matches: AskMatchedNode[], evidence: AskEvidenceItem[]) {
  const ids = new Set(matches.map((item) => item.id));
  const mature = snapshot.formal.mature_knowledge.filter((card) => ids.has(card.id) || ids.has(card.parent)).map((card): AskGroundedStatement => ({ source_id: card.id, source_type: card.type, statement: sectionExcerpt(card, /synthesis|what we know|overview|conclusion/iu, card.topic), basis: "Existing formal Mature Knowledge card" }));
  const known: AskGroundedStatement[] = matches.filter((item) => item.type === "research-question").slice(0, 3).map((item) => ({ source_id: item.id, source_type: item.type, statement: item.topic, basis: "Existing formal Research Question context" }));
  for (const item of evidence.slice(0, 3)) known.push({ source_id: item.id, source_type: "evidence-card", statement: item.findings, basis: `Formal Evidence ${item.evidence_level}` });
  known.push(...mature.slice(0, 3));
  return { known: known.slice(0, 7), mature };
}

function unknownContexts(snapshot: KdfSnapshot, matches: AskMatchedNode[], evidence: AskEvidenceItem[], dimensions: AskStructuredDimensions) {
  const ids = new Set(matches.map((item) => item.id));
  const output: AskUnknownStatement[] = [];
  for (const card of snapshot.formal.cards.filter((item) => ids.has(item.id) || ids.has(item.parent))) {
    if (card.gap_status === "open") output.push({ statement: `${card.topic} remains marked with an open gap.`, basis: `${card.id} has gap_status: open`, related_node_ids: [card.id] });
    for (const value of card.missing_evidence) output.push({ statement: value, basis: `${card.id} explicitly records missing_evidence`, related_node_ids: [card.id] });
    for (const value of card.open_questions) output.push({ statement: value, basis: `${card.id} explicitly records an open question`, related_node_ids: [card.id] });
  }
  for (const item of evidence.filter((value) => !value.limitations.startsWith("No separately"))) output.push({ statement: item.limitations, basis: `${item.id} limitation section`, related_node_ids: [item.id] });
  if (dimensions.context !== ASK_UNKNOWN && matches.length) output.push({ statement: `The submitted context (${dimensions.context}) requires direct applicability review.`, basis: "Question adds an explicit context dimension; this is not automatically equivalent to formal Evidence coverage.", related_node_ids: matches.slice(0, 3).map((item) => item.id) });
  const unique = new Map(output.map((item) => [`${item.statement}\u0000${item.basis}`, item]));
  return [...unique.values()].slice(0, 9);
}

function candidateQuestions(dimensions: AskStructuredDimensions, relation: AskRelationAssessment, matches: AskMatchedNode[]) {
  const topic = dimensions.topic === ASK_UNKNOWN ? "這個主題" : dimensions.topic;
  const candidates: Array<[string, string, string, AskSuggestedAction]> = [];
  if (dimensions.context !== ASK_UNKNOWN) candidates.push([`在${dimensions.context}下，${topic}的結果是否與一般情境不同？`, "structured dimension: context", "context", "SEARCH_EXTERNAL_EVIDENCE"]);
  if (dimensions.measurement === ASK_UNKNOWN) candidates.push([`應使用哪些客觀與主觀量測來評估${topic}？`, "structured dimension: measurement UNKNOWN", "measurement", "REVIEW_EXISTING_EVIDENCE"]);
  if (dimensions.population !== ASK_UNKNOWN) candidates.push([`哪些兒童個體差異可能改變${topic}的結果或適應？`, "structured dimension: population", "individual differences", "SEARCH_EXTERNAL_EVIDENCE"]);
  if (dimensions.timeframe === ASK_UNKNOWN) candidates.push([`${topic}的短期表現與長期結果是否一致？`, "structured dimension: timeframe UNKNOWN", "duration", "SEARCH_EXTERNAL_EVIDENCE"]);
  if (relation.state === "EXTEND" || relation.state === "NEW_GAP_CANDIDATE") candidates.push([`現有節點與「${topic}」新增維度之間，哪些關係需要 Owner 比較確認？`, "relation assessment", "relation boundary", "COMPARE_EXISTING_NODES"]);
  if (!candidates.length) candidates.push([`現有正式 Evidence 是否已足以直接回答「${topic}」？`, "evidence sufficiency check", "evidence sufficiency", "REVIEW_EXISTING_EVIDENCE"]);
  const risk = relation.state === "DUPLICATE" ? "HIGH" : matches.some((item) => item.type === "research-question") ? "MEDIUM" : "LOW";
  return candidates.slice(0, 5).map(([question, origin, dimension, action]): AskCandidateQuestion => ({ question, origin, related_existing_nodes: matches.slice(0, 4).map((item) => item.id), new_dimension: dimension, why_not_answered: relation.evidence_sufficiency === "SUFFICIENT" ? "Formal context exists, but this reformulation still requires applicability review." : "Current formal Evidence does not fully close this dimension.", evidence_sufficiency: relation.evidence_sufficiency, duplicate_risk: risk, suggested_next_action: action }));
}

export function analyzeWithKdf(snapshot: KdfSnapshot, question: string, createdAt = new Date().toISOString()): AskAnalysisSession {
  const original = question.trim();
  const normalized = normalizeAskQuestion(original);
  const dimensions = structureAskQuestion(original);
  const matches = matchedNodes(snapshot, original);
  const evidence = evidenceItems(snapshot, matches);
  const legacy = matchLegacyContent(snapshot.content.legacy_blog.articles, original,
    matches.flatMap((item) => [item.id, item.parent, item.root_topic]).filter(Boolean));
  const scope = normalized.length < 2 ? { state: "UNKNOWN" as const, reason: "The submitted text is too short for deterministic analysis.", related_node_ids: [] } : scopeAssessment(matches, dimensions);
  const relation = relationAssessment(scope, matches, dimensions, evidence.length);
  const contexts = groundedContexts(snapshot, matches, evidence);
  const unknown = unknownContexts(snapshot, matches, evidence, dimensions);
  const roots = [...relatedRoots(matches)];
  const mandalaRoot = roots.includes("KDF-001") ? "KDF-001" : "";
  return {
    analysis_id: `ASK-${createdAt.replace(/[^0-9]/gu, "").slice(0, 17)}-${Math.abs([...normalized].reduce((total, value) => ((total * 31) + value.codePointAt(0)!) | 0, 7)).toString(16).toUpperCase()}`,
    original_question: original,
    normalized_question: normalized,
    structured_dimensions: dimensions,
    matched_nodes: matches,
    scope_assessment: scope,
    relation_assessment: relation,
    known_context: contexts.known,
    unknown_context: unknown,
    evidence_context: evidence,
    legacy_context: legacy.matches,
    content_overlap: legacy.overlap,
    mature_context: contexts.mature,
    practice_context: practiceSignals(snapshot, matches),
    feedback_context: feedbackSignals(snapshot, matches),
    discovery_context: discoveryItems(snapshot, matches),
    gap_context: unknown.filter((item) => /gap|missing_evidence|open question|limitation/iu.test(item.basis)),
    mandala_context: mandalaRoot ? { eligible: true, root_id: mandalaRoot, template_id: "myopia-peripheral-defocus-v0.1", dimension_count: 8, reason: "The strongest formal context belongs to KDF-001, which has an explicit existing Mandala template." } : { eligible: false, root_id: roots[0] ?? "", template_id: "", dimension_count: 0, reason: roots.length ? `No existing Mandala template is registered for ${roots[0]}.` : "No formal KDF node matched; no session graph or Mandala node is fabricated." },
    candidate_questions: candidateQuestions(dimensions, relation, matches),
    limitations: ["Deterministic local analysis only; no external LLM or web search was used.", "The result is session-only and does not create a Research Question, Evidence Card, relation, or audit event.", "Formal Evidence is counted only from evidence-card artifacts; Practice, Observation, Feedback, Discovery and Legacy Content remain separate.", "Keyword absence is not treated as proof that a formal research gap exists.", "Legacy matches are historical content memory only; they do not establish Evidence provenance, knowledge, sufficiency, or a formal relation."],
    strongest_node_id: matches.find((item) => item.type === "research-question")?.id ?? matches[0]?.id ?? "",
    created_at: createdAt,
  };
}
