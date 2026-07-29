# Verification Gate Template

每個 slice 完成後，用這個模板記錄驗證結果，避免用低層證據代替高層證據。

```text
## Slice <編號>: <名稱> — Verification

Test plan executed:
- <static inspection / local test / runtime test / CI，實際執行了哪些>

Evidence level: <static inspection | local test | runtime test | CI passed |
                  hosted verification | user acceptance |
                  production observation>

Result: <PASS | PARTIAL | BLOCKED | NOT VERIFIED>

Acceptance criteria check:
- [ ] <criterion 1> — <met / not met / not applicable>
- [ ] <criterion 2> — <met / not met / not applicable>

Protected behavior check: <維持原樣 / 有影響，說明 / 未驗證>

Not yet verified:
- <這個 slice 尚未涵蓋、留待後續 slice 或其他 Skill 處理的項目>
```

## 使用原則

- `Result` 不得寫 `PASS`，除非 acceptance criteria 全數 met 且已實際執行
  對應的 test plan，而非「預期會通過」。
- `hosted verification` 或 `production observation` 等級的證據，若本 slice
  實際上沒有執行，不得寫入 `Evidence level`。這類驗證屬於
  `deployment-readiness-review` 與 `hosted-deploy-smoke` 的範圍。
- 若某個 acceptance criterion 因為屬於後續 slice 才會涵蓋而 `not
  applicable`，需在 `Not yet verified` 中列出，不得直接省略不提。
- `PARTIAL` 或 `BLOCKED` 結果不得省略 `Not yet verified` 欄位，必須具體
  說明差距。
