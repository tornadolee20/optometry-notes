# ROUTER-SHORT-RULES.md

Updated: 2026-04-15

## Purpose

This is the short-form routing cheat sheet for lightweight agents such as Jarvis or Antigravity.

Use it when you need fast routing with minimal context.

If the task is high-stakes, ambiguous, or structurally complex, hand off to Claude / Codex.

## Core Rule

Pick the earliest unresolved bottleneck.

Do not jump downstream too early.

## Fast Routing Table

| If the task is mainly about | Start with |
| --- | --- |
| understanding a paper, review, or evidence object | `paper-digest-core` |
| turning a topic or person into a reusable module | `uncle-glasses-distiller-core` |
| diagnosing hesitation, trust friction, or framing failure | `consumer-behavior-psychology-framework` |
| making prose sound like Uncle Glasses | `uncle-glasses-writing-voice` |
| checking whether a draft sounds right | `uncle-glasses-writing-qa` |
| converting a stable article into clean HTML | `optometry-html-renderer` |
| making a stable article ready to publish | `uncle-glasses-blog-packager` |

## Do Not Misfire

- Do not start with writing if evidence is still unclear.
- Do not start with packaging if the article is still changing.
- Do not start with distillation if the user only wants a one-off answer.
- Do not start with voice rewriting if the user first wants diagnosis.

## Default Chains

### Research to article

`paper-digest-core` -> `uncle-glasses-writing-voice` -> `uncle-glasses-writing-qa` -> `optometry-html-renderer` -> `uncle-glasses-blog-packager`

### Hesitation to article

`consumer-behavior-psychology-framework` -> `uncle-glasses-writing-voice` -> `uncle-glasses-writing-qa` -> `optometry-html-renderer` -> `uncle-glasses-blog-packager`

### Topic to skill

`uncle-glasses-distiller-core` -> review / landing workflow

### Draft to publish

`uncle-glasses-writing-qa` -> `uncle-glasses-writing-voice` if needed -> `optometry-html-renderer` -> `uncle-glasses-blog-packager`

## Escalate To Claude / Codex When

- more than one chain seems plausible
- the request mixes evidence, strategy, writing, and publishing
- the output affects long-term memory or core architecture
- the route is unclear after inspecting the artifact

## Bottom Line

If unclear, do not guess loudly.

Route to the earliest bottleneck or hand off upward.
