# Session example: optometry article pipeline

This reference captures a concrete example of the professional article pipeline, without making the one article itself a standalone skill.

## Scenario

The user wanted a lesson-prep research workflow to always produce a rigorous ~2000-character Traditional Chinese professional article, then asked for quality control and brand-voice adaptation.

## Artifacts created in Obsidian

- Professional draft: `10-歷史文章智庫/2026-07-07-兒童近視控制不是保證不加深-專業文章草稿.md`
- Review-panel report: `05-營運SOP與模板/文章評審報告-兒童近視控制不是保證不加深.md`
- Voiceprint card: `05-營運SOP與模板/目鏡大叔文字聲紋卡.md`
- Voiceprint workflow: `05-營運SOP與模板/目鏡大叔品牌聲紋文章轉譯工作流.md`
- Brand version: `10-歷史文章智庫/2026-07-07-兒童近視控制不是保證不加深-目鏡大叔品牌版.md`
- Post-voiceprint safety review: `05-營運SOP與模板/聲紋後安全複審-兒童近視控制不是保證不加深.md`

## Review scores used

Initial professional review:

| Area | Score |
|---|---:|
| Evidence quality | 88 |
| Clinical / practical reasonableness | 86 |
| Overclaiming safety | 96 |
| Teaching value | 91 |
| Reader clarity | 90 |
| Brand trust | 92 |
| SEO / GEO asset value | 87 |

Status: `validated`, total 90 / 100.

Post-voiceprint safety review:

| Area | Score |
|---|---:|
| Evidence retained | 89 |
| Clinical / practical reasonableness | 90 |
| Overclaiming safety | 97 |
| Teaching value | 93 |
| Reader clarity | 94 |
| Brand trust | 96 |
| SEO / GEO asset value | 92 |

Status: `publish-ready`, total 93 / 100.

## Verification pattern

No canonical suite existed because this was Obsidian content work. The focused ad-hoc verification script checked:

- output files exist;
- expected frontmatter and status labels exist;
- brand article has voiceprint markers;
- DOI / PMID sources remain in the brand article;
- FAQ and comparison table exist;
- risky claims such as `保證不加深`, `零副作用`, `人人適用`, and `買了就結案` appear only in negated/rejected contexts;
- source workflow note links the final outputs.

The temporary script was created with `tempfile.mkstemp(prefix='hermes-verify-', suffix='.py')`, run, then removed. The final reply called it **ad-hoc verification**, not suite green.
