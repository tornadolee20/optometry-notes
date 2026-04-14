---
name: consumer-behavior-psychology-framework
description: |
  Applied consumer behavior psychology framework for understanding why people
  hesitate, choose, delay, trust, avoid, or commit in real buying situations.
  Use when the task is to analyze customer decision friction, improve framing,
  reduce hesitation, or design more trustworthy communication in retail,
  service, content, or consultation contexts.
---

# Consumer Behavior Psychology Framework

## Purpose

This skill helps the system interpret buying behavior as human decision behavior, not just as "sales resistance."

It is designed for real-world use in:

- trusted retail
- service explanation
- content framing
- consultation design
- pricing and offer communication

## Use This Skill When

- the user asks why customers hesitate or do not buy
- the task is to improve framing, trust, or perceived value
- a page, article, or offer needs stronger conversion logic without becoming pushy
- the system needs to understand what people are psychologically buying, not just what product they see

## Do Not Use This Skill When

- the task is purely academic psychology summary
- the user only wants generic marketing slogans
- the problem is technical implementation rather than human decision behavior
- the task mainly requires statistical research synthesis instead of practical interpretation

## Core Responsibility

This skill should help answer:

- what psychological friction is blocking the decision
- what the customer is actually trying to protect
- what kind of framing reduces fear and ambiguity
- what kind of offer presentation increases trust without pressure

This skill owns diagnosis and reframing.

It does not own:

- full article writing
- editorial voice transfer
- pure conversion copy generation without diagnosis
- academic literature digestion
- HTML or publish packaging

## Operating Model

### 1. People Do Not Only Buy Products

They also buy:

- risk reduction
- identity protection
- future comfort
- social safety
- confidence that they will not regret the decision

### 2. Hesitation Usually Has A Hidden Logic

Common hidden drivers:

- fear of making the wrong choice
- fear of wasting money
- fear of looking foolish
- fear of being pushed
- inability to compare options clearly

### 3. Perceived Value Is Not Purely Functional

Customers often respond to:

- framing
- trust
- timing
- explanation quality
- how easy the choice feels

### 4. Decision Friction Often Beats Product Quality

A good option can still lose when:

- the explanation is unclear
- the comparison is confusing
- the benefit feels abstract
- the tradeoff is not translated into human language

### 5. Trust Converts Better Than Pressure

In high-trust buying environments, the system should usually:

- reduce ambiguity
- make tradeoffs explicit
- normalize hesitation
- guide rather than push

## Reference Usage

Use support references selectively rather than loading everything at once:

- `references/core-models.md`
- `references/friction-patterns.md`
- `references/framing-moves.md`
- `references/optometry-use-cases.md`

## Reference Map

See:

- `references/REFERENCE-MAP.md`

Use that file to decide which support reference best fits the current task.

## Practical Diagnostic Lenses

### Lens A: What Is The Customer Afraid Of?

Ask:

- what loss are they trying to avoid?
- what regret are they imagining?
- what uncertainty feels too expensive?

### Lens B: What Are They Really Buying?

Ask:

- convenience?
- safety?
- confidence?
- care?
- identity?
- reduced cognitive load?

### Lens C: What Is Creating Friction?

Check for:

- too many options
- unclear difference between options
- over-technical explanation
- mismatch between price and perceived value
- low emotional clarity

### Lens D: What Kind Of Framing Would Help?

Possible moves:

- compare fewer options
- translate features into lived outcomes
- reduce fear of regret
- show the decision path more clearly
- make the next step feel reversible or discussable

## Workflow

### Step 1: Name the decision situation

Identify:

- what the customer is being asked to choose
- what they are hesitating about
- what kind of environment this is

Examples:

- retail consultation
- service explanation
- article or landing page
- pricing conversation

### Step 2: Diagnose the hidden protection goal

Ask what the person is trying to protect:

- money
- self-image
- future comfort
- family safety
- freedom from regret

### Step 3: Locate the dominant friction

Choose the main friction rather than listing every possible one.

Use:

- `references/friction-patterns.md`

when the blockage pattern is not obvious.

### Step 4: Choose the reframing move

Select the smallest framing change that reduces fear without increasing pressure.

Use:

- `references/framing-moves.md`

when the task is mainly about explanation or offer framing.

### Step 5: Translate into an actionable next move

The output should guide action, not just describe psychology.

Possible next moves:

- simplify comparison
- change explanation order
- reduce option count
- normalize adaptation fear
- shift from price defense to decision clarity

### Step 6: Hand off if needed

If the insight must become prose, article language, or publishable material, hand off downstream to:

- `uncle-glasses-writing-voice`
- `uncle-glasses-writing-qa`
- `optometry-html-renderer`
- `uncle-glasses-blog-packager`

## Default Heuristics

- confusion often feels like risk
- too much choice often feels like danger, not freedom
- people trust what they can picture
- what sounds rational is not always what feels safe
- buyers often need clarity before courage

## Optometry / Trusted Retail Translation

In this workspace, apply the framework especially to:

- lens upgrade hesitation
- myopia-control explanation
- multifocal adaptation fear
- family decision dynamics
- price objection that is really trust objection
- consultation flow design

For recurring domain patterns, use:

- `references/optometry-use-cases.md`

## Support References

- `references/REFERENCE-MAP.md`
- `references/core-models.md`
- `references/friction-patterns.md`
- `references/framing-moves.md`
- `references/optometry-use-cases.md`

## Output Shape

```md
## Consumer Behavior Diagnosis
- Situation:
- Decision Context:
- Hidden Fear:
- Real Purchase Driver:
- Main Friction:
- Better Frame:
- Recommended Next Move:
- Should Hand Off To Writing Layer: yes / no
```

## Bottom Line

This skill helps the system see purchase behavior as decision psychology under uncertainty.

That makes the resulting advice more humane, more precise, and usually more effective.
