import { entityIndex, relationshipsFor } from "./relationships.ts";
import { findMandalaTemplate, type MandalaDimensionTemplate } from "./mandala-templates.ts";
import type { KdfSnapshot } from "./types.ts";

export type MandalaCoverage = "COVERED" | "PARTIALLY_COVERED" | "OPEN" | "SIGNAL_ONLY" | "UNKNOWN";
export type MandalaMark = "NEW_SIGNAL" | "EXISTING_GAP" | "POSSIBLE_EXTENSION" | "DUPLICATE_RISK" | "NEEDS_VERIFICATION";

export interface MandalaCell {
  cell_id: string; parent_cell: string; level: 0 | 1 | 2; label: string; question_text: string;
  related_kdf_nodes: string[]; related_evidence: string[]; related_feedback: string[]; related_agent_reach: string[]; related_discovery: string[];
  related_practice: string[]; related_articles: string[]; mature_knowledge: string[]; evidence_coverage: MandalaCoverage; gap_signal: boolean;
  open_gap_nodes: string[]; known_limitations: string[]; strongest_evidence_level: string;
  duplicate_risk: "LOW" | "MEDIUM" | "HIGH"; candidate_state: "THINKING_ONLY"; marks: MandalaMark[]; reason: string;
}

export interface SessionMandala {
  template: NonNullable<ReturnType<typeof findMandalaTemplate>>;
  session_question: string;
  core: MandalaCell;
  dimensions: Array<{ template: MandalaDimensionTemplate; cell: MandalaCell; children: MandalaCell[] }>;
}

function unique(values: string[]) { return [...new Set(values)].sort(); }

function deriveCell(snapshot: KdfSnapshot, cell: Omit<MandalaCell, "related_evidence" | "related_feedback" | "related_agent_reach" | "related_discovery" | "related_practice" | "related_articles" | "mature_knowledge" | "open_gap_nodes" | "known_limitations" | "strongest_evidence_level" | "evidence_coverage" | "gap_signal" | "duplicate_risk" | "candidate_state" | "marks" | "reason">): MandalaCell {
  const index = entityIndex(snapshot);
  const formal = cell.related_kdf_nodes.filter((id) => index.get(id)?.kind === "formal");
  const feedback = cell.related_kdf_nodes.filter((id) => index.get(id)?.candidate?.item_kind === "SOCIAL_FEEDBACK");
  const agentReach = cell.related_kdf_nodes.filter((id) => index.get(id)?.candidate?.item_kind === "AGENT_REACH_DISCOVERY");
  const evidence = formal.filter((id) => index.get(id)?.type === "evidence-card");
  const mature = formal.filter((id) => index.get(id)?.type === "mature-knowledge");
  const discovery = formal.filter((id) => index.get(id)?.type === "discovery-question");
  const practice = formal.filter((id) => ["practice-card", "field-observation", "uncle-lens"].includes(index.get(id)?.type ?? ""));
  const articles = snapshot.content.legacy_blog.articles
    .filter((article) => article.kdf_candidates.some((candidate) => formal.includes(candidate.kdf_id)))
    .map((article) => article.id);
  const hasOpenGap = formal.some((id) => index.get(id)?.card?.gap_status === "open");
  const openGapNodes = formal.filter((id) => index.get(id)?.card?.gap_status === "open");
  const limitations = evidence.flatMap((id) => index.get(id)?.card?.detail_sections.filter((section) => ["what we do not know", "what cannot be concluded", "limitations"].includes(section.heading.toLowerCase())).map((section) => section.content) ?? []);
  const levelOrder = ["A", "B", "C1", "C2", "C3", "D", "H"];
  const strongest = evidence.map((id) => index.get(id)?.card?.evidence_level ?? "").filter(Boolean).sort((left, right) => levelOrder.indexOf(left) - levelOrder.indexOf(right))[0] ?? "";
  const researchCount = formal.filter((id) => index.get(id)?.type === "research-question").length;
  let coverage: MandalaCoverage = "UNKNOWN";
  if (evidence.length && mature.length) coverage = hasOpenGap ? "PARTIALLY_COVERED" : "COVERED";
  else if (evidence.length) coverage = "PARTIALLY_COVERED";
  else if (discovery.length || (researchCount && hasOpenGap)) coverage = "OPEN";
  else if (feedback.length || agentReach.length || practice.length) coverage = "SIGNAL_ONLY";
  const duplicate = researchCount > 1 ? "HIGH" : researchCount === 1 ? "MEDIUM" : "LOW";
  const marks: MandalaMark[] = [];
  if (feedback.length || agentReach.length || practice.length) marks.push("NEW_SIGNAL");
  if (hasOpenGap || discovery.length) marks.push("EXISTING_GAP");
  if (coverage === "OPEN" || coverage === "PARTIALLY_COVERED") marks.push("POSSIBLE_EXTENSION");
  if (duplicate !== "LOW") marks.push("DUPLICATE_RISK");
  if (!evidence.length && (feedback.length || agentReach.length || practice.length || discovery.length)) marks.push("NEEDS_VERIFICATION");
  const reason = coverage === "COVERED" ? "既有 Evidence 與 Mature Knowledge 已實質涵蓋，且沒有結構化 open gap。"
    : coverage === "PARTIALLY_COVERED" ? "已有正式 Evidence／Knowledge context，但相關卡仍保留 open gap。"
      : coverage === "OPEN" ? "既有 Research／Discovery context 指向未解問題，但尚無足夠 Evidence 閉合。"
        : coverage === "SIGNAL_ONLY" ? "目前只有 Practice／Feedback／intake 訊號，不能視為研究證據。"
          : "目前結構化資料不足；不從空白推論問題已被研究。";
  return { ...cell, related_kdf_nodes: formal, related_evidence: evidence, related_feedback: feedback, related_agent_reach: agentReach, related_discovery: discovery, related_practice: practice, related_articles: unique(articles), mature_knowledge: mature, open_gap_nodes: openGapNodes, known_limitations: limitations, strongest_evidence_level: strongest, evidence_coverage: coverage, gap_signal: hasOpenGap || discovery.length > 0, duplicate_risk: duplicate, candidate_state: "THINKING_ONLY", marks, reason };
}

function contextIds(snapshot: KdfSnapshot, rqId: string, dimension: MandalaDimensionTemplate) {
  const ids = new Set<string>(dimension.related_node_ids);
  const motherId = dimension.related_node_ids.find((id) => /^KDF-\d{3}-[A-Z]$/u.test(id));
  if (motherId) for (const relation of relationshipsFor(motherId, snapshot)) ids.add(relation.id);
  for (const candidate of [...snapshot.intake.agent_reach.candidates, ...snapshot.intake.social_feedback.candidates]) {
    if (candidate.related_kdf_ids.some((id) => ids.has(id))) ids.add(candidate.id);
  }
  if (!ids.size) ids.add(rqId);
  return unique([...ids]);
}

export function buildMandala(snapshot: KdfSnapshot, rqId: string) {
  const rq = snapshot.formal.research_questions.find((card) => card.id === rqId);
  if (!rq) return undefined;
  const template = findMandalaTemplate(rq.root_topic);
  if (!template) return undefined;
  const core = deriveCell(snapshot, { cell_id: `${rq.id}:core`, parent_cell: "", level: 0, label: "核心問題", question_text: rq.topic, related_kdf_nodes: unique([rq.id, ...relationshipsFor(rq.id, snapshot).map((item) => item.id)]) });
  const dimensions = template.dimensions.map((dimension) => {
    const ids = contextIds(snapshot, rq.id, dimension);
    const cell = deriveCell(snapshot, { cell_id: `${rq.id}:${dimension.id}`, parent_cell: core.cell_id, level: 1, label: dimension.label, question_text: dimension.description, related_kdf_nodes: ids });
    const children = dimension.sub_questions.slice(0, 8).map((question, index) => deriveCell(snapshot, { cell_id: `${cell.cell_id}:${index + 1}`, parent_cell: cell.cell_id, level: 2, label: `${dimension.label} ${index + 1}`, question_text: question, related_kdf_nodes: ids }));
    return { template: dimension, cell, children };
  });
  return { template, rq, core, dimensions };
}

export function buildQuestionMandala(snapshot: KdfSnapshot, question: string, matchedNodeIds: string[]): SessionMandala | undefined {
  const index = entityIndex(snapshot);
  const formalIds = unique(matchedNodeIds.filter((id) => index.get(id)?.kind === "formal"));
  const roots = unique(formalIds.map((id) => {
    const card = index.get(id)?.card;
    return card?.root_topic || (card?.type === "root-topic" ? card.id : "");
  }).filter(Boolean));
  const rootId = roots.find((id) => Boolean(findMandalaTemplate(id)));
  if (!rootId) return undefined;
  const template = findMandalaTemplate(rootId);
  if (!template) return undefined;
  const rootContext = formalIds.filter((id) => {
    const card = index.get(id)?.card;
    return card?.root_topic === rootId || card?.id === rootId;
  });
  const core = deriveCell(snapshot, {
    cell_id: "ASK:core", parent_cell: "", level: 0, label: "本次問題", question_text: question,
    related_kdf_nodes: unique(rootContext.length ? rootContext : [rootId]),
  });
  const dimensions = template.dimensions.map((dimension) => {
    const ids = unique([...contextIds(snapshot, rootId, dimension), ...rootContext]);
    const cell = deriveCell(snapshot, {
      cell_id: `ASK:${dimension.id}`, parent_cell: core.cell_id, level: 1, label: dimension.label,
      question_text: dimension.description, related_kdf_nodes: ids,
    });
    const children = dimension.sub_questions.slice(0, 8).map((subQuestion, index) => deriveCell(snapshot, {
      cell_id: `${cell.cell_id}:${index + 1}`, parent_cell: cell.cell_id, level: 2,
      label: `${dimension.label} ${index + 1}`, question_text: subQuestion, related_kdf_nodes: ids,
    }));
    return { template: dimension, cell, children };
  });
  return { template, session_question: question, core, dimensions };
}
