import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Badge, Empty, routeForCard } from "./components";
import {
  buildQuestionRegeneration,
  regenerateSelectedCandidates,
  type ManualRegenerationResult,
  type QuestionCluster,
  type QuestionRegenerationSnapshot,
  type RawQuestionCandidate,
  type RegeneratedQuestionCandidate,
} from "./question-regeneration-engine";
import type { AskAnalysisSession } from "./ask-engine";
import type { KdfSnapshot } from "./types";

type Filter = "ALL" | "NO_NEW_RQ_NEEDED" | "USE_EXISTING_DISCOVERY_QUESTION" | "OWNER_REVIEW";

function unique(values: string[]) { return [...new Set(values.filter(Boolean))]; }

function candidateFor(model: QuestionRegenerationSnapshot, cluster: QuestionCluster) {
  const index = model.clusters.findIndex((item) => item.cluster_id === cluster.cluster_id);
  return index < 0 ? undefined : model.regenerated_candidates[index];
}

function OriginLink({ id, raw, snapshot, askSession }: { id: string; raw: RawQuestionCandidate; snapshot: KdfSnapshot; askSession: AskAnalysisSession | null }) {
  const formal = snapshot.formal.cards.find((item) => item.id === id);
  if (formal) return <Link to={routeForCard(formal)}><code>{id}</code></Link>;
  const legacy = snapshot.content.legacy_blog.articles.find((item) => item.id === id);
  if (legacy) return <Link to={`/article/${encodeURIComponent(id)}`}><code>{id}</code></Link>;
  const intake = [...snapshot.intake.agent_reach.candidates, ...snapshot.intake.social_feedback.candidates].find((item) => item.id === id);
  if (intake) return <Link to={`/feedback/${encodeURIComponent(id)}`}><code>{id}</code></Link>;
  if (askSession && id === askSession.analysis_id) return <Link to="/ask"><code>{id}</code></Link>;
  if (id === raw.cross_relation_id && raw.related_kdf_ids.length >= 2) return <Link to={`/discovery-lab?source=${encodeURIComponent(raw.related_kdf_ids[0])}&target=${encodeURIComponent(raw.related_kdf_ids[1])}`}><code>{id}</code></Link>;
  if (raw.source_class === "MANDALA" && id.includes(":")) {
    const rqId = id.split(":")[0];
    if (snapshot.formal.research_questions.some((item) => item.id === rqId)) return <Link to={`/mandala/${encodeURIComponent(rqId)}`}><code>{id}</code></Link>;
  }
  return <code title="沒有可安全建立的現有目的地">{id}</code>;
}

function ContextLinks({ ids, snapshot, empty }: { ids: string[]; snapshot: KdfSnapshot; empty: string }) {
  if (!ids.length) return <Empty>{empty}</Empty>;
  return <ul className="question-link-list">{ids.map((id) => {
    const card = snapshot.formal.cards.find((item) => item.id === id);
    const article = snapshot.content.legacy_blog.articles.find((item) => item.id === id);
    const intake = [...snapshot.intake.agent_reach.candidates, ...snapshot.intake.social_feedback.candidates].find((item) => item.id === id);
    if (card) return <li key={id}><Link to={routeForCard(card)}><code>{id}</code><span>{card.topic}</span></Link></li>;
    if (article) return <li key={id}><Link to={`/article/${encodeURIComponent(id)}`}><code>{id}</code><span>{article.title}</span></Link></li>;
    if (intake) return <li key={id}><Link to={`/feedback/${encodeURIComponent(id)}`}><code>{id}</code><span>{intake.feedback_type}</span></Link></li>;
    return <li key={id}><code>{id}</code></li>;
  })}</ul>;
}

function RawList({ items, snapshot, askSession }: { items: RawQuestionCandidate[]; snapshot: KdfSnapshot; askSession: AskAnalysisSession | null }) {
  return <div className="question-raw-list">{items.map((raw) => <article key={raw.raw_candidate_id}>
    <header><Badge value={raw.source_class} /><code>{raw.raw_candidate_id}</code></header><h4>{raw.original_question}</h4>
    <dl><div><dt>Origin ID</dt><dd>{raw.origin_ids.length ? raw.origin_ids.map((id) => <OriginLink key={id} id={id} raw={raw} snapshot={snapshot} askSession={askSession} />) : "UNKNOWN"}</dd></div>
      <div><dt>Related KDF nodes</dt><dd>{raw.related_kdf_ids.length ? raw.related_kdf_ids.map((id) => <OriginLink key={id} id={id} raw={raw} snapshot={snapshot} askSession={askSession} />) : "沒有明示節點"}</dd></div></dl>
  </article>)}</div>;
}

function ReuseState({ candidate, snapshot }: { candidate: RegeneratedQuestionCandidate; snapshot: KdfSnapshot }) {
  const rq = candidate.closest_existing_rqs[0];
  const dq = candidate.closest_discovery_questions[0];
  if (candidate.recommendation === "NO_NEW_RQ_NEEDED") return <section className="question-reuse question-reuse--no-new"><p>NO_NEW_RQ_NEEDED</p><h3>不建議新增 Research Question</h3>
    {rq ? <><h4>{rq.id} · {rq.topic}</h4><p>{candidate.rationale}</p><dl><div><dt>已涵蓋 dimensions</dt><dd>{rq.covered_dimensions.join("、") || "既有核心問題已涵蓋"}</dd></div><div><dt>剩餘小幅 scope difference</dt><dd>{rq.new_dimensions.join("、") || "無明示差異"}</dd></div></dl>{snapshot.formal.cards.some((item) => item.id === rq.id) && <Link className="question-primary-action" to={`/research/${encodeURIComponent(rq.id)}`}>查看既有 RQ</Link>}</> : <Empty>沒有可安全連結的既有 RQ。</Empty>}
  </section>;
  if (candidate.recommendation === "USE_EXISTING_DISCOVERY_QUESTION") return <section className="question-reuse question-reuse--dq"><p>USE_EXISTING_DISCOVERY_QUESTION</p><h3>已有 Discovery Question 可沿用</h3>
    {dq ? <><h4>{dq.id} · {dq.topic}</h4><p>{candidate.rationale}</p><p>Overlap：{dq.overlap_state}；covered：{dq.covered_dimensions.join("、") || "既有候選範圍"}</p>{snapshot.formal.cards.some((item) => item.id === dq.id) && <Link className="question-primary-action" to={`/node/${encodeURIComponent(dq.id)}`}>查看既有 DQ</Link>}</> : <Empty>沒有可安全連結的既有 DQ。</Empty>}
  </section>;
  return null;
}

function CandidateDetail({ candidate, cluster, snapshot, askSession, manual = false }: { candidate?: RegeneratedQuestionCandidate; cluster?: QuestionCluster; snapshot: KdfSnapshot; askSession: AskAnalysisSession | null; manual?: boolean }) {
  if (!candidate) return <div className="question-safe-state"><p>INSUFFICIENT CONTEXT</p><h3>沒有可顯示的 regenerated question</h3><span>未進行模糊替換，也沒有建立正式問題。</span></div>;
  const reuse = ["NO_NEW_RQ_NEEDED", "USE_EXISTING_DISCOVERY_QUESTION"].includes(candidate.recommendation);
  const dimensions = Object.entries(candidate.structured_dimensions).filter(([, value]) => Array.isArray(value) ? value.length : Boolean(value));
  return <div className="question-detail">
    <header className="question-detail__head"><div><p>{manual ? "MANUAL SESSION RESULT" : cluster?.cluster_id ?? candidate.regeneration_id}</p><h2>{reuse ? "Reuse recommendation" : candidate.regenerated_question}</h2></div><div><Badge value={candidate.recommendation} tone={reuse ? "good" : "warn"} /><Badge value={candidate.candidate_state} /></div></header>
    {cluster && <section><h3>Raw Candidates</h3><RawList items={cluster.raw_candidates} snapshot={snapshot} askSession={askSession} /></section>}
    <ReuseState candidate={candidate} snapshot={snapshot} />
    {!reuse && <section><h3>Regenerated Question</h3><div className="question-formulations"><article className="is-primary"><small>PRIMARY</small><p>{candidate.regenerated_question}</p></article>{candidate.alternative_formulations.slice(0, 2).map((item, index) => <article key={item}><small>ALTERNATIVE {index ? "B" : "A"}</small><p>{item}</p></article>)}</div></section>}
    <section className="question-reasoning"><div><h3>Why this version is better</h3><p>{candidate.rationale}</p></div><div><h3>What changed</h3>{candidate.what_changed.length ? <ul>{candidate.what_changed.map((item) => <li key={item}>{item}</li>)}</ul> : <Empty>沒有明示變更。</Empty>}</div></section>
    <section><h3>Structured dimensions</h3><dl className="question-dimensions">{dimensions.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{Array.isArray(value) ? value.join("、") || "UNKNOWN" : String(value)}</dd></div>)}</dl></section>
    <section><h3>Quality & decision context</h3><dl className="question-quality"><div><dt>Scope quality</dt><dd><Badge value={candidate.quality_scope} /></dd></div><div><dt>Answerability</dt><dd><Badge value={candidate.answerability} /></dd></div><div><dt>Novelty</dt><dd><Badge value={candidate.novelty} /></dd></div><div><dt>Evidence readiness</dt><dd><Badge value={candidate.evidence_readiness} /></dd></div><div><dt>Duplicate risk</dt><dd><Badge value={candidate.duplicate_risk} tone={candidate.duplicate_risk === "HIGH" ? "warn" : "neutral"} /></dd></div><div><dt>Owner priority</dt><dd><Badge value={candidate.owner_priority} /></dd></div></dl></section>
    <section className="question-compare"><div><h3>Closest existing RQ</h3>{candidate.closest_existing_rqs.length ? candidate.closest_existing_rqs.map((item) => <article key={item.id}><Link to={`/research/${encodeURIComponent(item.id)}`}><code>{item.id}</code> {item.topic}</Link><p>{item.overlap_state} · covered: {item.covered_dimensions.join("、") || "—"} · new: {item.new_dimensions.join("、") || "—"}</p></article>) : <Empty>沒有 closest existing RQ。</Empty>}</div>
      <div><h3>Closest existing DQ</h3>{candidate.closest_discovery_questions.length ? candidate.closest_discovery_questions.map((item) => <article key={item.id}><Link to={`/node/${encodeURIComponent(item.id)}`}><code>{item.id}</code> {item.topic}</Link><p>{item.overlap_state} · covered: {item.covered_dimensions.join("、") || "—"} · new: {item.new_dimensions.join("、") || "—"}</p></article>) : <Empty>沒有 closest existing DQ。</Empty>}</div></section>
    <section><h3>Gap basis</h3><dl className="question-gap"><div><dt>State</dt><dd>{candidate.gap_basis.state}</dd></div><div><dt>Originating gaps</dt><dd>{candidate.gap_basis.originating_gaps.join("、") || "無明示 formal gap"}</dd></div><div><dt>Evidence limitations</dt><dd>{candidate.gap_basis.evidence_limitations.join("；") || "沒有明示限制"}</dd></div><div><dt>Unresolved dimensions</dt><dd>{candidate.gap_basis.unresolved_dimensions.join("、") || "無"}</dd></div><div><dt>Why existing RQ does not close</dt><dd>{candidate.gap_basis.why_existing_rq_does_not_close}</dd></div></dl></section>
    <section><h3>Remaining uncertainty</h3>{candidate.uncertainty.length ? <ul>{candidate.uncertainty.map((item) => <li key={item}>{item}</li>)}</ul> : <Empty>沒有額外 uncertainty。</Empty>}</section>
    <section><h3>Evidence / Signal / Legacy separation</h3><div className="question-contexts"><article className="question-context question-context--evidence"><p>FORMAL EVIDENCE</p><h4>Formal Evidence</h4><ContextLinks ids={candidate.evidence_context.evidence_card_ids} snapshot={snapshot} empty="沒有明示 Formal Evidence。" /><small>Strongest level：{candidate.evidence_context.strongest_evidence_level}</small></article>
      <article className="question-context question-context--signals"><p>NOT EVIDENCE</p><h4>Signals</h4><ContextLinks ids={unique([...candidate.signal_context.practice_ids, ...candidate.signal_context.feedback_ids, ...candidate.signal_context.agent_reach_ids, ...candidate.signal_context.field_observation_ids])} snapshot={snapshot} empty="沒有明示 Signals。" /><small>Practice · Feedback · Agent-Reach · Field Observation</small></article>
      <article className="question-context question-context--legacy"><p>RELATED CONTENT ONLY</p><h4>Historical Content</h4><ContextLinks ids={candidate.legacy_context.article_ids} snapshot={snapshot} empty="沒有相關 Legacy Article。" /><small>Legacy Articles 不影響 Evidence sufficiency。</small></article></div></section>
    <section className="question-owner-gate"><div><p>OWNER GATE PREVIEW</p><strong>Read-only v0.1 — Owner Gate not connected</strong></div><div><button type="button" disabled>接受為候選</button><button type="button" disabled>保留觀察</button><button type="button" disabled>拒絕</button></div></section>
  </div>;
}

function ClusterRow({ cluster, candidate, selected }: { cluster: QuestionCluster; candidate?: RegeneratedQuestionCandidate; selected: boolean }) {
  return <Link className={`question-cluster-row ${selected ? "is-selected" : ""}`} to={`/question-lab?cluster=${encodeURIComponent(cluster.cluster_id)}`}><header><code>{cluster.cluster_id}</code><Badge value={candidate?.candidate_state ?? "NO RESULT"} /></header><p>{candidate?.regenerated_question ?? cluster.underlying_intent}</p><dl><div><dt>Raw</dt><dd>{cluster.raw_candidates.length}</dd></div><div><dt>Sources</dt><dd>{unique(cluster.raw_candidates.map((item) => item.source_class)).join(" · ")}</dd></div><div><dt>Overlap</dt><dd>{cluster.overlap_state}</dd></div><div><dt>RQ</dt><dd>{candidate?.closest_existing_rqs[0]?.id ?? "—"}</dd></div><div><dt>DQ</dt><dd>{candidate?.closest_discovery_questions[0]?.id ?? "—"}</dd></div><div><dt>Recommendation</dt><dd>{candidate?.recommendation ?? "INSUFFICIENT"}</dd></div></dl></Link>;
}

export function QuestionLab({ snapshot, askSession }: { snapshot: KdfSnapshot; askSession: AskAnalysisSession | null }) {
  const [searchParams] = useSearchParams();
  const model = useMemo(() => buildQuestionRegeneration(snapshot, askSession), [snapshot, askSession]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [selectedRaw, setSelectedRaw] = useState<string[]>([]);
  const [manual, setManual] = useState<ManualRegenerationResult | null>(null);
  const [validation, setValidation] = useState("");
  const requestedCluster = searchParams.get("cluster") || "";
  const source = searchParams.get("source") || "";
  const sourceRaw = source ? model.raw_candidates.find((raw) => raw.raw_candidate_id === source || raw.cross_relation_id === source || raw.origin_ids.includes(source)) : undefined;
  const sourceCluster = sourceRaw ? model.clusters.find((cluster) => cluster.raw_candidates.some((raw) => raw.raw_candidate_id === sourceRaw.raw_candidate_id)) : undefined;
  const selectedCluster = requestedCluster ? model.clusters.find((item) => item.cluster_id === requestedCluster) : sourceCluster ?? model.clusters[0];
  const selectedCandidate = selectedCluster ? candidateFor(model, selectedCluster) : undefined;
  const visible = model.clusters.filter((cluster) => { const candidate = candidateFor(model, cluster); return filter === "ALL" || (filter === "OWNER_REVIEW" ? Boolean(candidate?.owner_review_required && !["NO_NEW_RQ_NEEDED", "USE_EXISTING_DISCOVERY_QUESTION", "INSUFFICIENT_FOR_REGENERATION"].includes(candidate.recommendation)) : candidate?.recommendation === filter); });
  const toggle = (id: string) => { setManual(null); setValidation(""); setSelectedRaw((current) => current.includes(id) ? current.filter((item) => item !== id) : current.length >= 8 ? (setValidation("最多只能選擇 8 筆候選問題。"), current) : [...current, id]); };
  const regenerate = () => { const result = regenerateSelectedCandidates(snapshot, model.raw_candidates, selectedRaw); setManual(result); setValidation(result.status === "READY" ? "" : result.message); };
  return <div className="question-lab"><header className="question-lab-intro"><p>QUESTION REGENERATION · SESSION ONLY</p><h2>哪些問題值得我看？</h2><span>候選 clusters、reuse 建議與手動重整都只存在目前瀏覽器記憶體；不建立 RQ、不寫入 KDF。</span></header>
    <div className="question-summary"><span><b>{model.counts.clusters}</b> clusters</span><span><b>{model.counts.regenerated}</b> regenerated</span><span><b>{model.counts.possible_duplicates}</b> possible duplicates</span><span><b>{model.counts.no_new_rq_needed}</b> no new RQ</span><span><b>{model.counts.owner_review}</b> owner review</span></div>
    <nav className="question-filters" aria-label="Question cluster filters">{(["ALL", "NO_NEW_RQ_NEEDED", "USE_EXISTING_DISCOVERY_QUESTION", "OWNER_REVIEW"] as Filter[]).map((value) => <button type="button" className={filter === value ? "is-active" : ""} onClick={() => setFilter(value)} key={value}>{value === "ALL" ? "全部" : value === "OWNER_REVIEW" ? "Needs Owner Review" : value}</button>)}</nav>
    {!model.clusters.length ? <Empty>目前沒有 candidate clusters；未建立替代資料。</Empty> : <div className="question-layout"><aside className="question-cluster-list">{visible.length ? visible.map((cluster) => <ClusterRow key={cluster.cluster_id} cluster={cluster} candidate={candidateFor(model, cluster)} selected={cluster.cluster_id === selectedCluster?.cluster_id} />) : <Empty>這個篩選條件沒有 clusters。</Empty>}</aside><main>{requestedCluster && !selectedCluster ? <div className="question-safe-state"><p>SAFE NOT FOUND</p><h3>Cluster ID 不存在</h3><span>未進行模糊替換；請從左側選擇既有 cluster。</span></div> : <CandidateDetail candidate={selectedCandidate} cluster={selectedCluster} snapshot={snapshot} askSession={askSession} />}</main></div>}
    <section className="question-manual"><header><div><p>MANUAL REGENERATION · REACT MEMORY ONLY</p><h2>選擇 2–8 筆 raw candidates</h2></div><span>已選 {selectedRaw.length} / 8</span></header><div className="question-manual-list">{model.raw_candidates.map((raw) => <label key={raw.raw_candidate_id} className={selectedRaw.includes(raw.raw_candidate_id) ? "is-selected" : ""}><input type="checkbox" checked={selectedRaw.includes(raw.raw_candidate_id)} onChange={() => toggle(raw.raw_candidate_id)} /><span><code>{raw.raw_candidate_id}</code><b>{raw.source_class}</b><em>{raw.original_question}</em></span></label>)}</div><div className="question-manual-actions"><button type="button" onClick={regenerate}>重新整理成研究問題</button><button type="button" className="is-secondary" onClick={() => { setSelectedRaw([]); setManual(null); setValidation(""); }}>清除本次選取</button><span>重新整理頁面會清除本區結果。</span></div>{validation && <p className="question-validation" role="alert">{validation}</p>}{manual?.status === "READY" && manual.result && <CandidateDetail candidate={manual.result} snapshot={snapshot} askSession={askSession} manual />}</section>
  </div>;
}
