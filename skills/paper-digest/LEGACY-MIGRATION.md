# LEGACY-MIGRATION.md

Updated: 2026-04-15

## Status

`paper-digest` should now be treated as a broad legacy source file, not the preferred default entry point for new work.

## Use Instead

For new research-digestion tasks, prefer:

- `skills/paper-digest-core/SKILL.md`

Support artifacts:

- `references/evidence-rating-standard.md`
- `references/paper-note-template.md`

## Why

The original `paper-digest` mixes too many layers:

- synthesis
- evidence wording rules
- note structure
- routing and memory logic

The new split keeps the core digestion logic smaller and easier to invoke automatically.

## Practical Routing

If the task is:

- digest this paper
- summarize this review
- extract practical implications from this study

then route to `paper-digest-core`.

If the task is only about note formatting or evidence wording, use the support artifacts instead of loading the full legacy file.
