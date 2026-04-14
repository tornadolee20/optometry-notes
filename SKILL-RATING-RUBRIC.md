# SKILL-RATING-RUBRIC.md

Updated: 2026-04-15

## Purpose

This document defines how the shared brain should evaluate whether a skill is actually good, whether it should be kept, and what status it deserves after review.

The goal is not to praise skills for existing.

The goal is to separate:

- reusable cognitive tools
- support artifacts
- legacy material
- noise

## Why This Exists

Without a rubric, skills drift toward four bad outcomes:

- they look impressive but trigger poorly
- they become bloated and ambiguous
- they remain in the system even when they should be downgraded
- nobody knows which skills are truly core

This rubric is the governance layer for the skill system.

## Review Principle

A skill should be judged by how reliably it helps future work, not by how long it is or how sophisticated it sounds.

## Rating Scale

Each dimension is scored from `0` to `3`.

- `0` = broken or absent
- `1` = weak
- `2` = usable
- `3` = strong

Maximum total score:

- `24` points

## Core Dimensions

### 1. Trigger Clarity

Question:

- can the system tell when this skill should fire?

High score:

- clear trigger wording
- recognizable repeated use case
- low confusion with adjacent skills

Low score:

- vague trigger
- broad "use this for anything" framing
- overlaps heavily with multiple other skills

### 2. Boundary Clarity

Question:

- is it clear what this skill owns and what it does not own?

High score:

- clear inside / outside
- obvious handoff points
- low chance of context bloat

Low score:

- mixed responsibilities
- unclear stopping point
- absorbs adjacent layers

### 3. Reusability

Question:

- will this skill help again across future sessions?

High score:

- recurring task pattern
- transferable logic
- stable operational value

Low score:

- one-off solution disguised as a skill
- too tied to one narrow moment
- mostly archival information

### 4. Invocation Fitness

Question:

- does this skill improve automatic routing rather than making it noisier?

High score:

- small effective footprint
- easy to compose with other skills
- low accidental misfire risk

Low score:

- too large to load casually
- creates routing ambiguity
- hurts automatic selection quality

### 5. Output Usefulness

Question:

- does this skill produce outputs that are operationally useful?

High score:

- outputs support real decisions, writing, synthesis, or execution
- output shape is explicit

Low score:

- output is vague inspiration
- output is hard to reuse
- output shape is missing

### 6. Reference Hygiene

Question:

- is the skill body clean, with reference-heavy material moved out appropriately?

High score:

- core stays small
- references support the skill without bloating it
- workflows and templates live in the right layers

Low score:

- skill body contains giant reference dumps
- support artifacts are mixed into the core
- maintenance cost is high

### 7. Maintenance Cost

Question:

- how expensive will this skill be to keep healthy?

High score:

- easy to update
- modular
- low risk of repeated correction

Low score:

- every new edge case makes it fatter
- repeated edits are likely
- structure is brittle

### 8. Shared-Brain Fit

Question:

- does this skill fit the system architecture and agent model?

High score:

- respects memory boundaries
- respects agent ownership
- lands cleanly in the current routing model

Low score:

- duplicates system memory
- breaks architecture boundaries
- fights the existing handoff logic

## Total Score Interpretation

### 21-24

`Core Skill Candidate`

This skill is strong enough to be treated as a primary reusable module.

### 17-20

`Supporting Skill`

This skill is good and useful, but should probably remain a supporting layer rather than a system-defining core.

### 12-16

`Needs Refactor`

This skill has real value, but its current form is not clean enough.

It should usually be narrowed, split, or partially demoted.

### 0-11

`Downgrade Candidate`

This should not remain a normal skill in its current form.

It should likely become:

- reference
- workflow
- template
- note
- archive

## Mandatory Failure Flags

Even a decent total score should be blocked or downgraded if any of these are true:

- trigger is deeply ambiguous
- the skill duplicates another stronger skill
- the skill is mostly reference dump
- the skill cannot explain its output
- the skill damages automatic routing quality

## Review Output Format

Use this format when formally rating a skill:

```md
## Skill Review
- Skill:
- Trigger Clarity: 0-3
- Boundary Clarity: 0-3
- Reusability: 0-3
- Invocation Fitness: 0-3
- Output Usefulness: 0-3
- Reference Hygiene: 0-3
- Maintenance Cost: 0-3
- Shared-Brain Fit: 0-3
- Total:
- Tier:
- Failure Flags:
- Recommended Action:
```

## Recommended Actions

After rating, choose one:

- `promote to core`
- `keep as supporting skill`
- `refactor`
- `split`
- `downgrade to workflow`
- `downgrade to reference`
- `downgrade to template`
- `archive`

## Governance Rule

No skill should remain "important" merely because it exists already.

Skills earn their place by:

- triggering well
- staying bounded
- producing useful outputs
- fitting the shared brain cleanly

## Immediate Use

This rubric should now be used to review at least these skills first:

- `uncle-glasses-writing-voice`
- `uncle-glasses-writing-qa`
- `optometry-html-renderer`
- `uncle-glasses-blog-packager`
- `uncle-glasses-distiller-core`
- `consumer-behavior-psychology-framework`

## Bottom Line

The system becomes stronger not when it has more skills, but when it can tell the difference between a real skill and a dressed-up pile of text.
