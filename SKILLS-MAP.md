# SKILLS-MAP.md

Updated: 2026-04-15

## Purpose

This document is the clean routing map for the shared brain.

It answers four questions:

- what each core skill is for
- when it should be invoked
- which skill should lead in a multi-step task
- which older skills are now considered legacy or source material

For the cross-skill control layer, see:

- `CORE-SKILL-ORCHESTRATION.md`

## Routing Principle

The user should describe the need, not name the skill.

Default operating model:

1. identify the real task
2. select the smallest effective skill set
3. assign one leading skill
4. pull in supporting workflows or references only when needed

## Governance Overlay

Routing is not determined by task-fit alone.

Routing should also respect tier status from `SKILL-TIERS.md`.

Working rule:

- `core` skills can lead a workflow
- `supporting` skills can assist or lead only in their narrow specialty
- `legacy` assets should not be used as fresh entry points for new work
- not-yet-reviewed assets may still be used when necessary, but they should be treated as provisional rather than architecture-defining

## Core Production Pipeline

### Layer 1: Capture

Use when the task is still raw.

- Inbox notes
- phone capture
- rough idea parking
- unfinished source collection

Do not invoke a heavy skill yet unless the request already has clear structure.

### Layer 2: Research Digestion

Use when there is a concrete paper, review, source set, or evidence object.

Leading skill:

- `paper-digest-core` `core`

Supporting artifacts:

- `references/evidence-rating-standard.md`
- `references/paper-note-template.md`

### Layer 3: Distillation

Use when the user wants a reusable framework, perspective, or skill.

Leading skill:

- `uncle-glasses-distiller-core` `core`

Supporting workflows:

- `.agents/workflows/distillation-review-gate.md`
- `.agents/workflows/distillation-obsidian-integration.md`

### Layer 4: Voice Alignment

Use when material should sound like Uncle Glasses.

Leading skill:

- `uncle-glasses-writing-voice` `core`

Use only after the material has enough shape to be written.

Support references are selected on demand through:

- `.agents/skills/uncle-glasses-writing-voice/references/REFERENCE-MAP.md`

### Layer 5: Editorial QA

Use when a draft already exists and we need to check whether it truly sounds right.

Leading skill:

- `uncle-glasses-writing-qa` `core`

Typical checks:

- AI tone
- over-literary tone
- weak specificity
- weak opening
- weak ending
- emotional overreach

Support references are selected from the writing-voice reference stack as needed.

### Layer 6: Blog Packaging

Use when the article is materially written and the next step is publishable packaging.

Leading skill:

- `optometry-html-renderer` `core` for pure rendering
- `uncle-glasses-blog-packager` `core`

This layer is now split into:

- rendering
- packaging

Rendering owns:

- clean article HTML
- section structure
- readable blog layout conversion

Packaging owns:

- canonical handling
- schema packaging
- publish-readiness checks

Support references:

- `skills/uncle-glasses-blog-packager/references/blog-canonical-guidelines.md`
- `skills/uncle-glasses-blog-packager/references/blog-schema-guidelines.md`
- `skills/uncle-glasses-blog-packager/references/blog-publish-checklist.md`

## Default Skill Routing

| User need | Leading skill | Tier status | Support if needed |
| --- | --- | --- |
| digest a paper or review | `paper-digest-core` | `core` | evidence standard, paper note template |
| turn a person/topic into a reusable skill | `uncle-glasses-distiller-core` | `core` | distillation review gate, Obsidian integration workflow |
| write like Uncle Glasses | `uncle-glasses-writing-voice` | `core` | writing QA after draft exists |
| check whether this draft sounds like me | `uncle-glasses-writing-qa` | `core` | writing voice only if rewrite is requested |
| analyze why customers hesitate, delay, or resist buying | `consumer-behavior-psychology-framework` | `core` | writing layer or packaging layer if the insight must be expressed publicly |
| turn this article into clean HTML | `optometry-html-renderer` | `core` | blog packager if publishing metadata is needed |
| package this article into blog HTML | `uncle-glasses-blog-packager` | `core` | renderer if raw HTML has not been formed yet |
| create a publishable article from research | `paper-digest-core` | `core` | writing voice -> writing QA -> renderer -> blog packager |

## Entry-Point Rule

When multiple related assets exist, use this priority:

1. choose a `core` skill first
2. use a `supporting` skill only when the need is narrow and explicit
3. use `provisional` assets when the workflow exists but governance review is not complete
4. do not route new work into `legacy` assets unless mining old source material

## Recommended Multi-Skill Chains

### Research to Article

1. `paper-digest-core`
2. `uncle-glasses-writing-voice`
3. `uncle-glasses-writing-qa`
4. `optometry-html-renderer`
5. `uncle-glasses-blog-packager`

### Distillation to Reusable Skill

1. `uncle-glasses-distiller-core`
2. `distillation-review-gate.md`
3. `distillation-obsidian-integration.md`

### Existing Draft to Publishable Blog Post

1. `uncle-glasses-writing-qa`
2. `uncle-glasses-writing-voice` if rewrite is needed
3. `optometry-html-renderer`
4. `uncle-glasses-blog-packager`

## Legacy Status

These older broad skills still contain useful source material, but they should no longer be the default routing targets for new work.

| Legacy asset | Current status | Replacement direction |
| --- | --- | --- |
| `skills/paper-digest/SKILL.md` | broad legacy source | prefer `paper-digest-core` |
| `skills/optometry-writer/SKILL.md` | broad legacy source | prefer `uncle-glasses-blog-packager` for publish layer |
| `.claude/skills/uncle-glasses-distiller/SKILL.md` | mother file / source material | prefer `uncle-glasses-distiller-core` + its support stack |

## Governance Snapshot

Current routeable status:

- `uncle-glasses-distiller-core` -> `core`
- `uncle-glasses-writing-voice` -> `core`
- `uncle-glasses-writing-qa` -> `core`
- `optometry-html-renderer` -> `core`
- `uncle-glasses-blog-packager` -> `core`
- `consumer-behavior-psychology-framework` -> `core`
- `paper-digest-core` -> `core`

Current non-entrypoint status:

- `skills/paper-digest/SKILL.md` -> `legacy`
- `skills/optometry-writer/SKILL.md` -> `legacy`
- `.claude/skills/uncle-glasses-distiller/SKILL.md` -> `legacy`

## Agent Ownership

### Jarvis

Best for:

- mobile capture
- reminders
- lightweight note routing

Not the final owner of deep multi-skill synthesis.

### Antigravity

Best for:

- preprocessing
- bulk formatting
- web automation
- long-running prep work

Should usually hand off the blocking reasoning step to Claude/Codex.

### Claude / Codex

Best for:

- deep synthesis
- multi-skill coordination
- final article logic
- Obsidian structuring
- high-stakes refactoring

## Decision Rule

If a request can be solved with a simple direct response, do that.

If a request matches a stable workflow, invoke the smallest skill that fits.

If multiple skills are needed, choose one leader and keep the chain short.

## Bottom Line

The shared brain should feel like one mind with specialized modules behind it.

The user speaks in goals.
The system handles routing.
