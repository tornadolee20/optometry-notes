---
name: optometry-writer
description: 專門為「目鏡大叔」設計的視光專業文案撰寫與研究工具。使用時機：(1) 撰寫符合三峽「自己的眼鏡」風格的部落格初稿 (2) 調閱雙眼視覺相關論文數據 (3) 根據診斷標準（如 CI, AI）分析臨床數值 (4) 確保文案符合驗光人員法規。
---

# Optometry Writer (目鏡大叔專用版)

本技能整合了目鏡大叔的部落格風格、法律規範以及專業視光文獻。

## 核心工作流

### 1. 部落格初稿撰寫
- **讀取排版規範**：參考 [style-guide.md](references/style-guide.md)。
- **切入角度**：優先從「場景故事」或「生活痛點」出發。
- **去 AI 感（禁忌）**：
  - 絕對禁止使用破折號「——」來做解釋或語氣停頓。請使用自然的逗號、冒號，或是拆成短句，多用真人語氣詞。
  - 嚴格遵守「8 大反 AI 寫作缺陷檢查（Anti-AI Checklist）」：禁用空洞結尾、限制列點、強制長短句節奏變化、減少廢話直切痛點、加入真實情境具體細節、禁止過度使用代名詞、必須以白話文解釋術語。
- **HTML 格式**：產出包含 `▮` 與 `▸` 標題符號的 HTML 結構，並準備好 `Article` 與 `FAQ` 的 JSON-LD。
- **Canonical tag【必填】**：Meta 區最後一行加上 `<link rel="canonical" href="https://www.uncle-glasses.net/[YYYY]/[MM]/[permalink].html">`，年月依文章發布時間填入。
- **GEO 摘要區塊【必填】**：首圖之後、開場白之前，插入黃底「🎯 大叔先講結論」區塊（格式見 `references/部落格排版規範.md` 第五節），3-5 條核心結論，至少 1 條含數字。

### 2. 專業數據調閱
- **來源**：優先查詢 `/home/node/.openclaw/workspace/research/papers/` 底下的論文全文。
- **驗證**：引用 NPC、Sheard's Criterion 或 AC/A 比率時，必須標註論文來源 (如 PMID)。

### 3. 法規檢查
- 檢查文案是否涉及「療效宣稱」或「醫療廣告」紅線。
- 確保提及 15 歲以下學童配鏡之必要法規提醒。

## 參考文件
- [style-guide.md](references/style-guide.md): 包含 H2/H3 符號、CSS 類別與文風指南。
- [法律須知](../../references/驗光師文案法律須知.md): 驗光人員法與醫療廣告紅線。
