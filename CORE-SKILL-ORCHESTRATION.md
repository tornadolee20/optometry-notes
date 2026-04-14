# CORE-SKILL-ORCHESTRATION.md

Updated: 2026-04-15

## Purpose

This document is the control layer for the current core skill stack.

It answers one question:

when several core skills could help, how should the shared brain decide who leads, who supports, and in what order work should move?

This file sits above:

- `SKILLS-MAP.md`
- `SKILL-TIERS.md`
- `SKILL-INVOCATION-POLICY.md`
- `TASK-TO-CORE-CHAIN.md`
- `CORE-SKILL-TRIGGERS.md`

It is not a replacement for those files.

It is the orchestration rulebook.

For concrete task-pattern playbooks, see:

- `TASK-TO-CORE-CHAIN.md`

For natural-language trigger interpretation, see:

- `CORE-SKILL-TRIGGERS.md`

For lightweight-agent routing, see:

- `ROUTER-SHORT-RULES.md`

For per-agent runtime deployment rules, see:

- `SYSTEM-PROMPT-RUNTIME-RULES.md`

## Current Core Stack

The current architecture-grade core skills are:

1. `paper-digest-core`
2. `uncle-glasses-distiller-core`
3. `consumer-behavior-psychology-framework`
4. `uncle-glasses-writing-voice`
5. `uncle-glasses-writing-qa`
6. `optometry-html-renderer`
7. `uncle-glasses-blog-packager`

## Primary Principle

Only one core skill should lead at a time.

If multiple skills are involved:

- one skill defines the current stage
- supporting skills must stay bounded
- the next skill should only take over when the output is ready for its layer

The system should feel like one mind moving through stages, not seven tools shouting at once.

## Stage Order

Default stage order:

1. `paper-digest-core` if the task begins from evidence
2. `uncle-glasses-distiller-core` if the task begins from framework creation
3. `consumer-behavior-psychology-framework` if the task begins from hesitation / trust / framing diagnosis
4. `uncle-glasses-writing-voice` when material should become Uncle Glasses prose
5. `uncle-glasses-writing-qa` when a draft must be diagnosed or tightened
6. `optometry-html-renderer` when content is stable and should become clean article HTML
7. `uncle-glasses-blog-packager` when the final task is publish-readiness

Not every task uses every stage.

The point is ordered ownership, not mandatory full-chain usage.

## Lead-Skill Decision Tree

### Start with `paper-digest-core` when:

- the request begins from a paper
- the request begins from a review
- the request begins from a guideline
- the user asks what evidence actually means

Do not start with writing or packaging if the evidence has not yet been digested.

### Start with `uncle-glasses-distiller-core` when:

- the user wants a reusable framework
- the user wants a perspective skill
- the task is to turn a topic into a stable reusable module

Do not start with `paper-digest-core` unless a concrete evidence object is the real bottleneck.

### Start with `consumer-behavior-psychology-framework` when:

- the real problem is hesitation
- the blockage is trust friction
- the issue is framing failure
- the user needs to understand what people are psychologically buying or avoiding

Do not start with writing if the strategic diagnosis is still missing.

### Start with `uncle-glasses-writing-voice` when:

- the material already has shape
- the main need is voice transfer
- the draft sounds generic or AI-flat

Do not start with it if the draft first needs critique rather than rewriting.

### Start with `uncle-glasses-writing-qa` when:

- a draft exists
- the user wants diagnosis
- the user asks whether it sounds right
- the system needs to identify voice leakage or structural weakness before rewriting

Do not let QA lead if there is no draft yet.

### Start with `optometry-html-renderer` when:

- article content is already materially stable
- the main need is readable blog HTML
- the task is rendering rather than final release policy

Do not start with it while the article is still changing conceptually.

### Start with `uncle-glasses-blog-packager` when:

- the article is already formed
- rendering is done or trivial
- the main need is canonical, schema, Blogger packaging, or final release checks

Do not use packager as an early drafting or diagnosis layer.

## Mutual-Exclusion Rules

These pairs should not lead at the same time:

- `paper-digest-core` and `uncle-glasses-writing-voice`
- `uncle-glasses-writing-voice` and `uncle-glasses-writing-qa`
- `optometry-html-renderer` and `uncle-glasses-blog-packager`
- `uncle-glasses-distiller-core` and `consumer-behavior-psychology-framework`

Why:

- one owns upstream meaning
- the other owns downstream expression

They may both appear in one chain, but not as co-leads for the same stage.

## Handoff Rules

### Research -> Writing

`paper-digest-core` may hand off to:

- `uncle-glasses-writing-voice`
- `uncle-glasses-writing-qa` if a draft already exists

Trigger for handoff:

- the evidence has been digested into reusable understanding

### Distillation -> Writing

`uncle-glasses-distiller-core` may hand off to:

- `uncle-glasses-writing-voice`

Trigger for handoff:

- a framework or skill has been decided, and now the output must be expressed narratively

### Behavior Diagnosis -> Writing

`consumer-behavior-psychology-framework` may hand off to:

- `uncle-glasses-writing-voice`
- `uncle-glasses-writing-qa`

Trigger for handoff:

- the hidden fear, friction, and better framing are clear enough to express publicly

### Writing -> QA

`uncle-glasses-writing-voice` should hand off to:

- `uncle-glasses-writing-qa`

when the rewritten material needs diagnosis before rendering or release.

### QA -> Renderer

`uncle-glasses-writing-qa` may hand off to:

- `uncle-glasses-writing-voice` if rewrite is still needed
- `optometry-html-renderer` if the draft is approved conceptually

### Renderer -> Packager

`optometry-html-renderer` should hand off to:

- `uncle-glasses-blog-packager`

when the HTML structure is stable and release metadata is the next concern.

## Minimal Effective Chains

### Evidence to Blog Article

1. `paper-digest-core`
2. `uncle-glasses-writing-voice`
3. `uncle-glasses-writing-qa`
4. `optometry-html-renderer`
5. `uncle-glasses-blog-packager`

### Evidence to Internal Knowledge Note

1. `paper-digest-core`

Stop there if no public writing is needed.

### Customer-Hesitation Diagnosis to Public Article

1. `consumer-behavior-psychology-framework`
2. `uncle-glasses-writing-voice`
3. `uncle-glasses-writing-qa`
4. `optometry-html-renderer`
5. `uncle-glasses-blog-packager`

### Topic to Reusable Skill

1. `uncle-glasses-distiller-core`

Optional downstream:

2. review workflow
3. Obsidian landing workflow

### Existing Draft to Publishable Output

1. `uncle-glasses-writing-qa`
2. `uncle-glasses-writing-voice` if rewrite is needed
3. `optometry-html-renderer`
4. `uncle-glasses-blog-packager`

## Stop Rules

The system should stop the chain early when:

- the user only needs diagnosis
- the user only needs a digest
- the draft is not ready for the next stage
- the output already satisfies the request

More stages do not always mean better work.

## Agent Ownership Overlay

### Jarvis

Should not lead core-skill orchestration.

Jarvis may only:

- capture
- remind
- route lightweight signals

### Antigravity

May prepare material for a core chain, but should not finalize chain order for high-stakes tasks.

Best role:

- preprocess
- classify
- gather source packets

### Claude / Codex

Should own:

- lead-skill selection
- multi-stage ordering
- handoff judgment
- final architecture decisions

## Routing Priority Rule

When a request could fit multiple core skills, choose in this order:

1. the skill that matches the earliest unresolved bottleneck
2. the skill with the clearest output contract for the current stage
3. the smallest skill that moves the task forward without premature downstream work

This prevents the system from jumping too early into writing, QA, or packaging.

## Constitution Rule

`SKILL-TIERS.md` says who is trusted.

`SKILLS-MAP.md` says what each skill is for.

`CORE-SKILL-ORCHESTRATION.md` says who leads when multiple trusted skills are possible.

Together, these three files form the routing constitution of the shared brain.

## Bottom Line

The core stack should behave like a disciplined production pipeline:

- understand first
- diagnose second
- write third
- check fourth
- render fifth
- package last

One mind.
Many modules.
Clear ownership.
