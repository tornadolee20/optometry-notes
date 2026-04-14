# Writing Voice QA Migration

## Purpose

This file marks the separation between:

- core voice transfer
- editorial QA

## New Rule

`uncle-glasses-writing-voice` should focus on:

- tone
- rhythm
- narrative posture
- emotional restraint
- "sound like Uncle Glasses"

`uncle-glasses-writing-qa` should focus on:

- whether the draft actually sounds right
- where AI tone leaks in
- where structure feels forced
- where the article is too full, too empty, too literary, or too generic

## Practical Routing

### Use `uncle-glasses-writing-voice` when:

- the task is mainly drafting or rewriting into the right voice

### Use `uncle-glasses-writing-qa` when:

- the draft already exists
- the task is "check this version"
- the system needs critique rather than first-pass generation

## What Stays In References

The following kinds of material can stay as references without bloating the voice core:

- opening hooks
- transition lines
- closing lines
- ending modules
- formulas
- article scoring checklist

These should support the system, not define the entire main skill body.
