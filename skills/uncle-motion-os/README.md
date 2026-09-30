# Uncle Motion OS

Version: **0.1**
Status: **Provisional / Supporting**
Repository role: reusable production skill inside `optometry-notes`.

## Why this exists

AI 影片品質差距通常不在於模型本身，而在於是否有一條可驗收的製作流程。

Uncle Motion OS 把影片從「一句 Prompt」拆成：

```
Reference
-> Spec
-> Storyboard
-> Static
-> Motion
-> Render Handoff
-> QA
-> Learning
```

## Current scope

v0.1 只建立「大腦與規格」。

目前不包含：

- Remotion runtime
- render service
- FFmpeg pipeline
- TTS API
- upload automation
- analytics connector

這些等到流程在真實案例中穩定後再接 MCP / runtime。

## Promotion criteria

要從 provisional / supporting 升級，至少需要：

1. 連續實戰案例
2. 可重複的輸出品質
3. 明確的 boundary
4. QA 能抓到真實缺陷
5. 至少數個有 Outcome 的案例
6. 通過 repo 既有 skill review / governance 流程

## First recommended cases

- 12 秒 Belief Twist 短片
- 30–60 秒視光衛教動畫
- 90 秒知識型動畫
- App / SaaS product demo

先用小案例驗證，不先建大型 runtime。
