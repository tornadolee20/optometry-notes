import type { LegacyArticle } from "./types";

export type LegacyContentMatchState = "RELATED_CONTENT" | "STRONG_CONTENT_MATCH" | "POSSIBLE_CONTENT_MATCH" | "NO_MATCH";
export type ContentOverlapState = "CONTENT_OVERLAP_HIGH" | "CONTENT_OVERLAP_MEDIUM" | "CONTENT_OVERLAP_LOW" | "UNKNOWN";

export interface LegacyContentMatch {
  id: string;
  title: string;
  publication_date: string;
  excerpt: string;
  content_type: "LEGACY_CONTENT";
  match_state: Exclude<LegacyContentMatchState, "NO_MATCH">;
  reasons: string[];
  provenance_state: string;
  public_url: string;
  body_availability: LegacyArticle["body_availability"];
  candidate_kdf_nodes: string[];
}

interface ContentConcept {
  key: string;
  label: string;
  aliases: string[];
  specific: boolean;
}

const CONTENT_CONCEPTS: ContentConcept[] = [
  { key: "acuity-1", label: "視力 1.0", aliases: ["視力1.0", "視力 1.0", "1.0"], specific: true },
  { key: "visual-function", label: "視覺功能／看得清楚", aliases: ["視覺功能", "視覺品質", "視覺超載", "眼睛沒有問題", "中央視力", "看得清楚", "看不清"], specific: true },
  { key: "peripheral-defocus", label: "周邊離焦／近視控制鏡片", aliases: ["周邊離焦", "離焦鏡片", "近視控制鏡片", "近視控制", "dims", "halt"], specific: true },
  { key: "adaptation", label: "初期配戴與適應", aliases: ["一開始", "初戴", "初期", "適應", "怪怪", "不自然", "側邊"], specific: true },
  { key: "outdoor", label: "戶外與動態活動", aliases: ["戶外", "活動量", "運動", "球類", "樓梯", "動態活動"], specific: true },
  { key: "axial", label: "眼軸與近視控制成效", aliases: ["眼軸", "近視控制成效", "控制效果", "度數還是漲"], specific: true },
  { key: "ai", label: "人工智慧", aliases: ["ai", "人工智慧", "機器學習", "生成式 ai", "生成式ai"], specific: true },
  { key: "governance", label: "黑箱與治理責任", aliases: ["黑箱", "治理", "監督", "驗證", "資料保護", "患者告知", "不可移轉"], specific: true },
  { key: "optometry", label: "驗光／視光專業", aliases: ["驗光", "視光", "驗光師", "視光機構"], specific: false },
  { key: "children", label: "兒童／孩子", aliases: ["孩子", "兒童", "學童", "小孩"], specific: false },
];

const TOKEN_STOP = new Set(["是不", "不是", "代表", "眼睛", "沒有", "問題", "真的", "適合", "為什", "什麼", "怎麼", "應該", "建議", "有些", "孩子", "一開", "開始", "麼有", "些孩", "子戴", "大的", "會覺", "覺得", "該怎", "光專", "片一"]);

export function normalizeLegacySearch(value: string) {
  return value.normalize("NFKC").toLocaleLowerCase("zh-TW").replace(/[，。！？；：、,.!?;:()（）「」『』【】]/gu, " ").replace(/\s+/gu, " ").trim();
}

function aliasMatch(text: string, alias: string) {
  const source = normalizeLegacySearch(text);
  const value = normalizeLegacySearch(alias);
  if (/^[a-z0-9]+$/u.test(value)) {
    const escaped = value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    return new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, "u").test(source);
  }
  return source.includes(value);
}

function conceptsFor(value: string) {
  return CONTENT_CONCEPTS.filter((concept) => concept.aliases.some((alias) => aliasMatch(value, alias)));
}

function queryTokens(value: string) {
  const normalized = normalizeLegacySearch(value);
  const output = new Set<string>();
  for (const token of normalized.match(/[a-z0-9]+(?:\.[0-9]+)?/gu) ?? []) if (token.length >= 2) output.add(token);
  for (const sequence of normalized.match(/[\p{Script=Han}]{2,}/gu) ?? []) {
    for (let index = 0; index < sequence.length - 1; index += 1) {
      const token = sequence.slice(index, index + 2);
      if (!TOKEN_STOP.has(token)) output.add(token);
    }
  }
  return [...output];
}

export function legacyArticleHaystack(article: LegacyArticle) {
  return [article.id, article.title, article.publication_date, article.body_text, ...article.tags, ...article.topics,
    ...article.kdf_candidates.flatMap((candidate) => [candidate.kdf_id, ...candidate.matched_terms])].join(" ");
}

export function legacyExcerpt(article: LegacyArticle, terms: string[], length = 190) {
  const plain = article.body_text.replace(/\s+/gu, " ").trim();
  const normalized = normalizeLegacySearch(plain);
  const term = terms.find((value) => normalized.includes(normalizeLegacySearch(value)));
  const at = term ? normalized.indexOf(normalizeLegacySearch(term)) : -1;
  const start = at < 0 ? 0 : Math.max(0, at - 55);
  const excerpt = plain.slice(start, start + length).trim();
  return `${start > 0 ? "…" : ""}${excerpt}${start + length < plain.length ? "…" : ""}` || "此文章目前只有有限摘要；請開啟文章查看既有投影。";
}

export function matchLegacyContent(articles: LegacyArticle[], question: string, relatedFormalIds: string[], limit = 5) {
  const questionConcepts = conceptsFor(question);
  const tokens = queryTokens(question);
  const formalIds = new Set(relatedFormalIds);
  const matches = articles.flatMap((article): LegacyContentMatch[] => {
    const title = normalizeLegacySearch(article.title);
    const document = normalizeLegacySearch(legacyArticleHaystack(article));
    const articleConcepts = new Set(conceptsFor(document).map((item) => item.key));
    const sharedConcepts = questionConcepts.filter((item) => articleConcepts.has(item.key));
    const titleConcepts = questionConcepts.filter((item) => item.aliases.some((alias) => aliasMatch(title, alias)));
    const titleTerms = tokens.filter((token) => title.includes(normalizeLegacySearch(token)));
    const documentTerms = tokens.filter((token) => !titleTerms.includes(token) && document.includes(normalizeLegacySearch(token)));
    const candidateNodes = article.kdf_candidates.map((candidate) => candidate.kdf_id).filter((id) => formalIds.has(id));
    const specificTitleConcept = titleConcepts.some((item) => item.specific);
    const specificShared = sharedConcepts.filter((item) => item.specific);
    const questionSpecific = questionConcepts.filter((item) => item.specific);
    const requiresAcuityTitle = questionConcepts.some((item) => item.key === "acuity-1");
    const hasAcuityTitle = titleConcepts.some((item) => item.key === "acuity-1");
    const eligible = requiresAcuityTitle ? hasAcuityTitle : questionSpecific.length > 0
      ? specificTitleConcept || (candidateNodes.length > 0 && specificShared.length > 0) || (specificShared.length >= 2 && titleTerms.length >= 2)
      : titleTerms.length >= 2;
    if (!eligible) return [];
    const score = (titleConcepts.reduce((total, item) => total + (item.specific ? 10 : 3), 0))
      + (specificShared.filter((item) => !titleConcepts.some((titleItem) => titleItem.key === item.key)).length * 5)
      + Math.min(16, titleTerms.length * 4) + Math.min(6, documentTerms.length) + Math.min(12, candidateNodes.length * 4);
    if (score < 9) return [];
    const matchState: LegacyContentMatch["match_state"] = score >= 22 ? "STRONG_CONTENT_MATCH" : score >= 16 ? "POSSIBLE_CONTENT_MATCH" : "RELATED_CONTENT";
    const reasons: string[] = [];
    if (titleConcepts.length) reasons.push(`標題概念：${titleConcepts.map((item) => item.label).join("、")}`);
    if (titleTerms.length) reasons.push(`標題呼應：${titleTerms.slice(0, 4).join("、")}`);
    if (specificShared.length) reasons.push(`問題與文章共享主題：${specificShared.map((item) => item.label).join("、")}`);
    if (documentTerms.length) reasons.push(`文章內容呼應：${documentTerms.slice(0, 4).join("、")}`);
    if (candidateNodes.length) reasons.push(`既有 candidate KDF context：${candidateNodes.join("、")}`);
    return [{
      id: article.id, title: article.title, publication_date: article.publication_date, excerpt: legacyExcerpt(article, [...titleTerms, ...documentTerms]),
      content_type: "LEGACY_CONTENT", match_state: matchState, reasons, provenance_state: article.evidence_provenance.status,
      public_url: article.source_url, body_availability: article.body_availability,
      candidate_kdf_nodes: [...new Set(article.kdf_candidates.map((candidate) => candidate.kdf_id))],
    }];
  }).sort((left, right) => {
    const rank = { STRONG_CONTENT_MATCH: 3, POSSIBLE_CONTENT_MATCH: 2, RELATED_CONTENT: 1 };
    return rank[right.match_state] - rank[left.match_state] || right.publication_date.localeCompare(left.publication_date) || left.id.localeCompare(right.id);
  }).slice(0, limit);
  const overlap: ContentOverlapState = matches.some((item) => item.match_state === "STRONG_CONTENT_MATCH") ? "CONTENT_OVERLAP_HIGH"
    : matches.some((item) => item.match_state === "POSSIBLE_CONTENT_MATCH") ? "CONTENT_OVERLAP_MEDIUM"
      : matches.length ? "CONTENT_OVERLAP_LOW" : "UNKNOWN";
  return { matches, overlap };
}
