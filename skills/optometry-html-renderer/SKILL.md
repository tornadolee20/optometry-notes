---
name: optometry-html-renderer
description: |
  Pure rendering skill for turning a substantially written article into clean
  blog-ready HTML structure while preserving house formatting conventions.
  This skill owns HTML rendering only. It does not own publishing strategy,
  schema policy, canonical policy, or channel derivatives unless a task
  explicitly asks for them.
---

# Optometry HTML Renderer

## Purpose

This skill exists to do one job well:

turn a materially written article into clean HTML that matches the site's structural conventions.

It is the rendering layer, not the packaging layer.

## Use This Skill When

- the article draft already exists
- the structure and argument are mostly stable
- the task is to convert prose into clean HTML blocks
- the output needs to follow site formatting conventions

## Do Not Use This Skill When

- the article still needs major rewriting
- the main task is voice alignment
- the main task is research digestion
- the main task is schema/canonical/publish-readiness packaging
- the task is deriving Facebook or Threads outputs

## Upstream Inputs

Typical upstream sources:

- `uncle-glasses-writing-voice`
- `uncle-glasses-writing-qa`
- `paper-digest-core`
- user-provided article draft

## Core Responsibility

This skill should focus on:

- section structure
- heading hierarchy
- paragraph shaping
- list rendering
- emphasis formatting
- embed-safe HTML layout
- preserving readability inside the blog template

## Output Shape

Minimum expected output:

```md
## HTML Render Output
- Title:
- Rendered HTML:
- Structural notes:
- Items requiring packaging follow-up:
```

## Rendering Rules

### Rule 1

Preserve the article's meaning and pacing.

Do not silently rewrite the thesis during rendering.

### Rule 2

Produce clean, readable HTML.

Prefer straightforward semantic structure over clever formatting tricks.

### Rule 3

Respect heading hierarchy.

Use a stable section layout so later packaging is predictable.

### Rule 4

Keep embedded media and iframe blocks layout-safe.

### Rule 5

If the draft is still structurally weak, flag it instead of hiding the weakness through HTML cosmetics.

## Boundary With Other Skills

### Use `uncle-glasses-writing-voice` before this skill when:

- the article does not yet sound like Uncle Glasses

### Use `uncle-glasses-writing-qa` before this skill when:

- the draft exists but needs editorial diagnosis

### Use `uncle-glasses-blog-packager` after this skill when:

- canonical handling is needed
- schema is needed
- publish-readiness checks are needed
- final Blogger-oriented packaging is needed

## Practical Chain

Common chain:

1. draft or research synthesis
2. `uncle-glasses-writing-voice`
3. `uncle-glasses-writing-qa`
4. `optometry-html-renderer`
5. `uncle-glasses-blog-packager`

## Bottom Line

This skill turns a stable article into clean HTML.

It should stay narrow so the system can invoke it precisely.
