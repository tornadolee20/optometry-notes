---
description: 一魚多吃內容繁衍飛輪。輸入一個核心主題或痛點，自動產出 4 種格式的行銷素材（FB 貼文、Email、話術腳本、部落格大綱），並寫入對應知識庫。
---
# Cross-Pollinate — 內容繁衍飛輪

> 核心信念：一個好觀點，應該能長出 4 種生命形態。
> 用法：把一個主題（話題、痛點、新功能、知識點）丟給我，我負責把它繁殖開來。

## 📍 觸發條件

大叔輸入以下任一指令時啟動：
- `/cross-pollinate [主題或痛點]`
- 「一魚多吃」
- 「幫我把這個話題展開成多種素材」

## 🛂 Knowledge Source Gate

Before producing formal platform content, classify the input:

1. `mature-knowledge` with required Human Gates passed, or
2. another Knowledge Card explicitly approved by a human for content use, or
3. an unreviewed topic / pain point.

Only categories 1 and 2 may enter the formal four-format compiler.

Category 3 may produce an **ideation preview only**. It must not be described as evidence-grounded content, saved as a formal platform asset, or prepared for publication until it is routed through `/knowledge-discovery` or another evidence review.

Every saved platform asset must include:

```yaml
source_knowledge: ["[[MKC-or-approved-card-id]]"]
publish_approved: false
```

Public release remains a separate human decision.

---

## 🌱 輸入確認

收到主題後，**先輸出確認框**，等大叔確認後再開工：

```
🌱 Cross-Pollinate 確認
────────────────────────
主題：[你理解的主題]
受眾：[視光診所家長 / SaaS 用戶 / 兩者都有]
語氣風格：[目鏡大叔暖心科普 / SaaS 專業說服]
我將同時產出以下 4 種格式的素材。確認後開始？
```

---

## ✍️ 四種格式同步生產

### 格式一：📱 社群 FB 貼文（300-500 字）

**寫作規格**：
- 第一句必須是「直擊痛點」的開場（設問句或衝突句）
- 中段用「目鏡大叔」口吻娓娓道來，有溫度但不失專業
- 結尾加上「行動呼籲 + 診所聯絡資訊佔位元」
- Emoji 適度使用（不超過 5 個）
- 適合在 Facebook 家長社群分享的調性

### 格式二：📧 滴漏行銷 Email（標題 + 正文 200 字以內）

**寫作規格**：
- 信件標題必須有**數字**或**稀缺感**（如：「3 個視光師不敢說的秘密」）
- 開場以「稱謂 + 共鳴」：「您好，身為關心孩子視力的家長，您一定遇過...」
- 正文聚焦在「一個關鍵知識點 + 一個解決方案暗示」
- 結尾 CTA 清晰：「點擊預約 / 回覆此信 / 了解更多」
- 本格式同時適用於：診所回診提醒 / SaaS 用戶啟用通知

### 格式三：💬 門市小幫手話術腳本（3 句問答對話）

**寫作規格**：
- 格式固定為：客人問句 → 建議回覆
- 設計三種不同問法（好奇型、懷疑型、價格抗拒型）
- 回應語氣：親切但有底氣，不低頭也不強迫
- 目的：讓沒有受過專業訓練的店員也能自信應答

```
❓ 情境 1（好奇型）
客人：「你們這個是什麼意思？」
建議回答：「...」

❓ 情境 2（懷疑型）
客人：「真的有用嗎？」
建議回答：「...」

❓ 情境 3（價格抗拒型）
客人：「為什麼這麼貴？」
建議回答：「...」
```

### 格式四：📝 部落格/SEO 大綱（含標題 + 5 個段落架構）

**寫作規格**：
- 標題：必須包含搜尋關鍵字 + 解決方案暗示（如：「兒童近視檢查費用：驗光師告訴你什麼時候該花、什麼時候可以省」）
- 架構：引言（痛點共鳴）→ 專業解析（1-2 段）→ 常見迷思破解（1 段）→ 正確做法（1 段）→ 行動呼籲
- 每段給出 2-3 個要包含的關鍵要點提示
- 適合 Blogger / WordPress 發佈的長文結構

---

## 💾 自動存檔

四種格式全部產出後，**詢問大叔是否一鍵存入知識庫**：
> 我已完成 4 種格式的產製。是否要全部存入 Obsidian？
> 📁 視光相關 → `04-知識卡片` (標籤: `#行銷素材 #cross-pollinate`)
> 📁 SaaS 相關 → `09-SaaS產品與行銷` (標籤: `#行銷素材 #SaaS`)

大叔確認後，呼叫 `create_obsidian_card` 將四種格式整合成一張完整的素材卡片寫入。

---

## 🌀 進階衍生（可選）

如果大叔想繼續，可以追加：
- 「幫這張 FB 貼文配上 `/shadow-qa` 壓測」→ 啟動審查流程
- 「這篇 Email 再幫我出 3 個不同主旨的版本」→ 進行 A/B 變體
