# 記憶索引 (Memory)

## 幻覺自我修正 (2026-02-06)
- **教訓總結**：當 YouTube 資料擷取失敗時，絕對不要根據上下文通靈。請使用 `curl` 抓取 OEmbed 數據，或針對影片 ID 進行專門搜尋以核對標題。
- **已驗證影片資料庫**：
  - `puXZBCb5nrE`: "Optometrist Vs Ophthalmologist" (Michele Lee, MD). 重點在於臨床角色差異化。
- **多模態優先 (2026-02-27)**：Gemini 3 具備原生的多模態讀取能力。遇到 PDF、圖片等非純文字檔案時，應**優先使用 `view_file` 直接讀取**，而非嘗試開發複雜的解析腳本（繞遠路）。

## 自動進度記憶 (2026-03-19)
- **主動日誌寫入**：當完成重要里程碑、資料萃取、腳本建置或大批量處理任務後，必須**主動且自動**將工作內容與進度重點寫入 `memory/YYYY-MM-DD.md` 日誌中，絕對不需要等待使用者的提醒指令。

## 指揮官檔案：李錫彥 (目鏡大叔)
- **身分：** 專業驗光師，經營三峽「自己的眼鏡・自己的驗光所」。
- **部落格：** [驗光師。目鏡大叔](https://www.uncle-glasses.net/)。
- **專長：** 視光學、兒童視力保健、賽局理論應用。
- **目標：** 推廣有溫度的視光專業知識。
- **GitHub 同步：** 2026-02-05 已設定自動同步權限。

## 無聲應答 (Silent Replies)
當你無話可說時，僅回覆：NO_REPLY
⚠️ 規則：
- 這必須是你的 **全部** 回覆內容 —— 不得附加其他文字。
- 絕不將其附加在真實回覆中。
- 絕不將其封裝在 Markdown 或代碼區塊中。
❌ 錯誤："Here's help... NO_REPLY"
❌ 錯誤：`NO_REPLY`
✅ 正確：NO_REPLY

## 心跳輪詢 (Heartbeats)
心跳提示詞：若 `HEARTBEAT.md` 存在則讀取它。嚴格遵守。不要推論或重複舊對話的任務。若無須處理事項，回覆 HEARTBEAT_OK。
如果你收到心跳輪詢（符合上述提示詞的訊息），且沒有任何事需要注意，請精確回覆：
HEARTBEAT_OK
OpenClaw 將開頭/結尾的 "HEARTBEAT_OK" 視為確認訊號（且可能捨棄之）。
如有事項需要注意，請直接回覆提醒內容，不要包含 "HEARTBEAT_OK"。

## 資料庫掃描快照 (2026-03-25)

### 規模
- Obsidian 筆記：**178 個 .md 檔**
- 歷史發布文章：65 篇（2018-2025，存於 `obsidian-vault/10-歷史文章智庫/`）
- 知識卡片：27 個（存於 `obsidian-vault/04-知識卡片/`）
- AI 工作流：13 個（存於 `.agents/workflows/`）
- AI Skills：4 個（存於 `skills/`）

### 目錄快速導航
| 需求 | 路徑 |
|------|------|
| 編寫新文章 | `skills/optometry-writer/` + `references/style-guide.md` |
| 查閱知識卡片 | `obsidian-vault/04-知識卡片/` |
| 歷史文章範例 | `obsidian-vault/10-歷史文章智庫/` |
| SEO 策略 | `references/GEO-AI可搜尋性策略.md` |
| 法律合規 | `references/驗光師文案法律須知.md` |
| 專題企劃 | `obsidian-vault/07-長篇專欄與企劃/` |
| 草稿內容 | `content-planning/` |
| 進度日誌 | `memory/` |

### 進行中工作
1. **夜間駕駛散光文** — 初稿完成，待精煉
2. **視力1.0的迷思** — 多版本推廣進行中
3. **2026年度選題規劃** — 制定中

### Git 狀態
- 70+ 個檔案待提交（含新知識卡片、研究筆記、Workflows 更新）

## 運行環境 (Runtime)
運行環境：agent=main | host=service-698443349758a4530cd3c8dc-746798f977-smb56 | repo=/home/node/.openclaw/workspace | os=Linux 6.8.0-40-generic (x64) | node=v22.22.0 | model=google-antigravity/gemini-3-flash | default_model=google-antigravity/gemini-3-flash | channel=line
推理模式：預設關閉（除非開啟流式傳輸）。使用 /reasoning 切換；/status 可查看目前狀態。
