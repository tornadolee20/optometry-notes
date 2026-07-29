# Go/No-Go Decision Template

```text
## Deployment Readiness Review

Target: <repo> @ <merge commit SHA> → <target environment>
Artifact/version: <版本>
Reviewed by: <session/agent 標記>
Owner authorization for this review: <來源>

### Evidence summary

| 項目 | 狀態 | 備註 |
|---|---|---|
| Merge | <VERIFIED/NOT VERIFIED> | |
| Artifact match | <VERIFIED/NOT VERIFIED> | |
| Test/CI freshness | <VERIFIED/NOT VERIFIED> | |
| Migration | <VERIFIED/NOT VERIFIED/N-A> | |
| Config | <VERIFIED/NOT VERIFIED/N-A> | |
| Secrets configured | <VERIFIED/NOT VERIFIED> | 僅確認存在性 |
| Rollback | <automatic/manual/unavailable> | |
| Smoke plan | <VERIFIED/NOT VERIFIED> | |
| Monitoring | <VERIFIED/NOT VERIFIED> | |

### Unresolved blockers

- <逐項列出，或「無」>

### Decision: GO / CONDITIONAL GO / NO-GO

<結論與理由>

### Conditions (if CONDITIONAL GO)

- [ ] <待完成事項 1>
- [ ] <待完成事項 2>

### Next step

<hosted-deploy-smoke | owner 補件 | 回到實作／修復>
```

## 使用規則

1. Evidence summary 表格的每一列都必須有實際依據，不得留白後假設
   `VERIFIED`。
2. `Decision` 只能是三選一，不得寫「大概可以」「應該沒問題」等模糊字眼。
3. `CONDITIONAL GO` 必須附上具體、可勾選的條件清單，不是抽象描述。
4. `NO-GO` 的理由必須具體到「哪一項證據不足或哪個風險不可接受」，而非
   籠統的「風險太高」。
5. 條件補齊後重新評估時，使用新的一份完整模板，不得在舊模板上直接改
   結論。
