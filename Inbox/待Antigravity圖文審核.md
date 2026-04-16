# 待 Antigravity 圖文審核佇列

> Claude Code 完成 HTML 初稿後，寫任務卡到這裡。
> Antigravity 處理完畢後，回填「Antigravity 完成區」並將 HTML 中的佔位符替換為實際值。
> Claude Code 偵測到 `[x]` 全打勾後，自動執行 `python publish_to_blogger.py`。

---

## 任務格式說明

```
## [YYYYMMDD] 任務標題

### Claude Code 提交
- 文章路徑：`content-planning/xxx.html`
- 圖片佔位符：文章中需替換的字串（預設 `PLACEHOLDER_IMAGE_URL`）
- 當前標題（待審）：xxx
- 圖片生成 prompt：（給 Antigravity 的圖片描述，英文）
- 建議圖片英文檔名：xxx.jpg

### Antigravity 完成區
- [ ] /title-optimizer 執行完畢，終極標題已定稿
- [ ] 圖片已生成並上傳，URL 已取得
- [ ] HTML 已更新（佔位符已替換、標題已同步）
- 終極標題：
- 圖片 URL：
- 完成時間：
```

---

## [20260410] 規則更新：臉書手機版 + Threads 串文自動輸出

> **任務類型**：規則內化（無需產出，只需確認已讀）
> **發起者**：Claude Code
> **執行者**：Antigravity

### 規則說明

從現在起，每次執行 `/blog-post` 工作流後，**必須自動輸出以下兩個額外版本**（不等大叔提醒）：

| 版本 | 存放路徑 | 字數 |
|------|---------|------|
| 臉書手機版 | `content-planning/{文章名稱}-FB版.txt` | 350～500 字 |
| Threads 串文版 | `content-planning/{文章名稱}-Threads版.txt` | 3～5 則，每則≤500字元 |

### 臉書版核心規則（記住）

- 純文字，禁用 Markdown，一句一行（≤18字）
- 子標題用 `◾` 開頭
- 蔡格尼節奏：每行製造「未完成感」，眼睛自動往下滑
- 結構：鉤子（前3行攔截）→ 中段堆疊 → 轉折句 → 問句結尾
- 禁用「——」破折號、AI 感套話

### Threads 版核心規則（記住）

- 每則 `【1/4】` 標示，3～5 則
- 每則一個焦點，不用 `◾`
- Hashtag 只放最後一則（3～5 個）
- 結構：第1則鉤子 → 第2則故事 → 第3則洞察 → 最後一則 CTA+Hashtag

完整規範在 `blog-post.md` 第六步，以及 `memory/claude-auto-memory-feedback_facebook_format.md`。

### Antigravity 確認區
- [x] 已讀，規則已內化，下次 /blog-post 自動執行

---

## [20260409] GBP 貼文月曆執行 — 4月後半＋5月規劃

> **任務類型**：策略執行（非圖文審核）
> **發起者**：Claude Code（大叔與 Claude 討論後產出）
> **執行者**：Antigravity

### 任務背景
大叔想把 Google 在地商家（GBP）的貼文變成系統化工作流。
GBP 貼文會顯示在 Knowledge Panel 與搜尋結果，受眾有主動意圖，轉換率高。
競爭者幾乎無人在做，現在進場是快速建立優勢的時機。

### 核心策略
- 每週 1 篇「最新動態」型貼文（圖 + 前兩行植關鍵字 + CTA）
- 關鍵字以 SEO A 級機會詞為主：「三峽驗光所」「配眼鏡流程」「驗光所 vs 眼鏡行」
- 口吻：沉穩專業，帶在地感，不說廢話

### 月曆框架（循環）
| 週次 | 主題類型 | 目的 |
|------|---------|------|
| 第 1 週 | 衛教知識（法規/專業差異） | 建立權威 |
| 第 2 週 | 在地故事 / 客人案例（匿名） | 建立信任 |
| 第 3 週 | 季節提醒（開學/節氣/假期） | 捕捉搜尋高峰 |
| 第 4 週 | 服務 / 鏡框鏡片特寫 | 轉換 |

### Antigravity 待完成清單

#### Step 1：產出 4 篇貼文草稿（4 月後半）

- [ ] **W2（4/9-4/13）— 在地故事**
  - 主題：「為什麼我選擇在三峽開驗光所，而不是眼鏡行？」
  - 關鍵字植入：三峽驗光師、專業驗光、自費驗光
  - 字數：120-180字（GBP 最佳長度）
  - CTA：「想了解驗光所與眼鏡行的差別，歡迎私訊或來店諮詢」

- [ ] **W3（4/14-4/20）— 季節提醒**
  - 主題：兒童視力篩檢季提醒（學期中段，家長開始焦慮）
  - 關鍵字植入：兒童視力、近視控制、三峽驗光所
  - CTA：連結預約或電話

- [ ] **W4（4/21-4/27）— 服務特寫**
  - 主題：配鏡流程圖解（搭配流程圖或診所照片）
  - 關鍵字植入：配眼鏡流程、專業驗光、三峽配鏡
  - 對應 SEO A 級關鍵字「配眼鏡流程」

- [ ] **W5（4/28-5/4）— 衛教知識（跨五一連假）**
  - 主題：連假出遊護眼提醒（UV、藍光、過敏）
  - 節氣鉤子：五一勞動節連假

#### Step 2：圖片規格
- 建議尺寸：1200×900px（4:3）或 1080×1080px（1:1）
- 每篇需一張圖，文字不超過圖片 20%
- 請為每篇草稿附上圖片 prompt（英文），供 AI 生成或大叔拍照參考

#### Step 3：回填至此任務卡
完成後在對應項目打 `[x]`，並填入貼文全文（可直接複製貼到 GBP 後台）與圖片 prompt。

### Antigravity 完成區
- [x] W2 草稿完成
- [x] W3 草稿完成
- [x] W4 草稿完成
- [x] W5 草稿完成
- [x] 圖片 prompt 全部附上
- **完成時間**：2026-04-09 01:36

---
#### 📄 貼文草稿與 Prompt 區

**W2（4/9-4/13）— 在地故事**
> 很多人問我，為什麼要在三峽開一間純粹的「驗光所」，而不是像傳統眼鏡行一樣擺滿鏡框？
> 作為有國家執照的三峽驗光師，我深知精準的視覺不能只靠幾分鐘的機器測量。我們提供專屬的自費驗光服務，花足夠的時間，去釐清每一雙眼睛的真實需求，給予最適合的光學方案，而不只是單純銷售商品。提供專業驗光，找回你應有的視覺品質。
> 想了解驗光所與眼鏡行的差別，歡迎私訊或來店諮詢！
- **圖片 Prompt**：Close-up profile of a professional Asian male optometrist intently looking through a modern phoropter (refracting instrument) in a clinical but warm environment. No eyeglass frames in the background. Cinematic, professional medical photography, high resolution, 4:3 aspect ratio.

**W3（4/14-4/20）— 季節提醒**
> 學期過了一半，孩子看黑板開始會瞇眼了嗎？每到期中檢查，許多家長才驚覺兒童視力出現變化。
> 視力發展是和時間賽跑，及早發現並介入，才能有效進行近視控制。三峽驗光所提醒您：別等拿到學校的視力不良單才緊張！利用週末帶孩子進行完整的視覺檢查，確認度數是否穩定。專屬預約制，給孩子最安心的檢查環境。
> 立即點擊下方連結預約，或來電由專人為您安排時間。
- **圖片 Prompt**：A soft, heartwarming photo of a caring Asian male optometrist gently examining a young child's eyes using an ophthalmoscope. The clinic is brightly lit and welcoming. Natural lighting, shallow depth of field. Professional healthcare photography, 4:3 aspect ratio.

**W4（4/21-4/27）— 服務特寫**
> 想要一副真正舒服的眼鏡，關鍵不在名牌鏡框，而在背後的「配眼鏡流程」。
> 在我們的三峽驗光所，專業驗光絕不是五分鐘看圖表。我們堅持完整的視覺評估：從問診了解用眼習慣、精密儀器測量、雙眼視機能分析，到最後的光學處方建議。每一個步驟，都為了確保你的眼睛與鏡片完美契合。不要讓敷衍的檢查，變成你日後頭暈疲累的源頭。
> 想要體驗三峽配鏡的專業講究？立刻預約，為自己量身訂做專屬視覺方案！
- **圖片 Prompt**：A clean, modern infographic layout split into four neat square panels representing a professional optometry process. The minimalist icons represent: Consultation, Eye Exam, Vision Analysis, and Final Prescription. Professional blue, white, and grey color palette. High quality digital design, clear and informative, 4:3 aspect ratio.

**W5（4/28-5/4）— 衛教知識（跨五一連假）**
> 五一連假即將到來，全家準備出遊了嗎？享受陽光的同時，別忘了眼睛也需要防曬！
> 過量的紫外線（UV）是造成白內障與黃斑部病變的元兇之一。出門踏青，請務必戴上具備抗 UV 功能的太陽眼鏡。如果連假是窩在家追劇打電動，也要注意環境光源，適時休息，避免藍光引發眼睛疲勞。春夏季交替也容易引發過敏性結膜炎，若眼睛紅癢千萬別揉。
> 放假前，來幫眼鏡做個保養吧！祝大家假期愉快，視界清晰！
- **圖片 Prompt**：A vibrant, sunny lifestyle photo of a stylish pair of UV protection sunglasses resting on a checkered picnic blanket in a lush green park. Out of focus in the background, a happy family is having a picnic. Bright, cheerful colors, capturing the feeling of an outdoor spring holiday. High resolution, 4:3 aspect ratio.

---

## [20260404] 高齡駕駛視覺安全－115換照新制

### Claude Code 提交
- **文章路徑**：`content-planning/高齡駕駛視覺安全-115換照新制.html`
- **圖片佔位符**：`../media/senior-driving-vision-safety-glare.png`
- **當前標題（待審）**：115年高齡換照下修70歲！驗光師說：換照之前，先換眼睛的「行車執照」
- **核心主題**：專業視光科普
- **目標讀者**：70歲以上長輩的子女、正在協助長輩辦換照的家人
- **圖片生成 prompt**：
  Realistic photo of an elderly man driving at night in heavy rain, first-person dashboard perspective. Oncoming headlights appear as large, blurry halos and starbursts — simulating cataract glare. Wet road surface reflects light. Mood is tense and slightly unsettling. No text overlay. Cinematic, photorealistic.
- **建議圖片英文檔名**：`senior-driving-cataract-glare-night-rain.jpg`
- **SEO 補充說明**：文章強攻「高齡換照」「70歲換照」「白內障開車」關鍵字，圖片 alt text 建議帶入「高齡駕駛夜間眩光 白內障 換照視力」

### Antigravity 完成區
- [x] `/title-optimizer` 執行完畢，終極標題已定稿
- [x] 圖片已生成並上傳，URL 已取得
- [x] HTML 已更新（圖片 URL 已替換、標題與 Schema 已同步）
- **終極標題**：115年高齡換照下修70歲！驗光師：換照之前，先帶長輩檢查眼睛的「行車執照」
- **建議標籤（Blogger Label）**：專業視光科普, 高齡視力, 換照新制, 三峽驗光師
- **圖片 URL**：../media/senior-driving-cataract-glare-night-rain.png
- **完成時間**：2026-04-04 20:25

---
