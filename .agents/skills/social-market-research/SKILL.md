---
name: social-market-research
description: Windows 專用社群做功課引擎（Threads/FB 市場情報採集器）。能背景開啟瀏覽器、繼承登入Session、掃描特定關鍵字話題、過濾消費者真實痛點並自動寫入 Inbox 供情報分析。
---

# Social Market Research Skill (Windows 社群做功課引擎)

本 Skill 專為 Windows 環境下運行的 Antigravity 與 Claude Code 設計，用於在背景悄悄進行 FB / Threads 等社群平台的消費者痛點與爆款內容採集。

## 觸發時機

當使用者提及以下意圖時自動觸發：
- 「幫我看看 Threads / FB 上大家在討論什麼 [關鍵字]」
- 「搜一下社群上家長對 [近視/配鏡/角膜塑型] 的痛點」
- 「做社群功課：[主題]」
- 「社群情報採集」

---

## 執行步驟

### 1. 執行背景採集腳本

在 Windows 終端機執行 `scripts/social-research/social_research_cli.py`：

```bash
python scripts/social-research/social_research_cli.py --platform threads --keyword "[關鍵字]" --limit 10
```

### 2. 產出報告路徑

採集成果將會自動儲存在：
`Inbox/社群情報/Threads情報_[關鍵字]_[YYYYMMDD_HHMM].md`

### 3. 情報二階段加工 (Handoff)

* **Antigravity**：檢查產出的 Markdown 檔案，進行基礎標籤與分類。
* **Claude Code / 大叔**：評估檔案內容，將爆款結構或顧客疑慮轉化為：
  - `/blog-post` 文章題材
  - `/threads-content-engine` 日更靈感
  - `/parent-simulator` 測試素材
