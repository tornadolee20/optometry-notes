---
name: Claude Plugin 升級計畫（prompts.chat 逆向工程成果）
description: 大叔逆向工程 prompts.chat 原始碼，學到 Claude Code Plugin 完整規格，擬三層升級路線
type: project
---

大叔於 2026-04-03 逆向工程 prompts.chat（MIT 授權，作者 Fatih Kadir Akın），原始碼位於 `AI之眼/prompts.chat-main`。

## 核心發現

prompts.chat 揭示了 Claude Code Plugin 的完整規格：
- `.claude-plugin/plugin.json` — plugin 元資料宣告（commands、agents、skills、mcpServers）
- `.mcp.json` — MCP Server 設定（可以是 HTTP endpoint 或 stdio）
- `agents/*.md` — frontmatter `model: sonnet` 宣告專用 agent
- `skills/*/SKILL.md` — frontmatter `description` 決定自動觸發條件
- `commands/*.md` — slash command 定義

## 現況診斷

| 現有資產 | 問題 |
|---------|------|
| 5 個 skills（`.claude/skills/*.md`） | 無 frontmatter，無法自動觸發 |
| 14 個 workflows（`.agents/workflows/*.md`） | 只能手動呼叫，未宣告為 agent |
| CLAUDE.md 過肥 | 全部邏輯集中，每次整包載入 |
| 無 MCP | Claude 無法主動查詢知識庫 |

## 三層升級路線

### 層 1 — Skills 加 Frontmatter（30 分鐘）
為現有 5 個 skills 補上 frontmatter `name` + `description`（觸發條件），讓 Claude 自動載入正確 skill。

### 層 2 — 打包成 Claude Plugin（4 小時）
建立 `plugins/claude/uncle-glasses/` 目錄，結構：
- `.claude-plugin/plugin.json`
- `commands/`：ai-eye、cast、inbox
- `agents/`：optometry-writer、literature-scout
- `skills/`：paper-triage、article-draft

### 層 3 — 本地 MCP Server（1-2 天）
用 Node.js 建本地 MCP server，工具清單：
- `search_knowledge_cards(query)` → 搜 `obsidian-vault/04-知識卡片/`
- `get_article_draft(topic)` → 找 `content-planning/` 草稿
- `list_published_articles()` → 查 `10-歷史文章智庫/`
- `search_literature(keyword)` → 查已歸檔論文

**Why:** 讓 Claude 寫文時能主動查詢知識庫，不靠記憶盲猜。
**How to apply:** 大叔說「來搞 plugin」或「來做 MCP」時，從層 1 開始動手，檔案都已規劃好。
