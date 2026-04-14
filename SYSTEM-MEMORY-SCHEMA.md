# SYSTEM-MEMORY-SCHEMA.md

## Purpose

Define one shared memory model for Jarvis, Antigravity, Claude/Codex, and Obsidian.

The system uses three memory layers.

## Layer 1: Inbox Memory

Purpose: capture first, judge later.

Typical content:

- quick ideas
- voice-to-text scraps
- URLs
- reminders
- questions
- raw observations

Primary locations:

- `Inbox/手機收集箱.md`
- `Inbox/待整理任務.md`
- intake buffers and raw collection files

Rules:

- incomplete is acceptable
- duplication is acceptable
- structure is optional
- no final conclusions required

Primary writers:

- Jarvis
- Antigravity
- Claude/Codex when triaging live conversations

## Layer 2: Working Memory

Purpose: hold active tasks and temporary synthesis.

Typical content:

- task status
- current owner
- blockers
- next action
- draft reasoning
- handoff packets
- decisions not yet stable enough for long-term memory

Primary locations:

- `memory/YYYY-MM-DD.md`
- task state files
- handoff docs
- temporary synthesis notes

Rules:

- must be understandable by the next agent
- should include ownership and next step
- can contain partial conclusions
- should expire or be promoted

Primary writers:

- Antigravity
- Claude/Codex
- Jarvis for light status notes only

## Layer 3: Long-Term Memory

Purpose: preserve durable knowledge, stable decisions, and reusable patterns.

Typical content:

- distilled knowledge cards
- stable workflows
- skill definitions
- major system decisions
- validated heuristics
- long-lived context for future sessions

Primary locations:

- `MEMORY.md`
- `obsidian-vault/`
- stable protocol files
- finalized skills

Rules:

- only durable insights belong here
- every item should be reusable
- avoid raw logs
- avoid speculative notes unless clearly labeled

Primary writer:

- Claude/Codex

## Promotion Rules

### Inbox -> Working Memory

Promote when at least one of these is true:

- it requires action
- it connects to an active project
- it contains enough signal to justify synthesis
- it needs multi-agent coordination

### Working Memory -> Long-Term Memory

Promote when at least one of these is true:

- it will likely matter across sessions
- it captures a repeatable workflow
- it represents a validated decision
- it can become a knowledge card
- it can become a skill or improve an existing skill

### Do Not Promote

Do not promote when content is:

- transient
- redundant
- purely logistical
- low-confidence speculation
- version-specific noise with little reuse value

## Write Permissions

| Memory Area | Jarvis | Antigravity | Claude/Codex |
| --- | --- | --- | --- |
| Inbox | yes | yes | yes |
| Working Memory | limited | yes | yes |
| Long-Term Memory | no | no | yes |

## Memory Decision Labels

Every meaningful task or note should eventually receive one label:

- `discard`
- `keep-in-inbox`
- `promote-to-working-memory`
- `promote-to-long-term-memory`
- `turn-into-skill`

## Distillation Standard

When Claude/Codex writes something into long-term memory, it should answer:

1. What is this?
2. Why does it matter?
3. When should we use it again?
4. What action or structure does it imply?

## Canonical Principle

The system does not remember because an agent "knows" something.

The system remembers because the right layer was updated.

## Invocation Relation

Skill invocation should happen after memory classification, not before it.

That means:

- raw material may stay in Inbox without invoking a skill
- shaped working tasks may trigger one or more skills
- long-term memory should only receive distilled outputs

See also: `SKILL-INVOCATION-POLICY.md`
