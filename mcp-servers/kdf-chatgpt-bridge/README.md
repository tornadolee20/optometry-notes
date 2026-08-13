# KDF ChatGPT Bridge

Local, KDF-only MCP STDIO server and CLI fallback. It exposes exactly eight tools and
has no arbitrary shell, filesystem, Git, publish, delete, move, or rename capability.

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd test
npm.cmd run kdf -- search "周邊離焦"
node dist\index.js
```

Both adapters call the same `KdfService`. Runtime state is kept in the repository's
Git-ignored `logs/kdf-bridge/` directory. See `docs/kdf-engine/CHATGPT-BRIDGE-*.md`.
