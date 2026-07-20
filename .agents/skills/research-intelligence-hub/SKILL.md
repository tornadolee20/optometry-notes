---
name: research-intelligence-hub
description: 目鏡大叔研究情報中心，負責自動搜尋、去重、評分視光醫學、視覺飲食與實體店行銷研究，並導出符合 research-to-content 的標準 YAML 交接包。
---

# 目鏡大叔研究情報中心

本技能負責為「目鏡大叔」品牌主動搜集、篩選、評估高質量的學術研究，並無縫交接給下游的內容工廠。

## 🎯 監測領域與三大雷達

### 1. 視光醫學研究雷達 (Optometry Medical Research)
- **範疇**：兒童近視控制（眼軸與屈光）、雙眼視覺機能、數位疲勞、熟齡視覺。
- **邊界**：必須嚴格核對論文本體，嚴禁把「關聯性」直接寫成「因果預防關係」。

### 2. 視覺飲食研究雷達 (Visual Diet Research)
- **範疇**：光線飲食（光照與光譜）、距離飲食、空間飲食、螢幕飲食、色彩對比與生活節律。
- **邊界**：「舒服」不等於「預防疾病」，「視覺環境合理」不等於「保證控制近視」。

### 3. 實體店行銷與經營研究雷達 (Store Marketing & Management Research)
- **範疇**：消費者行為、門市健康溝通、A/B 實驗設計、線下實體店經營模式。
- **邊界**：須轉化為門市可落地執行的具體實驗格式。

---

## ⚙️ 核心流程規範

### 🛑 搜尋停止條件 (Anti-Oversearch)
為了避免文獻檢索陷入「無限套娃」尋找，必須在滿足以下任一條件時立刻停止：
1. **重要分歧已涵蓋**：主要學術觀點與證據已涵蓋。
2. **來源開始重複**：新搜尋結果中 80% 以上已在庫。
3. **沒有新研究**：證明當前無值得報告的新進展，空結果也是合格的報告。

### 📋 證據等級定義 (Level of Evidence)
- **A 級**：系統性文獻回顧 (Systematic Review)、統合分析 (Meta-Analysis)、大型隨機雙盲對照試驗 (RCT)。
- **B 級**：隊列研究 (Cohort Study)、病例對照研究 (Case-Control Study)。
- **C 級**：橫斷面研究 (Cross-Sectional Study)、描述性研究。*（即使結論再吸引人，評分亦設有上限，不能作為確切因果宣稱）*
- **D 級**：專家意見、病例報告、體外/動物實驗。*（僅作觀察，不進入直接衛教宣稱）*

---

## 🗃️ 交接數據包規格 (YAML Handoff Schema)
篩選為「立即處理」的文獻，必須生成以下格式的 YAML：

```yaml
research_handoff:
  topic: "研究主題"
  discovered_at: "YYYY-MM-DD"
  source:
    title: "論文標題"
    authors: ["作者1", "作者2"]
    journal: "期刊名稱"
    pub_date: "YYYY-MM-DD"
    doi: "10.xxxx/xxxx"
    pmid: "xxxxxx"
    evidence_level: "A | B | C | D"
  evaluation:
    domain: "optometry | visual_diet | store_marketing"
    score: 85
    key_findings:
      - "發現 1"
      - "發現 2"
    clinical_relevance: "對臨床或內容生產 the 實際價值說明"
  routing: "immediate" # immediate | weekly | observation | exclude
  ab_test_suggestion: # 僅適用於 store_marketing
    hypothesis: "A/B 測試假說"
    metric: "衡量指標"
```
