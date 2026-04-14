# HANDOFF-PROTOCOL.md

## Goal

Make Jarvis, Antigravity, and Claude/Codex hand work to one another without ambiguity.

## Handoff Principles

1. Handoffs should move work forward, not just dump context.
2. Every handoff should name the next owner.
3. Every handoff should state the expected output.
4. If the work is still noisy, say so explicitly.
5. If the work is blocked, name the blocker instead of pretending it is ready.

## Standard Handoff Fields

Every non-trivial handoff should include:

- `Task`
- `Current State`
- `Why This Matters`
- `Next Owner`
- `Expected Output`
- `Blockers`
- `Links / Paths`

## Jarvis -> Antigravity

Use when a mobile capture or quick signal needs cleaning, grouping, or routing.

Template:

```md
## Handoff: Jarvis -> Antigravity

- Task: [one sentence]
- Current State: raw capture
- Why This Matters: [why it should not be dropped]
- Next Owner: Antigravity
- Expected Output: cleaned note / grouped items / rough summary
- Blockers: none / [describe]
- Links / Paths: [file paths or source]
```

## Antigravity -> Claude/Codex

Use when material has enough signal for deep synthesis or a system decision.

Template:

```md
## Handoff: Antigravity -> Claude/Codex

- Task: [one sentence]
- Current State: preprocessed
- Why This Matters: [why deep work is justified]
- Next Owner: Claude/Codex
- Expected Output: note / memory update / skill / article / architecture decision
- Blockers: none / [describe]
- Links / Paths: [file paths or source]

> [待 Claude 處理] 原因：[deep reasoning / structure / writing / memory decision]
```

## Claude/Codex -> Obsidian

Use when a task has been distilled enough to become durable memory.

Template:

```md
## Handoff: Claude/Codex -> Obsidian

- Task: [one sentence]
- Current State: distilled
- Why This Matters: reusable across sessions
- Next Owner: Obsidian long-term memory
- Expected Output: knowledge card / MOC update / stable protocol / skill note
- Blockers: none / [describe]
- Links / Paths: [target path]
- Memory Decision: promote-to-long-term-memory / turn-into-skill
```

## Claude/Codex -> Jarvis

Use when the deep work is done and a reminder, follow-up, or user-facing nudge should happen on mobile.

Template:

```md
## Handoff: Claude/Codex -> Jarvis

- Task: [one sentence]
- Current State: decided
- Why This Matters: user follow-up needed
- Next Owner: Jarvis
- Expected Output: reminder / check-in / delivery notification
- Blockers: none / [describe]
- Links / Paths: [file paths]
```

## Decision Types

Every handoff should imply one of these modes:

- `capture`
- `preprocess`
- `distill`
- `decide`
- `archive`
- `notify`

## Blocking vs Sidecar

Mark the handoff clearly when needed:

- `blocking`: the next step cannot proceed without this result
- `sidecar`: useful parallel work that should not block the main path

## Anti-Patterns

Do not hand off like this:

- giant paste with no task
- "look at this" with no output target
- pseudo-summary with no next owner
- final conclusions written into Inbox
- long-term memory edits from non-authoritative agents

## Rule of Finalization

Only Claude/Codex should finalize:

- long-term memory
- system architecture docs
- core skill definitions
- protocol changes

## Relation To Skill Invocation

Handoff and skill invocation should stay coordinated.

Before handing work off, the system should know:

- whether a skill is needed
- which skill is leading
- whether supporting skills are sidecar only

See also: `SKILL-INVOCATION-POLICY.md`
