import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildBrainSnapshot } from "./kdf_obsidian_brain_snapshot.mjs";
import { buildLegacyBlogProjection, parseLegacyDocument, readableArticleBody } from "./kdf_legacy_blog_projection.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("legacy frontmatter parser accepts list metadata without formal KDF coercion", () => {
  const parsed = parseLegacyDocument(`---\ntitle: "真實標題"\ndate: 2026-01-02\ntags:\n  - 兒童近視\n  - 離焦鏡片\n---\n\n# 內文\n`);
  assert.equal(parsed.frontmatter.title, "真實標題");
  assert.deepEqual(parsed.frontmatter.tags, ["兒童近視", "離焦鏡片"]);
  assert.match(parsed.body, /# 內文/u);
});

test("candidate classification regression", async () => {
  const snapshot = await buildBrainSnapshot({ repoRoot, generatedAt: "2026-08-25T00:00:00.000Z" });
  const legacy = snapshot.content.legacy_blog;
  const article = legacy.articles.find((item) => item.id === "LEGACY-BLOG-EB92171289C9");
  assert.ok(article);
  assert.equal(legacy.possible_kdf_match_count, 2);
  assert.deepEqual(article.kdf_candidates.map(({ kdf_id, classification }) => ({ kdf_id, classification })), [
    { kdf_id: "KDF-001", classification: "STRONG_CANDIDATE" },
    { kdf_id: "KDF-001-A", classification: "STRONG_CANDIDATE" },
    { kdf_id: "KDF-001-B-001", classification: "POSSIBLE_MATCH" },
    { kdf_id: "KDF-001-G", classification: "POSSIBLE_MATCH" },
  ]);
  assert.ok(article.kdf_candidates.every((candidate) => candidate.basis.length > 0));
  assert.ok(article.kdf_candidates.every((candidate) => candidate.matched_terms.length > 0));
  assert.ok(article.kdf_candidates.flatMap((candidate) => candidate.matched_terms).includes("DIMS"));
  assert.ok(article.kdf_candidates.flatMap((candidate) => candidate.matched_terms).includes("HALT"));
  assert.ok(article.kdf_candidates.every((candidate) => candidate.matched_terms.every((term) => !/^\/.*\/[a-z]*$/u.test(term))));
  assert.ok(legacy.articles.flatMap((item) => item.kdf_candidates)
    .every((candidate) => candidate.matched_terms.every((term) => !/^\/.*\/[a-z]*$/u.test(term))));
});

test("readable projection strips executable markup but preserves article text", () => {
  const body = readableArticleBody(`<script>alert("no")</script><h2>標題</h2><p>文章內容 &amp; 出處</p><iframe src="x"></iframe>`);
  assert.doesNotMatch(body, /script|iframe|alert/u);
  assert.match(body, /## 標題/u);
  assert.match(body, /文章內容 & 出處/u);
});

test("real legacy corpus inventory is deterministic and remains content-only", async () => {
  const snapshot = await buildBrainSnapshot({ repoRoot, generatedAt: "2026-08-25T00:00:00.000Z" });
  const legacy = snapshot.content.legacy_blog;
  assert.equal(legacy.article_count, 69);
  assert.equal(legacy.body_available_count, 66);
  assert.equal(legacy.summary_only_count, 3);
  assert.equal(legacy.source_url_count, 64);
  assert.equal(legacy.explicit_kdf_link_count, 0);
  assert.equal(legacy.possible_kdf_match_count, 2);
  assert.equal(legacy.evidence_provenance_counts.PROVENANCE_CONFIRMED ?? 0, 0);
  assert.equal(legacy.duplicate_groups.length, 0);
  assert.ok(legacy.articles.every((article) => article.content_type === "LEGACY_CONTENT"));
  assert.ok(legacy.articles.every((article) => article.body_text.length > 0));
  assert.ok(legacy.articles.every((article) => !/<script\b/iu.test(article.body_text)));
  assert.ok(legacy.articles.every((article) => article.kdf_candidates.every((candidate) => candidate.classification !== "EXPLICIT_LINK")));
});

test("internal source traceability is preserved while public projections expose no repository paths", async () => {
  const publicSnapshot = await buildBrainSnapshot({ repoRoot, generatedAt: "2026-08-25T00:00:00.000Z" });
  const internalLegacy = await buildLegacyBlogProjection(repoRoot, publicSnapshot.formal.cards);
  const publicLegacy = publicSnapshot.content.legacy_blog;
  const publicById = new Map(publicLegacy.articles.map((article) => [article.id, article]));

  assert.equal(internalLegacy.articles.length, 69);
  assert.equal(new Set(internalLegacy.articles.map((article) => article.source_path)).size, 69);
  for (const internalArticle of internalLegacy.articles) {
    assert.match(internalArticle.source_path, /^obsidian-vault\/10-歷史文章智庫\/.+\.md$/u);
    await access(path.join(repoRoot, ...internalArticle.source_path.split("/")));
    const publicArticle = publicById.get(internalArticle.id);
    assert.ok(publicArticle);
    assert.ok(!("source_path" in publicArticle));
    assert.deepEqual(
      [publicArticle.title, publicArticle.publication_date, publicArticle.source_url],
      [internalArticle.title, internalArticle.publication_date, internalArticle.source_url],
    );
    assert.equal(publicArticle.body_text, internalArticle.body_text.replace(/`?obsidian-vault\/[^`\r\n]+`?/gu, "本機知識庫"));
  }

  assert.ok(!("source_roots" in publicSnapshot));
  assert.ok(!("source_root" in publicLegacy));
  assert.ok(publicSnapshot.formal.cards.every((card) => !("path" in card)));
  assert.ok(publicSnapshot.intake.agent_reach.latest_batches.every((batch) => !("file" in batch)));
  assert.ok(publicSnapshot.intake.social_feedback.latest_batches.every((batch) => !("file" in batch)));
  const publicJson = JSON.stringify(publicSnapshot);
  assert.doesNotMatch(publicJson, /source_path|source_root|source_roots|obsidian-vault\//u);
  assert.doesNotMatch(publicJson, /(?:[A-Za-z]:\\|\/(?:Users|home)\/)|(?:^|["'])\.\.?\//u);

  const articleDetailSource = await readFile(path.join(repoRoot, "kdf-web", "src", "details.tsx"), "utf8");
  assert.doesNotMatch(articleDetailSource, /article\.source_path|Source path/u);
});
