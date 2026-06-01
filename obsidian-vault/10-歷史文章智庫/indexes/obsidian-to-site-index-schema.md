# Obsidian to Site Index Schema Design

This document defines the first-pass schema and validation rules for converting
the Obsidian history article knowledge base into a derived Blogger site index.

The Obsidian Markdown files remain the source of truth. The site-index JSON is a
generated artifact for internal linking, Blogger package generation, and QA.

## Site-Index v1 Schema Draft

```json
{
  "version": "site-index.v1",
  "generatedAt": "",
  "source": {
    "type": "obsidian-history-vault",
    "path": ""
  },
  "posts": [
    {
      "title": "",
      "url": "",
      "canonicalUrl": "",
      "slug": "",
      "permalink": "",
      "status": "published",
      "articleSection": "",
      "tags": [],
      "seoKeywords": [],
      "summary": "",
      "publishedDate": "",
      "updatedDate": "",
      "primaryTopic": "",
      "secondaryTopics": [],
      "targetAudience": [],
      "locationSignals": [],
      "suggestedAnchorTexts": [],
      "avoidAnchorTexts": [],
      "outdatedRisk": "low",
      "reviewRequired": true,
      "representative": false,
      "sourcePlatform": "blogger",
      "sourceType": "historical-blog-post"
    }
  ],
  "warnings": []
}
```

## Field Mapping

| Obsidian frontmatter | site-index field | Notes |
| --- | --- | --- |
| `title` | `title` | Required. Human-readable article title. |
| `url` | `url` | Required. Full public article URL. |
| `canonicalUrl` | `canonicalUrl` | Required for final output. May fall back to `url` with warning. |
| `slug` | `slug` | Required. URL last segment without `.html`. |
| `permalink` | `permalink` | Blogger custom permalink value. Should usually match `slug`. |
| `status` | `status` | Controls inclusion: `published`, `draft`, `deprecated`. |
| `articleSection` | `articleSection` | Used for relevance matching and category grouping. |
| `tags` | `tags` | Existing Blogger labels or Obsidian tags. |
| `seoKeywords` | `seoKeywords` | Matching hints, not for keyword stuffing. |
| `summary` | `summary` | Used in recommendation previews and matching. |
| `publishedDate` | `publishedDate` | Should match original publish date. |
| `updatedDate` | `updatedDate` | Optional. Empty allowed. |
| `primaryTopic` | `primaryTopic` | Highest-priority internal-link matching field. |
| `secondaryTopics` | `secondaryTopics` | Supporting topic matches. |
| `targetAudience` | `targetAudience` | Audience matching, such as parents or presbyopia readers. |
| `locationSignals` | `locationSignals` | Local relevance, such as Sanxia, Yingge, Beida. |
| `suggestedAnchorTexts` | `suggestedAnchorTexts` | Natural anchor text candidates. |
| `avoidAnchorTexts` | `avoidAnchorTexts` | Unsafe or overpromising anchor text to avoid. |
| `needsReview` | `reviewRequired` | Convert boolean field name for site-index output. |
| `outdatedRisk` | `outdatedRisk` | Controls automatic recommendation safety. |
| `representative` | `representative` | Marks pillar or representative articles. |
| `sourcePlatform` | `sourcePlatform` | Usually `blogger`. |
| `sourceType` | `sourceType` | Usually `historical-blog-post`. |
| `references` | omitted by default | Keep in Obsidian unless debug output is needed. |
| `relatedLinks` | omitted by default | Manual relation notes; not required in the derived index. |
| `lastReviewedAt` | omitted by default | Keep in Obsidian or debug output. |
| `lastIndexedAt` | omitted by default | Generated metadata, not source metadata. |

## Required Fields

The conversion tool should require:

- `title`
- `url`
- `slug`
- `status`
- `articleSection`
- `tags`
- `seoKeywords`
- `summary`
- `publishedDate`
- `primaryTopic`
- `targetAudience`
- `suggestedAnchorTexts`
- `canonicalUrl`
- `needsReview`
- `outdatedRisk`

## Warning, Fail, And Skip Rules

### Fail

The tool should fail or skip the individual article when:

- `title` is missing.
- `url` is missing.
- `url` is not a full `https://` URL.
- `canonicalUrl` is present but is not a full `https://` URL.
- `slug` contains `http`, `/`, or `.html`.
- `permalink` contains `http`, `/`, or `.html`.
- frontmatter cannot be parsed.

### Warning

The tool should warn but may still output the article when:

- `canonicalUrl` is missing but `url` exists. Use `url` as fallback.
- `summary` is missing or too short.
- `primaryTopic` is missing.
- `targetAudience` is empty.
- `suggestedAnchorTexts` is empty.
- `updatedDate` is empty.
- `lastReviewedAt` is empty.
- `needsReview` is true.
- `outdatedRisk` is medium.

### Skip

The tool should skip output when:

- `status` is `deprecated`.
- `status` is `draft` and the run is not in debug mode.
- `outdatedRisk` is `high` and the run is configured for auto-recommendable
  output only.

## Review Required Conversion

Obsidian source:

```yaml
needsReview: true
```

site-index output:

```json
{
  "reviewRequired": true
}
```

Recommendation:

- `needsReview: true` articles may still enter the site-index.
- They should be eligible for manual review and low-risk recommendation.
- They should trigger a QA or checklist warning before final publishing.
- Do not exclude them by default, because most historical articles will need
  review during the first migration phase.

## Outdated Risk Recommendation Strategy

| outdatedRisk | Recommendation behavior |
| --- | --- |
| `low` | Eligible for normal recommendation. |
| `medium` | Eligible, but surface review warning in QA/checklist. |
| `high` | Do not auto-insert. Only show as manual candidate. |
| missing | Treat as `medium` and warn. |

Medical, legal, public-health, and data-heavy posts should start at `medium`
unless recently reviewed with references.

## Status Handling

| status | Behavior |
| --- | --- |
| `published` | Include in normal site-index output. |
| `draft` | Exclude from normal output; include only in debug/test mode. |
| `deprecated` | Always skip. |
| missing | Warn and treat as `draft` unless configured otherwise. |

## URL, Canonical URL, Slug, And Permalink Rules

- `url` is the full public Blogger article URL.
- `canonicalUrl` is the full canonical URL and should usually equal `url`.
- `slug` is the URL last segment without `.html`.
- `permalink` is the Blogger custom permalink value and should usually match
  `slug`.
- `url` and `canonicalUrl` must begin with `https://`.
- `slug` and `permalink` must not be full URLs.
- `slug` and `permalink` must not contain `/`.
- If `slug` is missing, it may be inferred from the last URL segment, but the
  tool must warn.

## Trial Sample Validation

The first three trial articles are valid conversion samples:

1. `2025-05-29-老花眼總整理_看近模糊怎麼辦？從成因、症狀到眼鏡選擇全攻略.md`
   - Type: professional optometry article.
   - Required fields: present.
   - `url` and `canonicalUrl`: full URLs.
   - `slug` and `permalink`: `presbyopia-guide-glasses-options`.
   - `needsReview`: true.
   - `outdatedRisk`: medium.

2. `2025-05-05-【三峽驗光故事】一次「沒配成功的眼鏡」，如何換來兩年後的跨世代信任？.md`
   - Type: storefront story.
   - Required fields: present.
   - `url` and `canonicalUrl`: full URLs.
   - `slug` and `permalink`: `trust-return-optometry-sansia`.
   - `needsReview`: true.
   - `outdatedRisk`: low.

3. `2025-03-25-行銷的關鍵是降低決策成本！驗光師分享4個建立品牌信任的門市策略.md`
   - Type: marketing and business note.
   - Required fields: present.
   - `url` and `canonicalUrl`: full URLs.
   - `slug` and `permalink`: `lower-decision-cost-marketing-eyewear`.
   - `needsReview`: true.
   - `outdatedRisk`: low.

## Minimal Converter Acceptance Criteria

The first Obsidian to site-index converter should:

1. Read Markdown files from the history article knowledge base.
2. Parse YAML frontmatter safely.
3. Validate required fields per article.
4. Output only valid `published` articles by default.
5. Skip `deprecated` articles.
6. Convert `needsReview` to `reviewRequired`.
7. Preserve `outdatedRisk` and apply recommendation-safety flags.
8. Validate URL and slug semantics.
9. Generate a machine-readable warnings list.
10. Use the three trial articles as smoke-test fixtures.

The converter should not modify source Markdown files during export.
