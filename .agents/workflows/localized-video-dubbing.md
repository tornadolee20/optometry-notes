---
description: 英文短影音在地化翻譯、台灣口音配音、字幕燒錄與剪輯標準工作流 SOP
---

# /localized-video-dubbing (影片在地化配音與字幕自動化工作流)

**執行者**：Antigravity (目鏡大叔 AI)  
**啟動時機**：當前輩提供影片檔案（如 `.mp4`），並要求「翻譯繁體中文」、「換台灣口音配音」、「燒錄字幕」或「剪輯標籤/浮水印」時啟動。

---

## ⚙️ 標準自動化流水線 (The 5-Step Pipeline)

### Step 1. 音訊提取與語音辨識 (Audio Extraction & Whisper)
- **工具**：`ffmpeg` + `openai-whisper`
- **動作**：
  1. 使用 `ffmpeg` 從影片中提取 16kHz 單聲道 WAV 音訊。
  2. 執行 Whisper 模型產生英文逐字稿與時間戳 JSON（`start`, `end`, `text`）。

### Step 2. 視光人文在地化翻譯 (Atul Gawande Optometry Refinement)
- **原則**：
  1. **在地化專業詞彙**：統一使用台灣標準詞彙（如「驗光所」、「視力表」、「《刺胳針》」）。
  2. **避免字數冗長**：精簡句型，避免因字數過多導致 TTS 生成音效過長而引發「搶拍感」。
  3. **語意溫暖流暢**：從生活功能與照護感受切入，避免生硬俚俗或字面直譯。

### Step 3. 台灣自然語音合成與 1:1 時間軸控速 (Edge-TTS + FFmpeg atempo)
- **語音模型選項**：
  - **台灣自然男聲**：`zh-TW-YunJheNeural` (雲哲 - 溫和親切視光首選)
  - **台灣自然女聲**：`zh-TW-HsiaoChenNeural` (曉臻 - 清晰專業首選)
- **嚴禁事項**：
  - **嚴禁使用聲音克隆 (Voice Cloning / Fish Audio / Voicebox)**：克隆聲音極度不可控且維護成本高昂，破壞工作流。
- **1:1 時間軸對齊機制**：
  1. 針對每段台詞生成獨立音檔。
  2. 比對畫面時間區間（`target_dur`），使用 `ffmpeg -filter:a "atempo=X"` 進行音調不變的精準伸縮，確保 **0 毫秒時間差影音字幕對齊**。

### Step 4. 標準音訊格式封裝 (Standard Audio Encoding)
- **關鍵規範**：
  - 音軌採樣率**必須壓製為標準 44.1kHz (44100Hz) AAC**，聲道規格設為標準單/雙聲道，避免特殊採樣率（如 24kHz）導致通用播放器靜音無聲。

### Step 5. 字幕燒錄與影音合成 (Subtitles & Final Muxing)
- **字幕樣式**：
  - 使用 `subtitles` 濾鏡燒錄硬字幕，字體大小 `16`、白色內面 `PrimaryColour=&H00FFFFFF`、黑色描邊 `OutlineColour=&H00000000`。
- **輸出規格**：
  - 高畫質 `libx264` + `aac` 雙軌，最終輸出至指定檔案位置。

---

## 📌 失敗自我修正經驗庫 (Self-Correction Log)

1. **聲音搶拍/趕火車**：因為台詞過長強行縮進短區間。→ **解法**：精簡中文台詞 20%，並將 atempo 上限封頂在 1.15x。
2. **影片播放無聲音**：TTS 預設產出 24kHz 音訊。→ **解法**：ffmpeg 合成時強制指定 `-ar 44100 -c:a aac -b:a 128k`。
3. **底音雙語重疊干擾**：把帶有原英文旁白的音軌當背景音樂混音。→ **解法**：完全剔除原片語音音軌，改為 100% 乾淨中配獨奏。
