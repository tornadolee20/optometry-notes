---
description: 拆解 AI之眼 資料夾中的論文或 PDF，產出知識卡片並自動歸檔
argument-hint: <檔名或路徑>
---

# /uncle-glasses:ai-eye

啟動「全域高精度文獻解構引擎」，處理 `AI之眼/` 資料夾中的指定檔案。

## 用法

```
/uncle-glasses:ai-eye <檔名>
/uncle-glasses:ai-eye myopia-2024.pdf
/uncle-glasses:ai-eye                    # 掃描 AI之眼/ 中所有未處理檔案
```

## 執行流程

1. **快篩（Triage Scan）** — 三維評分（證據位階 + 臨床牽引力 + 商業轉換力）
   - 總分 < 4：輸出兩句 TL;DR，詢問是否略過
   - 總分 ≥ 4：正式啟動解構

2. **大腦吞噬（A 引擎）** — 3-Layer Architecture 逐句引用解析

3. **卡片化** — 產出 `obsidian-vault/04-知識卡片/YYYYMMDD-{標題}.md`

4. **歸檔** — 原始檔 Move 至 `obsidian-vault/02-文獻與期刊/`

## 詳細規格

完整執行邏輯見 `.agents/workflows/ai-eye.md`。
