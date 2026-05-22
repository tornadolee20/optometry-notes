---
type: workflow
project: Eye Analyzer
created: 2026-05-22
status: active
---

# AI Agent Workflow

## 角色分工

ChatGPT：總控、規劃、文件、研究拆解、任務分配。

Codex：低中風險工程、lint、build、測試、TypeScript cleanup。

Antigravity：UI 實作、頁面拆分、build/lint loop、Codex-like agent work。

Claude Code：高風險主刀，clinical core、Supabase、auth、RLS、subscription、payment、admin。

Obsidian：研究母艦，放論文、想法、臨床推演、Evidence Card。

GitHub：產品規則庫，只放審核後可執行的規則。

## 標準流程

Obsidian
→ Evidence Card
→ Clinical Pattern
→ Management Option
→ Report Wording
→ Validation Case
→ GitHub docs
→ Codex / Antigravity / Claude Code execution

## Claude Code 使用原則

Claude Code 額度有限，不拿來做雜事。

只給它：

- clinical core
- Supabase schema
- RLS
- auth
- subscription
- payment
- admin
- patient records
- research export

## Codex / Antigravity 開場

```txt
Read AGENTS.md, ANTIGRAVITY.md, docs/PROJECT_RULES.md, and docs/AI_TASK_ROUTING.md first.

Classify this task by risk level before editing.

Do not modify clinical core files unless explicitly required.
```

## 最重要紅線

不能讓任何 AI 直接把未審核研究變成患者端處置建議。
