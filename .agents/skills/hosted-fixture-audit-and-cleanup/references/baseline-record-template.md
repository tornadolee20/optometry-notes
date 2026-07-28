# Baseline Record Template

用於「執行前」與「清除後」各記錄一次，兩次格式必須一致，才能直接比對。

```text
## Baseline record

Timestamp: <ISO8601>
Environment: <local | staging | hosted-non-prod | production>
Recorded by: <session / agent 標記>

Resources checked:
- <resource A (table/collection/endpoint)>: count=<N>, last_id=<...>, notes=<...>
- <resource B>: count=<N>, last_id=<...>, notes=<...>

Query used to obtain each count (copy verbatim, so it can be re-run identically):
- <resource A>: `<query or request>`
- <resource B>: `<query or request>`
```

## 使用規則

1. 「Query used」必須逐字記錄，事後重跑同一句才能算有效比對，不得換一句
   「感覺等價」的查詢。
2. 若某資源無法取得精確 count（例如只讀 API 有分頁限制），改記錄可重現的替代
   指標（例如某個遞增 ID 的最大值），並在 notes 說明原因。
3. 清除後的第二次記錄使用同一份模板，檔名或段落加註 `(post-cleanup)`。
4. 兩次記錄的差異即為本次驗證留下的淨影響；差異若非 0，必須在最終報告中
   明確歸因（見 SKILL.md「回到 Baseline 的證明」）。
