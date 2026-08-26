# KDF ChatGPT Bridge v0.1.2

Local, KDF-only MCP STDIO server and CLI fallback. It exposes exactly eight tools and
has no arbitrary shell, filesystem, Git, publish, delete, move, or rename capability.

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd test
npm.cmd run kdf -- search "周邊離焦"
node dist\index.js
cd ..\..
node scripts\kdf_current_snapshot.mjs current
node scripts\kdf_formal_manifest.mjs
```

Both adapters call the same `KdfService`. Runtime state is kept in the repository's
Git-ignored `logs/kdf-bridge/` directory. Prepared candidate bytes expire after 15
minutes; startup removes expired/malformed proposals. Audit metadata is retained for
90 days and excludes raw note/candidate bodies. Node.js 22+ is the only Bridge runtime.

On Windows, Node permission modes do not prove NTFS ACL isolation. The runtime stays
under the user-owned repository and never falls back to a public temp directory. An
owner can inspect inheritance with `icacls logs\kdf-bridge`; unexpected broad write
access must be corrected outside the Bridge before use.

See `docs/kdf-engine/CHATGPT-BRIDGE-*.md`.
