import { normalizeAskQuestion, structureAskQuestion, type AskStructuredDimensions } from "./ask-engine.ts";
import { findMandalaTemplate } from "./mandala-templates.ts";
import { entityIndex, explicitEdges, relationshipsFor, type GraphEntity } from "./relationships.ts";
import type { KdfSnapshot } from "./types.ts";

export const DISCOVERY_UNKNOWN = "UNKNOWN";

export type CandidateRelationType = "REUSE" | "EXTEND" | "DUPLICATE" | "APPARENT_CONFLICT" | "CASE_VARIATION" | "BRIDGE_CANDIDATE" | "NEW_GAP_CANDIDATE" | "NEW_QUESTION_CANDIDATE" | "INSUFFICIENT_FOR_RELATION";
export type DiscoveryConfidence = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
export type DiscoveryEvidenceSufficiency = "SUFFICIENT_FOR_CANDIDATE_RELATION" | "SUFFICIENT_FOR_RESEARCH_GAP" | "INSUFFICIENT_FOR_RELATION" | "INSUFFICIENT_FOR_NEW_QUESTION" | "NEEDS_EXTERNAL_VERIFICATION" | "NEEDS_OWNER_REVIEW";
export type DiscoveryNextAction = "REVIEW_EXISTING_EVIDENCE" | "COMPARE_EXISTING_NODES" | "SEARCH_EXTERNAL_EVIDENCE" | "CHECK_EXISTING_DISCOVERY" | "FIELD_OBSERVATION_NEEDED" | "OWNER_REVIEW" | "NO_ACTION_NEEDED";

export interface ComparisonDimensions extends AskStructuredDimensions {
  topic_scope: string;
  claim_strength: string;
  evidence_role: string;
  research_gap: string;
  source_type: string;
  node_status: string;
  hierarchy: string;
  root_topic: string;
  parent: string;
  related_nodes: string;
  study_design: string;
  adherence: string;
  implementation: string;
  evidence_level: string;
}

export interface DiscoveryNode {
  id: string;
  type: string;
  title: string;
  route: string;
  kind: "formal" | "intake";
  dimensions: ComparisonDimensions;
}

export interface GapCandidate {
  candidate_state: "CANDIDATE";
  statement: string;
  origin_node_ids: string[];
  existing_knowledge: string;
  unresolved: string;
  not_keyword_absence_reason: string;
  creating_dimension: string;
  existing_related_gaps: string[];
  evidence_limitations: string[];
  recommended_next_action: DiscoveryNextAction;
}

export interface QuestionCandidate {
  candidate_state: "CANDIDATE";
  question: string;
  origin_nodes: string[];
  originating_relation_candidate: CandidateRelationType;
  shared_dimensions: string[];
  new_dimension: string;
  why_existing_rq_not_enough: string;
  duplicate_risk: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  evidence_sufficiency: DiscoveryEvidenceSufficiency;
  suggested_next_action: DiscoveryNextAction;
  owner_review: "REQUIRED";
}

export interface CrossNodeDiscovery {
  discovery_id: string;
  valid: boolean;
  unknown_node_ids: string[];
  source_nodes: DiscoveryNode[];
  compared_dimensions: Record<string, ComparisonDimensions>;
  candidate_relation: CandidateRelationType;
  confidence: DiscoveryConfidence;
  evidence_sufficiency: DiscoveryEvidenceSufficiency;
  shared_dimensions: string[];
  differing_dimensions: string[];
  matching_context: string[];
  conflicting_context: string[];
  hierarchy_context: string[];
  evidence_context: string[];
  gap_context: string[];
  signal_context: string[];
  rationale: string;
  uncertainty: string[];
  related_evidence: string[];
  related_feedback: string[];
  related_practice: string[];
  related_discovery: string[];
  related_legacy_content: string[];
  gap_candidate: GapCandidate | null;
  question_candidate: QuestionCandidate | null;
  duplicate_risk: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  bridge_hypothesis: string;
  suggested_next_action: DiscoveryNextAction;
  owner_review_needed: true;
  candidate_state: "CANDIDATE_ONLY";
  why_compared: string[];
}

export interface DiscoveryGraphOverlay {
  discovery_id: string;
  source_id: string;
  target_id: string;
  relation: CandidateRelationType;
  label: "CANDIDATE";
}

const DIMENSION_KEYS: Array<keyof ComparisonDimensions> = [
  "topic_scope", "population", "age_group", "intervention_or_exposure", "comparator", "outcome", "measurement", "mechanism", "context", "timeframe", "practice_context", "claim_strength", "evidence_role", "research_gap", "source_type", "node_status", "hierarchy", "root_topic", "parent", "related_nodes", "study_design", "adherence", "implementation", "evidence_level",
];

function unique(values: string[]) { return [...new Set(values.filter(Boolean))].sort(); }
function known(value: string | undefined) { return value?.trim() || DISCOVERY_UNKNOWN; }
function entityText(entity: GraphEntity) {
  if (!entity.card) return entity.candidate?.normalized_summary ?? entity.title;
  const preferred = entity.card.detail_sections.filter((section) => {
    if (entity.type === "research-question") return /research question|pico/iu.test(section.heading);
    if (["evidence-card", "mature-knowledge"].includes(entity.type)) return /research question|what can be concluded|finding|synthesis/iu.test(section.heading);
    return true;
  });
  return [entity.card.topic, ...entity.card.missing_evidence, ...entity.card.open_questions, ...preferred.map((section) => section.content)].join(" ");
}

function measurementFrom(text: string, fallback: string) {
  if (/relative peripheral refraction|\brpr\b|相對周邊屈光/iu.test(text)) return "relative peripheral refraction (RPR)";
  if (/眼軸|axial[- ]?length/iu.test(text)) return "眼軸變化";
  if (/離軸|中央視力|低對比|低照度|視覺搜尋|visual acuity|contrast sensitivity/iu.test(text)) return "中央／離軸視覺與功能量測";
  return fallback;
}

function mechanismFrom(text: string, fallback: string) {
  if (/relative peripheral refraction|\brpr\b|相對周邊屈光/iu.test(text)) return "baseline RPR／effect modification";
  if (/黑箱|透明|監督|oversight|transparency/iu.test(text)) return "AI 透明度、監督與責任控制";
  return fallback;
}

function outcomeFrom(text: string, fallback: string) {
  if (/適應|不自然|怪怪|舒適|視覺品質|日常功能|functional use/iu.test(text)) return "視覺品質、適應與功能使用";
  if (/眼軸|axial[- ]?length|控制成效|治療反應/iu.test(text)) return "眼軸增長／近視控制反應";
  if (/治理|責任|透明|監督|資料保護|患者告知/iu.test(text)) return "治理、透明度與專業監督";
  return fallback;
}

function evidenceRole(entity: GraphEntity) {
  if (entity.type === "evidence-card") return "FORMAL_EVIDENCE";
  if (["practice-card", "field-observation", "uncle-lens", "SOCIAL_FEEDBACK", "AGENT_REACH_DISCOVERY"].includes(entity.type)) return "NON_EVIDENCE_SIGNAL";
  if (entity.type === "mature-knowledge") return "FORMAL_KNOWLEDGE";
  if (entity.type === "research-question") return "FORMAL_RESEARCH_QUESTION";
  if (entity.type === "discovery-question") return "FORMAL_DISCOVERY_CANDIDATE";
  return "FORMAL_CONTEXT";
}

export function dimensionsForEntity(entity: GraphEntity): ComparisonDimensions {
  const text = entityText(entity);
  const ask = structureAskQuestion(text);
  const card = entity.card;
  const candidate = entity.candidate;
  const root = card?.root_topic || (card?.type === "root-topic" ? card.id : candidate?.related_kdf_ids.find((id) => /^KDF-\d{3}$/u.test(id))) || DISCOVERY_UNKNOWN;
  const parent = card?.parent || DISCOVERY_UNKNOWN;
  const related = card ? unique([...card.related, ...card.origin_cards, ...card.wikilinks]) : unique(candidate?.related_kdf_ids ?? []);
  return {
    ...ask,
    topic_scope: ask.topic,
    outcome: outcomeFrom(text, ask.outcome),
    measurement: measurementFrom(text, ask.measurement),
    mechanism: mechanismFrom(text, ask.mechanism),
    claim_strength: known(card?.evidence_level || (card?.type === "mature-knowledge" ? "MATURE_KNOWLEDGE" : candidate ? candidate.source_metadata.verification_status : undefined)),
    evidence_role: evidenceRole(entity),
    research_gap: known(card?.missing_evidence.join("；") || (card?.gap_status === "open" ? "OPEN" : undefined)),
    source_type: entity.type,
    node_status: known(card?.status || (candidate ? `${candidate.owner_review_status} / ${candidate.intake_state}` : undefined)),
    hierarchy: known(root !== DISCOVERY_UNKNOWN ? `${root}${parent !== DISCOVERY_UNKNOWN ? ` > ${parent}` : ""}` : undefined),
    root_topic: root,
    parent,
    related_nodes: related.length ? related.join("、") : DISCOVERY_UNKNOWN,
    study_design: known(card?.study_designs.join("；")),
    adherence: /adherence|依從|配戴時間|持續配戴/iu.test(text) ? "EXPLICIT_ADHERENCE_CONTEXT" : DISCOVERY_UNKNOWN,
    implementation: /implementation|執行|落地|透明|監督|oversight|工作流程/iu.test(text) ? "EXPLICIT_IMPLEMENTATION_CONTEXT" : DISCOVERY_UNKNOWN,
    evidence_level: known(card?.evidence_level),
  };
}

function discoveryNode(entity: GraphEntity): DiscoveryNode {
  return { id: entity.id, type: entity.type, title: entity.title, route: entity.route, kind: entity.kind, dimensions: dimensionsForEntity(entity) };
}

function compareDimensions(left: ComparisonDimensions, right: ComparisonDimensions) {
  const shared: Array<keyof ComparisonDimensions> = [];
  const differing: Array<keyof ComparisonDimensions> = [];
  for (const key of DIMENSION_KEYS) {
    const a = left[key]; const b = right[key];
    if (a === DISCOVERY_UNKNOWN || b === DISCOVERY_UNKNOWN) continue;
    if (normalizeAskQuestion(a) === normalizeAskQuestion(b)) shared.push(key);
    else differing.push(key);
  }
  return { shared, differing };
}

function canonicalTokens(value: string) {
  const normalized = normalizeAskQuestion(value).toLocaleLowerCase("zh-TW");
  const tokens = new Set(normalized.match(/[a-z0-9]+|[\p{Script=Han}]{2,}/gu) ?? []);
  return tokens;
}

function textOverlap(left: string, right: string) {
  const a = canonicalTokens(left); const b = canonicalTokens(right);
  const shared = [...a].filter((token) => b.has(token));
  return { shared, high: shared.length >= 3 || (a.size > 0 && b.size > 0 && shared.length === Math.min(a.size, b.size)) };
}

function linked(left: GraphEntity, right: GraphEntity, snapshot: KdfSnapshot) {
  return explicitEdges(snapshot).some((edge) => (edge.source === left.id && edge.target === right.id) || (edge.source === right.id && edge.target === left.id));
}

function claimPolarity(entity: GraphEntity) {
  if (!entity.card || !["evidence-card", "mature-knowledge"].includes(entity.type)) return "UNKNOWN";
  const text = entity.card.detail_sections.filter((section) => /what can be concluded|finding|conclusion|synthesis/iu.test(section.heading)).map((section) => section.content).join(" ");
  if (!text) return "UNKNOWN";
  const negative = /無差異|不支持|不能證明|未顯示|no difference|not support/iu.test(text);
  const positive = /支持|改善|增加|降低|差異|support|improv|increase|decrease|difference/iu.test(text);
  return negative && !positive ? "NEGATIVE" : positive && !negative ? "POSITIVE" : "CONDITIONAL";
}

function contexts(snapshot: KdfSnapshot, ids: string[]) {
  const all = new Set(ids);
  for (const id of ids) for (const item of relationshipsFor(id, snapshot)) all.add(item.id);
  const index = entityIndex(snapshot);
  const entities = [...all].map((id) => index.get(id)).filter((item): item is GraphEntity => Boolean(item));
  const evidence = entities.filter((item) => item.type === "evidence-card").map((item) => item.id);
  const feedback = entities.filter((item) => item.type === "SOCIAL_FEEDBACK").map((item) => item.id);
  const practice = entities.filter((item) => ["practice-card", "field-observation", "uncle-lens"].includes(item.type)).map((item) => item.id);
  const discovery = entities.filter((item) => item.type === "discovery-question").map((item) => item.id);
  const gaps = entities.filter((item) => item.card?.gap_status === "open").map((item) => item.id);
  const limitations = entities.filter((item) => item.type === "evidence-card").flatMap((item) => item.card?.detail_sections.filter((section) => /limitation|what we do not know|cannot be concluded/iu.test(section.heading)).map((section) => section.content) ?? []);
  const legacy = snapshot.content.legacy_blog.articles.filter((article) => article.kdf_candidates.some((candidate) => ids.includes(candidate.kdf_id))).map((article) => article.id);
  return { evidence: unique(evidence), feedback: unique(feedback), practice: unique(practice), discovery: unique(discovery), gaps: unique(gaps), limitations: unique(limitations), legacy: unique(legacy) };
}

function proposedQuestion(left: DiscoveryNode, right: DiscoveryNode, relation: CandidateRelationType, shared: string[], differing: string[]) {
  const population = left.dimensions.population !== DISCOVERY_UNKNOWN ? left.dimensions.population : right.dimensions.population;
  const a = left.dimensions.measurement !== DISCOVERY_UNKNOWN ? left.dimensions.measurement : left.dimensions.outcome;
  const b = right.dimensions.outcome !== DISCOVERY_UNKNOWN ? right.dimensions.outcome : right.dimensions.measurement;
  if (relation === "BRIDGE_CANDIDATE") return `在${population !== DISCOVERY_UNKNOWN ? population : "既定研究族群"}中，${a !== DISCOVERY_UNKNOWN ? a : left.title}是否能解釋或預測${b !== DISCOVERY_UNKNOWN ? b : right.title}的差異？`;
  return `${left.title}與${right.title}之間的${differing[0] ?? shared[0] ?? "適用邊界"}，是否構成需要獨立驗證的研究問題？`;
}

interface DedupEntry {
  text: string;
  root: string;
  parent: string;
  dimensions: AskStructuredDimensions;
}

const dedupCorpusCache = new WeakMap<KdfSnapshot, DedupEntry[]>();

function dedupCorpus(snapshot: KdfSnapshot) {
  const cached = dedupCorpusCache.get(snapshot);
  if (cached) return cached;
  const index = entityIndex(snapshot);
  const formal: DedupEntry[] = [...snapshot.formal.research_questions, ...snapshot.formal.discovery_questions].map((card) => ({
    text: card.topic,
    root: card.root_topic || DISCOVERY_UNKNOWN,
    parent: card.parent || DISCOVERY_UNKNOWN,
    dimensions: dimensionsForEntity(index.get(card.id)!),
  }));
  const templateRoots = unique(snapshot.formal.research_questions.map((rq) => rq.root_topic));
  const templates: DedupEntry[] = templateRoots.flatMap((root) => {
    const template = findMandalaTemplate(root);
    return template ? template.dimensions.flatMap((dimension) => [dimension.description, ...dimension.sub_questions].map((text) => ({ text, root, parent: DISCOVERY_UNKNOWN, dimensions: structureAskQuestion(text) }))) : [];
  });
  const result = [...formal, ...templates];
  dedupCorpusCache.set(snapshot, result);
  return result;
}

function dedupRisk(snapshot: KdfSnapshot, question: string, origins: DiscoveryNode[], extraCandidates: string[] = []) {
  const extras: DedupEntry[] = extraCandidates.map((text) => ({ text, root: DISCOVERY_UNKNOWN, parent: DISCOVERY_UNKNOWN, dimensions: structureAskQuestion(text) }));
  const existing = [...dedupCorpus(snapshot), ...extras];
  const normalized = normalizeAskQuestion(question);
  if (existing.some((item) => normalizeAskQuestion(item.text) === normalized)) return "HIGH" as const;
  const questionDimensions = structureAskQuestion(question);
  const structuredKeys: Array<keyof AskStructuredDimensions> = ["population", "age_group", "intervention_or_exposure", "comparator", "outcome", "measurement", "mechanism", "context", "timeframe", "practice_context"];
  const originRoots = new Set(origins.map((node) => node.dimensions.root_topic).filter((value) => value !== DISCOVERY_UNKNOWN));
  const originParents = new Set(origins.map((node) => node.dimensions.parent).filter((value) => value !== DISCOVERY_UNKNOWN));
  const comparisons = existing.map((item) => {
    const structuredOverlap = structuredKeys.filter((key) => questionDimensions[key] !== DISCOVERY_UNKNOWN && item.dimensions[key] !== DISCOVERY_UNKNOWN && normalizeAskQuestion(questionDimensions[key]) === normalizeAskQuestion(item.dimensions[key])).length;
    const hierarchyOverlap = (item.root !== DISCOVERY_UNKNOWN && originRoots.has(item.root)) || (item.parent !== DISCOVERY_UNKNOWN && originParents.has(item.parent));
    return { text: textOverlap(question, item.text), structuredOverlap, hierarchyOverlap };
  });
  if (comparisons.some((item) => item.text.high && item.structuredOverlap >= 2 && item.hierarchyOverlap)) return "HIGH" as const;
  if (comparisons.some((item) => item.text.high || item.structuredOverlap >= 3 || (item.hierarchyOverlap && item.structuredOverlap >= 2))) return "MEDIUM" as const;
  return "LOW" as const;
}

function classify(left: GraphEntity, right: GraphEntity, snapshot: KdfSnapshot, shared: string[], differing: string[]) {
  const exact = normalizeAskQuestion(left.title) === normalizeAskQuestion(right.title);
  if (exact && left.id !== right.id) return "DUPLICATE" as const;
  const overlap = textOverlap(left.title, right.title);
  const sameParent = left.card?.parent && left.card.parent === right.card?.parent;
  const sameRoot = left.card?.root_topic && left.card.root_topic === right.card?.root_topic;
  const explicit = linked(left, right, snapshot);
  const promotedReuse = (left.candidate?.route_result.formal_ids.includes(right.id) ?? false) || (right.candidate?.route_result.formal_ids.includes(left.id) ?? false);
  const polarityA = claimPolarity(left); const polarityB = claimPolarity(right);
  const possibleConflict = polarityA !== "UNKNOWN" && polarityB !== "UNKNOWN" && polarityA !== polarityB;
  const decomposingDimensions = differing.filter((item) => ["population", "age_group", "intervention_or_exposure", "comparator", "outcome", "measurement", "context", "timeframe", "study_design", "adherence", "implementation", "claim_strength", "evidence_level"].includes(item));
  if (possibleConflict) return decomposingDimensions.length ? "CASE_VARIATION" as const : "APPARENT_CONFLICT" as const;
  if (promotedReuse) return "REUSE" as const;
  if (sameParent && overlap.high && differing.length <= 2) return "REUSE" as const;
  if (explicit && shared.length >= 2 && differing.length <= 3) return "REUSE" as const;
  if ((left.kind === "intake" || right.kind === "intake") && shared.length >= 2) return differing.length ? "CASE_VARIATION" as const : "REUSE" as const;
  const bridgeDimensions = shared.filter((item) => ["population", "age_group", "intervention_or_exposure", "root_topic"].includes(item));
  const meaningfulDifference = differing.some((item) => ["outcome", "measurement", "context", "timeframe", "practice_context", "parent"].includes(item));
  const bridgeText = `${entityText(left)} ${entityText(right)}`;
  const boundedBridgePattern = /relative peripheral refraction|\brpr\b|相對周邊屈光|個體差異/iu.test(bridgeText) && /適應|視覺品質|日常功能|functional use/iu.test(bridgeText);
  if (sameRoot && left.card?.parent !== right.card?.parent && bridgeDimensions.length >= 2 && meaningfulDifference && boundedBridgePattern && !explicit) return "BRIDGE_CANDIDATE" as const;
  if ((sameRoot || explicit) && shared.length >= 2 && differing.length) return "EXTEND" as const;
  if (overlap.high && shared.length >= 2) return "EXTEND" as const;
  return "INSUFFICIENT_FOR_RELATION" as const;
}

function evidenceSufficiency(relation: CandidateRelationType, context: ReturnType<typeof contexts>, left: GraphEntity, right: GraphEntity): DiscoveryEvidenceSufficiency {
  if (relation === "INSUFFICIENT_FOR_RELATION") return "INSUFFICIENT_FOR_RELATION";
  if (relation === "BRIDGE_CANDIDATE" || relation === "NEW_GAP_CANDIDATE" || relation === "NEW_QUESTION_CANDIDATE") return context.evidence.length ? "NEEDS_EXTERNAL_VERIFICATION" : "INSUFFICIENT_FOR_NEW_QUESTION";
  if (left.kind === "intake" || right.kind === "intake" || [left.type, right.type].some((type) => ["practice-card", "field-observation", "uncle-lens", "SOCIAL_FEEDBACK", "AGENT_REACH_DISCOVERY"].includes(type))) return "NEEDS_OWNER_REVIEW";
  return context.evidence.length ? "SUFFICIENT_FOR_CANDIDATE_RELATION" : "NEEDS_EXTERNAL_VERIFICATION";
}

function emptyDiscovery(ids: string[]): CrossNodeDiscovery {
  return { discovery_id: `XND-INVALID-${ids.join("-")}`, valid: false, unknown_node_ids: ids, source_nodes: [], compared_dimensions: {}, candidate_relation: "INSUFFICIENT_FOR_RELATION", confidence: "UNKNOWN", evidence_sufficiency: "INSUFFICIENT_FOR_RELATION", shared_dimensions: [], differing_dimensions: [], matching_context: [], conflicting_context: [], hierarchy_context: [], evidence_context: [], gap_context: [], signal_context: [], rationale: `Unknown node ID: ${ids.join("、")}. No fuzzy replacement was used.`, uncertainty: ["At least one requested node does not exist in the current snapshot."], related_evidence: [], related_feedback: [], related_practice: [], related_discovery: [], related_legacy_content: [], gap_candidate: null, question_candidate: null, duplicate_risk: "UNKNOWN", bridge_hypothesis: "", suggested_next_action: "NO_ACTION_NEEDED", owner_review_needed: true, candidate_state: "CANDIDATE_ONLY", why_compared: ["Manual comparison request"] };
}

export function compareCrossNodes(snapshot: KdfSnapshot, sourceId: string, targetId: string, extraCandidateQuestions: string[] = [], whyCompared = ["Manual node selection"]): CrossNodeDiscovery {
  const index = entityIndex(snapshot);
  const left = index.get(sourceId); const right = index.get(targetId);
  const missing = unique([!left ? sourceId : "", !right ? targetId : ""]);
  if (missing.length) return emptyDiscovery(missing);
  if (sourceId === targetId) return { ...emptyDiscovery([]), discovery_id: `XND-${sourceId}-${targetId}`, unknown_node_ids: [], rationale: "A node cannot be compared with itself; select two distinct existing nodes." };
  const leftNode = discoveryNode(left!); const rightNode = discoveryNode(right!);
  const comparison = compareDimensions(leftNode.dimensions, rightNode.dimensions);
  const context = contexts(snapshot, [sourceId, targetId]);
  const relation = classify(left!, right!, snapshot, comparison.shared, comparison.differing);
  const sufficiency = evidenceSufficiency(relation, context, left!, right!);
  const bridge = relation === "BRIDGE_CANDIDATE" ? `兩節點同屬 ${leftNode.dimensions.root_topic}，共享 ${comparison.shared.filter((item) => ["population", "age_group", "intervention_or_exposure", "mechanism", "root_topic"].includes(item)).join("、")}，但 ${comparison.differing.filter((item) => ["outcome", "measurement", "context", "timeframe", "parent"].includes(item)).join("、")} 不同；可檢查前者是否解釋後者，不能視為已成立連結。` : "";
  const gapEligible = ["BRIDGE_CANDIDATE", "EXTEND", "CASE_VARIATION"].includes(relation) && comparison.differing.some((item) => ["outcome", "measurement", "context", "timeframe", "practice_context"].includes(item));
  const creatingDimension = comparison.differing.find((item) => ["outcome", "measurement", "context", "timeframe", "practice_context"].includes(item)) ?? DISCOVERY_UNKNOWN;
  const gap: GapCandidate | null = gapEligible ? {
    candidate_state: "CANDIDATE", statement: `尚不清楚 ${leftNode.title} 與 ${rightNode.title} 在「${creatingDimension}」上的差異是否具有可重複、可研究的連結。`, origin_node_ids: [sourceId, targetId],
    existing_knowledge: context.evidence.length ? `已有 Formal Evidence context：${context.evidence.join("、")}；僅涵蓋其原始 bounded question。` : "目前沒有可直接承接此交叉點的 Formal Evidence。",
    unresolved: `需要直接比較兩節點的 ${creatingDimension}，並控制已辨識的 population、measurement、timeframe 與 implementation 差異。`,
    not_keyword_absence_reason: `候選來自 ${comparison.shared.length} 個明示共享 dimensions 與 ${comparison.differing.length} 個明示差異 dimensions，不是只因為關鍵字缺席。`, creating_dimension: creatingDimension,
    existing_related_gaps: context.gaps, evidence_limitations: context.limitations, recommended_next_action: context.evidence.length ? "REVIEW_EXISTING_EVIDENCE" : "SEARCH_EXTERNAL_EVIDENCE",
  } : null;
  const questionText = gap ? proposedQuestion(leftNode, rightNode, relation, comparison.shared, comparison.differing) : "";
  const duplicate = questionText ? dedupRisk(snapshot, questionText, [leftNode, rightNode], extraCandidateQuestions) : relation === "DUPLICATE" ? "HIGH" : "LOW";
  const question: QuestionCandidate | null = gap ? { candidate_state: "CANDIDATE", question: questionText, origin_nodes: [sourceId, targetId], originating_relation_candidate: relation, shared_dimensions: comparison.shared, new_dimension: creatingDimension, why_existing_rq_not_enough: `現有 RQ 各自處理原本的 outcome／measurement；沒有正式節點確認兩者的 ${creatingDimension} 交叉作用。`, duplicate_risk: duplicate, evidence_sufficiency: sufficiency, suggested_next_action: duplicate === "HIGH" ? "CHECK_EXISTING_DISCOVERY" : context.evidence.length ? "REVIEW_EXISTING_EVIDENCE" : "SEARCH_EXTERNAL_EVIDENCE", owner_review: "REQUIRED" } : null;
  const confidence: DiscoveryConfidence = relation === "INSUFFICIENT_FOR_RELATION" ? "LOW" : relation === "DUPLICATE" ? "HIGH" : comparison.shared.length >= 3 ? "MEDIUM" : "LOW";
  const matching = comparison.shared.map((key) => `${key}: ${leftNode.dimensions[key]}`);
  const conflicting = comparison.differing.map((key) => `${key}: ${leftNode.dimensions[key]} ↔ ${rightNode.dimensions[key]}`);
  const hierarchy = [`${sourceId}: ${leftNode.dimensions.hierarchy}`, `${targetId}: ${rightNode.dimensions.hierarchy}`, linked(left!, right!, snapshot) ? "Existing explicit relationship exists." : "Current explicit relationship index does not directly connect this pair."];
  const rationale = relation === "INSUFFICIENT_FOR_RELATION" ? "Available explicit dimensions do not justify a useful relationship; no candidate edge should be promoted." : relation === "CASE_VARIATION" ? "The pair shares an underlying topic but differs on bounded dimensions; variation is safer than claiming conflict." : relation === "APPARENT_CONFLICT" ? "Formal claim contexts appear inconsistent after the available comparison dimensions were decomposed; this remains an apparent conflict only." : relation === "BRIDGE_CANDIDATE" ? bridge : `${relation} is proposed from explicit shared dimensions, hierarchy and bounded differences; it remains candidate-only.`;
  return {
    discovery_id: `XND-${[sourceId, targetId].sort().join("--")}`, valid: true, unknown_node_ids: [], source_nodes: [leftNode, rightNode], compared_dimensions: { [sourceId]: leftNode.dimensions, [targetId]: rightNode.dimensions }, candidate_relation: relation, confidence, evidence_sufficiency: sufficiency,
    shared_dimensions: comparison.shared, differing_dimensions: comparison.differing, matching_context: matching, conflicting_context: conflicting, hierarchy_context: hierarchy,
    evidence_context: context.evidence.map((id) => `${id} · FORMAL EVIDENCE`), gap_context: context.gaps, signal_context: [...context.feedback.map((id) => `${id} · FEEDBACK SIGNAL · NOT EVIDENCE`), ...context.practice.map((id) => `${id} · PRACTICE / OBSERVATION · NOT EVIDENCE`)], rationale,
    uncertainty: ["Deterministic comparison cannot establish causality or scientific validity.", ...(context.evidence.length ? [] : ["No Formal Evidence directly closes this intersection."]), ...(relation === "BRIDGE_CANDIDATE" ? ["The bridge hypothesis requires external verification and Owner review."] : [])],
    related_evidence: context.evidence, related_feedback: context.feedback, related_practice: context.practice, related_discovery: context.discovery, related_legacy_content: context.legacy,
    gap_candidate: gap, question_candidate: question, duplicate_risk: duplicate, bridge_hypothesis: bridge,
    suggested_next_action: relation === "INSUFFICIENT_FOR_RELATION" ? "NO_ACTION_NEEDED" : duplicate === "HIGH" ? "CHECK_EXISTING_DISCOVERY" : context.evidence.length ? "REVIEW_EXISTING_EVIDENCE" : "SEARCH_EXTERNAL_EVIDENCE",
    owner_review_needed: true, candidate_state: "CANDIDATE_ONLY", why_compared: whyCompared,
  };
}

function pairKey(left: string, right: string) { return [left, right].sort().join("\u0000"); }

export function discoverCrossNodeCandidates(snapshot: KdfSnapshot, limit = 12) {
  const index = entityIndex(snapshot);
  const reasons = new Map<string, Set<string>>();
  const add = (left: string, right: string, reason: string) => {
    if (left === right || !index.has(left) || !index.has(right)) return;
    const key = pairKey(left, right); const values = reasons.get(key) ?? new Set<string>(); values.add(reason); reasons.set(key, values);
  };
  for (const edge of explicitEdges(snapshot)) add(edge.source, edge.target, `Existing relationship index: ${edge.basis}`);
  const research = [...snapshot.formal.research_questions, ...snapshot.formal.discovery_questions];
  const byRoot = new Map<string, string[]>();
  for (const card of research) { const ids = byRoot.get(card.root_topic) ?? []; ids.push(card.id); byRoot.set(card.root_topic, ids); }
  for (const ids of byRoot.values()) for (let left = 0; left < ids.length; left += 1) for (let right = left + 1; right < ids.length; right += 1) add(ids[left], ids[right], "Same root topic; bounded RQ/DQ candidate pass");
  for (const candidate of [...snapshot.intake.agent_reach.candidates, ...snapshot.intake.social_feedback.candidates]) {
    const ids = candidate.related_kdf_ids.filter((id) => index.has(id));
    for (const id of ids) add(candidate.id, id, `${candidate.item_kind} explicitly points to the node`);
    for (let left = 0; left < ids.length; left += 1) for (let right = left + 1; right < ids.length; right += 1) add(ids[left], ids[right], `${candidate.item_kind} points to both nodes`);
  }
  return [...reasons.entries()].map(([key, why]) => {
    const [left, right] = key.split("\u0000");
    return compareCrossNodes(snapshot, left, right, [], [...why]);
  }).filter((item) => item.valid && item.candidate_relation !== "INSUFFICIENT_FOR_RELATION")
    .filter((item) => item.candidate_relation !== "BRIDGE_CANDIDATE" || item.source_nodes.every((node) => node.type === "research-question"))
    .sort((left, right) => {
      const rank: Record<CandidateRelationType, number> = { BRIDGE_CANDIDATE: 0, NEW_GAP_CANDIDATE: 1, NEW_QUESTION_CANDIDATE: 2, APPARENT_CONFLICT: 3, EXTEND: 4, CASE_VARIATION: 5, DUPLICATE: 6, REUSE: 7, INSUFFICIENT_FOR_RELATION: 8 };
      return rank[left.candidate_relation] - rank[right.candidate_relation] || right.shared_dimensions.length - left.shared_dimensions.length || left.discovery_id.localeCompare(right.discovery_id);
    }).slice(0, limit);
}

export function graphOverlayFor(discovery: CrossNodeDiscovery): DiscoveryGraphOverlay | null {
  if (!discovery.valid || discovery.source_nodes.length !== 2 || discovery.candidate_relation === "INSUFFICIENT_FOR_RELATION") return null;
  return { discovery_id: discovery.discovery_id, source_id: discovery.source_nodes[0].id, target_id: discovery.source_nodes[1].id, relation: discovery.candidate_relation, label: "CANDIDATE" };
}
