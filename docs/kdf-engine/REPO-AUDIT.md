# KDF Engine v0.1 Repository Audit

- Audit date: 2026-08-13
- Repository: `tornadolee20/optometry-notes`
- Audit baseline: `shared-memory-baseline` at `ec0d42c`
- Implementation branch: `codex/feat/kdf-engine-v0.1`
- Audit rule: `Reuse > Extend > Create`

## 1. Audit scope and method

This audit was completed before changing repository files. It used the Git-tracked file list as the primary inventory because the workspace also contains large sandboxes, backups, binaries, and local credentials that are not part of the KDF architecture.

Reviewed areas:

- root instructions and architecture: `README.md`, `CLAUDE.md`, `AGENTS.md`, `MEMORY.md`, `SYSTEM-MEMORY-SCHEMA.md`
- agent workflows under `.agents/workflows/`
- skills under `skills/` and relevant `.agents/skills/`
- Obsidian folders `01`, `02`, `04`, `05`, `06`, `07`, and `10`
- `KNOWLEDGE-COMPILER-PROTOCOL.md` and its Obsidian SOP
- research intake and evidence-digestion components
- content funnel, content mandala, cross-pollination, rendering, and publish packaging
- scripts, package metadata, frontmatter conventions, and existing validation code
- KDF-001-related cards and historical content

Repository state at audit time:

- branch: `shared-memory-baseline`
- worktree: clean
- remote: `https://github.com/tornadolee20/optometry-notes.git`
- local branch was already one commit ahead of `origin/shared-memory-baseline`; KDF work must not rewrite or mix that existing commit
- tracked files: 3,689, including unrelated application sandboxes and archived tooling

## 2. Existing knowledge lifecycle

The repository already implements a three-layer Shared Brain model:

1. **Raw Sources**
   - `Inbox/`
   - `obsidian-vault/00-收件匣/`
   - `obsidian-vault/02-文獻與期刊/`
   - `research/`
   - `drafts/`
2. **Compiled Wiki**
   - `obsidian-vault/04-知識卡片/`
   - `obsidian-vault/01-專家與MOC/`
   - `obsidian-vault/03-診斷與檢查/`
   - `obsidian-vault/05-營運SOP與模板/`
3. **Schema / Protocol**
   - `SYSTEM-MEMORY-SCHEMA.md`
   - `KNOWLEDGE-COMPILER-PROTOCOL.md`
   - `.agents/workflows/knowledge-compiler.md`
   - `obsidian-vault/06-模板 (Templates)/`

The existing lifecycle is capture -> classify -> compile -> link -> apply -> distill. Knowledge maturity is currently represented as:

`🌱 new` -> `🔗 linked` -> `💡 applied` -> `🏛️ distilled`

KDF should not replace this lifecycle. It should add explicit research-question, evidence, human-gate, field-observation, mature-knowledge, and discovery objects inside the compiled-wiki layer.

## 3. Existing research pipeline

### Available components

- `skills/paper-researcher/`
  - PubMed E-utilities intake
  - topic configuration
  - PMID de-duplication
  - raw output to `Inbox/待深處理.md`
- `skills/paper-digest-core/`
  - study-type identification
  - decision-question extraction
  - evidence-aware findings
  - limitations and misuse risks
  - practical implications
  - calibrated `C1 / C2 / H` evidence language
- `obsidian-vault/06-模板 (Templates)/文獻卡-PaperNote.md`
  - research question, methods, sample, intervention/exposure, outcomes, limitations, implications, and links
- `obsidian-vault/06-模板 (Templates)/主題地圖-LitMap.md`
  - literature grouping, consensus, contradictions, gaps, and next questions
- `research-intelligence-hub`
  - optometry-specific search boundaries, evidence ranking, de-duplication, and anti-oversearch rules

### Missing named component

No tracked file or workflow named `lesson-prep-research-to-brand-article` exists in the live repository. PICO/PECO/PICo and an explicit overclaim firewall are also not packaged under that name.

### KDF decision

Do not invent a replacement monolith. The KDF research adapter will call the existing intake and digest capabilities, add a PICO/PECO/PICo question frame, require a reproducible search strategy, and serialize the result into an Evidence Card.

## 4. Existing knowledge compiler

`KNOWLEDGE-COMPILER-PROTOCOL.md`, `.agents/workflows/knowledge-compiler.md`, and `SOP-知識編譯工作流.md` already define:

- ingest while preserving raw sources
- map which canonical pages should change
- update before creating near-duplicates
- compile durable theses, uncertainty, contradictions, and backlinks
- query compiled pages first
- file useful synthesis back into the wiki
- lint duplicate, orphan, stale, contradictory, and uncompiled material

These capabilities are currently protocol-driven rather than implemented as one executable compiler. The monthly `system-evolution` workflow adds manual orphan, contradiction, and maturity review.

### KDF decision

Extend the existing workflow with a KDF adapter:

`Research Question -> Evidence Card -> Mature Knowledge candidate -> relation scan -> Discovery Question candidate`

Do not create a second compiler.

## 5. Existing content pipeline

### Available components

- `.agents/workflows/content-funnel.md`
  - SEO selection
  - a content-oriented mandala
  - audience and conversion scoring
  - article, lead magnet, LINE sequence, and funnel mapping
- `obsidian-vault/07-長篇專欄與企劃/曼陀羅九宮格-2026選題規劃.md`
  - content-angle mandala
- `.agents/workflows/cross-pollinate.md`
  - FB, email, store script, and blog-outline derivatives
- `skills/optometry-writer/`
  - brand prose and legal/safety review
- `skills/optometry-html-renderer/`
  - HTML rendering only
- `skills/uncle-glasses-blog-packager/`
  - canonical, schema, and publish-readiness packaging
- `obsidian-vault/10-歷史文章智庫/`
  - historical published content and a validated site-index schema

### Compatibility issue

`cross-pollinate` currently accepts a free-form topic or pain point directly. This conflicts with KDF's rule that formal platform content must originate from mature or human-approved knowledge. The referenced root `content-planning/` folder is absent in the live checkout even though several protocols still point to it.

### KDF decision

- preserve the existing content mandala and funnel
- add an input gate to `cross-pollinate`
- route the v0.1 draft to `obsidian-vault/07-長篇專欄與企劃/KDF/`, keeping the backlink inside the Obsidian graph
- require every KDF content asset to carry `source_knowledge`
- allow draft generation before publish approval, but prohibit automatic publication

## 6. Existing metadata and frontmatter

### Current conventions

Common existing fields include:

- `title`
- `type`
- `card_type`
- `tags`
- `source`
- `evidence_level`
- `maturity`
- `created`
- `last_updated`
- `related_projects`
- `applied_in`

The historical-article index has a separate, well-documented publishing schema. It should remain unchanged because it serves a different object type.

### Live-card audit

`obsidian-vault/04-知識卡片/` contained 99 Markdown cards at audit time:

- 64 had YAML frontmatter
- 35 had no frontmatter
- `type` appeared on 20 cards
- `card_type` appeared on 20 cards
- `maturity` appeared on 28 cards
- `evidence_level` appeared on 20 cards
- both `type: paper` and `card_type: PaperNote` are in active use

### KDF compatibility rules

- use existing `type`, not a new `card_type`, for KDF object identity
- use existing `last_updated`, not a competing `updated` field
- use existing `evidence_level` (`C1 / C2 / H`) for overall confidence
- allow `sources` as a plural KDF extension because an Evidence Card must synthesize multiple sources; legacy `source` remains valid outside KDF
- use existing `maturity` only as the Shared Brain maturity marker, not as a replacement for KDF `status`
- enforce strict KDF frontmatter only inside the KDF namespace; do not mass-migrate legacy cards

## 7. Existing validation tools

Available validation is narrow and task-specific:

- `scripts/build_site_index.py` parses and validates historical Blogger frontmatter
- `.agents/workflows/system-evolution.md` describes manual orphan and contradiction scans
- document and rendering checks exist for DOCX / HTML-related tasks

There is no generic Obsidian frontmatter validator, KDF ID validator, parent-graph validator, or KDF provenance checker.

Runtime constraints observed during audit:

- the system `python` launcher points to a missing Python 3.11 installation
- Codex's bundled Python is available but has no PyYAML
- no canonical `npm test`, lint script, or repository-wide test command is defined in `package.json`
- `rg.exe` is denied in this environment, so PowerShell targeted search is the reliable fallback

### KDF decision

Create one dependency-free Python validator using only the standard library and a deliberately constrained, JSON-compatible YAML subset for KDF frontmatter. It will validate only new KDF artifacts and therefore will not turn legacy metadata debt into a false KDF failure.

## 8. Capabilities that can be reused directly

1. Obsidian Wikilinks and backlinks
2. existing raw / compiled / protocol layer routing
3. PubMed intake and PMID de-duplication
4. paper digestion and `C1 / C2 / H` confidence language
5. literature maps for consensus, contradiction, and gap analysis
6. knowledge-compiler update-before-create policy
7. system-evolution orphan and contradiction concepts
8. content mandala and content-funnel scoring
9. writing, editorial, HTML, and Blogger packaging boundaries
10. historical site-index as the downstream published-content registry

## 9. Capabilities that must be added

1. stable KDF IDs and card types
2. KDF status state machine
3. three explicit human gates
4. Research Mandala distinct from Content Mandala
5. Evidence Card and Mature Knowledge candidate schemas
6. explicit separation of Evidence, Uncle Lens, Practice, and Field Observation
7. typed discovery relations and candidate-question provenance
8. source-knowledge gate for formal content assets
9. automatic KDF metadata, graph, provenance, and safety validation
10. a bounded KDF-001 fixture proving one complete path without generating 64 studies

## 10. Capabilities that must not be duplicated

- no new Obsidian vault
- no new website or dashboard
- no second knowledge compiler
- no second PubMed crawler
- no replacement paper-digest skill
- no replacement content mandala
- no replacement writing or publish stack
- no new graph UI
- no automatic publishing
- no mass metadata migration

## 11. KDF insertion points

| KDF concern | Existing insertion point | Action |
| --- | --- | --- |
| architecture and schema | `docs/kdf-engine/` | create bounded documentation |
| orchestration | `.agents/workflows/` | create `knowledge-discovery.md` |
| compile and discovery | `.agents/workflows/knowledge-compiler.md` | extend with adapter section |
| research intake / digestion | `paper-researcher` + `paper-digest-core` | reuse through adapter |
| templates | `obsidian-vault/06-模板 (Templates)/` | add 9 KDF templates |
| KDF cards | `obsidian-vault/04-知識卡片/KDF/` | create isolated KDF namespace |
| content draft | `obsidian-vault/07-長篇專欄與企劃/KDF/` | create gated draft with backlink |
| platform compiler | `.agents/workflows/cross-pollinate.md` | add knowledge-source gate |
| validation | `scripts/` | add one dependency-free validator |

## 12. Potential compatibility risks

| Risk | Evidence | Mitigation |
| --- | --- | --- |
| metadata drift | active cards mix `type`, `card_type`, and no frontmatter | validate KDF only; reuse dominant existing names |
| false maturity | a file named Mature Knowledge may not have passed human review | permit a mature-knowledge candidate object but keep `human_review: pending` and `discovery_ready: false` |
| observation promoted as evidence | current cards sometimes blend interpretation and practice language | hard-require `observation_is_evidence: false` |
| unsafe content shortcut | `cross-pollinate` accepts raw topics | require approved knowledge input for formal content; raw topics remain ideation-only |
| Research vs Content Mandala collision | existing mandala is conversion/content-oriented | add an explicitly named Research Mandala without changing the existing one |
| broken links from filename changes | existing wiki relies heavily on filenames | use stable ID filenames for KDF cards and ID-based Wikilinks |
| legacy test debt | no canonical repository test suite | publish exact bounded validation commands and do not claim repository-wide coverage |
| missing named research workflow | requested workflow is not present | compose existing research capabilities; document the absence instead of fabricating reuse |
| missing `content-planning/` | protocols reference a path absent from this checkout | use `obsidian-vault/07-長篇專欄與企劃/KDF/` for v0.1 and leave old references untouched |
| industry-funded evidence | several lens-design studies report manufacturer funding or affiliations | preserve conflict-of-interest notes and avoid product-wide causal generalization |

## 13. Audit conclusion

The repo already has strong storage, compilation, evidence-digestion, linking, content, and publish layers. The missing layer is not another content generator; it is a small typed state and provenance layer connecting questions, evidence, human interpretation, practice, field observation, mature knowledge, relations, and new candidate questions.

The lowest-risk v0.1 is therefore an adapter plus strict fixtures and validation, not a rewrite.
