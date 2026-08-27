import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Badge, Empty, Section } from "./components";
import { compareCrossNodes, discoverCrossNodeCandidates, graphOverlayFor, type CrossNodeDiscovery, type DiscoveryGraphOverlay } from "./cross-node-engine.ts";
import { entityIndex } from "./relationships";
import type { KdfSnapshot } from "./types";

function ListBlock({ values, empty = "沒有可安全顯示的明示 context。" }: { values: string[]; empty?: string }) {
  return values.length ? <ul className="discovery-list">{values.map((value) => <li key={value}>{value}</li>)}</ul> : <Empty>{empty}</Empty>;
}

function ContextLinks({ ids, snapshot, label }: { ids: string[]; snapshot: KdfSnapshot; label: string }) {
  const index = entityIndex(snapshot);
  return <section><h3>{label}</h3>{ids.length ? <ul className="discovery-links">{ids.map((id) => {
    const entity = index.get(id);
    return <li key={id}>{entity ? <Link to={entity.route}><code>{id}</code><span>{entity.title}</span></Link> : <code>{id}</code>}</li>;
  })}</ul> : <Empty>沒有明示項目。</Empty>}</section>;
}

function DimensionTable({ result }: { result: CrossNodeDiscovery }) {
  if (result.source_nodes.length !== 2) return null;
  const [left, right] = result.source_nodes;
  const keys = [...new Set([...result.shared_dimensions, ...result.differing_dimensions])];
  return <div className="discovery-dimensions"><table><thead><tr><th>Dimension</th><th>{left.id}</th><th>{right.id}</th><th>判定</th></tr></thead><tbody>{keys.map((key) => <tr key={key}><td><code>{key}</code></td><td>{left.dimensions[key as keyof typeof left.dimensions]}</td><td>{right.dimensions[key as keyof typeof right.dimensions]}</td><td><Badge value={result.shared_dimensions.includes(key) ? "SHARED" : "DIFFERENT"} tone={result.shared_dimensions.includes(key) ? "good" : "warn"} /></td></tr>)}</tbody></table></div>;
}

function CandidateDetail({ result, snapshot, onGraph }: { result: CrossNodeDiscovery; snapshot: KdfSnapshot; onGraph(value: DiscoveryGraphOverlay): void }) {
  const navigate = useNavigate();
  const overlay = graphOverlayFor(result);
  if (!result.valid) return <div className="not-found discovery-safe-stop"><p>SAFE COMPARISON STOP</p><h2>無法比較指定節點</h2><p>{result.rationale}</p><Badge value="INSUFFICIENT_FOR_RELATION" /></div>;
  const [left, right] = result.source_nodes;
  return <div className="discovery-detail" aria-live="polite">
    <header className="discovery-verdict"><div><p>CANDIDATE ONLY · OWNER-GATED</p><h2>{result.candidate_relation}</h2><span>{result.rationale}</span></div><div><Badge value={result.confidence} /><Badge value={result.evidence_sufficiency} tone={result.evidence_sufficiency.startsWith("SUFFICIENT") ? "good" : "warn"} />{overlay && <button type="button" onClick={() => { onGraph(overlay); navigate(`/graph/${encodeURIComponent(overlay.source_id)}`); }}>在 Graph 查看</button>}</div></header>
    <Section title="1. What was compared?" note={result.discovery_id}><div className="discovery-node-pair">{[left, right].map((node) => <Link to={node.route} key={node.id}><code>{node.id}</code><Badge value={node.type} /><strong>{node.title}</strong></Link>)}</div></Section>
    <Section title="2. Why were these nodes compared?" note="FILTERED CANDIDATE GENERATION"><ListBlock values={result.why_compared} /></Section>
    <Section title="3–4. Shared / Different dimensions" note="UNKNOWN 不列入相同或差異"><DimensionTable result={result} /></Section>
    <div className="discovery-context-grid">
      <Section title="5. Formal Evidence context" note="ONLY evidence-card"><ContextLinks ids={result.related_evidence} snapshot={snapshot} label="Formal Evidence" /></Section>
      <Section title="6. Practice / Feedback signals" note="NOT EVIDENCE"><ListBlock values={result.signal_context} /></Section>
      <Section title="7. Existing gaps" note="不寫入 gap_status"><ContextLinks ids={result.gap_context} snapshot={snapshot} label="Existing formal gap context" /></Section>
      <Section title="8. Discovery Questions" note="既有正式候選卡"><ContextLinks ids={result.related_discovery} snapshot={snapshot} label="Existing Discovery" /></Section>
      <Section title="9. Legacy content context" note="RELATED CONTENT ONLY"><ListBlock values={result.related_legacy_content.map((id) => `${id} · RELATED CONTENT ONLY`)} /></Section>
    </div>
    <Section title="10–12. Candidate relationship / rationale / uncertainty" note="不是 formal relation"><div className="discovery-reasoning"><div><p>CANDIDATE RELATION</p><Badge value={result.candidate_relation} /><h3>{result.bridge_hypothesis || result.rationale}</h3></div><div><h3>Matching context</h3><ListBlock values={result.matching_context} /></div><div><h3>Differing / conflicting context</h3><ListBlock values={result.conflicting_context} /></div><div><h3>Hierarchy context</h3><ListBlock values={result.hierarchy_context} /></div><div><h3>Uncertainty</h3><ListBlock values={result.uncertainty} /></div></div></Section>
    <Section title="13. Possible gap candidate" note="CANDIDATE · NO FORMAL WRITE">{result.gap_candidate ? <article className="discovery-candidate"><Badge value={result.gap_candidate.candidate_state} /><h3>{result.gap_candidate.statement}</h3><dl><div><dt>Existing knowledge</dt><dd>{result.gap_candidate.existing_knowledge}</dd></div><div><dt>Unresolved</dt><dd>{result.gap_candidate.unresolved}</dd></div><div><dt>Creating dimension</dt><dd>{result.gap_candidate.creating_dimension}</dd></div><div><dt>Why not keyword absence</dt><dd>{result.gap_candidate.not_keyword_absence_reason}</dd></div><div><dt>Evidence limitations</dt><dd>{result.gap_candidate.evidence_limitations.join("；") || "UNKNOWN"}</dd></div><div><dt>Next action</dt><dd>{result.gap_candidate.recommended_next_action}</dd></div></dl></article> : <Empty>此 comparison 未達 bounded NEW_GAP candidate 條件。</Empty>}</Section>
    <Section title="14. Possible next-question candidate" note="OWNER REVIEW REQUIRED">{result.question_candidate ? <article className="discovery-candidate discovery-candidate--question"><Badge value="NEW_QUESTION_CANDIDATE" /><h3>{result.question_candidate.question}</h3><dl><div><dt>Origin relation</dt><dd>{result.question_candidate.originating_relation_candidate}</dd></div><div><dt>New dimension</dt><dd>{result.question_candidate.new_dimension}</dd></div><div><dt>Why existing RQ is not enough</dt><dd>{result.question_candidate.why_existing_rq_not_enough}</dd></div><div><dt>Duplicate risk</dt><dd>{result.question_candidate.duplicate_risk}</dd></div><div><dt>Evidence sufficiency</dt><dd>{result.question_candidate.evidence_sufficiency}</dd></div><div><dt>Next action</dt><dd>{result.question_candidate.suggested_next_action}</dd></div></dl><div className="discovery-candidate-actions"><Link to={`/question-lab?source=${encodeURIComponent(result.discovery_id)}`}>到 Question Lab 看候選問題</Link><button type="button" disabled>建立 Research Question · disabled</button></div></article> : <Empty>不產生候選問題；目前 relation 不足以支持。</Empty>}</Section>
    <Section title="15. Suggested next action" note="NO AUTOMATIC EXECUTION"><div className="discovery-next"><Badge value={result.suggested_next_action} /><strong>Owner review needed：YES</strong><span>candidate_state：{result.candidate_state}</span></div></Section>
  </div>;
}

export function DiscoveryLab({ snapshot, onGraph }: { snapshot: KdfSnapshot; onGraph(value: DiscoveryGraphOverlay): void }) {
  const [searchParams] = useSearchParams();
  const entities = useMemo(() => [...entityIndex(snapshot).values()].sort((left, right) => left.id.localeCompare(right.id)), [snapshot]);
  const automatic = useMemo(() => discoverCrossNodeCandidates(snapshot), [snapshot]);
  const [sourceId, setSourceId] = useState(searchParams.get("source") || "KDF-001-B-001");
  const [targetId, setTargetId] = useState(searchParams.get("target") || "KDF-001-F-001");
  const [result, setResult] = useState<CrossNodeDiscovery | null>(null);
  const compare = () => setResult(compareCrossNodes(snapshot, sourceId.trim(), targetId.trim()));
  const inspect = (candidate: CrossNodeDiscovery) => {
    setSourceId(candidate.source_nodes[0]?.id ?? ""); setTargetId(candidate.source_nodes[1]?.id ?? ""); setResult(candidate);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return <div className="discovery-lab"><div className="discovery-intro"><p>CROSS-NODE DISCOVERY · READ ONLY</p><h2>KDF 最近發現哪些值得注意的交叉點？</h2><span>PRE-DISCOVERY · CANDIDATE ONLY · OWNER-GATED。所有輸出只存在目前 React session。</span></div>
    <Section title="Manual node comparison" note="輸入兩個既有 formal／intake ID"><div className="discovery-compare"><label>Node A<input list="discovery-node-options" value={sourceId} onChange={(event) => setSourceId(event.target.value)} /></label><span>×</span><label>Node B<input list="discovery-node-options" value={targetId} onChange={(event) => setTargetId(event.target.value)} /></label><button type="button" onClick={compare}>Compare</button><datalist id="discovery-node-options">{entities.map((entity) => <option value={entity.id} key={entity.id}>{entity.title}</option>)}</datalist></div></Section>
    {result && <CandidateDetail result={result} snapshot={snapshot} onGraph={onGraph} />}
    <Section title="Automatic candidate discovery" note={`FILTERED · ${automatic.length} actionable candidates · no blind all-pairs`}>
      {automatic.length ? <div className="discovery-candidate-list">{automatic.map((candidate) => <article key={candidate.discovery_id}><header><Badge value={candidate.candidate_relation} tone={candidate.candidate_relation === "BRIDGE_CANDIDATE" ? "warn" : "neutral"} /><Badge value={candidate.evidence_sufficiency} /></header><h3>{candidate.source_nodes.map((node) => node.id).join(" ↔ ")}</h3><p>{candidate.rationale}</p><small>{candidate.why_compared.join("；")}</small><button type="button" onClick={() => inspect(candidate)}>查看交叉點</button></article>)}</div> : <Empty>目前沒有通過保守 filter 的 actionable candidate。</Empty>}
    </Section>
  </div>;
}
