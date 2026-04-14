# BRAIN-ARCHITECTURE.md

> Goal: make Jarvis, Antigravity, Claude/Codex, and Obsidian behave like one shared brain without collapsing into one noisy workspace.

## Core Principle

The system should share one memory architecture, not just one folder.

The difference:

- Shared folder = everyone can read and write everything.
- Shared brain = everyone knows what to read, what to write, what to ignore, and when to hand off.

## The Four Layers

### 1. Perception Layer

Who touches the outside world first.

- Jarvis: mobile capture, reminders, quick replies, heartbeat checks
- Antigravity: web browsing, bulk intake, notebook/web automation, long-running batch work
- Claude/Codex: deep analysis after signal has already been captured

### 2. Working Memory Layer

Short-term task memory.

This is where active tasks live before they are promoted into long-term memory.

- `Inbox/`
- `memory/YYYY-MM-DD.md`
- `task.md` or task-specific state files
- handoff notes

### 3. Long-Term Memory Layer

Only Obsidian and explicit long-term files should count as durable memory.

- `obsidian-vault/`
- `MEMORY.md`
- stable workflows
- mature knowledge cards
- final skill definitions

### 4. Execution Layer

Who is responsible for getting each kind of work done.

- Jarvis: capture and nudge
- Antigravity: preprocess and route
- Claude/Codex: synthesize, decide, structure, and finalize

## Role Design

### Jarvis

Role: sensory nerve + reminder system

Good at:

- mobile capture
- reminders
- lightweight conversational touchpoints
- writing raw items into inbox
- heartbeat checks

Should not own:

- final knowledge synthesis
- long-form writing
- skill architecture
- final edits to `MEMORY.md`

### Antigravity

Role: preprocessing cortex + batch operator

Good at:

- cleaning and formatting raw material
- preliminary tagging and clustering
- browser-heavy or repetitive work
- rough summaries
- preparing handoff packets for Claude/Codex

Should not own:

- final system architecture decisions
- final long-term memory edits
- canonical knowledge cards
- irreversible structural decisions

### Claude / Codex

Role: deep reasoning core + memory architect

Good at:

- difficult synthesis
- system design
- skill design and refinement
- task decomposition
- final knowledge-card writing
- Obsidian integration
- updating stable protocols

Should not own:

- all repetitive cleanup
- every small capture event
- every notification or reminder loop

### Obsidian

Role: canonical long-term memory

This is not just storage. It is the official place where durable knowledge becomes real.

## Memory Rules

### Rule 1

Not everything deserves long-term memory.

### Rule 2

If it matters across sessions, it must be written to a file.

### Rule 3

If it is still fuzzy, it belongs in Inbox or Working Memory, not in `MEMORY.md`.

### Rule 4

Only Claude/Codex should finalize long-term memory and core architecture docs.

## Ownership Rules

| Area | Jarvis | Antigravity | Claude/Codex |
| --- | --- | --- | --- |
| `Inbox/` | write | write | write |
| `memory/YYYY-MM-DD.md` | light write | write | write |
| Handoff docs | no | write | write |
| `MEMORY.md` | no | no | yes |
| Obsidian knowledge cards | no | draft only | yes |
| Skill definitions | no | draft only | yes |
| Protocol files | no | suggest only | yes |

## Mobile Linkage

Claude/Codex does not directly attach to the phone in this environment.

Therefore the mobile path should be indirect:

1. Mobile -> Jarvis / LINE / capture endpoint
2. Jarvis -> `Inbox/手機收集箱.md`
3. Antigravity -> preprocess + tag + add `[待 Claude 處理]`
4. Claude/Codex -> distill into notes, tasks, memory, or skills
5. Obsidian -> canonical storage

## Promotion Pipeline

Every input should move through one of four fates:

1. Discard
2. Keep as raw inbox
3. Promote to working task
4. Promote to long-term memory or skill

If a piece of information does not clearly earn promotion, it should stay lower.

## Claude Code Logic We Borrow

These principles are worth adopting from Claude Code style systems:

- Skills should be small, contextual work units, not giant knowledge dumps.
- Metadata matters: description, when-to-use, paths, hooks, agent, effort.
- Permissions and execution boundaries should be explicit.
- Tooling, memory, and workflows should be separate layers.
- Multi-agent collaboration works best when tasks are clearly blocking or sidecar.

## Recommended Immediate Implementation

1. Use Obsidian as the single source of truth for long-term knowledge.
2. Enforce three memory layers: Inbox, Working Memory, Long-Term Memory.
3. Use a standard handoff format across Jarvis, Antigravity, and Claude/Codex.
4. Use a standard task-state template for all active work.
5. Distill external systems like Claude Code into architecture notes first, then into skills second.
6. Follow `SKILL-INVOCATION-POLICY.md` so users can state needs directly while the system decides how skills are invoked.

## Success Condition

The system is working when:

- mobile capture never gets lost
- preprocessing does not pollute long-term memory
- Claude/Codex can reliably turn raw material into structured assets
- Obsidian becomes cleaner over time, not noisier
- each agent knows its boundary without needing custom prompts every time
