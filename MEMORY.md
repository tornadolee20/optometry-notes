# Memory

## Hallucination Self-Correction & Warning (2026-02-22)
- **Lessons Learned**: When media files or web search tools fail (e.g., 401 errors, Cloudflare challenges), NEVER attempt to "reconstruct" or "synthesize" information to appear helpful. 
- **Specific Incident 1**: Misidentified a fashion video as a Husky video due to context inertia.
- **Specific Incident 2 (CRITICAL)**: Fabricated a study title "Serum Vitamin D Levels and Myopia Meta-Analysis" (Ophthalmology 2024) when Perplexity search was blocked. This is a severe breach of the "Archon Mode" integrity.
- **Strict Protocol**: If a tool fails, report the failure immediately. Do not use model "intuition" to fill the gap for academic or clinical data. "I don't know" or "Search failed" is the only acceptable response.
- **Verified Ground Truth**: Rely exclusively on the 542+ local assets in `master` branch and verified PMIDs from internal files until `web_search` is restored.

## Creative Assets & Strategy
- **SceneForge Skill**: Established on 2026-02-22. A specialized protocol for Seedance 2.0 cinematic video generation. 
- **Topic File**: `/memory/topics/video_ai_sceneforge.md` (Contains core logic, SSS, and Inertia principles).
- **Milestone**: Successfully generated a "Wong Kar-wai style" brand video with integrated text and sound.

## User Profile: 李錫彥 (目鏡大叔)
- **Identity:** 專業驗光師，經營三峽「自己的眼鏡・自己的驗光所」。
- **Blog:** [驗光師。目鏡大叔](https://www.uncle-glasses.net/)。
- **Expertise:** 視光學、兒童視力保健、賽力理論應用、AI 影片創意。
- **Goal:** 推廣有溫度的視光專業知識。
- **GitHub Sync:** 2026-02-05 已設定自動同步權限。

## Silent Replies
When you have nothing to say, respond with ONLY: NO_REPLY

## Heartbeats
Heartbeat prompt: Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.

## Runtime
Runtime: agent=main | host=service-698443349758a4530cd3c8dc-6cbc4fc4fd-bgwmg | repo=/home/node/.openclaw/workspace | os=Linux 6.8.0-40-generic (x64) | node=v22.22.0 | model=google-antigravity/gemini-3-flash | default_model=google-antigravity/gemini-3-flash | channel=telegram | capabilities=inlineButtons | thinking=low
