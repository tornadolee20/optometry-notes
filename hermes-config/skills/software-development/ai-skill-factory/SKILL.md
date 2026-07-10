---
name: ai-skill-factory
description: "Use when designing, auditing, building, or commercializing a reusable AI Skill/Prompt/Workflow ecosystem. Enforces phased architecture: ability inventory → skill discovery → skill tree → dependency/workflow graph → roadmap → repository → governance → commercialization → long-term evolution."
version: 1.0.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [skills, prompt-engineering, workflow-design, governance, repository-design, commercialization]
    related_skills: [hermes-agent-skill-authoring, plan, test-driven-development]
---

# AI Skill Factory

## Overview

Use this skill when the user wants to turn scattered prompts, SOPs, expert knowledge, templates, workflows, or AI experiments into a maintainable **AI Skill Factory**: a modular, testable, versioned, reusable, commercializable capability system.

The core principle is:

> Do not build a flat prompt library. Build a composable system of Skills, Workflows, Templates, Examples, Tests, Governance, and Productization paths.

Prefer class-level architecture over one-session-one-skill sprawl. A good Skill Factory keeps stable knowledge and workflow logic in the core, while platform-specific prompts and adapters stay replaceable at the edge.

## When to Use

Use this skill when the user asks to:

- Inventory their capabilities and decide what should become reusable AI skills.
- Refactor a prompt library into maintainable skills/workflows.
- Design a skill tree, dependency graph, workflow graph, or knowledge graph.
- Create a repository structure for skills, prompts, templates, examples, tests, configs, agents, plugins, or products.
- Define governance: naming, metadata, versioning, testing, review, release, deprecation, migration, and refactor policies.
- Plan commercialization: self-use, team use, GitHub open-core, Gumroad/template packs, courses, consulting, subscriptions, SaaS/API, marketplaces.
- Build a long-term roadmap for an AI capability ecosystem.

Do **not** use this skill for a single simple prompt unless the user explicitly wants to preserve it as part of a reusable system.

## Required Working Sequence

Follow this sequence. Do not jump directly to repository creation or implementation unless the user explicitly asks to skip planning.

1. **Analyze** the user's strategic goal, audience, domain, and constraints.
2. **Inventory capabilities**: domain knowledge, workflows, SOPs, prompts, templates, teaching, content, automation, business processes, governance needs.
3. **Classify capabilities** into domains and skill families.
4. **Discover candidate skills**: for each, define function, inputs, outputs, usage timing, dependencies, reuse level, split/merge decision.
5. **Build the Skill Tree**: categories should be MECE enough for long-term expansion.
6. **Build Dependency / Workflow / Knowledge Graphs**: identify upstream reusable skills, review gates, and shared schemas.
7. **Create the Roadmap**: top skill map, top priority skills, MVP build order, and 30/60/90-day plan.
8. **Design the Repository**: folders, metadata, templates, examples, tests, configs, workflows, docs.
9. **Define Governance**: naming, metadata, versioning, testing, review, release, deprecation, migration, refactor policies.
10. **Plan Commercialization**: internal use, products, courses, consulting, subscriptions, SaaS/API timing.
11. **Plan Long-Term Evolution**: 3/5/10-year roadmap, what will age, what to preserve, what to retire.

If the user asks for “下一步 / continue”, proceed to the next phase in this order and clearly label the phase.

## Architecture Pattern

Use a layered architecture:

```text
Stable Core
├── Domain Knowledge
├── Workflow Logic
├── Governance
├── Case Library
├── Brand Voice
└── Business Model

Replaceable Adapter Layer
├── Prompt Format
├── Platform Adapter
├── Agent Runtime
├── API Integration
├── Social Platform Format
└── Model-specific Instructions
```

### Stable Core

Invest in:

- Domain knowledge bases.
- Customer/user question libraries.
- Compliance and risk taxonomies.
- Workflow graphs.
- Skill metadata.
- Example/case libraries.
- Brand voice profiles.
- Teaching frameworks.
- Business playbooks.

### Replaceable Edge

Avoid hard-coding:

- ChatGPT/Claude/Gemini/Cursor-specific prompt formats.
- Social platform tricks.
- Short-lived SEO/GEO hacks.
- Tool-specific UI steps.
- API formats that may change.

Put these in `prompts/platform-specific/`, `configs/platforms/`, `plugins/`, or adapters.

## Skill Factory Repository Shape

A mature repo should look like:

```text
ai-skill-factory/
├── README.md
├── ROADMAP.md
├── CHANGELOG.md
├── docs/
├── skills/
├── workflows/
├── prompts/
├── templates/
├── examples/
├── tests/
├── configs/
├── agents/
├── plugins/
├── tools/
├── assets/
└── products/
```

Use these meanings:

- `skills/` — reusable capability modules.
- `workflows/` — compositions of multiple skills.
- `prompts/` — raw/refactored/platform-specific execution material, not the core product.
- `templates/` — copyable starter formats.
- `examples/` — real or semi-real input/output cases for validation, teaching, and product demos.
- `tests/` — schema, skill, workflow, compliance, and quality tests.
- `configs/` — brand, risk, audience, platform, and taxonomy settings.
- `agents/` — future agent definitions that compose skills.
- `plugins/` — external integrations; do not overbuild early.
- `products/` — packaged commercial offers derived from skills/workflows.

## Recommended Top-Level Skill Categories

For large ecosystems, start with:

```text
00-core-foundation
01-domain-knowledge
02-content-production
03-seo-geo
04-business-operation
05-teaching-education
06-productization
07-automation-agent
08-governance-quality
09-distribution-commercial
```

Only add a new top-level category when a subdomain has enough validated skills to justify promotion.

## Candidate Skill Evaluation

For each candidate skill, capture:

```text
Skill name
Function
Inputs
Outputs
Usage timing
Dependencies
Reuse level
Should split?
Should merge?
Priority
Risk level
Commercial value
Maintenance cost
```

A capability is worth skillizing when it is repeatable, has clear I/O, is reusable across contexts, can be tested, and supports workflows. If it is a fixed layout, make it a template. If it is a multi-step composition, make it a workflow. If it is just an execution phrasing, keep it as a prompt.

## Dependency Rules

Use composition over inheritance.

Prefer:

```text
vision-content-workflow =
  knowledge-structuring
  + vision-knowledge-brief
  + layperson-explainer
  + social-post-generator
  + brand-voice-adapter
  + compliance-review
```

Avoid all-in-one “master” skills that duplicate logic.

Core reusable skills should include, when relevant:

- `knowledge-structuring`
- `prompt-refactor`
- `skill-discovery`
- `workflow-designer`
- `skill-authoring`
- `metadata-generator`
- `brand-voice-adapter`
- `compliance-review`
- `quality-review`

## Governance Minimums

Every skill should eventually have:

```text
SKILL.md          # AI-readable procedure
metadata.yaml     # machine-readable registry data
README.md         # human-readable use notes
examples/         # input/output examples
tests/            # test cases
references/       # domain notes, risk taxonomies, session-specific details
```

In draft stage, allow lighter requirements, but do not let draft become permanent.

### Metadata Minimum

```yaml
name:
category:
family:
version:
status:
owner:
description:
tags:
inputs:
outputs:
dependencies:
related_skills:
risk_level:
commercial_value:
reuse_score:
maintenance_cost:
created_at:
last_reviewed:
```

### Status Ladder

```text
draft → experimental → validated → stable → deprecated → archived
```

### Versioning

Use semantic versioning:

- PATCH: typo, example tweak, non-behavioral clarification.
- MINOR: additive compatible change.
- MAJOR: required inputs, output formats, or core process changes.

## Testing Strategy

A minimal Skill Factory test system should check:

1. Repo structure exists.
2. Skill names are valid.
3. Metadata is complete and folder names match metadata names.
4. Workflow steps reference existing skills.
5. Workflow steps have input/output.
6. Compliance risk cases are caught.
7. Full test suite can run via one command.

Useful commands for a Python-based repo:

```bash
python -m pip install -r requirements-dev.txt
python tools/check_repo_structure.py
python tools/lint_skill_names.py
python tools/validate_skill_metadata.py
python tools/validate_workflows.py
pytest tests -q
python tools/run_all_checks.py
```

For early-stage Skill Factory governance, use `scripts/skill_factory_audit.py` as a lightweight stdlib-only audit probe. It scores SKILL.md files for frontmatter, metadata, workflow structure, pitfalls, verification, and support files. See `references/skill-factory-audit-bootstrap.md` for the session pattern: registry note → dependency/split plan → reusable audit script → OS-temp `hermes-verify-*.py` ad-hoc verification.

Use strict TDD when implementing the tooling: write the failing test or validation case first, verify it fails, then add minimal code to pass.

## Commercialization Pattern

Do not start with SaaS. Use this sequence:

```text
Self-use efficiency
↓
Internal/team workflows
↓
Public brand assets and case studies
↓
Prompt / Template / Workflow Packs
↓
Workshops and courses
↓
Consulting services
↓
Subscriptions / knowledge bases
↓
SaaS / API / Agent platform
```

SaaS/API should wait until there are validated high-frequency workflows, repeat buyers, stable input/output formats, and review gates for risk.

## Common Pitfalls

1. **Flat prompt graveyard.** Do not store everything in `prompts/` with names like `final-v2-new`. Promote reusable procedures to skills and compositions to workflows.
2. **Over-splitting.** Do not create a skill for every small formatting variation. Use templates or adapters.
3. **All-in-one master skills.** Split knowledge, transformation, brand, compliance, and quality review into composable modules.
4. **Platform lock-in.** Keep platform prompts and UI quirks in adapter/config layers.
5. **Late governance.** Add naming, metadata, examples, and basic tests before the library grows.
6. **Skipping real examples.** A skill without examples is not validated.
7. **Commercializing abstractions too early.** Sell concrete workflow outcomes before selling the whole framework.

## Verification Checklist

Before presenting a Skill Factory plan as complete:

- [ ] Capabilities were inventoried before skills were proposed.
- [ ] Candidate skills have clear I/O and dependencies.
- [ ] The Skill Tree separates core, domain, content, operations, governance, and commercialization concerns.
- [ ] Dependency graph identifies reusable upstream skills and review gates.
- [ ] MVP skills are ordered by dependency, not by excitement.
- [ ] Repository structure distinguishes skills, workflows, prompts, templates, examples, tests, configs, and products.
- [ ] Governance includes naming, metadata, versioning, testing, review, release, deprecation, migration, and refactor policy.
- [ ] Testing includes structure, metadata, workflow, and risk/compliance cases.
- [ ] Commercialization starts with concrete packs/workshops/consulting before SaaS.
- [ ] Long-term roadmap separates stable core assets from replaceable platform adapters.

## Reference

See `references/mujing-ai-skill-factory-blueprint.md` for a condensed blueprint from a full nine-phase architecture session covering a Traditional Chinese optometry/eyewear/AI-workflow use case.

See `references/autonomous-research-lesson-prep-template.md` for the user's reusable lesson-prep research workflow: autonomous research → literature/source search → evidence grading → teaching translation → slide/handout/social reuse → Skill Factory packaging.

See `references/autonomous-research-lesson-prep-workflow-run.md` for a completed validation run of that workflow on a children's myopia-control teaching topic, including DOI/PMID source handling, PICO/PECO/PICo decomposition, overclaiming firewall examples, Obsidian storage outputs, Skill Factory candidate extraction, and ad-hoc verification anchors.

See `references/autonomous-research-lesson-prep-professional-article.md` for the durable add-on requirement learned from the user: after research, generate a rigorous ~2000-character Traditional Chinese professional article with source notes and overclaiming guardrails, and archive research into second-brain Obsidian assets when requested.

See `references/professional-article-review-panel.md` for the professional article quality gate: seven-reviewer scoring, red-flag hard gates, validated/publish-ready/flagship thresholds, Obsidian review metadata write-back, and the rule that brand voice / 目鏡大叔文字聲紋 adaptation happens after professional review and must be followed by a safety review so style does not weaken evidence or risk caveats.