# Knowledge Flywheel 2.1｜只讀知識健康檢查與雙倉庫差異盤點

> 2026-11-13 的 **可執行 Preflight 提案**。不是正式 KDF Validator、不是證據審查，也不會搬移私人檔案、修改 Markdown、核准知識或發布文章。

## 已核對的結構事實（局部抽樣，不代表整庫完整差異）
已按既有目錄相對路徑，比對公開母本與另一份私人 Obsidian 工作副本中的 **7 個關鍵檔案**：

| 檔案（相對於 Obsidian Vault） | 比對結果 |
| --- | --- |
| README.md | 內容 SHA 相同 |
| 01-專家與MOC/第二大腦-知識收集與回存準則.md | 內容 SHA 相同 |
| 00-收件匣/2026-11-09-視覺負擔與認知負荷-研究母稿.md | 內容 SHA 相同 |
| 04-知識卡片/概念卡-Zettelkasten.md | 同名內容不同（待 reconcile） |
| 05-營運SOP與模板/SOP-知識編譯工作流.md | 同名內容不同（待 reconcile） |
| 05-營運SOP與模板/SOP-Zettelkasten-KDF-研究到文章知識飛輪.md | 僅私人工作副本存在 |
| 00-收件匣/卡片盒待審/2026-11-13-咖啡茶與眼睛-MOC.md | 僅私人工作副本存在 |

**結果：3 相同、2 內容分歧、2 私人獨有。** 這是七檔抽樣，不可宣稱全部資料沒有其他分歧。Git SHA 比對已驗證內容相同與否，未進行全文逐段 diff，也未確認 Windows Obsidian 正開啟哪個 vault。

### 決策前置條件
- [ ] Windows Obsidian 真正使用的 vault 和 git remote 完整確認。
- [ ] 權限分層：未公開研究／病患資料不可進公開 Repo。
- [ ] 比對現有 KDF Node Schema／Ledger／Bridge，確認下一版模板是否兼容。
- [ ] 由本人選擇單一正式母本策略：保留公開已驗證區 + 私人 staging，或私人母本 + 公開審核後出口。**不得兩邊同時為 canonical。**
- [ ] 對兩份內容做逐段 diff、標記人工決策，不可盲目合併或直接覆蓋。

## 使用 lint（Python 3.10+、標準函式庫）

於 clone 的 repo 根目錄：

~~~shell
python scripts/knowledge_flywheel_lint.py --scope pilot --format text
python scripts/knowledge_flywheel_lint.py --scope pilot --format json
python scripts/knowledge_flywheel_lint.py --scope all --strict
python -m unittest discover -s tests -p 'test_knowledge_flywheel_lint.py' -v
~~~

也可指定另一份已授權、已在本機的 Vault（不會上傳內容）：

~~~shell
python scripts/knowledge_flywheel_lint.py --vault "/PATH/TO/OBSIDIAN-VAULT" --scope pilot --format json
~~~

### 檢查範圍
- 預設 pilot：只檢查 00-收件匣/卡片盒待審/，索引可使用整個 vault 的其他卡片做連結比對。
- all：逐張巡檢整個 vault 的 Markdown，排除 .obsidian 與模板；舊卡格式可能產生噪音，**勿把全庫警告直接當作臨床審核不通過**。
- 檢查重複 id、重複 DOI、未解決或同名多重 Wikilink、文獻來源缺失、原子卡 claim／source 提醒，以及未經審核就宣稱 validated 的危險標籤。
- 輸出摘要與檔案路徑／問題代碼，不輸出卡片原文。

### Exit codes
- 0：命令成功；若未帶 --strict，**有錯誤仍會是 0**，必須讀 JSON 計數。
- 1：帶 --strict 且偵測到 blocking errors。
- 2：讀取路徑或程式執行失敗。

### 明確限制
- 只使用簡單 YAML scalar 解析，不解析完整 YAML，不能替代正式 schema validator。
- Wikilink 以檔名 stem 做保守配對；alias／複雜路徑可能誤報。
- source_ids 的存在只表示填過，不證明引用真實有效或研究解釋正確。
- reviewed_by/reviewed_at 只是存在性檢查，不是身份驗證或人工審核紀錄認證。
- **未設定排程，也未連接任何公開或私人倉庫的自動寫入機制。**
- 空的 pilot scope 會產生 empty_scope 資訊，不代表已完成試行。
- 本工具在隔離 fixtures 通過測試，不宣稱已對 Windows 本機 Vault 或完整 KDF graph 完成驗收。

## 接下來的安全落地順序
1. 審閱本 Draft PR 的 schema 和 read-only lint。
2. 在授權的本機 Vault 跑只讀檢查，保留 JSON 輸出（不要含敏感內容）。
3. 審閱雙倉庫差異並確立 canonical、staging 和 public export 的權責界線。
4. 以咖啡／茶研究作單一試行案例，確認來源、原子卡、MOC、文章回鏈及 Human Gate。
5. 只有上述驗收完成，才討論自動化 ingest→compile→review，不先部署改動正式 KDF。

附註：本文不將任何私人倉庫路徑、個案內容或未公開論文正文複製到公用 Repo。
