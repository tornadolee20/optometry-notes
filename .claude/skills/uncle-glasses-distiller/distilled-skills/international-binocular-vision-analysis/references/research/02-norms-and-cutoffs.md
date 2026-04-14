# Norms and Cutoffs Module

## Purpose

This module stores norms, cutoff logic, and measurement caveats for binocular vision analysis.

It exists to keep `SKILL.md` clean. The main skill should describe diagnostic logic and pattern recognition.
This file tracks the moving boundary between:

- useful clinical thresholds
- age-dependent norms
- method-dependent variability
- evidence that is strong enough to guide decisions but not strong enough to become universal rules

## Rules for Using Norms

1. Never use a cutoff alone to make a binocular vision diagnosis.
2. Always interpret norms with:
   - age
   - task demand
   - symptoms
   - measurement method
   - repeatability
3. If two tests measure similar constructs but with different methods, do not assume interchangeable cutoffs.
4. If normative evidence is weak or population-limited, mark the conclusion as provisional.

## High-Value Areas to Track

### 1. Near Point of Convergence

Track:

- pediatric norms
- adult norms
- break vs recovery conventions
- test method differences
- repeatability over repeated trials

Current status:

- clinically important
- high-value test
- should never be interpreted in isolation

### 2. Vergence Facility

Track:

- near facility norms
- symptom-linked versus asymptomatic distributions
- adult versus pediatric separation
- device / prism differences if relevant

Current status:

- often clinically revealing
- useful for symptomatic cases
- still requires pattern context

### 3. Fusional Vergence Ranges

Track:

- distance PFV / NFV
- near PFV / NFV
- break / recovery conventions
- relationship to symptom-based criteria
- whether Sheard- or Percival-like heuristics remain useful in modern interpretation

Current status:

- important but easy to over-mechanize
- do not turn reserve formulas into global truth

### 4. Accommodative Amplitude

Track:

- age-related decline
- method differences
- monocular vs binocular contexts
- mismatch between amplitude and symptoms

Current status:

- essential for accommodative insufficiency workup
- insufficient alone for full diagnosis

### 5. Accommodative Facility

Track:

- monocular facility cutoffs
- binocular facility cutoffs
- plus/minus asymmetry patterns
- age-specific expectations

Current status:

- particularly useful for distinguishing power issues from switching issues

### 6. Accommodative Response

Track:

- MEM or Nott based expectations
- lag vs lead interpretation
- near-task symptom relationship
- influence of refractive state and task design

Current status:

- clinically useful
- highly context-sensitive

## Evidence Discipline

When adding a new norm or cutoff, record:

- population studied
- age range
- method used
- sample size or evidence strength
- whether the value is descriptive, diagnostic, or only screening-oriented

## What This Module Is Not

This file is not a dump of random normal values.

Its job is to answer:

- which thresholds are stable enough to rely on
- which are still context-bound
- which differ by age or method
- which should remain in `Evolving Edge`

## Current Open Questions

1. Which binocular vision cutoffs are robust across age groups and languages of testing
2. Which facility and NPC thresholds best predict symptoms rather than merely differ from average
3. How much method variance should be tolerated before cutoffs become test-specific only
4. Which historical heuristic rules remain clinically useful after modern evidence review

## Change Log

### 2026-04-13

- created norms-and-cutoffs module
- defined the structure for future cutoff integration without polluting the main skill

## Version 1 Reference Anchors

This is the first usable reference table.

These are not universal truths. They are clinical anchors with explicit caveats.

| Area | Reference Anchor | Evidence Level | Use It For | Caveat |
|------|------------------|----------------|------------|--------|
| CI pattern | Near exophoria at least `4Δ` larger than distance is a commonly used defining element of CI | B | Pattern recognition | This is not enough alone; pair with NPC, PFV, and symptoms |
| Heterophoria test choice | Modified Thorington showed strong repeatability in young adults; one study reported interexaminer repeatability around `±1.43Δ` | B | Choosing a phoria method | Distance data in young adults; do not assume all ages or near testing are identical |
| Heterophoria method comparison | In one reproducibility study, Howell Card had low variability with approximately `±1.6Δ` at distance and `±3.7Δ` at near | B | Interpreting whether a measured phoria difference is likely real | Near repeatability is worse than distance; small changes near may be noise |
| NPC | NPC is a high-value test and should be repeated; repeated-trial behavior matters, especially in children | B | Screening and CI workup | Do not diagnose from a single break point |
| Accommodative amplitude | Subjective push-up style expectations tend to overestimate true accommodative ability compared with objective methods | B | Avoiding false reassurance | Method matters; subjective values should not be treated as objective truth |
| Pediatric accommodative facility | Elementary schoolchildren show lower accommodative facility values than adult-derived expectations | B | Avoiding adult cutoffs in children | Do not import adult facility cutoffs into pediatric cases without adjustment |
| School-age facility example | A 2026 Ghanaian study in children aged 8-17 reported medians around `13 cpm` for MAF, `13 cpm` for BAF, and `14 cpm` for vergence facility | C | A provisional pediatric anchor | Population-specific; not a universal global norm |

## Practical Reading Rules

### If You Need a Fast Rule

- use patterns before numbers
- trust repeatability data when choosing between test methods
- be extra cautious with near heterophoria changes smaller than the method's noise range
- separate pediatric from adult expectations whenever possible

### If You Need a Safer Clinical Interpretation

- treat `4Δ more exo at near than distance` as a useful CI anchor, not a complete diagnosis
- treat NPC as a repeated-trial test, not a one-shot verdict
- treat subjective accommodative amplitude as directionally useful but method-sensitive
- treat facility values as age- and population-aware, especially in children

## Method Notes

### Heterophoria

- Modified Thorington has good repeatability support and is a strong candidate when you want stable phoria quantification.
- Howell Card also has good repeatability support in a modern adult sample.
- Near heterophoria measurement noise is larger than distance noise, so small changes at near may not justify over-interpretation.

### Accommodation

- Objective accommodative amplitude literature reminds us that classic subjective expectations may overshoot true response.
- This matters when a patient appears "normal on paper" but still behaves like an accommodative insufficiency case.

### Facility

- Pediatric facility should not be judged solely by adult-derived expectations.
- If a paper gives a local population norm, log it as `population-bound` unless replicated elsewhere.

## Source Anchors for This Version

- AOA Adult Eye and Vision Examination Guideline
- Anstice et al. 2021 heterophoria repeatability study
- Cebrian et al. 2014 Modified Thorington repeatability study
- Scheiman et al. 1988 normative pediatric accommodative facility study
- Anderson et al. 2008 objective accommodative amplitude study
- Darko-Takyi et al. 2026 schoolchildren facility norms
