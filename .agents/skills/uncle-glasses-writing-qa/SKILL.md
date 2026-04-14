---
name: uncle-glasses-writing-qa
description: |
  Editorial diagnosis skill for checking whether a draft truly sounds like
  Uncle Glasses. This skill evaluates voice match, AI-tone leakage, structural
  flow, credibility balance, and revision priorities. It should lead when the
  task is critique, not first-pass rewriting.
---

# Uncle Glasses Writing QA

## Purpose

This skill exists to evaluate a draft, not merely to polish it.

Its job is to say:

- whether the piece sounds like Uncle Glasses
- where it fails
- what kind of revision is actually needed

## Use This Skill When

- a draft already exists
- the task is "check this version"
- the system needs diagnosis before rewriting
- two versions need editorial comparison
- a piece feels off but the reason is unclear

## Do Not Use This Skill When

- the task is first-pass drafting
- the main task is research digestion
- the main task is HTML rendering or blog packaging
- the user simply wants a direct rewrite without diagnosis

## Core Evaluation Dimensions

### 1. Voice Match

Check:

- does it sound like Uncle Glasses?
- does it feel lived rather than assembled?
- is the tone grounded, restrained, and trustworthy?

### 2. AI Tone Risk

Check:

- are there generic inspirational phrases?
- does the draft sound over-smoothed or formulaic?
- are there sentences that feel manufactured rather than experienced?

### 3. Structural Flow

Check:

- does the opening pull the reader in?
- do transitions carry thought naturally?
- does the ending land in the right place?

### 4. Credibility Balance

Check:

- does the article balance warmth and professional judgment?
- is the confidence level appropriate?
- does it help without preaching or performing authority?

### 5. Specificity

Check:

- are there enough concrete details?
- does the writing avoid abstraction fog?
- is there real human texture?

## Support References

Use support references selectively:

- `.agents/skills/uncle-glasses-writing-voice/references/voice-model.md`
- `.agents/skills/uncle-glasses-writing-voice/references/opening-hooks.md`
- `.agents/skills/uncle-glasses-writing-voice/references/transition-lines.md`
- `.agents/skills/uncle-glasses-writing-voice/references/closing-lines.md`
- `.agents/skills/uncle-glasses-writing-voice/references/ending-modules.md`
- `.agents/skills/uncle-glasses-writing-voice/references/article-type-formulas.md`
- `.agents/skills/uncle-glasses-writing-voice/references/article-scoring-checklist.md`
- `.agents/skills/uncle-glasses-writing-voice/references/hybrid-patterns.md`

## Workflow

### Step 1

Identify the article type:

- story
- explainer
- belief-shift
- guidance
- reflection

### Step 2

Check the voice against the voice model.

### Step 3

Check the opening, transitions, and ending flow.

### Step 4

Identify the top revision priorities.

Do not produce an exhaustive complaint list if three issues explain most of the weakness.

### Step 5

State whether the best next move is:

- revise lightly
- rewrite selected sections
- rewrite the whole draft

## Output Shape

```md
## Writing QA
- Draft:
- Article Type:
- Voice Match: pass / revise
- AI Tone Risk: low / medium / high
- Structure Flow: pass / revise
- Credibility Balance: pass / revise
- Specificity: pass / revise
- Main Problems:
- Revision Priority:
- Recommended Next Move:
```

## Boundary With Voice Core

If the task is:

- "rewrite this so it sounds like me"
- "turn this into Uncle Glasses voice"

then `uncle-glasses-writing-voice` should lead.

If the task is:

- "does this sound right?"
- "where is the AI tone leaking?"
- "which version is better?"

then this QA skill should lead.

## Bottom Line

This skill should reduce editorial ambiguity.

It exists to tell us what is wrong, how serious it is, and what kind of fix will actually help.
