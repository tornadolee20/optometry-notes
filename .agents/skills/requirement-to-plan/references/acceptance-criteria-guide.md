# Acceptance Criteria Guide

每一項驗收條件都必須是**可觀察、可驗證**的陳述，而不是主觀形容詞的堆疊。

## 撰寫原則

- 用「使用者做了 X，系統回應 Y」的格式描述，避免「介面要好用」「效能要
  夠快」這類無法客觀判斷的敘述。
- 明確指出成功與失敗各自對應什麼結果。
- 區分功能性（functional）與非功能性（non-functional）驗收條件，不要
  混寫在同一條。
- 以下狀態**不得**視為驗收完成：
  - 「程式碼已寫」
  - 「build 成功」
  - 「PR 已建立」
  - 「看起來應該可以」

## 至少涵蓋的情境

- **Happy path**：主要情境下的預期行為。
- **Error path**：輸入錯誤、系統錯誤時的預期行為。
- **Permission／identity path**：不同權限或身分下的預期行為與邊界。
- **Empty／null／invalid input**：空值、缺漏欄位、格式錯誤時的行為。
- **Backward compatibility**：既有資料與流程是否維持可用。
- **Mobile／desktop**（若適用）：不同裝置或畫面尺寸下的行為一致性。
- **Accessibility**（若適用）：非滑鼠／非視覺操作路徑的可用性。
- **Performance**（若適用）：可量測的效能門檻，而非「要快」。
- **Privacy／security**（若適用）：資料存取邊界與最小化原則是否維持。

## 範例格式

```text
Given <前置狀態>
When <使用者或系統動作>
Then <可觀察的預期結果>
Verification: <static inspection / local test / runtime test / CI /
               hosted verification / user acceptance / production
               observation 之一>
```

## 常見疏漏

- 把「已實作」誤植為「已驗收」，跳過實際驗證步驟。
- 只寫 happy path，遺漏 error path 與 permission path，導致上線後才發現
  邊界情境未定義。
- 非功能需求（效能、隱私、無障礙）在計畫階段被略過，實作完才發現無法
  客觀驗收。
