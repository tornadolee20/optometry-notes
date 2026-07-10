---
name: professional-article-pipeline
description: Build publish-ready professional articles from research with evidence grading, review-panel scoring, brand-voice adaptation, Obsidian archival, and ad-hoc verification.
platforms: [windows, linux, macos]
---

# Professional Article Pipeline

Use this skill when the user asks for a rigorous professional article, lesson-prep research output, optometry/health education article, or an end-to-end content workflow that turns research into a publish-ready article.

This skill is class-level: it governs the recurring workflow, not one specific article.

## Core principle

Do not stop at a good-looking draft. The expected output is a quality-controlled knowledge asset:

```text
research
→ evidence-organized professional article
→ review-panel scoring
→ brand-voice adaptation when requested
→ post-adaptation safety review
→ Obsidian archival with links and metadata
→ focused ad-hoc verification
```

For health, optometry, and other YMYL-adjacent topics, professional caution outranks persuasive copy.

## Standard workflow

1. **Resolve storage context**
   - For this user's optometry notes, reusable workflow/templates usually belong under the active Obsidian vault folders such as `05-營運SOP與模板`.
   - Finished article assets usually belong under `10-歷史文章智庫` unless the user specifies another location.
   - Use concrete absolute paths; do not pass unresolved environment variables to file tools.

2. **Build the rigorous professional article**
   - Include title, introduction, body sections, conclusion, and source notes.
   - For evidence-based topics, preserve DOI / PMID / official source links where available.
   - Separate facts, interpretation, and recommendations.
   - Include an overclaiming firewall: explicitly avoid guarantee language, zero-risk claims, everyone-applies claims, and AI-replaces-professional-judgment claims.

3. **Run a professional review panel**
   Score the article using multiple perspectives, at minimum:
   - Evidence quality
   - Clinical / practical reasonableness
   - Overclaiming safety
   - Teaching value
   - Reader clarity
   - Brand trust
   - SEO / GEO asset value

   Suggested weighting:

   | Area | Weight |
   |---|---:|
   | Evidence quality | 20% |
   | Clinical / practical reasonableness | 20% |
   | Overclaiming safety | 20% |
   | Teaching value | 10% |
   | Reader clarity | 10% |
   | Brand trust | 10% |
   | SEO / GEO asset value | 10% |

4. **Apply status gates**
   Use durable status labels in frontmatter and reports:

   ```text
   draft → reviewed → validated → publish-ready → flagship
   ```

   Practical thresholds:
   - `validated`: total score around 85+ with high overclaiming safety.
   - `publish-ready`: total score around 92+ with evidence, clinical/practical, and overclaiming scores all strong.
   - `flagship`: 95+ and all key areas 90+.

   Any red flag blocks publication regardless of total score:
   - Missing major sources.
   - Source does not support the claim.
   - Guarantee language for health outcomes.
   - Zero-side-effect or everyone-applies claims.
   - Product pitch that overwhelms professional balance.
   - AI presented as replacing clinical judgment.

5. **Brand-voice adaptation when requested**
   If the user wants the article in their voice, first preserve the professional skeleton:
   - Facts and sources
   - DOI / PMID
   - risk and limitation statements
   - referral / professional-evaluation boundaries
   - facts vs interpretation vs recommendation separation

   Then adapt the prose to the voice profile. For 目鏡大叔, use the Obsidian voice assets if present:
   - `[[目鏡大叔文字聲紋卡]]`
   - `[[目鏡大叔品牌聲紋文章轉譯工作流]]`

   Common 目鏡大叔 adaptation markers:
   - Start from a parent/customer sentence or store scenario.
   - First receive the reader's anxiety, then explain the professional concept.
   - Use plain-language metaphors such as brakes, balloons, coach/team, long-term management, optical support.
   - Add `大叔小提醒` where useful.
   - End with a calm invitation to bring information, talk, inspect, or review together, not a hard sell.

6. **Post-voiceprint safety review**
   After style adaptation, re-check that the warmer prose did not damage professional accuracy:
   - Sources retained.
   - No guarantee language.
   - No zero-risk / everyone-applies claims.
   - Clinical/legal/referral boundaries retained.
   - Brand warmth did not become sales hype.
   - FAQ/comparison tables still align with evidence.

7. **Write Obsidian assets and cross-links**
   Recommended artifacts:
   - Professional draft note.
   - Review-panel report note.
   - Brand-voice article note.
   - Post-voiceprint safety review note.
   - Updates to the source workflow/test note with wikilinks to final outputs.

   Put review metadata in article frontmatter, e.g.:

   ```yaml
   review_status: publish-ready
   review_score: 93
   evidence_score: 89
   clinical_score: 90
   overclaiming_score: 97
   teaching_score: 93
   clarity_score: 94
   brand_score: 96
   seo_geo_score: 92
   review_report: [[...]]
   voiceprint_status: adapted
   voiceprint_review_status: passed
   post_voiceprint_review: [[...]]
   ```

8. **Verify with focused ad-hoc checks**
   When no canonical test/lint/build command exists, create a temporary verification script under the OS temp directory using `tempfile` and a `hermes-verify-` filename prefix. Check the changed behavior/anchors, run it, clean it up, and report the result as **ad-hoc verification**, not suite green.

   Useful checks:
   - Files exist and are non-empty.
   - Required frontmatter fields are present.
   - Required wikilinks exist.
   - DOI / PMID / source anchors are preserved.
   - Review status and scores are present.
   - Overclaiming guardrails are present.
   - Risky phrases only appear in negated/rejected contexts.
   - FAQ/comparison table exists when publish-ready SEO/GEO output is expected.

## Output conventions

In the final reply, report:

- Where the article is saved.
- Where review reports are saved.
- Final status and score.
- What was verified.
- Whether verification was canonical suite green or ad-hoc verification.

Keep the response concise enough for the user to act, but include paths and status labels exactly.

## Pitfalls

- Do not call a draft publish-ready just because it reads well.
- Do not let brand voice remove sources or professional caveats.
- Do not describe the workflow as complete unless files were actually written and verified.
- Do not save a one-off article as a new skill. Save the workflow pattern here, and use references for session-specific examples if needed.
