import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { wikilinks } from "../mcp-servers/kdf-chatgpt-bridge/dist/frontmatter.js";

export const LEGACY_BLOG_PROJECTION_VERSION = "kdf-legacy-blog-projection-v0.1";
export const LEGACY_BLOG_ROOT = "obsidian-vault/10-歷史文章智庫";

const CLASSIFICATION_RANK = {
  NO_MATCH: 0,
  POSSIBLE_MATCH: 1,
  NEEDS_OWNER_REVIEW: 2,
  STRONG_CANDIDATE: 3,
  EXPLICIT_LINK: 4,
};

const KDF_ID = /^(?:(?:EVC|MKC|PRC|FOC|ULC|CNT)-)?KDF-[0-9]{3}(?:-[A-Z](?:-[0-9]{3})?)?(?:-[A-Z]+-[0-9]{3})?$|^DQ-KDF-[0-9]{3}-[0-9]{3}$/u;
const ABSOLUTE_URL = /^https?:\/\//iu;
const RESEARCH_URL_HOSTS = new Set(["pubmed.ncbi.nlm.nih.gov", "doi.org"]);
const KNOWN_ARTICLE_MAPPINGS = Object.freeze({});
const DIMS_MATCHER = /(?:^|[^A-Za-z])DIMS(?:[^A-Za-z]|$)/u;
const HALT_MATCHER = /H\.?A\.?L\.?T\.?/iu;
const RPR_MATCHER = /(?:^|[^A-Za-z])RPR(?:[^A-Za-z]|$)/u;
const AI_MATCHER = /(?:^|[^A-Za-z])AI\s*(?:系統|工具|模型|軟體|應用|紀錄|決策|治理)/u;
const PUBLIC_MATCHER_LABELS = new Map([
  [DIMS_MATCHER, "DIMS"],
  [HALT_MATCHER, "HALT"],
  [RPR_MATCHER, "RPR"],
  [AI_MATCHER, "AI"],
]);

function compareText(left, right) {
  return Buffer.compare(Buffer.from(String(left), "utf8"), Buffer.from(String(right), "utf8"));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === "") return [];
  return [value];
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function decodeEntities(value) {
  const named = {
    amp: "&", apos: "'", gt: ">", hellip: "…", ldquo: "“", lsquo: "‘",
    lt: "<", nbsp: " ", ndash: "–", quot: "\"", rdquo: "”", rsquo: "’",
  };
  return value.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/giu, (match, token) => {
    if (token.startsWith("#x")) return String.fromCodePoint(Number.parseInt(token.slice(2), 16));
    if (token.startsWith("#")) return String.fromCodePoint(Number.parseInt(token.slice(1), 10));
    return named[token.toLowerCase()] ?? match;
  });
}

function unquote(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith("\"") && trimmed.endsWith("\""))
    || (trimmed.startsWith("'") && trimmed.endsWith("'"))) return trimmed.slice(1, -1);
  return trimmed;
}

function frontmatterValue(value) {
  const trimmed = value.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return trimmed.slice(1, -1).split(",").map(unquote).filter(Boolean);
    }
  }
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  return unquote(trimmed);
}

export function parseLegacyDocument(raw) {
  const normalized = raw.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) return { frontmatter: {}, body: raw };
  const boundary = normalized.indexOf("\n---\n", 4);
  if (boundary < 0) return { frontmatter: {}, body: raw };
  const block = normalized.slice(4, boundary);
  const frontmatter = {};
  let activeList = "";
  for (const line of block.split("\n")) {
    const field = line.match(/^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/u);
    if (field) {
      activeList = field[1];
      frontmatter[activeList] = field[2] ? frontmatterValue(field[2]) : [];
      continue;
    }
    const item = line.match(/^\s+-\s+(.+?)\s*$/u);
    if (item && activeList) {
      if (!Array.isArray(frontmatter[activeList])) frontmatter[activeList] = [];
      frontmatter[activeList].push(unquote(item[1]));
    }
  }
  return { frontmatter, body: normalized.slice(boundary + 5) };
}

export function readableArticleBody(source) {
  const fullMarker = source.match(/(?:^|\n)##\s+完整文章內容\s*(?:\r?\n|$)/u);
  let value = fullMarker ? source.slice((fullMarker.index ?? 0) + fullMarker[0].length) : source;
  value = value
    .replace(/<!--[\s\S]*?-->/gu, "\n")
    .replace(/<(script|style|noscript|iframe)\b[^>]*>[\s\S]*?<\/\1>/giu, "\n")
    .replace(/<h([1-6])\b[^>]*>/giu, (_match, level) => `\n${"#".repeat(Number(level))} `)
    .replace(/<\/h[1-6]>/giu, "\n")
    .replace(/<li\b[^>]*>/giu, "\n- ")
    .replace(/<\/li>/giu, "\n")
    .replace(/<br\s*\/?>/giu, "\n")
    .replace(/<hr\b[^>]*>/giu, "\n---\n")
    .replace(/<\/(?:p|div|section|article|blockquote|ul|ol|table|tr)>/giu, "\n")
    .replace(/<(?:p|div|section|article|blockquote|ul|ol|table|tr)\b[^>]*>/giu, "\n")
    .replace(/<td\b[^>]*>/giu, " | ")
    .replace(/<img\b[^>]*>/giu, "")
    .replace(/<[^>]+>/gu, "");
  value = decodeEntities(value).replace(/\r\n/g, "\n");
  return value
    .split("\n")
    .map((line) => line.replace(/[\t ]+/gu, " ").trimEnd())
    .join("\n")
    .replace(/\n{3,}/gu, "\n\n")
    .trim();
}

function jsonLdArticle(raw) {
  const scripts = raw.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/giu);
  for (const match of scripts) {
    try {
      const parsed = JSON.parse(match[1]);
      const values = Array.isArray(parsed) ? parsed : parsed?.["@graph"] ?? [parsed];
      const article = values.find((item) => {
        const type = asArray(item?.["@type"]).map(String);
        return type.some((value) => ["Article", "BlogPosting"].includes(value));
      });
      if (article) return article;
    } catch {
      // Invalid embedded JSON-LD remains source content; it is not repaired or inferred.
    }
  }
  return {};
}

function normalizeUrl(value) {
  if (!ABSOLUTE_URL.test(String(value ?? ""))) return "";
  try {
    const url = new URL(String(value));
    url.hash = "";
    return url.href.replace(/\/$/u, "");
  } catch {
    return "";
  }
}

function sourceUrls(raw) {
  return unique([...raw.matchAll(/https?:\/\/[^\s<>)\]"'}]+/giu)])
    .map((match) => match[0].replace(/[.,;]+$/u, ""))
    .filter((value) => normalizeUrl(value));
}

function citationProjection(raw, body, sourceUrl) {
  const urls = sourceUrls(raw).filter((value) => normalizeUrl(value) !== normalizeUrl(sourceUrl));
  const citationUrls = urls.filter((value) => {
    try {
      return RESEARCH_URL_HOSTS.has(new URL(value).hostname.toLowerCase());
    } catch {
      return false;
    }
  });
  const identifiers = unique([
    ...[...raw.matchAll(/\bPMID\s*[:：]?\s*([0-9]{6,9})\b/giu)].map((match) => `PMID:${match[1]}`),
    ...[...raw.matchAll(/\bDOI\s*[:：]?\s*(10\.[0-9]{4,9}\/[-._;()/:A-Z0-9]+)/giu)].map((match) => `DOI:${match[1]}`),
  ]).sort(compareText);
  const referenceLines = unique(body.split("\n")
    .map((line) => line.replace(/^[-#>*\s]+/u, "").trim())
    .filter((line) => /^(?:研究來源|資料來源|數據來源|參考文獻)\s*[:：]/u.test(line)
      || /(?:\bPMID\s*[:：]?\s*[0-9]{6,9}\b|\bDOI\s*[:：]?\s*10\.)/iu.test(line)
      || /(?:[A-Z][A-Za-z-]+(?:\s+et al\.)?[,，]\s*20[0-9]{2})/u.test(line)))
    .slice(0, 12);
  return { citation_urls: citationUrls.sort(compareText), identifiers, reference_lines: referenceLines };
}

function bodyAvailability(rawBody, body) {
  const explicitExternalBody = /完整(?:\s*HTML|\s*Markdown)?\s*內容已存檔|完整\s*HTML\s*版並上架/u.test(rawBody);
  const outlineOnly = /文章摘要與核心架構/u.test(rawBody) && body.length < 5_000;
  return explicitExternalBody || outlineOnly ? "SUMMARY_ONLY" : "BODY_AVAILABLE";
}

function evidenceSourceMatch(raw, formalCards) {
  const rawNormalized = raw.toLowerCase();
  const evidenceIds = [];
  const matchedSources = [];
  for (const card of formalCards.filter((item) => item.type === "evidence-card")) {
    for (const source of card.sources) {
      const normalized = normalizeUrl(source);
      if (!normalized) continue;
      const pmid = normalized.match(/pubmed\.ncbi\.nlm\.nih\.gov\/([0-9]+)/u)?.[1];
      if (rawNormalized.includes(normalized.toLowerCase()) || (pmid && new RegExp(`\\b${pmid}\\b`, "u").test(raw))) {
        evidenceIds.push(card.id);
        matchedSources.push(source);
      }
    }
  }
  return { evidence_ids: unique(evidenceIds).sort(compareText), matched_sources: unique(matchedSources).sort(compareText) };
}

function addCandidate(target, candidate) {
  const existing = target.get(candidate.kdf_id);
  if (!existing || CLASSIFICATION_RANK[candidate.classification] > CLASSIFICATION_RANK[existing.classification]) {
    target.set(candidate.kdf_id, candidate);
  }
}

function matchAny(text, terms) {
  return terms.filter((term) => term instanceof RegExp ? term.test(text) : text.includes(term));
}

function publicMatchedTerm(term) {
  if (typeof term === "string") return term;
  return PUBLIC_MATCHER_LABELS.get(term) ?? "";
}

function deterministicCandidates(article, formalCards) {
  const knownIds = new Set(formalCards.map((card) => card.id));
  const candidates = new Map();
  const text = `${article.title}\n${article.tags.join(" ")}\n${article.body_text}`;
  const lens = matchAny(text, ["周邊離焦", "離焦鏡片", DIMS_MATCHER, HALT_MATCHER]);
  const mechanism = matchAny(text, ["光學機制", "離焦原理", "設計原理", "煞車訊號", "停止生長"]);
  const visual = matchAny(text, ["離軸視覺", "周邊視覺", "視覺品質", "視覺適應", "適應期", "不舒服"]);
  const fitting = matchAny(text, ["鏡架", "偏離", "配戴時間", "角度", "滑到鼻尖"]);
  const outcome = matchAny(text, ["控制效果", "眼軸增長", "度數增加", "聯合療法", "效果"]);
  const rpr = matchAny(text, ["相對周邊屈光", RPR_MATCHER]);
  const longTerm = matchAny(text, ["五年", "5 年", "長期追蹤", "至少五年"]);
  const dims = matchAny(text, [DIMS_MATCHER]);
  const ai = matchAny(text, ["人工智慧", "機器學習", "生成式 AI", "生成式AI", AI_MATCHER]);
  const optometry = matchAny(text, ["視光", "驗光所", "驗光師", "驗光機構"]);
  const governance = matchAny(text, ["治理", "責任", "隱私", "資料保護", "患者告知", "供應商契約", "專業義務"]);
  const aiUse = matchAny(text, ["文件紀錄", "決策支援", "患者資料", "病歷", "紀錄"]);

  const rule = (kdfId, classification, basis, terms) => {
    if (!knownIds.has(kdfId)) return;
    addCandidate(candidates, { kdf_id: kdfId, classification, basis, matched_terms: unique(terms.map(publicMatchedTerm)) });
  };
  if (lens.length) {
    const strong = dims.length > 0 || matchAny(`${article.title} ${article.tags.join(" ")}`, ["周邊離焦", "離焦鏡片"]).length > 0;
    rule("KDF-001", strong ? "STRONG_CANDIDATE" : "POSSIBLE_MATCH", "deterministic peripheral-defocus terminology", lens);
    if (mechanism.length) rule("KDF-001-A", strong ? "STRONG_CANDIDATE" : "POSSIBLE_MATCH", "lens terminology plus optical-mechanism language", [...lens, ...mechanism]);
    if (visual.length) rule("KDF-001-B-001", "STRONG_CANDIDATE", "lens terminology plus explicit visual-quality/adaptation language", [...lens, ...visual]);
    else if (fitting.length) rule("KDF-001-B-001", "POSSIBLE_MATCH", "lens terminology plus fitting/adherence context; owner review required", [...lens, ...fitting]);
    if (outcome.length) rule("KDF-001-G", "POSSIBLE_MATCH", "lens terminology plus effectiveness/outcome language", [...lens, ...outcome]);
    if (dims.length && rpr.length) rule("KDF-001-F-001", longTerm.length ? "STRONG_CANDIDATE" : "POSSIBLE_MATCH", "DIMS plus explicit RPR responder terminology", [...dims, ...rpr, ...longTerm]);
  }
  if (ai.length && optometry.length) {
    rule("KDF-002", governance.length ? "STRONG_CANDIDATE" : "POSSIBLE_MATCH", "AI plus optometry-practice terminology", [...ai, ...optometry]);
    if (governance.length) rule("KDF-002-A", "STRONG_CANDIDATE", "AI/optometry plus governance-responsibility language", [...ai, ...optometry, ...governance]);
    if (governance.length && aiUse.length) rule("KDF-002-A-001", "STRONG_CANDIDATE", "AI use-case plus non-transferable responsibility language", [...ai, ...aiUse, ...governance]);
  }
  return candidates;
}

function explicitKdfCandidates(raw, frontmatter, formalCards) {
  const knownIds = new Set(formalCards.map((card) => card.id));
  const values = [];
  for (const field of ["kdf_links", "related_kdf_nodes", "root_topic", "parent", "research_question"]) {
    values.push(...asArray(frontmatter[field]).map(String));
  }
  values.push(...wikilinks(raw));
  values.push(...[...raw.matchAll(/(?<![A-Za-z0-9-])(?:(?:EVC|MKC|PRC|FOC|ULC|CNT)-)?KDF-[0-9]{3}(?:-[A-Z](?:-[0-9]{3})?)?(?:-[A-Z]+-[0-9]{3})?(?![A-Za-z0-9-])|(?<![A-Za-z0-9-])DQ-KDF-[0-9]{3}-[0-9]{3}(?![A-Za-z0-9-])/gu)].map((match) => match[0]));
  return unique(values.map((value) => value.match(/^\[\[([^\]|#]+)/u)?.[1] ?? value).filter((value) => KDF_ID.test(value) && knownIds.has(value))).sort(compareText);
}

function classifyFreshness(article) {
  const reasons = [];
  if (article.body_availability === "SUMMARY_ONLY" || article.metadata_warnings.length) {
    reasons.push("archived body or source metadata is incomplete; owner review is needed before reuse");
    return { state: "REVIEW_RECOMMENDED", reasons };
  }
  if (article.kdf_candidates.some((item) => item.classification !== "EXPLICIT_LINK")) {
    reasons.push("a deterministic KDF candidate exists, but no formal relation is persisted");
    return { state: "POSSIBLE_KDF_LINK", reasons };
  }
  const quantitativeClaim = /(?:研究|數據|系統性回顧|追蹤|風險).{0,100}(?:[0-9]+(?:\.[0-9]+)?\s*(?:%|mm|毫米|篇|年|度))|(?:[0-9]+(?:\.[0-9]+)?\s*(?:%|mm|毫米|篇|年|度)).{0,100}(?:研究|數據|系統性回顧|追蹤|風險)/u.test(article.body_text);
  if (quantitativeClaim && ["NO_PROVENANCE", "UNKNOWN"].includes(article.evidence_provenance.status)) {
    reasons.push("quantitative research language is present without a traceable citation projection");
    return { state: "EVIDENCE_TRACE_MISSING", reasons };
  }
  if (article.evidence_provenance.status === "PROVENANCE_CONFIRMED") {
    return { state: "NO_ACTION", reasons: ["an explicit formal Evidence source match is recorded"] };
  }
  return { state: "CURRENT_UNKNOWN", reasons: ["age alone does not establish that content is outdated"] };
}

function deriveRelatedIds(article, formalCards) {
  const byId = new Map(formalCards.map((card) => [card.id, card]));
  const related = new Set(article.kdf_candidates.map((item) => item.kdf_id));
  const research = new Set();
  const evidence = new Set(article.evidence_provenance.evidence_ids);
  const gaps = new Set();
  const discovery = new Set();
  for (const id of related) {
    const card = byId.get(id);
    if (!card) continue;
    if (card.type === "research-question") research.add(id);
    if (card.type === "evidence-card") {
      evidence.add(id);
      if (card.parent) research.add(card.parent);
    }
    if (card.gap_status === "open") gaps.add(id);
  }
  for (const card of formalCards) {
    const anchors = [card.root_topic, card.parent, card.research_question, ...card.sources, ...card.related, ...card.origin_cards].filter(Boolean);
    if (card.type === "discovery-question" && anchors.some((id) => related.has(id) || research.has(id) || evidence.has(id))) discovery.add(card.id);
  }
  return {
    related_kdf_ids: [...related].sort(compareText),
    related_research_question_ids: [...research].sort(compareText),
    related_evidence_ids: [...evidence].sort(compareText),
    related_gap_ids: [...gaps].sort(compareText),
    related_discovery_question_ids: [...discovery].sort(compareText),
  };
}

async function projectFile(filePath, repoRoot, formalCards) {
  const raw = await readFile(filePath, "utf8");
  const parsed = parseLegacyDocument(raw);
  const frontmatter = parsed.frontmatter ?? {};
  const embedded = jsonLdArticle(raw);
  const rawBody = parsed.body || raw;
  const bodyText = readableArticleBody(rawBody);
  const heading = bodyText.match(/^#\s+(.+?)$/mu)?.[1] ?? "";
  const title = String(frontmatter.title ?? embedded.headline ?? heading ?? "").trim();
  const publicationDate = String(frontmatter.date ?? frontmatter.publishedDate ?? embedded.datePublished ?? "").slice(0, 10);
  const recordedUrl = String(frontmatter.url ?? frontmatter.canonicalUrl ?? "").trim();
  const sourceUrl = normalizeUrl(recordedUrl);
  const tags = asArray(frontmatter.tags).map(String).filter(Boolean);
  const bodyState = bodyAvailability(rawBody, bodyText);
  const citations = citationProjection(raw, bodyText, sourceUrl);
  const evidenceMatch = evidenceSourceMatch(raw, formalCards);
  const metadataWarnings = [];
  if (!title) metadataWarnings.push("MISSING_TITLE");
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(publicationDate)) metadataWarnings.push("MISSING_PUBLICATION_DATE");
  if (!sourceUrl) metadataWarnings.push(recordedUrl ? "NON_ABSOLUTE_SOURCE_URL" : "MISSING_SOURCE_URL");
  if (bodyState === "SUMMARY_ONLY") metadataWarnings.push("FULL_BODY_NOT_IN_ARCHIVE_RECORD");
  const evidenceStatus = evidenceMatch.evidence_ids.length
    ? "PROVENANCE_CONFIRMED"
    : citations.citation_urls.length || citations.identifiers.length || citations.reference_lines.length
      ? "PARTIAL_PROVENANCE"
      : bodyState === "SUMMARY_ONLY" ? "UNKNOWN" : "NO_PROVENANCE";
  const sourcePath = path.relative(repoRoot, filePath).split(path.sep).join("/");
  const article = {
    id: `LEGACY-BLOG-${sha256(sourcePath).slice(0, 12).toUpperCase()}`,
    content_type: "LEGACY_CONTENT",
    title,
    publication_date: publicationDate,
    source_label: "Local Blogger history archive",
    source_url: sourceUrl,
    recorded_url: recordedUrl,
    source_path: sourcePath,
    body_text: bodyText,
    body_availability: bodyState,
    tags,
    topics: unique([String(frontmatter.primaryTopic ?? ""), ...asArray(frontmatter.secondaryTopics).map(String), ...tags]).filter(Boolean),
    explicit_kdf_ids: explicitKdfCandidates(raw, frontmatter, formalCards),
    kdf_candidates: [],
    evidence_provenance: {
      status: evidenceStatus,
      evidence_ids: evidenceMatch.evidence_ids,
      matched_sources: evidenceMatch.matched_sources,
      citation_urls: citations.citation_urls,
      identifiers: citations.identifiers,
      reference_lines: citations.reference_lines,
    },
    freshness: { state: "CURRENT_UNKNOWN", reasons: [] },
    metadata_warnings: metadataWarnings,
    duplicate_ids: [],
  };
  const candidates = deterministicCandidates(article, formalCards);
  for (const kdfId of article.explicit_kdf_ids) addCandidate(candidates, {
    kdf_id: kdfId, classification: "EXPLICIT_LINK", basis: "existing article metadata, wikilink, or literal KDF ID", matched_terms: [kdfId],
  });
  for (const evidenceId of evidenceMatch.evidence_ids) addCandidate(candidates, {
    kdf_id: evidenceId, classification: "EXPLICIT_LINK", basis: "article citation exactly matches a formal Evidence source", matched_terms: evidenceMatch.matched_sources,
  });
  for (const mappedId of asArray(KNOWN_ARTICLE_MAPPINGS[sourceUrl])) addCandidate(candidates, {
    kdf_id: mappedId, classification: "EXPLICIT_LINK", basis: "existing read-only article mapping", matched_terms: [sourceUrl],
  });
  article.kdf_candidates = [...candidates.values()].sort((left, right) => compareText(left.kdf_id, right.kdf_id));
  Object.assign(article, deriveRelatedIds(article, formalCards));
  article.freshness = classifyFreshness(article);
  return article;
}

function markDuplicates(articles) {
  const groups = new Map();
  for (const article of articles) {
    const key = sha256(article.body_text.replace(/\s+/gu, " ").trim());
    const group = groups.get(key) ?? [];
    group.push(article);
    groups.set(key, group);
  }
  const duplicates = [];
  for (const [digest, group] of groups) {
    if (group.length < 2) continue;
    const ids = group.map((article) => article.id).sort(compareText);
    for (const article of group) article.duplicate_ids = ids.filter((id) => id !== article.id);
    duplicates.push({ digest, article_ids: ids });
  }
  return duplicates.sort((left, right) => compareText(left.digest, right.digest));
}

function countBy(values, key) {
  const result = {};
  for (const value of values) {
    const name = value[key] ?? "UNKNOWN";
    result[name] = (result[name] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(result).sort(([left], [right]) => compareText(left, right)));
}

export async function buildLegacyBlogProjection(repoRoot, formalCards) {
  const absoluteRoot = path.join(repoRoot, ...LEGACY_BLOG_ROOT.split("/"));
  const entries = await readdir(absoluteRoot, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".md"))
    .map((entry) => path.join(absoluteRoot, entry.name))
    .sort(compareText);
  const articles = [];
  for (const file of files) articles.push(await projectFile(file, repoRoot, formalCards));
  const duplicateGroups = markDuplicates(articles);
  articles.sort((left, right) => compareText(right.publication_date || right.source_path, left.publication_date || left.source_path));
  const explicitLinked = articles.filter((article) => article.kdf_candidates.some((item) => item.classification === "EXPLICIT_LINK"));
  const possibleLinked = articles.filter((article) => article.kdf_candidates.some((item) => item.classification !== "EXPLICIT_LINK"));
  return {
    projection_version: LEGACY_BLOG_PROJECTION_VERSION,
    content_type: "LEGACY_CONTENT",
    source_root: LEGACY_BLOG_ROOT,
    source_of_truth: "source Markdown files; projection is generated in memory and emitted through the existing stdout snapshot",
    article_count: articles.length,
    body_available_count: articles.filter((article) => article.body_availability === "BODY_AVAILABLE").length,
    summary_only_count: articles.filter((article) => article.body_availability === "SUMMARY_ONLY").length,
    source_url_count: articles.filter((article) => article.source_url).length,
    explicit_kdf_link_count: explicitLinked.length,
    possible_kdf_match_count: possibleLinked.length,
    evidence_provenance_counts: countBy(articles.map((article) => article.evidence_provenance), "status"),
    freshness_counts: countBy(articles.map((article) => article.freshness), "state"),
    duplicate_groups: duplicateGroups,
    missing_metadata: {
      title: articles.filter((article) => !article.title).map((article) => article.id),
      publication_date: articles.filter((article) => !article.publication_date).map((article) => article.id),
      source_url: articles.filter((article) => !article.source_url).map((article) => article.id),
      full_body: articles.filter((article) => article.body_availability === "SUMMARY_ONLY").map((article) => article.id),
    },
    articles,
  };
}
