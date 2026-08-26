import { Link, useNavigate } from "react-router-dom";
import type { KdfCard, KdfSnapshot } from "./types";
import type { ReactNode } from "react";

export function routeForCard(card: KdfCard) {
  if (card.type === "research-question") return `/research/${encodeURIComponent(card.id)}`;
  if (card.type === "evidence-card") return `/evidence/${encodeURIComponent(card.id)}`;
  if (card.type === "content-draft") return `/article/${encodeURIComponent(card.id)}`;
  return `/node/${encodeURIComponent(card.id)}`;
}

export function Badge({ value, tone = "neutral" }: { value: string; tone?: "neutral" | "good" | "warn" | "bad" }) {
  return <span className={`badge badge--${tone}`}>{value || "—"}</span>;
}

export function ReviewBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  const tone = normalized === "approved" ? "good" : normalized === "pending" ? "warn" : "neutral";
  return <Badge value={value} tone={tone} />;
}

export function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return <section className="panel">
    <header className="panel__head"><div><h2>{title}</h2>{note && <p>{note}</p>}</div></header>
    {children}
  </section>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="empty">{children}</div>;
}

export function NodeLink({ id, snapshot, className }: { id: string; snapshot: KdfSnapshot; className?: string }) {
  const card = snapshot.formal.cards.find((item) => item.id === id);
  if (!card) return <code className={className}>{id}</code>;
  return <Link className={`node-link ${className ?? ""}`} to={routeForCard(card)}><code>{card.id}</code><span>{card.topic}</span></Link>;
}

export function NodeLinks({ ids, snapshot }: { ids: string[]; snapshot: KdfSnapshot }) {
  const unique = [...new Set(ids.filter(Boolean))];
  if (!unique.length) return <Empty>目前沒有既有關係。</Empty>;
  return <ul className="relation-list">{unique.map((id) => <li key={id}><NodeLink id={id} snapshot={snapshot} /></li>)}</ul>;
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; to?: string }> }) {
  return <nav className="breadcrumbs" aria-label="Breadcrumb">{items.map((item, index) => <span key={`${item.label}-${index}`}>
    {index > 0 && <i>→</i>}{item.to ? <Link to={item.to}>{item.label}</Link> : <b>{item.label}</b>}
  </span>)}</nav>;
}

export function BackButton({ fallback }: { fallback: string }) {
  const navigate = useNavigate();
  return <button type="button" className="back-button" onClick={() => window.history.length > 1 ? navigate(-1) : navigate(fallback)}>← 返回</button>;
}

export function DetailHeader({ kicker, id, title, children }: { kicker: string; id: string; title: string; children?: ReactNode }) {
  return <header className="detail-head"><div><p>{kicker}</p><code>{id}</code><h2>{title}</h2></div>{children && <div className="detail-head__badges">{children}</div>}</header>;
}

export function DefinitionGrid({ rows }: { rows: Array<[string, ReactNode]> }) {
  return <dl className="definition-grid">{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || "—"}</dd></div>)}</dl>;
}

export function MarkdownText({ content }: { content: string }) {
  const lines = content.split("\n").filter((line) => line.trim());
  return <div className="markdown-text">{lines.map((line, index) => {
    const cleaned = line.replace(/^[-*]\s+/u, "").replace(/^\d+\.\s+/u, "");
    if (/^\|/u.test(line)) return <code className="markdown-row" key={index}>{line}</code>;
    return <p key={index}>{cleaned}</p>;
  })}</div>;
}
