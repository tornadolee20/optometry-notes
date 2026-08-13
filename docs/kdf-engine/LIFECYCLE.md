# KDF Lifecycle v0.1

## Canonical lifecycle

`Discover -> Decompose -> Research -> Evidence -> Think -> Field -> Publish -> Mature -> Cross-link -> Discover Again`

The persisted state sequence is:

```text
idea
  -> decomposed
  -> researching
  -> evidence-ready
  -> waiting-human
  -> thinking
  -> field-observation
  -> content-ready
  -> published
  -> mature
  -> discovery
```

`candidate` is a type-local pre-state used only by `discovery-question`. It does not enter `researching` until a human approves it.

## Transition rules

- normal transitions move one step forward
- `evidence-ready -> researching` is allowed only when Gate 1 requests more research
- `waiting-human -> researching` is allowed only when Gate 1 requests more evidence
- `content-ready -> thinking` is allowed when Gate 3 rejects the framing
- no other stage skipping or regression is allowed
- a file's existence does not prove that the root topic reached the file's nominal stage
- the root topic `state_history` is the authoritative lifecycle trace

## Human gates

### Gate 1: Evidence Review

Required before moving from `waiting-human` to `thinking`:

- citations resolve to the stated source
- conclusions match the study design
- material conflicting evidence is represented
- the search is sufficient for this bounded question

Allowed outcomes: `approved`, `revision-required`, `pending`.

### Gate 2: Uncle Lens

Required before an Uncle Lens claim can be compiled:

- the observation or perspective came from the user or a cited first-person source
- AI wording did not create a store experience, customer quote, or frequency claim
- the user confirmed the structured interpretation

`observation_is_evidence` must always be `false`.

### Gate 3: Publish Review

Required before `content-ready -> published` for medical, health, child, optometry, regulatory, controversial, or causal claims.

Draft generation is allowed before approval. Public release is not.

## KDF-001 v0.1 gate state

- Gate 1: `pending`; research synthesis exists but no human evidence review has been recorded
- Gate 2: `approved`; the first observation and questions were supplied directly in the implementation request
- Gate 3: `pending`; the content object is a private draft only

Therefore KDF-001 may contain an Evidence Card, an Uncle Lens Card, a Practice Card, a Field Observation framework, a Mature Knowledge candidate, a content draft, and a Discovery candidate while the root lifecycle remains `waiting-human`.

## Field Observation boundary

Field Observation is an operational log, not human-subject research and not a validated questionnaire.

- it may capture situations, self-reported impact, adaptation timing, and follow-up prompts
- it must not assert efficacy, causality, prevalence, or clinical validation
- the 0-3 scale is a local work-observation scale only
- every use requires consent, privacy minimization, and appropriate referral when safety is affected

## Content propagation

Every downstream KDF content asset stores `source_knowledge`.

When a source Mature Knowledge Card is materially updated:

1. find its backlinking assets
2. set those assets to `update-needed`
3. keep them unpublished until reviewed again when the change affects a safety claim
