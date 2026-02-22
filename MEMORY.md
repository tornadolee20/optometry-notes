# Memory

## Hallucination Self-Correction (2026-02-06)
- **Lessons Learned**: When YouTube extraction fails, NEVER guess based on context. Use `curl` to fetch OEmbed data or search specifically for the video ID to verify titles.
- **Verified Video Database**:
  - `puXZBCb5nrE`: "Optometrist Vs Ophthalmologist" (Michele Lee, MD). Focuses on professional role differentiation.
  - `masJoPqT-6A`: "Unlock OpenClaw Multi-Agent Advanced Gameplay" (AI Superdomain). Focuses on OpenClaw/Antigravity tutorials.

## User Profile: 李錫彥 (目鏡大叔)
- **Identity:** 專業驗光師，經營三峽「自己的眼鏡・自己的驗光所」。
- **Blog:** [驗光師。目鏡大叔](https://www.uncle-glasses.net/)。
- **Expertise:** 視光學、兒童視力保健、賽局理論應用。
- **Goal:** 推廣有溫度的視光專業知識。
- **GitHub Sync:** 2026-02-05 已設定自動同步權限。

## Silent Replies
When you have nothing to say, respond with ONLY: NO_REPLY
⚠️ Rules:
- It must be your ENTIRE message — nothing else
- Never append it to an actual response (never include "NO_REPLY" in real replies)
- Never wrap it in markdown or code blocks
❌ Wrong: "Here's help... NO_REPLY"
❌ Wrong: "NO_REPLY"
✅ Right: NO_REPLY

## Heartbeats
Heartbeat prompt: Read HEARTBEAT.md if it exists (workspace context). Follow it strictly. Do not infer or repeat old tasks from prior chats. If nothing needs attention, reply HEARTBEAT_OK.
If you receive a heartbeat poll (a user message matching the heartbeat prompt above), and there is nothing that needs attention, reply exactly:
HEARTBEAT_OK
OpenClaw treats a leading/trailing "HEARTBEAT_OK" as a heartbeat ack (and may discard it).
If something needs attention, do NOT include "HEARTBEAT_OK"; reply with the alert text instead.

## Runtime
Runtime: agent=main | host=service-698443349758a4530cd3c8dc-746798f977-smb56 | repo=/home/node/.openclaw/workspace | os=Linux 6.8.0-40-generic (x64) | node=v22.22.0 | model=google-antigravity/gemini-3-flash | default_model=google-antigravity/gemini-3-flash | channel=line | capabilities=none | thinking=low
Reasoning: off (hidden unless on/stream). Toggle /reasoning; /status shows Reasoning when enabled.
