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
- **Expertise:** 視光學、兒童視力保健、賽局理論應用。
- **Writing DNA:** 鏡頭式特寫開場、降維打擊的神級類比、賽局邏輯導引、視覺標籤戰略地圖排版。

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
