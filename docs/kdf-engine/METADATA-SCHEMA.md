# KDF Metadata Schema v0.1

## Compatibility choices

KDF uses existing repository conventions where they are stable:

- `type` for object identity
- `last_updated` for modification date
- `evidence_level` for `C1 / C2 / H`
- `maturity` for Shared Brain maturity only
- Obsidian `[[wikilink]]` values for graph edges

KDF adds `sources` because Evidence Cards synthesize more than one source. It does not replace legacy `source` outside the KDF namespace.

## Serialization profile

KDF frontmatter uses a deliberately constrained YAML profile so it can be validated without adding dependencies:

- one `key: value` per line
- strings are JSON-quoted when empty or ambiguous
- arrays and objects use JSON syntax on one line
- booleans are lowercase `true` / `false`
- dates use quoted `YYYY-MM-DD`
- no multiline YAML, anchors, aliases, or nested indentation

This remains valid YAML while enabling deterministic standard-library parsing.

## Required common fields

```yaml
---
id: "KDF-001-B-001"
type: "research-question"
status: "researching"
root_topic: "[[KDF-001]]"
parent: "[[KDF-001-B]]"
topic: "視覺品質"
domain: "optometry"
created: "2026-08-13"
last_updated: "2026-08-13"
related: ["[[KDF-001]]"]
sources: []
evidence_level: ""
gap_status: "open"
human_review: "pending"
discovery_ready: false
---
```

## Allowed values

### Types

- `root-topic`
- `mother-topic`
- `research-question`
- `evidence-card`
- `uncle-lens`
- `practice-card`
- `field-observation`
- `mature-knowledge`
- `discovery-question`
- `content-draft` for downstream draft assets

Relations are edges in metadata and Markdown, not standalone files in v0.1.

### Status

- `idea`
- `decomposed`
- `researching`
- `evidence-ready`
- `waiting-human`
- `thinking`
- `field-observation`
- `content-ready`
- `published`
- `mature`
- `discovery`
- `candidate` only for `discovery-question`
- `draft` and `update-needed` only for `content-draft`

### Evidence level

- `C1`: strong decision-support evidence, normally a strong synthesis or strong randomized evidence for a narrow question
- `C2`: useful but materially limited evidence
- `H`: heuristic, conceptual, translational, or observation-based reasoning
- empty when the card does not make an evidence claim

### Gap status

- `not-assessed`
- `open`
- `partial`
- `closed`

### Human review

- `not-required`
- `pending`
- `approved`
- `revision-required`

## Type-specific required fields

### Root Topic

- `mother_topics`
- `state_history`
- `gate_1_evidence_review`
- `gate_2_uncle_lens`
- `gate_3_publish_review`

### Mother Topic

- `research_questions`

### Research Question

- `question_framework`: `PICO`, `PECO`, `PICo`, or `other`
- `population`
- `intervention_or_exposure`
- `comparator`
- `outcomes`
- `search_strategy`

### Evidence Card

- `research_question`
- `search_date`
- `search_strategy`
- non-empty `sources`
- `study_designs`
- `conflicting_evidence`

### Uncle Lens

- non-empty `source_evidence`
- `observation_is_evidence: false`
- `human_confirmed`
- `human_source`

### Practice Card

- non-empty `source_evidence`
- non-empty `source_uncle_lens`
- `practice_status`

### Field Observation

- non-empty `source_practice`
- `validated_questionnaire: false`
- `observation_is_evidence: false`
- `scale_definition`

### Mature Knowledge

- `maturity`
- non-empty `source_evidence`
- non-empty `source_uncle_lens`
- non-empty `source_practice`
- `field_observation`
- `content_assets`
- `published_assets`
- `reader_feedback`
- `supporting_knowledge`
- `contradictory_knowledge`
- `open_questions`
- `new_hypotheses`
- `last_evidence_update`
- `last_field_update`
- `last_content_update`
- `discovery_ready`

### Discovery Question

- at least two `origin_cards`
- `relation_type`
- non-empty `relations`
- `reason_generated`
- `missing_evidence`
- `priority`
- `human_approved`

### Content Draft

- non-empty `source_knowledge`
- `platform`
- `publish_approved`

## Stable ID rules

| Type | Pattern |
| --- | --- |
| Root | `KDF-001` |
| Mother | `KDF-001-A` through `KDF-001-H` |
| Research Question | `KDF-001-B-001` |
| Evidence | `EVC-KDF-001-B-001` |
| Uncle Lens | `ULC-KDF-001-B-001` |
| Practice | `PRC-KDF-001-B-001` |
| Field Observation | `FOC-KDF-001-B-001` |
| Mature Knowledge | `MKC-KDF-001-B-001` |
| Discovery Question | `DQ-KDF-001-001` |
| Content Draft | `CNT-KDF-001-B-001-BLOG-001` |

The ID is immutable. A filename may change only if the Wikilink graph is updated; changing a filename never changes the ID.

## Parent rules

- Root has an empty parent.
- Mother parent is its Root.
- Research Question parent is its Mother.
- Evidence / Uncle / Practice / Field / Mature parent is the Research Question.
- Discovery Question parent is the Root and records its origin cards separately.
- Content Draft parent is its source Mature Knowledge object.
