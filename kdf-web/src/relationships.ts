import type { IntakeCandidate, KdfCard, KdfSnapshot } from "./types";

export interface GraphEntity {
  id: string;
  kind: "formal" | "intake";
  type: string;
  title: string;
  status: string;
  route: string;
  card?: KdfCard;
  candidate?: IntakeCandidate;
}

export interface ExplicitEdge {
  source: string;
  target: string;
  label: string;
  reverseLabel: string;
  basis: string;
  pending?: boolean;
}

export interface RelationshipItem extends GraphEntity {
  relationship: string;
  basis: string;
  derivedReverse: boolean;
  pending: boolean;
}

function formalRoute(card: KdfCard) {
  if (card.type === "research-question") return `/research/${encodeURIComponent(card.id)}`;
  if (card.type === "evidence-card") return `/evidence/${encodeURIComponent(card.id)}`;
  if (card.type === "content-draft") return `/article/${encodeURIComponent(card.id)}`;
  return `/node/${encodeURIComponent(card.id)}`;
}

function allCandidates(snapshot: KdfSnapshot) {
  return [...snapshot.intake.agent_reach.candidates, ...snapshot.intake.social_feedback.candidates];
}

export function entityIndex(snapshot: KdfSnapshot) {
  const entities = new Map<string, GraphEntity>();
  for (const card of snapshot.formal.cards) entities.set(card.id, {
    id: card.id, kind: "formal", type: card.type, title: card.topic,
    status: card.status, route: formalRoute(card), card,
  });
  for (const candidate of allCandidates(snapshot)) entities.set(candidate.id, {
    id: candidate.id, kind: "intake", type: candidate.item_kind,
    title: candidate.feedback_type, status: `${candidate.owner_review_status} / ${candidate.intake_state}`,
    route: `/feedback/${encodeURIComponent(candidate.id)}`, candidate,
  });
  return entities;
}

function edgeLabels(card: KdfCard, field: string, target?: KdfCard) {
  if (card.type === "discovery-question") return ["Candidate / Discovery", "Candidate / Discovery"];
  if (field === "origin_cards") return ["Candidate / Discovery", "Candidate / Discovery"];
  if (field === "source_knowledge") return ["Content provenance", "Article / Content"];
  if (field === "research_question") return ["Parent Research Question", `${card.type} output`];
  if (field === "root_topic") return ["Root", "Root member"];
  if (field === "parent") {
    if (card.type === "evidence-card") return ["Parent Research Question", "Evidence origin"];
    if (card.type === "content-draft") return ["Content provenance", "Article / Content"];
    return ["Parent", "Child"];
  }
  if (field === "sources") return ["Source card", "Derived output"];
  if (field === "wikilinks") return ["Wikilink", "Backlink"];
  if (card.type === "content-draft" || target?.type === "content-draft") return ["Content provenance", "Related Article"];
  return ["Explicit related", "Explicit related"];
}

export function explicitEdges(snapshot: KdfSnapshot) {
  const entities = entityIndex(snapshot);
  const edges: ExplicitEdge[] = [];
  const seen = new Set<string>();
  const add = (source: string, target: string, label: string, reverseLabel: string, basis: string, pending = false) => {
    if (source === target || !entities.has(source) || !entities.has(target)) return;
    const key = `${source}\u0000${target}\u0000${label}\u0000${basis}\u0000${pending}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({ source, target, label, reverseLabel, basis, pending });
  };

  for (const card of snapshot.formal.cards) {
    const fields: Array<[string, string[]]> = [
      ["root_topic", card.root_topic ? [card.root_topic] : []],
      ["parent", card.parent ? [card.parent] : []],
      ["research_question", card.research_question ? [card.research_question] : []],
      ["sources", card.sources], ["source_knowledge", card.source_knowledge],
      ["origin_cards", card.origin_cards], ["related", card.related], ["wikilinks", card.wikilinks],
    ];
    for (const [field, ids] of fields) for (const id of ids) {
      const labels = edgeLabels(card, field, entities.get(id)?.card);
      add(card.id, id, labels[0], labels[1], field);
    }
  }

  for (const candidate of allCandidates(snapshot)) {
    const signal = candidate.item_kind === "SOCIAL_FEEDBACK" ? "Feedback signal" : "Agent-Reach candidate";
    for (const id of candidate.related_kdf_ids) add(candidate.id, id, signal, signal, "related_kdf_nodes");
    const ledger = candidate.item_kind === "SOCIAL_FEEDBACK" ? "Feedback route ledger" : "Promotion ledger";
    for (const id of candidate.route_result.formal_ids) add(candidate.id, id, ledger, ledger, "ledger formal_ids");
    for (const id of candidate.pending_relation_ids) add(candidate.id, id, "Pending relation candidate", "Pending relation candidate", "cross-node candidate", true);
  }
  return edges;
}

const labelPriority = [
  "Feedback signal", "Agent-Reach candidate", "Candidate / Discovery", "Content provenance",
  "Evidence origin", "Parent Research Question", "Parent", "Root", "Source card",
  "Promotion ledger", "Feedback route ledger", "Explicit related", "Wikilink", "Backlink",
];

function pickLabel(labels: string[]) {
  return [...labels].sort((left, right) => {
    const li = labelPriority.indexOf(left);
    const ri = labelPriority.indexOf(right);
    return (li < 0 ? 999 : li) - (ri < 0 ? 999 : ri);
  })[0];
}

export function relationshipsFor(currentId: string, snapshot: KdfSnapshot) {
  const entities = entityIndex(snapshot);
  const grouped = new Map<string, Array<{ label: string; basis: string; reverse: boolean; pending: boolean }>>();
  for (const edge of explicitEdges(snapshot)) {
    let target = "";
    let label = "";
    let reverse = false;
    if (edge.source === currentId) { target = edge.target; label = edge.label; }
    else if (edge.target === currentId) { target = edge.source; label = edge.reverseLabel; reverse = true; }
    else continue;
    const rows = grouped.get(target) ?? [];
    rows.push({ label, basis: edge.basis, reverse, pending: edge.pending === true });
    grouped.set(target, rows);
  }
  const items: RelationshipItem[] = [];
  for (const [id, rows] of grouped) {
    const entity = entities.get(id);
    if (!entity) continue;
    const label = pickLabel(rows.map((row) => row.label));
    const selected = rows.find((row) => row.label === label) ?? rows[0];
    items.push({ ...entity, relationship: label, basis: selected.basis, derivedReverse: selected.reverse, pending: rows.some((row) => row.pending) });
  }
  return items.sort((left, right) => left.type.localeCompare(right.type) || left.id.localeCompare(right.id));
}

export function relationSections(currentId: string, snapshot: KdfSnapshot) {
  const items = relationshipsFor(currentId, snapshot);
  const signals = items.filter((item) => item.kind === "intake");
  const unresolved = items.filter((item) => !signals.includes(item) && (item.pending || item.type === "discovery-question"));
  const downstreamTypes = new Set(["mature-knowledge", "practice-card", "field-observation", "uncle-lens", "content-draft"]);
  const downstream = items.filter((item) => downstreamTypes.has(item.type) && !signals.includes(item) && !unresolved.includes(item));
  const used = new Set([...signals, ...unresolved, ...downstream].map((item) => item.id));
  const upstream = items.filter((item) => !used.has(item.id));
  return { upstream, downstream, signals, unresolved };
}

function directOfTypes(ids: Set<string>, snapshot: KdfSnapshot, types: Set<string>) {
  const found = new Map<string, GraphEntity>();
  for (const id of ids) for (const item of relationshipsFor(id, snapshot)) {
    if (types.has(item.type)) found.set(item.id, item);
  }
  return [...found.values()];
}

export function knowledgeChain(currentId: string, snapshot: KdfSnapshot) {
  const entities = entityIndex(snapshot);
  const current = entities.get(currentId);
  if (!current) return [];
  const selected = new Set<string>([currentId]);
  const research = new Map<string, GraphEntity>();
  const evidence = new Map<string, GraphEntity>();
  const mature = new Map<string, GraphEntity>();
  const content = new Map<string, GraphEntity>();
  if (current.type === "research-question") research.set(current.id, current);
  if (current.type === "content-draft") content.set(current.id, current);

  for (const item of relationshipsFor(currentId, snapshot)) {
    if (item.type === "research-question") research.set(item.id, item);
    if (item.type === "evidence-card") evidence.set(item.id, item);
    if (item.type === "mature-knowledge") mature.set(item.id, item);
    if (item.type === "content-draft") content.set(item.id, item);
  }
  for (const item of directOfTypes(new Set([...evidence.keys(), ...mature.keys(), ...content.keys()]), snapshot, new Set(["research-question", "evidence-card", "mature-knowledge", "content-draft"]))) {
    if (item.type === "research-question") research.set(item.id, item);
    if (item.type === "evidence-card") evidence.set(item.id, item);
    if (item.type === "mature-knowledge") mature.set(item.id, item);
    if (item.type === "content-draft") content.set(item.id, item);
  }
  for (const map of [research, evidence, mature, content]) for (const id of map.keys()) selected.add(id);

  const roots = new Map<string, GraphEntity>();
  const mothers = new Map<string, GraphEntity>();
  for (const rq of research.values()) {
    const card = rq.card;
    if (card?.root_topic && entities.has(card.root_topic)) roots.set(card.root_topic, entities.get(card.root_topic)!);
    if (card?.parent && entities.has(card.parent)) mothers.set(card.parent, entities.get(card.parent)!);
  }
  const signals = directOfTypes(selected, snapshot, new Set(["SOCIAL_FEEDBACK", "AGENT_REACH_DISCOVERY"]));
  const discovery = directOfTypes(selected, snapshot, new Set(["discovery-question"]));
  const layers = [
    ["Root", [...roots.values()]], ["Mother", [...mothers.values()]], ["Research Question", [...research.values()]],
    ["Evidence", [...evidence.values()]], ["Mature Knowledge", [...mature.values()]], ["Article / Content", [...content.values()]],
    ["Feedback / Agent-Reach", signals], ["Candidate / Discovery", discovery],
  ] as Array<[string, GraphEntity[]]>;
  return layers.filter(([, values]) => values.length);
}
