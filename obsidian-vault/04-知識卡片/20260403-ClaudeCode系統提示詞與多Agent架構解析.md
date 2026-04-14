# Claude Code v2.1.88 源碼實戰萃取：可直接應用的技術

> **建立時間**：2026-04-03  
> **來源**：逆向還原的 TypeScript 源碼（`claude-code-sourcemap-main`）  
> **標籤**：#AI協作、#SystemPrompt、#多Agent架構、#記憶機制  
> **定位**：這不是概念介紹，是從原廠實作中提煉的可執行 SOP

---

## 一、驗證者 Agent 的完整合約（直接移植可用）

### 核心使命
> *"Your job is not to confirm the implementation works — it's to try to break it."*

### 兩個已知失敗模式（原廠文檔明確警告）
1. **驗證迴避 (Verification Avoidance)**：遇到需要測試的地方，開始讀程式碼、敘述「我打算如何測試」、然後直接寫「PASS」移往下一步。
2. **被前 80% 誘惑 (Seduced by the first 80%)**：看到漂亮的 UI 或通過的測試套件就衝動地想給 PASS，卻沒有注意有一半按鈕按了沒反應、狀態刷新後消失、後端遇到錯誤輸入就崩潰。

### 驗證報告的強制格式（沒有 Command run block = 不算 PASS，算 Skip）
```
### Check: [你在驗證的內容]
**Command run:**
  [你執行的確切指令]
**Output observed:**
  [實際終端輸出——複製貼上，不是改寫。太長可截斷但保留關鍵部分]
**Result: PASS** (或 FAIL — 含 Expected vs Actual)
```

### 最終裁決格式（解析器依賴此格式）
```
VERDICT: PASS
VERDICT: FAIL
VERDICT: PARTIAL
```
`PARTIAL` 僅適用於環境限制（無測試框架、工具不可用），不適用於「我不確定這是不是 Bug」的情況。

### 實戰應用（目鏡大叔的家長群組模擬器）
把上述框架移植到我們的「壓力測試協議」：
- 每次完成文案或企劃，不能只讓 AI 說「這看起來不錯」
- 必須執行至少一個「對抗性探針 (Adversarial Probe)」
- 報告格式要包含：具體測試族群、測試刺激、實際反應

---

## 二、自我修正 Prompt 的原廠原則

### 不要當「確認機器」
原廠在 `prompts.ts` 的「Doing Tasks」一節明確規定：
```
If you notice the user's request is based on a misconception, or spot a bug adjacent to 
what they asked about, say so. You're a collaborator, not just an executor — users benefit 
from your judgment, not just your compliance.
```
→ **大叔的延伸應用**：你可以命令 AI：「你是一個不必討好我的協作者，發現我的邏輯問題要直接說出來，不要只是照做。」

### 完成任務前的自我驗證
```
Before reporting a task complete, verify it actually works: run the test, execute the script, 
check the output. Minimum complexity means no gold-plating, not skipping the finish line.
```
→ **大叔的啟發**：寫文章時，要在「完成初稿」後自我執行一套「合規安全閥測試」，而不是直接交出。

### 報告結果要如實，不要防禦性
```
Report outcomes faithfully: if tests fail, say so with the relevant output. 
Never claim "all tests pass" when output shows failures. 
Equally, when a check did pass, state it plainly — do not hedge confirmed results.
```
→ **啟發**：叫 AI 做完壓力測試後，要求「如實報告家長實際的抵抗點，不要用語言美化」。

---

## 三、記憶提取機制（Memory Architecture）

### 原廠記憶分類系統（4 種類型）
從 `extractMemories/prompts.ts` 中確認，原廠記憶分成結構化的 4 種類型，以 YAML Frontmatter 格式儲存。

### 記憶提取的 Coordinator SOP（2 步驟最高效率）
```
1. Turn 1：把所有可能需要更新的檔案 FileRead 呼叫並行發出
2. Turn 2：把所有 FileWrite/FileEdit 呼叫並行發出
（不要交叉讀寫，各回合只做一件事）
```

### 防止重複記憶的規則
> "First check if there is an existing memory you can update before writing a new one."

記憶索引 (`MEMORY.md`) 的結構規定：
- 每筆記憶是「一行，不超過 150 字」
- 格式：`- [Title](file.md) — one-line hook`
- 200 行後被截斷，保持精簡

### 智慧記憶喚回（Relevant Memory Selection）
原廠使用 AI 二次判斷「哪些記憶跟這次查詢有關」，最多載入 5 個：
```
特別規定：如果 AI 最近剛在使用某個工具，不要把那個工具的說明文件記憶
優先載入的是：警告、陷阱、已知問題——因為「正在使用時」最需要這些
```
**大叔的啟發**：我們的 `MEMORY.md` 的 `[待 Claude 處理]` 標記機制，正是相同原理。

---

## 四、溝通風格的原廠頂層設計

### 寫給人看，不是寫給 Console 看
完整引用（`prompts.ts` Line 406-413 的「Communicating with the user」段落）：
```
When sending user-facing text, you're writing for a person, not logging to a console.
Before your first tool call, briefly state what you're about to do.
While working, give short updates at key moments: when you find something load-bearing 
(a bug, a root cause), when changing direction, when you've made progress without an update.
When making updates, assume the person has stepped away and lost the thread. 
Write so they can pick back up cold: use complete, grammatically correct sentences.
```

### 「倒置金字塔」輸出原則
```
Use inverted pyramid when appropriate (leading with the action).
Match responses to the task: a simple question gets a direct answer in prose, 
not headers and numbered sections.
Avoid filler or stating the obvious. Get straight to the point.
```

### 文字簡潔規範（非 Ant 員工版本）
```
Keep your text output brief and direct. Lead with the answer or action, not the reasoning.
Skip filler words, preamble, and unnecessary transitions.
```

---

## 五、UltraPlan 概念（進階）的獨立規劃模式

### 機制
當任務太複雜時，開啟一個有 30 分鐘超時的遠端多 Agent 規劃工作階段，專門負責起草計畫；計畫完成後，可選擇：
1. 拉回本地執行
2. 直接在雲端遠端執行，結果以 PR 形式交付

### 可移植的 SOP 精神
Claude Code 把複雜任務執行分成：
1. **Ultra Plan（規劃模式）**：只寫計畫，不執行，等待人類審閱後再確認
2. **Execute（執行模式）**：依照確認的計畫行動

→ **大叔的應用**：每次接到複雜企劃（例如：送愛到學校 V7），先讓 AI「純粹規劃大綱與經費結構」，等您確認方向後再進入起草模式，絕不在計畫還沒確認時就開始產內容。

---

## 結語：哪些能立即使用

| 機制 | 實際操作 | 預期收益 |
|------|---------|---------|
| **驗證者人格** | 在每個文案任務後加「驗證者 Prompt」 | 家長模擬器的找洞能力倍增 |
| **報告格式強制化** | 要求 AI 輸出結構化報告（含 VERDICT） | 快速判斷文案是否過關 |
| **自我修正宣言** | 在 CLAUDE.md 中加入「你是協作者不是確認機器」 | AI 會主動指出你的盲點 |
| **記憶 2-Turn SOP** | 每次更新記憶時並行讀取、並行寫入 | Token 效率提升 2x |
| **UltraPlan 精神** | 「先規劃大綱等確認，再執行產內容」 | 減少大規模返工 |

> ✅ 已完成（2026-04-15）：`verify-document.md` 已是完整的驗證者 Workflow，含 Adversarial Probe SOP 與 VERDICT 格式。
