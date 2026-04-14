---
name: uncle-glasses-distiller-core
description: |
  Core distillation orchestrator for deciding whether a person, topic, or
  framework should be distilled into a reusable asset. This skill owns the
  decision layer, path selection, and minimum viable output choice. It should
  not absorb the full review rubric, Obsidian landing rules, or source strategy
  reference pack into the main invocation body.
---

# Uncle Glasses Distiller Core

## Purpose

This skill decides whether something should be distilled and what it should become.

It is the orchestration layer for reusable knowledge assets.

## Use This Skill When

- the user wants to "distill" a person, topic, or field
- the goal is to create a reusable perspective, framework, or skill
- the target might deserve a long-term asset instead of a one-off answer
- the system needs to decide between note, framework, skill, or research-first

## Do Not Use This Skill When

- the user only wants a quick summary
- the task is ordinary writing
- the task is broad brainstorming without a real target
- the target should simply become a note or daily memory entry

## Core Responsibility

This skill should decide:

- what the target really is
- whether distillation is justified
- what distillation path fits best
- what the minimum viable output should be
- which workflow should run next

## Distillation Types

Common target types:

- person
- topic
- mixed

Common output families:

- note
- framework
- skill
- research-first holding state

## Distillation Decisions

Use one of these decisions:

- `do-not-distill`
- `note-first`
- `framework-first`
- `skill-first`
- `research-first`

### `do-not-distill`

Use when:

- the target is too shallow
- there is no recurring value
- the request is better handled directly

### `note-first`

Use when:

- the material has promise
- but the structure is not yet stable enough for a reusable asset

### `framework-first`

Use when:

- the target has a useful logic pattern
- but not necessarily a full reusable skill yet

### `skill-first`

Use when:

- the recurring use case is already clear
- the boundary is recognizable
- the future invocation pattern is stable enough

### `research-first`

Use when:

- the target may be worth distilling
- but the current understanding is too thin or too noisy

## Core Workflow

### Step 1

Classify the target:

- person
- topic
- mixed

### Step 2

Choose the likely output family:

- note
- framework
- skill
- research-first

### Step 3

Use the source-strategy reference if the sourcing approach matters.

### Step 4

Send the candidate through the review gate workflow.

### Step 5

If the output is viable, route it through the Obsidian integration workflow.

## Support Artifacts

Use support artifacts on demand:

- `references/REFERENCE-MAP.md`
- `references/distillation-source-strategy.md`
- `templates/distilled-skill-template.md`
- `.agents/workflows/distillation-review-gate.md`
- `.agents/workflows/distillation-obsidian-integration.md`

Do not load all of them by default.

## Output Shape

```md
## Distillation Decision
- Target:
- Type: person / topic / mixed
- Decision: do-not-distill / note-first / framework-first / skill-first / research-first
- Why:
- Minimum Viable Output:
- Next Workflow:
```

## Bottom Line

This skill should help the system avoid two failures:

- distilling too early
- failing to distill something that should become reusable

It is the router for reusable knowledge creation.
