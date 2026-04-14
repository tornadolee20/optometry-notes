# DEPLOYMENT-CHECKLIST.md

Updated: 2026-04-15

## Purpose

This checklist is the final verification layer before treating the shared-brain runtime as deployed.

Use it to confirm:

- the prompts are installed
- the right files are loaded by the right agents
- routing behaves correctly
- handoffs stay clean
- memory boundaries are respected

## How To Use

Go top to bottom.

Mark each item complete only after a real check, not an assumption.

If a check fails, fix the architecture or prompt before proceeding.

## 1. Prompt Installation

- [ ] `prompt-jarvis.md` is installed into the Jarvis runtime
- [ ] `prompt-antigravity.md` is installed into the Antigravity runtime
- [ ] `prompt-claude.md` is installed into the Claude runtime
- [ ] `prompt-codex.md` is installed into the Codex runtime
- [ ] each runtime is using its own prompt, not a copied generic shared prompt

## 2. Startup Context Loading

### Jarvis

- [ ] Jarvis loads `ROUTER-SHORT-RULES.md`
- [ ] Jarvis loads `HANDOFF-PROTOCOL.md`
- [ ] Jarvis does not load the full architecture stack by default

### Antigravity

- [ ] Antigravity loads `ROUTER-SHORT-RULES.md`
- [ ] Antigravity loads `HANDOFF-PROTOCOL.md`
- [ ] Antigravity loads `TASK-TO-CORE-CHAIN.md`
- [ ] Antigravity does not load the full constitution by default

### Claude

- [ ] Claude loads `SKILLS-MAP.md`
- [ ] Claude loads `CORE-SKILL-ORCHESTRATION.md`
- [ ] Claude loads `TASK-TO-CORE-CHAIN.md`
- [ ] Claude loads `CORE-SKILL-TRIGGERS.md`

### Codex

- [ ] Codex loads `SKILL-TIERS.md`
- [ ] Codex loads `SKILLS-MAP.md`
- [ ] Codex loads `CORE-SKILL-ORCHESTRATION.md`
- [ ] Codex loads `TASK-TO-CORE-CHAIN.md`
- [ ] Codex loads `CORE-SKILL-TRIGGERS.md`
- [ ] Codex loads `BRAIN-ARCHITECTURE.md`
- [ ] Codex loads `HANDOFF-PROTOCOL.md`

## 3. Routing Sanity Checks

- [ ] a paper-summary request routes first to `paper-digest-core`
- [ ] a reusable-framework request routes first to `uncle-glasses-distiller-core`
- [ ] a hesitation / trust-friction request routes first to `consumer-behavior-psychology-framework`
- [ ] a rewrite-in-my-voice request routes first to `uncle-glasses-writing-voice`
- [ ] a does-this-sound-like-me request routes first to `uncle-glasses-writing-qa`
- [ ] a stable-article-to-HTML request routes first to `optometry-html-renderer`
- [ ] a final-publish-package request routes first to `uncle-glasses-blog-packager`

## 4. Anti-Misfire Checks

- [ ] the system does not jump to writing before evidence is digested
- [ ] the system does not jump to packaging before article structure is stable
- [ ] the system does not trigger distillation for ordinary one-off summaries
- [ ] the system does not rewrite for voice when the user first wants diagnosis
- [ ] mixed requests are resolved by earliest unresolved bottleneck, not by the loudest downstream phrase

## 5. Handoff Checks

- [ ] Jarvis can hand off cleanly to Antigravity
- [ ] Jarvis can hand off cleanly to Claude / Codex when needed
- [ ] Antigravity can produce a clean preprocessing packet for Claude / Codex
- [ ] Claude can hand off structured outputs downstream when needed
- [ ] Codex can implement durable system changes after handoff
- [ ] each non-trivial handoff includes task, current state, next owner, expected output, blockers, and links / paths

## 6. Memory Boundary Checks

- [ ] Jarvis does not finalize `MEMORY.md`
- [ ] Antigravity does not finalize `MEMORY.md`
- [ ] Claude only updates long-term memory when the material deserves promotion
- [ ] Codex writes durable outcomes to `memory/YYYY-MM-DD.md` after structural system changes
- [ ] core architecture decisions are recorded in stable docs rather than left in chat only

## 7. Core Chain Checks

### Research chain

- [ ] `paper-digest-core -> uncle-glasses-writing-voice -> uncle-glasses-writing-qa -> optometry-html-renderer -> uncle-glasses-blog-packager` works as the default evidence-to-article chain

### Hesitation chain

- [ ] `consumer-behavior-psychology-framework -> uncle-glasses-writing-voice -> uncle-glasses-writing-qa -> optometry-html-renderer -> uncle-glasses-blog-packager` works as the default diagnosis-to-article chain

### Distillation chain

- [ ] `uncle-glasses-distiller-core` correctly acts as the lead for reusable skill or framework creation

### Draft chain

- [ ] `uncle-glasses-writing-qa -> uncle-glasses-writing-voice -> optometry-html-renderer -> uncle-glasses-blog-packager` works for existing draft improvement and publishing

## 8. Lightweight Agent Checks

- [ ] Jarvis stays lightweight and escalates early
- [ ] Antigravity preprocesses instead of over-deciding
- [ ] neither lightweight agent tries to become the final architecture authority

## 9. Deep Agent Checks

- [ ] Claude resolves ambiguous task framing correctly
- [ ] Claude selects a single lead skill for each stage
- [ ] Codex updates docs, prompts, and memory consistently after system changes
- [ ] Codex does not leave major architecture edits undocumented

## 10. Deployment Bundle Checks

- [ ] `shared-brain-runtime/README.md` exists as the deployment entrypoint
- [ ] `PROMPT-INSTALL-GUIDE.md` reflects the currently installed prompt pack
- [ ] the repo still has one source of truth for routing docs
- [ ] no duplicate prompt trees have been created that could drift

## 11. Final Acceptance

Treat deployment as complete only when all of these are true:

- [ ] users can speak naturally without naming skills
- [ ] the system routes to the earliest unresolved bottleneck
- [ ] each agent stays inside its boundary
- [ ] handoffs are explicit
- [ ] important knowledge is written to files
- [ ] the shared brain feels like one coordinated mind rather than four disconnected tools

## Bottom Line

If this checklist passes, the shared-brain runtime is not just designed.

It is operationally deployable.
