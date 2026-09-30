# Uncle Motion OS Architecture

## Position

Uncle Motion OS 是 production director layer。

它位在「內容 / 視覺決策」與「程式渲染」之間。

```
Evidence / Topic
   ↓
Narrative / Attention
   ↓
Visual Direction
   ↓
[ Uncle Motion OS ]
   ↓
Remotion / HyperFrames / Code Engine
   ↓
FFmpeg / Render
   ↓
MP4
   ↓
Analytics / Outcome
```

## Separation of concerns

### Upstream

Upstream 要回答：

- 這支影片為誰？
- 要改變什麼認知？
- 真正的 Hook 是什麼？
- 內容是否正確？
- 品牌視覺是什麼？

### Uncle Motion OS

本層回答：

- 怎麼切 scene？
- 每一秒觀眾看什麼？
- 哪些畫面先靜態確認？
- 哪些物件要動？
- 為什麼動？
- motion token 是什麼？
- 動畫如何與 audio 對齊？
- 怎麼把規格交給 renderer？

### Downstream

Downstream 要回答：

- 程式碼怎麼寫？
- asset 怎麼載入？
- render 怎麼跑？
- codec / bitrate / fps 怎麼輸出？
- render error 怎麼修？

## Canonical artifacts

每支正式 case 建議至少保留：

1. `mission-brief.md`
2. `reference-dna.md`
3. `storyboard.md`
4. `motion-spec.md`
5. `qa.md`
6. `learning.md`

當 runtime 成熟後，再加入：

7. source code
8. render config
9. final MP4 pointer
10. analytics snapshot

## Architecture rule

不要讓工具綁架架構。

Remotion 可以被替換。
HyperFrames 可以被替換。
Claude / Codex 可以被替換。

但以下主線應保持穩定：

```
Reference -> Spec -> Preview -> Motion -> Render -> QA -> Learning
```
