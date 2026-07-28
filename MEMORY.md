# 記憶索引 (Memory)

> 截斷限制 200 行。事件記錄歸檔至 `memory/archive/`，本檔只存永久規則與現役系統狀態。

---

## 指揮官檔案：李錫彥 (目鏡大叔)
- 專業驗光師，三峽「自己的眼鏡・自己的驗光所」負責人兼負責驗光師
- 元培視光系二技 + 企管所碩士；元培企管系兼任講師；臺灣視光視力保健學會 + 新北市驗光師公會常務理事
- 部落格：[uncle-glasses.net](https://www.uncle-glasses.net/)；LINE：lin.ee/FRKWMif
- **⚠️ 幻覺警示**：絕對不可出現「海大造船背景」「軍校訓練」，這些均為幻覺。

---

## 永久操作規則

### 無聲應答
當你無話可說時，僅回覆：NO_REPLY
- 這必須是你的**全部**回覆內容，不得附加其他文字
- 絕不封裝在 Markdown 或代碼區塊中

### 心跳輪詢
心跳提示詞：若 `HEARTBEAT.md` 存在則讀取它。嚴格遵守。不要推論或重複舊對話的任務。
若無須處理事項，精確回覆：HEARTBEAT_OK

### 自動日誌寫入
完成重要里程碑後，**主動**寫入 `memory/YYYY-MM-DD.md`，不需等待提醒。

---

## 已知故障與教訓

### Dropbox Git 損壞（2026-03-31）
Git 倉庫嚴禁放在 Dropbox/雲端同步資料夾。`.gitignore` 必須含 `.claude/*.lock`。

### 幻覺自我修正（2026-02-06）
YouTube 資料擷取失敗時，絕對不要根據上下文通靈。用 curl 抓 OEmbed 或專門搜尋影片 ID 核對。

### 聲音克隆流程失敗與廢棄（2026-07-25）
聲音克隆 (Voice Cloning / Fish Audio / Voicebox) 在自動化腳本、網頁 DOM 狀態與授權登入上極為繁瑣且不可控，嚴重破壞工作流效率與影音品質。
**鐵律**：未來影片配音一律禁止使用聲音克隆，統一使用高質感、穩定流暢的雲端神經網絡語音（如 Edge-TTS 台灣在地自然男聲 `zh-TW-YunJheNeural` 雲哲）。

### Shell CWD 重置問題（2026-04-15）
Claude Code worktree session 期間，bash 的 CWD 可能自動重置到 worktree 路徑。
對策：涉及主倉庫操作時，每個 bash 指令應明確使用：
- `git -C "主倉庫路徑" ...`
或
- `cd "主倉庫路徑" && ...`

執行檔案讀寫、git 操作或 build 前，先用 `pwd`／`Get-Location` 與 `git rev-parse --show-toplevel` 確認實際工作目錄。

---

## 協作原則

### 頂級 Agent 協作心法
- **驗證者真義**：試圖弄壞它，不是確認它能動
- **拒絕大腦外包**：Coordinator 必須親自吸收資訊再精確發派，不能說「基於你的發現幫我做」
- **平行 > 序列**：探索任務並行，只有寫入任務序列化

### 護航者測試機制
不只測正向流程，必須挑戰極端情境（最難搞的家長、異常輸入）。
「假性1.0視力」警告：程式跑通 ≠ 功能正確。

### 文獻過濾雷達
總分低於 4 星（證據位階 + 臨床牽引力 + 轉換力）的研究只做摘要歸檔，不投入深度加工。

---

## 現役系統狀態

### Skill 生態系（2026-04-15 重構後）
**Core Skills（已正式審核）：**
- `paper-digest-core` → `uncle-glasses-writing-voice` → `uncle-glasses-writing-qa` → `optometry-html-renderer` → `uncle-glasses-blog-packager`
- `uncle-glasses-distiller-core`（蒸餾路由）
- `consumer-behavior-psychology-framework`

**路由文件：** `SKILLS-MAP.md` → `CORE-SKILL-ORCHESTRATION.md` → `TASK-TO-CORE-CHAIN.md`
**治理文件：** `SKILL-RATING-RUBRIC.md` → `skill-reviews/` → `SKILL-TIERS.md`
**Legacy：** `.claude/skills/uncle-glasses-distiller/`（已降為 archive，勿用作新入口）

### Shared Brain Architecture（2026-04-15）
四 Agent 部署包完成：`prompt-claude/antigravity/jarvis/codex.md`
部署入口：`shared-brain-runtime/README.md`
驗收清單：`DEPLOYMENT-CHECKLIST.md`
**狀態：設計完整，跨 Agent 實際協定尚未壓測。**

### MCP Server 雙引擎
| Server | 工具 |
|--------|------|
| `uncle-glasses`（本地建） | search_knowledge_cards / get_article_draft / list_published_articles |
| `uncle-glasses-obsidian`（Jarvis 建） | search_obsidian / **create_obsidian_card** |

NotebookLM MCP：`%USERPROFILE%\.local\bin\notebooklm-mcp.EXE`（帳號：[NotebookLM 登入帳號已省略]）
Antigravity 無法直接用，需透過 `Inbox/待深處理.md` 交接。

### SEO 內容進度（2026-04-15）
P0 首攻「驗光所 vs 眼鏡行」草稿：`drafts/20260415-驗光所vs眼鏡行差別.html` ✅
P0 次攻「配眼鏡流程圖解」：待排
全穀物×近視草稿：`drafts/20260415-全穀物與兒童近視.html` ✅
SEO 策略卡：`obsidian-vault/04-知識卡片/20260408-uncle-glasses-SEO關鍵字群分析報告.md`

### MYOWNREVIEWS 專案
正式路徑：`%USERPROFILE%\Desktop\blank-page-launch`
技術細節：`memory/project_myownreviews.md`

### MYOWNVISION 專案（2026-04-16 首次完整掌握）
雙眼機能分析 SaaS，由大叔主導開發（Lovable 平台）
本地路徑：`saas_sandbox/eye-analyzer-main/eye-analyzer-main/`
技術棧：React + TypeScript + Vite（無獨立 Supabase，前端主導）
核心功能：斜位 + 融像儲備 + 調節 + CISS → OEP + ZCSBV 圖表 + 患者報告
⚠️ 待修正：OEP 天花板應改用實測 AA（非 Hofstetter 公式），詳見 `.lovable/plan.md`

### Russell 高信任版 Funnel
Value Ladder 與 CTA 骨架已落地至 `obsidian-vault/09-SaaS產品與行銷/`
網站 CTA 已改為「先做專業判斷」語言（`01_floating-cta.html`、`03_nav-cta-button.html`）

---

## 待辦追蹤

| 項目 | 狀態 | 路徑 |
|------|------|------|
| 賽局理論「附錄三：理論背景」文章 | 待撰 | 知識卡已有素材 |
| P0 次攻「配眼鏡流程圖解」 | 待排 | — |
| MYOWNVISION AA 實測值修正 | 待執行 | `saas_sandbox/eye-analyzer-main/.lovable/plan.md` |
| 繼續教育課程微調 | 待確認日期 | `content-planning/20260416-雙眼機能分析繼續教育.pptx` |
| Antigravity handoff 協定驗收 | 待執行 | `HANDOFF-PROTOCOL.md` |
| Smoke Test 寫作管線 | 待執行 | `SMOKE-TEST-SCENARIOS.md` |

### Telegram Bot 全自動系統（2026-04-16）
Bot 檔案：`ag-workspace/telegram-bot.js`（v2.2）
啟動：雙擊 `ag-workspace/start-bot.bat` 或執行 `install-startup.ps1`
Bot 帳號：@Uncleglassesbot｜模型：Gemini 2.5 Flash（thinkingBudget:0）
Token 儲存：`ag-workspace/.env`（TELEGRAM_BOT_TOKEN + GEMINI_API_KEY）
支援指令：`/任務` `/收集` `/草稿` `/記憶` `/狀態`（中英文皆可）
記憶整合：對話 → memory/YYYY-MM-DD.md（Junction 同步）｜/任務 → `[待 Claude 處理]`
**待升級**：Obsidian 搜尋整合、SaaS 資料庫查詢（uncle-glasses-mcp）
**只跑一台機器**（診所/家用），公司電腦不需要

### Knowledge compiler layer (2026-04-16)
Added a persistent-wiki layer on top of the shared-brain architecture:
`KNOWLEDGE-COMPILER-PROTOCOL.md` + `.agents/workflows/knowledge-compiler.md` + Obsidian SOP/template.
Core shift: do not merely store or retrieve sources; each meaningful read should update cards, MOCs, SOPs, or skills.
