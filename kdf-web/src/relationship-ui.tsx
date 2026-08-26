import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { BackButton, Badge, Breadcrumbs } from "./components";
import {
  entityIndex, knowledgeChain, relationshipsFor, relationSections,
  type GraphEntity, type RelationshipItem,
} from "./relationships";
import type { DiscoveryGraphOverlay } from "./cross-node-engine";
import type { KdfSnapshot } from "./types";

function RelationPreview({ item }: { item: RelationshipItem }) {
  return <span className="relation-preview" role="tooltip">
    <b>{item.type}</b><code>{item.id}</code><strong>{item.title}</strong>
    <span>Status：{item.status}</span><span>關係：{item.relationship}</span>
  </span>;
}

function RelationItems({ items, empty }: { items: RelationshipItem[]; empty: string }) {
  if (!items.length) return <p className="drawer-empty">{empty}</p>;
  return <ul className="drawer-relations">{items.map((item) => <li key={`${item.id}-${item.relationship}`}>
    <Link to={item.route} className="drawer-relation">
      <span className="drawer-relation__meta"><b>{item.type}</b><code>{item.id}</code></span>
      <strong>{item.title}</strong>
      <span className="drawer-relation__status"><Badge value={item.status} /><em>{item.relationship}{item.derivedReverse ? " · UI reverse" : ""}</em></span>
      <RelationPreview item={item} />
    </Link>
  </li>)}</ul>;
}

function RelationshipDrawer({ currentId, snapshot, open, onClose }: { currentId: string; snapshot: KdfSnapshot; open: boolean; onClose(): void }) {
  const sections = relationSections(currentId, snapshot);
  return <div className={`drawer-layer ${open ? "drawer-layer--open" : ""}`} aria-hidden={!open}>
    <button className="drawer-scrim" type="button" onClick={onClose} aria-label="關閉關係面板" />
    <aside className="relationship-drawer" aria-label="Relationship Panel">
      <header><div><p>GRAPH CONTEXT</p><h2>關係面板</h2><code>{currentId}</code></div><button type="button" onClick={onClose}>關閉 ×</button></header>
      <section><h3>上游來源</h3><RelationItems items={sections.upstream} empty="沒有明示的 Parent、Root、Evidence origin 或 Source card。" /></section>
      <section><h3>下游產出</h3><RelationItems items={sections.downstream} empty="沒有明示的 Mature、Practice、Discovery 或 Article 產出。" /></section>
      <section><h3>相關訊號</h3><RelationItems items={sections.signals} empty="沒有明示的 Feedback 或 Agent-Reach signal。" /></section>
      <section><h3>未解決</h3><RelationItems items={sections.unresolved} empty="沒有 Discovery Question 或 pending relation candidate。" /></section>
    </aside>
  </div>;
}

export function KnowledgeChain({ currentId, snapshot }: { currentId: string; snapshot: KdfSnapshot }) {
  const layers = knowledgeChain(currentId, snapshot);
  return <section className="knowledge-chain"><header><p>EXPLICIT PATHS ONLY</p><h2>完整知識鏈</h2><span>缺少的 layer 直接省略；不建立新 relation。</span></header>
    <div className="knowledge-chain__track">{layers.map(([label, entities], index) => <div className="chain-layer" key={label}>
      {index > 0 && <span className="chain-arrow">→</span>}<small>{label}</small>
      <div>{entities.map((entity) => <Link to={entity.route} key={entity.id} className={entity.kind === "intake" ? "chain-node chain-node--signal" : "chain-node"}>
        <code>{entity.id}</code><strong>{entity.title}</strong><span>{entity.status}</span>
      </Link>)}</div>
    </div>)}</div>
  </section>;
}

export function RelationshipTools({ currentId, snapshot, fullChain = false }: { currentId: string; snapshot: KdfSnapshot; fullChain?: boolean }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [chainOpen, setChainOpen] = useState(false);
  return <>
    <div className="relationship-tools">
      <button type="button" onClick={() => setDrawerOpen(true)}>查看關係</button>
      {fullChain && <button type="button" onClick={() => setChainOpen((value) => !value)}>{chainOpen ? "收合知識鏈" : "查看完整知識鏈"}</button>}
      <Link to={`/graph/${encodeURIComponent(currentId)}`}>開啟 Graph</Link>
      <span>Derived reverse links are UI-only</span>
    </div>
    {chainOpen && <KnowledgeChain currentId={currentId} snapshot={snapshot} />}
    <RelationshipDrawer currentId={currentId} snapshot={snapshot} open={drawerOpen} onClose={() => setDrawerOpen(false)} />
  </>;
}

interface PositionedEntity extends GraphEntity {
  x: number;
  y: number;
  parentId?: string;
  relationship: string;
}

function polar(index: number, count: number, radiusX: number, radiusY: number, offset = -Math.PI / 2) {
  const angle = offset + (Math.PI * 2 * index) / Math.max(count, 1);
  return { x: 50 + Math.cos(angle) * radiusX, y: 50 + Math.sin(angle) * radiusY };
}

export function GraphView({ snapshot, candidateOverlay }: { snapshot: KdfSnapshot; candidateOverlay?: DiscoveryGraphOverlay | null }) {
  const { id } = useParams();
  const entities = entityIndex(snapshot);
  const current = id ? entities.get(id) : undefined;
  const [expanded, setExpanded] = useState(false);
  const direct = useMemo(() => id ? relationshipsFor(id, snapshot) : [], [id, snapshot]);
  if (!current) return <div className="not-found"><p>404 · SAFE NOT FOUND</p><h2>Graph node 不存在</h2><Link to="/">返回 Dashboard</Link></div>;

  const directNodes: PositionedEntity[] = direct.map((item, index) => ({ ...item, ...polar(index, direct.length, 31, 31), relationship: item.relationship }));
  const seen = new Set([current.id, ...direct.map((item) => item.id)]);
  const outerMap = new Map<string, { entity: RelationshipItem; parentId: string }>();
  if (expanded) for (const parent of direct) for (const child of relationshipsFor(parent.id, snapshot)) {
    if (!seen.has(child.id) && !outerMap.has(child.id)) outerMap.set(child.id, { entity: child, parentId: parent.id });
  }
  const outerEntries = [...outerMap.values()];
  const outerNodes: PositionedEntity[] = outerEntries.map(({ entity, parentId }, index) => ({ ...entity, ...polar(index, outerEntries.length, 44, 43, -Math.PI / 2 + .18), parentId, relationship: entity.relationship }));
  const positions = new Map(directNodes.map((node) => [node.id, node]));
  const candidateTargetId = candidateOverlay?.source_id === current.id
    ? candidateOverlay.target_id
    : candidateOverlay?.target_id === current.id ? candidateOverlay.source_id : "";
  const candidateTarget = candidateTargetId ? entities.get(candidateTargetId) : undefined;
  const existingCandidateNode = directNodes.find((node) => node.id === candidateTargetId);
  const candidatePosition = existingCandidateNode ?? { x: 82, y: 16 };
  const showCandidateNode = Boolean(candidateTarget && !existingCandidateNode);

  return <><div className="detail-nav"><BackButton fallback={current.route} /><Breadcrumbs items={[{ label: "Dashboard", to: "/" }, { label: current.id, to: current.route }, { label: "Graph" }]} /></div>
    <header className="graph-head"><div><p>DIRECT GRAPH CONTEXT</p><h2>{current.title}</h2><code>{current.id}</code></div><button type="button" onClick={() => setExpanded((value) => !value)}>{expanded ? "收合一層" : "Expand one level"}</button></header>
    <div className="graph-legend"><span>初始：current + direct parents / children / explicit related</span><span>節點：{1 + directNodes.length + outerNodes.length + (showCandidateNode ? 1 : 0)}</span>{candidateTarget && <span className="graph-candidate-legend">CANDIDATE overlay · {candidateOverlay?.relation} · session only</span>}</div>
    <div className="graph-stage">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {directNodes.map((node) => <line key={`center-${node.id}`} x1="50" y1="50" x2={node.x} y2={node.y} />)}
        {outerNodes.map((node) => { const parent = positions.get(node.parentId ?? ""); return parent ? <line className="graph-line--outer" key={`${parent.id}-${node.id}`} x1={parent.x} y1={parent.y} x2={node.x} y2={node.y} /> : null; })}
        {candidateTarget && <line className="graph-line--candidate" x1="50" y1="50" x2={candidatePosition.x} y2={candidatePosition.y} />}
      </svg>
      <div className="graph-node graph-node--current" style={{ left: "50%", top: "50%" }}><small>{current.type}</small><code>{current.id}</code><strong>{current.title}</strong></div>
      {[...directNodes, ...outerNodes].map((node) => <Link to={node.route} className={`graph-node ${node.kind === "intake" ? "graph-node--signal" : ""} ${node.parentId ? "graph-node--outer" : ""}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} key={node.id} title={`${node.type} · ${node.relationship}`}>
        <small>{node.type}</small><code>{node.id}</code><strong>{node.title}</strong><em>{node.relationship}</em>
      </Link>)}
      {candidateTarget && showCandidateNode && <Link to={candidateTarget.route} className="graph-node graph-node--candidate" style={{ left: `${candidatePosition.x}%`, top: `${candidatePosition.y}%` }} title={`CANDIDATE · ${candidateOverlay?.relation}`}>
        <small>{candidateTarget.type}</small><code>{candidateTarget.id}</code><strong>{candidateTarget.title}</strong><em>CANDIDATE · {candidateOverlay?.relation}</em>
      </Link>}
    </div>
  </>;
}
