---
description: 深度處理 Inbox/待深處理.md 中由 Antigravity 粗處理完畢的積壓項目
argument-hint: [項目編號或全部]
---

# /uncle-glasses:inbox

掃描 `Inbox/待深處理.md`，對標記 `[待 Claude 深處理]` 的項目執行深度加工。

## 用法

```
/uncle-glasses:inbox          # 處理全部積壓項目
/uncle-glasses:inbox 1        # 只處理第 1 個項目
```

## 執行流程

1. 讀取 `Inbox/待深處理.md`，列出所有 `[待 Claude 深處理]` 項目
2. 依類型套用對應工作流：
   - 論文 → `/uncle-glasses:ai-eye`
   - 靈感/金句 → 概念卡模板
   - 草稿 → `cast-writer` 工作流
3. 建立對應知識卡片或草稿
4. 在 Inbox 中標記已處理
5. 更新 `memory/YYYY-MM-DD.md` 進度日誌

## 輸出

每個項目處理完畢後回報：
> ✅ [項目名] → 已建立 `04-知識卡片/YYYYMMDD-xxx.md`
