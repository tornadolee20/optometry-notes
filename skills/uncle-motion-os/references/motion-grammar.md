# Motion Grammar v0.1

目的：把「感覺」轉成可被 code agent 執行的動畫語言。

## 1. Camera Tokens

### PUSH_IN_SLOW
- purpose: 增加注意力與聚焦
- typical duration: 12–36 frames
- default easing: ease-out
- note: 避免每幕都 push

### PUSH_OUT_SLOW
- purpose: 揭露環境、收尾、解除壓力

### SNAP_ZOOM
- purpose: punchline / surprise / abrupt emphasis
- use sparingly

### PAN_X
- purpose: 橫向探索、介面 walkthrough

### PAN_Y
- purpose: 垂直 reveal、列表 / feed 模擬

### PARALLAX_LIGHT
- purpose: 提供深度，不搶內容

### CAMERA_SHAKE_LIGHT
- purpose: 短暫衝擊
- max: 少量 frames
- avoid: 衛教長段落持續使用

## 2. Transition Tokens

### HARD_CUT
- purpose: 節奏、反轉、喜劇 timing

### MATCH_CUT
- purpose: 跨場景保持視覺連續

### MASK_REVEAL
- purpose: UI / title / object reveal

### WHIP_TRANSITION
- purpose: 高速能量
- warning: 易俗、易暈，有限使用

### FADE_SHORT
- purpose: 呼吸、章節間隔
- warning: 不要當預設萬用轉場

## 3. Typography Tokens

### TEXT_STAGGER
字 / 詞依序進場，用於節奏化資訊。

### WORD_PUNCH
只放大或強調一個關鍵字。

### KINETIC_LINE
整行文字跟著語音節奏位移 / scale。

### HOLD_READ
文字完全停止移動，給觀眾讀。

原則：重要資訊需要 HOLD，不可一直漂。

## 4. Object Tokens

### SCALE_IN_SOFT
0.94 -> 1.0，柔和進場。

### POP_IN
快速 overshoot，用於輕鬆 / punchy 場景。

### SLIDE_IN_EDGE
從畫面邊緣進入。

### TRACK_TARGET
畫面元素與語音 / 游標 / 重點同步移動。

### FOCUS_DIM
非重點元素降低 prominence，主體保持清晰。

## 5. Timing Tokens

### HOLD_6F
停 6 frames。

### HOLD_12F
停 12 frames。

### BEAT_SYNC
motion peak 對齊音訊 beat / 語句重音。

### PRE_LAP
下一段聲音先進，畫面稍後切。

### J_CUT
下一幕 audio 提前進入。

### L_CUT
上一幕 audio 延續到下一幕。

## 6. Easing Vocabulary

優先用可理解、可重現名稱：

- linear
- ease-in
- ease-out
- ease-in-out
- easeOutQuad
- easeOutCubic
- easeOutQuart
- spring-soft
- spring-snappy

若 renderer 需要特定函數，由 code layer mapping。

## 7. Motion Declaration Format

每個 motion 都用：

```yaml
id: M03
scene: S02
target: primary-card
token: PUSH_IN_SLOW
start: 3.20s
end: 4.10s
duration: 0.90s
easing: easeOutQuart
purpose: 把注意力從背景集中到關鍵卡片
trigger: voice_phrase_04
exit: hold
```

## 8. Prohibited vague directions

避免只寫：

- 更高級
- 更有科技感
- 更震撼
- 更酷
- 更有電影感

必須把形容詞翻成：
- composition
- timing
- scale
- camera
- easing
- lighting intent
- motion density
- transition behavior
