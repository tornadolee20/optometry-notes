# SKILL-TIERS.md

Updated: 2026-04-15

## Purpose

This document is the current tier map for the shared brain skill ecosystem.

It records which skills are currently treated as:

- `core`
- `supporting`
- `legacy`

This file is the governance-facing summary.

The detailed reasoning remains in `skill-reviews/`.

## Interpretation Rule

Skill identity is determined by two things together:

1. formal review score
2. governance decision

That means a skill may score highly but still remain `supporting` if usage maturity is not yet high enough.

## Core Skills

These are currently treated as primary reusable modules in the system.

| Skill | Score | Review | Status |
| --- | --- | --- | --- |
| `consumer-behavior-psychology-framework` | `23/24` | [2026-04-15-consumer-behavior-psychology-framework.md](/C:/Users/torna_3j3fz9h/Desktop/optometry-notes/skill-reviews/2026-04-15-consumer-behavior-psychology-framework.md) | `core` |
| `paper-digest-core` | `23/24` | [2026-04-15-paper-digest-core.md](/C:/Users/torna_3j3fz9h/Desktop/optometry-notes/skill-reviews/2026-04-15-paper-digest-core.md) | `core` |
| `uncle-glasses-writing-voice` | `22/24` | [2026-04-15-uncle-glasses-writing-voice.md](/C:/Users/torna_3j3fz9h/Desktop/optometry-notes/skill-reviews/2026-04-15-uncle-glasses-writing-voice.md) | `core` |
| `uncle-glasses-writing-qa` | `23/24` | [2026-04-15-uncle-glasses-writing-qa.md](/C:/Users/torna_3j3fz9h/Desktop/optometry-notes/skill-reviews/2026-04-15-uncle-glasses-writing-qa.md) | `core` |
| `optometry-html-renderer` | `23/24` | [2026-04-15-optometry-html-renderer.md](/C:/Users/torna_3j3fz9h/Desktop/optometry-notes/skill-reviews/2026-04-15-optometry-html-renderer.md) | `core` |
| `uncle-glasses-blog-packager` | `24/24` | [2026-04-15-uncle-glasses-blog-packager.md](/C:/Users/torna_3j3fz9h/Desktop/optometry-notes/skill-reviews/2026-04-15-uncle-glasses-blog-packager.md) | `core` |
| `uncle-glasses-distiller-core` | `23/24` | [2026-04-15-uncle-glasses-distiller-core.md](/C:/Users/torna_3j3fz9h/Desktop/optometry-notes/skill-reviews/2026-04-15-uncle-glasses-distiller-core.md) | `core` |

## Supporting Skills

These are active, useful skills that the system should use, but they are not yet treated as architecture-defining core modules.

| Skill | Notes | Status |
| --- | --- | --- |
| `russell-brunson-perspective` | Funnel framing for optometry context | `supporting` |
| `ali-abdaal-perspective` | Content productivity lens | `supporting` |
| `rory-sutherland-perspective` | Behavioural reframing | `supporting` |
| `mrbeast-perspective` | Content engineering framework | `supporting` |
| `consumer-behavior-psychology-framework` support refs | Friction / framing move references | `supporting` |
| `skills/blogwatcher/` | External blog monitoring utility | `supporting` |
| `skills/notebooklm/` | NotebookLM MCP integration | `supporting` |
| `skills/prompts-library/` | Prompt templates reference | `supporting` |

## Legacy / Source-Material

These assets still contain useful material, but they should no longer be treated as current default entry points.

| Asset | Current Role | Notes |
| --- | --- | --- |
| `.claude/skills/uncle-glasses-distiller/SKILL.md` | `legacy` | mother file / source material only |
| `skills/optometry-writer/SKILL.md` | `legacy` | broad source material; renderer and packager replaced it functionally |
| `skills/paper-digest/SKILL.md` | `legacy` | broad source material; prefer `paper-digest-core` |

## Not Yet Formally Reviewed

These assets are active but have no formal tier decision.

| Asset | Recommended Tier | Blocker |
| --- | --- | --- |
| `threads-account-research` | supporting | 未有實際使用紀錄 |
| `Optometry-Project-Writer` | supporting | 功能與 writing-voice 重疊，需確認邊界 |
| `.agents/workflows/*.md` | — | Workflows 不歸 skill tier，另行管理 |

## Current System View

### Writing Stack

- `uncle-glasses-writing-voice` -> `core`
- `uncle-glasses-writing-qa` -> `core`
- `optometry-html-renderer` -> `core`
- `uncle-glasses-blog-packager` -> `core`

### Distillation Stack

- `uncle-glasses-distiller-core` -> `core`

### Applied Analysis Stack

- `consumer-behavior-psychology-framework` -> `core`

### Research Digestion Stack

- `paper-digest-core` -> `core`

## Governance Rule

Do not promote a skill to `core` merely because it is useful.

Core status should mean:

- high score
- strong boundary
- routing importance
- architectural centrality
- enough maturity to trust repeated use

## Bottom Line

This file is the current skill constitution snapshot.

If the skill system is the brain, this file is the ranked organ map.
