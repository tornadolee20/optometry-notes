---
name: paper-digest-core
description: |
  Core research-digestion skill for turning a paper, review, or evidence object into
  a reusable digest with calibrated confidence, practical implications, and optional
  note-ready structure for the shared brain.
---

# Paper Digest Core

Use this skill when the task is to digest a paper, review, guideline, or evidence object into a clear, reusable summary.

This skill owns:

- evidence-aware summarization
- confidence calibration
- practical implication extraction
- caution framing
- optional note-ready output shape

This skill does not own:

- full article writing
- HTML rendering
- publish packaging
- broad literature review across many disconnected sources

Those should hand off to other layers after digestion is complete.

## Trigger

Use when the user asks for things like:

- digest this paper
- summarize this review
- what does this study actually mean
- pull out the practical implications from this source
- turn this evidence into a reusable note

Do not use when the task is mainly:

- writing a blog post
- polishing voice
- building HTML
- packaging for publication
- doing a large multi-source landscape scan with no anchor source

## Core Workflow

### Step 1: Identify the evidence object

Determine what kind of source this is:

- guideline
- systematic review
- meta-analysis
- randomized trial
- observational study
- commentary or conceptual piece

If the source type is unclear, say so and avoid overclaiming.

### Step 2: Extract the real question

Name the actual decision or uncertainty the paper is trying to answer.

Avoid merely paraphrasing the title.

### Step 3: Pull out the few findings that matter

Extract only the findings that are useful for:

- future decision-making
- education
- content translation
- knowledge-base reuse

Do not reproduce the whole abstract.

### Step 4: Calibrate confidence

Use the evidence standard in:

- `references/evidence-rating-standard.md`

Every digest should include a suggested evidence level:

- `C1`
- `C2`
- `H`

The wording of the digest should match the strength of the evidence.

### Step 5: Translate into practical implications

Ask:

- what does this change in practice?
- what does this help explain?
- what does this still not justify?

This is the key move from paper summary to reusable knowledge.

### Step 6: Name the limitations and misuse risks

Include the main reason the findings should not be overstated.

Especially flag:

- weak generalizability
- small samples
- short follow-up
- surrogate outcomes
- overconfident interpretation

### Step 7: Decide whether a note should be created

If the paper has durable reuse value, structure the result with:

- `references/paper-note-template.md`

If the user only wants a quick answer, the full note template is optional.

## Default Output

Use this minimum shape unless the user requests a different format:

```md
## Paper Digest
- Source:
- Study Type:
- Main Question:
- Key Findings:
- Limitations:
- Practical Implications:
- Cautions:
- Suggested Evidence Level: C1 / C2 / H
- Should Create Note: yes / no
```

## Handoff Rule

After digestion:

- hand off to `uncle-glasses-writing-voice` if the material should become prose
- hand off to `uncle-glasses-writing-qa` if a draft already exists and needs diagnosis
- hand off to `optometry-html-renderer` only after article content is stable
- hand off to `uncle-glasses-blog-packager` only at the final publish layer

## Shared-Brain Rule

This skill should improve the shared brain, not just answer the current question.

When a digest has durable value:

- preserve the main question
- preserve the key findings
- preserve the evidence level
- preserve the practical meaning

That makes the output reusable in later writing, teaching, and decision support.

## Bottom Line

`paper-digest-core` is the research digestion layer.

It turns evidence into reusable understanding without pretending that every paper deserves strong certainty.
