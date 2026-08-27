import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { BackButton, Badge, Breadcrumbs, Empty } from "./components";
import { buildMandala, type MandalaCell } from "./mandala-engine";
import { entityIndex } from "./relationships";
import { discoverCrossNodeCandidates } from "./cross-node-engine";
import { buildQuestionRegeneration, questionLabCandidateForOrigin, type QuestionRegenerationSnapshot } from "./question-regeneration-engine";
import type { KdfSnapshot } from "./types";

type Mode = "EXPLORE" | "EVIDENCE" | "DISCOVERY";
const positions = [0, 1, 2, 3, 5, 6, 7, 8];
const statusLabel: Record<string, string> = { COVERED: "Covered", PARTIALLY_COVERED: "Partial", OPEN: "Open", SIGNAL_ONLY: "Signal only", UNKNOWN: "Unknown" };
const statusIcon: Record<string, string> = { COVERED: "●", PARTIALLY_COVERED: "◐", OPEN: "○", SIGNAL_ONLY: "◇", UNKNOWN: "?" };

function CellBody({ cell, mode, crossNodeCount }: { cell: MandalaCell; mode: Mode; crossNodeCount: number }) {
  if (mode === "EVIDENCE") return <><small>{cell.label}</small><strong>{cell.related_evidence.length} Evidence Card</strong><span>最強：{cell.strongest_evidence_level || "none"}</span><span>Mature：{cell.mature_knowledge.length ? "YES" : "NO"} · Gap：{cell.open_gap_nodes.length}</span><span>Related Articles：{cell.related_articles.length}（not Evidence）</span></>;
  if (mode === "DISCOVERY") return <><small>{cell.label}</small><strong>{cell.question_text}</strong><span>{cell.marks.length ? cell.marks.join(" · ") : "NO STRUCTURED SIGNAL"}</span><span className="mandala-cross-node">Cross-node: {crossNodeCount} · CANDIDATE</span></>;
  return <><small>{cell.label}</small><strong>{cell.question_text}</strong><span>{statusIcon[cell.evidence_coverage]} {statusLabel[cell.evidence_coverage]}</span><span>E {cell.related_evidence.length} · A {cell.related_articles.length} · G {cell.gap_signal ? "!" : "—"} · S {cell.related_feedback.length + cell.related_agent_reach.length + cell.related_practice.length}</span></>;
}

function MandalaCellButton({ cell, mode, crossNodeCount, onClick, className = "" }: { cell: MandalaCell; mode: Mode; crossNodeCount: number; onClick(): void; className?: string }) {
  return <button type="button" className={`mandala-cell mandala-cell--${cell.evidence_coverage.toLowerCase()} ${className}`} onClick={onClick}>
    <CellBody cell={cell} mode={mode} crossNodeCount={crossNodeCount} /><em>THINKING_ONLY</em>
  </button>;
}

function CellDrawer({ cell, snapshot, crossNodeCount, draft, onDraft, questionModel }: { cell?: MandalaCell; snapshot: KdfSnapshot; crossNodeCount: number; draft: string; onDraft(value: string): void; questionModel: QuestionRegenerationSnapshot }) {
  if (!cell) return null;
  const entities = entityIndex(snapshot);
  const groups: Array<[string, string[]]> = [
    ["Existing related KDF nodes", cell.related_kdf_nodes], ["Formal Evidence", cell.related_evidence],
    ["Mature Knowledge", cell.mature_knowledge], ["Social Feedback signals", cell.related_feedback], ["Agent-Reach signals", cell.related_agent_reach],
    ["Practice signals", cell.related_practice], ["Discovery Questions", cell.related_discovery], ["Existing gap-status context", cell.open_gap_nodes],
  ];
  const candidate = cell.level === 2 && cell.evidence_coverage !== "COVERED";
  const questionCandidate = questionLabCandidateForOrigin(cell.cell_id, questionModel);
  const questionCluster = questionCandidate ? questionModel.clusters[questionModel.regenerated_candidates.findIndex((item) => item.regeneration_id === questionCandidate.regeneration_id)] : undefined;
  return <aside className="mandala-context" aria-label="Mandala cell context">
    <header><p>CELL CONTEXT · UI DERIVED</p><h2>{cell.label}</h2><code>{cell.cell_id}</code></header>
    <section><h3>What this cell is asking</h3><p>{cell.question_text}</p><Badge value={cell.evidence_coverage} /><Badge value={cell.candidate_state} /></section>
    <section><h3>判定理由</h3><p>{cell.reason}</p><p>Duplicate risk：<b>{cell.duplicate_risk}</b>；Gap signal：<b>{cell.gap_signal ? "YES" : "NO"}</b></p></section>
    <section className="mandala-cross-node-panel"><h3>Cross-node candidates</h3><p><b>{crossNodeCount}</b> 個 session-derived candidate 與此 cell 的既有節點重疊；不是 formal relation。</p><Link to="/discovery-lab">開啟 Discovery Lab →</Link></section>
    {questionCluster && <section className="mandala-question-lab-hint"><p>QUESTION REGENERATION · UI DERIVED</p><Link to={`/question-lab?cluster=${encodeURIComponent(questionCluster.cluster_id)}`}>Question Lab candidate available →</Link></section>}
    <section><h3>Known limitations</h3>{cell.known_limitations.length ? cell.known_limitations.map((item, index) => <p key={index}>{item}</p>) : <Empty>現有 Evidence 沒有可結構化投影到此 cell 的限制段落。</Empty>}</section>
    {groups.map(([label, ids]) => <section key={label}><h3>{label}</h3>{ids.length ? <ul>{ids.map((id) => { const entity = entities.get(id); return entity ? <li key={id}><Link to={entity.route}><code>{id}</code><span>{entity.title}</span></Link></li> : null; })}</ul> : <Empty>沒有明示資料。</Empty>}</section>)}
    <section><h3>Related Articles (not Evidence)</h3>{cell.related_articles.length ? <ul>{cell.related_articles.map((id) => {
      const article = snapshot.content.legacy_blog.articles.find((item) => item.id === id);
      return article ? <li key={id}><Link to={`/article/${encodeURIComponent(id)}`}><code>{id}</code><span>{article.title}</span></Link></li> : null;
    })}</ul> : <Empty>沒有 legacy article candidate。</Empty>}</section>
    <section><h3>Explore session note</h3><textarea value={draft} onChange={(event) => onDraft(event.target.value)} placeholder="只保存在目前 React session；重新整理即消失。" /><small>SESSION ONLY · NO DATABASE · NO FORMAL WRITE</small></section>
    {candidate && <section className="candidate-preview"><p>QUESTION CANDIDATE PREVIEW</p><h3>{draft.trim() || cell.question_text}</h3><dl><div><dt>Origin cell</dt><dd>{cell.cell_id}</dd></div><div><dt>Why not fully covered</dt><dd>{cell.reason}</dd></div><div><dt>Evidence sufficiency</dt><dd>{cell.related_evidence.length ? "PARTIAL FORMAL CONTEXT" : "INSUFFICIENT"}</dd></div><div><dt>Duplicate risk</dt><dd>{cell.duplicate_risk}</dd></div></dl><strong>PREVIEW ONLY — no kdf_create_question / kdf_discover</strong></section>}
  </aside>;
}

export function MandalaIndex({ snapshot }: { snapshot: KdfSnapshot }) {
  const eligible = snapshot.formal.research_questions.filter((rq) => buildMandala(snapshot, rq.id));
  return <><div className="notice">Mandala 是 THINKING_CANDIDATE 工作區，不是 KDF Core、Evidence 或正式 Research Gap。</div><div className="candidate-list">{eligible.map((rq) => <Link className="candidate-row" to={`/mandala/${encodeURIComponent(rq.id)}`} key={rq.id}><div><code>{rq.id}</code><strong>MANDALA PILOT</strong><p>{rq.topic}</p></div><span>開啟 3×3 →</span></Link>)}</div></>;
}

export function MandalaView({ snapshot }: { snapshot: KdfSnapshot }) {
  const { id, dimensionId } = useParams();
  const navigate = useNavigate();
  const model = useMemo(() => id ? buildMandala(snapshot, id) : undefined, [id, snapshot]);
  const crossNodeCandidates = useMemo(() => discoverCrossNodeCandidates(snapshot), [snapshot]);
  const questionModel = useMemo(() => buildQuestionRegeneration(snapshot), [snapshot]);
  const [mode, setMode] = useState<Mode>("EXPLORE");
  const [selected, setSelected] = useState<MandalaCell | undefined>();
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [focus, setFocus] = useState(false);
  if (!model) return <div className="not-found"><p>404 · NO ELIGIBLE TEMPLATE</p><h2>此節點沒有 Mandala template</h2><Link to="/mandala">返回 Mandala</Link></div>;
  const dimension = dimensionId ? model.dimensions.find((item) => item.template.id === dimensionId) : undefined;
  if (dimensionId && !dimension) return <div className="not-found"><p>404 · SAFE NOT FOUND</p><h2>Mandala dimension 不存在</h2><Link to={`/mandala/${encodeURIComponent(model.rq.id)}`}>返回核心</Link></div>;
  const center = dimension?.cell ?? model.core;
  const outer = dimension?.children ?? model.dimensions.map((item) => item.cell);
  const crossNodeCount = (cell: MandalaCell) => crossNodeCandidates.filter((candidate) => candidate.source_nodes.some((node) => cell.related_kdf_nodes.includes(node.id))).length;
  const openCell = (cell: MandalaCell) => {
    if (cell.level === 1) navigate(`/mandala/${encodeURIComponent(model.rq.id)}/${cell.cell_id.split(":").at(-1)}`);
    else setSelected(cell);
  };
  return <div className={`mandala-workspace ${focus ? "mandala-workspace--focus" : ""}`}>
    <div className="detail-nav"><BackButton fallback={dimension ? `/mandala/${model.rq.id}` : "/mandala"} /><Breadcrumbs items={[{ label: "Mandala", to: "/mandala" }, { label: model.rq.id, to: `/mandala/${model.rq.id}` }, ...(dimension ? [{ label: dimension.cell.label }] : [])]} /></div>
    <header className="mandala-head"><div><p>{model.template.name} · THINKING EXTENSION</p><h2>{dimension ? dimension.cell.label : model.rq.topic}</h2><span>{dimension ? "Level 2 · 8 sub-questions" : "Level 0 → Level 1 · 8 dimensions"}</span></div><div><button type="button" onClick={() => setFocus((value) => !value)}>{focus ? "離開 Focus" : "Focus Mode"}</button>{dimension && <Link to={`/mandala/${model.rq.id}`}>Back to parent</Link>}</div></header>
    <nav className="mandala-modes" aria-label="Mandala view mode">{(["EXPLORE", "EVIDENCE", "DISCOVERY"] as Mode[]).map((value) => <button type="button" key={value} className={mode === value ? "is-active" : ""} onClick={() => setMode(value)}>{value === "EXPLORE" ? "Explore" : value === "EVIDENCE" ? "Evidence" : "Discovery"}</button>)}<span>所有 coverage／marks 均為 UI-derived，不寫入 KDF。</span></nav>
    <div className="mandala-layout"><div className="mandala-grid">
      {outer.map((cell, index) => <div className="mandala-slot" style={{ gridArea: `${Math.floor(positions[index] / 3) + 1} / ${(positions[index] % 3) + 1}` }} key={cell.cell_id}><MandalaCellButton cell={cell} mode={mode} crossNodeCount={crossNodeCount(cell)} onClick={() => openCell(cell)} /></div>)}
      <div className="mandala-slot mandala-slot--core" style={{ gridArea: "2 / 2" }}><MandalaCellButton cell={center} mode={mode} crossNodeCount={crossNodeCount(center)} onClick={() => setSelected(center)} className="mandala-cell--core" /></div>
    </div><CellDrawer cell={selected} snapshot={snapshot} crossNodeCount={selected ? crossNodeCount(selected) : 0} draft={selected ? drafts[selected.cell_id] ?? "" : ""} onDraft={(value) => selected && setDrafts((current) => ({ ...current, [selected.cell_id]: value }))} questionModel={questionModel} /></div>
  </div>;
}
