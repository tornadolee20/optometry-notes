---
title: 備課研究到品牌文章 Metadata Schema
created: 2026-07-08
type: workflow-schema
status: active
workflow: lesson-prep-research-to-brand-article
related:
  - [[一鍵工作流-備課研究到品牌文章]]
  - [[自主研究任務模板-備課前研究版]]
  - [[備課研究實測-兒童近視控制工作流完整跑一次]]
---

# 備課研究到品牌文章 Metadata Schema

這份 schema 是「備課研究到品牌文章」工作流的下一階段基礎。目的不是增加文書負擔，而是讓每次產出的研究筆記、文章、評審、聲紋版本與安全複審，都能被 Obsidian、AI Skill Factory 與未來自動化 pipeline 穩定辨識。

對應 Hermes Skill：

```text
lesson-prep-research-to-brand-article
```

---

## 1. 使用原則

1. 每個主要輸出筆記都應有 frontmatter。
2. 不確定的欄位填 `null`，不要腦補。
3. 沒有執行的流程填明確狀態，例如 `not-reviewed`、`not-adapted`。
4. 醫療、視光、AI、商業建議相關內容，必須保留風險等級與來源狀態。
5. `publish-ready` 不能只靠文章寫完，必須有評審分數與紅旗檢查。

---

## 2. 共用欄位 common

```yaml
workflow: lesson-prep-research-to-brand-article
workflow_version: 0.1.0
asset_id: YYYY-MM-DD-topic-asset-type
title: ""
topic: ""
slug: ""
asset_type: research-run | moc | evidence-map | literature-card | overclaiming-firewall | teaching-card | professional-article | review-report | brand-voice-article | post-voiceprint-safety-review
status: draft | reviewed | validated | publish-ready | flagship | archived
created: YYYY-MM-DD
updated: YYYY-MM-DD
owner: 目鏡大叔
language: zh-TW
target_audience: []
use_cases: []
domain: []
risk_level: low | medium | high
source_workflow: "[[YYYY-MM-DD-topic-研究工作流]]"
related_assets: []
tags: []
```

---

## 3. 研究欄位 research

```yaml
research_questions_count: null
search_strategy_present: false
framing_method: none | PICO | PECO | PICo
source_count: null
doi_count: null
pmid_count: null
official_link_count: null
evidence_labels_used: []
fact_inference_recommendation_split: false
overclaiming_firewall: "[[topic-過度宣稱防火牆]]"
```

適用於：

- 研究工作流筆記
- 證據地圖
- 文獻卡
- 專業文章草稿
- 評審報告

---

## 4. 文章評審欄位 article_review

```yaml
review_status: not-reviewed | reviewed | validated | publish-ready | flagship
review_score: null
evidence_score: null
clinical_score: null
overclaiming_score: null
teaching_score: null
clarity_score: null
brand_score: null
seo_geo_score: null
review_report: "[[文章評審報告-topic]]"
publish_ready_red_flags: []
```

`publish-ready` 最低條件：

- review_score >= 92
- evidence_score >= 85
- clinical_score >= 85
- overclaiming_score >= 95
- publish_ready_red_flags 為空

---

## 5. 目鏡大叔聲紋欄位 brand_voice

```yaml
voiceprint_status: not-adapted | adapted
voiceprint_source: "[[目鏡大叔文字聲紋卡]]"
voiceprint_review_status: not-reviewed | passed | failed
post_voiceprint_review: "[[聲紋後安全複審-topic]]"
```

原則：

- 專業文章未通過評審前，不應標記為 publish-ready。
- 聲紋轉譯後，不可省略聲紋後安全複審。
- 聲紋可以增加親切度，但不能刪掉 DOI/PMID、風險限制與轉診邊界。

---

## 6. AI Skill Factory 欄位 skill_factory

```yaml
reusable_asset_type: skill | workflow | template | prompt | example | test-case | reference | case-library | none
dependencies: []
reuse_score: null
commercial_value: low | medium | high
maintenance_cost: low | medium | high
```

用途：

- 判斷哪些產出值得沉澱成 skill。
- 判斷哪些只是模板、案例或參考資料。
- 支援未來的商業化包裝與維護排序。

---

## 7. 最小 frontmatter 範本

適合快速建立新筆記時使用：

```yaml
---
title: ""
created: YYYY-MM-DD
type: workflow-asset
status: draft
workflow: lesson-prep-research-to-brand-article
workflow_version: 0.1.0
asset_type: research-run
topic: ""
owner: 目鏡大叔
language: zh-TW
risk_level: medium
source_workflow: null
related_assets: []
tags: []
---
```

---

## 8. 與一鍵工作流的關係

這份 schema 對應：

- [[一鍵工作流-備課研究到品牌文章]]
- [[自主研究任務模板-備課前研究版]]
- [[備課研究實測-兒童近視控制工作流完整跑一次]]

下一階段已接續處理：

```text
固定檔名與資料夾規則 → [[備課研究到品牌文章-檔名與資料夾規則]]
```

再下一階段已接續處理：

```text
建立驗證腳本模板 → [[備課研究到品牌文章-驗證腳本模板]]
```

後續階段已接續處理：

```text
建立可重跑的 pipeline script → [[備課研究到品牌文章-pipeline-script]]
```

---

## 9. Ad-hoc verification 應檢查錨點

每次修改本 schema，至少檢查：

- workflow: lesson-prep-research-to-brand-article
- common 欄位存在
- research 欄位存在
- article_review 欄位存在
- brand_voice 欄位存在
- skill_factory 欄位存在
- publish-ready 條件存在
- 與一鍵工作流互相連結
