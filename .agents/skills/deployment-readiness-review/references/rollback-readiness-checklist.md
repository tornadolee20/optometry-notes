# Rollback Readiness Checklist

## Rollback mode

判斷目標環境的回退能力屬於哪一種：

- **Automatic**：部署平台本身支援一鍵回退到前一版本。
- **Manual**：需要人工執行特定步驟才能回退（例如重新部署前一個 artifact、
  手動還原設定）。
- **Unavailable**：目標環境沒有可行的回退機制（例如某些不可逆的資料
  遷移）。

## 檢查項目

- [ ] **Trigger**：什麼情況會觸發回退決定（由誰判斷、依據什麼標準）
- [ ] **Authority**：執行回退需要什麼權限，目前是否具備
- [ ] **Reversibility**：本次變更（尤其是 migration）在技術上是否可逆；
      若不可逆，是否有替代的「向前修復」方案（用下一支 forward migration
      修正，而非真的倒退版本）
- [ ] **Verification**：回退後如何確認版本與資料已恢復正常（沿用
      `hosted-deploy-smoke` 的 hosted version 確認方式）
- [ ] **Unavailable rollback**：若 rollback 完全不可用，是否已明確告知
      owner 此風險，並取得知情確認

## NO-GO 門檻

以下情況應直接判定 `NO-GO`，不得只標記風險就放行：

- Rollback 完全不可用，且本次變更屬於高風險（例如涉及不可逆資料遷移、
  影響核心功能），owner 也未明確承擔此風險。
- Rollback 觸發條件或執行方式完全未知，無法在故障當下即時判斷該怎麼做。

## CONDITIONAL GO 的合理情境

- Rollback 可行，但需要先完成某個前置準備（例如先備份特定資料表），
  此時可判定 `CONDITIONAL GO`，並在條件清單中明確寫出待完成事項。
