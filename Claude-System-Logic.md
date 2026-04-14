# Claude-System-Logic.md

## Purpose

This document distills the most reusable system logic observed from the Claude Code sourcemap materials.

It is not a reverse-engineering trophy.
It is a translation layer from "interesting repo" into "useful architecture for our system."

## What This Material Actually Gives Us

The main value is not hidden features.
The main value is visible system logic:

- how a host agent system thinks about skills
- how it separates tools, commands, plugins, and external resources
- how it thinks about permissions and execution boundaries
- how it handles startup, coordination, and extensibility

## Core Insight 1: A Skill Is Not a Knowledge Dump

A skill is best understood as:

- a contextual work unit
- with invocation metadata
- with a bounded purpose
- that becomes relevant under recognizable conditions

A skill is not:

- a giant research archive
- a whole project folder
- a permanent memory store
- a replacement for notes

Implication for our system:

- use notes to preserve knowledge
- use skills to operationalize repeated work

## Core Insight 2: Metadata Is Part of Cognition

Observed high-value metadata concepts include:

- name
- description
- when-to-use
- paths
- hooks
- agent
- effort
- execution context

These are not just file decorations.
They are part of retrieval, routing, and decision quality.

Implication for our system:

- skill quality depends not only on content but also on invocation metadata
- better metadata means better triggering, less context waste, and cleaner handoff

## Core Insight 3: Separate Memory from Execution

Mature agent systems do not collapse everything into one layer.

Different things play different roles:

- notes preserve knowledge
- skills encode reusable workflows
- tools execute concrete actions
- commands expose user-facing entry points
- plugins extend host capability
- MCP connects external resources and structured interfaces

Implication for our system:

- avoid putting execution logic into memory notes
- avoid turning every reusable idea into a skill
- avoid making skills act like knowledge warehouses

## Core Insight 4: Permission Design Matters

A strong agent system is not just capable.
It is controlled.

The sourcemap materials suggest a deep concern for:

- permission modes
- dangerous actions
- auto mode boundaries
- sandbox scope
- escalation rules

Implication for our system:

- our intelligence is only trustworthy if our execution boundaries are explicit
- multi-agent systems need permission-aware behavior, not just prompt cleverness

## Core Insight 5: Extensibility Requires Clean Boundaries

The presence of tools, commands, plugins, MCP services, and bundled skills suggests one stable principle:

Each extension surface should have a distinct job.

This prevents:

- duplicated logic
- ambiguous ownership
- brittle growth
- context pollution

Implication for our system:

Before building anything reusable, ask:

1. Is this knowledge?
2. Is this a workflow?
3. Is this an execution capability?
4. Is this an external integration?

The answer determines whether it becomes:

- a note
- a skill
- a tool
- a plugin
- an MCP service

## Core Insight 6: Built-In Skills Reveal System Priorities

Bundled skills such as verification, simplification, getting unstuck, remembering, or skill creation reveal a pattern:

The most valuable skills often target repeated cognitive states, not domain knowledge.

Examples of such states:

- "I need to verify"
- "I am stuck"
- "I need to simplify"
- "I need to turn this into a skill"

Implication for our system:

We should create more state-oriented skills, not only domain-oriented skills.

This suggests a healthy balance between:

- domain skills
- workflow skills
- meta-cognitive skills

## Core Insight 7: Multi-Agent Systems Need Task Typing

Parallel agents only help when work is typed correctly.

The most useful distinction is:

- blocking work
- sidecar work

Blocking work:

- directly determines the next step
- should be handled by the main reasoning path

Sidecar work:

- can run in parallel
- supports but does not block the next local step

Implication for our system:

- Jarvis should capture and notify
- Antigravity should preprocess and batch
- Claude/Codex should own blocking synthesis and structural decisions

## Core Insight 8: The Startup Path Exposes What the System Truly Values

When a system puts effort into:

- prefetch
- warm startup
- session restore
- settings load order
- analytics gates
- policy checks

it is revealing its real operating priorities.

Implication for our system:

We should pay more attention to:

- what gets loaded first
- what should stay lazy
- what must be available before deep work starts

This matters for skills, memory, and handoff loading too.

## Core Insight 9: Reconstructed Repositories Should Be Read for Patterns, Not Worshipped

A sourcemap-derived repo can be very useful.
But it is still an observed footprint, not ultimate ground truth.

Therefore:

- extract stable patterns
- ignore implementation noise
- avoid mythologizing specific files or feature flags

Implication for our system:

Our win comes from distillation, not imitation.

## What We Should Reuse

The following logic is directly reusable:

- skill metadata discipline
- strong layer separation
- permission-aware execution
- clear extension boundaries
- task typing for multi-agent work
- treating built-in skills as repeated cognitive states

## What We Should Not Reuse Blindly

- version-specific implementation details
- internal names without stable architectural meaning
- low-level build and bundling trivia
- huge raw source dumps
- any assumption that "if it exists in source, it should exist in our system"

## Translation Into Our System

These sourcemap materials support five upgrades for us:

1. Better skill metadata and sharper skill boundaries
2. Better separation between note, skill, workflow, and execution capability
3. Better memory governance across Jarvis, Antigravity, Claude/Codex, and Obsidian
4. Better permission thinking for agent actions
5. Better multi-agent handoff discipline

## Bottom Line

This material is useful because it reveals how a serious agent system organizes cognition.

The most valuable move is not to copy its code.

The most valuable move is to translate its stable logic into our own architecture, memory model, skill design rules, and collaboration protocols.
