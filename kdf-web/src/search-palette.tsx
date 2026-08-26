import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { routeForCard } from "./components";
import { legacyArticleHaystack, normalizeLegacySearch } from "./legacy-search.ts";
import type { KdfSnapshot } from "./types";

interface SearchHit {
  id: string;
  kind: "FORMAL_KDF" | "LEGACY_CONTENT";
  title: string;
  meta: string;
  route: string;
  haystack: string;
}

function excerpt(haystack: string, query: string) {
  const plain = haystack.replace(/\s+/gu, " ");
  const at = normalizeLegacySearch(plain).indexOf(normalizeLegacySearch(query));
  if (at < 0) return plain.slice(0, 110);
  return `${at > 35 ? "…" : ""}${plain.slice(Math.max(0, at - 35), at + query.length + 75)}${at + query.length + 75 < plain.length ? "…" : ""}`;
}

export function SearchPalette({ snapshot }: { snapshot: KdfSnapshot }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const items = useMemo<SearchHit[]>(() => [
    ...snapshot.formal.cards.map((card) => ({
      id: card.id, kind: "FORMAL_KDF" as const, title: card.topic,
      meta: `${card.type} · ${card.status}`, route: routeForCard(card),
      haystack: [card.id, card.topic, card.type, card.status, card.root_topic, card.parent, ...card.sources, ...card.related].join(" "),
    })),
    ...snapshot.content.legacy_blog.articles.map((article) => ({
      id: article.id, kind: "LEGACY_CONTENT" as const, title: article.title,
      meta: `${article.publication_date || "日期未記錄"} · ${article.evidence_provenance.status}`,
      route: `/article/${encodeURIComponent(article.id)}`,
      haystack: legacyArticleHaystack(article),
    })),
  ], [snapshot]);
  const hits = useMemo(() => {
    const terms = normalizeLegacySearch(query).split(" ").filter(Boolean);
    if (!terms.length) return snapshot.content.legacy_blog.articles.slice(0, 6).map((article) => items.find((item) => item.id === article.id)!).filter(Boolean);
    return items.map((item) => {
      const value = normalizeLegacySearch(item.haystack);
      if (!terms.every((term) => value.includes(term))) return null;
      const title = normalizeLegacySearch(item.title);
      const score = terms.reduce((total, term) => total + (title.includes(term) ? 8 : 1), 0);
      return { item, score };
    }).filter((value): value is { item: SearchHit; score: number } => Boolean(value))
      .sort((left, right) => right.score - left.score || left.item.title.localeCompare(right.item.title, "zh-TW"))
      .slice(0, 30).map((value) => value.item);
  }, [items, query, snapshot]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault(); setOpen((value) => !value);
      } else if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => { if (open) window.setTimeout(() => input.current?.focus(), 0); }, [open]);
  useEffect(() => { setOpen(false); }, [location.pathname]);

  return <><button type="button" className="search-trigger" onClick={() => setOpen(true)}><span>全域搜尋</span><kbd>Ctrl K</kbd></button>
    {open && <div className="search-overlay" role="dialog" aria-modal="true" aria-label="Global search" onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false); }}>
      <section className="search-palette"><header><div><p>GLOBAL SEARCH · READ ONLY</p><h2>關鍵字搜尋 KDF 與過去文章</h2></div><button type="button" onClick={() => setOpen(false)}>Esc</button></header>
        <input ref={input} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="標題、內文、主題、KDF ID 或日期…" aria-label="搜尋" />
        <div className="search-results">{hits.length ? hits.map((hit) => <Link to={hit.route} key={`${hit.kind}-${hit.id}`}>
          <div><small>{hit.kind === "LEGACY_CONTENT" ? "RELATED CONTENT · LEGACY_CONTENT" : hit.kind}</small><strong>{hit.title}</strong>
            <p>{hit.kind === "LEGACY_CONTENT" ? `你過去寫過這篇相關文章 · ${hit.meta}` : hit.meta}</p>
            {query && <span>{excerpt(hit.haystack, query)}</span>}</div><code>{hit.id}</code>
        </Link>) : <div className="empty">找不到符合條件的 formal node 或 legacy article；不做模糊替代。</div>}</div>
        <footer>Legacy article 只會作為 Related Content；不會作為 Evidence 回答。</footer>
      </section>
    </div>}
  </>;
}
