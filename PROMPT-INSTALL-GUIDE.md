# PROMPT-INSTALL-GUIDE.md

Updated: 2026-04-15

## Purpose

This document explains how to deploy the four runtime prompts in the shared-brain system.

It covers:

- what each agent should load
- what should go into system prompt vs startup context
- which files each agent should actually read
- how to avoid prompt bloat

## Deployment Principle

Do not give every agent the full architecture stack.

The system should share one constitution, but each runtime should load only the subset it can actually use well.

## Prompt Pack

The current deployable prompt set is:

- `prompt-jarvis.md`
- `prompt-antigravity.md`
- `prompt-claude.md`
- `prompt-codex.md`

The supporting runtime constitution is:

- `SYSTEM-PROMPT-RUNTIME-RULES.md`
- `SKILL-TIERS.md`
- `SKILLS-MAP.md`
- `CORE-SKILL-ORCHESTRATION.md`
- `TASK-TO-CORE-CHAIN.md`
- `CORE-SKILL-TRIGGERS.md`
- `ROUTER-SHORT-RULES.md`
- `HANDOFF-PROTOCOL.md`
- `BRAIN-ARCHITECTURE.md`

## Recommended Installation Split

### Jarvis

System prompt:

- paste the content of `prompt-jarvis.md`

Startup context or linked references:

- `ROUTER-SHORT-RULES.md`
- `HANDOFF-PROTOCOL.md`

Do not load by default:

- `CORE-SKILL-ORCHESTRATION.md`
- `TASK-TO-CORE-CHAIN.md`
- `SYSTEM-PROMPT-RUNTIME-RULES.md`

Reason:

Jarvis should stay light, fast, and mobile-friendly.

### Antigravity

System prompt:

- paste the content of `prompt-antigravity.md`

Startup context or linked references:

- `ROUTER-SHORT-RULES.md`
- `HANDOFF-PROTOCOL.md`
- `TASK-TO-CORE-CHAIN.md`

Optional reference on demand:

- `CORE-SKILL-TRIGGERS.md`

Do not load by default:

- the full architecture stack

Reason:

Antigravity should preprocess and route, not act like the final architecture judge.

### Claude

System prompt:

- paste the content of `prompt-claude.md`

Startup context or linked references:

- `SKILLS-MAP.md`
- `CORE-SKILL-ORCHESTRATION.md`
- `TASK-TO-CORE-CHAIN.md`
- `CORE-SKILL-TRIGGERS.md`

Optional on demand:

- `SKILL-TIERS.md`
- `HANDOFF-PROTOCOL.md`

Reason:

Claude is the ambiguity resolver and lead-skill selector.

Claude needs the orchestration layer more than the implementation layer.

### Codex

System prompt:

- paste the content of `prompt-codex.md`

Startup context or linked references:

- `SKILL-TIERS.md`
- `SKILLS-MAP.md`
- `CORE-SKILL-ORCHESTRATION.md`
- `TASK-TO-CORE-CHAIN.md`
- `CORE-SKILL-TRIGGERS.md`
- `BRAIN-ARCHITECTURE.md`
- `HANDOFF-PROTOCOL.md`
- `memory/YYYY-MM-DD.md`

Optional on demand:

- `SYSTEM-PROMPT-RUNTIME-RULES.md`

Reason:

Codex is the local implementation arm and should see the full routing constitution plus architecture files.

## System Prompt Vs Startup Context

### Put into system prompt

Use for:

- identity
- role boundaries
- non-negotiable runtime rules
- escalation rules
- stop rules

That is why the `prompt-*.md` files exist.

### Put into startup context or linked files

Use for:

- routing maps
- task-pattern playbooks
- trigger guides
- handoff formats
- memory references

These should remain external so they can evolve without rewriting every system prompt.

## Minimal Deployment Option

If you need to deploy quickly:

- Jarvis -> `prompt-jarvis.md` + `ROUTER-SHORT-RULES.md`
- Antigravity -> `prompt-antigravity.md` + `ROUTER-SHORT-RULES.md`
- Claude -> `prompt-claude.md` + `CORE-SKILL-ORCHESTRATION.md`
- Codex -> `prompt-codex.md` + `SKILLS-MAP.md` + `CORE-SKILL-ORCHESTRATION.md`

This is the fastest usable configuration.

## Full Deployment Option

If you want the full shared-brain behavior:

### Jarvis full

- `prompt-jarvis.md`
- `ROUTER-SHORT-RULES.md`
- `HANDOFF-PROTOCOL.md`

### Antigravity full

- `prompt-antigravity.md`
- `ROUTER-SHORT-RULES.md`
- `HANDOFF-PROTOCOL.md`
- `TASK-TO-CORE-CHAIN.md`

### Claude full

- `prompt-claude.md`
- `SKILLS-MAP.md`
- `CORE-SKILL-ORCHESTRATION.md`
- `TASK-TO-CORE-CHAIN.md`
- `CORE-SKILL-TRIGGERS.md`

### Codex full

- `prompt-codex.md`
- `SKILL-TIERS.md`
- `SKILLS-MAP.md`
- `CORE-SKILL-ORCHESTRATION.md`
- `TASK-TO-CORE-CHAIN.md`
- `CORE-SKILL-TRIGGERS.md`
- `BRAIN-ARCHITECTURE.md`
- `HANDOFF-PROTOCOL.md`

## Maintenance Rule

When routing logic changes:

1. update the constitution files first
2. update runtime prompts only if agent identity or hard runtime rules changed

This prevents duplicated drift.

## Verification Checklist

After deployment, verify:

- Jarvis stays light and escalates early
- Antigravity preprocesses instead of over-deciding
- Claude chooses the lead skill correctly
- Codex makes durable file changes and writes memory
- no agent loads more context than it needs

## Bottom Line

Deploy the prompts as thin runtime identity blocks.

Keep routing intelligence mostly in external files.

That gives you:

- one shared brain
- four specialized runtimes
- low prompt bloat
- easier long-term maintenance
