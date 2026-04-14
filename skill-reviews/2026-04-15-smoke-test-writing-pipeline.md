---
date: 2026-04-15
type: smoke-test
scenarios: [3, 6]
verdict: PARTIAL / PASS
---

# Smoke Test 結果報告 — 寫作管線

## Scenario 3：Research → Blog Article

### 實際執行
- **Input**：`20260403-全穀物攝取與兒童近視保護效應.md`（知識卡片）
- **Chain 實際走法**：知識卡片（已有，相當於 paper-digest 完成）→ CAST 飛輪展開（writing-voice）→ HTML 草稿輸出

### 對比預期鏈
| 步驟 | 預期 | 實際 | 狀態 |
|------|------|------|------|
| paper-digest-core | lead | 知識卡片已存在，跳過 | ✅ 合理 |
| uncle-glasses-writing-voice | 2nd | 執行（CAST 飛輪）| ✅ |
| uncle-glasses-writing-qa | 3rd | **跳過**（事後補跑）| ⚠️ |
| optometry-html-renderer | 4th | 執行（內嵌在草稿）| ✅ |
| uncle-glasses-blog-packager | 5th | **跳過**（草稿階段）| ⚠️ 合理 |

### Verdict
**PARTIAL** — 鏈的核心跑通，但 writing-qa 在首輪被跳過，事後才補診斷。
根本原因：草稿直出 HTML 時，沒有在 voice 和 renderer 之間插入 QA 關卡。
**修正方向**：在 CAST 飛輪完成後，下次明確觸發一次 writing-qa 再輸出 HTML。

---

## Scenario 6：Draft Diagnosis（writing-qa 實測）

### 執行對象
- `drafts/20260415-驗光所vs眼鏡行差別.html`

### 診斷結果
| 維度 | 評分 | 問題 |
|------|------|------|
| Voice Match | revise | 開場後段有一句 AI 解釋自己為何寫作 |
| AI Tone Risk | medium | 兩處輕微：meta 句 + 承諾結尾過度陳述 |
| Structure Flow | pass | — |
| Credibility Balance | pass | — |
| Specificity | pass | 土城案例具體有力 |

### 修正執行
1. ✅ 刪除 AI 自述句（「因為很多人在搜尋這個問題…」）
2. ✅ 刪除防禦性免責前綴（「說清楚一件事：我這樣說，不是為了說眼鏡行不好」）
3. ✅ 精簡承諾結尾（移除「這是我寫部落格 8 年」）

### Verdict
**PASS（修正後）** — writing-qa skill 正確識別了三個弱點，修正後文章 AI 味降低，聲音更直接。

---

## 總結

| 場景 | 結果 | 核心發現 |
|------|------|---------|
| Scenario 3 | PARTIAL | writing-qa 需要在 voice 完成後明確觸發，不能靠事後補 |
| Scenario 6 | PASS | writing-qa skill 診斷準確，修正建議可執行 |

## 下次改進
- Scenario 3 鏈應改為：voice → **qa（強制）** → renderer → packager
- 在 CLAUDE.md 或 TASK-TO-CORE-CHAIN.md 加一條：「草稿輸出 HTML 前，必須過 writing-qa」
