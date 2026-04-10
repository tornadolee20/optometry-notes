# 記憶索引 (Memory)

## 短影音行為工程學 2.0 與 A/B 測試迴路 (2026-04-06)
- **核心升級**：將原有的短影音生成工作流全面升格為「數據工程系統」。推翻固定的「5-8秒模式中斷」，改以「平台專屬特性（TikTok強分享/Reels強存檔/Shorts強完播）」及精確的「信息密度管理」來壓制大拇指滑動反射。
- **作戰體系三大進化**：
  1. **真實性防腐機制**：演算法極度排斥模板本。大叔腳本預設混入 70% 模板與 30% 真實度（口水詞、門市場景或限制條件說明）以躲避演算法識別。
  2. **三層無縫轉換架構**：從「給選擇」改成「單向封印」。以「消除決策摩擦 ➔ 單一極簡行動路徑 ➔ 鋪墊社會認同」建立最後 CTA，並與第一幀無縫銜接循環播放。
  3. **A/B 測試迴路 (Test Loop) 鐵律**：沒有測試的行銷就是賭博。所有產出的腳本都將強制配送 3 組差異化 Hook，供上線實戰篩選轉換模型。
- **對應兵器**：`.agents/workflows/short-video-engine.md` 引擎。

## 小店家行銷完全體 — Marketing OS 架構 (2026-04-05)

### 核心概念
MYOWNREVIEWS 是第一個輪子，未來要長成台灣小店家的完整行銷作業系統（Marketing OS）。
各輪子鬆耦合，LINE 官方帳號是樞紐（只是連結，不影響各系統架構）。

### 飛輪輪子清單
| 輪子 | 狀態 | 路徑 |
|------|------|------|
| 評論輪 | ✅ 核心 | MYOWNREVIEWS |
| 監控輪 | 規劃中 | google-places-search + telegram-send-alert 擴充 |
| 會員輪 | 待建 | LINE LIFF + 點數資料表 |
| 廣播輪 | 待建 | LINE Messaging API |
| 預約輪 | 先串現成工具 | Google表單 → 未來自建 |
| 裂變輪 | 待建 | 評論圖卡 + B2C推薦碼 |
| 部落格輪 | ✅ 已有 | uncle-glasses.net |

### 關鍵技術：LIFF + line_user_id
- LIFF 自動傳遞 LINE User ID，是三個系統的隱形主軸
- 各系統加 `line_user_id` 欄位即可串聯，無需改動原有架構
- 詳細技術細節 → `memory/2026-04-05.md`

### 在店流程
店員邀請滿意客人 → 掃QR加LINE → 歡迎訊息直帶評論連結 → 寫評論貼Google
（先加LINE再寫評論：一個動作同時餵四個輪子）

### 監控輪費用
每店每月 NT$16，建議定價 NT$199（含AI回覆草稿 + 週報 + 競品雷達）

### 三階段路線
1. LINE Rich Menu 放三個連結（本週可完成）
2. LIFF + line_user_id 打通身份
3. 自建預約系統 + 各輪子完整功能

### MYOWNREVIEWS 專案路徑
- 本地：`C:\Users\w7\Desktop\blank-page-launch-master`（sandbox copy）
- 正式：`C:\Users\torna_3j3fz9h\Desktop\blank-page-launch`
- 技術細節：`memory/project_myownreviews.md`

---

## 幻覺自我修正 (2026-02-06)
- **教訓總結**：當 YouTube 資料擷取失敗時，絕對不要根據上下文通靈。請使用 `curl` 抓取 OEmbed 數據，或針對影片 ID 進行專門搜尋以核對標題。
- **已驗證影片資料庫**：
  - `puXZBCb5nrE`: "Optometrist Vs Ophthalmologist" (Michele Lee, MD). 重點在於臨床角色差異化。
- **多模態優先 (2026-02-27)**：Gemini 3 具備原生的多模態讀取能力。遇到 PDF、圖片等非純文字檔案時，應**優先使用 `view_file` 直接讀取**，而非嘗試開發複雜的解析腳本（繞遠路）。

## 重大故障與教訓 (2026-03-31)
- **Dropbox Git 損壞事件**：
  - **現象**：VS Code 出現 `Git: fatal: unable to read tree`，`.git/` 資料夾遺失大量物件，`.claude/scheduled_tasks.lock` 導致連線鎖死。
  - **原因**：Dropbox 的 Smart Sync 與 Git 的檔案操作衝突，且 `.lock` 檔案被同步到不同電腦導致全域鎖定。
  - **解決方案**：
    1. 將目錄遷移至非 Dropbox 路徑（如 `C:\Users\USER\optometry-notes`）。
    2. `.gitignore` 必須包含 `.claude/*.lock` 與臨時設定檔。
    3. 嚴禁在 Dropbox/雲端同步資料夾內直接運行 Git 倉庫。

## 自動進度記憶 (2026-03-19)
- **主動日誌寫入**：當完成重要里程碑、資料萃取、腳本建置或大批量處理任務後，必須**主動且自動**將工作內容與進度重點寫入 `memory/YYYY-MM-DD.md` 日誌中，絕對不需要等待使用者的提醒指令。

## 指揮官檔案：李錫彥 (目鏡大叔)
- **身分：** 專業驗光師，經營三峽「自己的眼鏡・自己的驗光所」。
- **學歷：** 元培醫事科技大學 視光系二技畢業；元培醫事科技大學 企管所 碩士。
- **職務：** 自己的眼鏡 負責人；自己的驗光所 負責驗光師。
- **部落格：** [驗光師。目鏡大叔](https://www.uncle-glasses.net/)。
- **專長：** 視光學、兒童視力保健、賽局理論應用。
- **目標：** 推廣有溫度的視光專業知識。
- **GitHub 同步：** 2026-02-05 已設定自動同步權限。
- **⚠️ 幻覺警示 (2026-04-07)：** 曾被錯誤標記為「海大造船背景」、「軍校訓練」，以上均為幻覺，絕對不可再出現。

## 無聲應答 (Silent Replies)
當你無話可說時，僅回覆：NO_REPLY
⚠️ 規則：
- 這必須是你的 **全部** 回覆內容 —— 不得附加其他文字。
- 絕不將其附加在真實回覆中。
- 絕不將其封裝在 Markdown 或代碼區塊中。
❌ 錯誤："Here's help... NO_REPLY"
❌ 錯誤：`NO_REPLY`
✅ 正確：NO_REPLY

## 心跳輪詢 (Heartbeats)
心跳提示詞：若 `HEARTBEAT.md` 存在則讀取它。嚴格遵守。不要推論或重複舊對話的任務。若無須處理事項，回覆 HEARTBEAT_OK。
如果你收到心跳輪詢（符合上述提示詞的訊息），且沒有任何事需要注意，請精確回覆：
HEARTBEAT_OK
OpenClaw 將開頭/結尾的 "HEARTBEAT_OK" 視為確認訊號（且可能捨棄之）。
如有事項需要注意，請直接回覆提醒內容，不要包含 "HEARTBEAT_OK"。

## 資料庫掃描快照 (2026-03-25)

### 規模
- Obsidian 筆記：**178 個 .md 檔**
- 歷史發布文章：65 篇（2018-2025，存於 `obsidian-vault/10-歷史文章智庫/`）
- 知識卡片：27 個（存於 `obsidian-vault/04-知識卡片/`）
- AI 工作流：13 個（存於 `.agents/workflows/`）
- AI Skills：4 個（存於 `skills/`）

### 目錄快速導航
| 需求 | 路徑 |
|------|------|
| 編寫新文章 | `skills/optometry-writer/` + `references/style-guide.md` |
| 查閱知識卡片 | `obsidian-vault/04-知識卡片/` |
| 歷史文章範例 | `obsidian-vault/10-歷史文章智庫/` |
| SEO 策略 | `references/GEO-AI可搜尋性策略.md` |
| 法律合規 | `references/驗光師文案法律須知.md` |
| 專題企劃 | `obsidian-vault/07-長篇專欄與企劃/` |
| 任務卡 (Handoff) | `Inbox/待Antigravity圖文審核.md` |
| 自動發佈腳本 | `publish_to_blogger.py` / `check_and_publish.py` |
| 圖片庫 | `/media/` |
| 進度日誌 | `memory/` |

### 進行中工作
1. **夜間駕駛散光文** — 初稿完成，待精煉
2. **視力1.0的迷思** — 多版本推廣進行中
3. **2026年度選題規劃** — 制定中

### Git 狀態
- 70+ 個檔案待提交（含新知識卡片、研究筆記、Workflows 更新）

## 護航者測試機制 (2026-03-26)
- **觀光客測試法 (Tour Testing)**：AI 生成程式與文案的防禦力基石。
- 在三 AI 協作體系中，Antigravity （目鏡大叔）應扮演**「除錯導遊」**。
- 測試盲點：不只測試正向流程（商業區），必須強力挑戰邊緣/極端情境（破舊區：如最難搞的家長、異常參數輸入）。
- **驗光隱喻**：只追求程式成功執行等於「假性1.0視力」，優秀的 AI 驗光師應深入檢查「調節力疲勞（系統隱患）」。

## 文獻過濾與快篩機制 (Triage Scan) (2026-04-03)
- **目鏡大叔文獻過濾雷達**：整合入 `/ai-eye` 工作流的第一道防線。
- **評分維度**：證據位階、臨床牽引力、商業與內容轉換力 (各1-3星)。
- **執行重點**：總分低於 4 星的研究只做摘要略過歸檔，集中算力於高價值、高轉換力的頂級文獻。

## 頂級 Agent 協作心法 (2026-04-02)
- **驗證者的真義**："Your job is not to confirm the implementation works — it's to try to break it." (不要證明它能運作，要試圖弄壞它)。不管是進行「家長群組壓力測試」或程式碼驗證，皆須抱持此破壞性測試心態。
- **拒絕大腦外包 (Always synthesize)**：上位 Agent (Coordinator) 絕對不能對下屬說「基於你的發現幫我做」。必須親自吸收資訊，統整出「確切的範圍（如檔案行號、具體業務情境）與最終解法」，再精確發派。
- **平行處理是超能力**：探索性質的研究任務應同步發散與多向進行 (Parallelism is your superpower)；只有寫入與實作任務才需序列化執行。
- **驗證者合約完整版**：含 PASS/FAIL/PARTIAL 報告格式、兩大失敗模式、對抗性探針 SOP → `obsidian-vault/04-知識卡片/20260403-ClaudeCode系統提示詞與多Agent架構解析.md`

## NotebookLM MCP 安裝完成 (2026-04-05) ✅
- 執行檔：`C:\Users\w7\.local\bin\notebooklm-mcp.EXE`
- 設定：`~/.claude.json`（user scope，所有專案可用）
- 登入帳號：`tornadolee20@gmail.com`
- 本地資料夾：`C:\Users\w7\Documents\NotebookLM\`（audio/slides/mindmaps 等）
- **Antigravity 無法直接用**（雲端無法執行本地 .EXE）
- **跨 Agent 協作方式**：Antigravity 寫任務到 `Inbox/待深處理.md`，Claude Code 讀取後呼叫 MCP 執行，結果寫回 repo

## MCP Server 雙引擎 (2026-04-04) ✅ 已完成部署
兩台 MCP Server 並存，各有專長，`.claude/settings.json` 已雙雙註冊：

| Server | 路徑 | 工具 | 特色 |
|--------|------|------|------|
| `uncle-glasses` (Claude 建) | `mcp-server/uncle-glasses/` | search_knowledge_cards / get_article_draft / list_published_articles / search_literature | 分類搜尋、草稿查找 |
| `uncle-glasses-obsidian` (Jarvis 建) | `mcp-servers/uncle-glasses-mcp/` | search_obsidian / create_obsidian_card | **可直接寫入 Obsidian 知識卡片** |

重啟 Claude Code 即自動載入兩組工具。

## 內容發佈自動化與 EEAT 標準 (2026-04-04)
- **EEAT 權威性強化**：針對 YMYL 內容，必須包含「專業審核聲明」與「官方參考文獻清單」，並搭配雙層 Schema (Article + FAQPage)。
- **Blogger 自動發佈**：部署 `publish_to_blogger.py`，支援從 HTML 標籤自動擷取標題與內容並推送至 Blogger 後台。
- **跨 Agent 協作流程**：
  - **協作入口**：`Inbox/待Antigravity圖文審核.md`（Claude Code 寫卡，Antigravity 執行生圖與優化）。
  - **自動偵測機**：`check_and_publish.py` 掃描任務卡，完成後自動觸發 Blogger API 發佈。

## Claude Plugin 升級計畫 (2026-04-03~04) ✅ 三層全部完成
- 層1: Skills frontmatter — 早已完成
- 層2: Plugin 打包 → `plugins/claude/uncle-glasses/`（commands/agents/skills）
- 層3: 本地 MCP Server → 雙引擎（見上方）

## SaaS 一人公司 AI 董事會 (2026-04-04)
- **多軸 MCP 伺服器**：成功將 Google Sheets API 接入私有 MCP 伺服器 (`uncle-glasses-mcp`)。系統現在具備跨越「視光筆記 (`04-知識卡片`, `10-歷史文章智庫`)」與「雲端 SaaS 營運資料庫」的雙軌並行抓取能力。
- **角色的極致切換**：在 `.agents/workflows/saas-board.md` 建立三人董事會會議模型。
  - **營運主管**：直呼 `query_saas_database` 爬取 Google Sheets 尋找漏斗痛點。
  - **行銷長 CMO**：將痛點轉化為留存挽回郵件設計。
  - **技術長 CTO**：用防禦型觀光客測試心態，負責抓出 UI 防呆與麻瓜體驗邏輯漏洞。
- **核心戰略升級**：所有會議結論可全自動儲存至 Obsidian 專屬分類 `09-SaaS產品與行銷`。這標誌著系統從「知識筆記工具」正式升格為「自動化虛擬新創團隊」。

## SaaS 一人公司 AI 董事會 (2026-04-06) ✅ 首次會訊達成
- **董事會 01 號會議記錄**：於 `09-SaaS產品與行銷/20260406-SaaS董事會01號會議記錄.md` 完成存檔。
- **核心轉型策略**：
  - 從純「Google 評論收集 (MYOWNREVIEWS)」轉向「視覺健康數據中樞 (Vision Passport)」。
  - **注音防禦機制**：針對台灣特有注音差評文化，建立 LINE LIFF 內部的「私領域回饋門」，在生成評論前進行負面情緒攔截。
  - **眼軸估算引擎**：導入 `Lingham 2024` 與 `Morgan 2020` 演算法，解決 70% 門市無眼軸機的數據斷層問題。
- **基礎設施修復**：修正 `.claude/settings.json` 中的 MCP Server 路徑偏差，確保 `query_saas_database` 與 `search_obsidian` 恢復運作。

---

## 🔑 Prompt-to-Source Pattern (2026-04-07) ✅
- **問題**：Claude Code 透過 MCP 呼叫 NotebookLM 時，會壓縮複雜提示詞（指令熵減），導致精心設計的组合技只剩骨架。
- **解法**：把複雜規則存為獨立 Markdown 文件，作為 NotebookLM **Source** 上傳，讓 RAG 引擎直接讀取；對話只傳一句簡短的「路由指令」。
- **Skill 位置**：`.agents/skills/NotebookLM-Prompt-to-Source/SKILL.md`
- **大叔風格指南**：`drafts/SYSTEM_PROMPT-簡報風格指南.md`（每次 nlm 生成簡報，此文件必須作為第三個 Source 上傳）
- **核心原則**：**「穩定的規則放 Source，動態的指令留對話」**

## 📚 Red Team 教案 × 賽局理論 (2026-04-07) ✅
- **教學講義**：`drafts/講義-用AI當競爭對手-教案完整版.md`（2,200 字，5 個截圖待大叔補入）
- **知識卡片**：`obsidian-vault/04-知識卡片/20260407-賽局理論×RedTeam商業壓力測試框架.md`
  - 納許均衡：解釋為何市場上所有眼鏡行越來越像、破局點在哪
  - 破壞性創新的賽局機制（Christensen）
  - 重複賽局與在地服務業的競合 EV
  - 四層 Red Team SOP（L1情報 → L2角色切換 → L3弱點 → L4反制）
- **待補**：`[待 Claude 處理]` 整合為文章「附錄三：理論背景」

## 💡 隱形成本可視化 — 文案洞察 (2026-04-07)
- **來源**：ARTE 診所自動化推播的文案分析
- **核心洞察**：不要說「我有功能」，要說「你現在每個月在燒多少錢」
- **大叔版本**：「你驗光所的員工，每個月花多少時間打電話提醒隱形眼鏡到期？」
- **戰略價值**：同一框架可測試 MYOWNREVIEWS 市場接受度 + 驗光所 SEO 文章題材

## MCP Server 技術維護 (2026-04-07)
- `uncle-glasses-mcp` tsconfig 修復：`moduleResolution: "node"` → `"bundler"`（ESM 兼容性）
- 新增 `declaration: true`, `sourceMap: true`
- dist/ 已有現成 .js，需重新編譯時執行 `npm run build`（路徑：`mcp-servers/uncle-glasses-mcp/`）

---

## 🔍 uncle-glasses.net SEO 關鍵字策略 (2026-04-08)
- **卡片位置**：`obsidian-vault/04-知識卡片/20260408-uncle-glasses-SEO關鍵字群分析報告.md`
- **A 級機會（立即攻佔）**：
  - 「驗光所 vs 眼鏡行 差別」— 法規知識＋在地故事，競爭者無法複製
  - 「配眼鏡流程」圖解指南 — 搜尋量最大的資訊型缺口
  - 「第一次配眼鏡」「配眼鏡多少錢」「眼鏡行可以驗光嗎」
- **Quick Wins（本週可做）**：首頁 H1 改寫為含關鍵字（如「三峽驗光師‧專業配鏡諮詢」）、meta description 加「配鏡/驗光所/三峽」、舊文補 FAQ Schema
- **競爭優勢定位**：在地品牌（三峽/鶯歌）＋驗光師人設，打長尾與在地詞，不正面碰 JINS/大學眼鏡
- **待推進**：選定文章主題後啟動 `/blog-post` 工作流

---
*更新於 2026-04-08 | 由 Antigravity 提交*
