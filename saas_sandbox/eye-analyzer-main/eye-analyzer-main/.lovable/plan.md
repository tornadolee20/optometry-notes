
# AA 實測值優先修正計劃

## 問題分析

目前 OEP/ZCSBV 圖表系統在未傳入 AA 時，會使用 **Hofstetter 公式預估值** 作為天花板。這在臨床上是**錯誤**的：

### 問題所在

| 現狀 | 正確做法 |
|------|----------|
| 圖表 AA 使用公式預估值（如 25 歲 = 11.0D） | 圖表 AA **必須**使用實際測量值（如患者實測 5D） |
| 公式被用於繪圖天花板 | 公式應僅用於**比對**，判斷 AA 是否低於年齡預期 |
| 患者調節不足時，圖表仍顯示正常天花板 | 患者實測 AA 低於預期時，天花板應同步降低 |

### 臨床風險

如果使用公式預估值繪製天花板：
- 調節不足（AI）患者的 ZCSBV 區域會**虛報 4-6D**
- 需求線看起來在黃色區內，但實際上患者生理極限早已崩塌
- **漏診調節不足（Accommodative Insufficiency）**

---

## 數據流分析

目前系統的 AA 數據流：

```text
InputSection
├── aaOD (state) ← 使用者輸入實測值
├── aaOS (state) ← 使用者輸入實測值
└── 傳給 ResultsSection
    └── OEPChartTabs
        ├── OEPDiagnosticChart (目前：無 aa prop，使用公式)
        └── ZCSBVFunctionalChart (目前：接收 aa 但未從父層傳入)
```

### 缺失環節

1. **OEPChartTabs.tsx**：未接收 `aa` prop，無法傳遞給子圖表
2. **ResultsSection.tsx**：有 `aaOD`/`aaOS` props，但未傳給 OEPChartTabs
3. **SummaryTabContent.tsx**：未傳遞 `aa` 給 OEPChartTabs
4. **兩張圖表**：使用公式作為 fallback，但應改為**必須傳入實測值**

---

## 修改計劃

### 修改 1：OEPChartTabs.tsx - 新增 aa prop

**檔案**：`src/components/visualizations/OEPChartTabs.tsx`

**變更內容**：

| 項目 | 修改 |
|------|------|
| Props | 新增 `aa?: number` |
| OEPDiagnosticChart | 傳入 `aa={aa}` |
| ZCSBVFunctionalChart | 傳入 `aa={aa}` |

### 修改 2：ResultsSection.tsx - 傳遞實測 AA

**檔案**：`src/components/ResultsSection.tsx`

**變更內容**：

| 項目 | 修改 |
|------|------|
| 計算雙眼平均 AA | `const measuredAA = Math.min(aaOD, aaOS);`（臨床上取較低值） |
| OEPChartTabs | 傳入 `aa={measuredAA}` |

### 修改 3：SummaryTabContent.tsx - 傳遞實測 AA

**檔案**：`src/components/report/tabs/SummaryTabContent.tsx`

**變更內容**：

- 確認是否已有 AA 相關 props，若無則需從父層傳入
- OEPChartTabs 傳入 `aa={aa}`

### 修改 4：oepChartEngine.ts - 移除公式 fallback 警告

**檔案**：`src/lib/oepChartEngine.ts`

**變更內容**：

- `calculateAACeiling` 函數**保留**（用於比對判斷 AA 是否低於預期）
- 新增 `compareAAToExpected(age: number, measuredAA: number)` 函數，回傳是否有 AA deficit

### 修改 5：圖表組件 - 驗證實測 AA 邏輯

**OEPDiagnosticChart.tsx** 和 **ZCSBVFunctionalChart.tsx**：

- 當未傳入 `aa` 時，顯示**警告提示**：「請輸入實測 AA 值」
- 移除「預設使用公式計算」的 fallback 邏輯（或改為顯示警告狀態）

---

## 公式的正確用途

Hofstetter 公式應僅用於**比對**，而非繪圖：

```typescript
// 正確用法：比對實測值與預期值
const expectedAA = 18.5 - 0.3 * age;  // Hofstetter Average
const aaDeficit = expectedAA - measuredAA;

// 如果 deficit >= 2.0D，系統彈出警示
if (aaDeficit >= 2.0) {
  // 警示：「調節力低於年齡預期 X.X D」
}
```

系統目前在 `InputSection.tsx` 已有類似邏輯（圖片中顯示「AA 稍低於預期值 5.9D」），這是正確的。

---

## 驗證案例

| 情境 | 年齡 | 實測 AA | 圖表天花板 | 預期警示 |
|------|------|---------|------------|----------|
| 正常年輕人 | 25 | 10D | Y = 10 | 無 |
| 調節不足 | 30 | 5D | Y = 5 | ⚠ AA 低於預期 4.5D |
| 老花 | 50 | 3D | Y = 3 | （老花正常） |
| 未輸入 AA | 任意 | - | 顯示警告 | ⚠ 請輸入實測 AA |

---

## 預期結果

1. **OEP 與 ZCSBV 圖表天花板**：完全依據患者實測 AA 繪製
2. **公式預估值**：僅用於 InputSection 的比對警示
3. **臨床準確性**：ZCSBV 區域真實反映「個案能力內的單一清晰雙眼視覺區」
4. **漏診風險**：大幅降低，調節不足患者的圖表會正確顯示較低的天花板

---

## 技術細節

### 取較低眼 AA 的理由

臨床上，雙眼調節幅度應以**較低眼**為準（即 `Math.min(aaOD, aaOS)`），因為：
- 雙眼視覺受限於較弱眼的能力
- ZCSBV 代表「雙眼」的功能極限

### 圖表標註更新

圖表副標題應從：
```
自動填充引擎｜年齡 25 歲｜AA 11.0D（Hofstetter 預估）
```
改為：
```
自動填充引擎｜年齡 25 歲｜AA 5.0D（實測）
```
