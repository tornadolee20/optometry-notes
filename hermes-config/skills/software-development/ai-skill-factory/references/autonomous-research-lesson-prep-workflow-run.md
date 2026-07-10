# Autonomous Research Lesson-Prep Workflow Run Example

Session-derived reference for the user's reusable lesson-prep research workflow. Use this as a compact example of how to validate the workflow before promoting it from Obsidian workflow/template to a formal Skill.

## Tested topic

**Children's myopia control evidence and teaching design**: low-concentration atropine, DIMS spectacle lenses, orthokeratology, and outdoor/activity interventions.

This topic was chosen because it spans the user's optometry expertise, teaching work, consumer education, content reuse, and AI Skill Factory productization.

## Workflow shape that worked

Run the workflow end-to-end in this order:

1. Pick a realistic teaching topic relevant to the user's optometry/AI/content ecosystem.
2. Define 3-5 research questions before searching.
3. Write a search strategy: Chinese keywords, English keywords, synonyms, exclusions, platforms, timeframe, inclusion/exclusion criteria.
4. For clinical/health/optometry topics, decompose with PICO / PECO / PICo.
5. Search literature and capture DOI/PMID/source links.
6. Build an evidence table with: source, authors/year, study type, DOI/link, one-line conclusion, teaching use, evidence strength, interpretation caution.
7. Grade evidence into high / medium-high / low / trend judgment.
8. Translate evidence for multiple audiences: students, parents/consumers, store/clinic consultation.
9. Add an overclaiming firewall: exaggerated claim → why unsafe → more precise wording → acceptable teaching wording.
10. Produce course design, slide outline, interaction questions, assignments, and reuse ideas.
11. Separate facts, inference, recommendations, and items needing verification.
12. Generate Obsidian storage suggestions: MOC, core concept cards, evidence cards, teaching cards, case cards, social content cards, Skill Factory candidates.
13. Generate AI Skill Factory candidate assets with type, inputs, outputs, dependencies, reuse level, commercial value, maintenance cost.
14. Save the run as an Obsidian note and verify with a focused ad-hoc script.

## Example output anchors to verify

A complete run should contain these sections:

- Research questions
- Search strategy
- PICO / PECO / PICo
- One-page summary
- Topic architecture
- Literature/source table with DOI/PMID/source links
- Evidence grading
- Key terms
- Practical cases
- Teaching translation
- Overclaiming firewall
- Course design
- Slide outline with citation/source column
- Fact / inference / recommendation separation
- Content reuse
- Obsidian storage suggestions
- AI Skill Factory candidate assets
- Workflow evaluation
- Source list

## Source handling pattern

For biomedical/optometry lesson-prep tasks, prefer PubMed/Cochrane/guidelines/consensus statements first. Record DOI and PMID where available. Treat product claims and commercial pages as lower-tier evidence unless backed by peer-reviewed trials.

## Overclaiming firewall examples

- Avoid: "This lens guarantees myopia will not worsen."  
  Prefer: "Research suggests it can slow myopia progression on average, but effect varies by child."
- Avoid: "Low-dose atropine has no side effects."  
  Prefer: "Lower concentrations are often better tolerated, but side effects and monitoring still matter."
- Avoid: "AI can choose treatment for parents."  
  Prefer: "AI can organize evidence and support education, but clinical decisions require qualified professionals."

## Skill Factory extraction

This workflow run suggested at least three reusable class-level assets:

- `lesson-prep-autonomous-research` workflow/skill: full research-to-teaching pipeline.
- `evidence-grading-for-optometry` skill: source appraisal and evidence grading for optometry topics.
- `overclaiming-firewall-template` / compliance review skill: prevents health/education/marketing exaggeration.

Do not create one narrow skill named after this one myopia session. Use this run as an example/reference under a broader lesson-prep or optometry evidence workflow skill.

## Verification pattern

After saving the Obsidian note, run a temporary script under the OS temp directory with prefix `hermes-verify-`, check the required anchors/DOIs/sections, remove the script, and report explicitly as **ad-hoc verification**, not canonical suite green.
