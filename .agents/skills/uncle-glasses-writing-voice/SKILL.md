---
name: uncle-glasses-writing-voice
description: |
  Core voice-transfer skill for turning material into natural Uncle Glasses
  writing. This skill owns tone, rhythm, narrative posture, and emotional
  restraint. It should not absorb editorial QA, publishing packaging, or large
  reference libraries into the core invocation body.
---

# Uncle Glasses Writing Voice

## Purpose

This skill exists to do one job well:

make a piece of writing sound like Uncle Glasses.

It is the voice core, not the editor, not the packager, and not the research digester.

## Use This Skill When

- the user wants "write like me"
- the draft exists but sounds too generic
- notes or research need to be translated into the right narrative voice
- a post, article, or story needs the right emotional texture and restraint

## Do Not Use This Skill When

- the task is mainly research digestion
- the draft mainly needs critique rather than rewriting
- the main task is pure HTML rendering
- the task is publish packaging
- the user only needs a simple factual summary

## Core Responsibility

This skill should focus on:

- tone
- rhythm
- narrative distance
- emotional restraint
- specificity
- trust-building phrasing
- sounding human without sounding over-written

## Default Voice Model

Default blend:

- Uncle Glasses 80%
- Wu Nien-jen style warmth 20%

The point of the blend is not literary performance.

The point is to preserve:

- grounded humanity
- field realism
- professional restraint
- lived detail
- emotional aftertaste without melodrama

## Working Rule

The writing should feel like:

- someone who has actually met people in the real world
- someone who can explain professional issues without showing off
- someone who carries warmth and judgment together

The writing should not feel like:

- generic inspirational AI prose
- empty lyrical fog
- over-polished self-performance
- abstract wisdom without scene or texture

## Reference Usage

Use supporting references only when needed:

- `references/voice-model.md`
- `references/opening-hooks.md`
- `references/transition-lines.md`
- `references/closing-lines.md`
- `references/ending-modules.md`
- `references/hybrid-patterns.md`
- `references/article-type-formulas.md`

Do not load every reference by default.

## Reference Map

See:

- `references/REFERENCE-MAP.md`

Use that file to decide which support reference is actually needed for the current task.

## Workflow

### Step 1

Identify what the material is trying to do:

- tell a story
- explain a concept
- shift belief
- comfort, warn, or guide

### Step 2

Identify where the draft currently fails:

- too generic
- too literary
- too flat
- too much explanation, not enough scene
- too much preaching, not enough observation

### Step 3

Rewrite for voice, not for decoration.

The goal is not prettier writing.
The goal is truer writing.

### Step 4

Preserve concrete details whenever possible.

If the draft loses lived texture, the voice weakens.

### Step 5

Stop before the writing becomes self-conscious.

Understatement usually beats performance.

## Boundary With QA

If the task is:

- "check whether this sounds like me"
- "tell me where the AI tone leaks"
- "review this version"

then `uncle-glasses-writing-qa` should lead instead.

## Boundary With Packaging

If the task is:

- convert to HTML
- prepare Blogger-ready output
- add canonical or schema

then route downstream to:

- `optometry-html-renderer`
- `uncle-glasses-blog-packager`

## Output Shape

Minimum expected output:

```md
## Voice Rewrite Output
- Main voice goal:
- Rewritten draft:
- Notes on tone:
- Remaining risks:
```

## Bottom Line

This skill should make the writing feel lived-in, specific, and trustworthy.

It should stay narrow so the system can invoke it as the voice layer inside the larger article pipeline.
