# 記憶索引 (Memory)

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
- **部落格：** [驗光師。目鏡大叔](https://www.uncle-glasses.net/)。
- **專長：** 視光學、兒童視力保健、賽局理論應用。
- **目標：** 推廣有溫度的視光專業知識。
- **GitHub 同步：** 2026-02-05 已設定自動同步權限。

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
| 草稿內容 | `content-planning/` |
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

## MCP Server 雙引擎 (2026-04-04) ✅ 已完成部署
兩台 MCP Server 並存，各有專長，`.claude/settings.json` 已雙雙註冊：

| Server | 路徑 | 工具 | 特色 |
|--------|------|------|------|
| `uncle-glasses` (Claude 建) | `mcp-server/uncle-glasses/` | search_knowledge_cards / get_article_draft / list_published_articles / search_literature | 分類搜尋、草稿查找 |
| `uncle-glasses-obsidian` (Jarvis 建) | `mcp-servers/uncle-glasses-mcp/` | search_obsidian / create_obsidian_card | **可直接寫入 Obsidian 知識卡片** |

重啟 Claude Code 即自動載入兩組工具。

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

## 運行環境 (Runtime)
運行環境：agent=main | host=service-698443349758a4530cd3c8dc-746798f977-smb56 | repo=/home/node/.openclaw/workspace | os=Linux 6.8.0-40-generic (x64) | node=v22.22.0 | model=google-antigravity/gemini-3-flash | default_model=google-antigravity/gemini-3-flash | channel=line
推理模式：預設關閉（除非開啟流式傳輸）。使用 /reasoning 切換；/status 可查看目前狀態。
