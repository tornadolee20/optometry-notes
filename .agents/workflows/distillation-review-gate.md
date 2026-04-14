# Distillation Review Gate

Updated: 2026-04-15

## Purpose

This workflow decides whether a distillation candidate is ready to become a reusable asset.

It exists to protect the system from premature or weak distillation.

## Verdicts

Use one of:

- `PASS`
- `REVISE`
- `FAIL`

## Gate 1: Boundary

Check:

- is the target clear enough?
- is the scope bounded enough?
- can we explain what this asset is supposed to become?

Typical failure signs:

- fuzzy target
- vague use case
- unstable boundary

## Gate 2: Signal

Check:

- is there enough real value here?
- is the target more than trend-chasing?
- does it have recurring reuse potential?

Typical failure signs:

- thin insight
- novelty without repeatable value
- too much noise, too little substance

## Gate 3: Translation

Check:

- can the target be translated into a usable framework or skill?
- can it help future tasks, not just this one?
- is the logic transferable?

Typical failure signs:

- interesting but not reusable
- too context-bound
- cannot be stated as an operating pattern

## Gate 4: Anti-Hype

Check:

- are we building from real source footing?
- is this robust beyond internet excitement?
- would the asset still make sense without the hype layer?

Typical failure signs:

- slogan-heavy interpretation
- fan-fiction framing
- footprint from weak sources rather than source of truth

## Gate 5: Landing

Check:

- do we know whether this should be a skill, framework note, workflow, or template?
- is the final landing path clear enough?
- does the output belong in reusable memory rather than transient memory?

Typical failure signs:

- unclear destination
- output type mismatch
- no meaningful landing path

## Verdict Rule

### PASS

Use when the candidate is bounded, valuable, reusable, source-disciplined, and has a clear landing path.

### REVISE

Use when the candidate has promise but needs narrower scope, stronger sourcing, or clearer output design.

### FAIL

Use when the candidate should not become a reusable asset yet.

In that case, route it to note-first or research-first instead.

## Output Shape

```md
## Distillation Review
- Target:
- Gate 1 Boundary:
- Gate 2 Signal:
- Gate 3 Translation:
- Gate 4 Anti-hype:
- Gate 5 Landing:
- Verdict: PASS / REVISE / FAIL
- Revision Notes:
```
