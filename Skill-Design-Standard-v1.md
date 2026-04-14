# Skill-Design-Standard-v1.md

## Purpose

Define a first stable standard for how our system should design, evaluate, and maintain skills.

This standard is informed by:

- our current multi-agent architecture
- Obsidian as long-term memory
- the distinction between Inbox, Working Memory, and Long-Term Memory
- lessons distilled from the Claude Code sourcemap materials

## Definition

A skill is a reusable operating pattern for a recurring task state or domain task.

It should help the system do work more reliably, not merely remember more text.

## What a Skill Should Be

A skill should be:

- focused
- reusable
- bounded
- triggerable under recognizable conditions
- useful across multiple future sessions

## What a Skill Should Not Be

A skill should not be:

- a giant raw research folder
- a dumping ground for everything on a topic
- a substitute for daily notes
- a substitute for long-term knowledge cards
- a hidden project archive

## Skill Categories

Our system should recognize at least four categories.

### 1. Domain Skills

Examples:

- optometry writing
- paper digest
- project writer
- perspective skills

Use when deep domain translation or domain workflow repeats.

### 2. Workflow Skills

Examples:

- distillation
- prompt-to-source
- account research
- content funnel workflows

Use when the main value is process, not subject matter.

### 3. Meta-Cognitive Skills

Examples:

- verification
- simplification
- getting unstuck
- choosing the right abstraction

Use when the system needs help with a recurring thinking state.

### 4. Integration Skills

Examples:

- NotebookLM preparation
- cross-system format adapters
- publishing preparation

Use when the skill bridges systems or environments.

## Skill Creation Test

Before creating a new skill, ask:

1. Does this problem recur?
2. Does it have a recognizable trigger?
3. Does a stable workflow exist?
4. Will future sessions benefit from reusing it?
5. Is this better as a skill than as a note, workflow doc, tool, or plugin?

If the answer to most of these is no, do not create a skill yet.

## Skill vs Note Decision

Create a note when:

- the main value is knowledge preservation
- the material is still exploratory
- the output is reference-oriented
- reuse depends more on lookup than on workflow execution

Create a skill when:

- the main value is repeated operational use
- triggering conditions are clear
- the process can be stated compactly
- future invocations should behave consistently

## Required Skill Metadata

Every skill should clearly define:

- `name`
- `description`
- `when to use`
- target user/task context
- scope and boundaries

Where supported or useful, also define:

- `paths`
- `hooks`
- `agent`
- `effort`
- execution assumptions

## Description Standard

A good skill description should answer:

1. What the skill helps do
2. In what kind of situation it should be used
3. Why it is better than generic reasoning

Bad description:

- too vague
- too broad
- just restates the title

Good description:

- situational
- bounded
- operational

## Trigger Standard

Every skill should have a clear triggering model.

A strong trigger usually includes one or more of:

- explicit user wording
- recurring task pattern
- known file/context type
- recognizable decision state

If a skill cannot explain when it should fire, it is probably too vague.

## Scope Standard

Each skill should have a clear inside and outside.

It should state:

- what it is responsible for
- what it deliberately does not cover

This prevents skill bloat.

## Size Standard

Prefer smaller skills with clean responsibility over giant universal skills.

General rule:

- notes can be large
- skills should stay sharply scoped

If a skill contains multiple different workflows, split it.

## Memory Standard

A skill is not long-term memory.

Long-term memory belongs in:

- `MEMORY.md`
- Obsidian
- stable notes

The skill should only contain the minimum durable workflow and framing needed for reliable reuse.

Research depth can exist in references, but the skill itself should stay operational.

## Distillation Standard

The best path is:

1. gather raw material
2. create or update notes
3. distill stable principles
4. create the skill only after the workflow becomes clear

This means:

- not every research project should immediately become a skill
- a note often comes before a skill

## Multi-Agent Standard

Skills should respect our agent architecture.

### Jarvis

Should trigger or route lightweight actions, not own deep skill authoring.

### Antigravity

Can prepare or scaffold skill inputs, but should rarely finalize core skills.

### Claude/Codex

Should finalize:

- core skill structure
- boundaries
- metadata
- integration with long-term memory and protocols

## Quality Checklist

A skill is ready when:

- its use case is clear
- its boundaries are clear
- its description is specific
- its workflow is reusable
- it does not duplicate another skill
- it fits the memory architecture
- it respects agent boundaries

## De-Bloat Checklist

A skill likely needs splitting if:

- it tries to solve too many unrelated tasks
- its trigger conditions are vague
- most of its content is reference material
- it keeps growing every time a new edge case appears
- nobody can explain its scope in one paragraph

## Maintenance Rule

When a skill is corrected repeatedly, one of these should happen:

1. tighten the metadata
2. narrow the scope
3. split the skill
4. move reference-heavy material back into notes
5. update protocol docs if the failure reveals a system-level issue

## Naming Rule

Skill names should signal function, not mystique.

Prefer:

- `[domain]-writer`
- `[task]-digest`
- `[system]-auditor`
- `[topic]-perspective`
- `[workflow]-engine`

Avoid names that sound clever but fail to reveal purpose.

## Our Immediate Standard

Going forward, every proposed new skill should be checked against:

1. Is it really a skill?
2. What repeated state or task does it serve?
3. What belongs in notes instead?
4. What metadata will make it trigger correctly?
5. Which agent should be authoritative for maintaining it?

## Bottom Line

Our system gets stronger when skills become smaller, clearer, and more operational.

The goal is not to have more skills.

The goal is to have skills that behave like reliable cognitive tools inside one shared brain.
