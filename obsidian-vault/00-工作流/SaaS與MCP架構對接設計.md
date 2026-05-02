# SaaS 資料庫與 MCP 臨床演算引擎對接架構設計

> **建立時間：** 2026-04-29
> **目標：** 將 SaaS 系統的病患數據（Schema）與 `binocular-vision-mcp` 伺服器進行無縫對接，實現全自動的雙眼視覺機能分析與處方計算。

---

## 一、 SaaS 輸入數據結構 (Input Schema)

前端 SaaS 將提供以下 JSON 格式數據給 MCP 工具：

### 1. 病患與系統中繼資料 (Metadata & Quality)
*   `anonymous_user_id`, `clinic_region`, `exam_year_month`
*   `age`, `gender`, `health_score`
*   `data_quality_tier`, `quality_score`
*   `prefilled_fields`, `prefilled_field_count`, `actual_measurement_count`

### 2. 醫療病史與紅旗指標 (Medical History)
*   `MedHx_HasConditions`, `MedHx_OcularList`, `MedHx_SystemicList`
*   `MedHx_HighRisk`, `MedHx_RiskFactors`, `MedHx_Notes`

### 3. 視光臨床核心數據 (Clinical Measurements)
*   **基礎參數：** `pd` (瞳距), `ciss` (症狀評分), `stereo` (立體視)
*   **調節能力：** `npc`, `nra`, `pra`, `bcc`, `aaOD`, `aaOS`, `flipper`
*   **聚散與眼位：** `dist_phoria`, `near_phoria`, `vergence_facility`
*   **視力 (VA)：** 包含遠近距離的裸視 (ua) 與最佳矯正視力 (bcva)，並附帶 logmar 數值。
*   **水平聚散儲備量 (Vergence Ranges)：** 
    *   近距：`bi_blur`, `bi_break`, `bi_recovery`, `bo_blur`, `bo_break`, `bo_recovery`
    *   遠距：`dist_bi_blur`, `dist_bi_break`, `dist_bi_recovery`, `dist_bo_blur`, `dist_bo_break`, `dist_bo_recovery`

### 4. 防呆與預設值標記 (Fallback Indicators)
*   `*_is_default` (包含：`dist_phoria`, `near_phoria`, `npc`, `vf`, `bi_blur`, `bo_break` 等所有核心量測的 boolean 標記)
*   **作用：** 供 MCP 判斷數據可信度，決定是否給予「推測性」診斷。

---

## 二、 MCP 運算模組設計 (Processing Logic)

MCP 伺服器接收上述資料後，依序通過以下 5 個模組：

### 模組 1：🛑 醫療紅旗攔截器 (Red Flag Filter)
*   **觸發條件：** 掃描 `MedHx_HighRisk`, `MedHx_SystemicList`, `MedHx_Notes`。
*   **行為：** 若偵測到甲狀腺、腦外傷、近期突發複視等關鍵字，立即中斷功能性分析。
*   **輸出：** `diagnostic_classification` = `Medical Referral (需轉介)`。

### 模組 2：🧮 AC/A 比例自動計算器
*   **觸發條件：** 通過模組 1 後執行。
*   **行為：** 讀取 `pd`, `dist_phoria`, `near_phoria`。
*   **公式：** `Calculated AC/A = pd(cm) + (near_phoria - dist_phoria) / 2.5` (假設 40cm 近距)。
*   **輸出：** 標記為 High, Normal, 或 Low AC/A。

### 模組 3：🌳 Scheiman 綜合決策樹 (核心分類器)
*   **行為：** 將測量數據與 Morgan 常模比對，進入邏輯判斷。
*   **範例邏輯 (Convergence Insufficiency, CI)：**
    *   *IF* `near_phoria` (外隱斜) > `dist_phoria` 
    *   *AND* `npc` > 6cm 
    *   *AND* `bo_break` 低於常模 
    *   *THEN* 判定為 `Convergence Insufficiency`。

### 模組 4：📐 處方與稜鏡演算法 (Treatment Calculator)
*   **行為：** 根據模組 3 的分類與 `ciss` 症狀分數給予處置建議。
*   **Sheard's 計算 (針對外隱斜)：** 
    *   *IF* `ciss` > 16 (兒童) / 21 (成人)
    *   *THEN* `Prism = (2/3 * near_phoria) - (1/3 * bo_blur/break)`。若結果 > 0，則建議 BI 稜鏡。
*   **Percival's 計算 (針對內隱斜)：** 
    *   `Prism = 1/3 * (大極限) - 2/3 * (小極限)`。

### 模組 5：🛡️ 數據信心權重評估
*   **行為：** 掃描所有 `*_is_default` 欄位與 `quality_score`。
*   **輸出修正：** 若關鍵數據 (如 `bo_break`) 為預設值，MCP 將在最終報告附註：「⚠️ **資料品質警告**：因缺乏實際測量數據，此分類結果為系統推斷，建議進行實體覆測。」

---

## 三、 系統輸出 (Output Schema)

MCP 運算完成後，將向 AI/SaaS 回傳結構化結果：
1.  **診斷分類** (`diagnostic_classification` 更新)
2.  **量化指標** (算出的 AC/A 值、Sheard 稜鏡值)
3.  **處置建議** (VT 計畫階段、鏡片/稜鏡光學處方)
4.  **醫患溝通話術** (結合 AI 生成的白話文解釋)
