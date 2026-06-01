# Obsidian to Site Index Minimal Implementation Plan

This document defines the first implementation slice for generating a derived
site-index JSON from the Obsidian history article knowledge base.

No converter code is included in this document.

## 1. Ownership Decision

The conversion tool belongs in `optometry-notes`.

Reason:

- The Obsidian history article knowledge base is the source database.
- The site-index JSON is a derived artifact.
- The converter should stay close to the source database.
- `mcp-blogger` should consume a clean site-index file.
- `mcp-blogger` should not directly understand or depend on Obsidian vault
  internals.

Boundary:

- `optometry-notes`: owns Obsidian Markdown and site-index generation.
- `mcp-blogger`: consumes generated site-index and creates Blogger packages.

## 2. First Tool Location

Planned script:

```text
scripts/build_site_index.py
```

Do not create the script until this implementation plan is approved.

## 3. First Input Path

The first converter should read from:

```text
obsidian-vault/10-歷史文章智庫
```

## 4. First Sample Scope

The first version must read only the three trial frontmatter samples.

It must not scan all 69 history articles yet.

Trial files:

```text
2025-05-29-老花眼總整理_看近模糊怎麼辦？從成因、症狀到眼鏡選擇全攻略.md
2025-05-05-【三峽驗光故事】一次「沒配成功的眼鏡」，如何換來兩年後的跨世代信任？.md
2025-03-25-行銷的關鍵是降低決策成本！驗光師分享4個建立品牌信任的門市策略.md
```

## 5. First Output Path

The first converter should write the sample derived index to:

```text
obsidian-vault/10-歷史文章智庫/indexes/site-index.sample.v1.json
```

This JSON is a generated artifact and should not be treated as the source of
truth.

## 6. CLI Command

First command:

```powershell
python scripts/build_site_index.py
```

No npm command is needed for the first slice unless the repository later adopts
a package-based workflow.

## 7. First Version Scope

The first converter should:

- Read the specified three Markdown files.
- Parse YAML frontmatter.
- Validate required fields.
- Output `site-index.v1` JSON.
- Generate warnings.
- Avoid modifying any Markdown.
- Avoid modifying Blogger package files.
- Avoid syncing automatically into `mcp-blogger`.

## 8. Acceptance Rules

### Fail And Skip

- Missing `title`: fail that article and skip output.
- Missing `url`: fail that article and skip output.
- `url` must be a full `https://` URL.
- `canonicalUrl` must be a full `https://` URL when present.
- `slug` must not be a full URL.
- `slug` must not contain `/`.
- `permalink` must not be a full URL.
- `permalink` must not contain `/`.
- `status: deprecated`: do not output.
- `status: draft`: do not output in the first version.

### Transform

- `needsReview: true` becomes `reviewRequired: true`.
- `needsReview: false` becomes `reviewRequired: false`.

### Recommendation Safety

- `outdatedRisk: low`: eligible for normal recommendation.
- `outdatedRisk: medium`: output, but add review warning.
- `outdatedRisk: high`: may output, but mark as not auto-recommendable.
- Missing `outdatedRisk`: treat as `medium` and warn.

### Warnings

- Missing `summary`: warning.
- Missing `primaryTopic`: warning.
- Empty `targetAudience`: warning.
- Empty `suggestedAnchorTexts`: warning.
- Missing `canonicalUrl`: warning, optionally fallback to `url`.
- `needsReview: true`: warning for publishing checklist.

## 9. Explicit Non-Goals

The first version must not:

- Scan all 69 Markdown files.
- Write back to Markdown.
- Fix article body encoding issues.
- Create Blogger drafts.
- Modify `mcp-blogger`.
- Automatically copy output into `mcp-blogger/site-index`.
- Auto-insert related links into article bodies.
- Change existing frontmatter in source files.

## 10. Next Step After This Plan

After this document is reviewed and committed, the next step is to create:

```text
scripts/build_site_index.py
```

The script should implement only the first slice described above.
