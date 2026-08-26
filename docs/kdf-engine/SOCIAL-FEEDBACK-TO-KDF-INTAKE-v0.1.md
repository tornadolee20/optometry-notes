# Social Feedback to KDF Intake v0.1.2

Status: owner-approved staging contract
Contract revision: SOCIAL_FEEDBACK_TO_KDF_INTAKE_V0_1_2
Wire schema version: SOCIAL_FEEDBACK_TO_KDF_INTAKE_V0_1
Validator version: social-feedback-kdf-intake-validator-v0.1.2

V0.1.2 is a wire-compatible state-machine revision of the v0.1 staging
contract. The
top-level `schema_version` remains `SOCIAL_FEEDBACK_TO_KDF_INTAKE_V0_1`; this
revision preserves the v0.1.1 comparison rules and adds one bounded terminal
non-formal route: an Owner-approved `HOLD` may close as
`CONTENT_CLARIFICATION` when the recommendation is `CONTENT_ONLY`.

## 1. Purpose

This contract preserves manually supplied audience and field feedback before any
formal KDF write is considered. It is a staging boundary, not a formal KDF card
type, not an Evidence source, and not an MCP or Bridge extension.

The contract shares upper-level governance semantics with Agent-Reach Intake:
explicit provenance, structured duplicate analysis, Reuse / Extend / Create /
Hold, an Owner Gate, and a non-command route ledger. It deliberately uses a
separate schema, validator, storage path, privacy model, and route model.

## 2. Storage and indexing boundary

Future real batches belong under:

    obsidian-vault/00-收件匣/KDF/social-feedback-intake/

Each manual intake run is one JSON batch. Intake JSON:

- is outside the formal KDF roots;
- is not Markdown and does not use `type: capture`;
- is not indexed by `VaultRepository.captureRecords()`;
- is not validated as a formal KDF card;
- cannot call an MCP tool or Bridge service;
- cannot create or update a Research Question, Evidence Card, Discovery
  Question, Uncle Lens, Practice Card, Field Observation, Mature Knowledge, or
  Content Draft.

V0.1 adds only a synthetic fixture. It does not add a real feedback batch.

## 3. Ingest boundary

V0.1 accepts only manually supplied material:

- `MANUAL_ENTRY`
- `OWNER_PROVIDED_TRANSCRIPT`
- `OWNER_PROVIDED_SUMMARY`

Every batch explicitly records that APIs, cookies, and private login state were
not used. Supporting an authenticated platform or automated collector requires
a later versioned contract; it must not be enabled by silently weakening v0.1.

## 4. Candidate defaults

Producers must explicitly emit:

- `owner_review_status: PENDING`
- `intake_state: STAGED`
- the exact initial route ledger:

```json
{
  "route_status": "NOT_STARTED",
  "route_action": "NONE",
  "target_flow": "NONE",
  "formal_ids": []
}
```

JSON Schema annotations never insert missing values. Approval and routing are
never inferred.

## 5. Feedback is never Evidence

The candidate schema does not expose `evidence_level`. Any occurrence of an
`evidence_level` key in a candidate fails validation, including for a
`HYPOTHESIS` or `RESEARCH_LEAD`.

`evidence_relevance` describes only why feedback might be useful for asking a
question, locating a gap, reviewing implementation, or clarifying content. It
always carries:

- `evidence_card_eligible: false`
- `influenced_by_engagement_metrics: false`

Feedback cannot create an Evidence Card, change an existing Evidence Card,
lower an evidence level, or become a formal `SUPPORTS` or `CONTRADICTS`
relation.

## 6. Provenance and privacy

`captured_at` is when the intake record was made. `source_occurred_at` is when
the upstream feedback occurred. Both fields must be present and remain
distinct; an unknown occurrence time is `null`, not a copy of `captured_at`.

`source_context` always records:

- visibility;
- locator type and locator;
- source occurrence time;
- capture method and recorder;
- record verification status;
- text fidelity and redaction status;
- privacy class and consent basis;
- the SHA-256 of the stored `original_text`;
- explicit PII minimization;
- explicit absence of cookies, tokens, and login data.

The hash covers the exact UTF-8 string stored in `original_text`. The validator
does not normalize or rewrite it.

A valid public URL must be supplied only when the upstream record actually has
one. Missing URLs remain absent through a `null` locator or a non-URL opaque
reference; no URL is inferred or invented.

Private, closed-group, and in-person material must not use public privacy
classification or `VERBATIM_PUBLIC`. It requires either redaction or an
explicitly recorded basis for retaining the supplied text. PII minimization is
mandatory, especially for minors, health information, private messages, and
client interactions.

## 7. Feedback taxonomy

`feedback_type` is one of:

- `QUESTION`
- `COUNTEREXAMPLE`
- `MISUNDERSTANDING`
- `FIELD_OBSERVATION_CANDIDATE`
- `HYPOTHESIS`
- `RESEARCH_LEAD`
- `PRACTICE_SIGNAL`
- `CONTENT_REACTION`
- `NOISE`

`kdf_recommendation` is one of:

- `ENTER_RESEARCH_INTAKE`
- `HOLD_FOR_VERIFICATION`
- `CONTENT_ONLY`
- `PRACTICE_REVIEW`
- `REJECT`

`NOISE` must use `REJECT`. `MISUNDERSTANDING` defaults to content
clarification. It may use `ENTER_RESEARCH_INTAKE` only when the structured gap
assessment identifies a real gap and a bounded candidate question.

## 8. Anecdote safety

Every candidate carries structured `anecdotal_scope` with:

- `prevalence_inference_allowed: false`
- `generalization_allowed: false`

One feedback item cannot imply prevalence, success rate, failure rate, or
population frequency. Multiple similar comments remain multiple uncounted
observations unless a separate, appropriate research design supplies a defined
population and denominator.

The schema and validator reject unsupported engagement or pseudo-frequency
fields such as likes, views, shares, reactions, followers, reach, engagement
rate, comment counts, prevalence, success rate, and failure rate. Popularity may
affect a content team's operational queue outside this contract, but never
evidence relevance or a KDF recommendation.

## 9. Counterexample safety

A `COUNTEREXAMPLE` requires:

- a target claim or target KDF node;
- structured population, intervention/exposure, comparator, outcome,
  mechanism, context, and timeframe comparison;
- alternative explanations;
- `existing_evidence_invalidated: false`;
- `formal_contradiction_created: false`.

A single case can identify responder heterogeneity, implementation differences,
scope mismatch, or a research gap. It cannot invalidate a research synthesis or
turn an apparent conflict into a formal KDF contradiction.

## 10. Cross-node assessment

Every candidate records a structured comparison against the existing:

- Root Topic;
- Mother Topic;
- Research Question;
- Evidence Card;
- Mature Knowledge;
- Discovery Question.

Practice, Field Observation, Uncle Lens, or Content Draft may also be checked
when relevant. Literal similarity alone is insufficient. Comparisons cover
population, intervention/exposure, comparator, outcomes, mechanism, context,
timeframe, claim strength, and research-gap alignment.

Every `cross_node_analysis.matches[]` item explicitly records
`comparison.claim_strength` as one of:

- `SAME`: equivalent scope and strength;
- `STRONGER`: the feedback asserts more than the matched node;
- `WEAKER`: the feedback is narrower or weaker than the matched node;
- `DIFFERENT_SCOPE`: populations, outcomes, mechanisms, contexts, or other
  material boundaries differ;
- `UNKNOWN`: the available information cannot support a comparison;
- `NOT_APPLICABLE`: no meaningful claim-strength comparison exists.

Every match also explicitly records `comparison.research_gap_alignment` as one
of:

- `SAME_GAP`: the gap is already represented by the matched node;
- `EXTENDS_EXISTING_GAP`: the feedback adds a population, context, outcome,
  predictor, timeframe, mechanism, or practical dimension;
- `NEW_GAP`: a bounded gap is absent from the matched node;
- `NO_GAP`: the feedback exposes no research gap;
- `UNKNOWN`: the available information cannot support a gap comparison;
- `NOT_APPLICABLE`: research-gap comparison does not apply.

Neither field is inferred. `rationale` explains the assessment but cannot
replace either structured value. A `MISUNDERSTANDING` routed to `CONTENT_ONLY`
normally uses `NO_GAP`. A `CASE_VARIATION` may use `SAME` or
`DIFFERENT_SCOPE`, depending on the bounded comparison.

The decision is one of `REUSE`, `EXTEND`, `CREATE`, or `HOLD`.
`existing_node_alignment` is one of:

- `CONSISTENT_WITH`
- `APPARENT_CONFLICT`
- `CASE_VARIATION`
- `NEW_GAP`
- `QUESTION_CANDIDATE`
- `RELATED_ONLY`
- `UNRESOLVED`

These are staging assessments. They do not write formal relationship edges.

Decision safeguards:

- `EXTEND` requires at least one matched node whose gap alignment is
  `EXTENDS_EXISTING_GAP` or `NEW_GAP`.
- `CREATE` requires a bounded `NEW_GAP` match, or a structured bounded gap and
  question candidate explaining why no existing node can contain it. Lexical
  novelty is insufficient.
- `REUSE` may use `SAME_GAP` or `NO_GAP`.

## 11. Duplicate rules

Duplicate analysis records source-level, intake-level, and formal KDF matches.
It must include a level, decision, reason, checked timestamp, method version,
matched feedback IDs, matched KDF IDs, and comparison dimensions.

- `HIGH` must `HOLD` and use `HOLD_FOR_VERIFICATION`.
- `CONFIRMED_DUPLICATE` must `REUSE` and identify a matched feedback or KDF ID.
- `REUSE` and `EXTEND` require at least one matched ID.
- `CREATE` requires the mandatory cross-node types to have been checked.

## 12. Field Observation Gate

`FIELD_OBSERVATION_CANDIDATE` remains intake JSON. It is not a formal Field
Observation and cannot call `kdf_add_observation`.

A later `READY` route to `FORMAL_FIELD_OBSERVATION` requires an existing formal
Research Question and Practice Card, complete provenance and privacy review,
Owner approval, an exact dry-run, and separate write authorization. The
validator checks prerequisite IDs read-only and never performs the write.

If a Practice Card is missing, the candidate must remain `PRACTICE_REVIEW` or
`HOLD_FOR_VERIFICATION`.

## 13. Owner Gate and route ledger

`owner_review_status` is `PENDING`, `APPROVED`, or `REJECTED`.
`APPROVED` and `REJECTED` require `reviewed_by`, timezone-aware `reviewed_at`,
and `review_note`.

Approval authorizes only the recorded disposition or proposal. It is not formal
write authorization.

Route states are:

- `NOT_STARTED`: exact initial ledger, PENDING/STAGED, no formal IDs.
- `READY`: APPROVED/STAGED, a bounded REUSE/EXTEND/CREATE proposal, no promoted
  formal IDs, and no route completion metadata.
- `ROUTED`: APPROVED/CLOSED with complete route metadata. Formal routes require
  existing formal IDs. V0.1.2 also permits the strictly bounded non-formal
  `HOLD` closure described below.
- `REJECTED`: REJECTED/CLOSED, no formal IDs.

A terminal `ROUTED` + `HOLD` is valid only when every condition below holds:

- `owner_review_status` is `APPROVED`;
- `intake_state` is `CLOSED`;
- `cross_node_analysis.decision` and `route_action` are both `HOLD`;
- `target_flow` is exactly `CONTENT_CLARIFICATION`;
- `kdf_recommendation` is exactly `CONTENT_ONLY`;
- `formal_ids` is exactly empty; and
- complete `routed_at`, `routed_by`, and `route_note` metadata is present.

This closure records an accepted content disposition only. It cannot target
research, Evidence, a Field Observation, Practice Card promotion, or another
formal-write flow. It does not approve Evidence, a Practice Gate, a formal
contradiction, or a Research Question.

The ledger records what happened after an independently authorized workflow. It
is not a command and cannot execute a route.

## 14. Route model

- `ENTER_RESEARCH_INTAKE`: prepare a separate Research Question or research-path
  proposal; never create it automatically.
- `HOLD_FOR_VERIFICATION`: remain staged without a formal write.
- `CONTENT_ONLY`: hand off to content clarification; do not call
  `kdf_generate_content` automatically. An approved `HOLD` may terminate here
  under the v0.1.2 rules above without creating a formal KDF artifact.
- `PRACTICE_REVIEW`: review practice and follow-up logic; do not create or
  update a Practice Card automatically.
- `REJECT`: close without formal artifacts.

Raw feedback cannot be an origin card for `kdf_discover`, which accepts only
traceable Evidence or Mature Knowledge cards.

## 15. Validation

Validate a batch:

    node scripts/validate_social_feedback_intake.mjs path/to/intake.json

Run built-in positive and negative cases:

    node scripts/validate_social_feedback_intake.mjs --self-test

The validator:

- has no third-party runtime dependency;
- reads input without normalization or mutation;
- does not import Bridge code;
- never calls an MCP tool;
- reads formal KDF IDs only when a READY observation route or ROUTED formal
  route requires an existence/type check;
- never writes to the formal roots or Inbox;
- emits structured JSON and exits non-zero on failure.

Cross-field invariants supplement JSON Schema where standard schema rules would
be unclear or insufficient.

V0.1.2 preserves the v0.1.1 per-match comparison and `EXTEND`, `CREATE`, and
`REUSE` safeguards. It additionally validates the exact terminal non-formal
`HOLD` combination and rejects every other `ROUTED` + `HOLD` target,
recommendation, cross-node decision, or formal-ID state. Counterexample safety
flags remain fixed at `false`.
