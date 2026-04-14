# evidence-rating-standard.md

Updated: 2026-04-15

## Purpose

This reference standardizes how `paper-digest-core` should describe evidence strength.

The goal is not to sound academic.

The goal is to prevent overclaiming while still producing operationally useful summaries.

## Core Rule

The wording should match the strength of the source.

Do not let a weak study sound definitive.

Do not flatten a strong review into vague language either.

## Rating Levels

### `C1`

Use when the source is relatively strong for practical decision support.

Typical examples:

- systematic review
- meta-analysis
- well-conducted guideline-backed evidence summary
- strong randomized evidence when the practical question is narrow

Suggested wording:

- `evidence is relatively strong`
- `current evidence supports`
- `the best available evidence suggests`

Avoid:

- `proves`
- `guarantees`
- `this definitely causes`

### `C2`

Use when the source is useful but materially limited.

Typical examples:

- single RCT
- observational study
- retrospective study
- small prospective study
- mixed-quality narrative review

Suggested wording:

- `early evidence suggests`
- `this study indicates`
- `the findings are consistent with`
- `this may help explain`

Avoid:

- `settles the question`
- `confirms once and for all`

### `H`

Use when the source is mainly heuristic, conceptual, or translational.

Typical examples:

- expert commentary
- mechanism-based reasoning
- conceptual synthesis
- practice insight without high-level formal evidence

Suggested wording:

- `heuristically, this may mean`
- `a practical interpretation is`
- `this is a useful working hypothesis`

Avoid:

- presenting the idea as established evidence

## Escalation Rules

Lower the confidence language when:

- sample size is small
- follow-up is short
- the population is narrow
- the intervention is hard to generalize
- the outcome is surrogate rather than practical
- the paper conflicts with stronger reviews or guidelines

Raise caution explicitly when:

- results are statistically significant but clinically small
- authors overstate implications
- the paper is likely to be misused in marketing or patient communication

## Required Output Line

Every digest should include:

```md
- Suggested Evidence Level: C1 / C2 / H
```

When useful, add one short reason:

```md
- Suggested Evidence Level: C2
- Why: single-study evidence with practical value but limited generalizability
```

## Translation Rule

The evidence label should shape the wording of:

- key findings
- practical implications
- cautions
- downstream teaching or content reuse

Higher evidence allows firmer operational wording.

Lower evidence requires more restraint.

## Bottom Line

Good paper digestion is not just about extracting findings.

It is about matching confidence to reality.
