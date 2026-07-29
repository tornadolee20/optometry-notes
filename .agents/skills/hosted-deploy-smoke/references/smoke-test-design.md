# Smoke Test Design

## 最小 smoke 原則

- Smoke test 的目的是「快速抓出關鍵故障」，不是「完整驗證所有行為」。
- 每個 smoke test 項目都應該能回答一個明確問題：「這個關鍵路徑還活著嗎？」
- 項目數量寧少但精準，不要為了「看起來嚴謹」塞入大量非關鍵檢查——過長的
  smoke test 會拖慢部署驗證週期，也會讓真正的故障訊號被稀釋。

## Read path 與 write path

- **Read path**：驗證讀取類操作（查詢、瀏覽、取得資料）行為正常，風險低，
  通常可以放心納入 smoke test。
- **Write path**：驗證寫入類操作，**僅在 owner 明確授權寫入驗證時執行**。
  若未授權，只驗證 read path，並在報告中註明 write path 為 `NOT VERIFIED`。

## Destructive path

- 會造成不可逆變更的操作（刪除、覆蓋、不可回收的狀態轉換）**預設不測**。
- 若業務邏輯本身必須驗證某個 destructive 行為，必須：
  1. 使用可辨識、可清理的 fixture（見 `hosted-fixture-audit-and-cleanup`）。
  2. 明確記錄這是刻意測試的 destructive path，並附上清理計畫。
  3. 取得 owner 對此特定操作的額外確認，不能只用「已授權部署」帶過。

## Fixture 原則

- 任何 smoke test 建立的資料，都必須是本次 execution window 唯一可辨識的
  fixture，事後可用單一查詢條件抓出並清除。
- 不重寫 fixture 管理邏輯——轉交或引用 `hosted-fixture-audit-and-cleanup`
  的 baseline 記錄、命名標記、residual count 驗證流程。
- **絕不**使用真實客戶資料、真實健康資料或未成年相關資料作為測試內容。

## Runtime 證據

- Smoke test 的每個結論都必須附上**實際查詢/請求得到的回應**，而非只看
  UI 是否顯示成功。
- 若目標路徑無法直接查詢（例如只有前端頁面可看），至少記錄畫面截圖或
  可重現的操作步驟作為證據，並在報告中誠實標註證據層級較低。

## False positive 風險

- **UI 顯示成功 ≠ 後端實際處理成功**：常見假陽性來源是前端樂觀更新（先
  顯示成功再背景處理），smoke test 必須核對後端實際狀態，不能只信任畫面。
- **部署工具回報成功 ≠ hosted 環境已生效**：部署指令的 exit code 為 0
  只代表「指令執行完畢沒有報錯」，不代表目標環境的版本已確實更新，必須
  用獨立查詢確認 hosted version。
- **測試環境行為 ≠ production 行為**：若 smoke test 是在 staging 執行，
  結論不能直接套用到 production，除非兩者環境配置已知一致。
