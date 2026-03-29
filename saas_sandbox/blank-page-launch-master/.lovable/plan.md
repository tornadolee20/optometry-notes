

# 店家自助轉移管理權 — 實作計畫

## 概述
讓店家擁有者從自己的儀表板 (`/store/:id`) 發起管理權轉移，複用現有 `StoreTransferModal`。

---

## 1. 資料庫遷移

新增一條 RLS INSERT policy 到 `store_transfer_requests`：

```sql
-- 給 store owner 用的：允許店家擁有者為自己的店建立轉移請求
-- 【未來重構注意】改成 store_owners 多對多時，改查 store_owners.user_id + is_primary
CREATE POLICY "Store owners can create transfer requests"
ON public.store_transfer_requests
FOR INSERT TO authenticated
WITH CHECK (
  store_id IN (
    SELECT id FROM public.stores WHERE user_id = auth.uid()
  )
);
```

---

## 2. 前端修改

**`src/pages/StoreProfile.tsx`**
- Import `StoreTransferModal` 和 `ArrowRightLeft` icon
- 新增 `showTransferModal` state
- 在「快速操作」區塊（grid）末尾加一個「轉移管理權」按鈕（僅 `isOwner` 時顯示）
- 渲染 `StoreTransferModal`，傳入 `storeId`、`storeName`、`currentOwnerEmail`

不需要修改其他檔案，`StoreTransferModal` 已經包含完整的 insert 邏輯、console.log 連結、clipboard 複製、Telegram 通知。

---

## 修改檔案清單

| 檔案 | 改動 |
|---|---|
| 資料庫遷移 (新) | 新增 store owners INSERT policy |
| `src/pages/StoreProfile.tsx` | 加轉移按鈕 + modal |

