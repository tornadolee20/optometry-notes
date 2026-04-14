# CORE-SKILL-TRIGGERS.md

Updated: 2026-04-15

## Purpose

This document maps natural user language to likely core-skill activation.

It exists so the shared brain can route from:

- vague request
- colloquial phrasing
- mixed-intent wording

to:

- the right lead skill
- the right first stage
- the right execution chain

This file is not a rigid keyword matcher.

It is a trigger-interpretation guide.

## Trigger Interpretation Rule

Do not route based on one word alone.

Route based on:

1. what the user is actually trying to get done
2. what the earliest unresolved bottleneck is
3. which core skill owns that bottleneck

If the wording is mixed, prioritize the deeper unresolved stage over the louder downstream stage.

## Trigger Layer 1: Evidence And Research

### Common user phrasing

- `what does this paper actually say`
- `help me digest this paper`
- `is this systematic review trustworthy`
- `what does this study really mean`
- `summarize the key points`
- `how can I use this evidence`

### Real meaning

The user needs evidence digestion.

### Lead skill

`paper-digest-core`

### Typical next chain

- `paper-digest-core`
- then downstream writing only if public expression is requested

## Trigger Layer 2: Distillation And Reusable Framework Creation

### Common user phrasing

- `distill this topic`
- `turn this into a skill`
- `can this person become a perspective skill`
- `make this knowledge reusable`
- `is this worth becoming a skill`
- `break this into a framework`

### Real meaning

The user wants reusable distillation, not just one-off explanation.

### Lead skill

`uncle-glasses-distiller-core`

### Typical next chain

- `uncle-glasses-distiller-core`
- then review / landing workflow if the asset deserves promotion

## Trigger Layer 3: Hesitation, Trust, And Framing

### Common user phrasing

- `why are customers hesitating`
- `they need it but still do not buy`
- `it is not really price, so what is blocking them`
- `why is this explanation not landing`
- `how do we reduce resistance`
- `how do we make people more willing to accept it`
- `how should we change the framing`

### Real meaning

The user needs behavioral diagnosis before writing or persuasion.

### Lead skill

`consumer-behavior-psychology-framework`

### Typical next chain

- `consumer-behavior-psychology-framework`
- then writing only if the diagnosis must be expressed publicly

## Trigger Layer 4: Voice Transfer

### Common user phrasing

- `rewrite this so it sounds like me`
- `this sounds too AI`
- `write this in Uncle Glasses voice`
- `this feels too flat`
- `polish this into my tone`

### Real meaning

The material already exists, but the prose voice is wrong.

### Lead skill

`uncle-glasses-writing-voice`

### Typical next chain

- `uncle-glasses-writing-voice`
- then `uncle-glasses-writing-qa` if validation is needed

## Trigger Layer 5: Editorial Diagnosis

### Common user phrasing

- `does this sound like me`
- `review this draft`
- `where is the AI tone leaking`
- `what feels off here`
- `find the problems`

### Real meaning

The user wants diagnosis before or instead of rewriting.

### Lead skill

`uncle-glasses-writing-qa`

### Typical next chain

- `uncle-glasses-writing-qa`
- then `uncle-glasses-writing-voice` only if rewrite is actually needed

## Trigger Layer 6: HTML Rendering

### Common user phrasing

- `turn this into blog HTML`
- `wrap this in HTML`
- `make this an article layout`
- `convert this into publishable HTML`
- `the content is done, now turn it into a page`

### Real meaning

The article logic is mostly stable and now needs rendering.

### Lead skill

`optometry-html-renderer`

### Typical next chain

- `optometry-html-renderer`
- then package only if publish metadata is needed

## Trigger Layer 7: Publish Packaging

### Common user phrasing

- `package this so it is ready to publish`
- `add canonical and schema`
- `make the Blogger-ready version`
- `this is ready to go live`
- `prepare the final release version`

### Real meaning

The article is already formed.

Now the bottleneck is publish-readiness.

### Lead skill

`uncle-glasses-blog-packager`

### Typical next chain

- `uncle-glasses-blog-packager`

Optional upstream if HTML is still missing:

- `optometry-html-renderer`
- `uncle-glasses-blog-packager`

## Mixed-Intent Trigger Patterns

### Pattern A

User says:

- `turn this research into a blog post`

Interpretation:

- evidence is upstream
- writing and packaging are downstream

Lead with:

- `paper-digest-core`

Not:

- `uncle-glasses-writing-voice`
- `optometry-html-renderer`

### Pattern B

User says:

- `check this article and also make it sound like me`

Interpretation:

- diagnosis and rewrite both matter
- the earliest unresolved bottleneck is quality diagnosis

Lead with:

- `uncle-glasses-writing-qa`

Then:

- `uncle-glasses-writing-voice`

### Pattern C

User says:

- `customers clearly need this but still do not buy, help me write an article about it`

Interpretation:

- behavior diagnosis is upstream
- article writing is downstream

Lead with:

- `consumer-behavior-psychology-framework`

Then:

- writing chain

### Pattern D

User says:

- `this topic matters, help me turn it into something reusable`

Interpretation:

- reusable asset creation

Lead with:

- `uncle-glasses-distiller-core`

## Ambiguity Rule

If the user says only:

- `help me organize this`
- `help me handle this`
- `you decide how to approach it`

do not route immediately from wording alone.

Inspect the artifact first:

- paper -> `paper-digest-core`
- draft -> `uncle-glasses-writing-qa` or `uncle-glasses-writing-voice`
- stable article HTML request -> `optometry-html-renderer`
- reusable framework intent -> `uncle-glasses-distiller-core`

## Anti-Misfire Rules

Do not trigger:

- `uncle-glasses-writing-voice` just because the topic is article-like
- `uncle-glasses-blog-packager` just because the user mentions publishing
- `consumer-behavior-psychology-framework` just because the user mentions sales
- `uncle-glasses-distiller-core` just because the user says `organize`

Always ask:

- what is unresolved first?

## Relation To Other Files

Use this stack together:

- `SKILL-INVOCATION-POLICY.md` for general invocation logic
- `SKILLS-MAP.md` for role-level routing
- `CORE-SKILL-ORCHESTRATION.md` for lead-skill control
- `TASK-TO-CORE-CHAIN.md` for concrete execution chains
- `CORE-SKILL-TRIGGERS.md` for natural-language trigger interpretation

## Bottom Line

The user should be able to speak naturally.

The system should hear the hidden task.

The right core skill should start without the user naming it.
