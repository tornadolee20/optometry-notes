# 08-視力保健手冊推廣計畫 ── 資料夾索引

> 建立日期：2026-05-18 ｜ 本目錄含 3 個子資料夾，估計 100+ 個檔案  
> 注意：`視力保健手冊/` 子目錄有大量 DOCX 版本迭代（V2-V20），請以最終版為準

---

## 目錄結構

```
08-視力保健手冊推廣計畫/
├─ 00-INDEX.md                              ← 本文件
├─ 2026-上半年度視力保健手冊推廣專案.md       ← 專案計畫主文件
├─ manual/                                  ← 教育部策略報告（DOCX 版本庫）
│   ├─ FINAL_PEAK_STRATEGY_REPORT_V27.docx
│   ├─ FINAL_STRATEGIC_REPORT_V31.docx
│   ├─ FINAL_ULTIMATE.docx
│   ├─ LEGACY_STRATEGY_REPORT_V28.docx
│   ├─ MOE_Detailed_Report_Final.docx
│   ├─ MOE_REPORT_FINAL.docx
│   ├─ PEAK_MOE_STRATEGIC_REPORT_V26.docx
│   ├─ SOLID_MOE_REPORT_V25.docx
│   ├─ SOLID_REFRACTION_REPORT_V29.docx
│   ├─ ULTIMATE_MOE_FINAL_REPORT_V30.docx
│   ├─ ULTIMATE_MOE_FULL_V22.docx
│   ├─ ULTIMATE_MOE_LEGACY_REPORT_V32.docx
│   ├─ ULTIMATE_MOE_MASSIVE_REPORT_V23.docx
│   ├─ ULTIMATE_MOE_MASSIVE_V24.docx
│   └─ ULTIMATE_MOE_REPORT.docx
│   （共 15 個 DOCX，V22-V32 迭代版本）
│
└─ 視力保健手冊/                             ← 手冊本體（章節 + 版本迭代）
    ├─ README.md                            ← 手冊說明（讀我先）
    ├─ 完整手冊.md / 完整手冊_正式版.md       ← 主要 MD 版本
    ├─ chapters/                            ← 7 個章節（MD 格式）
    │   ├─ 第一章-前言.md
    │   ├─ 第二章-近視基礎知識.md
    │   ├─ 第三章-近視預防策略.md
    │   ├─ 第四章-近視控制方法.md
    │   ├─ 第五章-學校執行方案.md
    │   ├─ 第六章-驗光師的角色.md
    │   └─ 第七章-常見問題.md
    ├─ appendix/                            ← 5 個附錄（MD 格式）
    │   ├─ 附錄一-視力篩檢表單.md
    │   ├─ 附錄三-家長衛教單張.md
    │   ├─ 附錄四-教室環境檢核表.md
    │   ├─ 附錄五-相關法規彙整.md
    │   └─ 附錄六-參考文獻.md
    ├─ data/                                ← 教育部近視率數據
    │   ├─ 102-10.xls（102 學年度）
    │   ├─ 103-10.xls（103 學年度）
    │   ├─ 104-9.xls（104 學年度）
    │   └─ 105-8.xls（105 學年度）
    ├─ [Python 腳本]
    │   ├─ build_v19.py                    ← 手冊建置腳本
    │   ├─ md_to_docx.py                   ← MD → DOCX 轉換
    │   └─ fix_wording.py                  ← 用詞修正腳本
    ├─ [Shell 腳本]
    │   ├─ 合併腳本.sh
    │   └─ 合併腳本_正式版.sh
    └─ [DOCX 版本迭代]（V2-V20，含教育部提交版）
        ├─ 視力保健手冊_FINAL.docx          ← ⭐ 最終提交版
        ├─ 視力保健手冊_v5_final.docx
        ├─ 視力保健手冊_政府建言版_Final.docx
        └─ （其他迭代版本，共約 35 個 DOCX）
```

---

## 正式版文件（勿覆蓋）

| 用途 | 檔案 |
|------|------|
| 手冊最終 MD | `視力保健手冊/完整手冊_正式版.md` |
| 手冊最終 DOCX | `視力保健手冊/視力保健手冊_FINAL.docx` |
| 手冊 HTML | `視力保健手冊/視力保健手冊.html` |
| 教育部提交報告 | `視力保健手冊/教育部提交專案報告_臺灣視光視力保健學會執筆專章_終極全量正式版.docx` |
| 策略報告最終版 | `manual/FINAL_ULTIMATE.docx` |

---

## 版本迭代說明

**`manual/` 策略報告版本演進：**
- V22-V24：ULTIMATE_MOE 系列（初期全量版）
- V25：SOLID 版（穩定化）
- V26：PEAK（高峰版）
- V27：FINAL_PEAK（準最終）
- V28：LEGACY（存檔）
- V29：SOLID_REFRACTION（屈光修訂）
- V30：ULTIMATE_FINAL（最終）
- V31：FINAL_STRATEGIC（正式策略版）
- V32：ULTIMATE_LEGACY（最終存檔）
- `FINAL_ULTIMATE.docx`：**目前最終版**

**`視力保健手冊/` 手冊版本演進：**
- v2-v5：早期版本
- V6-V10：教育部正式提交版系列
- V11-V14：終極全量優化版
- V15-V18：終極優化修訂版
- V19-V20：建置腳本產出版
- `視力保健手冊_FINAL.docx`：**目前最終版**

---

## 可清理的候選文件（⚠️ 清理前請確認）

| 類型 | 建議 |
|------|------|
| `manual/` 中 V22-V30 DOCX | 若 V31/FINAL_ULTIMATE 已確認為終版，V22-V30 可壓縮封存 |
| `視力保健手冊/` 中 V2-V18 DOCX | 若 FINAL 版確認，早期版本可壓縮封存 |
| `完整手冊_V20.md.tmp.31796.*` | 暫存檔，可安全刪除 |
| `build_v19.py` 等腳本 | 若已完成建置且不再需要重建，可封存 |

**⚠️ 封存前必須確認：** 手冊是否還在修訂階段？是否有機關索取更新版本？

---

## 與主系統的關聯

- 主計畫文件：`2026-上半年度視力保健手冊推廣專案.md`
- 知識來源：`obsidian-vault/02-文獻與期刊/`（近視率數據、實證研究）
- 法規依據：`obsidian-vault/05-營運SOP與模板/`
- 推廣活動任務：見該計畫文件第 26 行的 `#AI之眼` 專案項目
