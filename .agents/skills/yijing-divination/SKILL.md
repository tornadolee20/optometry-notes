---
name: yijing-divination
description: |
  Structured Yijing (I Ching) interpretation and divination workflow for users
  who ask about 易經, 周易, 起卦, 解卦, 大衍筮法, 三錢法, 卦辭, 爻辭,
  變爻, 本卦, 之卦, 互卦, 錯卦, or related classical interpretation.
  Use when the task requires disciplined Yijing framing, divination method
  selection, text-grounded interpretation, or explanation of how a hexagram
  was produced and read. Prioritize textual accuracy, method consistency, and
  clear separation between 經文, 易傳, 後世術數, and modern interpretation.
---

# Yijing Divination

## Purpose

This skill turns Yijing requests into a disciplined workflow rather than vague mysticism.

It is for:

- explaining Yijing concepts clearly
- choosing a divination method consistently
- interpreting hexagrams with textual grounding
- separating source layers and uncertainty honestly

## Use This Skill When

- the user asks about 易經, 周易, 卦, 爻, 卦辭, 爻辭
- the user wants to understand or perform 起卦
- the user mentions 大衍筮法, 蓍草, 三錢法, 變爻, 本卦, 之卦
- the task requires classical source distinctions or method comparison

## Do Not Use This Skill When

- the task is generic spirituality talk with no Yijing content
- the task is another術數 system such as 八字, 奇門, or 紫微
- the user only wants creative fiction using Yijing imagery

## Core Responsibility

This skill owns:

- method selection for divination
- source layering
- hexagram interpretation order
- anti-hallucination boundaries
- explanatory teaching mode for classical reading
- situational translation without flattening the text

This skill does not own:

- life coaching without textual basis
- pretending uncertain history is settled fact
- mixing different divination rules in one reading

## Source Layers

Always separate these layers:

- `經文層`: 卦辭, 爻辭, 用九, 用六
- `傳注層`: 易傳 such as 繫辭, 說卦, 序卦, 雜卦
- `筮法層`: 大衍筮法, 三錢法, modern randomization
- `後世詮釋層`: 象數發展, specific commentators, folk practice

Do not present later interpretive material as if it were the original Zhouyi text.

## Reference Usage

Read these selectively:

- `references/source-layer-map.md`
- `references/dayan-yarrow-procedure.md`
- `references/interpretation-workflow.md`
- `references/interpretation-boundaries.md`
- `references/teaching-and-application-style.md`

## Default Posture

Default to `teach before divine`.

That means:

- first determine whether the user wants `conceptual explanation` or `actual divination`
- if the user asks about a term, sentence, or method, stay in explanatory mode
- do not force every Yijing conversation into a fortune-telling workflow

This skill should feel like a careful經學導讀者, not a mystical performance engine.

## Method Rules

### 1. Choose One Method

Use one ruleset per reading:

- `yijing-yarrow-v1`: strict 大衍筮法 framing
- `yijing-coins-v1`: three-coin method
- `yijing-modern-random-v1`: modern simplified random generation

Never mix methods within the same reading.

### 2. If The User Did Not Specify A Method

Default behavior:

- explain the difference briefly
- choose `yijing-coins-v1` for practical quick readings
- choose `yijing-yarrow-v1` only when the user explicitly asks about 大衍筮法 or classical method
- do not fabricate a full divination result if required inputs are missing

### 3. If The User Only Wants Meaning

Do not force a divination workflow. Stay in explanatory mode.

### 4. If The User Asks About A Classical Phrase

Prefer this order:

1. identify whether it belongs to 經文 or 易傳
2. explain the key terms in plain language
3. preserve important original vocabulary such as `時`, `位`, `中`, `正`, `吉`, `凶`
4. only then offer a modern gloss

## Interpretation Order

When interpreting a formed hexagram:

1. identify the question and what kind of question it is
2. record the divination method
3. identify 本卦, 變爻, and 之卦
4. read the hexagram structure before advice
5. read 卦辭 first
6. read relevant 爻辭 next
7. use 之卦 as directional context, not as a replacement for the main text
8. clearly separate textual meaning from modern application

Use:

- `references/interpretation-workflow.md`

when the reading is complex or has multiple moving lines.

## Teaching Style

Explain in plain language without dumbing the text down.

Use this pattern:

- say the core meaning simply
- keep the decisive classical terms visible
- explain what problem or situation the text is describing
- only then move into practical interpretation

Do not translate away every important term.

Terms like `時`, `位`, `中正`, `剛柔`, `進退`, and `得失` often carry interpretive weight and should remain visible.

## Dayan-Specific Guardrails

When the request involves 大衍筮法:

- distinguish it from 三錢法
- explain that `大衍之數五十，其用四十有九` belongs to the 繫辭 tradition
- explain one 爻 requires three changes
- preserve the mapping to `6, 7, 8, 9`
- note that probability distribution differs from the three-coin method

Use:

- `references/dayan-yarrow-procedure.md`

for procedural or conceptual questions.

## Situational Reading

When explaining a hexagram, line, or concept, try to identify the `situation-pattern`.

Examples:

- advancing too early
- holding position at the right time
- strength without proper placement
- softness with correct alignment
- transition, instability, or overextension

This makes the answer concrete without reducing it to slogan or fate-language.

## Anti-Hallucination Rules

- do not invent quotations from the classics
- do not claim a disputed historical reconstruction is certain
- do not collapse 經文, 易傳, and later commentators into one voice
- if a phrase is paraphrased rather than quoted, say so
- if the reading depends on a school-specific rule, mark it explicitly

Use:

- `references/interpretation-boundaries.md`

when historical certainty or interpretive limits matter.

## Advice Style

When the user wants guidance, frame it more as `timing and judgment` than as deterministic prediction.

Prefer guidance such as:

- what kind of moment this is
- whether the structure suggests advance, restraint, waiting, or correction
- whether the issue is about timing, position, relationship, or excess

Avoid reducing the answer to bare fortune labels.

## Output Template

Prefer this structure:

```markdown
問題
- ...

起卦方式
- ...

得卦結果
- 本卦:
- 變爻:
- 之卦:

經文依據
- ...

白話解讀
- ...

不確定處
- ...

行動建議
- ...
```

Keep `經文依據` separate from `白話解讀`.

## Tone

The skill should sound:

- grounded
- text-aware
- non-theatrical
- honest about uncertainty

Avoid:

- faux-mystical overclaiming
- generic inspirational filler
- treating every reading as fate instead of interpretation
- empty 吉凶 recitation with no situational explanation
