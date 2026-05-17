# AGENT-ONBOARDING.md — 新 Agent 接手讀我先

> 建立日期：2026-05-18 ｜ 維護者：Claude Code  
> 本文件是四 Agent 系統的統一接手指南。進入任何 Agent 前，請先讀完這份文件。

---

## 一、本系統是什麼

「目鏡大叔（李錫彥）」的視光知識管理 + AI 內容工作站。  
根目錄：`C:\Users\torna_3j3fz9h\Desktop\optometry-notes\`

核心產出：視光部落格文章（uncle-glasses.net）、Obsidian 知識卡片、SaaS 產品（MYOWNVISION）

---

## 二、啟動讀取順序（依序，不可跳過）

```
1. CLAUDE.md              ← 工作協定（職責、禁忌、流程）
2. MEMORY.md              ← 長期記憶索引（永久規則、已知故障、系統狀態）
3. memory/YYYY-MM-DD.md   ← 今日與昨日的工作日誌
4. HEARTBEAT.md           ← 本週待辦清單（若存在）
5. Inbox/待深處理.md       ← Antigravity 粗處理完畢、等待深度加工的項目
6. [搜尋全專案的 [待 Claude 處理] 標記]
```

---

## 三、四 Agent 角色分工

| Agent | 平台 | 核心職責 | 不負責的事 |
|-------|------|---------|-----------|
| **賈維斯** | OpenClaw / LINE | 通訊、生活、即時互動、心跳監控 | 本地檔案處理 |
| **目鏡大叔 AI（Antigravity）** | Gemini | 雲端邏輯、網頁操作、NotebookLM | 本地腳本執行 |
| **Claude Code（本系統）** | 本地 Windows | 本地檔案、Obsidian 整合、腳本執行 | LINE 推送、網頁自動化 |
| **Codex** | 二線協調 | 待定 | — |

系統提示詞位置：
- `prompt-jarvis.md`
- `prompt-antigravity.md`
- `prompt-claude.md`
- `prompt-codex.md`

完整架構：`BRAIN-ARCHITECTURE.md`  
部署順序：`shared-brain-runtime/README.md`

---

## 四、核心文件地圖

| 需求 | 讀取文件 |
|------|---------|
| 任務路由（什麼任務用什麼技能） | `TASK-TO-CORE-CHAIN.md` |
| 全技能清單與分級 | `SKILLS-MAP.md` → `SKILL-TIERS.md` |
| 技能流程決策樹 | `CORE-SKILL-ORCHESTRATION.md` |
| 技能目錄重疊表 | `SKILL-DIRECTORY-REGISTRY.md` |
| 跨 Agent 交接流程 | `HANDOFF-PROTOCOL.md` |
| 重要架構決策記錄 | `DECISIONS.md` |
| 部署驗收 | `DEPLOYMENT-CHECKLIST.md` |
| 寫作管線 QA | `SMOKE-TEST-SCENARIOS.md` |

---

## 五、Obsidian 知識庫快速導覽

```
obsidian-vault/
├─ 00-收件匣/手機收集箱.md     ← 所有輸入的統一入口
├─ 01-專家與MOC/00-戰情儀表板.md ← 知識庫全覽
├─ 04-知識卡片/               ← 82 張，YYYYMMDD-主題.md 格式
├─ 06-模板 (Templates)/       ← 9 個標準模板
├─ 07-長篇專欄與企劃/          ← 31 個文章企劃
└─ 10-歷史文章智庫/            ← 69 篇已發布文章
```

知識卡片成熟度：🌱 新鮮 → 🔗 已連結 → 💡 已應用 → 🏛️ 已蒸餾

---

## 六、內容生產線狀態

草稿追蹤：`content-planning/00-DRAFT-STATUS.md`  
完稿 HTML：`drafts/`  
P0 待排：配眼鏡流程圖解（見 MEMORY.md 待辦追蹤）

---

## 七、已知禁忌與紅線

- 禁止出現「海大造船背景」「軍校訓練」等幻覺描述
- 禁止修改 `.gemini/`、`.antigravity/` 等其他 Agent 系統快取
- 禁止修改 `CLAUDE.md` 或 `MEMORY.md` 的永久規則區段（除非大叔明確授權）
- 破壞性操作（rm、git reset --hard）須先確認
- 涉及對外公開（發文、推播）須先詢問

完整安全規範：`CLAUDE.md` → 安全規範段落
