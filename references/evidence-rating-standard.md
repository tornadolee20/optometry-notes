# Evidence Rating Standard

## Purpose

Define how our system should express evidence strength, uncertainty, and translation discipline when digesting papers.

This file is a standard/reference, not a primary skill.

## Why This Exists

`paper-digest` should focus on synthesis.

It should not need to carry the entire evidence taxonomy inside the skill body.

This standard gives the digest skill a stable reference point for:

- evidence labels
- uncertainty wording
- interpretation discipline
- caution against overclaiming

## Evidence Labels

Use the smallest effective set.

### `C1`

Stronger evidence signal.

Typical candidates:

- systematic reviews
- meta-analyses
- well-designed randomized controlled trials
- strong guideline-backed claims

This does not mean "absolute truth."
It means the current signal is relatively stronger.

### `C2`

Moderate evidence signal.

Typical candidates:

- observational studies
- smaller controlled studies
- consistent but incomplete evidence patterns
- plausible practice-relevant findings with limits

### `H`

Heuristic or hypothesis-level signal.

Typical candidates:

- expert interpretation
- mechanism-based inference
- early directional findings
- practical hypothesis without strong confirmation

This is often useful, but should be clearly framed as tentative.

## Uncertainty Wording

### Prefer

- `suggests`
- `may`
- `might`
- `is consistent with`
- `likely`
- `appears to`

### Avoid

- `proves`
- `guarantees`
- `definitively shows`
- `always`
- `never`

Unless the source truly justifies that level of certainty.

## Interpretation Discipline

When digesting evidence, always separate:

1. what the study directly found
2. what interpretation seems reasonable
3. what practical application is possible
4. what uncertainty remains

## Translation Rule

Evidence translation should move in this order:

1. finding
2. limitation
3. implication
4. caution

Do not jump straight from result to recommendation.

## Practical Rule For Clinical Writing

If a claim influences:

- patient decision-making
- treatment recommendation
- risk framing
- commercial recommendation

then uncertainty should be shown more explicitly, not less.

## Minimal Output Pattern

Use this pattern inside digests when needed:

```md
- Evidence level: C1 / C2 / H
- Finding:
- Limitation:
- Practical implication:
- Caution:
```

## Bottom Line

Evidence strength is not a badge.

It is a restraint mechanism that keeps research translation honest.
