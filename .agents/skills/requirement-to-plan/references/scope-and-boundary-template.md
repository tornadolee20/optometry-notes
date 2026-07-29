# Scope and Boundary Template

用於將需求收斂成明確邊界，避免 scope 在實作階段持續膨脹或被誤解。

```text
## In scope
- <本輪明確要完成的項目 1>
- <本輪明確要完成的項目 2>

## Out of scope
- <本輪刻意不處理的項目 1，附原因>
- <本輪刻意不處理的項目 2，附原因>

## Non-goals
- <即使看起來相關，也不應被誤認為成功標準的項目>

## Protected behavior
- <不得破壞的既有功能、資料或流程 1>
- <不得破壞的既有功能、資料或流程 2>

## Assumptions
- ASSUMPTION: <尚未驗證但暫時用於規劃的假設，附影響範圍>

## Owner decisions required
- <需要 owner 明確決定、Agent 不得自行拍板的事項>
```

## 使用原則

- `Out of scope` 與 `Non-goals` 不同：`Out of scope` 是「這輪不做」，
  `Non-goals` 是「這輪做了也不代表成功」，兩者都要寫，不可合併省略。
- `Protected behavior` 必須具體到可驗證的行為或資料，不能只寫「不要壞掉」。
- 任何一項 `Assumption` 若後續被驗證為錯誤，必須回到本模板更新，不得沿用
  舊版本繼續規劃。
- 若 `In scope` 與 `Protected behavior` 出現衝突（例如要修改的行為本身
  被列為受保護），視為需要 owner 決策的事項，列入
  `Owner decisions required`，不得自行判斷。
