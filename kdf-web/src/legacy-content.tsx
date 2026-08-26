import { Link } from "react-router-dom";
import { Badge, Empty } from "./components";
import type { KdfCard, KdfSnapshot, LegacyArticle, LegacyKdfCandidate } from "./types";

export interface LegacyArticleRelation {
  article: LegacyArticle;
  candidate: LegacyKdfCandidate;
  inherited_from: string;
}

function candidateRank(value: string) {
  return value === "EXPLICIT_LINK" ? 4 : value === "STRONG_CANDIDATE" ? 3 : value === "NEEDS_OWNER_REVIEW" ? 2 : 1;
}

export function legacyArticlesForNode(card: KdfCard, snapshot: KdfSnapshot) {
  const relations = new Map<string, LegacyArticleRelation>();
  const add = (article: LegacyArticle, candidate: LegacyKdfCandidate, inheritedFrom = "") => {
    const existing = relations.get(article.id);
    if (!existing || candidateRank(candidate.classification) > candidateRank(existing.candidate.classification)) {
      relations.set(article.id, { article, candidate, inherited_from: inheritedFrom });
    }
  };
  for (const article of snapshot.content.legacy_blog.articles) {
    for (const candidate of article.kdf_candidates.filter((item) => item.kdf_id === card.id)) add(article, candidate);
  }

  // A legacy candidate attached to an existing parent RQ may be shown from a downstream
  // Evidence/Mature/Practice node, but only as a possible match and never as provenance.
  if (["evidence-card", "mature-knowledge", "practice-card", "field-observation", "uncle-lens"].includes(card.type) && card.parent) {
    for (const article of snapshot.content.legacy_blog.articles) {
      for (const candidate of article.kdf_candidates.filter((item) => item.kdf_id === card.parent)) {
        if (candidate.classification === "EXPLICIT_LINK" && card.type === "evidence-card") continue;
        add(article, {
          ...candidate,
          classification: "POSSIBLE_MATCH",
          basis: `shared parent Research Question candidate (${card.parent}); not Evidence provenance`,
        }, card.parent);
      }
    }
  }
  const values = [...relations.values()].sort((left, right) =>
    candidateRank(right.candidate.classification) - candidateRank(left.candidate.classification)
    || right.article.publication_date.localeCompare(left.article.publication_date));
  return {
    explicit: values.filter((item) => item.candidate.classification === "EXPLICIT_LINK"),
    possible: values.filter((item) => item.candidate.classification !== "EXPLICIT_LINK"),
  };
}

function RelationRows({ values }: { values: LegacyArticleRelation[] }) {
  if (!values.length) return <Empty>目前沒有此類 legacy article relation。</Empty>;
  return <div className="legacy-relation-list">{values.map(({ article, candidate, inherited_from }) => <Link to={`/article/${encodeURIComponent(article.id)}`} key={article.id}>
    <div><code>{article.id}</code><strong>{article.title}</strong><small>{article.publication_date || "日期未記錄"}</small></div>
    <div><Badge value={candidate.classification} tone={candidate.classification === "EXPLICIT_LINK" ? "good" : "warn"} />
      <span>{inherited_from ? `via ${inherited_from}` : candidate.basis}</span></div>
  </Link>)}</div>;
}

export function RelatedLegacyArticles({ card, snapshot }: { card: KdfCard; snapshot: KdfSnapshot }) {
  const relations = legacyArticlesForNode(card, snapshot);
  return <section className="panel legacy-related-panel"><header className="panel__head"><div><h2>Related Legacy Articles</h2><p>Content relation projection；不會把文章升格為 Evidence。</p></div></header>
    <div className="legacy-related-grid"><article><h3>Explicitly linked</h3><RelationRows values={relations.explicit} /></article>
      <article><h3>Possible matches</h3><RelationRows values={relations.possible} /></article></div>
  </section>;
}

export function LegacyArticleBody({ article }: { article: LegacyArticle }) {
  const lines = article.body_text.split("\n");
  return <article className="legacy-body">{lines.map((line, index) => {
    const heading = line.match(/^(#{1,6})\s+(.+)$/u);
    if (heading) {
      const level = Math.min(4, heading[1].length + 1);
      if (level === 2) return <h2 key={index}>{heading[2]}</h2>;
      if (level === 3) return <h3 key={index}>{heading[2]}</h3>;
      return <h4 key={index}>{heading[2]}</h4>;
    }
    if (line === "---") return <hr key={index} />;
    if (line.startsWith("- ")) return <p className="legacy-body__list" key={index}>• {line.slice(2)}</p>;
    if (!line.trim()) return <span className="legacy-body__space" aria-hidden="true" key={index} />;
    return <p key={index}>{line}</p>;
  })}</article>;
}

export function legacyArticleById(snapshot: KdfSnapshot, id?: string) {
  return snapshot.content.legacy_blog.articles.find((article) => article.id === id);
}
