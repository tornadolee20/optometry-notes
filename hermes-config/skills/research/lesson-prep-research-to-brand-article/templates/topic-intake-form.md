# Topic intake form for lesson-prep-research-to-brand-article

Use before running create_asset_pack.py or starting a full research run. Fill unknowns with `null` instead of guessing.

```yaml
workflow: lesson-prep-research-to-brand-article
intake_version: 0.1.0

required:
  topic: ""
  slug: ""
  target_audience:
    - "家長"
    - "學生"
    - "患者"
    - "門市/診所人員"
    - "專業人士"
  primary_use_case:
    - "上課"
    - "專業文章"
    - "社群內容"
    - "門市/診所衛教"
    - "內訓"
    - "AI Skill Factory"
  output_depth: "minimal | brand | complete"
  risk_level: "low | medium | high"

research_scope:
  domain:
    - "optometry"
    - "eyewear-retail"
    - "clinical-education"
    - "AI-workflow"
    - "SEO/GEO"
    - "business-operation"
  geographic_context: "Taiwan | global | mixed | null"
  needs_literature_search: true
  preferred_sources:
    - "PubMed"
    - "Cochrane"
    - "clinical guideline"
    - "professional association"
    - "official documentation"
  must_include_doi_pmid: true
  time_range: "last 5 years preferred, older landmark sources allowed"
  framing_method: "auto | PICO | PECO | PICo | none"

content_outputs:
  research_run_note: true
  moc: false
  evidence_map: false
  overclaiming_firewall: true
  teaching_card: false
  professional_article_2000_zh: true
  article_review_report: true
  brand_voice_article: false
  post_voiceprint_safety_review: false
  seo_geo_assets: false
  social_content_breakdown: false

article_preferences:
  tone: "professional, plainspoken, Traditional Chinese, Taiwan usage"
  reader_level: "educated layperson | professional | student | mixed"
  brand_voice: "none | 目鏡大叔"
  must_avoid:
    - "保證有效"
    - "零風險"
    - "人人適用"
    - "AI/工具取代專業判斷"
  required_caveats:
    - "證據限制"
    - "個體差異"
    - "專業評估"
    - "轉診/醫師評估邊界 when relevant"

commercialization:
  reusable_asset_type: "skill | workflow | template | prompt | example | case-library | none"
  commercial_value: "low | medium | high | unknown"
  maintenance_cost: "low | medium | high | unknown"
  public_publish_candidate: false

execution:
  create_asset_pack_first: true
  run_validation_after_creation: true
  save_to_obsidian: true
  dry_run_first: true
  overwrite_existing_files: false
```

## Quick one-line prompt

```text
請使用 lesson-prep-research-to-brand-article 工作流。主題：「<topic>」；目標讀者：「<target_audience>」；用途：「<primary_use_case>」；深度：「minimal/brand/complete」；風險：「low/medium/high」；需要 DOI/PMID：「是/否」；是否需要目鏡大叔聲紋：「是/否」。先建立資產包骨架，再進行研究與驗證。
```
