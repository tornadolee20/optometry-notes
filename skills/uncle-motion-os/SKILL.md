---
name: uncle-motion-os
description: |
  Reference-driven programmatic video production director for Uncle Glasses.
  Converts a topic, script, product demo, or content idea into an execution-ready video package:
  reference DNA -> storyboard options -> static keyframe plan -> motion grammar -> audio timeline -> render handoff -> QA -> learning record.
  This skill is tool-agnostic. Remotion, HyperFrames, FFmpeg, TTS, image generation, and analytics are execution tools, not the skill itself.
  Trigger examples: 「做成影片」「動畫版」「幫我分鏡」「Remotion」「motion spec」「影片導演」「先出靜態畫面」「影片工作流」.
---

# Uncle Motion OS

Status: **v0.1 / provisional supporting skill**

> 目的不是「一句 Prompt 直接生影片」。
> 目的是把影片拆成可驗收、可修改、可學習的製作工程。

## 1. Skill Boundary

### This skill owns

1. 影片任務定義
2. Reference Mining 與視覺 / 節奏基因拆解
3. 3 套 Storyboard 方向
4. Static Keyframe 規格
5. Motion Grammar
6. Audio / Voice Timeline 規格
7. Render Handoff Manifest
8. Video QA
9. Case Learning 記錄骨架

### This skill does NOT own

- 醫療 / 視光證據查核
- 最終文章文案聲線
- 圖像實際生成
- TTS 實際生成
- Remotion / React 程式碼實際執行
- MP4 實際渲染
- 社群平台實際上架
- Analytics 實際抓取

上述工作應交給對應 research / writing / visual / tool / runtime layer。

## 2. Core Principle

影片製作預設順序：

```
Intent
-> Reference
-> Creative DNA
-> Storyboard
-> Static Keyframes
-> Motion Spec
-> Audio Timeline
-> Render Handoff
-> QA
-> Outcome Learning
```

禁止預設走：

```
一句 Prompt -> 直接寫動畫 -> Render -> 發現不對 -> 全部重做
```

## 3. Operating Rules

### Rule A — Reference before animation

沒有 reference 時，不假裝已經知道「高級感」長什麼樣。

可以先提出候選視覺方向，但必須標記為 hypothesis。

### Rule B — Static before motion

在畫面構圖、視覺階層、主體位置、文字可讀性未穩定前，不進入複雜動畫。

### Rule C — One source of truth

一支影片只能有一份 canonical Motion Spec。

修改時更新 Motion Spec，不要靠聊天記憶追蹤零散修改。

### Rule D — Tool agnostic

Remotion / HyperFrames / Three.js / FFmpeg 都是 execution engine。

Skill 定義「要做什麼」，工具負責「怎麼跑」。

### Rule E — Smallest viable motion

不是每一幕都要動。

只有能提升：
- 理解
- 注意力
- 節奏
- 情緒
- 資訊層級

的動畫才保留。

### Rule F — Short-form single-job rule

12 秒短片原則上只完成一個主要認知任務。

例如：
- 打破一個直覺
- 建立一個問題
- 完成一個反轉
- 示範一個動作

不要在 12 秒塞完整教科書。

## 4. Required Inputs

至少取得以下資訊中的足夠部分：

- `goal`
- `audience`
- `platform`
- `aspect_ratio`
- `duration`
- `script_or_message`
- `brand_assets`
- `references`
- `voice_or_audio`
- `must_keep`
- `must_avoid`

若缺資料，不要阻塞任務。
先建立 assumptions，並標記哪些是可替換假設。

## 5. Workflow

### Stage 0 — Mission Brief

輸出：

- Audience
- One Job
- Desired response
- Platform
- Duration
- Aspect ratio
- Primary constraint
- Success signal

如果 One Job 無法用一句話說清楚，先縮小任務。

### Stage 1 — Reference Mining

對每個 reference 拆：

- 0–2 秒 Hook
- shot length
- composition
- typography
- spacing
- camera behavior
- transitions
- motion density
- information density
- emotional curve
- payoff timing

產出 `Reference DNA`，不是模仿清單。

### Stage 2 — Creative DNA

把 reference 與任務轉成可重用規格：

- Hook pattern
- pacing pattern
- layout system
- camera pattern
- motion pattern
- typography behavior
- transition behavior
- payoff pattern

### Stage 3 — 3 Storyboard Directions

預設產出三套差異明顯的方向：

1. **Retention-first**：最高注意力與節奏
2. **Clarity-first**：最高理解與資訊清晰
3. **Brand-first**：最高品牌一致性與質感

每套至少包含：

- scene ID
- timestamp
- purpose
- visual
- text / dialogue
- motion intent
- transition
- viewer question

不可只換顏色就算三個版本。

### Stage 4 — Static Keyframe Gate

在進入 motion 前確認：

- 主體位置
- 視覺焦點
- 手機可讀性
- 字體層級
- safe area
- 品牌一致性
- 每幕是否只有一個主要焦點

若靜態畫面不成立，不進動畫。

### Stage 5 — Motion Spec

使用 `references/motion-grammar.md` 的 token 化語言。

每個 motion 必須寫：

- target
- start
- end
- duration
- easing
- purpose
- trigger
- exit behavior

禁止只寫「做得更有科技感」。

### Stage 6 — Audio Timeline

若有旁白 / 對白：

- sentence ID
- spoken text
- start time
- end time
- pause
- emphasis
- visual sync cue

視覺必須服從語音節奏，而不是各跑各的。

### Stage 7 — Render Handoff

產出 canonical manifest：

- canvas
- fps
- duration
- scenes
- asset paths / IDs
- typography
- colors
- motion tokens
- audio timeline
- transitions
- render notes
- unresolved assumptions

給 Remotion / code agent 的是規格，不是模糊美術形容詞。

### Stage 8 — QA

依 `templates/video-qa-template.md` 檢查：

- Hook
- clarity
- pacing
- mobile readability
- visual consistency
- audio sync
- unnecessary motion
- ending payoff
- technical render integrity

### Stage 9 — Learning

完成後依 `templates/case-learning-template.md` 建立 Case。

未取得真實 Outcome 時，只能記：
- hypothesis
- observation
- production lesson

不得把個人喜好當成已驗證 learning。

## 6. Stop Gates

### Gate A — Storyboard stop

如果使用者只需要企劃 / 分鏡，停在 Stage 3。

### Gate B — Keyframe stop

如果視覺方向還沒定，不進 motion。

### Gate C — Motion Spec stop

如果沒有 runtime / renderer，只輸出 execution-ready spec，不假裝已 render。

### Gate D — Learning stop

沒有真實成效資料，不宣告成功模式。

## 7. Output Contract

完整模式預設輸出：

1. Mission Brief
2. Reference DNA
3. Storyboard A/B/C
4. Selected Direction
5. Static Keyframe Plan
6. Motion Spec
7. Audio Timeline
8. Render Handoff Manifest
9. QA Checklist
10. Case Learning Skeleton

## 8. Integration Position

推薦架構：

```
Research / Evidence
        ↓
Attention / Narrative Logic
        ↓
Visual Direction
        ↓
Uncle Motion OS
        ↓
Runtime / Render Engine
        ↓
MP4
        ↓
Outcome / Analytics
        ↓
Learning
```

Uncle Motion OS 是「影片導演與製作規格層」，不是 render server。

## 9. Invocation Examples

### Example A — 12 秒 Reels

「把這個『晚上看到車燈星芒不一定是散光』做成 12 秒 9:16 真人短片，先跑 Uncle Motion OS，只做到分鏡與 Motion Spec。」

### Example B — 90 秒動畫

「把紅蘿蔔護眼這篇稿做成 90 秒動畫。先拆 Reference DNA，給我三套 storyboard，再進 keyframe。」

### Example C — Product demo

「這個 App 功能做一支 30 秒產品影片。不要直接寫 Remotion，先把 static keyframe 與 motion grammar 定義好。」

## 10. Related Files

- `README.md`
- `references/architecture.md`
- `references/motion-grammar.md`
- `templates/storyboard-template.md`
- `templates/motion-spec-template.md`
- `templates/video-qa-template.md`
- `templates/case-learning-template.md`
