# SKILL-REFACTOR-BLUEPRINT-v1.md

## Purpose

This document turns the previous skill review into an actionable refactor blueprint.

The goal is not just to "make skills cleaner."
The goal is to make the whole brain faster, more composable, and more automatic.

This blueprint focuses on four core skills:

- `uncle-glasses-distiller`
- `uncle-glasses-writing-voice`
- `paper-digest`
- `optometry-writer`

## Why We Are Refactoring

The current problem is not that these skills are weak.
The problem is that several of them are trying to do too many different jobs at once.

That creates five system problems:

1. Trigger ambiguity
2. Context bloat
3. Maintenance difficulty
4. Hard-to-predict invocation
5. Poor separation between memory, workflow, and execution

In short:

- fat skills make automatic invocation worse
- fat skills make the shared brain noisier

## Refactor Principles

### Principle 1

One skill should have one dominant job.

### Principle 2

Reference material should not live in the skill body unless it is essential to invocation quality.

### Principle 3

Templates, rubrics, and workflows are not automatically skills.

### Principle 4

If a skill has multiple outputs with different users or stages, it should probably be split.

### Principle 5

The user should describe intent.
The system should choose the smallest effective set of skills.

## Artifact Types

Before splitting, classify each piece of content into one of these artifact types:

- `skill`
- `workflow`
- `reference`
- `template`
- `memory`

### Skill

Use when content defines a repeated operating pattern.

### Workflow

Use when content defines a process sequence or orchestration logic.

### Reference

Use when content exists mainly to support lookup or deepen quality.

### Template

Use when content is mostly an output structure or reusable format.

### Memory

Use when content is durable system context, not a reusable operating pattern.

## Master Refactor Map

| Current Skill | Main Problem | Target Shape |
| --- | --- | --- |
| `uncle-glasses-distiller` | too many responsibilities | 1 orchestrator skill + 2 workflow docs + 1 template family |
| `uncle-glasses-writing-voice` | voice mixed with QA and formula library | 1 core voice skill + 1 writing QA skill + 1 reference pack |
| `paper-digest` | synthesis mixed with evidence taxonomy and Obsidian schema | 1 digest skill + 1 evidence standard + 1 note template |
| `optometry-writer` | rendering mixed with packaging and channel derivatives | 1 renderer skill + 1 publishing packager + optional channel workflow |

---

## 1. `uncle-glasses-distiller`

## What It Is Doing Now

It currently appears to combine:

- distillation intake logic
- research-source strategy
- multi-agent orchestration
- synthesis method
- review and scoring gates
- interpretation-drift checks
- Obsidian output routing
- memory-writing rules

That is not one skill.
That is a whole operating pipeline.

## What It Should Become

### Keep As Skill

#### `uncle-glasses-distiller-core`

Purpose:

- decide whether a target should be distilled
- determine whether it is person-based or topic-based
- choose the correct distillation path
- orchestrate the process at a high level

This skill should answer:

- what are we distilling
- why is this worth distilling
- what path should we follow
- what final output family do we want

It should not own the whole rubric, all research rules, or all publishing logic.

### Move To Workflow

#### `distillation-review-gate.md`

Purpose:

- hold the five-gate review logic
- store pass / revise / fail criteria
- define the score-based revision process

This is a workflow or rubric, not a core skill.

#### `distillation-obsidian-integration.md`

Purpose:

- define where outputs go
- define naming rules
- define MOC linking
- define memory writeback rules

This is integration logic, not the distillation skill itself.

### Move To Template / Reference

#### `distilled-skill-template.md`

Purpose:

- define target structure for the finished skill
- hold standard sections
- hold stable formatting rules

#### `distillation-source-strategy.md`

Purpose:

- hold the source-hunting guidance
- person vs topic source logic
- high-value source categories
- anti-noise rules

This is reference support for the distiller, not the distiller itself.

## Target Structure

Recommended target set:

- `.claude/skills/uncle-glasses-distiller-core/SKILL.md`
- `.claude/workflows/distillation-review-gate.md`
- `.claude/workflows/distillation-obsidian-integration.md`
- `.claude/templates/distilled-skill-template.md`
- `.claude/references/distillation-source-strategy.md`

## Invocation Policy

Invoke `uncle-glasses-distiller-core` only when:

- the user wants a new reusable perspective/framework/skill
- the target merits structured distillation
- the output is intended to become a reusable asset

Do not invoke when:

- the user only wants a summary
- the user only wants a one-off analysis
- the task is just "explain this person quickly"

## Migration Strategy

### Phase A

Keep current file as source material.
Do not aggressively edit it first.

### Phase B

Extract:

- invocation logic
- path chooser
- core purpose

into `uncle-glasses-distiller-core`.

### Phase C

Extract scoring, review, and gate logic into workflow docs.

### Phase D

Extract output structure into template/reference files.

---

## 2. `uncle-glasses-writing-voice`

## What It Is Doing Now

It currently combines:

- core voice model
- opening hooks
- transitions
- closing lines
- hybrid voice logic
- ending modules
- article scoring
- article formulas

This is much healthier than `distiller`, but still broader than ideal.

## What It Should Become

### Keep As Skill

#### `uncle-glasses-writing-voice`

Purpose:

- translate material into the correct voice
- preserve the emotional and rhetorical texture of Uncle Glasses
- guide tone, pacing, narrative distance, and restraint

This skill should remain the core voice-transfer skill.

It should focus on:

- tone
- rhythm
- emotional restraint
- framing
- narrative posture

### Split Into New Skill

#### `uncle-glasses-writing-qa`

Purpose:

- review whether a draft truly matches the intended voice
- detect over-literary writing
- detect generic AI prose
- detect under-specific writing
- detect weak openings and weak endings

This should be a QA / editor skill, not part of the voice core.

### Move To Reference

- opening hooks
- transition lines
- closing lines
- ending modules
- article formulas

These are powerful references, but they are reference libraries more than core skill logic.

Recommended structure:

- `.agents/skills/uncle-glasses-writing-voice/SKILL.md`
- `.agents/skills/uncle-glasses-writing-qa/SKILL.md`
- `.agents/skills/uncle-glasses-writing-voice/references/voice-hooks.md`
- `.agents/skills/uncle-glasses-writing-voice/references/voice-transitions.md`
- `.agents/skills/uncle-glasses-writing-voice/references/voice-endings.md`
- `.agents/skills/uncle-glasses-writing-voice/references/article-formulas.md`

## Invocation Policy

Invoke `uncle-glasses-writing-voice` when:

- the user wants "write like me"
- the task is primarily about voice alignment
- a draft already exists and needs tonal conversion
- a story/article/post needs to feel like Uncle Glasses

Invoke `uncle-glasses-writing-qa` when:

- the draft is already written
- the question is "does this sound like me?"
- the system needs editorial critique, not primary generation

Do not invoke the QA skill for first-pass drafting by default.

---

## 3. `paper-digest`

## What It Is Doing Now

It currently combines:

- evidence digestion
- evidence hierarchy
- confidence labels
- interpretation rules
- Obsidian card schema
- note templates
- workflow routing
- memory promotion logic

This should be split into one synthesis skill and two support artifacts.

## What It Should Become

### Keep As Skill

#### `paper-digest`

Purpose:

- digest a paper
- identify key claims and limits
- translate findings into usable language
- produce structured synthesis

This skill should focus on:

- what the paper says
- what strength the evidence seems to have
- what the practical implications are
- what caveats matter

### Move To Standard

#### `evidence-rating-standard.md`

Purpose:

- define evidence levels
- define confidence tags
- define wording constraints
- define how to express uncertainty

This should be treated as a reference or workflow standard, not as part of the skill’s main body.

### Move To Template

#### `paper-note-template.md`

Purpose:

- define the Obsidian destination shape
- define note fields
- define frontmatter
- define section order

This is a template.
It should not sit inside the digest skill as if it were core cognition.

## Target Structure

- `skills/paper-digest/SKILL.md`
- `references/evidence-rating-standard.md`
- `obsidian-vault/06-模板 or templates/paper-note-template.md`

## Invocation Policy

Invoke `paper-digest` when:

- there is a concrete paper or review
- the system needs synthesis
- the output should support learning, writing, or knowledge-card creation

Do not invoke when:

- there is no concrete source object
- the user is only brainstorming a general topic
- the task is merely formatting an already-digested note

---

## 4. `optometry-writer`

## What It Is Doing Now

It currently combines:

- article HTML rendering
- style-guided formatting
- canonical tag handling
- schema generation
- GEO / SEO packing
- AI-check / review steps
- FB output
- Threads output

This is too many output layers in one skill.

## What It Should Become

### Keep As Skill

#### `optometry-html-renderer`

Purpose:

- convert already-developed article content into publishable HTML
- apply structural formatting
- preserve site conventions

This skill should own:

- HTML structure
- content block formatting
- canonical placement
- schema placement if tightly coupled to rendering

### Split Into New Skill

#### `optometry-publishing-packager`

Purpose:

- prepare the publishing package around the article
- schema
- canonical validation
- GEO / SEO checks
- output bundle validation

This skill is more about packaging and release readiness than rendering.

### Move To Workflow / Optional Skill

#### `article-channel-derivatives.md`

Purpose:

- define how FB and Threads outputs should be derived
- specify channel-specific output rules

This does not need to be embedded in the renderer.

If later needed, it could become a separate derivative-content skill.

## Target Structure

- `skills/optometry-html-renderer/SKILL.md`
- `skills/optometry-publishing-packager/SKILL.md`
- `content-planning/article-channel-derivatives.md`

## Invocation Policy

Invoke `optometry-html-renderer` when:

- article content is already materially written
- the next job is conversion to web-ready structure

Invoke `optometry-publishing-packager` when:

- the content is almost ready
- the system needs schema/canonical/quality packaging

Do not invoke either during early idea formation.

---

## Priority Order

Refactor in this order:

1. `uncle-glasses-distiller`
2. `paper-digest`
3. `optometry-writer`
4. `uncle-glasses-writing-voice`

### Why This Order

`uncle-glasses-distiller` affects skill creation itself.

`paper-digest` and `optometry-writer` affect core production pipelines.

`uncle-glasses-writing-voice` is valuable, but more stable than the others.

---

## Minimum Viable Refactor

If we want a practical first pass without rewriting everything:

### Step 1

Do not delete any existing skill.

### Step 2

Create new slimmer target files first.

### Step 3

Reposition the old large skill as source material.

### Step 4

Gradually migrate invocation policy toward the slimmer skills.

### Step 5

Once stable, demote old fat skills into:

- archive
- legacy
- source material

## Suggested New Artifact Names

### Skill names

- `uncle-glasses-distiller-core`
- `uncle-glasses-writing-qa`
- `optometry-html-renderer`
- `optometry-publishing-packager`

### Workflow names

- `distillation-review-gate.md`
- `distillation-obsidian-integration.md`
- `article-channel-derivatives.md`

### Standard / reference names

- `evidence-rating-standard.md`
- `distillation-source-strategy.md`
- `paper-note-template.md`
- `distilled-skill-template.md`

## What Success Looks Like

The refactor is successful when:

- each skill can be described in one paragraph
- automatic invocation becomes easier, not harder
- supporting references stop polluting core skill bodies
- users no longer need to think about which skill to call
- the system can compose small skills into stronger workflows

## Bottom Line

We are not shrinking capability.

We are redistributing capability into the correct layers so the brain can move faster.
