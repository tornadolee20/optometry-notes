const fs = require("fs");
const path = require("path");

const BASE_URL = "https://desirchange.com";
const OUTPUT_DIR = path.join(
  process.cwd(),
  "research",
  "desirchange-inventory"
);

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CodexResearchBot/1.0";

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function escapeCsv(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function toAbsoluteUrl(candidate) {
  try {
    const url = new URL(candidate, BASE_URL);
    if (url.origin !== BASE_URL) {
      return null;
    }
    url.hash = "";
    url.search = "";
    if (url.pathname === "/") {
      return url.origin;
    }
    if (url.pathname !== "/" && url.pathname.endsWith("/")) {
      url.pathname = url.pathname.slice(0, -1);
    }
    return url.toString();
  } catch {
    return null;
  }
}

function isProbablyContentUrl(url) {
  if (!url) return false;
  const blocked = [
    "/wp-content/",
    "/wp-admin/",
    "/wp-login",
    "/comments/",
    "/tag/",
    "/author/",
    "/search/",
    "/cart/",
    "/checkout/",
    "/product/",
    "/shop/",
    "/?share=",
    "/feed/",
    "/amp/",
    "/embed/",
  ];
  return !blocked.some((token) => url.includes(token));
}

function isLikelyArticleByUrl(url) {
  const pathname = new URL(url).pathname;
  return /\/\d{4}\/\d{2}\/\d{2}\//.test(`${pathname}/`);
}

function detectKind(url, html) {
  if (isLikelyArticleByUrl(url)) {
    return "post";
  }
  if (/og:type"\s+content="article"/i.test(html)) {
    return "article";
  }
  if (/<article[\s>]/i.test(html)) {
    return "article";
  }
  return "page";
}

function extractTitle(html) {
  const ogMatch = html.match(
    /<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i
  );
  if (ogMatch) return ogMatch[1].trim();

  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (titleMatch) {
    return stripHtml(titleMatch[1]);
  }

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    return stripHtml(h1Match[1]);
  }

  return "";
}

function extractDate(html) {
  const patterns = [
    /<meta[^>]+property="article:published_time"[^>]+content="([^"]+)"/i,
    /<meta[^>]+name="article:published_time"[^>]+content="([^"]+)"/i,
    /<time[^>]+datetime="([^"]+)"/i,
    /"datePublished":"([^"]+)"/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return match[1].trim();
  }

  return "";
}

function extractCategories(html) {
  const categories = [];
  const linkPattern =
    /<a[^>]+href="([^"]*\/category\/[^"]+)"[^>]+rel="category tag"[^>]*>([\s\S]*?)<\/a>/gi;
  for (const match of html.matchAll(linkPattern)) {
    const label = stripHtml(match[2]);
    if (label) categories.push(label);
  }

  const jsonLdPattern = /"articleSection":"([^"]+)"/gi;
  for (const match of html.matchAll(jsonLdPattern)) {
    categories.push(match[1].trim());
  }

  return unique(categories);
}

function extractLinks(html) {
  const links = [];
  const hrefPattern = /<a[^>]+href="([^"]+)"/gi;
  for (const match of html.matchAll(hrefPattern)) {
    const absolute = toAbsoluteUrl(match[1]);
    if (absolute && isProbablyContentUrl(absolute)) {
      links.push(absolute);
    }
  }
  return unique(links);
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": USER_AGENT,
      accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.text();
}

async function tryFetchJson(url) {
  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": USER_AGENT,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

function parseSitemapXml(xmlText) {
  const urls = [];
  const locPattern = /<loc>([\s\S]*?)<\/loc>/gi;
  for (const match of xmlText.matchAll(locPattern)) {
    const decoded = match[1]
      .replace(/&amp;/g, "&")
      .replace(/&#x2F;/g, "/")
      .trim();
    const absolute = toAbsoluteUrl(decoded);
    if (absolute && isProbablyContentUrl(absolute)) {
      urls.push(absolute);
    }
  }
  return unique(urls);
}

async function discoverFromWpJson() {
  const records = [];
  for (let page = 1; page <= 20; page += 1) {
    const endpoint = `${BASE_URL}/wp-json/wp/v2/posts?per_page=100&page=${page}&_fields=link,date,title`;
    const payload = await tryFetchJson(endpoint);
    if (!Array.isArray(payload) || payload.length === 0) {
      break;
    }

    for (const item of payload) {
      records.push({
        url: toAbsoluteUrl(item.link),
        title: stripHtml(item?.title?.rendered || ""),
        date: item.date || "",
        kind: "post",
        categories: [],
        discoverySource: ["wp-json"],
      });
    }

    if (payload.length < 100) {
      break;
    }
  }
  return records.filter((record) => record.url);
}

async function discoverFromSitemaps() {
  const candidates = [
    `${BASE_URL}/sitemap.xml`,
    `${BASE_URL}/sitemap_index.xml`,
    `${BASE_URL}/wp-sitemap.xml`,
    `${BASE_URL}/wp-sitemap-posts-post-1.xml`,
    `${BASE_URL}/post-sitemap.xml`,
    `${BASE_URL}/page-sitemap.xml`,
  ];

  const seenXml = new Set();
  const pending = [...candidates];
  const urls = new Set();

  while (pending.length > 0) {
    const next = pending.shift();
    if (seenXml.has(next)) continue;
    seenXml.add(next);

    try {
      const xml = await fetchText(next);
      const discovered = parseSitemapXml(xml);
      for (const item of discovered) {
        if (item.endsWith(".xml")) {
          pending.push(item);
        } else {
          urls.add(item);
        }
      }
    } catch {
      // Ignore missing sitemap endpoints.
    }
  }

  return [...urls];
}

async function discoverFromFeed() {
  const candidates = [`${BASE_URL}/feed`, `${BASE_URL}/comments/feed`];
  const urls = [];

  for (const candidate of candidates) {
    try {
      const xml = await fetchText(candidate);
      urls.push(...parseSitemapXml(xml));
    } catch {
      // Ignore missing feeds.
    }
  }

  return unique(urls);
}

async function crawlInternalLinks(seedUrls, limit = 80) {
  const queue = [...seedUrls];
  const visited = new Set();
  const discovered = new Set(seedUrls);

  while (queue.length > 0 && visited.size < limit) {
    const url = queue.shift();
    if (!url || visited.has(url)) continue;
    visited.add(url);

    try {
      const html = await fetchText(url);
      const links = extractLinks(html);
      for (const link of links) {
        if (!discovered.has(link)) {
          discovered.add(link);
          queue.push(link);
        }
      }
    } catch {
      // Best-effort crawl.
    }
  }

  return [...discovered];
}

async function collectRecords(urls, prefilledRecords = []) {
  const recordMap = new Map();

  for (const record of prefilledRecords) {
    if (!record.url) continue;
    recordMap.set(record.url, {
      url: record.url,
      title: record.title || "",
      date: record.date || "",
      kind: record.kind || "",
      categories: record.categories || [],
      discoverySource: unique(record.discoverySource || []),
    });
  }

  for (const url of urls) {
    if (!recordMap.has(url)) {
      recordMap.set(url, {
        url,
        title: "",
        date: "",
        kind: "",
        categories: [],
        discoverySource: [],
      });
    }
  }

  for (const [url, record] of recordMap) {
    try {
      const html = await fetchText(url);
      record.title = record.title || extractTitle(html);
      record.date = record.date || extractDate(html);
      record.kind = record.kind || detectKind(url, html);
      record.categories = unique([...record.categories, ...extractCategories(html)]);
      record.wordCount = stripHtml(html).split(/\s+/).filter(Boolean).length;
    } catch (error) {
      record.fetchError = String(error.message || error);
    }
  }

  return [...recordMap.values()].sort((a, b) => a.url.localeCompare(b.url));
}

function annotateLikelyArticle(record) {
  if (record.kind === "post") return true;
  if (record.kind === "article") return true;
  if (record.date) return true;
  return false;
}

function summarize(records) {
  const likelyArticles = records.filter(annotateLikelyArticle);
  const categories = new Map();

  for (const record of likelyArticles) {
    for (const category of record.categories) {
      categories.set(category, (categories.get(category) || 0) + 1);
    }
  }

  const topCategories = [...categories.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 30);

  return {
    crawledAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    totalContentUrls: records.length,
    likelyArticleCount: likelyArticles.length,
    pageCount: records.filter((record) => record.kind === "page").length,
    postCount: records.filter((record) => record.kind === "post").length,
    articleCount: records.filter((record) => record.kind === "article").length,
    categoryCounts: Object.fromEntries(topCategories),
  };
}

function buildMarkdown(summary, records) {
  const likelyArticles = records.filter(annotateLikelyArticle);
  const contentPages = records.filter((record) => record.kind === "page");
  const categoryLines = Object.entries(summary.categoryCounts).map(
    ([name, count]) => `- ${name}: ${count}`
  );

  const articleLines = likelyArticles.map((record) => {
    const categories =
      record.categories.length > 0 ? record.categories.join(", ") : "未偵測";
    const date = record.date || "未偵測";
    return `- ${record.title || "(無標題)"} | ${date} | ${categories} | ${record.url}`;
  });

  const pageLines = contentPages.map((record) => {
    return `- ${record.title || "(無標題)"} | ${record.url}`;
  });

  return [
    "# desirchange.com 盤點報告",
    "",
    `- 盤點時間: ${summary.crawledAt}`,
    `- 網站: ${summary.baseUrl}`,
    `- 全部內容網址數: ${summary.totalContentUrls}`,
    `- 可能為文章的網址數: ${summary.likelyArticleCount}`,
    `- 偵測為 post 的數量: ${summary.postCount}`,
    `- 偵測為 article 的數量: ${summary.articleCount}`,
    `- 偵測為 page 的數量: ${summary.pageCount}`,
    "",
    "## 類別統計",
    ...(categoryLines.length > 0 ? categoryLines : ["- 尚未從頁面中抓到明確分類"]),
    "",
    "## 可能為文章的網址",
    ...(articleLines.length > 0 ? articleLines : ["- 尚未偵測到文章"]),
    "",
    "## 其他內容頁",
    ...(pageLines.length > 0 ? pageLines : ["- 無"]),
    "",
  ].join("\n");
}

function writeCsv(filePath, records) {
  const header = [
    "url",
    "title",
    "date",
    "kind",
    "categories",
    "wordCount",
    "discoverySource",
    "fetchError",
  ];

  const lines = [header.join(",")];
  for (const record of records) {
    lines.push(
      [
        record.url,
        record.title,
        record.date,
        record.kind,
        (record.categories || []).join("|"),
        record.wordCount ?? "",
        (record.discoverySource || []).join("|"),
        record.fetchError || "",
      ]
        .map(escapeCsv)
        .join(",")
    );
  }

  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

async function main() {
  ensureDir(OUTPUT_DIR);

  const wpJsonRecords = await discoverFromWpJson();
  const sitemapUrls = await discoverFromSitemaps();
  const feedUrls = await discoverFromFeed();

  const seedUrls = unique([
    BASE_URL,
    ...wpJsonRecords.map((record) => record.url),
    ...sitemapUrls,
    ...feedUrls,
  ]).filter(isProbablyContentUrl);

  const crawledUrls = await crawlInternalLinks(seedUrls.slice(0, 40), 120);
  const allUrls = unique([...seedUrls, ...crawledUrls]).filter(isProbablyContentUrl);

  const records = await collectRecords(allUrls, wpJsonRecords);
  const summary = summarize(records);
  const likelyArticles = records.filter(annotateLikelyArticle);

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "desirchange-summary.json"),
    JSON.stringify(summary, null, 2),
    "utf8"
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "desirchange-all-content.json"),
    JSON.stringify(records, null, 2),
    "utf8"
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "desirchange-likely-articles.json"),
    JSON.stringify(likelyArticles, null, 2),
    "utf8"
  );
  writeCsv(path.join(OUTPUT_DIR, "desirchange-all-content.csv"), records);
  writeCsv(
    path.join(OUTPUT_DIR, "desirchange-likely-articles.csv"),
    likelyArticles
  );
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "desirchange-report.md"),
    buildMarkdown(summary, records),
    "utf8"
  );

  console.log(JSON.stringify(summary, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
