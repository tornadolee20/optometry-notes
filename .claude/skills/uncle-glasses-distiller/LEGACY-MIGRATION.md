# LEGACY-MIGRATION.md

Updated: 2026-04-15

## Status

`uncle-glasses-distiller` is now best treated as the original mother file and source material.

It is no longer the preferred default routing target for new distillation work.

## Use Instead

For new distillation tasks, prefer:

- `.claude/skills/uncle-glasses-distiller-core/SKILL.md`

Supporting workflows:

- `.agents/workflows/distillation-review-gate.md`
- `.agents/workflows/distillation-obsidian-integration.md`

Supporting references and template:

- `.claude/skills/uncle-glasses-distiller-core/references/REFERENCE-MAP.md`
- `.claude/skills/uncle-glasses-distiller-core/references/distillation-source-strategy.md`
- `.claude/skills/uncle-glasses-distiller-core/templates/distilled-skill-template.md`

## Why

The original file appears to combine multiple layers:

- intake and path choice
- research method
- review gate logic
- output routing
- memory and Obsidian integration

That makes automatic invocation harder and increases context bloat.

The new split keeps the distiller smaller, clearer, and easier to compose with other modules.

## Practical Routing

If the task is:

- distill a person into a perspective skill
- distill a topic into a reusable framework
- decide whether something is worth turning into a reusable skill

then route to `uncle-glasses-distiller-core`.

Load the review and integration workflows only when the task reaches those stages.

## Legacy Folder Role

This folder should now be treated as:

- mother file archive
- source-material reservoir
- example library

See also:

- `.claude/skills/uncle-glasses-distiller/ARCHIVE-INDEX.md`
- `.claude/skills/uncle-glasses-distiller/README-LEGACY.md`
