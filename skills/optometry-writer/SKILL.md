---
name: optometry-writer
description: |
  目鏡大叔視光部落格完整撰寫引擎。整合排版規範、法規紅線、HTML 格式、Schema 輸出。
  負責：從零開始產出完整 HTML 文章（含 JSON-LD、Canonical、GEO 摘要區塊）。
  與 article-draft 的分工：article-draft 負責 CAST 結構骨架與快速草稿；optometry-writer 負責最終 HTML 完稿與合規輸出。
  觸發詞：「幫我完稿」「輸出 HTML」「輸出 Blogger 版」「加 Schema」「加 Canonical」「準備發布」。
---

# Optometry Writer（目鏡大叔 HTML 完稿引擎）

> 這個 Skill 是「輸出關」，不是「起草關」。
> 草稿由 article-draft 或 uncle-glasses-writing-voice 產出，再交給這裡做 HTML 完稿、合規審查與 Schema 注入。

## 與其他 Skill 的分工

| 任務 | 使用哪個 Skill |
|------|--------------|
| 從零起草衛教文 | `article-draft`（CAST結構） |
| 調整語氣、讓文章像大叔 | `uncle-glasses-writing-voice` |
| 草稿 → HTML 完稿 + Schema | `optometry-writer`（本 Skill） |
| 論文數據查核 | `paper-digest` / `paper-triage` |

## 核心工作流

### Step 1 — 讀取規範
執行前讀取：`references/style-guide.md`（排版規範）+ `references/驗光師文案法律須知.md`（法規紅線）。

### Step 2 — HTML 結構輸出
- 標題符號：大標 `▮`，小標 `▸`
- 必須內嵌 `<style>` 區塊（不可依賴外部 CSS）
- iframe 必須 `width:100% !important; aspect-ratio:16/9`
- **Canonical tag【必填】**：`<link rel="canonical" href="https://www.uncle-glasses.net/[YYYY]/[MM]/[permalink].html">`
- **GEO 摘要區塊【必填】**：首圖後、開場前插入黃底「🎯 大叔先講結論」，3-5 條，至少 1 條含數字

### Step 3 — JSON-LD Schema 注入
產出 `Article` + `FAQPage` 雙層 Schema，YMYL 內容加「專業審核聲明」與「官方參考文獻清單」。

### Step 4 — 去 AI 感審查
- 禁用「——」破折號
- 禁用空洞結尾、過度列點、AI 感套話
- 長短句節奏變化，術語必須白話翻譯

### Step 4.5 — 發布前壓測（選做，建議做）

若文章屬於高風險題材（醫療聲稱、藥物討論、效果保證）或重要發布，在 HTML 完稿前執行：
- **Shadow QA**：`.agents/workflows/shadow-qa.md`（法規 + 公關 + 競爭對手三視角）
- **家長模擬器**：`.agents/workflows/parent-simulator.md`（取 3 個最相關人格）

### Step 5 — 法規紅線審查
- 禁用「治療/治癒/診斷」→ 替換為「發展追蹤/光學方案/諮詢」
- 涉及 15 歲以下學童：必加法規提醒
- 引用數據：標 PMID 或可查來源

### Step 6 — 完稿後自動輸出
完成 HTML 後，同步輸出：
1. **FB 手機版**：`content-planning/{文章名稱}-FB版.txt`（一句一行、蔡格尼節奏、350-500字）
2. **Threads 串文版**：`content-planning/{文章名稱}-Threads版.txt`（3-5則、每則500字元內）

## 參考文件
- `references/style-guide.md`：H2/H3 符號、CSS 類別、GEO 摘要格式
- `references/驗光師文案法律須知.md`：驗光人員法與醫療廣告紅線
- `references/GEO-AI可搜尋性策略.md`：AI 可搜尋性優化策略

## 前輩可直接這樣調用

### 調用 1：草稿轉 HTML 完稿
「這是文章草稿：[貼上草稿]。幫我用 optometry-writer 輸出 Blogger HTML 完稿版，含 Canonical、GEO 摘要、Article+FAQ Schema，並自動輸出 FB 版和 Threads 版。」

### 調用 2：文章發布前全套審查
「幫我跑 optometry-writer 的法規審查和去 AI 感審查，列出所有需要修改的地方，不要直接改，先讓我確認。」

### 調用 3：補 Schema 和 Canonical
「這篇文章已經有 HTML 了，幫我補上 JSON-LD Schema（Article + FAQ）和 Canonical tag，permalink 是 [填入]。」
