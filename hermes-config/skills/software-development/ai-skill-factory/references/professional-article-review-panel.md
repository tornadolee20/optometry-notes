# Professional Article Review Panel

Use this reference when a research/lesson-prep workflow produces a long-form professional article that may enter the user's second brain, teaching materials, brand content, or productized AI Skill Factory assets.

## Durable lesson from session

For the user's professional content workflow, a research report is not complete when the article draft is written. High-quality output should pass a structured review gate before being considered a durable knowledge asset.

Recommended pipeline:

```text
autonomous research
→ literature/source search with DOI/PMID or official links
→ evidence grading
→ fact / inference / recommendation separation
→ overclaiming firewall
→ rigorous ~2000-character Traditional Chinese professional article
→ professional article review panel
→ metadata write-back in Obsidian
→ optional brand voice / voiceprint adaptation
→ post-voiceprint safety review
```

## Review panel roles

Use seven review lenses:

1. **Evidence review** — source quality, DOI/PMID, study type, whether cited evidence supports claims.
2. **Clinical / optometry practicality review** — real-world applicability, referral boundaries, local practice fit, safety constraints.
3. **Overclaiming and risk review** — catches guarantees, zero-risk claims, all-person applicability, AI replacing professional judgment, correlation-as-causation.
4. **Teaching value review** — whether the article can become course material, learning objectives, activities, and teaching examples.
5. **Reader clarity review** — whether lay readers can understand without losing professional accuracy.
6. **Brand trust review** — fits 目鏡大叔: professional, plainspoken, trustworthy, not cheap marketing.
7. **SEO / GEO asset review** — semantic entities, search intent, FAQ potential, AI-search citation usefulness, content repurposability.

## Suggested weights

```text
Evidence quality                20%
Clinical / optometry practical  20%
Overclaiming safety             20%
Teaching value                  10%
Reader clarity                  10%
Brand trust                     10%
SEO/GEO asset value             10%
```

Weighted score:

```text
score = evidence*0.20 + clinical*0.20 + overclaiming*0.20 + teaching*0.10 + clarity*0.10 + brand*0.10 + seo_geo*0.10
```

## Status thresholds

```text
draft         < 75
reviewed      75–84
validated     85–91, with overclaiming >= 90 and evidence >= 80
publish-ready >= 92, with overclaiming >= 95, evidence >= 85, clinical >= 85
flagship      >= 95, with all key items >= 90
```

## Red Flag Gate

Fail publish-ready if any are present:

- No main source for a professional/health claim.
- Missing DOI/PMID/official source when the claim is medical or technical.
- Preliminary evidence stated as settled fact.
- Product effect stated as guaranteed.
- Drug/treatment/intervention framed as suitable for everyone.
- Low risk framed as zero risk.
- AI framed as replacing professional judgment.
- No distinction between fact, inference, and recommendation.
- Health/medical decision content lacks risk or referral caveat.
- Source does not support the claim.
- Tone reads like an advertisement rather than professional education.

## Obsidian metadata write-back

When a review is completed, write back fields like:

```yaml
review_status: validated
review_score: 90
evidence_score: 88
clinical_score: 86
overclaiming_score: 96
teaching_score: 91
clarity_score: 90
brand_score: 92
seo_geo_score: 87
reviewed_at: 2026-07-07
review_version: v1
review_report: [[文章評審報告-...]]
```

## Voiceprint / brand voice adaptation

After a professional article passes review, it can be adapted into the user's brand voice. Treat this as a separate step, not a rewrite that can silently weaken the evidence.

Recommended sequence:

```text
professional article draft
→ professional review panel
→ 目鏡大叔文字聲紋轉譯
→ post-voiceprint safety review
→ publish-ready version
```

The post-voiceprint review must check that the adaptation preserved: sources, risk caveats, non-guarantee language, professional boundaries, and the distinction between fact/inference/recommendation.
