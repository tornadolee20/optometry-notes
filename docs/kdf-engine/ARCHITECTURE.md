# KDF Engine v0.1 Architecture

## Product boundary

KDF is a typed adapter layer inside the existing Shared Brain. It is not a new vault, search product, knowledge compiler, research crawler, content generator, graph UI, or publishing system.

Its responsibility is to preserve this loop as reconstructable knowledge objects:

`Question -> Evidence -> Insight -> Practice -> Content -> Knowledge -> Relation -> Discovery -> New Question`

## Reuse / Extend / Create

### Reuse

- Shared Brain raw / compiled / protocol layers
- Obsidian Wikilinks and backlinks
- `paper-researcher` for intake
- `paper-digest-core` for evidence digestion and `C1 / C2 / H` calibration
- `knowledge-compiler` for update-before-create, contradiction marking, and file-back
- content funnel and Content Mandala after knowledge maturity
- writing, QA, HTML, and Blogger packaging layers

### Extend

- add a KDF adapter to `knowledge-compiler`
- add a provenance gate to `cross-pollinate`
- add KDF-specific validation without imposing a migration on legacy notes

### Create

- KDF lifecycle, metadata, relation, and test specifications
- nine KDF templates
- one `knowledge-discovery` orchestration workflow
- one namespaced KDF-001 fixture
- one dependency-free validator

## Four layers of reasoning

```text
Evidence
  What do external sources support, and at what confidence?
    |
Gap
  What was not measured, is inconsistent, or does not generalize?
    |
Uncle Lens
  What question or observation did the human actually provide?
    |
Practice
  What should be asked, observed, tracked, or referred without overclaiming?
```

`Observation != Evidence` is a schema invariant, not editorial advice.

## Component flow

```text
Root Topic
  -> 8 Mother Topics (Research Mandala skeleton)
  -> one approved Research Question
  -> existing research intake and digestion
  -> Evidence Card
  -> Gate 1: Evidence Review
  -> Uncle Lens (human-sourced only)
  -> Gate 2: Uncle Lens confirmation
  -> Practice Card + Field Observation framework
  -> Mature Knowledge candidate
  -> Draft Content Asset
  -> Gate 3: Publish Review
  -> published / mature state
  -> relation scan across two or more cards
  -> Candidate Discovery Question
  -> human approval before the next research cycle
```

## Storage map

| Object | Location |
| --- | --- |
| protocol and schema | `docs/kdf-engine/` |
| orchestration | `.agents/workflows/knowledge-discovery.md` |
| templates | `obsidian-vault/06-模板 (Templates)/KDF/` |
| KDF fixture cards | `obsidian-vault/04-知識卡片/KDF/KDF-001/` |
| draft content asset | `obsidian-vault/07-長篇專欄與企劃/KDF/` |
| validator | `node mcp-servers/kdf-chatgpt-bridge/dist/cli.js validate` |

## Research Mandala vs Content Mandala

| Model | Input | Question | Output |
| --- | --- | --- | --- |
| Research Mandala | root knowledge uncertainty | what is worth investigating? | 8 mother topics, then bounded research questions |
| Content Mandala | mature or approved knowledge | what is worth translating for an audience? | platform-specific content angles |

The existing Content Mandala remains unchanged. KDF v0.1 creates only eight mother-topic skeletons and executes one research question.

## Knowledge Compiler adapter contract

The adapter does not replace the existing compiler. It supplies typed inputs and outputs:

```text
KDF Research Question
  -> paper-researcher / targeted search
  -> paper-digest-core
  -> KDF Evidence Card
  -> existing compile/update/deduplicate/backlink rules
  -> Mature Knowledge candidate
  -> typed relation scan
  -> Discovery Question candidate
```

## Human-gated maturity

Creating a file whose `type` is `mature-knowledge` does not mean the knowledge has reached the `mature` lifecycle state.

- before Gate 1 and Gate 3: it is a candidate with `human_review: pending` and `discovery_ready: false`
- after required reviews and publication feedback: its status may progress to `mature`
- a discovery question may be drafted from evidence plus a mature candidate, but it cannot enter research until `human_approved: true`

This separation lets v0.1 test the complete artifact chain without faking human approval.

## Planned file changes

### New

- six documents under `docs/kdf-engine/`
- nine templates under `obsidian-vault/06-模板 (Templates)/KDF/`
- `.agents/workflows/knowledge-discovery.md`
- `mcp-servers/kdf-chatgpt-bridge/src/validator.ts`
- KDF-001 cards under `obsidian-vault/04-知識卡片/KDF/KDF-001/`
- one content draft under `obsidian-vault/07-長篇專欄與企劃/KDF/`

### Extended

- `.agents/workflows/knowledge-compiler.md`
- `.agents/workflows/cross-pollinate.md`

### Explicitly unchanged

- legacy cards and their frontmatter
- existing folder layout outside the KDF namespace
- `SYSTEM-MEMORY-SCHEMA.md`
- content funnel and existing Content Mandala
- historical article schema and generated site indexes
- publishing scripts and credentials
