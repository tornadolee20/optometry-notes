# REFERENCE-MAP.md

Updated: 2026-04-15

## Purpose

This file explains which distillation support artifact should be loaded for which need.

The goal is to keep `uncle-glasses-distiller-core` small and decisive.

## Reference Routing

### `distillation-source-strategy.md`

Use when the main uncertainty is how to source the target well.

Typical triggers:

- public figure distillation
- topic with weak source quality
- medical / technical topic
- hype-heavy topic

### `templates/distilled-skill-template.md`

Use when the task has already passed the decision stage and needs a stable output shape for the resulting skill.

### `distillation-review-gate.md`

Use when the task needs a pass / revise / fail decision before finalizing the asset.

### `distillation-obsidian-integration.md`

Use when the output must be landed into Obsidian, memory, or a durable knowledge path.

## Loading Rule

Do not load every support file by default.

Load only the smallest set that helps the current stage:

- decision
- sourcing
- review
- landing

## Bottom Line

`uncle-glasses-distiller-core` stays as the orchestrator.

The references and workflows are stage-specific support tools.
