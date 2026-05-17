# DECISIONS.md — 系統架構決策記錄

> 建立日期：2026-05-18 ｜ 格式：ADR（Architecture Decision Record）輕量版  
> 目的：記錄關鍵架構決策的背景與理由，讓跨 Agent 查詢時不需翻 memory 日誌。

---

## 記錄格式

```
## DR-NNN：[決策標題]
- **日期**：YYYY-MM-DD
- **狀態**：✅ 現役 / ⚠️ 待修正 / 🗄️ 已棄用
- **決策**：做了什麼選擇
- **背景**：為什麼需要做這個決策
- **理由**：為什麼選這個方案而非其他
- **後果**：已知的影響或限制
```

---

## DR-001：OEP 天花板改用實測 AA（非 Hofstetter 公式）

- **日期**：2026-04-16
- **狀態**：⚠️ 待執行修正
- **決策**：MYOWNVISION 的 OEP 天花板值應使用患者實測調節幅度（AA），而非 Hofstetter 公式估算值
- **背景**：Hofstetter 公式為群體統計平均，個別患者實測值差異大，用估算值會導致 ZCSBV 圖表上限不準確
- **理由**：臨床優先實測，公式僅作未測量時的備用估計
- **後果**：需修改 `saas_sandbox/eye-analyzer-main/.lovable/plan.md` 中的計算邏輯，UI 也需更新輸入欄位

---

## DR-002：技能分三個目錄而非合一

- **日期**：2026-04-15
- **狀態**：✅ 現役（設計如此，非意外）
- **決策**：技能分散在 `.claude/skills/`、`.agents/skills/`、`skills/` 三個目錄
- **背景**：三個目錄服務不同的引用者：Claude Code 本地引用、跨 Agent 共用、舊版獨立模組
- **理由**：避免不同 Agent 的系統快取互相污染；`.claude/skills/` 用 symlink 指向 `.agents/skills/` 共用部分
- **後果**：需維護 `SKILL-DIRECTORY-REGISTRY.md` 作為對照表；合併前必須先釐清所有引用鏈

---

## DR-003：saas_sandbox/ 不納入主 git 追蹤

- **日期**：2026-04-16
- **狀態**：✅ 現役
- **決策**：`saas_sandbox/` 加入 `.gitignore`，不提交至 optometry-notes 倉庫
- **背景**：SaaS 專案（MYOWNVISION、MYOWNREVIEWS）規模達 360 MB，含 zip 與解壓目錄並存，應有獨立 repo
- **理由**：保持主知識庫倉庫輕量，SaaS 程式碼與知識管理關注點不同
- **後果**：MEMORY.md 中 saas_sandbox 路徑為本地絕對路徑，換機器時需手動更新

---

## DR-004：AI之眼/ 作為本地文件處理入口，不納入 git 追蹤

- **日期**：2026-04-16（補記）
- **狀態**：⚠️ 部分執行（已 gitignore，但舊追蹤記錄未清除）
- **決策**：`AI之眼/` 加入 `.gitignore`，作為本地處理用的暫存文件夾
- **背景**：`AI之眼/` 含 Claude Code sourcemap（323 MB）與 prompts.chat clone，非知識庫核心
- **理由**：大型二進位與研究素材不應進入版本控制
- **後果**：git status 仍顯示大量 D（deleted）條目，因歷史提交未清除。需執行 `git rm --cached -r "AI之眼/"` 才能真正清除，但此操作涉及 git 歷史，需大叔確認後執行

---

## DR-005：Obsidian wikilink 根目錄鎖定為 obsidian-vault/

- **日期**：建立時起（補記 2026-05-18）
- **狀態**：✅ 現役，絕對禁止改動
- **決策**：`obsidian-vault/` 為 Obsidian vault 根目錄，所有 `[[wikilink]]` 基於此路徑
- **背景**：Obsidian wikilink 使用相對於 vault 根目錄的路徑，搬移或重新命名根目錄會造成所有連結斷裂
- **理由**：82 張知識卡片 + 19 個 MOC 文件之間的內部連結不可破壞
- **後果**：`obsidian-vault/` 及其所有子目錄不可在不重建所有連結的前提下搬移

---

## DR-006：Telegram Bot 只在一台機器運行

- **日期**：2026-04-16
- **狀態**：✅ 現役
- **決策**：`ag-workspace/telegram-bot.js`（v2.2）只在診所/家用電腦擇一啟動，不跨機器
- **背景**：Telegram Bot API 同時只能有一個 webhook/polling 實例，多台同時跑會造成訊息競爭
- **理由**：避免訊息被多個 bot 實例重複處理
- **後果**：公司電腦不需要安裝啟動腳本

---

## 待記錄

> 以下決策已在 MEMORY.md 或其他文件中提到，尚未整理成 ADR 格式：

- [ ] Git 倉庫禁止放 Dropbox（DR-007）— 見 MEMORY.md「Dropbox Git 損壞」
- [ ] 核心技能鏈順序（paper-digest-core → ... → blog-packager）（DR-008）
- [ ] Russell Brunson Funnel 採「先做專業判斷」語言而非直接銷售（DR-009）
- [ ] NotebookLM MCP 路徑配置（DR-010）
