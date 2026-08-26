import { Link, useParams } from "react-router-dom";
import {
  BackButton, Badge, Breadcrumbs, DefinitionGrid, DetailHeader, Empty,
  MarkdownText, NodeLink, NodeLinks, ReviewBadge, Section,
} from "./components";
import { RelationshipTools } from "./relationship-ui";
import { relationshipsFor } from "./relationships";
import { findMandalaTemplate } from "./mandala-templates";
import { LegacyArticleBody, RelatedLegacyArticles, legacyArticleById } from "./legacy-content";
import type { DetailSection, IntakeCandidate, KdfCard, KdfSnapshot, LegacyArticle } from "./types";

function findCard(snapshot: KdfSnapshot, id?: string) {
  return snapshot.formal.cards.find((card) => card.id === id);
}

function allCandidates(snapshot: KdfSnapshot) {
  return [...snapshot.intake.agent_reach.candidates, ...snapshot.intake.social_feedback.candidates];
}

function explicitRelated(card: KdfCard, snapshot: KdfSnapshot) {
  const direct = new Set([
    card.root_topic, card.parent, card.research_question,
    ...card.related, ...card.origin_cards, ...card.wikilinks, ...card.backlinks,
  ].filter(Boolean));
  for (const candidate of snapshot.formal.cards) {
    const reverse = [candidate.parent, candidate.research_question, ...candidate.related, ...candidate.wikilinks, ...candidate.origin_cards];
    if (reverse.includes(card.id)) direct.add(candidate.id);
  }
  direct.delete(card.id);
  return snapshot.formal.cards.filter((candidate) => direct.has(candidate.id));
}

function sections(card: KdfCard, names: string[]) {
  const wanted = names.map((name) => name.toLowerCase());
  return card.detail_sections.filter((section) => wanted.includes(section.heading.toLowerCase()));
}

function SectionContent({ values, empty }: { values: DetailSection[]; empty: string }) {
  if (!values.length) return <Empty>{empty}</Empty>;
  return <div className="section-stack">{values.map((section) => <article key={section.heading}><h3>{section.heading}</h3><MarkdownText content={section.content} /></article>)}</div>;
}

function SourceList({ sources, snapshot }: { sources: string[]; snapshot: KdfSnapshot }) {
  if (!sources.length) return <Empty>此卡沒有既有 source 關係。</Empty>;
  return <ul className="source-list">{sources.map((source) => <li key={source}>
    {/^https?:\/\//iu.test(source)
      ? <a href={source} target="_blank" rel="noreferrer">{source}</a>
      : <NodeLink id={source} snapshot={snapshot} />}
  </li>)}</ul>;
}

function DetailFrame({ back, crumbs, children }: { back: string; crumbs: Array<{ label: string; to?: string }>; children: React.ReactNode }) {
  return <><div className="detail-nav"><BackButton fallback={back} /><Breadcrumbs items={crumbs} /></div>{children}</>;
}

export function ResearchDetail({ snapshot }: { snapshot: KdfSnapshot }) {
  const { id } = useParams();
  const card = findCard(snapshot, id);
  if (!card || card.type !== "research-question") return <NotFound kind="Research Question" fallback="/research" />;
  const related = explicitRelated(card, snapshot);
  const mandalaEligible = Boolean(findMandalaTemplate(card.root_topic));
  const typed = (type: string) => related.filter((item) => item.type === type).map((item) => item.id);
  return <DetailFrame back="/research" crumbs={[{ label: "Dashboard", to: "/" }, { label: "Research", to: "/research" }, { label: card.id }] }>
    <DetailHeader kicker="RESEARCH QUESTION" id={card.id} title={card.topic}>
      <Badge value={card.status} /><Badge value={card.gap_status} tone={card.gap_status === "open" ? "warn" : "neutral"} />
    </DetailHeader>
    <RelationshipTools currentId={card.id} snapshot={snapshot} fullChain />
    {mandalaEligible && <div className="mandala-entry"><div><b>THINKING EXTENSION</b><span>以現有 KDF context 開啟 1 → 8 → 64 的唯讀思考空間。</span></div><Link to={`/mandala/${encodeURIComponent(card.id)}`}>曼陀羅思考 →</Link></div>}
    <div className="detail-grid">
      <Section title="研究定位"><DefinitionGrid rows={[
        ["Root Topic", card.root_topic ? <NodeLink id={card.root_topic} snapshot={snapshot} /> : "—"],
        ["Mother Topic", card.parent ? <NodeLink id={card.parent} snapshot={snapshot} /> : "—"],
        ["Status", <Badge value={card.status} />],
        ["Evidence Level", <Badge value={card.evidence_level} tone={card.evidence_level ? "good" : "neutral"} />],
        ["Gap Status", <Badge value={card.gap_status} tone={card.gap_status === "open" ? "warn" : "neutral"} />],
        ["Human Review", <ReviewBadge value={card.human_review} />],
      ]} /></Section>
      <Section title="Sources" note="只呈現卡片既有 source 欄位"><SourceList sources={card.sources} snapshot={snapshot} /></Section>
    </div>
    <div className="relation-grid">
      <Section title="Related Evidence"><NodeLinks ids={typed("evidence-card")} snapshot={snapshot} /></Section>
      <Section title="Mature Knowledge"><NodeLinks ids={typed("mature-knowledge")} snapshot={snapshot} /></Section>
      <Section title="Practice Card"><NodeLinks ids={typed("practice-card")} snapshot={snapshot} /></Section>
      <Section title="Field Observation"><NodeLinks ids={typed("field-observation")} snapshot={snapshot} /></Section>
      <Section title="Uncle Lens"><NodeLinks ids={typed("uncle-lens")} snapshot={snapshot} /></Section>
      <Section title="Discovery Questions"><NodeLinks ids={typed("discovery-question")} snapshot={snapshot} /></Section>
    </div>
    <Section title="既有 Wikilinks / Relationships" note="雙向列出明示 wikilink、parent、related、origin 與 backlinks；不推論新關係"><NodeLinks ids={related.map((item) => item.id)} snapshot={snapshot} /></Section>
    <RelatedLegacyArticles card={card} snapshot={snapshot} />
  </DetailFrame>;
}

export function EvidenceDetail({ snapshot }: { snapshot: KdfSnapshot }) {
  const { id } = useParams();
  const card = findCard(snapshot, id);
  if (!card || card.type !== "evidence-card") return <NotFound kind="Evidence Card" fallback="/evidence" />;
  const findings = sections(card, ["What We Know", "What Can Be Concluded", "Evidence Strength"]);
  const limits = sections(card, ["What We Do Not Know", "What Cannot Be Concluded"]);
  const conflicts = sections(card, ["Conflicting or Condition-Dependent Evidence"]);
  const related = explicitRelated(card, snapshot);
  return <DetailFrame back="/evidence" crumbs={[{ label: "Dashboard", to: "/" }, { label: "Evidence", to: "/evidence" }, { label: card.id }] }>
    <DetailHeader kicker="EVIDENCE CARD" id={card.id} title={card.topic}>
      <Badge value={card.evidence_level} tone="good" /><ReviewBadge value={card.human_review} />
    </DetailHeader>
    <RelationshipTools currentId={card.id} snapshot={snapshot} />
    <div className="detail-grid">
      <Section title="Evidence 定位"><DefinitionGrid rows={[
        ["Parent Research Question", card.parent ? <NodeLink id={card.parent} snapshot={snapshot} /> : "—"],
        ["Evidence Level", <Badge value={card.evidence_level} tone="good" />],
        ["Gap Status", <Badge value={card.gap_status} tone={card.gap_status === "open" ? "warn" : "neutral"} />],
        ["Human Review", <ReviewBadge value={card.human_review} />],
        ["Conflicting Evidence", card.conflicting_evidence === null ? "—" : card.conflicting_evidence ? "YES — condition-dependent" : "NO"],
        ["Search Date", card.search_date || "—"],
      ]} /></Section>
      <Section title="Study / Source Information"><SourceList sources={card.sources} snapshot={snapshot} /></Section>
    </div>
    <Section title="Study Designs / Search Strategy"><DefinitionGrid rows={[["Study designs", card.study_designs.join("；") || "—"], ["Search strategy", card.search_strategy || "—"]]} /></Section>
    <div className="detail-grid detail-grid--equal">
      <Section title="Known Findings"><SectionContent values={findings} empty="此卡沒有對應的既有 findings section。" /></Section>
      <Section title="Limitations"><SectionContent values={limits} empty="此卡沒有對應的既有 limitations section。" /></Section>
    </div>
    <Section title="Conflicting Evidence"><SectionContent values={conflicts} empty="此卡沒有既有 conflicting-evidence 說明。" /></Section>
    <Section title="Related Mature Knowledge / Practice" note="只顯示已明示連結；Practice、FOC、ULC 不會被列為 Evidence"><NodeLinks ids={related.filter((item) => ["mature-knowledge", "practice-card", "field-observation", "uncle-lens"].includes(item.type)).map((item) => item.id)} snapshot={snapshot} /></Section>
    <RelatedLegacyArticles card={card} snapshot={snapshot} />
  </DetailFrame>;
}

function ProvenanceDetails({ article, snapshot }: { article: LegacyArticle; snapshot: KdfSnapshot }) {
  const citations = [
    ...article.evidence_provenance.citation_urls,
    ...article.evidence_provenance.identifiers,
    ...article.evidence_provenance.reference_lines,
  ];
  return <><DefinitionGrid rows={[
    ["Status", <Badge value={article.evidence_provenance.status} tone={article.evidence_provenance.status === "PROVENANCE_CONFIRMED" ? "good" : "neutral"} />],
    ["Formal Evidence matches", article.evidence_provenance.evidence_ids.length ? <NodeLinks ids={article.evidence_provenance.evidence_ids} snapshot={snapshot} /> : "0"],
  ]} />
    {citations.length ? <ul className="source-list">{citations.map((value) => <li key={value}>{/^https?:\/\//iu.test(value) ? <a href={value} target="_blank" rel="noreferrer">{value}</a> : value}</li>)}</ul> : <Empty>原始 article record 沒有可追溯 citation projection。</Empty>}
  </>;
}

function ConfirmedArticleChains({ article, snapshot }: { article: LegacyArticle; snapshot: KdfSnapshot }) {
  const chains = article.evidence_provenance.evidence_ids.flatMap((evidenceId) => {
    const evidence = findCard(snapshot, evidenceId);
    const rq = evidence?.parent ? findCard(snapshot, evidence.parent) : undefined;
    const mother = rq?.parent ? findCard(snapshot, rq.parent) : undefined;
    const root = rq?.root_topic ? findCard(snapshot, rq.root_topic) : undefined;
    return evidence && rq && mother && root ? [{ evidence, rq, mother, root }] : [];
  });
  if (!chains.length) return <Empty>沒有 explicit Evidence provenance，因此不顯示 Root → Mother → RQ → Evidence → Article 完整鏈。</Empty>;
  return <div className="legacy-chain-list">{chains.map(({ root, mother, rq, evidence }) => <div key={evidence.id}>
    <NodeLink id={root.id} snapshot={snapshot} /><i>→</i><NodeLink id={mother.id} snapshot={snapshot} /><i>→</i>
    <NodeLink id={rq.id} snapshot={snapshot} /><i>→</i><NodeLink id={evidence.id} snapshot={snapshot} /><i>→</i><code>{article.id}</code>
  </div>)}</div>;
}

function LegacyArticleDetail({ article, snapshot }: { article: LegacyArticle; snapshot: KdfSnapshot }) {
  const explicit = article.kdf_candidates.filter((item) => item.classification === "EXPLICIT_LINK");
  const possible = article.kdf_candidates.filter((item) => item.classification !== "EXPLICIT_LINK");
  const candidateRows = (values: typeof article.kdf_candidates) => values.length ? <div className="legacy-candidate-list">{values.map((candidate) => <article key={candidate.kdf_id}>
    <NodeLink id={candidate.kdf_id} snapshot={snapshot} /><Badge value={candidate.classification} tone={candidate.classification === "EXPLICIT_LINK" ? "good" : "warn"} />
    <p>{candidate.basis}</p>{candidate.matched_terms.length > 0 && <small>Matched：{candidate.matched_terms.join("、")}</small>}
  </article>)}</div> : <Empty>目前沒有此類 KDF relation。</Empty>;
  return <DetailFrame back="/articles" crumbs={[{ label: "Dashboard", to: "/" }, { label: "Articles", to: "/articles" }, { label: article.id }] }>
    <DetailHeader kicker="LEGACY BLOG ARTICLE" id={article.id} title={article.title}>
      <Badge value="LEGACY_CONTENT" /><Badge value={article.freshness.state} tone={article.freshness.state === "NO_ACTION" ? "good" : article.freshness.state === "CURRENT_UNKNOWN" ? "neutral" : "warn"} />
    </DetailHeader>
    <div className="content-not-evidence"><strong>This article is content, not Evidence.</strong><span>文章文字與 topic matching 不會提高 evidence level，也不建立 formal relation。</span></div>
    <div className="detail-grid">
      <Section title="Article Metadata"><DefinitionGrid rows={[
        ["Publication date", article.publication_date || "未記錄"], ["Source", article.source_label],
        ["Original URL", article.source_url ? <a href={article.source_url} target="_blank" rel="noreferrer">{article.source_url}</a> : "未記錄完整公開 URL"],
        ["Recorded URL value", article.recorded_url || "—"], ["Body availability", <Badge value={article.body_availability} />],
        ["Content type", <Badge value={article.content_type} />],
      ]} /></Section>
      <Section title="Freshness / Review"><DefinitionGrid rows={[["State", <Badge value={article.freshness.state} />], ["Metadata warnings", article.metadata_warnings.join("；") || "—"]]} />
        <ul className="source-list">{article.freshness.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></Section>
    </div>
    <Section title="這篇文章可能屬於 KDF 哪裡？" note="Explicit 與 candidate 分開；candidate 僅存在 Web snapshot 記憶體中。">
      <div className="legacy-related-grid"><article><h3>Explicit links</h3>{candidateRows(explicit)}</article><article><h3>Candidate matches</h3>{candidateRows(possible)}</article></div>
    </Section>
    <Section title="Supported KDF Chain" note="只有 explicit Evidence provenance 才顯示完整鏈。"><ConfirmedArticleChains article={article} snapshot={snapshot} /></Section>
    <div className="relation-grid">
      <Section title="Related Research Questions"><NodeLinks ids={article.related_research_question_ids} snapshot={snapshot} /></Section>
      <Section title="Evidence Provenance"><ProvenanceDetails article={article} snapshot={snapshot} /></Section>
      <Section title="Related Gaps"><NodeLinks ids={article.related_gap_ids} snapshot={snapshot} /></Section>
      <Section title="Discovery Questions"><NodeLinks ids={article.related_discovery_question_ids} snapshot={snapshot} /></Section>
    </div>
    <Section title={article.body_availability === "SUMMARY_ONLY" ? "Archived Summary / Available Content" : "Full Readable Article Body"} note="安全文字投影；script、style 與 iframe 不會在瀏覽器執行。"><LegacyArticleBody article={article} /></Section>
  </DetailFrame>;
}

export function ArticleDetail({ snapshot }: { snapshot: KdfSnapshot }) {
  const { id } = useParams();
  const card = findCard(snapshot, id);
  const legacy = legacyArticleById(snapshot, id);
  if (legacy) return <LegacyArticleDetail article={legacy} snapshot={snapshot} />;
  if (!card || card.type !== "content-draft") return <NotFound kind="Article / Content" fallback="/articles" />;
  const related = relationshipsFor(card.id, snapshot);
  const formalIds = related.filter((item) => item.kind === "formal").map((item) => item.id);
  const signalIds = related.filter((item) => item.kind === "intake").map((item) => item.id);
  return <DetailFrame back="/articles" crumbs={[{ label: "Dashboard", to: "/" }, { label: "Articles", to: "/articles" }, { label: card.id }] }>
    <DetailHeader kicker="ARTICLE / CONTENT" id={card.id} title={card.topic}>
      <Badge value={card.status} /><ReviewBadge value={card.human_review} />
    </DetailHeader>
    <RelationshipTools currentId={card.id} snapshot={snapshot} fullChain />
    <div className="detail-grid">
      <Section title="Content Metadata"><DefinitionGrid rows={[
        ["Platform", card.platform || "—"], ["Status", <Badge value={card.status} />],
        ["Publish Approved", card.publish_approved ? "YES" : "NO"], ["Content Gate", card.content_gate || "—"],
        ["Evidence Level", <Badge value={card.evidence_level} tone={card.evidence_level ? "good" : "neutral"} />],
        ["Gap Status", <Badge value={card.gap_status} tone={card.gap_status === "open" ? "warn" : "neutral"} />],
      ]} /></Section>
      <Section title="External Sources"><SourceList sources={card.sources} snapshot={snapshot} /></Section>
    </div>
    <Section title="KDF Provenance" note="source_knowledge、related、parent、wikilinks 與其 UI-derived reverse paths；不寫回 formal card"><NodeLinks ids={formalIds} snapshot={snapshot} /></Section>
    <Section title="Related Feedback / Discovery Signals">{signalIds.length ? <ul className="relation-list">{signalIds.map((signalId) => <li key={signalId}><Link className="node-link" to={`/feedback/${encodeURIComponent(signalId)}`}><code>{signalId}</code><span>Feedback signal</span></Link></li>)}</ul> : <Empty>目前沒有明示的 Feedback / Agent-Reach relation。</Empty>}</Section>
  </DetailFrame>;
}

function candidateRows(candidate: IntakeCandidate): Array<[string, React.ReactNode]> {
  return [
    ["Feedback / Intake ID", candidate.id], ["Source Class", candidate.source_class],
    ["Source", candidate.source_label], ["Feedback Type", candidate.feedback_type],
    ["Cross-node Decision", candidate.cross_node_decision], ["Recommendation", candidate.recommendation],
    ["Owner Review", <ReviewBadge value={candidate.owner_review_status} />], ["Intake State", <Badge value={candidate.intake_state} />],
    ["Route Result", `${candidate.route_result.status} / ${candidate.route_result.action}`],
  ];
}

export function FeedbackDetail({ snapshot }: { snapshot: KdfSnapshot }) {
  const { id } = useParams();
  const candidate = allCandidates(snapshot).find((item) => item.id === id);
  if (!candidate) return <NotFound kind="Feedback / Intake" fallback="/feedback" />;
  return <DetailFrame back="/feedback" crumbs={[{ label: "Dashboard", to: "/" }, { label: "Feedback", to: "/feedback" }, { label: candidate.id }] }>
    <DetailHeader kicker={candidate.item_kind.replaceAll("_", " ")} id={candidate.id} title={candidate.feedback_type}>
      <ReviewBadge value={candidate.owner_review_status} /><Badge value={candidate.intake_state} />
    </DetailHeader>
    <RelationshipTools currentId={candidate.id} snapshot={snapshot} />
    <div className="privacy-notice"><strong>Privacy-safe projection</strong><span>只顯示 normalized / redacted summary。原始文字、姓名、帳號、private locator、cookie、token 與 session data 不會進入此 snapshot。</span></div>
    <div className="detail-grid">
      <Section title="Intake 狀態"><DefinitionGrid rows={candidateRows(candidate)} /></Section>
      <Section title="Source Metadata" note="locator-free whitelist"><DefinitionGrid rows={[
        ["Visibility", candidate.source_metadata.visibility], ["Verification", candidate.source_metadata.verification_status],
        ["Privacy Class", candidate.source_metadata.privacy_class], ["Capture Method", candidate.source_metadata.capture_method],
      ]} /></Section>
    </div>
    <Section title="Normalized / Redacted Summary"><div className="safe-summary">{candidate.normalized_summary}</div></Section>
    <Section title="Related KDF Nodes"><NodeLinks ids={candidate.related_kdf_ids} snapshot={snapshot} /></Section>
  </DetailFrame>;
}

export function ReviewDetail({ snapshot }: { snapshot: KdfSnapshot }) {
  const { id } = useParams();
  const candidate = allCandidates(snapshot).find((item) => item.id === id);
  const card = findCard(snapshot, id);
  if (!candidate && !card) return <NotFound kind="Review Item" fallback="/review" />;
  const title = candidate?.feedback_type ?? card!.topic;
  const relatedIds = candidate?.related_kdf_ids ?? explicitRelated(card!, snapshot).map((item) => item.id);
  const currentDecision = candidate?.owner_review_status ?? card!.human_review;
  const recommendation = candidate?.recommendation ?? card!.status;
  const source = candidate ? `${candidate.source_class} / ${candidate.source_label}` : "Formal KDF artifact";
  const waiting = currentDecision.toLowerCase() === "pending"
    ? "等待 Owner 明確判斷；目前狀態不會觸發任何 write 或 promotion。"
    : "既有 decision 已被 snapshot 讀取；此頁不重新執行或改寫該決定。";
  return <DetailFrame back="/review" crumbs={[{ label: "Dashboard", to: "/" }, { label: "Review Queue", to: "/review" }, { label: id ?? "unknown" }] }>
    <DetailHeader kicker="OWNER REVIEW" id={id ?? "UNKNOWN"} title={title}><ReviewBadge value={currentDecision} /></DetailHeader>
    <RelationshipTools currentId={id ?? ""} snapshot={snapshot} />
    <Section title="Review Context"><DefinitionGrid rows={[
      ["What needs review", candidate ? candidate.feedback_type : card!.type], ["Source", source],
      ["Current recommendation", recommendation], ["Current decision", currentDecision], ["Why waiting", waiting],
    ]} /></Section>
    <Section title="Related KDF Nodes"><NodeLinks ids={relatedIds} snapshot={snapshot} /></Section>
    <div className="approval-grid">
      <article><h3>Approval WOULD mean</h3><p>Owner 對目前建議做出明確治理判斷；後續仍必須使用各自正式、受控的 promotion 或 KDF write flow。</p></article>
      <article><h3>Approval WOULD NOT mean</h3><p>不代表自動建立 Evidence、Research Question、Field Observation 或 Mature Knowledge，也不提高 evidence level。</p></article>
    </div>
    <div className="disabled-actions" aria-label="Read-only actions"><button disabled>Approve</button><button disabled>Hold</button><button disabled>Reject</button><span>Read-only v0.2 — not connected</span></div>
  </DetailFrame>;
}

export function NodeDetail({ snapshot }: { snapshot: KdfSnapshot }) {
  const { id } = useParams();
  const card = findCard(snapshot, id);
  if (!card) return <NotFound kind="KDF Node" fallback="/" />;
  return <DetailFrame back="/" crumbs={[{ label: "Dashboard", to: "/" }, { label: "KDF Node" }, { label: card.id }] }>
    <DetailHeader kicker={card.type.replaceAll("-", " ").toUpperCase()} id={card.id} title={card.topic}><Badge value={card.status} /></DetailHeader>
    <RelationshipTools currentId={card.id} snapshot={snapshot} />
    <Section title="Node Metadata"><DefinitionGrid rows={[["Type", card.type], ["Status", card.status], ["Root", card.root_topic ? <NodeLink id={card.root_topic} snapshot={snapshot} /> : "—"], ["Parent", card.parent ? <NodeLink id={card.parent} snapshot={snapshot} /> : "—"], ["Human Review", <ReviewBadge value={card.human_review} />]]} /></Section>
    <Section title="Existing Relationships"><NodeLinks ids={explicitRelated(card, snapshot).map((item) => item.id)} snapshot={snapshot} /></Section>
    {card.type === "mature-knowledge" && <RelatedLegacyArticles card={card} snapshot={snapshot} />}
  </DetailFrame>;
}

export function NotFound({ kind = "Page", fallback = "/" }: { kind?: string; fallback?: string }) {
  return <div className="not-found"><p>404 · SAFE NOT FOUND</p><h2>{kind} 不存在</h2><span>找不到指定 ID；沒有執行 fallback write、模糊比對或自動替代。</span><Link to={fallback}>返回清單</Link></div>;
}
