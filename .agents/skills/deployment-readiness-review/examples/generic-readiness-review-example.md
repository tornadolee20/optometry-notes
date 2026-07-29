# Example A: Deployment Readiness Review Resulting in GO (illustrative only)

情境：owner 說「PR 已經 merge 了，幫我評估一下能不能部署到 staging」。以下
使用虛構 repo（`example-widgets-app`）、虛構環境與虛構版本號，不涉及任何
真實服務，且**全程未執行任何部署動作**。

```text
1. Merge evidence
   Merge commit: b7c2e91（對應已合併的變更）
   確認方式：對照 pr-final-merge 記錄的 merge commit SHA，一致

2. Test/CI evidence
   針對 b7c2e91 這個 commit 的測試結果：42 passed, typecheck PASS, build PASS
   確認為目前 commit 的結果，非舊報告

3. Migration/config review
   本次無 schema 變更
   新增 1 個 environment variable：WIDGET_CACHE_TTL，已確認 staging 端已配置
   （只確認存在，未讀取實際值）

4. Rollback readiness
   Mode: automatic（部署平台支援一鍵回退到前一版本）
   Trigger: 若 smoke test 失敗或 5 分鐘內錯誤率異常上升

5. Smoke plan readiness
   已預先定義：
     - GET /health 回應 200
     - GET /api/widgets 回應非空陣列
     - 未授權 POST /api/widgets 應回 401
   （此計畫將交給 hosted-deploy-smoke 執行，本次不執行）

6. Monitoring readiness
   staging 環境的錯誤率與延遲監控可用

7. Blockers
   無已知 blocker

8. Decision

   GO

   理由：merge、test、config、rollback、smoke plan、monitoring 皆有明確
   證據且無阻擋性風險。

Next step: 交給 hosted-deploy-smoke 執行實際部署與驗證。
本次審查未執行任何部署動作。
```

---

# Example B: Deployment Readiness Review Resulting in CONDITIONAL GO (illustrative only)

情境：同一個虛構專案，另一次評估發現部分條件尚未完全備妥。

```text
1. Merge evidence
   Merge commit: d4f8a02，已確認

2. Test/CI evidence
   針對 d4f8a02 的測試結果：38 passed, typecheck PASS, build PASS

3. Migration/config review
   本次涉及 1 支 forward migration（新增資料表索引）
   Idempotency 已確認：CREATE INDEX IF NOT EXISTS，重跑安全
   Schema 相容性：已確認新舊程式碼版本皆可運作於新 schema

4. Rollback readiness
   Mode: manual（需要人工重新部署前一個 artifact）
   Authority: 已知具備此權限的 owner
   Trigger: 尚未明確定義觸發標準 → 標記待補

5. Smoke plan readiness
   Read path 已定義；write path 尚未定義（本次變更涉及一個新的寫入
   endpoint，但 smoke plan 還沒補上對應項目）

6. Monitoring readiness
   可用

7. Blockers
   無阻擋性 blocker，但有 2 項待補條件

8. Decision

   CONDITIONAL GO

   Conditions:
   - [ ] 明確定義 manual rollback 的觸發標準與判斷者
   - [ ] 補上新寫入 endpoint 的 smoke test 項目

Next step: 回到 owner／實作者補齊上述 2 項條件，補齊後需重新執行完整的
readiness review（不得沿用本次的 CONDITIONAL GO 結論直接視為 GO）。
本次審查未執行任何部署動作。
```

## 這兩個範例刻意示範的重點

- Example A 展示完整 merge evidence → test → migration/config → rollback
  → smoke plan → monitoring → decision 的流程，結論為 `GO`。
- Example B 展示 `CONDITIONAL GO` 的合理情境：核心條件大致滿足，但有
  具體、可勾選的待補項目，而非籠統地說「差不多了」。
- 兩個範例最後都明確寫出「本次審查未執行任何部署動作」，避免讀者誤以為
  readiness review 本身就是部署。
- 沒有使用真實 provider、真實 URL 或可直接執行的 production 指令。
