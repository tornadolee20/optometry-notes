---
description: Compile new source material into the persistent wiki instead of leaving it as raw storage or one-off chat output.
---

# /knowledge-compiler

Use this workflow when a new source should improve the knowledge system itself.

The goal is not merely to summarize the source.

The goal is to decide what permanent change the source should cause inside the wiki.

## When To Use

Use when at least one of these is true:

- a new paper, article, transcript, or web clip contains reusable signal
- a question requires synthesis across multiple notes
- a good answer should be saved back into the system
- the wiki has drifted and needs contradiction / orphan / duplication checks

## The Workflow

### 1. Ingest

- Save the source in a raw layer:
  - `Inbox/`
  - `obsidian-vault/02-文獻與期刊/`
  - another source-appropriate folder
- Record basic metadata:
  - title
  - source type
  - date
  - why it matters

### 2. Map The Change

Before writing, identify:

- existing cards that should be updated
- whether a new card is truly needed
- which MOC or index page should gain a link
- what contradiction, tension, or uncertainty should be marked

### 3. Compile

Update the wiki using this priority:

1. existing knowledge card
2. existing MOC
3. new card only if the idea has no clean home

Every compiled output should try to include:

- the core thesis
- why it matters
- what it changes in the current system
- what remains uncertain
- links to adjacent cards

### 4. Query

When answering from the knowledge base:

- search compiled pages first
- return to raw sources only when needed
- note the gaps if the answer depends too heavily on raw material

### 5. File Back

If a query produced a strong synthesis, save it back as one of:

- a new card
- a section added to an existing card
- an MOC update
- an SOP refinement

If it would likely matter again, do not leave it trapped in chat.

### 6. Lint

Periodically inspect for:

- duplicate notes
- orphan notes
- outdated summaries
- unresolved contradiction markers
- raw sources without compiled outputs

## Output Targets

Use these default destinations:

- source preserved:
  - `obsidian-vault/02-文獻與期刊/`
- durable knowledge:
  - `obsidian-vault/04-知識卡片/`
- topic organization:
  - `obsidian-vault/01-專家與MOC/`
- operating workflow:
  - `obsidian-vault/05-營運SOP與模板/`

## Decision Prompt

After reading a source, answer all of these:

1. What should the wiki now know that it did not know before?
2. Which existing page should change because of this?
3. What new distinction, contradiction, or boundary became visible?
4. Should the result become a card, MOC update, SOP, or skill change?

If you cannot answer these, the source has not yet been compiled.

## KDF Adapter

Use this adapter when the input carries a stable KDF ID or comes from `/knowledge-discovery`.

The adapter extends the existing compiler; all update-before-create, canonical-page, contradiction, backlink, and lint rules above still apply.

### Evidence Card -> Mature Knowledge candidate

Required inputs:

- one KDF Research Question
- one Evidence Card with source provenance
- one human-sourced Uncle Lens Card
- one Practice Card

Optional input:

- Field Observation records, explicitly labeled as observation rather than evidence

Compile into a `mature-knowledge` object that preserves:

- the original question
- evidence summary, confidence, and unresolved gap
- only confirmed human perspective
- practice implications and professional boundary
- links back to Evidence, Uncle Lens, Practice, and Field Observation
- supporting, contradictory, and related knowledge
- open questions and hypotheses

Creating this object does not itself grant the `mature` lifecycle state. Until required Human Gates pass, keep `status: waiting-human`, `human_review: pending`, and `discovery_ready: false`.

### Mature Knowledge -> relation scan -> Discovery Question

Compare at least two Evidence or Mature Knowledge objects using the relation vocabulary in `docs/kdf-engine/DISCOVERY-RELATIONS.md`.

The compiler may create a `discovery-question` candidate only. It must persist:

- two or more origin cards
- relation type and reason
- missing evidence
- priority
- `human_approved: false` by default

An unapproved candidate must not enter research.

### Content file-back

When a Mature Knowledge object creates a content asset:

- add `source_knowledge`
- add the asset to `published_assets` only after publication
- if evidence changes materially, mark backlinking assets `update-needed`
- never publish from this adapter
