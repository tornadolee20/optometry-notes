# Draft PR Body Template

```markdown
## Summary

<一到三句話說明這個 PR 做了什麼，為什麼。>

## Changed files

- <path 1>
- <path 2>

## Validation

- Lint: <PASS/FAIL，或未執行>
- Tests: <PASS/FAIL，附數字，例如 "42 passed"，或未執行>
- Typecheck: <PASS/FAIL，或未執行>
- Build: <PASS/FAIL，或未執行>

## Boundaries

- 尚未部署到任何 hosted/production 環境
- 尚未經過 hosted 環境的實際驗證（若適用）
- 本 PR 目前為 Draft，尚未合併
- <其他這次任務特別需要說明的邊界，例如尚未涵蓋的 edge case>

## Notes for reviewer

<若有特別需要 reviewer 注意的地方，列在這裡；否則省略此段。>
```

## 使用規則

1. 「Validation」段落只能填寫**本次實際執行過**的結果，沒跑過的項目寫
   「未執行」，不得留白讓讀者誤以為已經跑過且通過。
2. 「Boundaries」段落是強制項目，用來避免 reviewer 誤以為 Draft PR 代表
   已經部署或已通過完整驗證。
3. 不得在 PR body 中寫入任何私人絕對路徑、憑證、真實客戶資料。
