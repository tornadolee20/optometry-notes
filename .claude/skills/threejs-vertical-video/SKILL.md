---
name: threejs-vertical-video
description: 用 Three.js 程式生成 3D 場景 + numpy 原創配樂，逐格擷取並用 ffmpeg 合成 9:16 直式短片 MP4（Reels/Shorts/限動）。適用：節慶祝福短片、氛圍型品牌短片、無實拍素材的 3D 動畫（如「秋天許願楓樹林」）。觸發詞：3D 短片、Three.js 影片、氛圍動畫、祝福影片、程式生成配樂、逐格算圖。不適用：有旁白對齊的衛教影片（改用 uncle-glasses-hyperframes-video）、實拍剪輯。
---

# Three.js 直式 3D 短片工作流

範本專案：`video-maple/`（秋天許願楓樹林，2026-11-26 完成）。新片直接複製這個資料夾改，不要從零寫。

| 檔案 | 作用 |
|------|------|
| `index.html` | importmap 載入 three、字型（@fontsource/noto-sans-tc）、文字疊層 `#title` |
| `main.js` | 場景 + 後製管線，對外暴露 `window.renderAt(t)` 與 `window.sceneReady` |
| `still.js` | `node still.js <秒> <out.png>` 算單張預覽 |
| `capture.js` | `node capture.js <影格資料夾>` 逐格存 JPEG，可中斷續跑 |
| `music.py` | `python3 music.py out.wav` numpy 合成原創配樂 |
| `mux.sh` | `bash mux.sh <影格> <wav> <out.mp4>` 合成 + ffprobe 驗證 |

## 流程（依序，不可跳步）

1. **規格確認**：解析度（預設 1080×1920、30fps）、秒數、上方約 250px／下方約 400px 安全區、結尾文字與出現時間。
2. **場景寫成 t 的純函數**：所有動畫只看 `t`，亂數用固定種子（mulberry32）。這樣逐格算圖才會穩定、可重算任一格。
3. **先出 2 張關鍵格給大叔審**（中段 + 結尾文字格），用 `still.js`。**等核可再全片算圖**，全片很貴。
4. **配樂**與算圖可並行：`music.py` 改和弦／旋律表即可換曲。
5. **全片擷取**：背景執行、`timeout` 設 7200000（2 小時），進度寫 log。
6. **合成**：`mux.sh`，最後用 ffprobe 驗規格、ebur128 量響度、抽 4 格拼接圖目檢。
7. 交付 MP4（不入 git，`.gitignore` 已排除 `*.mp4 *.wav frames/`），寫 `memory/YYYY-MM-DD.md`。

## 已踩過的坑（重要）

- **無 GPU 雲端環境**：Chromium 需 `--use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`；約 11 秒／格，450 格約 80 分鐘。CPU 已滿載，平行化沒用；本機有 GPU 會快很多。
- **別把影格直接 pipe 給 ffmpeg**：背景任務預設 30 分鐘會被砍，進度全失。一定要逐格存檔、已存在就跳過（`capture.js` 已這樣做）。
- **初版畫面容易「過白、卡通」**：調低天空亮度與曝光、加深霧色、提高 bloom 門檻、樹葉密而小、在光源處加柔光罩（sun veil）讓地平線過渡自然。
- **字型**：`sceneReady` 要等 `document.fonts.load(...)` 完成，否則前幾格文字是預設字體。
- **景深要用 DepthTexture + MSAA render target**，自製 gather DOF；焦距隨鏡頭推近插值到主角物件。
- **配樂**：音符起點加人性化抖動時可能小於 0，切片前要 `max(0, at)`。成品先正規化到 -3 dBFS 峰值，合成時再降約 3.5 dB → 約 -16 LUFS，溫柔不刺耳。
- 包絡：開頭 1 秒淡入、文字出現時收弱到約 0.72、最後 1.5 秒淡出。

## 撰文／法規

畫面文字也適用 `references/驗光師文案法律須知.md` 與撰文禁忌（不用破折號「——」）。發布到社群前須先詢問大叔。
