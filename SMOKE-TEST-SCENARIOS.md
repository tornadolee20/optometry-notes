# SMOKE-TEST-SCENARIOS.md

Updated: 2026-04-15

## Purpose

This document defines the first practical smoke-test scenarios for the shared-brain runtime.

The goal is to test whether:

- routing works
- lead-skill selection works
- handoffs work
- memory boundaries hold
- each agent stays inside its role

These are not deep benchmarks.

They are first-pass operational checks.

## How To Use

For each scenario, verify:

- which agent should take first action
- which lead skill should activate
- whether handoff is required
- where the chain should stop
- what artifact should exist at the end

If the system behaves differently, log the failure before patching.

## Scenario 1: Mobile Capture -> Inbox Preservation

### User input

`我剛想到一個多焦點客戶猶豫的題目，晚點提醒我整理`

### Expected first agent

Jarvis

### Expected behavior

- capture the idea
- preserve it in inbox or working memory
- create reminder or handoff marker

### Expected lead skill

None yet

### Expected stop

After capture and reminder setup

### Pass condition

Jarvis does not overthink, does not try to write the article, and does not pretend to be the deep reasoning layer.

## Scenario 2: Raw Research Object -> Evidence Digest

### User input

`幫我看這篇近視控制 systematic review 到底在說什麼`

### Expected first deep agent

Claude or Codex

### Expected lead skill

`paper-digest-core`

### Expected chain

1. `paper-digest-core`

### Expected stop

After digest, if no article is requested

### Pass condition

The system does not jump into voice rewriting or HTML.

## Scenario 3: Research -> Blog Article

### User input

`把這篇研究寫成一篇可以發部落格的文章`

### Expected lead skill

`paper-digest-core`

### Expected chain

1. `paper-digest-core`
2. `uncle-glasses-writing-voice`
3. `uncle-glasses-writing-qa`
4. `optometry-html-renderer`
5. `uncle-glasses-blog-packager`

### Expected stop

At publishable package, unless the user only wants a draft

### Pass condition

The system starts from evidence digestion, not from writing or packaging.

## Scenario 4: Hesitation Diagnosis Only

### User input

`客人其實適合多焦點，但一直拖，這背後到底在怕什麼`

### Expected lead skill

`consumer-behavior-psychology-framework`

### Expected chain

1. `consumer-behavior-psychology-framework`

### Expected stop

After diagnosis

### Pass condition

The system does not force article writing when the user only wants understanding.

## Scenario 5: Hesitation -> Article

### User input

`客人明明需要卻不買，幫我寫一篇文章講這件事`

### Expected lead skill

`consumer-behavior-psychology-framework`

### Expected chain

1. `consumer-behavior-psychology-framework`
2. `uncle-glasses-writing-voice`
3. `uncle-glasses-writing-qa`
4. `optometry-html-renderer`
5. `uncle-glasses-blog-packager`

### Expected pass condition

The system diagnoses the psychology first before writing.

## Scenario 6: Draft Diagnosis Before Rewrite

### User input

`這篇你幫我看一下，哪裡還有 AI 味`

### Expected lead skill

`uncle-glasses-writing-qa`

### Expected chain

1. `uncle-glasses-writing-qa`
2. `uncle-glasses-writing-voice` only if rewrite is requested or clearly needed

### Pass condition

The system does not jump straight into rewriting without diagnosing first.

## Scenario 7: Voice Rewrite

### User input

`這篇幫我改成比較像目鏡大叔寫的`

### Expected lead skill

`uncle-glasses-writing-voice`

### Expected chain

1. `uncle-glasses-writing-voice`
2. `uncle-glasses-writing-qa` if validation is needed

### Pass condition

The system treats this as voice transfer, not as a research task.

## Scenario 8: Stable Draft -> HTML

### User input

`內容我已經定了，幫我轉成部落格 HTML`

### Expected lead skill

`optometry-html-renderer`

### Expected chain

1. `optometry-html-renderer`
2. `uncle-glasses-blog-packager` only if final publish metadata is requested

### Pass condition

The system does not reopen writing or diagnosis unless the draft is obviously unstable.

## Scenario 9: Topic -> Reusable Skill

### User input

`把消費者行為心理學做成一個之後能一直用的 skill`

### Expected lead skill

`uncle-glasses-distiller-core`

### Expected chain

1. `uncle-glasses-distiller-core`
2. review workflow
3. Obsidian landing workflow if promoted

### Pass condition

The system treats this as reusable distillation, not as a one-off article.

## Scenario 10: Mixed Request

### User input

`這篇研究幫我整理一下，順便寫成部落格，然後做成 HTML，最後幫我可以發布`

### Expected lead skill

`paper-digest-core`

### Expected interpretation

This is a mixed request, but the earliest unresolved bottleneck is still evidence digestion.

### Expected chain

1. `paper-digest-core`
2. `uncle-glasses-writing-voice`
3. `uncle-glasses-writing-qa`
4. `optometry-html-renderer`
5. `uncle-glasses-blog-packager`

### Pass condition

The system does not jump to the loudest downstream phrase.

It starts upstream.

## Agent Role Smoke Checks

### Jarvis should pass if

- it captures early
- routes lightly
- escalates before overreaching

### Antigravity should pass if

- it preprocesses and groups well
- produces clean handoff packets
- does not act like the final architecture owner

### Claude should pass if

- it chooses the correct lead skill
- it resolves mixed requests correctly
- it keeps chains minimal

### Codex should pass if

- it updates durable files correctly
- it verifies consistency after structural changes
- it writes major outcomes into memory

## Failure Logging Format

If a scenario fails, log it like this:

```md
## Smoke Test Failure
- Scenario:
- Expected Agent:
- Actual Agent:
- Expected Lead Skill:
- Actual Lead Skill:
- Failure Type:
- Notes:
```

## Bottom Line

If these smoke tests pass, the shared brain is behaving coherently at first deployment.

If they fail, patch routing before scaling usage.
