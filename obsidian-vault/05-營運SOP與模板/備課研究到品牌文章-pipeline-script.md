---
title: 備課研究到品牌文章：可重跑 Pipeline Script
created: 2026-07-08
type: workflow-pipeline-script
status: active
workflow: lesson-prep-research-to-brand-article
related:
  - [[一鍵工作流-備課研究到品牌文章]]
  - [[備課研究到品牌文章-metadata-schema]]
  - [[備課研究到品牌文章-檔名與資料夾規則]]
  - [[備課研究到品牌文章-驗證腳本模板]]
---

# 備課研究到品牌文章：可重跑 Pipeline Script

這份筆記是「備課研究到品牌文章」工作流的第一版 pipeline 層。  
它不是全自動研究機器，而是先把「每次要建立哪些檔案骨架、放哪裡、怎麼互相連結」自動化。

對應 Hermes Skill：

```text
lesson-prep-research-to-brand-article
```

對應腳本：

```text
C:\Users\torna_3j3fz9h\AppData\Local\hermes\skills\research\lesson-prep-research-to-brand-article\scripts\create_asset_pack.py
```

搭配驗證腳本：

```text
C:\Users\torna_3j3fz9h\AppData\Local\hermes\skills\research\lesson-prep-research-to-brand-article\scripts\validate_asset_pack.py
```

---

## 1. 這個 pipeline 目前能做什麼

目前第一版可以：

- 依照日期、slug、topic 建立 Obsidian 檔案骨架。
- 支援 minimal / brand / complete 三種模式。
- 自動套入基本 frontmatter。
- 自動填入 `workflow: lesson-prep-research-to-brand-article`。
- 自動填入 `asset_type`。
- 自動產生 related_assets wikilinks。
- 建立研究工作流、專業文章、評審報告等基本段落。
- 預設不覆蓋既有檔案。
- 可用 `--dry-run` 先看會產生什麼。

---

## 2. 這個 pipeline 目前不能做什麼

目前不能：

- 自動完成文獻搜尋。
- 自動判讀 DOI / PMID。
- 自動寫出最終專業文章。
- 自動宣告 publish-ready。
- 自動取代專業評審。
- 自動做聲紋後安全複審。

換句話說，這一版是：

```text
自動建立資產包骨架，不是假裝自動完成研究。
```

---

## 3. 三種模式

### 3.1 minimal

建立最小可用資產包：

```text
研究工作流筆記
專業文章草稿
文章評審報告
```

### 3.2 brand

建立聲紋相關資產：

```text
目鏡大叔品牌版
聲紋後安全複審
```

### 3.3 complete

建立完整資產包骨架：

```text
研究工作流筆記
MOC 主題索引
證據地圖
過度宣稱防火牆
教學設計卡
專業文章草稿
文章評審報告
目鏡大叔品牌版
聲紋後安全複審
```

---

## 4. 使用方式

### 4.1 Dry-run

先看會建立哪些檔案，不真的寫入：

```bash
python create_asset_pack.py \
  --vault-root "C:/Users/torna_3j3fz9h/optometry-notes/obsidian-vault" \
  --date YYYY-MM-DD \
  --slug "主題slug" \
  --topic "主題名稱" \
  --mode minimal \
  --dry-run
```

### 4.2 建立 minimal 資產包

```bash
python create_asset_pack.py \
  --vault-root "C:/Users/torna_3j3fz9h/optometry-notes/obsidian-vault" \
  --date YYYY-MM-DD \
  --slug "主題slug" \
  --topic "主題名稱" \
  --mode minimal
```

### 4.3 建立 complete 資產包

```bash
python create_asset_pack.py \
  --vault-root "C:/Users/torna_3j3fz9h/optometry-notes/obsidian-vault" \
  --date YYYY-MM-DD \
  --slug "主題slug" \
  --topic "主題名稱" \
  --mode complete
```

---

## 5. 建議標準操作順序

```text
1. 先 dry-run
2. 確認檔名與路徑合理
3. 執行 create_asset_pack.py 建立骨架
4. 進行研究、填入來源、證據、文章、評審
5. 執行 validate_asset_pack.py 驗證
6. 若有聲紋版，再跑 brand 模式與聲紋後安全複審
```

---

## 6. 安全原則

- 預設不覆蓋既有檔案。
- 遇到既有檔案會 `SKIP_EXISTS`。
- 只有明確加 `--overwrite` 才會覆蓋。
- 不把草稿標成 publish-ready。
- 不假裝已完成研究。
- 不跳過專業文章評審。
- 不跳過聲紋後安全複審。

---

## 7. 與前面三層的關係

這個 pipeline 依賴：

- [[備課研究到品牌文章-metadata-schema]]：決定 frontmatter 與狀態欄位。
- [[備課研究到品牌文章-檔名與資料夾規則]]：決定路徑與檔名。
- [[備課研究到品牌文章-驗證腳本模板]]：決定跑完後怎麼驗證。
- [[備課研究到品牌文章-主題輸入表]]：決定啟動前要收集哪些欄位。

主入口仍然是：

- [[一鍵工作流-備課研究到品牌文章]]

---

## 8. 下一階段優化方向

接下來可以優化：

1. 主題輸入表。→ 已建立：[[備課研究到品牌文章-主題輸入表]]
2. 案例庫。→ 已建立：[[備課研究到品牌文章-案例庫]]
3. DOI / PMID 格式檢查。
4. wikilink 雙向圖譜檢查。
5. review_score 自動門檻判定。
6. 拆分子 Skill：證據評估、過度宣稱防火牆、聲紋轉譯、安全複審。

---

## 9. Ad-hoc verification 應檢查錨點

每次修改本 pipeline，至少檢查：

- workflow: lesson-prep-research-to-brand-article
- create_asset_pack.py 路徑存在
- validate_asset_pack.py 路徑存在
- minimal / brand / complete 三種模式存在
- dry-run 存在
- SKIP_EXISTS 存在
- --overwrite 安全開關存在
- 不宣告 publish-ready 的限制存在
- 與一鍵工作流、metadata schema、檔名規則、驗證模板互相連結
