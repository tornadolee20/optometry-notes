# KDF Discovery Relations v0.1

## Boundary

Discovery is a relation-and-gap scan, not a scientific conclusion generator. Its only generative output is a Candidate Research Question.

## Relation vocabulary

| Relation | Meaning | Minimum support |
| --- | --- | --- |
| `SUPPORTS` | A provides evidence consistent with a claim in B | explicit compatible claims and source trace |
| `CONTRADICTS` | A and B report materially incompatible results | name outcome, population, method, and possible reason |
| `RELATED_TO` | A and B share a topic without a stronger justified relation | shared entities or outcomes |
| `SHARES_MECHANISM` | A and B may involve the same stated mechanism | source-supported mechanism in both cards |
| `MAY_EXPLAIN` | A offers a plausible explanation for B | must be labeled hypothesis, not fact |
| `MISSING_LINK` | a key mediator, population, outcome, or timescale is absent between A and B | name the missing variable |
| `CREATES_NEW_QUESTION` | the relation justifies a bounded research question | at least two origin cards and explicit missing evidence |

## Edge representation

Relations are stored as a JSON-compatible array in frontmatter and repeated in readable Markdown:

```yaml
relations: [{"type":"MISSING_LINK","target":"[[MKC-KDF-001-B-001]]","reason":"Dynamic daily-life outcomes are not measured."}]
```

```markdown
## Relations

- `MISSING_LINK` -> [[MKC-KDF-001-B-001]]: Dynamic daily-life outcomes are not measured.
```

No separate relation-card file is required in v0.1.

## Candidate generation contract

A Discovery Question candidate requires:

- two or more origin cards
- a typed relation
- a plain-language reason for generation
- the missing evidence needed to answer it
- a priority
- `human_approved: false` by default

It must not:

- assert that a proposed relationship exists
- claim a causal pathway
- invent a mechanism missing from its origin cards
- enter research automatically

## KDF-001 relation logic

The fixture compares:

1. evidence that central or conventional visual performance is often preserved or adapts over time
2. evidence that off-axis, low-contrast, low-luminance, or mid-peripheral performance can be reduced in some test conditions
3. the absence of strong child-specific evidence for stairs, sports, night mobility, rapid gaze shifts, and individual adaptation trajectories

This supports a `MISSING_LINK` relation and a question about prospective functional tracking. It does not support the conclusion that myopia-control spectacles impair daily safety.
