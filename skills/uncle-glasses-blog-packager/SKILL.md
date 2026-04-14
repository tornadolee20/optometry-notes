---
name: uncle-glasses-blog-packager
description: |
  Publishing-packaging skill for taking a rendered article and preparing a
  Blogger-ready release package. This skill owns publish-readiness work such as
  canonical decisions, schema selection, packaging checks, and release framing.
  It should not be used as the first drafting or pure HTML-rendering layer.
---

# Uncle Glasses Blog Packager

## Purpose

This skill prepares an already formed article for publication.

It is the packaging layer after writing, QA, and rendering.

## Use This Skill When

- the article draft is already materially complete
- clean HTML already exists or can be assumed
- the task is to make the article publish-ready
- canonical and schema decisions are needed
- release checks are needed before publishing

## Do Not Use This Skill When

- the main task is research digestion
- the main task is voice alignment
- the article still needs major rewriting
- the main task is pure HTML rendering
- the task is mainly Facebook or Threads derivative creation

## Expected Input

The article should already have:

- stable title or near-stable title
- stable argument
- stable section structure
- rendered HTML or render-ready content

## Core Responsibility

This skill should focus on:

- packaging the article into a publishable release form
- choosing or validating canonical strategy
- selecting schema type(s)
- checking release readiness
- identifying unresolved packaging issues

## Output Shape

Minimum expected output:

```md
## Blog Packaging Output
- Title:
- Slug / Permalink Suggestion:
- Canonical:
- Schema Types:
- Blogger-ready HTML:
- Publish Check:
- Outstanding Issues:
```

## Support References

Use these support references when needed:

- `references/blog-canonical-guidelines.md`
- `references/blog-schema-guidelines.md`
- `references/blog-publish-checklist.md`

These references support the packager.
They should not bloat the main skill body.

## Workflow

### Step 1

Confirm the article is already stable enough to package.

If the draft is still unstable, send it back upstream instead of forcing packaging.

### Step 2

Confirm the HTML is present and structurally usable.

If not, route through `optometry-html-renderer` first.

### Step 3

Apply canonical logic using the canonical guideline reference.

### Step 4

Choose schema type(s) using the schema guideline reference.

### Step 5

Run the release-readiness check using the publish checklist reference.

### Step 6

Produce the final packaging output with any unresolved issues clearly flagged.

## Boundary With Other Skills

### Upstream

Typical upstream skills:

- `paper-digest-core`
- `uncle-glasses-writing-voice`
- `uncle-glasses-writing-qa`
- `optometry-html-renderer`

### Downstream

If needed after packaging:

- `content-planning/article-channel-derivatives.md`

## Decision Rule

If the task is:

- "make this publishable"
- "prepare Blogger-ready output"
- "add canonical and schema"
- "do final publishing checks"

this skill should lead.

If the task is only:

- "turn this into HTML"

then `optometry-html-renderer` should lead instead.

## Bottom Line

This skill is the release-packaging layer.

It should stay narrow, so the system can invoke it cleanly after writing and rendering are done.
