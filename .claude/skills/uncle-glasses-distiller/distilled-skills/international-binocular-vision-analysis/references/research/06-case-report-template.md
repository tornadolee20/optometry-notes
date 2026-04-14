# Case Report Template Module

## Purpose

This module turns the binocular vision skill into a repeatable case-analysis engine.

Use it when the user provides:

- a real patient case
- a mock training case
- scattered examination findings that need structured interpretation

The goal is not only to identify a likely pattern, but to generate a clinically disciplined report.

## Input Template

When possible, organize the case into the following fields.

### Basic Information

- age
- sex if relevant
- occupation / school status if relevant
- chief complaint
- symptom duration
- trigger tasks
- red flags

### Refraction and Baseline

- habitual Rx
- manifest / cycloplegic findings if relevant
- monocular VA
- binocular VA

### Alignment

- distance cover test
- near cover test
- distance phoria / tropia
- near phoria / tropia
- incomitance if present

### Fusion

- distance PFV / NFV
- near PFV / NFV
- vergence facility
- NPC

### Accommodation

- accommodative amplitude
- monocular accommodative facility
- binocular accommodative facility
- accommodative response
- NRA / PRA if available

### Sensory

- stereopsis
- suppression / Worth 4 Dot / Bagolini if available

### Special Context

- concussion / TBI
- pediatric learning concerns
- manifest strabismus history
- amblyopia history

## Output Template

When generating a report, use this structure.

### 1. Case Summary

Summarize the complaint and the most relevant findings in 3-6 sentences.

### 2. Primary Pattern

State the most likely binocular / accommodative interpretation.

Examples:

- CI-like exophoric stress pattern
- CE-like esophoric near stress pattern
- probable accommodative insufficiency
- decompensating heterophoria
- unclear mixed picture, further testing needed

### 3. Why This Fits

List the exact findings that support the interpretation.

Use evidence-style reasoning:

- symptom pattern
- alignment pattern
- fusional reserve stress
- accommodative findings
- sensory findings

### 4. Differential Considerations

Name the 1-3 main alternatives that still need consideration.

Examples:

- accommodative dysfunction rather than primary vergence dysfunction
- decompensating intermittent tropia
- special-population binocular dysfunction

### 5. Missing Data That Matter

State which missing tests materially limit confidence.

Examples:

- NPC not repeated
- no near PFV
- accommodative response not measured
- red-flag screening incomplete

### 6. Red Flags

Explicitly state:

- none identified from provided data
- possible red flag, needs escalation
- clear escalation needed

### 7. Confidence Level

Choose one:

- High confidence
- Moderate confidence
- Preliminary

Add one sentence explaining why.

### 8. Clinical Next Step

Recommend the next 1-3 most useful actions.

Examples:

- repeat NPC and quantify recovery
- measure near PFV / NFV if not done
- check accommodative response
- assess fixation disparity / associated phoria if prism discussion is emerging
- escalate to strabismus / neuro evaluation

### 9. Prism Conversation Status

State one of:

- prism not indicated from current evidence
- prism may be considered but only after confirmation
- prism conversation is reasonable now

Then explain the logic briefly.

### 10. Patient Explanation

Provide a plain-language explanation the clinician can speak to the patient or family.

## Short Report Version

If the user wants a faster answer, compress the output into:

1. likely pattern
2. why it fits
3. what is missing
4. next step

## Hard Rules

- do not diagnose from one isolated value
- do not hide missing red-flag screening
- do not overstate confidence when the pattern is incomplete
- do not jump to prism just because a heuristic is met

## Copy-Paste Clinical Prompt

Use this when the user wants a report generated from raw findings:

```text
Analyze this binocular vision case using the international-binocular-vision-analysis framework.

Please output:
1. Case Summary
2. Primary Pattern
3. Why This Fits
4. Differential Considerations
5. Missing Data That Matter
6. Red Flags
7. Confidence Level
8. Clinical Next Step
9. Prism Conversation Status
10. Patient Explanation

Case data:
[paste findings here]
```

## Change Log

### 2026-04-13

- created case report template module
- converted the skill from static knowledge base toward a reusable case-analysis engine
