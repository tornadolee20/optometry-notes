---
name: paper-researcher
description: 每 3 天自動爬取 7 大視光領域的 PubMed 最新論文，寫入 Inbox/待深處理.md，供 Paper Digest 技能深度解構。
schedule: "0 9 */3 * *"
last_run: ~
---

# Paper Researcher — PubMed 自動研究系統

> 這個技能負責「進料」，Paper Digest 技能負責「深煉」。

---

## 職責

每 3 天早上 09:00 自動執行，爬取 7 大視光研究領域的 PubMed 最新論文，
以標準格式附加到 `Inbox/待深處理.md`，等待 Claude Code 開啟時深度處理。

---

## 7 大研究領域

| 優先級 | 領域 | 核心關鍵字 |
|--------|------|-----------|
| 🔴 高 | 近視控制 | myopia control Taiwan, orthokeratology RCT, low-dose atropine rebound |
| 🔴 高 | 兒童視力發展 | amblyopia dichoptic therapy, convergence insufficiency reading |
| 🟡 中 | 數位眼疲勞 | accommodative fatigue near work, NIBUT dry eye office workers |
| 🟡 中 | 雙眼視覺 | convergence insufficiency CITT, vertical phoria prism |
| 🟢 一般 | 老花多焦點 | progressive lens freeform, trifocal IOL presbyopia |
| 🟢 一般 | 眼睛與全身健康 | diabetic retinopathy AI Taiwan, retinal biomarker Alzheimer |
| 🟢 一般 | 視覺營養飲食 | lutein myopia children, omega-3 dry eye, gut microbiome eye |

---

## 技術規格

- **API**：NCBI E-utilities（支援從 `.env` 讀取 `NCBI_API_KEY`）
- **搜尋邏輯**：使用 `EDAT` (Entrez Date) 搜尋過去 4 天新收錄文獻
- **每主題上限**：預設 3 篇（於 `pubmed_config.json` 中配置，優先取最新）
- **重複過濾**：使用 `.fetched_pmids.json` 持久化 PMID 歷史紀錄進行去重
- **速率限制**：免 Key 模式下為 0.4 秒/請求；設定 API Key 後自動加速至 0.1 秒/請求
- **錯誤重試**：API 連線內建指數退避重試機制（最多重試 3 次）
- **文獻摘要**：自動抓取並寫入 Abstract 內容至 Inbox，利於後續 AI 解讀

---

## 執行方式

### 手動執行
```bash
cd /path/to/optometry-notes
python skills/paper-researcher/scripts/pubmed_fetch.py
```

### 自動排程
由 Claude Code CronCreate 管理（`cron: 0 9 */3 * *`）。
查詢排程狀態：`/schedule` → 找 `pubmed_fetch`

### 執行日誌
```
skills/paper-researcher/fetch_log.txt
```

---

## 輸出格式（寫入 Inbox/待深處理.md）

```markdown
## 🔴 近視控制 — PubMed 自動抓取 (2026-03-28 09:00)
- **來源**：PubMed E-utilities（自動）
- **類型**：論文批次
- **優先級**：high

### [1] 論文標題
- **作者**：Wang YZ et al.
- **期刊**：Ophthalmology (2026-03-26)
- **連結**：https://pubmed.ncbi.nlm.nih.gov/XXXXXXXX/
- **核心主張**：（待 Paper Digest 解構）
- **建議模板**：文獻卡 (PaperNote)

> [待 Claude 深處理]
```

---

## 與其他 Workflow 的銜接

- **下游**：`skills/paper-digest/` — Paper Digest 引擎深度解構
- **最終輸出**：`obsidian-vault/04-知識卡片/YYYYMMDD-主題.md`
- **記憶**：完成後寫入 `memory/YYYY-MM-DD.md`

---

## 已知限制

1. **PubMed 索引延遲**：論文發表後約 1–7 天才進入 PubMed，部分最新研究會延遲抓到
2. **中文論文覆蓋不足**：NCBI 以英文期刊為主；台灣本地期刊需另行補充
3. **摘要需人工判讀**：自動抓取只取標題與基本資訊，核心主張仍需 Paper Digest 解構
4. **OpenAccess 限制**：全文 PDF 非公開論文無法自動讀取，只能取摘要

---

## 維護

- 調整關鍵字與設定：編輯 `scripts/pubmed_config.json`
- 調整頻率：透過 `/schedule` 或 Claude Code CronCreate 修改
- 調整每主題上限：編輯 `scripts/pubmed_config.json` 中的 `max_per_topic`（預設 3）
