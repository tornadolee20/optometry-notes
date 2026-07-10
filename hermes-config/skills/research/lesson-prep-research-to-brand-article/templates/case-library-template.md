# Case library template for lesson-prep-research-to-brand-article

Use after each real or sandbox run to preserve what happened, what worked, what failed, and what can be reused.

```yaml
workflow: lesson-prep-research-to-brand-article
case_library_version: 0.1.0
case_id: "YYYY-MM-DD-slug"
case_status: "sandbox | draft | validated | publish-ready | archived"
created: "YYYY-MM-DD"
topic: ""
slug: ""
mode: "minimal | brand | complete"
risk_level: "low | medium | high"

input_snapshot:
  intake_form: "[[備課研究到品牌文章-主題輸入表]] or embedded YAML"
  target_audience: []
  primary_use_case: []
  required_outputs: []
  research_scope: []

asset_pack:
  research_run: null
  moc: null
  evidence_map: null
  overclaiming_firewall: null
  teaching_card: null
  professional_article: null
  review_report: null
  brand_voice_article: null
  post_voiceprint_safety_review: null

verification:
  verifier: "validate_asset_pack.py | ad-hoc script | manual"
  result: "PASS | FAIL | PARTIAL"
  verified_at: "YYYY-MM-DD"
  evidence_summary: []
  missing_items: []

quality_notes:
  worked_well: []
  failure_points: []
  overclaiming_risks_found: []
  source_quality_notes: []
  review_scores: {}

reuse:
  reusable_paragraphs: []
  reusable_tables: []
  reusable_prompts: []
  reusable_warnings: []
  candidate_skills: []
  candidate_templates: []

commercialization:
  public_publish_candidate: false
  product_pack_candidate: false
  course_material_candidate: false
  consulting_material_candidate: false
  commercial_value: "low | medium | high | unknown"
  maintenance_cost: "low | medium | high | unknown"

next_actions:
  - ""
```

## Minimum case note sections

```markdown
# Case: <topic>

## 1. Input snapshot
## 2. Asset pack links
## 3. Verification result
## 4. What worked
## 5. Failure points / fixes
## 6. Reusable materials
## 7. Commercialization potential
## 8. Next actions
```

## File naming

```text
05-營運SOP與模板/case-library/YYYY-MM-DD-<slug>-案例紀錄.md
```

## Case status rules

- `sandbox`: artificial test, not a real content case.
- `draft`: real case started but not fully verified.
- `validated`: real case passed required verification.
- `publish-ready`: passed article review / safety gates as applicable.
- `archived`: retained for reference, no longer actively maintained.
