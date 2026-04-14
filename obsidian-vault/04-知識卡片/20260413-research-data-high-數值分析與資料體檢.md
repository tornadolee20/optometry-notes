# research_data_high_2026-04-12.csv 數值分析與資料體檢

建立日期：2026-04-13  
來源檔案：[research_data_high_2026-04-12.csv](C:/Users/torna_3j3fz9h/Downloads/research_data_high_2026-04-12.csv)

## 一句話結論

這份 CSV 可以分析，但目前更適合做「資料體檢、欄位清理、個案追蹤與 pattern 判讀」，不適合直接拿去做正式群體統計推論。

## 1. 資料清理與欄位體檢

### 基本輪廓

- 總列數：6
- 欄位數：69
- 匿名使用者數：1
- 月份數：2
- 去除完整重複列後：5 列

### 已發現的資料品質問題

1. 有 `1` 組完整重複列。  
   2026-01、26 歲男性、`BX` 的一筆資料被完整重複。

2. 有 `類重複個案`。  
   去重後仍有兩筆 `2026-01 / 26 歲男性 / BX`，但其中一筆近距離 BCVA 欄位變成 `CF`，代表它不是單純 duplicate，而是同一個案的近似重複或不同版本資料。

3. `diagnostic_classification` 欄位有錯位疑慮。  
   第一列出現 `Health Score: 75`，這不像診斷分類，比較像 health note 被寫進診斷欄。

4. `actual_measurement_count` 全部為 `0`。  
   但表中明明有大量檢查值，代表這欄目前不能拿來當「真實量測數量」指標。

5. 多筆資料帶有 `*_is_default = true`。  
   尤其 `dist_phoria`、`near_phoria`、`npc`、`vf`、`bi/bo break/recovery`、`dist bi/bo break` 等欄位，在 2026-01 的資料中多數被標成 default。  
   這表示這些數值可能是預設值或模板值，不能直接視為臨床真實量測。

6. 視力欄位混合了 numeric 與非 numeric。  
   `va_near_bcva_od`、`va_near_bcva_os` 出現 `CF`，因此這兩欄不能直接做純數值統計。

7. 至少有一筆數值邏輯不合理。  
   某筆 `BX` 資料出現 `bi_break = 10`、`bi_recovery = 13`，呈現 `recovery > break`。  
   這通常表示記錄錯誤、欄位對應錯誤，或資料轉換有問題。

### 初步清理建議

1. 先刪除完整重複列。
2. 將 `diagnostic_classification` 中明顯錯位值移出或標記為 `invalid_label`。
3. 為所有 `*_is_default = true` 的數值欄位建立 `low_trust_measurement` 標記。
4. 將 `CF`、`HM`、`LP` 這類視力描述統一編碼，不要和純 decimal VA 混算。
5. 建立資料邏輯檢查規則，例如：
   - `recovery <= break`
   - `prefilled_field_count` 與 default flags 大致一致
   - `actual_measurement_count` 不應長期為 0

## 2. 可分析數值欄位總表

### 目前可直接當 numeric 讀取的欄位

- `age`
- `health_score`
- `quality_score`
- `prefilled_field_count`
- `actual_measurement_count`
- `pd`
- `ciss`
- `stereo`
- `npc`
- `nra`
- `pra`
- `bcc`
- `aaOD`
- `aaOS`
- `flipper`
- `dist_phoria`
- `near_phoria`
- `vergence_facility`
- `bi_break`
- `bi_recovery`
- `bo_break`
- `bo_recovery`
- `dist_bi_break`
- `dist_bo_break`
- `va_dist_ua_od`
- `va_dist_ua_os`
- `va_dist_bcva_od`
- `va_dist_bcva_os`
- `va_dist_bcva_od_logmar`
- `va_dist_bcva_os_logmar`
- `va_near_bcva_od_logmar`
- `va_near_bcva_os_logmar`

### 目前不建議直接當純 numeric 的欄位

- `va_near_bcva_od`
- `va_near_bcva_os`

原因：出現 `CF`。

### 這份表裡比較有分析價值的雙眼視欄位

如果你是要做雙眼視功能研究，優先保留：

- `ciss`
- `npc`
- `dist_phoria`
- `near_phoria`
- `vergence_facility`
- `nra`
- `pra`
- `bcc`
- `aaOD`
- `aaOS`
- `bi_break`
- `bi_recovery`
- `bo_break`
- `bo_recovery`
- `dist_bi_break`
- `dist_bo_break`
- `stereo`

### 這份表裡比較像品質控制欄位

- `data_quality_tier`
- `quality_score`
- `prefilled_fields`
- `prefilled_field_count`
- `actual_measurement_count`
- 各種 `*_is_default`

這些欄位很重要，因為它們決定數值能不能信，不只是附屬資訊。

## 3. 個案雙眼視 pattern 分析

### 個案資料特性

這份資料目前其實不是「多人研究資料」，而是接近「單一匿名使用者跨月份與不同版本記錄」。

去重後有 5 筆，但其中包含：

- 2025-12：2 筆
- 2026-01：3 筆

診斷標籤分布：

- `NORMAL`：2 筆
- `BX`：2 筆
- `Health Score: 75`：1 筆，疑似錯標

### 可見 pattern

#### Pattern A：近距離 exo 傾向很常出現

資料中多數列的 `near_phoria` 都是負值：

- `-6`
- `-6`
- `-5`
- `-2`
- `-5`

若負號代表 exo，這代表這批記錄整體偏向 near exo pattern，而不是 eso 主導。

#### Pattern B：distance phoria 較接近 ortho 或輕度 exo

`dist_phoria` 大致落在：

- `0`
- `0`
- `-3`
- `0.25`
- `-3`

這比 near phoria 更接近 ortho 或較輕偏斜，表示若要往 pattern 想，比較像 near-demand 下才顯著的外隱斜壓力，而不是典型 basic eso 類型。

#### Pattern C：CISS 在 BX 標記列較高

- `NORMAL` 相關列：`10`
- `BX` 相關列：`18`

這至少支持一件事：`BX` 標記列的症狀負荷比較高。

#### Pattern D：NPC 沒有明顯後退

NPC 大多是：

- `6`
- `6`
- `6`
- `8`
- `6`

如果這些值可信，NPC 沒有呈現明顯 receded pattern。  
所以若要懷疑 `CI-like`，目前不夠典型，至少不是「NPC 很差」那種版本。

#### Pattern E：AA 在部分列偏低，調節因素值得懷疑

`aaOD / aaOS` 有三種主要狀態：

- `4 / 4`
- `5 / 5`
- `11 / 11`

這代表資料可能混有：

- 不同年齡正常差異
- 不同量測版本
- 或實際存在調節能力差異

如果 36 歲與 42 歲的資料真的只有 `4-5D`，那調節問題不能忽略。  
但因為這份表有 default / template 污染，這一點暫時只能列為「值得懷疑」，不能直接下結論。

### 初步臨床解讀

如果只看目前較能信的方向，這份資料最像的是：

- 主軸偏 `near exo / binocular stress pattern`
- `BX` 標記列伴隨較高 `CISS`
- 但 `NPC` 沒有形成非常典型的 CI 圖樣
- 部分資料提示可能混有 `accommodative component`

所以更保守的說法是：

這份資料目前支持「部分個案存在近距離雙眼視壓力，偏向 exo-related pattern」，但還不足以乾淨地證明典型 convergence insufficiency。  
如果要做正式分類，還需要先處理 default 值污染與量測邏輯錯誤。

## 最後建議

如果你下一步真的要把它變成可研究資料，我建議這個順序：

1. 先做 cleaned dataset v1
   - 去除完整重複列
   - 標記類重複列
   - 拆開 default value 與 real measurement
   - 修正診斷欄錯位

2. 再做 variable dictionary
   - 每欄單位
   - 正負號方向
   - 缺值規則
   - default 邏輯
   - 視力值編碼規則

3. 最後才做 pattern / 統計分析
   - `NORMAL vs BX`
   - `CISS vs near_phoria`
   - `NPC / vergence / AA / PRA / BCC` 的組合 pattern

如果你要，我下一步可以直接幫你做：

1. 這份 CSV 的 `cleaned dataset 規格`
2. 這份表的 `欄位字典 data dictionary`
3. 直接產出一個 `cleaned CSV v1`
