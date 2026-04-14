# SKILL-INVOCATION-POLICY.md

## Purpose

Define how the system should decide when to invoke skills automatically.

The goal is simple:

The user should not need to remember skill names.

The user states the need.
The system decides whether a skill should be invoked, which one should lead, and whether multiple skills should cooperate.

## Core Principle

Skills are backend cognitive modules, not menu items the user must manually select.

Default behavior:

- user expresses intent
- system interprets intent
- system decides whether to invoke zero, one, or multiple skills

## What The User Should Do

The user should normally only need to provide:

- the request
- the goal
- the material
- the constraint if one exists

The user should not need to specify:

- which skill to use
- which file to read first
- which workflow to trigger
- which agent should take the lead

Exception:

If the user explicitly names a skill or asks for a certain perspective, that instruction should be respected.

## Invocation Decision Order

When a request arrives, the system should decide in this order:

1. What is the real task?
2. Is this primarily knowledge retrieval, workflow execution, writing, distillation, or coordination?
3. Does an existing skill clearly fit this task?
4. Should one skill lead, or should multiple skills cooperate?
5. Does the task belong in Inbox, Working Memory, or Long-Term Memory?
6. Which agent should own the blocking work?

## When To Invoke A Skill Automatically

A skill should be auto-invoked when most of these are true:

- the request matches a repeated task pattern
- a stable workflow already exists
- the skill would materially improve quality or speed
- the task falls clearly inside the skill boundary
- invoking the skill will reduce ambiguity rather than increase it

## When Not To Invoke A Skill

Do not invoke a skill automatically when:

- the task is simple and direct
- the skill is broader than the actual need
- the request is still too vague to classify
- the work is mostly lookup, not workflow
- invoking the skill would load too much irrelevant context

## Single-Skill Invocation

Use a single leading skill when:

- one skill clearly matches the task
- the task has one dominant mode
- adding more skills would create noise

Examples:

- a paper needs structured digestion -> `paper-digest`
- a post needs voice alignment -> `uncle-glasses-writing-voice`
- a Threads account needs strategic analysis -> `threads-account-research`

## Multi-Skill Invocation

Use multiple skills only when each has a distinct job.

Good pattern:

- one skill leads
- one or more supporting skills contribute bounded help

Examples:

- article generation:
  - `paper-digest` for evidence extraction
  - `uncle-glasses-writing-voice` for final tone
  - `optometry-writer` for HTML/schema packaging

- distillation:
  - `uncle-glasses-distiller` as orchestrator
  - a perspective skill only if it sharpens the synthesis

## Leading Skill Rule

In a multi-skill task, one skill must be the leader.

The leading skill determines:

- the main task frame
- the expected output
- the workflow order

Supporting skills should not try to redefine the task.

## Memory First Rule

Not every request should trigger a skill.

If the request is mainly:

- raw capture
- rough idea parking
- unresolved collection

then it should go to Inbox or Working Memory first.

Skills should operate after the task has enough shape.

## Agent Ownership Rule

Skill invocation and agent ownership are related, but not identical.

### Jarvis

May trigger lightweight routing or capture logic.
Should not authoritatively run complex multi-skill synthesis.

### Antigravity

May invoke preprocessing-oriented workflows or prepare material for skill use.
Should not usually be the final authority on core skill-driven synthesis.

### Claude/Codex

Should own blocking reasoning, multi-skill coordination, and final output when the task is structurally complex.

## Trigger Sources

Skills may be invoked from:

- direct user request
- recognizable task pattern
- known file or artifact type
- repeated workflow state
- explicit mention of a perspective or mode

## Anti-Patterns

Bad invocation behavior includes:

- loading a huge skill because one sentence vaguely resembles it
- invoking multiple large skills with overlapping responsibilities
- using a skill where a simple answer would do
- using a skill when a note lookup would be better
- invoking a skill before the task has enough shape

## Policy For Existing Core Skills

### `uncle-glasses-distiller`

Invoke only when the task is truly about distillation into a reusable framework or skill.

Do not invoke for ordinary writing, simple summaries, or light strategy comments.

### `uncle-glasses-writing-voice`

Invoke when the task is about sounding like Uncle Glasses, aligning tone, or turning material into the right narrative voice.

Do not invoke just because the topic is optometry.

### `paper-digest`

Invoke when a paper or research source needs structured digestion, evidence translation, or Obsidian-ready extraction.

Do not invoke for broad brainstorming without a concrete research object.

### `optometry-writer`

Invoke when content is ready to be packaged into publishable HTML/schema output.

Do not invoke during early idea formation.

### `optometry-html-renderer`

Invoke when the main task is rendering a substantially written article into clean blog HTML.

Do not invoke when the task is still primarily about voice, research, or publishing metadata policy.

### `uncle-glasses-blog-packager`

Invoke when the article is already materially formed and the main task is publish-readiness:

- canonical
- schema
- Blogger packaging
- release checks

Do not use it as the first drafting or renderer layer unless the task explicitly asks for full publish packaging.

## User Experience Rule

The user should experience skills as invisible competence.

The system may mention which skill is being used when it helps transparency, but the user should not be required to drive the invocation manually.

## Bottom Line

The correct model is:

- user gives intent
- system interprets
- system selects the smallest effective set of skills
- system keeps context as clean as possible

That is what makes the skill system feel like a brain instead of a toolbox.
