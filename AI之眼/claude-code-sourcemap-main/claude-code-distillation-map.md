# claude-code-distillation-map.md

## Positioning

This repository is useful as a research sample, not as a sacred source of truth.

It appears to be reconstructed from a public npm package and source maps. That means:

- it contains real design signals
- it does not equal the original internal repository
- it should be distilled for patterns, not copied wholesale

## Best Use

Use this repository to improve our system architecture, skill design, task routing, and memory governance.

Do not use it as a giant monolithic skill.

## What To Distill

### A. Architecture Knowledge

Worth turning into notes:

- CLI startup flow
- core module boundaries
- skill loading logic
- tool / command / plugin separation
- permission and sandbox thinking
- MCP integration patterns
- agent coordination hints

### B. System Design Heuristics

Worth turning into reusable frameworks:

- how a host system decides what counts as a skill
- what metadata matters for invocation
- how execution boundaries are expressed
- how memory and tooling should stay separated

### C. Small Practical Skills

Worth turning into skills:

- `claude-code-architecture-reader`
- `claude-skill-design-auditor`
- `claude-tool-selection-advisor`
- `claude-permission-workflow`

## What Not To Distill

Keep as index only:

- `node_modules/`
- vendor binaries
- low-level build artifacts
- feature-flag trivia
- version-specific implementation details
- giant raw source dumps with little cross-version value

## Highest-Value Files

### Tier 1: Read First

1. `restored-src/src/main.tsx`
2. `restored-src/src/skills/loadSkillsDir.ts`
3. `restored-src/src/skills/bundled/index.ts`

### Tier 2: Read Next

4. `restored-src/src/tools/`
5. `restored-src/src/commands/`
6. `restored-src/src/services/mcp/`
7. `restored-src/src/utils/permissions/`
8. `restored-src/src/plugins/`
9. `restored-src/src/coordinator/`
10. `restored-src/src/assistant/`

### Tier 3: Contextual

11. `package/cli.js.map`
12. `extract-sources.js`

## Knowledge Notes To Create

Recommended output notes:

1. `Claude Code 架構總覽`
2. `Claude Code Skills 系統筆記`
3. `Claude Code Tool-Command-Plugin 分層`
4. `Claude Code 權限與 Sandbox 模型`
5. `Claude Code Agent / Coordinator 心智圖`

## Distillation Questions

When reading each file or module, answer:

1. What problem is this module solving?
2. What layer does it belong to?
3. What stable pattern can be reused in our system?
4. What is implementation noise that should be ignored?
5. Does this belong in a note, a workflow, or a skill?

## Recommended Distillation Workflow

### Phase 1: Mapping

- ignore `node_modules`
- ignore vendor binaries
- map only `restored-src/src/`
- list major modules and responsibilities

### Phase 2: Stable Knowledge Extraction

For each major module, extract:

- responsibility
- inputs
- outputs
- relationships
- reusable insight for our system

### Phase 3: Memory Decision

Classify each extracted insight as:

- note
- workflow
- skill
- index only

### Phase 4: Small Skill Creation

Only create a skill when the insight becomes a repeatable operating pattern.

## Direct Relevance To Our System

This repository is most helpful for improving:

- our shared-brain architecture
- skill metadata discipline
- distinction between knowledge and workflow
- permission-aware agent behavior
- multi-agent task decomposition

## Bottom Line

This material is not magic.

It is valuable because it contains architecture footprints.

The win is not "becoming Claude Code."

The win is using its visible logic to make our own system cleaner, smaller, safer, and more composable.
