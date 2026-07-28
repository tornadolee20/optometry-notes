# Shared Memory Protocol

Status: draft local source of truth
Primary device: personal-laptop
Last reviewed: 2026-07-28

## Purpose

This repository is the shared memory and work handoff layer for the user's AI-assisted work across personal and company computers.

The goal is continuity, not full machine cloning. Each device keeps its own tool caches and private runtime history. Shared state must be explicit, reviewed, and versioned through Git.

## Source Of Truth

Use this repository as the durable source of truth for:

- Long-term project memory and decisions.
- Daily work logs that are safe to share between devices.
- Active work queues and handoff notes.
- Device role notes.
- Approved shared skills and workflow contracts.

Do not use cloud file sync for Git repositories. Use Git clone, pull, commit, and push only.

## Do Not Sync

Never sync these folders directly between devices:

- `.git/` through OneDrive, Dropbox, iCloud, or similar file sync.
- `.claude/projects/`
- `.codex/sessions/`
- `.codex/memories/`
- Antigravity brain, conversations, or runtime caches.
- Hermes sessions, caches, virtual environments, and local runtime state.
- API keys, browser profiles, cookies, tokens, `.env` files, or machine-specific config.

If something from those areas matters, summarize it into an approved memory, handoff, or device log file.

## Device Roles

The personal laptop is the primary development and memory-authoring device unless this file is updated.

The company computer is a secondary device until it has:

- A clean clone of this repository outside cloud-sync folders.
- Matching Git remote access.
- A successful read-only startup check.
- A clear task owner handoff.

## Startup Checklist

At the start of work on any device:

1. Open this repository.
2. Run `scripts/sync-start.ps1`.
3. Read `MEMORY.md`.
4. Read the current daily note under `memory/`.
5. Read `work-queue/README.md`.
6. Read active task files under `work-queue/active/`.
7. Check the device note under `devices/`.

If the repository is detached, dirty, or cannot pull cleanly, stop and resolve before doing real work.

## Closeout Checklist

At the end of work:

1. Update the relevant active task.
2. Add a handoff when another device or AI should continue.
3. Add a device log entry when the device state changed.
4. Promote durable decisions to `MEMORY.md` only when they are stable and useful.
5. Run `scripts/sync-finish.ps1`.
6. Review changes before commit.
7. Commit and push only after review.

## Ownership Rules

- One task has one current owner.
- A device may read any task, but should not edit an active task owned by another device without changing the owner in the task file.
- `MEMORY.md` is for stable memory, not raw logs.
- Daily notes are for raw chronology.
- Handoffs are for actionable continuation.

## Conflict Rule

If two devices changed the same work area:

1. Do not overwrite either side.
2. Create a handoff describing both versions.
3. Compare with Git diff.
4. Merge manually after deciding which state is authoritative.
