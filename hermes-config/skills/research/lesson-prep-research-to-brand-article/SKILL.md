---
name: lesson-prep-research-to-brand-article
description: "Use when 目鏡大叔 asks for lesson-prep, professional article, optometry/eyewear/AI workflow research, or AI Skill Factory content that must go from topic → evidence search → teaching assets → rigorous Traditional Chinese article → review → brand voice → Obsidian archival."
version: 0.1.0
author: Hermes Agent
license: MIT
metadata:
  hermes:
    tags: [research, lesson-prep, optometry, professional-article, obsidian, ai-skill-factory, brand-voice, traditional-chinese]
    related_skills: [ai-skill-factory, obsidian, professional-article-pipeline]
---

# Lesson-Prep Research to Brand Article

## Overview

Use this skill to execute 目鏡大叔的「自主研究 → 備課 → 專業文章 → 品牌聲紋 → Obsidian 歸檔」工作流。目標不是只回答一個研究問題，而是把一個主題轉成可教學、可引用、可審查、可再利用、可產品化的第二大腦資產。

Default output language is **Traditional Chinese** unless the user asks otherwise. For health, optometry, eyewear, AI, SEO/GEO, teaching, or business topics, preserve a conservative distinction between evidence, inference, recommendation, and unverified claims.

## When to Use

Use when the user asks for any of these:

- 「幫我研究這個主題，之後要拿來上課 / 寫文章 / 做內容」
- 「做一篇嚴謹專業文章」 or 「研究完附 2000 字文章」
- 「變成目鏡大叔風格 / 聲紋」
- 「整理到 Obsidian / 第二大腦 / AI Skill Factory」
- Optometry, eyewear retail, clinical education, AI workflow, SEO/GEO, course prep, community education, or productized knowledge workflows.

Do **not** use for a quick casual answer unless the user explicitly wants archival, evidence review, or reusable workflow output.

## Execution Contract

A complete run must produce a durable artifact, not only chat prose. Unless the user explicitly opts out, save the main output into the active Obsidian vault and verify it.

Minimum complete deliverables:

1. Research report / workflow run note.
2. Source table with DOI / PMID / official links where available.
3. Evidence grading and interpretation cautions.
4. Fact / inference / recommendation / unverified separation.
5. Overclaiming firewall.
6. Rigorous ~2000 Chinese-character Traditional Chinese professional article draft.
7. Professional review gate before publish-ready claims.
8. Optional 目鏡大叔 brand-voice version only after review.
9. Post-voiceprint safety review if brand voice adaptation is performed.
10. Obsidian links between all output notes.

## Standard Workflow

### 1. Define scope and audience

Capture:

- Topic.
- Target reader / learner.
- Use case: class, article, social content, clinic/store consultation, internal SOP, productized skill.
- Domain risk: health/clinical, business, AI/tooling, education, SEO/GEO.
- Required outputs and storage location.

Completion criterion: the research topic can be expressed as one sentence plus an output checklist.

### 2. Design research questions

Write 3–5 questions covering:

1. Current consensus.
2. Knowledge gaps for the target audience.
3. Highest-quality available evidence.
4. Debated, unverified, or easily exaggerated claims.
5. How the topic becomes teachable, applicable, and productizable.

Completion criterion: every later source search maps back to at least one research question.

### 3. Build search strategy

Include:

- Chinese keywords.
- English keywords.
- Synonyms / related terms.
- Exclusion terms.
- Search platforms/databases.
- Time range.
- Inclusion criteria.
- Exclusion criteria.

For biomedical/optometry topics, prefer PubMed, Cochrane, guidelines, consensus statements, RCTs, systematic reviews, and professional association statements before commercial product pages.

Completion criterion: a reader could reproduce the search direction without asking what terms were used.

### 4. Choose PICO / PECO / PICo when appropriate

Use:

- PICO for clinical/intervention questions.
- PECO for exposure/risk-factor questions.
- PICo for qualitative, education, experience, or implementation questions.

Completion criterion: population, intervention/exposure/interest, comparator/context, and outcome are explicit enough to constrain evidence selection.

### 5. Search and capture sources

For each important source, record:

| Source / Literature | Author / Organization and Year | Study / Source Type | DOI / PMID / Link | One-sentence conclusion | Lesson-prep use | Evidence strength | Interpretation caution |
|---|---|---|---|---|---|---|---|

Evidence labels:

- High: systematic review, meta-analysis, high-quality guideline, or multiple consistent RCTs.
- Medium: single RCT, good cohort, professional consensus, or stable industry data.
- Low: case report, expert opinion, small study, or early unreplicated finding.
- Trend judgment: insufficient direct evidence but multiple signals point in the same direction.

When Antigravity CLI / `ccagy` is available, it can be used as a supplementary broad-search lane for anti-bot-resistant web discovery and research-angle generation. Treat its output as **source leads**, not final citations: every health claim still needs DOI/PMID/official-link verification before article drafting or publish-readiness. A useful second-pass prompt asks explicitly for 2024–2026 PubMed, IMI, Cochrane, AAO/AOA, clinical guidelines, RCTs, systematic reviews/meta-analyses, evidence grading, fact/inference/recommendation separation, and overclaiming firewall.

Completion criterion: health/technical claims have a source row; missing DOI/PMID is labelled rather than hidden.

### 6. Build evidence interpretation

Separate:

- Facts supported by sources.
- Inferences drawn from those facts.
- Recommendations for teaching/business/content.
- Unverified or debated points.
- Local-context limitations, especially Taiwan applicability when evidence is foreign.

Completion criterion: no recommendation is presented as if it were a directly proven fact.

### 7. Add overclaiming firewall

Use this table:

| Overclaim-prone statement | Why it is unsafe | More precise statement | Teaching-safe wording |
|---|---|---|---|

Check especially:

- Correlation framed as causation.
- Preliminary evidence framed as settled fact.
- Product effects generalized to everyone.
- Sample size, population, follow-up, or conflicts of interest ignored.
- AI/tooling framed as replacing professionals.
- Low risk framed as zero risk.
- Health intervention framed as guaranteed.

Completion criterion: every likely marketing/teaching exaggeration has a safer phrasing.

### 8. Translate into teaching and content assets

Produce, as relevant:

- One-page summary.
- Topic architecture / concept map.
- Student-friendly explanation.
- Parent/consumer-friendly explanation.
- Store/clinic consultation phrasing.
- Course outline.
- Slide outline with source/citation column.
- Discussion questions.
- Assignments or practice cases.
- Blog/social/short-video angles.
- Skill Factory candidate assets: skill, workflow, template, prompt, example, test case, reference, case library.

Completion criterion: the output can be reused in at least three contexts: teaching, article/content, and second-brain storage.

### 9. Write the professional article

After the research report, write a rigorous Traditional Chinese professional article of about 2000 Chinese characters.

Required article structure:

- Frontmatter with title, source workflow, status, review fields when available.
- Professional title.
- Introductory framing for the reader.
- Structured body paragraphs grounded in the evidence.
- Conservative conclusion separating evidence from recommendation.
- Source notes with DOI/PMID/source links when available.
- Explicit overclaiming guardrails.

Completion criterion: the article is understandable to educated lay readers while preserving source caveats and professional boundaries.

### 10. Run professional article review panel

Before declaring an article publish-ready, score seven lenses:

1. Evidence review.
2. Clinical / optometry practicality review.
3. Overclaiming and risk review.
4. Teaching value review.
5. Reader clarity review.
6. Brand trust review.
7. SEO/GEO asset review.

Weights:

```text
Evidence quality                20%
Clinical / optometry practical  20%
Overclaiming safety             20%
Teaching value                  10%
Reader clarity                  10%
Brand trust                     10%
SEO/GEO asset value             10%
```

Status thresholds:

```text
draft         < 75
reviewed      75–84
validated     85–91, with overclaiming >= 90 and evidence >= 80
publish-ready >= 92, with overclaiming >= 95, evidence >= 85, clinical >= 85
flagship      >= 95, with all key items >= 90
```

Hard red flags block publish-ready: missing source for health claims, product guarantee language, zero-risk language, all-person applicability, AI replacing professional judgment, no fact/inference split, or tone that reads like a cheap advertisement.

Completion criterion: review score/status is written back into the article metadata or a linked review report.

### 11. Optional brand voice adaptation

Only adapt to 目鏡大叔聲紋 after the professional article passes the review gate.

Preserve:

- DOI/PMID/source notes.
- Non-guarantee language.
- Risk caveats.
- Professional referral boundaries.
- Fact / inference / recommendation separation.

Then run post-voiceprint safety review.

Completion criterion: brand style improves trust and readability without weakening evidence or safety caveats.

### 12. Archive to Obsidian

Recommended structure:

```text
05-營運SOP與模板/        # workflow runs, SOPs, reusable templates
01-專家與MOC/            # topic index / MOC
04-知識卡片/             # evidence, concept, teaching, risk cards
10-歷史文章智庫/         # professional and brand article drafts
```

Use wikilinks between:

- Workflow run note.
- MOC/topic index.
- Evidence map.
- Literature cards.
- Professional article.
- Review report.
- Brand voice article.
- Post-voiceprint safety review.

Completion criterion: a future search from any one note can discover the rest of the asset cluster.

## File Naming Pattern

Use date-prefixed names for dated outputs:

```text
YYYY-MM-DD-<topic>-研究工作流.md
YYYY-MM-DD-<topic>-專業文章草稿.md
文章評審報告-<topic>.md
YYYY-MM-DD-<topic>-目鏡大叔品牌版.md
聲紋後安全複審-<topic>.md
```

For reusable templates/SOPs:

```text
自主研究任務模板-備課前研究版.md
一鍵工作流-備課研究到品牌文章.md
```

## Reusable Support Files

This skill has reusable support files that should be used before hand-building assets:

- `templates/run-brief.md` — quick run brief for a new topic.
- `templates/topic-intake-form.md` — structured intake form; use this before starting real content production.
- `templates/asset-metadata-schema.yaml` — shared frontmatter / metadata schema for output notes.
- `templates/naming-and-folder-rules.yaml` — canonical vault folders, filenames, slug rules, and collision policy.
- `templates/case-library-template.md` — case record template for preserving real/sandbox runs, verification, reuse, and commercialization notes.
- `scripts/create_asset_pack.py` — creates a minimal/brand/complete Obsidian asset-pack skeleton from date + slug + topic.
- `scripts/validate_asset_pack.py` — validates expected files, frontmatter, workflow anchors, asset types, and mode-specific content anchors.
- `references/myopia-control-validation-example.md` — prior validated example used as a quality benchmark.
- `references/cycloplegic-refraction-parent-communication-case.md` — real-topic validation run for「兒童散瞳驗光與家長溝通」including DOI/PMID source set, output paths, explicit-consent pitfall, and final verification anchors.
- `references/vision-issues-research-map-case.md` — broad optometry agenda-map case: use master-lens topic architecture, two-pass PubMed scanning, noisy-result refinement, and item-by-item optometrist entry-point synthesis.
- `references/kdf-discovery-evidence-plan-case.md` — KDF-specific optometry workflow: turn an abstract clinical insight into a concrete discovery-question candidate, keep it human-approved=false, then build a separate Evidence Search Plan with PubMed query seeds, PMID leads, evidence buckets, and overclaiming guardrails.

For a new real topic, prefer this order:

1. Fill or infer the topic intake fields.
2. Run `create_asset_pack.py` in `--dry-run` first when practical, then create the skeleton.
3. Research sources and fill the assets.
4. Run `validate_asset_pack.py` against the produced mode.
5. Create/update a case-library note for the run.
6. Report verification as ad-hoc unless a canonical test suite exists.

## Pipeline Testing Lesson

When doing a “complete test round,” test the generator and validator together: create a temporary/sandbox complete asset pack with `create_asset_pack.py --mode complete`, then validate that same pack with `validate_asset_pack.py --mode complete`. If validation fails because generated skeletons lack anchors expected by the validator, patch the generator to emit the missing required anchors rather than weakening the validator. In the July 2026 workflow build, this caught missing brand/safety anchors (`voiceprint_status`, `post_voiceprint_review`, `來源`, `風險`) and the fix was to enrich the brand-voice and post-voiceprint-safety skeletons.

## Verification

After creating or editing Obsidian assets, run focused ad-hoc verification rather than claiming canonical suite green unless a real test suite exists.

Verify at least:

- Files exist at expected vault paths.
- Frontmatter/title anchors exist.
- Research questions, search strategy, PICO/PECO/PICo, source table, evidence labels, overclaiming firewall, fact/inference/recommendation separation exist.
- Article has title, source workflow link, source notes, DOI/PMID or official links where applicable, and overclaiming guardrails.
- Review metadata/status exists before publish-ready claims.
- Brand article, if present, links to review and post-voiceprint safety report.
- Workflow note links final outputs.

If using a temporary script, create it under the OS temp directory with filename prefix `hermes-verify-`, run it, remove it when possible, and report it as **ad-hoc verification**.

## KDF Discovery / Evidence-Plan Mini-Workflow

When the user is working inside the KDF knowledge system and brings an abstract optometry insight, do not rush to Evidence or Mature Knowledge. First translate the idea into plain clinical language, map it to existing KDF cards, classify the proper artifact type, and use dry-run/prepare before writes.

Preferred flow:

1. Plain-language translation: reduce abstract phrases like「能力與需求失配」to something the user and future readers can understand, e.g.「看得清楚，不等於生活中用得順」.
2. Read-only mapping: search/read existing KDF cards before proposing a new artifact.
3. Classification: raw ideas → capture; broad new gap → discovery-question candidate; bounded PICO/PECO → research-question; source synthesis → evidence-card; gated synthesis → mature-knowledge.
4. If creating a discovery candidate, keep it `status: candidate` and `human_approved: false`.
5. Build a separate Evidence Search Plan before creating/updating Evidence. Include PICO/PECO, PubMed query strings, inclusion/exclusion criteria, PMID leads, extraction template, evidence buckets, and overclaiming guardrails.
6. If a prepared KDF operation expires, re-run prepare and save in the same turn rather than trying to reuse the stale `operation_id`.
7. After real KDF writes, run the KDF validator and report artifact-count changes honestly; a newly approved write can legitimately change counts.

Detailed example: `references/kdf-discovery-evidence-plan-case.md`.

## Common Pitfalls

1. **Only answering in chat.** This workflow is meant to create durable assets. Save to Obsidian when the user expects reuse.
2. **Writing the article before evidence structure.** Research questions, source table, and evidence grading come first.
3. **Calling something publish-ready without review.** Publish-ready requires the review gate and hard red-flag check.
4. **Brand voice weakening safety.** Friendly tone must not remove caveats, sources, or referral boundaries.
5. **Over-skillizing one case.** Use one myopia-control run as an example, not as a narrow one-topic skill.
6. **Confusing evidence with advice.** Keep facts, inferences, recommendations, and debated points visibly separate.
7. **No verification.** If files were written, verify concrete anchors in those files.
8. **Blocked tool execution presented as progress.** If a research script/tool is blocked for lack of explicit consent, immediately tell the user no scan/write actually ran, ask for the exact consent needed, and stop. Do not respond with a plan that sounds like work is underway; this creates frustration because the user expects action.
9. **Retrying blocked batch writes without explicit consent.** For large Obsidian asset batches, if the runtime blocks a write because the user has not clearly consented, stop and ask for an explicit authorization sentence (for example: `我同意你把完整內容寫入 Obsidian 檔案`). Do not retry, rephrase, or route around the block until the user gives that consent. After consent, write the assets and run a fresh `hermes-verify-*.py` ad-hoc verifier.
10. **Trusting broad biomedical search results without refinement.** Broad PubMed queries often return adjacent but off-target articles. For agenda-map tasks, run a second refined query pass for noisy buckets and explicitly exclude irrelevant hits before synthesizing conclusions.
11. **Treating `ccagy`/search-agent output as verified citations.** `ccagy` is useful for broad discovery and finding research angles, but it may return source names, conference leads, or journal mentions without complete DOI/PMID. Before writing a formal article or claiming evidence strength, re-check each citation against PubMed/Cochrane/guidelines/official pages and label any missing DOI/PMID openly.

## Quick Command Prompt for Future Use

When the user says a topic, run:

```text
請使用 lesson-prep-research-to-brand-article 工作流，針對「<主題>」產出：
1. 研究問題與搜尋策略
2. 文獻/來源表，含 DOI/PMID/連結
3. 證據等級與過度宣稱防火牆
4. 教學轉譯、簡報架構、內容再利用
5. 約 2000 字繁體中文專業文章
6. 專業文章評審
7. 若通過，再做目鏡大叔聲紋版本與聲紋後安全複審
8. 歸檔到 Obsidian 並互相連結
```

## Verification Checklist

- [ ] Research scope and audience captured.
- [ ] 3–5 research questions defined.
- [ ] Search strategy documented.
- [ ] PICO/PECO/PICo used when relevant.
- [ ] Literature/source table contains DOI/PMID/official links when available.
- [ ] Evidence labels and interpretation cautions present.
- [ ] Facts, inferences, recommendations, and unverified claims separated.
- [ ] Overclaiming firewall present.
- [ ] Teaching/content reuse assets created.
- [ ] ~2000-character Traditional Chinese professional article created.
- [ ] Review panel run before publish-ready status.
- [ ] Brand voice adaptation, if any, followed by post-voiceprint safety review.
- [ ] Obsidian files saved and wikilinked.
- [ ] Ad-hoc verification run and reported honestly.
