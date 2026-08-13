---
description: KDF Engine workflow for turning one approved research question into evidence, human-gated interpretation, practice, field observation, mature knowledge, content drafts, relations, and a candidate discovery question.
---

# /knowledge-discovery

Use this workflow when the user asks to run or extend the Knowledge Discovery Engine.

The workflow is an adapter over existing research, knowledge-compiler, and content capabilities. Do not replace them.

## Non-negotiable boundaries

- `Reuse > Extend > Create`
- v0.1 runs one selected research question, not 64 studies
- Research Mandala and Content Mandala are separate
- `Observation != Evidence`
- AI may ask for or structure an Uncle Lens; it may not invent one
- Field Observation is not a validated questionnaire or human-subject study
- no automatic medical conclusion or public release
- a Discovery Question remains a candidate until human approval

## Inputs

Required:

- stable Root Topic ID
- one selected Mother Topic
- one bounded Research Question
- owner of each Human Gate

Optional:

- user-supplied field observation
- existing knowledge cards
- desired downstream draft platform

## Workflow

### 1. Audit and map

Before creating objects:

1. search the compiled wiki for the topic and near-duplicates
2. identify existing sources, cards, MOCs, and content
3. decide what to update and what must be new
4. record the choice as `Reuse / Extend / Create`

### 2. Decompose with Research Mandala

Create:

- one Root Topic
- exactly eight Mother Topic skeletons
- only the selected Research Question for v0.1

Do not populate the other seven branches with research questions.

### 3. Frame the research question

Use PICO, PECO, PICo, or an explicitly justified alternative. Persist:

- population
- intervention or exposure
- comparator
- outcomes
- search strategy
- evidence hierarchy
- stopping condition

### 4. Reuse research intake and evidence digestion

Use existing components in this order when relevant:

1. `paper-researcher` or a bounded source search
2. `research-intelligence-hub` boundaries for optometry research
3. `paper-digest-core` for study design, findings, limitations, and `C1 / C2 / H`

Stop searching when important disagreement is covered, results are mostly duplicates, or no new high-value evidence is found.

### 5. Create the Evidence Card

The Evidence Card must include multiple-source synthesis when available:

- actual research question and search date
- reproducible search strategy
- sources and study designs
- population, exposure, comparator, and outcomes
- main results and limitations
- conflicting evidence
- what is known and unknown
- what can and cannot be concluded

Then stop at Gate 1 unless a human Evidence Review is recorded.

### 6. Build the Uncle Lens safely

AI may generate questions from the Evidence and Gap. AI must leave the perspective empty until direct human input or a cited first-person source exists.

When input exists:

1. preserve the original human wording
2. structure it without adding frequency or certainty
3. set `observation_is_evidence: false`
4. record the human source
5. request or record confirmation at Gate 2

### 7. Build Practice and Field Observation objects

Practice asks what can be:

- asked
- observed
- tracked
- used in a defined context
- referred

It must also state conclusions that remain disallowed.

Field Observation may provide a local work-observation scale, but must set:

- `validated_questionnaire: false`
- `observation_is_evidence: false`

### 8. Compile a Mature Knowledge candidate

Call the KDF adapter in `/knowledge-compiler`.

The candidate must link Evidence, Uncle Lens, and Practice and include:

- evidence summary, confidence, and gap
- confirmed human perspective only
- field-observation status
- professional boundary
- published assets and feedback, even if empty
- related, supporting, and contradictory knowledge
- open questions and hypotheses

Before Gate 1 and Gate 3 approval, keep:

- `status: waiting-human`
- `human_review: pending`
- `discovery_ready: false`

### 9. Create a private content draft

A Mature Knowledge candidate may create a **private review draft only**. It may enter the formal platform compiler only after the required Human Gates pass. Another Knowledge Card must be explicitly approved for content use before it can enter that compiler.

Every content asset must have:

- unique content ID
- platform
- `source_knowledge`
- `publish_approved: false` by default

Do not publish. Gate 3 controls publication.

### 10. Run relation discovery

Compare at least two Evidence or Mature Knowledge objects. Use only the relation vocabulary in `docs/kdf-engine/DISCOVERY-RELATIONS.md`.

The output may be a Candidate Research Question with:

- origin cards
- relation type and reason
- missing evidence
- priority
- `human_approved: false`

It cannot enter research automatically.

### 11. Validate and file back

Run:

```powershell
& 'C:\Users\torna_3j3fz9h\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' scripts/validate_kdf.py
```

Then apply the existing compiler's update, backlink, and lint rules. Report all pending Human Gates as pending, not passed.

## Output summary

Return:

- Root and selected branch
- research source set and confidence
- Gate 1 / 2 / 3 status
- created or updated cards
- draft content status
- Discovery candidate and approval status
- validation result
- known evidence and execution limits
