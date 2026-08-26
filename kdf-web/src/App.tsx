import { useCallback, useEffect, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { Badge, Empty, ReviewBadge, Section, routeForCard } from "./components";
import { ArticleDetail, EvidenceDetail, FeedbackDetail, NodeDetail, NotFound, ResearchDetail, ReviewDetail } from "./details";
import { GraphView } from "./relationship-ui";
import { MandalaIndex, MandalaView } from "./mandala-ui";
import { SearchPalette } from "./search-palette";
import { AskSessionMandala, AskWorkbench } from "./ask-ui";
import type { AskAnalysisSession } from "./ask-engine";
import { DiscoveryLab } from "./discovery-lab";
import type { DiscoveryGraphOverlay } from "./cross-node-engine";
import type { IntakeCandidate, IntakeSummary, KdfCard, KdfSnapshot, NavKey } from "./types";

const pages: Array<{ key: NavKey; label: string; eyebrow: string; path: string }> = [
  { key: "dashboard", label: "總覽", eyebrow: "DASHBOARD", path: "/" },
  { key: "ask", label: "Ask KDF", eyebrow: "ASK KDF WORKBENCH", path: "/ask" },
  { key: "discovery", label: "Discovery Lab", eyebrow: "CROSS-NODE DISCOVERY", path: "/discovery-lab" },
  { key: "research", label: "研究問題", eyebrow: "RESEARCH QUESTIONS", path: "/research" },
  { key: "mandala", label: "曼陀羅", eyebrow: "MANDALA THINKING", path: "/mandala" },
  { key: "evidence", label: "證據", eyebrow: "EVIDENCE", path: "/evidence" },
  { key: "articles", label: "內容", eyebrow: "ARTICLES / CONTENT", path: "/articles" },
  { key: "feedback", label: "回饋", eyebrow: "FEEDBACK", path: "/feedback" },
  { key: "review", label: "審查佇列", eyebrow: "REVIEW QUEUE", path: "/review" },
];

function currentPage(pathname: string) {
  if (pathname.startsWith("/ask")) return pages.find((page) => page.key === "ask")!;
  if (pathname.startsWith("/discovery-lab")) return pages.find((page) => page.key === "discovery")!;
  if (pathname.startsWith("/research")) return pages.find((page) => page.key === "research")!;
  if (pathname.startsWith("/mandala")) return pages.find((page) => page.key === "mandala")!;
  if (pathname.startsWith("/evidence")) return pages.find((page) => page.key === "evidence")!;
  if (pathname.startsWith("/article")) return pages.find((page) => page.key === "articles")!;
  if (pathname.startsWith("/feedback")) return pages.find((page) => page.key === "feedback")!;
  if (pathname.startsWith("/review")) return pages.find((page) => page.key === "review")!;
  if (pathname.startsWith("/graph")) return { ...pages[0], label: "Graph", eyebrow: "GRAPH CONTEXT" };
  if (pathname.startsWith("/node")) return { ...pages[0], label: "KDF Node", eyebrow: "FORMAL KDF NODE" };
  return pages[0];
}

function Metric({ label, value, note, warn }: { label: string; value: number | string; note: string; warn?: boolean }) {
  return <article className={`metric ${warn ? "metric--warn" : ""}`}><p>{label}</p><strong>{value}</strong><small>{note}</small></article>;
}

function Dashboard({ snapshot }: { snapshot: KdfSnapshot }) {
  const { formal, intake, integrity } = snapshot;
  const pending = intake.agent_reach.pending_count + intake.social_feedback.pending_count;
  const ownerReviews = formal.actionable_owner_review.length + pending;
  return <>
    <div className="metrics">
      <Metric label="正式 KDF artifacts" value={integrity.artifact_count} note="兩個 formal roots" />
      <Metric label="Active Research Questions" value={formal.research_questions.length} note="正式 research-question" />
      <Metric label="Evidence count" value={formal.evidence_cards.length} note="僅 evidence-card" />
      <Metric label="Open gaps" value={formal.open_gaps.length} note={`核心 layer ${formal.open_core_gap_count}`} warn={formal.open_gaps.length > 0} />
      <Metric label="Discovery Questions" value={formal.discovery_questions.length} note="候選研究方向" />
      <Metric label="Pending feedback" value={pending} note="Agent-Reach + Social" warn={pending > 0} />
      <Metric label="Owner review count" value={ownerReviews} note="正式項目 + staging" warn={ownerReviews > 0} />
      <Metric label="Integrity status" value={integrity.validation_passed ? "PASS" : "FAIL"} note={`${integrity.errors.length} errors / ${integrity.warnings.length} warnings`} warn={!integrity.validation_passed} />
    </div>
    <div className="dashboard-grid">
      <Section title="目前研究焦點" note="點擊 ID 或題目進入 detail">
        <ul className="compact-list">{formal.research_questions.map((card) => <li key={card.id}>
          <Link className="id-link" to={routeForCard(card)}><code>{card.id}</code></Link>
          <Link className="title-link" to={routeForCard(card)}>{card.topic}</Link><Badge value={card.status} />
        </li>)}</ul>
      </Section>
      <Section title="完整性快照" note="side-effect-free snapshot verifier"><dl className="facts">
        <div><dt>Wikilinks</dt><dd>{integrity.wikilink_count}</dd></div>
        <div><dt>Concurrent mutation</dt><dd>{integrity.concurrent_mutation.detected ? "DETECTED" : "NO"}</dd></div>
        <div><dt>Digest</dt><dd><code title={integrity.snapshot_sha256}>{integrity.snapshot_sha256.slice(0, 16)}…</code></dd></div>
        <div><dt>Builder</dt><dd>{snapshot.builder_version}</dd></div>
      </dl></Section>
    </div>
  </>;
}

function CardTable({ cards, kind }: { cards: KdfCard[]; kind: "research" | "evidence" }) {
  if (!cards.length) return <Empty>目前沒有符合此類型的正式卡片。</Empty>;
  return <div className="table-wrap"><table><thead><tr>
    <th>ID</th><th>題目</th><th>{kind === "evidence" ? "Parent RQ" : "狀態"}</th><th>Evidence level</th><th>Gap</th>{kind === "research" && <th>Human review</th>}
  </tr></thead><tbody>{cards.map((card) => <tr key={card.id}>
    <td><Link className="id-link" to={routeForCard(card)}><code>{card.id}</code></Link></td>
    <td className="topic-cell"><Link className="title-link" to={routeForCard(card)}>{card.topic}</Link></td>
    <td>{kind === "evidence" ? <Link className="id-link" to={`/research/${encodeURIComponent(card.parent)}`}><code>{card.parent || "—"}</code></Link> : <Badge value={card.status} />}</td>
    <td><Badge value={card.evidence_level} tone={card.evidence_level ? "good" : "neutral"} /></td>
    <td><Badge value={card.gap_status} tone={card.gap_status === "open" ? "warn" : "neutral"} /></td>
    {kind === "research" && <td><ReviewBadge value={card.human_review} /></td>}
  </tr>)}</tbody></table></div>;
}

function ResearchList({ snapshot }: { snapshot: KdfSnapshot }) {
  return <Section title="Research Questions" note="點擊 ID 或題目開啟正式關係 detail"><CardTable cards={snapshot.formal.research_questions} kind="research" /></Section>;
}

function EvidenceList({ snapshot }: { snapshot: KdfSnapshot }) {
  return <><div className="notice">只列正式 Evidence Card；Practice、Field Observation 與 Uncle Lens 不會被歸類為 Evidence。</div><Section title="Evidence Cards" note="點擊查看來源、findings、limitations 與既有關係"><CardTable cards={snapshot.formal.evidence_cards} kind="evidence" /></Section></>;
}

function ArticleList({ snapshot }: { snapshot: KdfSnapshot }) {
  type Filter = "all" | "legacy" | "kdf" | "linked" | "unlinked" | "provenance" | "missing-provenance" | "review";
  const [filter, setFilter] = useState<Filter>("all");
  const legacy = snapshot.content.legacy_blog.articles;
  const current = snapshot.formal.related_content;
  const legacyPredicate = (article: (typeof legacy)[number]) => {
    if (filter === "kdf") return false;
    if (filter === "linked") return article.kdf_candidates.some((item) => item.classification === "EXPLICIT_LINK");
    if (filter === "unlinked") return !article.kdf_candidates.some((item) => item.classification === "EXPLICIT_LINK");
    if (filter === "provenance") return article.evidence_provenance.status === "PROVENANCE_CONFIRMED";
    if (filter === "missing-provenance") return article.evidence_provenance.status !== "PROVENANCE_CONFIRMED";
    if (filter === "review") return !["CURRENT_UNKNOWN", "NO_ACTION"].includes(article.freshness.state);
    return true;
  };
  const currentPredicate = (card: KdfCard) => {
    if (filter === "legacy" || filter === "unlinked" || filter === "missing-provenance") return false;
    if (filter === "provenance") return card.sources.length > 0 || card.related.some((id) => id.startsWith("EVC-"));
    if (filter === "review") return card.human_review === "pending";
    return true;
  };
  const visibleLegacy = legacy.filter(legacyPredicate);
  const visibleCurrent = current.filter(currentPredicate);
  const filters: Array<[Filter, string]> = [
    ["all", "全部"], ["legacy", "既有部落格"], ["kdf", "KDF 產出"], ["linked", "已連結 KDF"], ["unlinked", "未連結 KDF"],
    ["provenance", "有 Evidence provenance"], ["missing-provenance", "缺 Evidence provenance"], ["review", "待 Review"],
  ];
  return <><div className="notice"><strong>Content ≠ Evidence</strong>。Legacy corpus 是原始 Markdown 的即時唯讀投影；candidate matching 不會寫回 KDF。</div>
    <div className="article-summary"><span><b>{legacy.length}</b> Legacy Blog Articles</span><span><b>{current.length}</b> KDF Content</span>
      <span><b>{snapshot.content.legacy_blog.explicit_kdf_link_count}</b> explicit legacy links</span><span><b>{snapshot.content.legacy_blog.possible_kdf_match_count}</b> possible-match articles</span></div>
    <nav className="article-filters" aria-label="Articles filters">{filters.map(([value, label]) => <button type="button" className={filter === value ? "is-active" : ""} onClick={() => setFilter(value)} key={value}>{label}</button>)}</nav>
    <Section title="Articles / Content" note={`顯示 ${visibleCurrent.length + visibleLegacy.length} 筆；Legacy 與 KDF 產出保持不同層級`}>
      {visibleCurrent.length + visibleLegacy.length ? <div className="article-groups">
        {visibleCurrent.length > 0 && <div><h3>KDF 產出</h3><div className="candidate-list">{visibleCurrent.map((card) => <Link className="candidate-row" to={routeForCard(card)} key={card.id}>
          <div><code>{card.id}</code><strong>KDF CONTENT · {card.type}</strong><p>{card.topic}</p></div>
          <div className="candidate-row__state"><Badge value={card.status} /><ReviewBadge value={card.human_review} /><span>查看 →</span></div>
        </Link>)}</div></div>}
        {visibleLegacy.length > 0 && <div><h3>既有部落格 · LEGACY_CONTENT</h3><div className="candidate-list">{visibleLegacy.map((article) => <Link className="candidate-row legacy-row" to={`/article/${encodeURIComponent(article.id)}`} key={article.id}>
          <div><code>{article.id}</code><strong>LEGACY_CONTENT · {article.publication_date || "日期未記錄"}</strong><p>{article.title}</p>
            <small>{article.source_url ? "公開 URL 已記錄" : "公開 URL 未記錄"} · {article.evidence_provenance.status}</small></div>
          <div className="candidate-row__state"><Badge value={article.kdf_candidates.some((item) => item.classification === "EXPLICIT_LINK") ? "EXPLICIT KDF" : article.kdf_candidates.length ? "KDF CANDIDATE" : "NO KDF LINK"} tone={article.kdf_candidates.length ? "warn" : "neutral"} />
            <Badge value={article.freshness.state} /><span>閱讀 →</span></div>
        </Link>)}</div></div>}
      </div> : <Empty>目前篩選條件下沒有內容。</Empty>}
    </Section>
  </>;
}

function FeedbackSummary({ title, data }: { title: string; data: IntakeSummary }) {
  return <article className="feedback-card"><header><div><p>{data.source_class}</p><h3>{title}</h3></div><strong>{data.candidate_count}</strong></header>
    <div className="feedback-stats"><span>Pending <b>{data.pending_count}</b></span><span>Approved <b>{data.approved_count}</b></span><span>Closed <b>{data.closed_count}</b></span></div>
    <div className="recommendations">{Object.entries(data.recommendations).map(([name, count]) => <Badge key={name} value={`${name} ${count}`} />)}</div>
  </article>;
}

function CandidateRows({ candidates }: { candidates: IntakeCandidate[] }) {
  return <div className="candidate-list">{candidates.map((candidate) => <Link className="candidate-row" to={`/feedback/${encodeURIComponent(candidate.id)}`} key={candidate.id}>
    <div><code>{candidate.id}</code><strong>{candidate.feedback_type}</strong><p>{candidate.normalized_summary}</p></div>
    <div className="candidate-row__state"><ReviewBadge value={candidate.owner_review_status} /><Badge value={candidate.intake_state} /><span>查看 →</span></div>
  </Link>)}</div>;
}

function FeedbackList({ snapshot }: { snapshot: KdfSnapshot }) {
  return <>
    <div className="privacy-notice"><strong>Privacy-safe list</strong><span>列表與 detail 僅讀取 whitelist projection；不傳送 original text、PII、username、private locator 或 session data。</span></div>
    <div className="feedback-grid"><FeedbackSummary title="Agent-Reach Discovery" data={snapshot.intake.agent_reach} /><FeedbackSummary title="Social Feedback" data={snapshot.intake.social_feedback} /></div>
    <Section title="Agent-Reach Intake Items" note="公開 discovery staging / ledger"><CandidateRows candidates={snapshot.intake.agent_reach.candidates} /></Section>
    <Section title="Social Feedback Items" note="normalized / redacted summaries only"><CandidateRows candidates={snapshot.intake.social_feedback.candidates} /></Section>
  </>;
}

function ReviewQueue({ snapshot }: { snapshot: KdfSnapshot }) {
  const pendingCandidates = [...snapshot.intake.agent_reach.candidates, ...snapshot.intake.social_feedback.candidates].filter((item) => item.owner_review_status === "PENDING");
  return <div className="review-grid">
    <Section title="正式 KDF Owner Review" note="點擊查看等待原因與既有關係">
      {snapshot.formal.actionable_owner_review.length ? <ul className="review-list">{snapshot.formal.actionable_owner_review.map((card) => <li key={card.id}>
        <Link className="id-link" to={`/review/${encodeURIComponent(card.id)}`}><code>{card.id}</code></Link>
        <Link className="title-link" to={`/review/${encodeURIComponent(card.id)}`}>{card.topic}</Link><ReviewBadge value={card.human_review} />
      </li>)}</ul> : <Empty>目前沒有 actionable formal review。</Empty>}
    </Section>
    <Section title="Staging Owner Review" note="仍然不會自動 promotion">
      {pendingCandidates.length ? <ul className="review-list review-list--staging">{pendingCandidates.map((candidate) => <li key={candidate.id}>
        <Link className="id-link" to={`/review/${encodeURIComponent(candidate.id)}`}><code>{candidate.id}</code></Link>
        <Link className="title-link" to={`/review/${encodeURIComponent(candidate.id)}`}>{candidate.feedback_type}</Link><ReviewBadge value="PENDING" />
      </li>)}</ul> : <Empty>目前沒有 staging owner review。</Empty>}
    </Section>
    <Section title="結構性 pending" note="狀態索引，不等同立即審查"><div className="structural-count">{snapshot.formal.structural_pending_count}</div></Section>
  </div>;
}

function ConsoleRoutes({ snapshot, askSession, graphOverlay, onAskSession, onGraph }: { snapshot: KdfSnapshot; askSession: AskAnalysisSession | null; graphOverlay: DiscoveryGraphOverlay | null; onAskSession(value: AskAnalysisSession): void; onGraph(value: DiscoveryGraphOverlay): void }) {
  return <Routes>
    <Route path="/" element={<Dashboard snapshot={snapshot} />} />
    <Route path="/ask" element={<AskWorkbench snapshot={snapshot} session={askSession} onSession={onAskSession} />} />
    <Route path="/ask/mandala" element={<AskSessionMandala snapshot={snapshot} session={askSession} />} />
    <Route path="/discovery-lab" element={<DiscoveryLab snapshot={snapshot} onGraph={onGraph} />} />
    <Route path="/research" element={<ResearchList snapshot={snapshot} />} />
    <Route path="/research/:id" element={<ResearchDetail snapshot={snapshot} />} />
    <Route path="/mandala" element={<MandalaIndex snapshot={snapshot} />} />
    <Route path="/mandala/:id" element={<MandalaView snapshot={snapshot} />} />
    <Route path="/mandala/:id/:dimensionId" element={<MandalaView snapshot={snapshot} />} />
    <Route path="/evidence" element={<EvidenceList snapshot={snapshot} />} />
    <Route path="/evidence/:id" element={<EvidenceDetail snapshot={snapshot} />} />
    <Route path="/articles" element={<ArticleList snapshot={snapshot} />} />
    <Route path="/article/:id" element={<ArticleDetail snapshot={snapshot} />} />
    <Route path="/feedback" element={<FeedbackList snapshot={snapshot} />} />
    <Route path="/feedback/:id" element={<FeedbackDetail snapshot={snapshot} />} />
    <Route path="/review" element={<ReviewQueue snapshot={snapshot} />} />
    <Route path="/review/:id" element={<ReviewDetail snapshot={snapshot} />} />
    <Route path="/node/:id" element={<NodeDetail snapshot={snapshot} />} />
    <Route path="/graph/:id" element={<GraphView snapshot={snapshot} candidateOverlay={graphOverlay} />} />
    <Route path="*" element={<NotFound />} />
  </Routes>;
}

export default function App() {
  const location = useLocation();
  const selected = currentPage(location.pathname);
  const [snapshot, setSnapshot] = useState<KdfSnapshot | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [askSession, setAskSession] = useState<AskAnalysisSession | null>(null);
  const [graphOverlay, setGraphOverlay] = useState<DiscoveryGraphOverlay | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/kdf/snapshot", { method: "GET", cache: "no-store" });
      if (!response.ok) throw new Error(`Snapshot API ${response.status}`);
      setSnapshot(await response.json() as KdfSnapshot);
    } catch (cause) { setError(cause instanceof Error ? cause.message : String(cause)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  return <div className="shell"><aside className="sidebar">
    <Link to="/" className="brand"><span>KDF</span><div><strong>研究工作台</strong><small>LOCAL · READ ONLY</small></div></Link>
    <nav aria-label="主選單">{pages.map((item, index) => <NavLink key={item.key} to={item.path} end={item.path === "/"}><em>0{index + 1}</em>{item.label}</NavLink>)}</nav>
    <div className="sidebar__foot"><span className={`dot ${snapshot?.integrity.validation_passed ? "dot--good" : ""}`} />{snapshot?.integrity.validation_passed ? "Formal integrity PASS" : "等待快照"}</div>
  </aside><main><header className="topbar"><div><p>{selected.eyebrow}</p><h1>{selected.label}</h1></div>
    <div className="topbar__actions">{snapshot && <SearchPalette snapshot={snapshot} />}<span>{snapshot ? new Date(snapshot.generated_at).toLocaleString("zh-TW") : "尚未載入"}</span><button type="button" onClick={() => void load()} disabled={loading}>{loading ? "讀取中" : "重新整理"}</button></div>
  </header><div className="content">
    {loading && !snapshot && <div className="state"><span className="loader" />正在建立唯讀 KDF 快照…</div>}
    {error && <div className="state state--error"><strong>無法讀取 KDF</strong><span>{error}</span><button type="button" onClick={() => void load()}>重試</button></div>}
    {snapshot && <ConsoleRoutes snapshot={snapshot} askSession={askSession} graphOverlay={graphOverlay} onAskSession={setAskSession} onGraph={setGraphOverlay} />}
  </div></main></div>;
}
