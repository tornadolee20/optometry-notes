# 語感多元化系統設計

## 系統概述

Myownreviews 的評論生成系統不只調整字數，更會為每篇評論隨機挑選不同的「語氣人格」與「情緒強度」，再搭配對應的語助詞與句型節奏。有的篇像朋友閒聊，有的像認真寫心得，有的低調、有的比較興奮，讓整體評論看起來更接近真實世界中，不同個性顧客留下的文字。

## 語氣人格（13 種）

每種語氣都有 `promptHint`（直接注入 AI prompt 的人格說明）和 `intensityRange`（允許的情緒強度範圍）：

| Key | 標籤 | 強度範圍 | 說明 |
|-----|------|----------|------|
| friendly | 親切自然 | low-medium | 像鄰居聊天 |
| casual | 生活化 | low-medium | 像 LINE 跟朋友講話 |
| humor | 幽默風趣 | medium-high | PTT 心得文風格 |
| story_experience | 小故事+體驗 | medium-high | 部落格遊記風 |
| balanced_objective | 帶小缺點+客觀 | low-medium | 消費者報告風 |
| professional | 專業分析型 | low-low | 專業評測風格 |
| colloquial_feel | 口語+感受型 | medium-high | IG 限動留言風 |
| scenario_empathy | 情境帶入+共鳴 | medium-high | 場景代入感 |
| **chill_chat** | 隨性閒聊 | low-low | 「還行」「可以」語氣 |
| **earnest_review** | 認真寫心得 | medium-medium | 條理分明的 Google 評論 |
| **low_key_praise** | 低調好評 | low-medium | 含蓄肯定 |
| **slightly_picky** | 微挑剔但滿意 | medium-medium | 「雖然…但…」結構 |
| **warm_gratitude** | 暖心感謝 | medium-high | 真誠帶感激 |

## 情緒強度（3 級）

- **low**：語氣平淡克制，少用驚嘆句和強烈形容詞
- **medium**：情緒適中，自然表達
- **high**：情感強烈，用詞誇張一點也沒關係

每次生成時，系統會根據語氣的 `intensityRange` 隨機選取一個強度值。

## 語助詞情緒配對

語助詞分為 4 類情緒池（`InterjectionMood`）：

| 情緒池 | 代表詞 | 適配語氣 |
|--------|--------|----------|
| chill | 還好啦、就…、反正 | casual, chill_chat, low_key_praise |
| earnest | 老實說、說真的、基本上 | story_experience, balanced_objective, professional, earnest_review, slightly_picky |
| emotional | 沒想到、天啊、超感動 | humor, colloquial_feel, scenario_empathy, warm_gratitude |
| neutral | 其實啦、結果、不過 | friendly（或未指定時） |

系統通過 `toneToInterjectionMood()` 自動配對，確保語助詞和語氣風格一致。

## concreteActions 插入規則

- 每篇最多 2 個 concreteAction
- 採「保留原句 + 逗點 + 口語片語」拼接，不整句取代
- 同一句內不重複插入
- 不插入名詞短語中間（如「專業驗光」不會被拆開）
- 已用片語記入 `usedPhrases` 集合，避免重複

## 跨產業 concreteActions 風格

所有產業（眼鏡、餐飲、醫療、美容、通用）的 concreteActions 統一為口語化完整句：
- ❌ 舊式：「主動幫我們加水」（太短太正式）
- ✅ 新式：「一坐下就先幫我們倒水」（有場景有動作）

## 反重複機制

- 語氣：記錄最近 5 次使用的 `ToneKey`，下次優先挑不同的
- 句型：記錄最近 5 次使用的 `StructureKey`
- 開場白：記錄最近 5 次使用的 `OpeningType`
- 片語：同篇內 `usedPhrases` 去重（前 6 字相同即視為重複）
