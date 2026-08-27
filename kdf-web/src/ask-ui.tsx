import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { analyzeWithKdf, ASK_UNKNOWN, type AskAnalysisSession } from "./ask-engine";
import { Badge, Empty, routeForCard, Section } from "./components";
import { buildQuestionMandala, type MandalaCell } from "./mandala-engine";
import { discoverCrossNodeCandidates } from "./cross-node-engine";
import { buildQuestionRegeneration, findQuestionLabOverlap } from "./question-regeneration-engine";
import type { KdfSnapshot } from "./types";

const examples = [
  "視力1.0是不是代表眼睛沒有問題？",
  "周邊離焦鏡片真的適合戶外活動量很大的孩子嗎？",
  "為什麼有些孩子戴離焦鏡片一開始會覺得側邊怪怪的？",
  "眼軸變化是否足以代表近視控制成效？",
  "AI 在驗光專業裡應該怎麼避免把建議變成黑箱？",
];

function cardRoute(snapshot: KdfSnapshot, id: string) {
  const card = snapshot.formal.cards.find((item) => item.id === id);
  return card ? routeForCard(card) : `/node/${encodeURIComponent(id)}`;
}

function NodePills({ ids, snapshot }: { ids: string[]; snapshot: KdfSnapshot }) {
  return <div className="ask-node-pills">{[...new Set(ids)].map((id) => <Link key={id} to={cardRoute(snapshot, id)}><code>{id}</code></Link>)}</div>;
}

function LegacyMemorySection({ analysis, snapshot }: { analysis: AskAnalysisSession; snapshot: KdfSnapshot }) {
  return <Section title="8. 你以前寫過什麼？" note="HISTORICAL CONTENT MEMORY · 與 Formal Evidence 分離">
    <div className="ask-content-overlap"><span>Content overlap</span><Badge value={analysis.content_overlap} tone={analysis.content_overlap === "CONTENT_OVERLAP_HIGH" ? "warn" : "neutral"} /><p>只提示題材重疊；不是 RQ duplicate、Evidence duplicate 或正式 relation。</p></div>
    <div className="content-not-evidence"><strong>歷史文章是過去內容資產，不等同目前正式研究結論。</strong><span>Legacy Articles 不會改變 Evidence count、level、coverage 或 sufficiency。</span></div>
    {analysis.legacy_context.length ? <div className="ask-legacy-list">{analysis.legacy_context.map((article) => <article key={article.id} className="ask-legacy-card">
      <header><div><p>RELATED CONTENT · LEGACY_CONTENT</p><h3>{article.title}</h3><small>{article.publication_date || "日期未記錄"} · {article.body_availability}</small></div><Badge value={article.match_state} tone={article.match_state === "STRONG_CONTENT_MATCH" ? "warn" : "neutral"} /></header>
      <p className="ask-legacy-excerpt">{article.excerpt}</p>
      <div className="ask-legacy-why"><strong>為什麼找到這篇？</strong><ul>{article.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></div>
      <div className="ask-legacy-meta"><span>Provenance：<b>{article.provenance_state}</b> · NOT FORMAL EVIDENCE</span>{article.public_url ? <a href={article.public_url} target="_blank" rel="noreferrer">公開 URL ↗</a> : <span>公開 URL 未記錄</span>}</div>
      {article.candidate_kdf_nodes.length > 0 && <NodePills ids={article.candidate_kdf_nodes} snapshot={snapshot} />}
      <div className="ask-legacy-actions"><Link to={`/article/${encodeURIComponent(article.id)}`}>閱讀文章</Link>{article.candidate_kdf_nodes.length ? <Link to={cardRoute(snapshot, article.candidate_kdf_nodes[0])}>看相關 KDF</Link> : <button type="button" disabled>沒有既有 KDF candidate</button>}{analysis.mandala_context.eligible ? <Link to="/ask/mandala">用曼陀羅看這個主題</Link> : <button type="button" disabled>此題沒有 Mandala template</button>}</div>
    </article>)}</div> : <Empty>目前沒有找到明確相關的歷史文章。</Empty>}
  </Section>;
}

function AskResults({ analysis, snapshot }: { analysis: AskAnalysisSession; snapshot: KdfSnapshot }) {
  const dimensions = Object.entries(analysis.structured_dimensions);
  const strongestLegacy = analysis.legacy_context.find((item) => item.match_state === "STRONG_CONTENT_MATCH");
  const crossNodeCandidates = useMemo(() => {
    const matched = new Set([...analysis.matched_nodes.map((item) => item.id), ...analysis.relation_assessment.related_node_ids]);
    return discoverCrossNodeCandidates(snapshot).filter((candidate) => candidate.source_nodes.some((node) => matched.has(node.id))).slice(0, 5);
  }, [analysis, snapshot]);
  const questionLab = useMemo(() => buildQuestionRegeneration(snapshot, analysis), [analysis, snapshot]);
  const questionOverlap = useMemo(() => findQuestionLabOverlap(analysis.original_question, questionLab), [analysis.original_question, questionLab]);
  const questionCluster = questionOverlap ? questionLab.clusters[questionLab.regenerated_candidates.findIndex((item) => item.regeneration_id === questionOverlap.regeneration_id)] : undefined;
  return <div className="ask-results" aria-live="polite">{questionCluster && <Link className="ask-question-lab-hint" to={`/question-lab?cluster=${encodeURIComponent(questionCluster.cluster_id)}`}>Question Lab 有相近候選 →</Link>}
    <Section title="1. 原始問題" note={`SESSION ONLY · ${analysis.analysis_id}`}><blockquote className="ask-question">{analysis.original_question}</blockquote>{strongestLegacy && <div className="ask-memory-signal"><p>你以前寫過相關內容</p><strong>{strongestLegacy.publication_date ? `你在 ${strongestLegacy.publication_date.slice(0, 4)} 年曾寫過：` : "你曾寫過："}</strong><Link to={`/article/${encodeURIComponent(strongestLegacy.id)}`}>《{strongestLegacy.title}》</Link><small>RELATED CONTENT · 不是 Formal Evidence</small></div>}</Section>
    <Section title="2. 問題結構化解讀" note="未能安全辨識的欄位保留 UNKNOWN"><dl className="ask-dimensions">{dimensions.map(([key, value]) => <div key={key}><dt>{key.replaceAll("_", " ")}</dt><dd className={value === ASK_UNKNOWN ? "is-unknown" : ""}>{value}</dd></div>)}</dl></Section>
    <Section title="3. 對應的正式 KDF 節點" note="依 deterministic concept / wording match 排序；可點擊回查原節點">
      {analysis.matched_nodes.length ? <div className="ask-match-list">{analysis.matched_nodes.map((node) => <Link to={cardRoute(snapshot, node.id)} key={node.id} className="ask-match"><div><code>{node.id}</code><Badge value={node.type} /><strong>{node.topic}</strong><p>{node.reasons.join("；")}</p></div><span>score {node.score} →</span></Link>)}</div> : <Empty>沒有 formal node 通過保守比對門檻；不以模糊結果替代。</Empty>}
    </Section>
    <Section title="4. Scope 與關係判定" note="UI-only assessment · 不建立正式 relation"><div className="ask-assessment"><div><p>SCOPE</p><Badge value={analysis.scope_assessment.state} tone={analysis.scope_assessment.state === "NEW_SCOPE" ? "warn" : "good"} /><strong>{analysis.scope_assessment.reason}</strong></div><div><p>RELATION</p><Badge value={analysis.relation_assessment.state} /><strong>{analysis.relation_assessment.reason}</strong><small>Confidence {analysis.relation_assessment.confidence} · Evidence {analysis.relation_assessment.evidence_sufficiency} · Owner review required</small></div></div><NodePills ids={analysis.relation_assessment.related_node_ids} snapshot={snapshot} /></Section>
    <Section title="5. 目前知道什麼" note="只陳述既有 formal context；不補寫 repository 沒有的結論">
      {analysis.known_context.length ? <ul className="ask-context-list">{analysis.known_context.map((item, index) => <li key={`${item.source_id}-${index}`}><Link to={cardRoute(snapshot, item.source_id)}><code>{item.source_id}</code></Link><p>{item.statement}</p><small>{item.basis}</small></li>)}</ul> : <Empty>目前沒有足以投影的 formal known context。</Empty>}
    </Section>
    <Section title="6. 目前不知道什麼" note="open gap、missing evidence、limitations 與 applicability 保持可追溯">
      {analysis.unknown_context.length ? <ul className="ask-context-list">{analysis.unknown_context.map((item, index) => <li key={index}><p>{item.statement}</p><small>{item.basis}</small><NodePills ids={item.related_node_ids} snapshot={snapshot} /></li>)}</ul> : <Empty>沒有結構化 unknown；這不表示問題已被完整回答。</Empty>}
    </Section>
    <Section title="7. Formal Evidence" note="只有 evidence-card 能進入本區">
      {analysis.evidence_context.length ? <div className="ask-evidence-list">{analysis.evidence_context.map((item) => <article key={item.id}><header><Link to={`/evidence/${encodeURIComponent(item.id)}`}><code>{item.id}</code> {item.topic}</Link><Badge value={`LEVEL ${item.evidence_level}`} tone="good" /></header><p><b>Findings：</b>{item.findings}</p><p><b>Limitations：</b>{item.limitations}</p><small>{item.relevance}</small></article>)}</div> : <Empty>目前沒有符合的 Formal Evidence。INSUFFICIENT 不等於證明沒有外部研究。</Empty>}
    </Section>
    <LegacyMemorySection analysis={analysis} snapshot={snapshot} />
    <Section title="9. Practice / Feedback Context" note="明確分層：以下全部不是 Formal Evidence">
      {analysis.practice_context.length + analysis.feedback_context.length ? <div className="ask-signal-list">{[...analysis.practice_context, ...analysis.feedback_context].map((item) => <Link to={item.route} key={`${item.kind}-${item.id}`}><code>{item.id}</code><div><strong>{item.title}</strong><p>{item.reason}</p></div><Badge value="NOT FORMAL EVIDENCE" tone="warn" /></Link>)}</div> : <Empty>沒有對應的 Practice / Feedback signal。</Empty>}
    </Section>
    <Section title="10. Discovery Context" note="Discovery 是候選方向，不是 established knowledge">
      {analysis.discovery_context.length ? <ul className="ask-context-list">{analysis.discovery_context.map((item) => <li key={item.id}><Link to={cardRoute(snapshot, item.id)}><code>{item.id}</code> {item.topic}</Link><p>{item.reason}</p><Badge value={item.status} /></li>)}</ul> : <Empty>沒有對應的 Discovery candidate。</Empty>}
    </Section>
    <Section title="10b. KDF 發現的相關交叉點" note="LOOSELY COUPLED · CANDIDATE ONLY">
      {crossNodeCandidates.length ? <div className="ask-cross-node-list">{crossNodeCandidates.map((candidate) => <Link to={`/discovery-lab?source=${encodeURIComponent(candidate.source_nodes[0].id)}&target=${encodeURIComponent(candidate.source_nodes[1].id)}`} key={candidate.discovery_id}><div><Badge value={candidate.candidate_relation} /><code>{candidate.source_nodes.map((node) => node.id).join(" ↔ ")}</code><p>{candidate.rationale}</p></div><span>Discovery Lab →</span></Link>)}</div> : <Empty>本次問題沒有重疊到保守篩選後的 cross-node candidate；Ask KDF 仍可獨立運作。</Empty>}
    </Section>
    <Section title="11. Mandala 延伸" note="只使用現有 template；本次不建立正式 RQ">
      {analysis.mandala_context.eligible ? <div className="ask-mandala-cta"><div><Badge value="THINKING_ONLY" /><h3>可展開 1 core → 8 dimensions → 64 sub-questions</h3><p>{analysis.mandala_context.reason}</p></div><Link to="/ask/mandala">展開本次 Mandala →</Link></div> : <Empty>{analysis.mandala_context.reason} 不生成假 template。</Empty>}
    </Section>
    <Section title="12. Missing Evidence / Open Gap" note="不把 keyword absence 自動升格成 formal gap">
      {analysis.gap_context.length ? <ul className="ask-context-list">{analysis.gap_context.map((item, index) => <li key={index}><p>{item.statement}</p><small>{item.basis}</small></li>)}</ul> : <Empty>目前沒有可直接投影的 explicit gap；若要建立新 gap 仍須 Owner review。</Empty>}
    </Section>
    <Section title="13. 候選研究問題" note="最多五題 · 預覽而已 · 不自動建立 Research Question">
      <div className="ask-candidates">{analysis.candidate_questions.map((candidate, index) => <article key={index}><p>QUESTION CANDIDATE {index + 1}</p><h3>{candidate.question}</h3><dl><div><dt>New dimension</dt><dd>{candidate.new_dimension}</dd></div><div><dt>Evidence</dt><dd>{candidate.evidence_sufficiency}</dd></div><div><dt>Duplicate risk</dt><dd>{candidate.duplicate_risk}</dd></div><div><dt>Next action</dt><dd>{candidate.suggested_next_action}</dd></div></dl><NodePills ids={candidate.related_existing_nodes} snapshot={snapshot} /><button type="button" disabled>送交 Owner Review · v0.1 未連接</button></article>)}</div>
    </Section>
    <Section title="14. 技術細節" note="可展開查核 deterministic output"><details className="ask-technical"><summary>查看 normalized input、shared / differing dimensions 與限制</summary><dl><div><dt>Normalized</dt><dd>{analysis.normalized_question}</dd></div><div><dt>Shared</dt><dd>{analysis.relation_assessment.shared_dimensions.join("、") || ASK_UNKNOWN}</dd></div><div><dt>Differing</dt><dd>{analysis.relation_assessment.differing_dimensions.join("、") || ASK_UNKNOWN}</dd></div></dl><ul>{analysis.limitations.map((item) => <li key={item}>{item}</li>)}</ul>{analysis.strongest_node_id && <Link to={`/graph/${encodeURIComponent(analysis.strongest_node_id)}`}>查看既有 Graph context →</Link>}</details></Section>
  </div>;
}

export function AskWorkbench({ snapshot, session, onSession }: { snapshot: KdfSnapshot; session: AskAnalysisSession | null; onSession(value: AskAnalysisSession): void }) {
  const [question, setQuestion] = useState(session?.original_question ?? "");
  const [validation, setValidation] = useState("");
  const analyze = () => {
    if (!question.trim()) { setValidation("請先輸入一個自然語言問題。"); return; }
    setValidation("");
    onSession(analyzeWithKdf(snapshot, question));
  };
  return <div className="ask-workbench"><div className="ask-intro"><p>ASK KDF · DETERMINISTIC · LOCAL</p><h2>用自然語言整理問題，再回到可追溯的 KDF context</h2><span>唯讀、session-only；不呼叫雲端 LLM，不建立 RQ，不寫入 KDF Core。</span></div><section className="ask-composer"><label htmlFor="ask-question">你想從既有 KDF 釐清什麼？</label><textarea id="ask-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="輸入完整問題；例如：眼軸變化是否足以代表近視控制成效？" /><div className="ask-example-list">{examples.map((example) => <button type="button" key={example} onClick={() => { setQuestion(example); setValidation(""); }}>{example}</button>)}</div>{validation && <p className="ask-validation" role="alert">{validation}</p>}<button className="ask-submit" type="button" onClick={analyze}>分析目前 KDF context</button></section>{session ? <AskResults analysis={session} snapshot={snapshot} /> : <div className="ask-empty-state"><strong>尚未分析問題</strong><p>選一個示例或輸入自己的問題；分析只保留在目前頁面 session。</p></div>}</div>;
}

function SessionCell({ cell, onClick }: { cell: MandalaCell; onClick(): void }) {
  return <button type="button" className={`ask-mandala-cell ask-mandala-cell--${cell.evidence_coverage.toLowerCase()}`} onClick={onClick}><small>{cell.label}</small><strong>{cell.question_text}</strong><span>E {cell.related_evidence.length} · A {cell.related_articles.length} · Gap {cell.open_gap_nodes.length} · Signal {cell.related_feedback.length + cell.related_agent_reach.length + cell.related_practice.length}</span><em>THINKING_ONLY</em></button>;
}

function SessionRelatedArticles({ cell, snapshot }: { cell: MandalaCell; snapshot: KdfSnapshot }) {
  const articles = cell.related_articles.flatMap((id) => {
    const article = snapshot.content.legacy_blog.articles.find((item) => item.id === id);
    return article ? [article] : [];
  });
  return <section className="ask-mandala-articles"><header><div><p>RELATED LEGACY ARTICLES</p><h3>A {articles.length} · not Evidence</h3></div><span>A 不參與 Evidence coverage</span></header>{articles.length ? <ul>{articles.map((article) => <li key={article.id}><Link to={`/article/${encodeURIComponent(article.id)}`}><code>{article.id}</code><span>{article.title}</span></Link></li>)}</ul> : <Empty>此層沒有 candidate-linked Legacy Article。</Empty>}</section>;
}

export function AskSessionMandala({ snapshot, session }: { snapshot: KdfSnapshot; session: AskAnalysisSession | null }) {
  const model = useMemo(() => session ? buildQuestionMandala(snapshot, session.original_question, session.matched_nodes.map((item) => item.id)) : undefined, [session, snapshot]);
  const [selectedId, setSelectedId] = useState("");
  if (!session) return <div className="not-found"><p>SESSION EMPTY</p><h2>重新整理後，本次 Ask context 已清除</h2><Link to="/ask">返回 Ask KDF</Link></div>;
  if (!model) return <div className="not-found"><p>NO ELIGIBLE TEMPLATE</p><h2>本次問題沒有既有 Mandala template</h2><p>系統不會生成假 template 或正式節點。</p><Link to="/ask">返回 Ask KDF</Link></div>;
  const selected = model.dimensions.find((item) => item.template.id === selectedId);
  const cells = selected?.children ?? model.dimensions.map((item) => item.cell);
  const center = selected?.cell ?? model.core;
  return <div className="ask-session-mandala"><div className="detail-nav"><Link className="back-button" to="/ask">← 返回本次 Ask 結果</Link></div><header><p>{model.template.name} · SESSION ONLY</p><h2>{selected ? selected.cell.label : model.session_question}</h2><span>{selected ? "Level 2 · 8 sub-questions" : "1 core → 8 dimensions"}；E = Formal Evidence，A = Related Legacy Articles；A 永不參與 coverage。</span></header>{selected && <button type="button" className="ask-parent" onClick={() => setSelectedId("")}>← 回到 8 dimensions</button>}<div className="ask-mandala-grid">{cells.map((cell) => <SessionCell key={cell.cell_id} cell={cell} onClick={() => cell.level === 1 ? setSelectedId(cell.cell_id.split(":").at(-1) ?? "") : undefined} />)}<div className="ask-mandala-core"><SessionCell cell={center} onClick={() => undefined} /></div></div><SessionRelatedArticles cell={center} snapshot={snapshot} /><p className="ask-mandala-note">所有 coverage、gap、signal 與文章關聯均為本次 UI-derived context；不寫入正式 Markdown、不建立 Research Question。Legacy Article 不會提升 Evidence sufficiency。</p></div>;
}
