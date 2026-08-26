# KDF Web Console v0.2

本機、唯讀的 KDF 研究工作台。畫面直接讀取 repository 既有的
`scripts/kdf_obsidian_brain_snapshot.mjs` 輸出，不保存第二份 KDF 資料。

## 啟動

```powershell
cd kdf-web
npm install
npm run dev
```

Chrome 開啟 <http://localhost:3000>（server 僅綁定 `127.0.0.1`）。

## 頁面

- Dashboard：正式 artifacts、RQ、Evidence、gaps、Discovery Question、待審與完整性狀態。
- Ask KDF：deterministic 自然語言問題工作台，將問題解讀、formal context、Evidence、signal、Discovery、gap 與候選題分層呈現。
- Research Questions：正式研究問題的狀態、evidence level、gap 與 human review。
- Evidence：只列正式 `evidence-card`。
- 曼陀羅：以 template 驅動的 session-only 思考空間；所有 cell 都是 `THINKING_ONLY`。
- 內容：同頁分層顯示具有正式 provenance 的 KDF content draft，以及 `obsidian-vault/10-歷史文章智庫` 的 69 篇 `LEGACY_CONTENT`；可依 KDF linkage、provenance 與 review state 篩選。
- Feedback：Agent-Reach 與 Social Feedback 的 staging 摘要。
- Review Queue：正式 KDF 與 intake 的 Owner Review 待辦摘要。

## Clickable routes

- `/research/:id`：Research Question、既有關係與相關 formal nodes。
- `/ask`：session-only Ask KDF 分析；不建立正式節點或 relation。
- `/ask/mandala`：以本次問題與既有 template 展開 session Mandala；沒有 template 時安全停止。
- `/mandala/:id`：符合 template 的 Research Question 核心 3×3 Mandala。
- `/mandala/:id/:dimensionId`：特定 Mother dimension 的八個 sub-question cells。
- `/evidence/:id`：Evidence sources、findings、limitations 與 condition-dependent conflicts。
- `/article/:id`：同時支援正式 content draft 的 KDF provenance／feedback signals，以及 legacy article 的安全原文、來源、candidate relation、citation projection 與 freshness state。
- `/feedback/:id`：privacy-safe intake projection，不包含 original/private text。
- `/review/:id`：Owner review context；Approve／Hold／Reject 只作為 disabled 視覺提示。
- `/node/:id`：Root、Mother、Mature Knowledge、Practice、FOC、ULC、DQ 等既有 formal nodes 的唯讀摘要。
- `/graph/:id`：以目前節點為中心的局部關係圖；預設只有直接關係，可手動展開一層。

所有 detail URL 都可直接重新整理；未知 ID 會顯示安全的 Not Found 狀態，不做模糊替代。

## Legacy Blog / 全域搜尋

- Legacy corpus 直接由既有 Markdown 即時投影，不產生持久化 index 或第二份 KDF。
- `Ctrl+K` 開啟全域關鍵字搜尋，可查 title、body、topic、KDF ID 與 publication date；它與 `/ask` 自然語言工作台是不同功能。
- Legacy 搜尋結果固定標示 `Related Content · LEGACY_CONTENT` 與「你過去寫過這篇相關文章」。
- `EXPLICIT_LINK` 與 `STRONG_CANDIDATE`／`POSSIBLE_MATCH` 分開顯示；candidate 不會寫回 formal card。
- `PROVENANCE_CONFIRMED` 只接受 article citation 與 formal Evidence source 的精確交集；topic similarity 不算 Evidence provenance。
- Mandala 的 Related Articles (`A`) 與 Evidence (`E`) 分開計數，文章數不影響 evidence coverage。

## Ask KDF 邊界

- 使用固定規則做概念辨識、formal node matching、scope／relation candidate assessment；不呼叫雲端 LLM 或外部搜尋。
- Formal Evidence 僅來自 `evidence-card`；Practice、FOC、ULC、Feedback 與 Discovery 各自分區且不升格。
- 分析與本次 Mandala 只存在 React session；重新整理即清除，沒有 `localStorage`、`sessionStorage`、database 或檔案寫入。
- Legacy Blog 在 Ask 結果中只作為「你以前寫過什麼？」的歷史內容記憶；每筆都固定標示 Related Content / `LEGACY_CONTENT`，不會升格成 Evidence、Knowledge、正式 relation 或 sufficiency。
- Ask session Mandala 將 Formal Evidence (`E`) 與 Related Legacy Articles (`A`) 分開計數並提供文章入口；`A` 永不參與 evidence coverage。
- 所有 relation、gap、candidate 與 Mandala cell 都是 UI-only；不自動建立 Research Question，也不寫回 Markdown。

## 關係導覽

Detail 頁面共用同一套 Relationship Drawer，分為上游、下游、訊號與未解關係。
關係只取自 snapshot 的明確欄位，例如 `parent`、`root_topic`、`sources`、
`origin_cards`、`related`、wikilinks、intake 的 `related_kdf_nodes` 以及 ledger formal IDs。

- 反向關係只在瀏覽器記憶體中由明確正向關係推導，不回寫 KDF。
- Feedback 一律標示為 `Feedback signal`，不視為 Evidence。
- Discovery Question 一律標示為 `Candidate / Discovery`，不把暫存判斷升格成正式關係。
- Research Question 與內容 detail 可查看完整知識鏈；鏈上的每一個既有節點都可點擊。
- 關係項目支援 hover／keyboard focus 摘要，不需離開目前頁面。

## 唯讀邊界

Vite 提供單一 `GET /api/kdf/snapshot`：

1. 以固定參數呼叫既有 snapshot builder。
2. 驗證 `output_policy` 為 `stdout-only-no-persistence` 且 formal validation PASS。
3. 直接回傳 stdout JSON，並設定 `Cache-Control: no-store`。
4. 非 GET 請求一律回傳 `405 READ_ONLY_ENDPOINT`。

API 不啟動 Bridge、不呼叫 MCP、不寫 audit、不取得 persistent lock，也不修改 formal KDF。
Social Feedback 只輸出明確白名單欄位；`original_text`、PII、username、private locator、cookie、token 與 session data 不會進入 Web snapshot。

Mandala 不保存第二份 KDF：template 只定義思考維度與候選問題文字，Evidence、gap、Feedback、Discovery 與 Practice context 每次都由同一份 read-only snapshot 推導。Explore textarea 僅存在目前 React session，重新整理即清空；沒有 POST endpoint 或 promotion action。

Legacy projection 同樣是 stdout-only：不修改歷史文章、formal KDF、audit、Bridge cache 或 metadata；HTML 中的 script、style、iframe 不會傳到可執行 DOM。

## Production-like 本機檢查

```powershell
npm run build
npm run preview
```

Preview 同樣提供上述唯讀 snapshot API。
