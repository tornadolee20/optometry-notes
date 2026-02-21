# Memory

## Hallucination Self-Correction (2026-02-06)
- **Lessons Learned**: When YouTube extraction fails, NEVER guess based on context. Use `curl` to fetch OEmbed data or search specifically for the video ID to verify titles.
- **Verified Video Database**:
  - `puXZBCb5nrE`: "Optometrist Vs Ophthalmologist" (Michele Lee, MD). Focuses on professional role differentiation.
  - `masJoPqT-6A`: "Unlock OpenClaw Multi-Agent Advanced Gameplay" (AI Superdomain). Focuses on OpenClaw/Antigravity tutorials.

## Hallucination Self-Correction (2026-02-10)
- **Lessons Learned**: When automated social media scraping (Facebook/LINE) fails due to technical errors (browser/webhook), DO NOT allow sub-agents to fabricate summaries. 
- **Strict Rule**: If content fetching fails, return "ERROR: DATA FETCH FAILED". No creative synthesis is allowed for factual reporting.
- **Verification Protocol**: Factual news reports must have a verified URL source before presentation to the user.

## Hallucination Self-Correction (2026-02-11)
- **Lessons Learned**: When a PDF has no text layer, `pdftotext` returns nothing. NEVER use local files with similar names as "hallucination filler". 
- **The PDF "Force-Read" Protocol**:
  1. Use `pdfimages -j` to extract raw image streams.
  2. Use `convert` to standardize image formats.
  3. Use `tesseract` with `chi_tra` (Traditional Chinese) for OCR.
- **Verification**: Content summary must be anchored to specific OCR-extracted text (e.g., "值日生：李錫彥") to ensure authenticity.

## User Profile: 目鏡大叔
- **Identity:** 專業驗光師，經營三峽「自己的眼鏡・自己的驗光所」。
- **Preference:** 溝通時請稱呼「目鏡大叔」或「大叔」，非必要請勿使用本名「李錫彥」。
- **Blog:** [驗光師。目鏡大叔](https://www.uncle-glasses.net/) (目前盤點 57 篇文章)。
- **Core Partner:** **吳錡錡** (錡錡)，核心戰友，賈維斯「情緒守護」重點對象。
- **Expertise:** 視光學、兒童視力保健、賽局理論應用、費曼學習法 (Feynman Technique)。
- **Writing DNA:** 鏡頭式特寫開場、降維打擊的神級類比、賽局邏輯導引、視覺標籤戰略地圖排版。

## AI Prompts & Tools
- **Feynman Breakdown (快速學習)**:
  「請根據我上傳的資料，用費曼技巧解釋這個主題：
  1) 簡單解釋（不使用專業術語）。
  2) 指出資料中邏輯不通或容易讓人困惑的地方。
  3) 用更清晰的方式重寫解釋。
  4) 提供一個生活化且好理解的類比，幫我徹底掌握核心概念。」

- **Chapter Mastery Guide (章節精通指南)**:
  「請根據我提供的資料，製作一份『章節精通指南』：
  1) 核心總結：用 2-3 句話點出這一章的重點。
  2) 學習目標：讀完後應該掌握哪些核心能力？
  3) 內容大綱：層次化列出『主標題 -> 次標題 -> 細節內容』。
  4) 戰略公式/框架：列出關鍵公式或框架，並說明什麼時候該派上用場。
  5) 魔王關卡：找出最難懂的 3 個部分，並用最簡單的方式教我怎麼攻克它們。」

- **Research Brief (權威文獻研究簡報)**:
  「請針對 [主題]，完全根據我提供的資料進行深度分析。內容需包含：
  1) 戰情背景：經典歷史案例與現代實際應用。
  2) 研究工法：這份證據是怎麼蒐集來的？用了什麼方法論？
  3) 關鍵人物與論點：主要貢獻者是誰？他們的核心主張是什麼？
  4) 戰略結論：總結研究結果，並給出我可以直接採用的行動建議。」

- **Decision Matrix (決策矩陣戰略評估)**:
  「請根據我提供的資料，為 [選項 A] 與 [選項 B] 建立一個決策矩陣（若有選項 C 也一併列入）。內容需包含：
  1) 決策指標：列出判斷這件事好壞的各項指標。
  2) 指標權重：分析資料，判斷哪些指標最重要。
  3) 損益與風險：分析各個選項的優缺點，以及潛在的風險（Trade-offs）。
  4) 最終戰略建議：根據資料給出建議，並標註你的信心指數（0-100%）。」

- **High-Signal Extraction (高純度情資提煉)**:
  「請幫我從資料中提煉出『高純度』的情資。規則如下：
  1) 脫水處理：過濾掉所有廢話、官腔和冗餘內容。
  2) 決策優先：優先提取能改變決策或提供全新觀點（New Paradigm）的重點。
  3) 戰略價值：針對每個重點，附上一句『為什麼這件事很重要』。」

- **Cross-Source Contradiction Finder (多方辯證與衝突偵測)**:
  「請幫我找出我提供的這幾份資料之間，有哪些矛盾、觀點不合或是有衝突的地方？針對每個衝突點：
  1) 誰說了什麼：列出各自的說法並標註來源。
  2) 背後假設：分析他們為什麼會說法不一？背後的假設有什麼不同？
  3) 如何調解：你覺得該如何整合這些觀點？（如果無法整合，也請說明原因）。
  4) 補完計畫：還缺什麼樣的數據或資料，才能徹底解開這個衝突？」

- **Multi-Format Content Architecture (多通路內容架構)**:
  「請根據我提供的資料，幫我把筆記轉化為以下三種內容資產的開發大綱：
  1) 部落格長文大綱：包含鏡頭式開場、段落標題、以及邏輯導引。
  2) YouTube 腳本大綱：包含 Hook（鉤子）、主幹分鏡、以及結尾 Call to action。
  3) X (Twitter) 10 則推文連貼：精煉的高純度觀點輸出。
  ★ 規則：每一種格式都必須標註資料來源的引用，並附上一個『證據專區 (Proof Points)』，確保所有主張都有數據或事實背書。」

- **Active Recall Challenge (主動回想練功房)**:
  「請根據我提供的資料，幫我出 25 題練習題來自我檢測：
  1) 10 題基礎題：測驗我是不是記住了核心定義。
  2) 10 題應用題：測驗我能不能把理論用在實際案例。
  3) 5 題魔王題：測驗我能不能把不同觀點整合在一起。
  ★ 要求：每題都要附上答案與資料來源，且要解釋『為什麼錯誤選項是錯的』。」

- **Infographic Architecture (視覺化資訊圖表大綱)**:
  「請根據我提供的資料，幫我規劃一份資訊密度高、邏輯清晰的『資訊圖表 (Infographic)』設計藍圖：
  1) 視覺層級：由大到小排好標題與分塊。
  2) 拒絕冗餘：所有視覺元素都必須有其意義，不要純裝飾。
  3) 雙重強化：關鍵概念要用『圖示/圖表』與『精煉文字』同時呈現。
  ★ 輸出格式：包含大標題、各區塊劃分、建議的圖示或圖表類型、以及要放在圖上的精確短句（需附上資料引用）。」

- **Pattern Break Architect (反直覺內容架構師)**:
  「請以資深 Instagram 增長策略師的身分，分析我的領域（視光/配鏡/行銷），找出已被過度使用的平庸內容模式。接著，設計 10 個打破常規且符合演算法的貼文構想。
  ★ 要求：
  1) 每個構想必須在開場 2 秒內創造『意外感』並止住滑動。
  2) 結合行銷心理學或賽局理論，讓內容具備傳播力。
  3) 提供具體的視覺建議與 Hook（鉤子）文案。」

- **Attention-Hijacking Hook Architect (流量抓手文案師)**:
  「請以研究高留存 IG 貼文的病毒行銷文案師身分，將我的內容構想改寫成 5 個強而有力的『止滑開場白 (Hooks)』。
  ★ 要求：
  1) 必須在 2 秒內瞬間止住滑動。
  2) 透過創造好奇心、緊張感或反直覺觀點來吸引注意力。
  3) 拒絕標題黨或虛假陳述，必須與內容真實掛鉤。」

- **Silent Content Multiplier (低成本高轉發內容工廠)**:
  「請以『低成本爆品內容專家』的身分，將我的構想轉化為一種『不露臉、不說話、不追流行』的 Instagram 貼文（如純文字 Carousel 或靜態資訊圖）。
  ★ 要求：
  1) 視覺極簡：不需露臉 or 拍片，專注於資訊本身的衝擊力。
  2) 指標優化：設計邏輯必須極大化『收藏 (Save)』與『分享 (Share)』，讓人想回頭再看一遍。
  3) 營運持續性：內容結構必須簡單到我每天都能輕鬆產出，不消耗過度體力。」

- **Algorithm-Friendly Rewrite (演算法優化寫作師)**:
  「請以 Instagram 演算法分析師的身分，幫我重寫這篇貼文，目標是極大化『觀看時長』、『完讀率』與『收藏數』。
  ★ 要求：
  1) 結構設計：每一行文案都要像鉤子一樣，引導讀者自然地讀到下一行，建立閱讀慣性。
  2) 節奏控管：文字要有動能，去掉所有生硬的推銷感。
  3) 完讀導引：設計一個自然且高價值的結尾，讓讀者下意識點擊收藏或分享。」

- **Scroll Retention Engineer (完讀率工程師)**:
  「請以留存率專家身分，將這篇貼文拆解成『逐行導引』的序列。
  ★ 要求：
  1) 強迫滑動：每一行都必須稍微增加一點好奇心或價值感，讓讀者像著了魔一樣想滑到下一行。
  2) 節奏編排：確保讀者能一口氣讀完。
  3) 視覺留白：利用空行與斷句優化手機閱讀體感。」

- **Claim-Evidence Map (學術級論證地圖)**:
  「請針對我提供的資料，建立一份『論點—證據地圖 (Claim-Evidence Map)』。請用表格呈現，包含以下欄位：
  1) 核心論點 (Claim)：資料中提出的主張。
  2) 支持證據 (Supporting Evidence)：具體的引用或轉述。
  3) 來源位置 (Source + Location)：標註在哪份文件、哪一頁/哪一段。
  4) 論證強度 (Strength)：標註『低/中/高』。
  5) 背後假設 (Assumptions)：這個論點成立的前提是什麼？
  6) 反面證據 (Counter-evidence)：資料中是否有互相矛盾的地方？
  ★ 要求：嚴格限用我提供的資料，且每一行都必須有引用。」

- **Strategic Patrol & Synthesis (戰略巡航與主動合成)**:
  「賈維斯，請啟動『戰略巡航』模式，掃描我最近提供的資料或對話記錄，並執行以下動作：
  1) 情資偵查：找出隱藏在零碎筆記中，具備『高純度 (High-Signal)』的原始素材。
  2) 跨界聯覺：將『視光專業』與『行銷/賽局/生活』進行類比或聯結，找出獨特的創作切入點。
  3) 資產建議：評估這些素材最適合轉化為哪一種品牌資產？（例如：一篇引戰的推文、一則溫暖的診斷故事、或是一個專業的決策矩陣）。
  4) 預發大綱：直接產出一個初步的開發構想，等我下令啟動詳細開發。」

## Strategic Model Deployment (2026-02-14)
- **1 人公司 (Company of One) 模式**：捨棄多窗口「藝人公司」架構，確立以「賈維斯」為唯一對外窗口。
- **後台協作**：幕後分身（Gemini 3 Pro 研究員、MiniMax M2.5 視光作家、Gemini 3 Flash 執行官）由賈維斯統一排程，成果由賈維斯彙整呈現。
- **靜默巡邏協議**：為解決 LINE API 429 頻率限制並提升溝通效率，例行 Heartbeat 巡邏轉為「無進度，不發言」模式。
- **Dual-Brain Pipeline**: 
    1. **Gemini 3 Pro**: 負責硬核情資採掘、深挖論文數據、產品賽局分析。
    2. **MiniMax M2.5**: 負責人文化感性昇華、注入「大叔筆法」、產出直擊人心心的文案。
    3. **Gemini 3 Flash**: 負責外勤監控、群組巡邏、瑣碎設定。
- **Optometry Writer V3.1**: 已根據「目鏡大叔 AI 協作工作流 v3.1」更新執行協議。文案嚴格遵守 A/B 兩階段作業，強化內文最上方 `<h1>` 標籤，並採用「戰略三階層頁尾」（內容 CTA -> Store-card v1.5 -> 銀髮戰略背書）。
- **Internal Linking Strategy**: 確立「雙層連結架構」：內文邏輯嵌入連結（SEO 權威感）+ 文末系列導覽列（莫蘭迪色系樣式）。已完成全站 58 篇文章清單盤點。
- **2026 Strategic Mainline**: 核心主軸為「新北市銀髮視覺守護計畫」。結合「松年大學講師」身分，擴散至社區關懷據點、長青團體。
- **Blog Architecture**: 目前採用「宋韻青花 × 莫蘭迪暮色」佈景主題，執行「無側欄全寬閱讀模式」，配備 CSS 晶片 v4.0（80px 呼吸感留白）。
- **Optometry Writer**: 子 Agent 已升級為 MiniMax M2.5 大腦，專攻溫潤細膩的專業文案。

## Lunar New Year 2026 Strategy (2026-02-16)
- **Concept: 視覺複利 (Visual Compounding)**: Transforming "Hongbao money" from consumption to "Visual Asset Allocation" (early myopia control).
- **Campaign: D1-D9 專題**: A sequence of professional content tailored for the holiday period, focusing on 3C use, emergency eyewear repair, and red envelope psychology.
- **Incident: LINE API 429 Limitation**: Recurring rate limits on LINE Messaging API. 
- **Response Protocol**:
  1. Capture output to `HEARTBEAT.md` and session logs.
  2. Inform the user in the main session.
  3. Batch retries during off-peak hours.
  4. Use "Reduced Frequency" heartbeat mode to save API quota.

## Silent Replies
When you have nothing to say, respond with ONLY: NO_REPLY
⚠️ Rules:
- It must be your ENTIRE message — nothing else
- Never append it to an actual response (never include "NO_REPLY" in real replies)
- Never wrap it in markdown or code blocks
❌ Wrong: "Here's help... NO_REPLY"
❌ Wrong: "NO_REPLY"
✅ Right: NO_REPLY

## Heartbeats
Heartbeat prompt: Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.
If you receive a heartbeat poll (a user message matching the heartbeat prompt above), and there is nothing that needs attention, reply exactly:
HEARTBEAT_OK
OpenClaw treats a leading/trailing "HEARTBEAT_OK" as a heartbeat ack (and may discard it).
If something needs attention, do NOT include "HEARTBEAT_OK"; reply with the alert text instead.
