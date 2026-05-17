# SKILL-DIRECTORY-REGISTRY.md — 技能目錄登記表

> 建立日期：2026-05-18 ｜ 目的：釐清三個技能目錄的引用關係，為未來合併做準備  
> ⚠️ 本表為登記用途，**不代表已執行合併**。合併需獨立決策。

---

## 三個目錄說明

| 目錄 | 引用者 | 說明 |
|------|--------|------|
| `.claude/skills/` | Claude Code 直接 @ 引用 | 含 symlink 指向 `.agents/skills/` |
| `.agents/skills/` | Antigravity / Codex 跨 Agent 共用 | 技能原體存放處 |
| `skills/` | 部分 `.agents/workflows/` 引用 | 過渡期遺留，可能為舊版獨立模組 |

決策背景：見 `DECISIONS.md` → DR-002

---

## 技能完整登記表

| 技能名稱 | `.claude/skills/` | `.agents/skills/` | `skills/` | 正式入口 | 狀態 |
|---------|:-----------------:|:-----------------:|:---------:|---------|------|
| **uncle-glasses-distiller-core** | ✅ 目錄 | — | — | `.claude/skills/` | ✅ 現役 |
| **uncle-glasses-distiller** | ✅ 目錄（archive） | ✅ 目錄 | — | `.agents/skills/` | 🗄️ Legacy（.claude 版已降為 archive） |
| **uncle-glasses-writing-voice** | — | ✅ 目錄（11 files） | — | `.agents/skills/` | ✅ 現役 |
| **uncle-glasses-writing-qa** | — | ✅ 目錄（1 file） | — | `.agents/skills/` | ✅ 現役 |
| **paper-digest-core** | ✅ MD 檔 `paper-digest.md` | — | ✅ 目錄 | `skills/paper-digest-core/` | ⚠️ 待釐清（MD vs 目錄） |
| **optometry-writer** | ✅ MD 檔 | ✅ 目錄 | ✅ 目錄 | `skills/optometry-writer/` | ⚠️ 三處並存，待整合 |
| **optometry-html-renderer** | — | — | ✅ 目錄 | `skills/optometry-html-renderer/` | ✅ 現役 |
| **uncle-glasses-blog-packager** | — | — | ✅ 目錄 | `skills/uncle-glasses-blog-packager/` | ✅ 現役 |
| **paper-researcher** | — | — | ✅ 目錄 | `skills/paper-researcher/` | ✅ 現役 |
| **blogwatcher** | ✅ MD 檔 | — | ✅ 目錄 | 待釐清 | ⚠️ MD vs 目錄並存 |
| **notebooklm** | ✅ MD 檔 | — | ✅ 目錄 | 待釐清 | ⚠️ MD vs 目錄並存 |
| **prompts-library** | ✅ MD 檔 | — | ✅ 目錄 | `skills/prompts-library/` | ⚠️ 引用 AI之眼/ 路徑（需確認）|
| **huashu-design** | ✅ symlink → `.agents/` | ✅ 目錄（153 files） | — | `.agents/skills/` | ✅ 現役（symlink 正常） |
| **huashu-nuwa** | ✅ symlink → `.agents/` | ✅ 目錄（121 files） | — | `.agents/skills/` | ✅ 現役（symlink 正常） |
| **mrbeast-perspective** | ✅ 目錄（7 files） | ✅ 目錄（7 files） | — | `.agents/skills/` | ⚠️ 兩處並存 |
| **bazi** | ✅ 目錄（35 files） | — | — | `.claude/skills/` | ✅ 現役 |
| **qimen-dunjia** | ✅ 目錄（8 files） | — | — | `.claude/skills/` | ✅ 現役 |
| **ziwei-doushu** | ✅ 目錄（5 files） | — | — | `.claude/skills/` | ✅ 現役 |
| **ali-abdaal-perspective** | — | ✅ 目錄（7 files） | — | `.agents/skills/` | ✅ 現役 |
| **atul-gawande-perspective** | — | ✅ 目錄（14 files） | — | `.agents/skills/` | ✅ 現役 |
| **feynman-perspective** | — | ✅ 目錄（14 files） | — | `.agents/skills/` | ✅ 現役 |
| **russell-brunson-perspective** | — | ✅ 目錄（7 files） | — | `.agents/skills/` | ✅ 現役 |
| **consumer-behavior-psychology-framework** | — | ✅ 目錄（6 files） | — | `.agents/skills/` | ✅ 現役 |
| **yijing-divination** | — | ✅ 目錄（6 files） | — | `.agents/skills/` | ✅ 現役 |
| **eugene-schwartz-perspective** | ✅ MD 檔（21 KB） | — | — | `.claude/skills/` | ✅ 現役 |
| **fb-post-formatter** | ✅ MD 檔 | — | — | `.claude/skills/` | ✅ 現役 |

---

## 核心技能鏈（生產線順序）

```
paper-digest-core
  → uncle-glasses-writing-voice
  → uncle-glasses-writing-qa
  → optometry-html-renderer
  → uncle-glasses-blog-packager
```

路由文件：`CORE-SKILL-ORCHESTRATION.md` → `TASK-TO-CORE-CHAIN.md`

---

## 待釐清事項

| 問題 | 技能 | 建議動作 |
|------|------|---------|
| `paper-digest.md`（.claude）vs `paper-digest-core/`（skills/）是同一個嗎？ | paper-digest | 讀兩份文件比對，確認後刪除重複的 MD 檔 |
| `optometry-writer`（.claude MD）vs `.agents/skills/` vs `skills/` 三版本關係 | optometry-writer | 確認哪版是最新，其餘加 `[deprecated]` 標記 |
| `blogwatcher`（.claude MD vs skills/ 目錄） | blogwatcher | 同上 |
| `notebooklm`（.claude MD vs skills/ 目錄） | notebooklm | 同上 |
| `prompts-library` 引用 `AI之眼/prompts-index.json` — 移動後路徑是否需更新？ | prompts-library | 確認 `ai-research/AI之眼/` 中 JSON 是否完整，更新 SKILL.md 中路徑 |
| `mrbeast-perspective` 在 `.claude/skills/` 和 `.agents/skills/` 兩處是否同步？ | mrbeast-perspective | diff 兩個目錄內容 |

---

## 合併前必須完成的前置作業

在合併任何技能目錄前，必須先完成：
1. 確認所有 `.agents/workflows/*.md` 中的技能引用路徑
2. 確認 `CORE-SKILL-ORCHESTRATION.md` 中的路徑引用
3. 確認 `Claude Code` 的 `@` 引用語法是否因搬移而失效
4. 更新 `SKILLS-MAP.md` 與 `SKILL-TIERS.md`
