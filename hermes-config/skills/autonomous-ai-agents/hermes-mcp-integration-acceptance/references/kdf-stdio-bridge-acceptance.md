# KDF STDIO Bridge Acceptance Notes

Session-specific notes from a Windows/Git Bash attempt to integrate a KDF ChatGPT Bridge v0.1 STDIO MCP server into Hermes Agent.

## Context

- Target: connect existing KDF STDIO MCP Bridge to Hermes without modifying KDF schema, artifacts, service layer, security contract, or legacy MCP.
- Expected KDF tool surface:
  1. `kdf_search`
  2. `kdf_read_card`
  3. `kdf_capture`
  4. `kdf_create_question`
  5. `kdf_add_observation`
  6. `kdf_compile_mature`
  7. `kdf_generate_content`
  8. `kdf_discover`

## Useful command pattern on Windows/Git Bash

Use `npm.cmd` for npm scripts:

```bash
cd '/c/Users/<user>/Desktop/optometry-notes/mcp-servers/kdf-chatgpt-bridge'
npm.cmd run build
npm.cmd test
```

Observed baseline result:

- TypeScript build passed.
- Node test runner reported `22/22` passing.
- Existing Git line-ending warnings (`LF will be replaced by CRLF`) were cosmetic and did not indicate test failure.

## Direct STDIO launch probe

When launching Windows Node from Git Bash, prefer native-style forward-slash Windows paths:

```bash
node 'C:/Users/<user>/Desktop/optometry-notes/mcp-servers/kdf-chatgpt-bridge/dist/index.js'
```

Avoid passing `/c/Users/...` directly to Windows Node for the entrypoint in this context. It was interpreted as `C:\c\Users\...` and produced `MODULE_NOT_FOUND`.

For a server that should wait for STDIO MCP traffic, a foreground `timeout 5s node ...` probe may exit `0` quickly if stdin is closed. A PTY/background launch was a better readiness signal:

```bash
# Hermes terminal tool equivalent: background=true, pty=true, then poll.
node 'C:/Users/<user>/Desktop/optometry-notes/mcp-servers/kdf-chatgpt-bridge/dist/index.js'
```

A non-PTY background launch exited with `stdin is not a tty`; retrying with PTY showed the process stayed running.

## Hermes CLI observations

Observed installed version:

```text
Hermes Agent v0.18.0 (2026.7.1)
```

Observed MCP commands existed:

```bash
hermes mcp --help
hermes mcp list
hermes mcp add --help
hermes mcp test --help
hermes mcp configure --help
```

Observed `hermes mcp add --help` shape:

```text
hermes mcp add NAME --url URL
hermes mcp add NAME --command MCP_COMMAND --args ...
--env [ENV ...]
--connect-timeout CONNECT_TIMEOUT
```

Observed actual config path from `hermes config path`:

```text
C:\Users\<user>\AppData\Local\hermes\config.yaml
```

## Approval and Windows CMD pitfall

Creating the config backup was correctly treated as a filesystem mutation. If Hermes approval times out, stop and wait for the user; do not retry the same backup/mutation through a different command or tool.

If the user opens Windows CMD, the prompt looks like `C:\Users\...>`. In that shell, POSIX examples fail:

```text
'cp' is not recognized as an internal or external command
```

Use one-line CMD syntax instead:

```cmd
copy "C:\Users\<user>\AppData\Local\hermes\config.yaml" "C:\Users\<user>\AppData\Local\hermes\config.yaml.pre-kdf-mcp-backup"
```

Do not use `\` as a line continuation in CMD.

For CLI registration in CMD, keep `--args` last:

```cmd
hermes mcp add kdf --command node --connect-timeout 60 --env KDF_REPO_ROOT=C:\Users\<user>\Desktop\optometry-notes --args C:\Users\<user>\Desktop\optometry-notes\mcp-servers\kdf-chatgpt-bridge\dist\index.js
```

Observed successful result: Hermes connected and found all 8 KDF tools, then saved `kdf` to config with `8/8 tools enabled`.

## Intended config entry

Use a single stable server name such as `kdf`. Equivalent YAML:

```yaml
mcp_servers:
  kdf:
    command: "node"
    args:
      - "C:\\Users\\<user>\\Desktop\\optometry-notes\\mcp-servers\\kdf-chatgpt-bridge\\dist\\index.js"
    env:
      KDF_REPO_ROOT: "C:\\Users\\<user>\\Desktop\\optometry-notes"
    enabled: true
    timeout: 120
    connect_timeout: 60
```

Only add this after successful KDF baseline and after backing up the real Hermes config.

## Smoke and safety test patterns

Use fresh Hermes sessions for natural-language smoke tests so MCP discovery happens at startup and output is easy to audit:

```bash
hermes chat -Q -q 'Acceptance prompt: only use KDF MCP tools; report actual tool names and result fields.'
```

Observed useful checks:

- `kdf_search` for `周邊離焦` returned 5 KDF cards.
- `kdf_read_card` on `KDF-001` returned title, frontmatter/body, `links`, `backlinks`, `provenance`, and `sha256`.
- `kdf_capture` with `dry_run=true` returned `mode: dry-run`, `created=false`, planned Inbox path, and did not promote anything to Evidence.
- `kdf_create_question` with `dry_run=true` returned a planned Research Question path and no mutation.
- `kdf_add_observation` should first read the target observation card to get `sha256`, then pass it as `expected_hash`; with `dry_run=true`, verify `observation_is_evidence=false` and `validated_questionnaire=false`.
- `kdf_generate_content` with `mode=prepare` creates a prepared operation only; verify private draft/no publish and do not call save unless explicitly approved.
- `kdf_discover` with `mode=prepare` creates a candidate only; verify `human_approved=false` / unverified and no Evidence creation.

Human gate nuance: the live KDF repo may fail closed via a missing Gate 1 approval before hitting a pending Uncle Lens error. To verify exact `HUMAN_CONFIRMATION_REQUIRED`, create a temporary fixture repo, set Gate 1 approved and Uncle Lens pending, point the MCP subprocess at that fixture via `KDF_REPO_ROOT`, then call `kdf_compile_mature mode=prepare`. Expected structured result:

```json
{
  "isError": true,
  "ok": false,
  "code": "HUMAN_CONFIRMATION_REQUIRED",
  "operation_id": null,
  "planned_changes": [],
  "files_affected": []
}
```

## Cleanup and regression

Prepare-only `kdf_generate_content` / `kdf_discover` calls can leave `logs/kdf-bridge/prepared/KDFOP-*.json`. Remove only the exact operation IDs created during acceptance, or use the existing approved cleanup path. Then run:

```bash
node mcp-servers/kdf-chatgpt-bridge/dist/cli.js validate
python scripts/validate_kdf.py
node scripts/kdf_formal_manifest.mjs
git status --short --untracked-files=all
```

Expected KDF v0.1 regression values observed:

- artifacts: 17
- Wikilinks: 162
- errors: 0
- warnings: 0
- manifest: `991ae3bf286ffecc823c44239de6b1bb14dc20de4e314c4a9f5ce939b98921fd`
- final git status: clean

## Acceptance focus

The important security assertion is the KDF MCP server's own surface, not Hermes built-ins. Verify the KDF server exposes exactly the eight expected KDF tools and no generic filesystem/shell/Git/publish capability through that MCP entry.
