# 2026-04-15 Uncle Glasses Writing Voice Review

## Skill Review

- Skill: `.agents/skills/uncle-glasses-writing-voice/SKILL.md`
- Trigger Clarity: 3
- Boundary Clarity: 3
- Reusability: 3
- Invocation Fitness: 3
- Output Usefulness: 2
- Reference Hygiene: 3
- Maintenance Cost: 2
- Shared-Brain Fit: 3
- Total: 22
- Tier: `Core Skill Candidate`
- Failure Flags: none
- Recommended Action: `promote to core`

## Rationale

### Trigger Clarity

Strong.

The skill clearly states when it should be used:

- "write like me"
- tone alignment
- rewriting generic drafts into Uncle Glasses voice

It also clearly excludes research digestion, QA, rendering, and packaging.

### Boundary Clarity

Strong.

The skill now has a sharp boundary:

- it owns voice transfer
- it does not own critique
- it does not own packaging
- it does not own research synthesis

This makes handoff to `uncle-glasses-writing-qa`, `optometry-html-renderer`, and `uncle-glasses-blog-packager` very clear.

### Reusability

Strong.

This is a genuinely recurring task in the system.

Any article, post, story, or translated research draft may need this layer.

### Invocation Fitness

Strong.

The skill is now small enough to load cleanly and it points to references selectively through `REFERENCE-MAP.md`.

That improves auto-routing quality instead of harming it.

### Output Usefulness

Usable but not yet perfect.

The output shape is clear and practical, but still relatively lightweight:

- main voice goal
- rewritten draft
- notes on tone
- remaining risks

This is good, but future versions could become even stronger by including a short "what changed" field or revision summary field.

### Reference Hygiene

Strong.

This skill benefited heavily from refactoring:

- core skill body is now clean
- hooks, transitions, endings, structure, hybrid logic, and scoring are all outside the core
- reference loading is intentional rather than automatic

### Maintenance Cost

Good, but not minimal.

Voice calibration is inherently nuanced and may still need tuning over time.

Even with the cleaner structure, this skill will likely receive more subjective adjustments than more mechanical skills.

### Shared-Brain Fit

Strong.

This skill fits the architecture well:

- it respects the layered writing stack
- it does not duplicate memory
- it composes cleanly with QA, renderer, and packager

## Summary Judgment

`uncle-glasses-writing-voice` now behaves like a real core skill rather than a bloated mother file.

It is one of the strongest candidates in the current system for formal promotion to `core` status.

## Suggested Follow-Up

- mark it internally as `core`
- use this review as the calibration baseline for reviewing `uncle-glasses-writing-qa`
