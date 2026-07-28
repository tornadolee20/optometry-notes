# 2026-07-28 Git Branch Repair Note

## Event

After creating the shared-memory skeleton, the repository was still in detached HEAD.

## Error

Attempted to create `codex/shared-memory-baseline`, but Git could not create the ref. A second attempt with `shared-memory-baseline` showed `.git` write permission was blocked by the sandbox.

## Resolution

With explicit local Git write approval, created the branch:

- `shared-memory-baseline`

## Lesson

When this environment shows detached HEAD, branch repair may require approved `.git` writes even when normal workspace files are writable.

## AGENTS.md Review

No AGENTS.md change is needed. The existing safety model is sufficient: branch repair is a local Git metadata write, not a destructive action, and escalation was requested before writing `.git`.
