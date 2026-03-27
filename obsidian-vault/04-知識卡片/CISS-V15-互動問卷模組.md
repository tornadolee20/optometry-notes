---
title: CISS V-15 (集合不足症狀問卷) 互動式測驗模組
tags:
  - 知識卡片
  - 臨床工具
  - 雙眼視覺
  - HTML模組
date: 2026-03-19
---

# CISS V-15 互動問卷模組 (Blogger 相容版)

大叔為了讓生硬的 CISS V-15 問卷能在部落格中變成互動式的測驗，特別開發了這個以 Tailwind CSS + Vanilla JS 寫成的單頁模組。

## 核心設計理念與防禦重點
1. **臨床人員 vs 受測者指示**：保留原始 CISS 的嚴謹度，區分指導語，確保施測準確性。
2. **自動計分與風險分級**：
   - **0-15分 (Low Risk)**：症狀輕微，定期追蹤。
   - **16-21分 (Moderate Risk)**：中度風險，建議預約專業視光師進行雙眼視覺功能篩查。
   - **>21分 (High Risk)**：高風險，強烈建議進行全面的雙眼視覺評估與調節功能測量。
3. **免責聲明 (Disclaimer)**：文末加註「非官方授權版本，不作為正式診斷依據」，並附上 2004 年原始獻的 PMID (15545807)，將醫療法律風險降到最低。
4. **Blogger 嵌入技術 (防版面崩壞)**：
   因為引入了 Tailwind CDN，若直接貼到 Blogger 會導致全域 CSS 重置。因此必須先將此 HTML 轉為 Base64 編碼，再以 `<iframe>` 的 `data:text/html;base64,...` 形式嵌入文章。

## Base64 嵌入用 iframe 樣板

在文章中插入此工具時，只需貼上以下語法：

```html
<iframe src="data:text/html;charset=utf-8;base64,PCFET0...[替換為完整的Base64字串]..." width="100%" height="900" style="border:none; margin: 30px 0; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);"></iframe>
```

*(註：完整的 Base64 字串與原始 HTML 代碼請參考專案目錄下的源碼或生成工具 `encode.py`)*
