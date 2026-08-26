# KDF Discovery Candidate → Evidence Search Plan Case

Use this reference when 目鏡大叔 works inside the KDF knowledge system and asks to turn an optometry insight into a concrete research path.

## Session Pattern Captured

The user started with an abstract insight:

> 一個人的視覺能力，如何隨生理、病理與當下狀態改變；而在特定任務、環境與暴露時間下，什麼時候開始出現能力與需求的失配？

The successful workflow was not to immediately write Evidence or Mature Knowledge. The useful sequence was:

1. Translate the abstract thought into plain clinical language.
2. Map it to existing KDF cards with read-only tools/search first.
3. Decide the correct KDF artifact type.
4. Narrow it into a candidate discovery question.
5. Dry-run / prepare the candidate before writing.
6. Save only after explicit user intent.
7. Validate KDF and report artifact count changes honestly.
8. Build a separate Evidence Search Plan rather than overpromoting the candidate.

## Plain-Language Translation Step

When the user says they do not understand the abstract framing, simplify before continuing. Good pattern:

- Original abstraction: 視覺能力與需求的失配。
- Plain version: 眼睛不是只問「看不看得到」，而是問「在真實生活中夠不夠用」。
- Clinical slogan: 視力好，不等於視覺在所有情境都夠用。
- Parent-facing version: 孩子看視力表正常，是好事；但我們還要確認他在生活中看得順不順。

Avoid jumping too quickly into KDF jargon if the user signals confusion.

## KDF Classification Heuristic

For KDF work, classify the idea before writing:

| User input shape | Better KDF type |
|---|---|
| Raw thought / quote / loose observation | capture |
| Broad but meaningful gap or new line of inquiry | discovery-question candidate |
| Bound population/exposure/outcome/comparator | research-question |
| Source-backed literature synthesis | evidence-card |
| Human field experience | uncle-lens or field-observation, never Evidence |
| Interpreted, gated synthesis | mature-knowledge |

In this case, the idea was best as a `discovery-question` candidate, not Evidence or Mature Knowledge.

## Concrete Candidate That Worked

The more useful narrowed candidate was:

> 標準中央視力正常，是否足以代表配戴近視控制鏡片兒童在真實生活中的視覺舒適度、任務表現與配戴依從性？

Why this worked:

- It preserved the original “ability vs demand mismatch” insight.
- It was much easier for parents/clinic/store staff to understand.
- It fit the existing KDF-001 line about central vision vs real-life visual performance.
- It avoided turning a broad theory into an overlarge root topic.

## Useful Origin Cards

The actual KDF discovery tool allowed Evidence/Mature origins, so the good origin pair was:

- `EVC-KDF-001-B-001` — evidence about central/off-axis/adaptation visual performance.
- `MKC-KDF-001-B-001` — mature candidate: central clarity does not imply all viewing conditions are equivalent.

If the user suggests a research-question card as an origin, check whether the KDF tool allows it. Fall back to the Evidence/Mature cards if required.

## Safety and Gate Rules

- Discovery candidates remain `human_approved: false`.
- Do not call them Evidence.
- Do not promote field observations to Evidence.
- If a prepared operation expires, re-run prepare and save in the same turn instead of trying to reuse the expired operation.
- After a real save, the KDF formal baseline artifact count can legitimately change. Report this clearly instead of treating it as regression.
- Run KDF validator after writes.

## Evidence Search Plan Structure

After creating or preparing a discovery candidate, build a separate Evidence Search Plan. Do not immediately create an Evidence Card unless the evidence has been screened and extracted.

Recommended sections:

1. Target KDF card and candidate question.
2. Core clinical framing.
3. Primary research question.
4. Subquestions.
5. PICO / PECO.
6. PubMed search strings.
7. Inclusion / exclusion criteria.
8. Preliminary candidate literature with PMID.
9. Data extraction template.
10. Evidence buckets.
11. Overclaiming guardrails.
12. Proposed Evidence Card update path.
13. Next search actions.
14. Working conclusion.

## Evidence Buckets That Fit This Topic

For near/myopia-control spectacle lens topics, the following buckets were useful:

1. Central VA preserved.
2. Condition-specific differences: low contrast, low luminance, off-axis, peripheral-zone.
3. Dynamic / real-world task gap: reading, visual search, mobility, stairs, sport, classroom transitions.
4. Comfort / quality of vision / adherence.
5. Design and individual differences.

## PubMed Query Seeds

```text
((myopia control spectacle lenses) OR DIMS OR HAL OR lenslet OR "defocus incorporated multiple segments")
AND children
AND ("visual function" OR "visual performance" OR "contrast sensitivity" OR "visual acuity")
```

```text
myopia control
AND (spectacle OR spectacles OR lenses)
AND ("quality of vision" OR compliance OR adherence OR "quality of life" OR comfort)
```

```text
(DIMS OR HAL OR lenslet OR "defocus incorporated multiple segments")
AND ("visual search" OR reading OR "peripheral vision" OR off-axis OR "contrast sensitivity")
```

## Preliminary PMID Leads From This Case

Existing KDF evidence sources:

- `36045391` — HAL/SAL child RCT; high/low contrast VA, photopic/scotopic conditions, accommodation.
- `39691627` — DIMS vs SV; mid-peripheral near VA and visual field performance in children.
- `38922628` — IORC lenses; BCVA, contrast sensitivity, subjective visual variables.
- `36916874` — adult HAL off-axis/peripheral gaze mechanism; do not directly generalize to children.
- `34113234` — lenslet design and short-term visual performance.
- `41784766` — adult crossover DOT/DIMS/HAL/SV; central/peripheral-zone VA, CS, reading, accommodation, visual search.

Newly flagged leads:

- `38546754` — review: myopia control beyond efficacy; compliance, quality of vision, quality of life, safety.
- `42524827` — DIMS TED vs DIMS vs SV; child visual functions, mid-peripheral VA, glare/symptoms.
- `42563074` — DIMS long-term patient journey; satisfaction, adherence, socioeconomic barriers (verify/extract before citation use).

## Overclaiming Guardrails

Allowed cautious wording:

- Central visual acuity is important but may not fully represent real-world visual experience.
- Some designs show condition-specific differences in low contrast, low luminance, off-axis, or peripheral-zone testing.
- Current evidence is incomplete for dynamic real-world tasks and long-term adaptation in children.
- Compliance and comfort matter because efficacy depends on actual wear.

Do not say without stronger evidence:

- Myopia-control spectacle lenses cause daily activity impairment.
- A specific design is unsafe based only on lab visual performance differences.
- Preserved central VA proves there is no functional visual cost.
- Adult immediate crossover findings prove pediatric long-term outcomes.
- A field observation score proves clinical severity, treatment effect, or risk.

## Good Final Deliverable Path

- Save the KDF discovery question only after explicit user intent.
- Save the evidence plan under a durable project folder, e.g. `docs/kdf-engine/evidence-search-plans/`.
- Verify with KDF validator after KDF artifact writes.
- Report untracked files and avoid commit/push unless asked.
