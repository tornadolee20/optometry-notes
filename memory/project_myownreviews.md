---
name: MYOWNREVIEWS 專案技術細節
description: SaaS 評論平台的技術架構、Supabase 專案 ref、部署指令與關鍵設計決策
type: project
---

## 基本資訊
- **GitHub**：`tornadolee1720/blank-page-launch`（私有 repo，不同帳號於 tornadolee20）
- **本地路徑**：`C:\Users\torna_3j3fz9h\Desktop\blank-page-launch`
- **Supabase 專案 ref**：`wfaqnahahygtieyjnlji`
- **Tech Stack**：React 18 + TypeScript + Vite + Shadcn/ui + Supabase + Deno Edge Functions

## Edge Function 部署指令
```bash
cd /c/Users/torna_3j3fz9h/Desktop/blank-page-launch
SUPABASE_ACCESS_TOKEN=<token> npx supabase functions deploy <function-name> --project-ref wfaqnahahygtieyjnlji
```
⚠️ **Windows 上必須串行部署**，並行會觸發 `EBUSY: resource busy or locked` npm 錯誤。

## types.ts 重新生成指令
```bash
SUPABASE_ACCESS_TOKEN=<token> npx supabase gen types typescript --project-id wfaqnahahygtieyjnlji > src/integrations/supabase/types.ts
```

## 產業模板系統架構
- 每個模板 48 個關鍵字，4 個 category：`service` / `tech` / `env` / `price`
- Edge Function `generate-template-keywords`：產業特化研究框架，初次請求 60 個過濾取 48
- Edge Function `generate-brand-keywords`：品牌專用，8 個 dimension，映射到 4 category
- 共用模組：`supabase/functions/_shared/openai.ts`（corsHeaders、callOpenAI、charCount）
- 字數計算必須用 `[...str].length`（Unicode aware），`str.length` 對中文不準確

## 推薦碼設計
- 格式：`STORE` + store_number 補零至 6 位（例：`STORE000014`）
- 工具函式：`src/utils/referral-code.ts`（`storeNumberToCode` / `isValidReferralCode`）
- 已實作：Register.tsx 輸入欄、StoreProfile.tsx 統計顯示
- `referred_by_code` 欄位已在 types.ts 中（2026-04-02 重新生成）

## Why / How to apply
**Why：** 這是大叔第二個主要 SaaS 產品，與 optometry-notes 是不同 repo 不同 GitHub 帳號。
**How to apply：** 下次處理 MYOWNREVIEWS 任務時，直接用上方路徑與指令，不需重新詢問。
