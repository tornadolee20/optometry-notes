# 本地客製紀錄（Local Customization Record）

> 本檔記錄 `social-post` skill 相對於上游原始版本的客製狀態。
> `skills-lock.json` 的 schema 目前不支援 `metadata`/`notes`/`customized`/`localOverride`
> 等擴充欄位（比對 `huashu-design`、`huashu-nuwa` 兩個現有條目，皆只有
> `source`/`sourceType`/`skillPath`/`computedHash` 四個固定欄位），因此本次未修改
> `skills-lock.json`，改以此檔案作為追溯紀錄。

## 上游來源

- **原始作者**：駱君昊（Hao）
- **來源倉庫**：https://github.com/Hao0321/claude-skill-social-post
- **姊妹 skill**：https://github.com/Hao0321/claude-skill-code-cleanup
- **授權**：MIT License（保留署名即可修改、使用、商用）
- **`skills-lock.json` 記錄的 `computedHash`**：`1ff58da666e49f8cef081ddcb1af919edb9a81fc15388425368a965547cadc5d`
  — 此雜湊值僅代表**當初安裝時的原始版本來源追溯**，**未被本次客製修改或重算**。
  本機檔案內容現已與此雜湊對應的原始版本不同（見下方客製項目），這是預期中的差異，
  不代表雜湊錯誤或需要更新。

## 本地客製日期

2026-07-28（本次治理標記補強）；SKILL.md 主要改版於同一階段完成。

## 本地客製內容摘要

相對上游原始版本，本機版本已進行以下修改（詳見 `SKILL.md`、`references/uncle-glasses-brand-guardrails.md` 與各參考檔警示區塊）：

1. **目鏡大叔品牌與視光合規修改**：新增 `references/uncle-glasses-brand-guardrails.md`，定義品牌白名單風格、禁止療效保證/恐嚇式健康文案/誤導性研究數據等視光法規紅線；`style_profile.md` 補充與 `uncle-glasses-writing-voice` skill 的語氣一致性與衝突解決順序。
2. **F19 / F7 高衝突公式停用**：`SKILL.md` 明文排除主流程自動選用 F19（立場宣言/敵我對立）、F7（POV 吐槽）與其他攻擊性/敵我對立公式；`F19_DEPLOYMENT_KIT.md` 加上停用警示橫幅；`references/rules.md`、`formulas.md`、`threads.md`、`case_studies.md` 加上統一警示區塊（原始內容保留供研究）。
3. **預設只產草稿**：`SKILL.md` 定位改為「社群內容規劃、草稿生成、平台改寫與人工確認後發布輔助」，模糊語句（如「PO 個文」）一律只觸發草稿生成。
4. **發布前需人工確認**：新增發布類觸發詞規則（需明確「發布/貼到/送出」字眼 + 平台 + 定稿內容），發布前必須完整顯示文案/平台/附件並取得使用者「確認」字眼，不得跨平台自動同步發布。
5. **禁止同步回第三方 repository**：`SKILL.md` 明文停用原開源版「P2 同步開源時機」（同步至 `../public/social-post/`）流程，禁止將 `style_profile.md`/`content_plan.md`/品牌資料推送至第三方倉庫，任何對外開源/fork/PR/同步行為需使用者另外明確授權。

## 重要聲明

**本機版本已不等同上游原始內容。** `skills-lock.json` 中記錄的 `computedHash` 僅供「安裝來源追溯」使用（證明此 skill 最初是從哪個來源、哪個版本安裝的），**不代表本機當前內容與該雜湊對應版本一致**。未來若需要驗證本 skill 是否遭意外覆寫回原始上游版本，應以本檔案列出的客製項目與 `SKILL.md`/`references/uncle-glasses-brand-guardrails.md` 的存在與內容為準，而非單純比對 `computedHash`。
