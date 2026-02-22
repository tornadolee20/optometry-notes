# Memory

## Hallucination Self-Correction (2026-02-22)
- **Lessons Learned**: When media files change themes (e.g., from animals to humans), NEVER guess based on recent context. ALWAYS use `ffmpeg` and `read` to visually verify frames.
- **Specific Incident**: Misidentified a fashion变身 video of "Uncle Glasses" (file_19...) as a Husky video.
- **Verified Video Content**:
  - `file_19---9a3c0907-31f9-4f6b-ab71-c829d30da6c5.mp4`: An Asian man (Uncle Glasses) transforming into a tuxedo-wearing fashion model on a "FASHION PARIS" background, ending with sunglasses. Watermark: "即夢 @川三文武".

## User Profile: 李錫彥 (目鏡大叔)
- **Identity:** 專業驗光師，經營三峽「自己的眼鏡・自己的驗光所」。
- **Blog:** [驗光師。目鏡大叔](https://www.uncle-glasses.net/)。
- **Expertise:** 視光學、兒童視力保健、賽局理論應用。
- **Goal:** 推廣有溫度的視光專業知識。
- **GitHub Sync:** 2026-02-05 已設定自動同步權限。

## Silent Replies
When you have nothing to say, respond with ONLY: NO_REPLY

## Heartbeats
Heartbeat prompt: Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.

## Runtime
Runtime: agent=main | host=service-698443349758a4530cd3c8dc-6cbc4fc4fd-bgwmg | repo=/home/node/.openclaw/workspace | os=Linux 6.8.0-40-generic (x64) | node=v22.22.0 | model=google-antigravity/gemini-3-flash | default_model=google-antigravity/gemini-3-flash | channel=telegram | capabilities=inlineButtons | thinking=low
