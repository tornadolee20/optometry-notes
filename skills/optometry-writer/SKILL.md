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
- **HTML 格式**：產出包含 `▮` 與 `▸` 標題符號的 HTML 結構，並準備好 `Article` 與 `FAQ` 的 JSON-LD。

### 2. 專業數據調閱
- **來源**：優先查詢 `/home/node/.openclaw/workspace/research/papers/` 底下的論文全文。
- **驗證**：引用 NPC、Sheard's Criterion 或 AC/A 比率時，必須標註論文來源 (如 PMID)。

### 3. 法規檢查
- 檢查文案是否涉及「療效宣稱」或「醫療廣告」紅線。
- 確保提及 15 歲以下學童配鏡之必要法規提醒。

## 參考文件
- [style-guide.md](references/style-guide.md): 包含 H2/H3 符號、CSS 類別與文風指南。
- [法律須知](../../references/驗光師文案法律須知.md): 驗光人員法與醫療廣告紅線。
