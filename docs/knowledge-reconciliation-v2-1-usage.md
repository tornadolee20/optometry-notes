# Knowledge Reconciliation 2.1｜雙 Obsidian Vault 知識調和

> 提案階段，離線只讀，不會覆蓋、搬移、合併任何檔案，也不會給醫學證據自動核准。

## 核心用途

當公開的正式 Obsidian 母庫與私人工作副本內容不同時，先列出需要人工查核的清單，而不是用「檔案日期較新」來覆蓋舊知識。

此工具處理五種線索：

1. 相同路徑但內容 SHA-256 不同（divergent_path）。
2. 不同路徑卻有相同穩定 ID、DOI（cross_vault_id_match / cross_vault_doi_match）。
3. 已標記成熟的知識卡出現不同版本（mature_node_diverged）。
4. 成熟狀態缺乏人工審閱欄位（mature_without_confirmed_human_review）。
5. 已變動卡片的 Obsidian 連結出現在其他筆記（backlink_impacts）。

如果兩邊的 metadata 明確宣告相同 claim_key 和適用 population、outcome，卻具有相反 claim_stance，才產生「可能的觀點張力」；若族群或結局不同，不當成直接衝突。**這不是語意理解，也不是醫學文獻的真偽鑑定。**

## Windows 本機操作

先在已連接的 Git 儲存庫取得 Draft PR 分支：

    git fetch origin proposal/knowledge-flywheel-v2-20261113
    git switch --detach FETCH_HEAD

執行只讀比對，請替換成你的實際兩個 Obsidian Vault 目錄：

    python scripts/knowledge_reconciliation.py --base-vault "C:\公開知識庫\obsidian-vault" --candidate-vault "C:\私人Obsidian知識庫" --format markdown

如要讓其他程式讀取、可輸出 JSON：

    python scripts/knowledge_reconciliation.py --base-vault "C:\公開知識庫\obsidian-vault" --candidate-vault "C:\私人Obsidian知識庫" --format json

若加入 --strict，發現高風險審核候選會回傳 exit 1；路徑錯誤會回傳 exit 2。沒有 --strict 時 exit 0 只是完成產出報告，不代表醫學內容通過審核。

**請不要把報告直接提交到公開 GitHub。** 報告列出私人筆記相對檔名，應儲存在私人且不會被自動推送的位置。

## 人工調和流程

1. 核對原始 DOI、研究方法、效果量、母群、結局、年份及研究限制。
2. 比對兩個版本及版本歷史；不可直接用最新時間作為「正確答案」。
3. 對需要修改的卡片記錄原因、來源以及 supports / challenges / qualifies 等關係，正式 KDF 節點依既有 Human Gate 審核。
4. 檢查是否有已發表文章、講座或網站 Q&A 需要更正；更新正式卡片與外部應用前都要經過審查。

## 資安與限制

- 只讀本機目錄；無 GitHub API、無 HTTP、無上傳、無檔案覆寫。
- 輸出為相對檔名及結構化旗標，不輸出筆記正文或私人文字；檔名本身仍可能敏感。
- 只支援簡單 frontmatter 標量與部分清單欄位；不宣稱支援複雜 YAML 或全文推理。
- 跨卡連結以文字偵測，並非完整 Obsidian 圖譜解析。
- 沒有結構化 claim_key / claim_stance 的舊卡，不會被臆測出「醫學衝突」。
- 每類報告明細最多 500 筆，總數仍全量計算，超量會有 details_truncated。
- 不會確認 Windows Obsidian 是否開對 Vault，更不會自動同步兩個 GitHub 倉庫。

## 合成測試

    python -m unittest discover -s tests -p "test_knowledge_reconciliation.py" -v

測試涵蓋修改、只存一側、ID/DOI 對應、明確對立主張、不同族群不誤判、人審門檻、回鏈影響、資料不洩露與零寫入。

## 狀態

- 提案分支：proposal/knowledge-flywheel-v2-20261113。
- 所屬 PR：#4（Draft，不可當作已併入正式系統）。
- 工具與合成測試：已加入提案。
- 真實 Windows Vault 全量掃描：未執行。
- 正式 KDF Schema、Validator、Bridge 與人審：尚待確認。
- 雙倉庫整併：未執行。
