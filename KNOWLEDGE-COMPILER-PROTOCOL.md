# KNOWLEDGE-COMPILER-PROTOCOL.md

> Goal: turn this workspace from a good memory system into a living, compiled knowledge system.

## Core Shift

Do not treat the knowledge base as a pile of files waiting to be searched.

Treat it as a persistent wiki that gets rewritten, linked, checked, and enriched every time new source material arrives.

In short:

- RAG asks: "Which chunks are relevant right now?"
- Knowledge compilation asks: "What should permanently change in the wiki after reading this?"

This workspace should prefer the second question.

## The Three Layers

### 1. Raw Sources

Purpose: keep the original material intact.

Typical locations:

- `Inbox/`
- `obsidian-vault/02-文獻與期刊/`
- `research/`
- `drafts/`
- transcript files, PDFs, clipped web pages

Rules:

- preserve the original wording or file when possible
- do not overwrite source material with interpretation
- sources are evidence, not the final knowledge asset

### 2. Compiled Wiki

Purpose: hold the durable, structured, cross-linked interpretation of the sources.

Typical locations:

- `obsidian-vault/04-知識卡片/`
- `obsidian-vault/01-專家與MOC/`
- `obsidian-vault/03-診斷與檢查/`
- `obsidian-vault/05-營運SOP與模板/`

Rules:

- every meaningful read should improve at least one existing page or create one new durable page
- prefer updating existing pages over creating near-duplicates
- link concepts, claims, people, studies, and workflows
- mark contradictions instead of hiding them

### 3. Schema / Protocol

Purpose: tell the model how to compile the wiki consistently.

Typical locations:

- `SYSTEM-MEMORY-SCHEMA.md`
- `BRAIN-ARCHITECTURE.md`
- this file
- `.agents/workflows/knowledge-compiler.md`
- templates under `obsidian-vault/06-模板 (Templates)/`

Rules:

- schema should stay stable unless the current structure keeps failing
- protocol changes are rarer than note updates
- when in doubt, change the page before changing the whole schema

## The Five Core Actions

### 1. Ingest

Trigger: a new article, transcript, paper, PDF, thread, or note enters the system.

What to do:

1. Save the source in a raw location.
2. Decide whether it is worth compilation.
3. Extract the key entities, claims, mechanisms, tensions, and reusable ideas.
4. Identify which existing wiki pages should change.

Output:

- source preserved
- compilation target list identified

### 2. Compile

Trigger: the source has enough signal to justify lasting changes.

What to do:

1. Update existing knowledge cards first.
2. Create a new card only if the idea does not fit an existing page cleanly.
3. Add:
   - distilled thesis
   - why it matters
   - where it fits in the system
   - contradictions or uncertainty
   - backlinks to related cards

Output:

- one or more updated wiki pages
- clearer links between old and new knowledge

### 3. Query

Trigger: a question requires synthesis across the compiled wiki.

What to do:

1. Query the compiled pages first.
2. Only go back to raw sources when the wiki is thin, conflicting, or outdated.
3. Treat the answer as a synthesis pass, not merely a search result.

Output:

- answer grounded in durable notes first
- identified wiki gaps when the answer feels weak

### 4. File Back

Trigger: a good answer, comparison table, framework, or analysis emerges during a query.

What to do:

1. Decide whether the output will matter again.
2. If yes, save it back into the wiki as a card, section update, or MOC addition.
3. Do not let valuable synthesis vanish inside chat history.

Output:

- query results become future assets

### 5. Lint

Trigger: periodic maintenance or visible wiki drift.

What to check:

- duplicate cards
- orphan pages with no backlinks
- outdated summaries
- unresolved contradictions
- raw sources that were never compiled
- mature cards that should be promoted into SOPs, MOCs, or skills

Output:

- a cleaner and more trustworthy wiki

## Decision Rule: What Must Happen After Reading

After every meaningful source, answer these four questions:

1. What new thing is now true, useful, or worth tracking?
2. Which existing page should be updated because of it?
3. What tension, contradiction, or boundary became clearer?
4. Should this become:
   - a card
   - a section inside an existing card
   - an MOC update
   - an SOP
   - a skill improvement

If none of these change, the material was probably only stored, not compiled.

## Workspace Mapping

Use this default routing:

- raw capture:
  - `Inbox/`
  - `obsidian-vault/00-收件匣/`
  - `obsidian-vault/02-文獻與期刊/`
- compiled knowledge:
  - `obsidian-vault/04-知識卡片/`
  - `obsidian-vault/01-專家與MOC/`
  - `obsidian-vault/03-診斷與檢查/`
- reusable operating knowledge:
  - `obsidian-vault/05-營運SOP與模板/`
- note templates:
  - `obsidian-vault/06-模板 (Templates)/`

## Default Page Types

Prefer compiling into one of these durable forms:

- `文獻卡`: a paper or source with evidence-focused distillation
- `概念卡`: a mechanism, theory, distinction, or model
- `人物/框架卡`: a thinker, method, or worldview
- `判讀卡`: a clinical interpretation rule or decision aid
- `MOC`: an index page that organizes a topic cluster
- `SOP`: a repeatable operating workflow

## Anti-Patterns

Avoid these failure modes:

- uploading a source and never changing the wiki
- creating a new note when an old note should have been updated
- treating chat answers as disposable
- mixing raw evidence with final claims without labels
- collecting PDFs faster than the wiki can absorb them

## Success Condition

The protocol is working when:

- new reading changes old pages
- questions get easier over time
- fewer answers depend on re-reading everything from scratch
- the wiki becomes more linked, not more cluttered
- your best analyses persist as assets instead of disappearing in conversation
