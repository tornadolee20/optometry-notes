# KDF ChatGPT Bridge v0.1 Deployment

## v0.1 boundary

v0.1 is a local Node.js MCP STDIO server. It is not an HTTP service, tunnel, cloud
database, ChatGPT App UI, or publishing integration. The Obsidian Vault remains the
source of truth and Git remains history controlled by a human.

## Local setup

Requirements: Windows, Node.js 22+, and this repository outside synchronized cloud
folders.

```powershell
cd C:\Users\torna_3j3fz9h\Desktop\optometry-notes\mcp-servers\kdf-chatgpt-bridge
npm.cmd ci
npm.cmd run build
npm.cmd test
```

Launch the local STDIO server after build:

```text
node C:\Users\torna_3j3fz9h\Desktop\optometry-notes\mcp-servers\kdf-chatgpt-bridge\dist\index.js
```

STDOUT is reserved for MCP messages. Audit events go to `logs/kdf-bridge/`.

## CLI fallback

```powershell
npm.cmd run kdf -- search "周邊離焦"
npm.cmd run kdf -- read KDF-001-B-001
npm.cmd run kdf -- capture "今天有孩子說新眼鏡旁邊怪怪的，但中央很清楚。"
npm.cmd run kdf -- question "周邊模糊是否影響動態視覺" --root-topic KDF-001 --parent KDF-001-B
npm.cmd run kdf -- observe KDF-001-B-001 "初戴不自然" --kind uncle-lens --human-source "user:chat"
npm.cmd run kdf -- validate
```

CLI and MCP both call `KdfService` and return the same structured envelope.

## ChatGPT Desktop / Codex

OpenAI's current MCP guidance supports local STDIO servers in ChatGPT Desktop and
Codex. Register the command above in the client's MCP configuration. Do not pair it
with a generic shell or unrestricted filesystem server for routine KDF use.

- <https://learn.chatgpt.com/docs/extend/mcp>
- <https://developers.openai.com/plugins/build/mcp-server>

## Remote roadmap, not implemented

A later remote version requires a separate threat model. Authenticated Streamable HTTP
may be considered only after local parity, with per-user authorization, TLS, replay
protection, rate limits, encrypted proposal storage, data-retention policy, and explicit
network-egress approval. Tunnels and public endpoints are out of scope for v0.1.
