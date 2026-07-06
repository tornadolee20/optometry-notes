# Mujing AI Skill Factory Blueprint

This reference condenses a full nine-phase architecture session for a Traditional Chinese user, 「目鏡大叔」, whose domains include optometry, eyewear retail, optometry clinic operations, teaching, social content, SEO/GEO, AI workflow design, prompt engineering, digital products, branding, community education, and consulting.

Use this as an example pattern, not a hard-coded domain constraint.

## User Context

The user wanted a long-term, maintainable, extensible, productizable, team-collaborative AI Skill Factory ecosystem. Requirements included DRY, SOLID, KISS, YAGNI, MECE, modular design, clean architecture, plugin architecture, knowledge graph thinking, reusable components, maintainability, testing, documentation, versioning, commercialization, and multi-platform support.

The user explicitly required a phased sequence and confirmation between stages:

1. Analyze
2. Inventory
3. Classify
4. Establish architecture
5. Establish dependencies
6. Design repository
7. Design metadata
8. Establish workflow
9. Establish skill
10. Optimize last

## Nine-Phase Architecture

### Phase 1 — Capability Inventory

Inventory broad capability areas before proposing skills:

- Professional domain knowledge
- Workflows and SOPs
- Prompts and templates
- Teaching and course design
- Social content
- SEO/GEO
- AI workflows and automation
- Business processes
- Management
- Documents and slides
- Video and infographic workflows
- Legal/compliance
- Research
- Project management
- Customer service
- Brand operations
- Digital products
- Consulting services

For each capability, capture:

```text
Name
Description
Usage frequency
Commercial value
AI suitability
Worth skillizing?
Priority
Related capabilities
```

### Phase 2 — Skill Discovery

Candidate skills should include:

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
```

Avoid duplicates. If functionality overlaps, propose refactor before creating a new skill.

Recommended family groupings:

1. Core Foundation Skills
2. Vision Care Knowledge Skills
3. Optical Retail / Store Operation Skills
4. Content Production Skills
5. SEO / GEO Skills
6. Teaching / Course Skills
7. Business / Productization Skills
8. Governance / Quality Control Skills

Recommended mixed MVP 10:

```text
1. skill-discovery
2. skill-authoring
3. prompt-refactor
4. knowledge-structuring
5. workflow-designer
6. vision-knowledge-brief
7. vision-layperson-explainer
8. social-post-generator
9. brand-voice-adapter
10. compliance-review
```

### Phase 3 — Skill Tree

Recommended top-level tree:

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

MVP 10 placement:

```text
00-core-foundation
├── skill-discovery
├── skill-authoring
├── prompt-refactor
├── knowledge-structuring
└── workflow-designer

01-domain-knowledge / vision-care
├── vision-knowledge-brief
└── vision-layperson-explainer

02-content-production
├── social-post-generator
└── brand-voice-adapter

08-governance-quality
└── compliance-review
```

### Phase 4 — Knowledge / Dependency / Workflow Graphs

Use layered architecture:

```text
Foundation Layer
    ↓
Domain Knowledge Layer
    ↓
Transformation Layer
    ↓
Output Layer
    ↓
Governance Layer
```

Example content workflow:

```text
knowledge-structuring
→ vision-knowledge-brief
→ vision-layperson-explainer
→ social-post-generator
→ brand-voice-adapter
→ compliance-review
→ publishable content
```

Example prompt-to-skill workflow:

```text
prompt-refactor
→ skill-discovery
→ workflow-designer
→ skill-authoring
→ metadata-generator
```

Relationship types for a knowledge graph:

```text
depends_on
produces
consumes
transforms
reviews
adapts
summarizes
explains
generates
validates
packages
publishes
deprecated_by
```

### Phase 5 — Roadmap

Use scoring dimensions:

```text
ROI
Usage frequency
Commercial value
Dependency value
Maintenance cost
```

Recommended first 30 priority skills:

```text
1. knowledge-structuring
2. prompt-refactor
3. skill-discovery
4. workflow-designer
5. skill-authoring
6. vision-knowledge-brief
7. vision-layperson-explainer
8. social-post-generator
9. brand-voice-adapter
10. compliance-review
11. content-brief-generator
12. quality-review
13. metadata-generator
14. vision-faq-generator
15. seo-geo-content-brief
16. faq-structure-generator
17. ai-readable-knowledge-base
18. customer-needs-analysis
19. customer-question-response
20. optical-sales-script
21. store-sop-generator
22. content-repurposing
23. video-script-generator
24. pillar-content-planner
25. lesson-plan-generator
26. slide-deck-outline-generator
27. digital-product-designer
28. consulting-package-designer
29. skill-refactor-review
30. github-repo-readme
```

Recommended 90-day plan:

- Days 0–30: MVP 10, two workflows, five real test cases.
- Days 31–60: content/SEO/GEO/quality/metadata expansion.
- Days 61–90: retail operations, teaching, productization, repo governance.

### Phase 6 — Repository Design

Recommended repo:

```text
ai-skill-factory/
├── README.md
├── LICENSE
├── CHANGELOG.md
├── ROADMAP.md
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

Single skill structure:

```text
skills/<category>/<skill-name>/
├── SKILL.md
├── metadata.yaml
├── README.md
├── examples/
├── tests/
└── references/
```

Workflow structure:

```text
workflows/<workflow-name>/
├── workflow.md
├── workflow.yaml
├── examples/
└── tests/
```

Prompt lifecycle:

```text
raw → refactored → skill-linked → platform-specific → archived
```

### Phase 7 — Governance

Minimum governance docs:

```text
docs/governance.md
docs/naming-convention.md
docs/metadata-spec.md
docs/versioning-policy.md
docs/testing-strategy.md
docs/review-process.md
docs/release-process.md
docs/deprecation-policy.md
docs/migration-policy.md
docs/refactor-policy.md
```

Naming rule:

```text
<domain>-<function>-<output/action>
```

Avoid:

```text
ai-helper
content-master
facebook-vision-post-generator
mujing-uncle-writer
final-v2-new
```

Status ladder:

```text
draft → experimental → validated → stable → deprecated → archived
```

Review types:

```text
Structure Review
Dependency Review
Quality Review
Risk Review
```

Release checklist:

```text
[ ] SKILL.md complete
[ ] metadata.yaml complete
[ ] README.md complete
[ ] at least 3 examples
[ ] at least 3 test cases
[ ] dependencies confirmed
[ ] related_skills filled
[ ] risk_level marked
[ ] version updated
[ ] CHANGELOG updated
[ ] reviews passed
```

### Testing Commands and Minimal Tooling

Minimal tools:

```text
tools/check_repo_structure.py
tools/lint_skill_names.py
tools/validate_skill_metadata.py
tools/validate_workflows.py
tools/run_all_checks.py
```

Minimal commands:

```bash
python -m pip install -r requirements-dev.txt
python tools/check_repo_structure.py
python tools/lint_skill_names.py
python tools/validate_skill_metadata.py
python tools/validate_workflows.py
pytest tests -q
python tools/run_all_checks.py
```

A minimal compliance test can use YAML cases such as:

```yaml
cases:
  - id: compliance-normal-001
    input:
      content: "兒童近視控制需要定期追蹤，並由專業人員評估合適方式。"
    expected:
      risk_detected: false

  - id: compliance-risk-001
    input:
      content: "這款控制鏡片保證讓近視不再加深。"
    expected:
      risk_detected: true
      risk_type:
        - exaggerated_product_claim
        - unsupported_medical_claim
      required_action: rewrite
```

### Phase 8 — Commercialization

Recommended commercialization sequence:

```text
Self-use efficiency
↓
Internal/team tool
↓
Public brand asset
↓
Digital product
↓
Course/workshop
↓
Consulting
↓
Subscription/knowledge base
↓
SaaS/API/Agent platform
```

Recommended first product for the optometry/eyewear case:

```text
視光社群內容 AI Workflow Pack
```

Possible contents:

```text
1. 視光內容選題模板
2. 專業知識整理 Prompt
3. 白話轉譯 Prompt
4. FB 長文 Prompt
5. Threads 短文 Prompt
6. FAQ 生成 Prompt
7. 合規審查 Checklist
8. 品牌語氣調整模板
9. 5 個示範案例
10. 使用教學 PDF
```

Use open-core strategy:

- Public: repo structure, templates, governance docs, simple examples, testing tools.
- Paid: complete domain packs, SOP packs, case libraries, advanced workflows, courses, consulting.

### Phase 9 — Long-Term Evolution

3-year goal: usable system, 30–50 validated skills, several workflows, first products/workshops/consulting cases.

5-year goal: vertical market products, AI Skill Factory method, subscriptions, enterprise training, lightweight SaaS prototypes.

10-year goal: personal/company AI operating system or vertical AI agent platform.

Preserve:

```text
Domain knowledge
Customer question library
Case library
Compliance taxonomy
Workflow graph
Brand voice
Teaching method
Governance
```

Expect to replace:

```text
Platform-specific prompts
Social platform format tricks
Short-term SEO hacks
Tool-specific UI/API details
```

## Practical Pattern for Future Sessions

When a user says “下一步” after a phased Skill Factory discussion, continue to the next numbered phase and keep the same structure:

```text
Executive Summary
Detailed analysis
Problems
Recommendations
Risks
Next step
```

When the user asks for testing examples, move from architecture to concrete commands and files. Include `requirements-dev.txt`, `tools/`, `tests/`, sample YAML cases, expected pass/fail output, and a one-command runner.
