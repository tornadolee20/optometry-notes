---
name: paper-digest
description: >
  文獻深度拆解 Skill。當使用者要拆解論文、分析文章、或處理 Inbox/待深處理.md 中的積壓項目時，必須啟用此 Skill。觸發詞：「幫我拆解這篇」、「深度處理」、「分析這個研究」、「處理 Inbox」、「清佇列」、「文獻卡」、「論文摘要」、「這篇研究說什麼」。只要使用者貼入論文摘要、全文或研究連結，就應主動啟用，不要等使用者指定。
---

# Paper Digest（文獻深度拆解 Skill）

## 啟動前必讀

讀取 `skills/paper-digest/SKILL.md`，這是完整的三層分析引擎與 Obsidian 輸出規範。

## 快速啟動流程

### 情境 A：清空 Inbox 佇列
```
讀取 Inbox/待深處理.md → 找 [待 Claude 深處理] 標記 → 逐筆執行 SKILL.md 完整流程
```

### 情境 B：直接拆解貼入內容
```
使用者貼入文章/摘要 → 直接執行 SKILL.md Step 1 開始
```

## 輸出目標
- 知識卡片 → `obsidian-vault/04-知識卡片/YYYYMMDD-主題.md`
- 進度日誌 → `memory/YYYY-MM-DD.md`
- 佇列清理 → `Inbox/待深處理.md`
