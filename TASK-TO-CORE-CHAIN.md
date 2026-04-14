# TASK-TO-CORE-CHAIN.md

Updated: 2026-04-15

## Purpose

This document translates real task types into recommended core-skill chains.

It is the practical playbook layer for the shared brain.

Use it when the system already knows:

- what the user wants
- what kind of artifact is involved
- what the expected output probably is

This file should help the system move from:

- abstract routing rules

to:

- concrete execution chains

## How To Read This File

Each task pattern defines:

- the real bottleneck
- the lead skill
- the default chain
- where to stop
- what artifact should come out

If the user only needs an earlier-stage output, stop early.

Do not run the full chain just because it exists.

## Pattern 1: Paper -> Internal Knowledge Note

### Use when

- the user gives a paper
- the user gives a review
- the user asks what a study really means
- the goal is reusable understanding, not public writing

### Real bottleneck

Evidence digestion

### Lead skill

`paper-digest-core`

### Default chain

1. `paper-digest-core`

### Stop rule

Stop after digestion if no article, post, or public output is requested.

### Expected artifact

- paper digest
- note-ready summary
- evidence-level judgment

## Pattern 2: Paper -> Blog Article

### Use when

- the task starts from a paper or review
- the user wants an article or blog post
- the article should remain evidence-grounded

### Real bottleneck

First understand the evidence, then express it well

### Lead skill

`paper-digest-core`

### Default chain

1. `paper-digest-core`
2. `uncle-glasses-writing-voice`
3. `uncle-glasses-writing-qa`
4. `optometry-html-renderer`
5. `uncle-glasses-blog-packager`

### Stop rule

- stop after `uncle-glasses-writing-voice` if the user only needs a draft
- stop after `uncle-glasses-writing-qa` if the user only needs editorial diagnosis
- stop after `optometry-html-renderer` if metadata packaging is not needed

### Expected artifact

- publishable article
- clean HTML
- optional blog-ready package

## Pattern 3: Customer Hesitation -> Consultation Diagnosis

### Use when

- the user asks why customers hesitate
- the issue is trust friction
- the user wants better consultation framing
- the problem is not yet a writing task

### Real bottleneck

Psychological diagnosis

### Lead skill

`consumer-behavior-psychology-framework`

### Default chain

1. `consumer-behavior-psychology-framework`

### Stop rule

Stop after diagnosis if no public content or rewritten script is needed.

### Expected artifact

- hidden fear diagnosis
- friction diagnosis
- better frame
- recommended next move

## Pattern 4: Customer Hesitation -> Public Article Or Sales Education Content

### Use when

- the user wants to turn hesitation insight into an article
- the task is educational content, not just internal diagnosis
- the goal is to explain, reassure, or reframe

### Real bottleneck

First diagnose the hesitation logic, then express it persuasively but humanely

### Lead skill

`consumer-behavior-psychology-framework`

### Default chain

1. `consumer-behavior-psychology-framework`
2. `uncle-glasses-writing-voice`
3. `uncle-glasses-writing-qa`
4. `optometry-html-renderer`
5. `uncle-glasses-blog-packager`

### Stop rule

- stop after diagnosis if the user only wants internal strategy
- stop after writing if packaging is not requested

### Expected artifact

- article draft
- consultation education content
- blog-ready output

## Pattern 5: Topic -> Reusable Skill

### Use when

- the user wants a framework
- the user wants a perspective
- the user wants a repeatable module, not just one answer

### Real bottleneck

Distillation decision

### Lead skill

`uncle-glasses-distiller-core`

### Default chain

1. `uncle-glasses-distiller-core`
2. review workflow
3. Obsidian landing workflow

### Stop rule

Stop after the core distillation decision if the target is not yet mature enough to become a full skill.

### Expected artifact

- skill
- framework
- reusable note
- distillation decision record

## Pattern 6: Raw Draft -> Voice Improvement

### Use when

- a draft already exists
- the writing sounds generic
- the user wants it to sound like Uncle Glasses

### Real bottleneck

Voice transfer

### Lead skill

`uncle-glasses-writing-voice`

### Default chain

1. `uncle-glasses-writing-voice`
2. `uncle-glasses-writing-qa`

### Stop rule

Stop after the rewrite if no diagnostic pass is needed.

### Expected artifact

- rewritten draft
- voice-aligned prose

## Pattern 7: Draft -> Editorial Diagnosis

### Use when

- the user asks whether a draft sounds right
- the user wants to know where AI tone leaks
- the draft may need judgment before rewrite

### Real bottleneck

Diagnosis before intervention

### Lead skill

`uncle-glasses-writing-qa`

### Default chain

1. `uncle-glasses-writing-qa`
2. `uncle-glasses-writing-voice` if rewrite is required

### Stop rule

Stop after QA if the user only wants critique.

### Expected artifact

- editorial diagnosis
- rewrite priorities
- optional improved draft

## Pattern 8: Stable Article Draft -> Clean HTML

### Use when

- article logic is materially settled
- the task is structure and rendering
- the user wants blog HTML

### Real bottleneck

Rendering, not rewriting

### Lead skill

`optometry-html-renderer`

### Default chain

1. `optometry-html-renderer`
2. `uncle-glasses-blog-packager` if publish metadata is needed

### Stop rule

Stop after rendering if canonical, schema, and release checks are not required.

### Expected artifact

- clean article HTML
- readable blog structure

## Pattern 9: Stable Article -> Publish Package

### Use when

- the article already exists
- the HTML exists or is trivial
- the goal is release readiness

### Real bottleneck

Packaging

### Lead skill

`uncle-glasses-blog-packager`

### Default chain

1. `uncle-glasses-blog-packager`

Optional upstream if needed:

1. `optometry-html-renderer`
2. `uncle-glasses-blog-packager`

### Stop rule

If the article is not yet stable, route upstream first instead of forcing packaging.

### Expected artifact

- Blogger-ready package
- canonical handling
- schema handling
- publish-readiness check

## Pattern 10: Mixed Request -> Find The Earliest Bottleneck

### Use when

- the user asks for many things at once
- the request contains evidence, strategy, writing, and publishing mixed together
- the system could plausibly trigger several core skills

### Real bottleneck

The earliest unresolved stage

### Lead skill

Choose the earliest unresolved bottleneck:

- evidence unclear -> `paper-digest-core`
- framework unclear -> `uncle-glasses-distiller-core`
- hesitation logic unclear -> `consumer-behavior-psychology-framework`
- prose unclear -> `uncle-glasses-writing-voice`
- quality unclear -> `uncle-glasses-writing-qa`
- HTML unclear -> `optometry-html-renderer`
- release metadata unclear -> `uncle-glasses-blog-packager`

### Default chain

Only invoke enough of the chain to resolve the first real blockage.

### Stop rule

Never skip to packaging just because the user mentioned publishing.

Never skip to writing if the evidence or diagnosis is still unresolved.

### Expected artifact

- one resolved stage
- clean handoff to the next stage if needed

## Quick Dispatch Table

| Task shape | Lead skill | Typical stop |
| --- | --- | --- |
| paper -> note | `paper-digest-core` | digest complete |
| paper -> blog | `paper-digest-core` | article / HTML / package |
| hesitation -> diagnosis | `consumer-behavior-psychology-framework` | diagnosis complete |
| hesitation -> article | `consumer-behavior-psychology-framework` | article / HTML / package |
| topic -> skill | `uncle-glasses-distiller-core` | framework / skill decision |
| draft -> voice | `uncle-glasses-writing-voice` | rewrite complete |
| draft -> critique | `uncle-glasses-writing-qa` | diagnosis complete |
| stable article -> HTML | `optometry-html-renderer` | rendered HTML |
| stable article -> publish package | `uncle-glasses-blog-packager` | package complete |

## Relation To Other Files

Use this stack together:

- `SKILL-TIERS.md` for trust level
- `SKILLS-MAP.md` for role and route
- `CORE-SKILL-ORCHESTRATION.md` for control logic
- `TASK-TO-CORE-CHAIN.md` for concrete execution patterns

## Bottom Line

This file turns the core architecture into reusable operating plays.

The user describes the mission.

The system identifies the task pattern.

The right core chain activates.
