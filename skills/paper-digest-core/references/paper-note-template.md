# paper-note-template.md

Updated: 2026-04-15

## Purpose

This template defines the default reusable note shape for outputs produced by `paper-digest-core`.

Use it when a digest should become a stable knowledge note rather than a one-off chat answer.

## Core Template

```md
---
title: [Paper title]
date: YYYY-MM-DD
source: [Journal / URL / DOI]
study_type: [systematic review / meta-analysis / RCT / observational / commentary]
evidence_level: C1 / C2 / H
card_type: PaperNote
tags: [paper, topic, field]
applied_in: []
---

# [Paper title]

## Main Question

What was the paper trying to answer?

## Key Findings

- finding 1
- finding 2
- finding 3

## Limitations

- limitation 1
- limitation 2

## Practical Implications

- what this changes in practice
- what it does not justify yet

## Cautions

- overclaim risk
- generalization risk
- communication risk

## Suggested Evidence Level

- C1 / C2 / H
- brief reason if needed

## Related Notes

- [[Concept note]]
- [[Practice note]]
```

## Field Guidance

### `Main Question`

Keep this narrow.

It should describe the real decision or uncertainty, not restate the title mechanically.

### `Key Findings`

Extract only the few findings that matter for future decisions, education, or writing.

Do not turn this section into a mini-abstract.

### `Limitations`

Name the constraint that most changes confidence:

- study design
- sample size
- short follow-up
- narrow population
- weak comparators
- outcome mismatch

### `Practical Implications`

Translate the paper into real use:

- clinical interpretation
- communication implication
- content implication
- decision relevance

If the paper is interesting but not actionable, say that clearly.

### `Cautions`

Use this section to prevent misuse.

Especially include it when the result could easily be over-marketed or over-generalized.

## Routing Rule

Use this template when the digest should be stored or reused.

If the user only wants a brief answer in chat, the full note is optional.

## Bottom Line

A good paper note is short, confidence-aware, and reusable.

It should help future thinking, not just preserve past reading.
