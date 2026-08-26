# KDF Engine v0.1 Test Plan

## Scope

The test target is the KDF namespace and the KDF-created content draft. Legacy cards are scanned only to resolve Wikilink targets; their historical metadata debt is not reclassified as a KDF failure.

## Automated checks

### Metadata

- frontmatter exists and parses
- common required fields exist
- type, status, evidence level, gap status, and review values are valid
- ID format matches type
- file stem equals stable ID for KDF cards
- type-specific fields exist
- parent target exists

### Graph

- every Wikilink introduced by KDF resolves to a Markdown filename
- every non-root KDF card has an incoming KDF link
- explicit relation targets resolve

### Provenance and safety

- Evidence Cards have at least one source
- Uncle Lens has `observation_is_evidence: false`
- Field Observation has both `observation_is_evidence: false` and `validated_questionnaire: false`
- Mature Knowledge links Evidence, Uncle Lens, and Practice
- Discovery candidates have two origin cards, reason, missing evidence, and human approval state
- Content Draft has `source_knowledge`
- unapproved content cannot be `published`
- unapproved discovery cannot be `researching`

### Fixture shape

- exactly one KDF-001 Root Topic
- exactly eight Mother Topics
- exactly one Research Question in v0.1
- complete candidate artifact chain for `KDF-001-B-001`
- one content draft
- one Discovery candidate

## Commands

Use the bundled Python runtime because the system Python launcher is broken in this checkout:

```powershell
node mcp-servers\kdf-chatgpt-bridge\dist\cli.js validate
```

Additional review:

```powershell
git diff --check
git status --short
```

The validator also parses every KDF Markdown frontmatter block and reports broken KDF-introduced Wikilinks.

## Existing-test baseline

`package.json` defines dependencies only and has no `scripts` section. The repository has no canonical root test or lint command. Existing tests are isolated utilities for presentation, translation, document conversion, site-index generation, or embedded application sandboxes; they do not form a KDF-relevant repository suite.

KDF review will therefore:

1. run the KDF validator
2. run `git diff --check`
3. syntax-check the validator with bundled Python
4. ensure the pre-existing `scripts/build_site_index.py` still compiles
5. report the lack of a canonical repository-wide suite instead of claiming it passed

## Manual gates not automatable

- Gate 1 evidence interpretation and completeness
- Gate 2 confirmation of any future Uncle Lens input not already supplied by the user
- Gate 3 medical / child / optometry publish approval
- authenticated Obsidian visual inspection
- real-world usability of the Field Observation framework
