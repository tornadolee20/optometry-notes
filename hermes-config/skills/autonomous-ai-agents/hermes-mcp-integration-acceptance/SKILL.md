---
name: hermes-mcp-integration-acceptance
description: Integrate local or HTTP MCP servers into Hermes Agent and run acceptance checks for tool discovery, tool-surface safety, smoke tests, config hygiene, and regression gates.
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [linux, macos, windows]
metadata:
  hermes:
    tags: [hermes, mcp, integration, stdio, acceptance, security]
    related_skills: [hermes-agent, windows-cli-tool-setup]
---

# Hermes MCP Integration Acceptance

Use this skill when the user asks to connect an external MCP server to Hermes Agent and verify that Hermes can discover and call its tools safely. This covers local STDIO servers (Node, Python, uvx, npx) and HTTP/StreamableHTTP MCP servers.

For Hermes CLI syntax and config semantics, load `hermes-agent` first and prefer the installed CLI help (`hermes mcp --help`, `hermes mcp add --help`, `hermes mcp test --help`) over memory.

## Core Rule

Treat MCP integration as a safety-critical configuration change, not a coding task. Preserve the target MCP server implementation and contract unless the user explicitly asks to change it.

Do **not** casually modify:
- MCP schemas or protocol contracts
- Service layers
- Security contracts / allowlists / gates
- Existing artifacts managed by the MCP server
- Legacy server entrypoints
- Provider/model settings in Hermes config

## Procedure

1. **Load current Hermes guidance**
   - Load `hermes-agent`.
   - If Windows/Git Bash path issues are involved, consider `windows-cli-tool-setup`.
   - Check live CLI help before assuming flags.

2. **Baseline the MCP server first**
   - Run the server project's build and test commands exactly as requested or documented.
   - Confirm all expected tests pass before touching Hermes config.
   - Launch the server entrypoint directly and verify it does not immediately crash.
   - For STDIO servers, a healthy server may wait silently for MCP traffic.
   - If the server baseline fails, stop and report a baseline blocker; do not mutate Hermes config.

3. **Resolve Hermes config path, do not guess**
   - Run `hermes config path` when available.
   - Also resolve the user's home (`$HOME` on POSIX/Git Bash; platform-appropriate equivalent if needed).
   - Read the full config before editing.
   - Never reveal secrets from config in the final report.

4. **Inspect MCP CLI support**
   - Run:
     - `hermes --version`
     - `hermes mcp --help`
     - `hermes mcp list`
     - `hermes mcp add --help`
     - `hermes mcp test --help`
   - If `hermes mcp` exists, prefer the actual installed CLI schema.
   - If MCP subcommands do not exist, fall back to additive `config.yaml` integration only.

5. **Backup before mutation**
   - Create a config backup beside the real config, e.g. `config.yaml.pre-<server>-mcp-backup`.
   - If approval tooling blocks the backup/mutation, stop and ask the user to approve; do not retry via another route.
   - If the user switches to an external shell, first identify the prompt/shell. `C:\Users\...>` is Windows CMD: use one-line `copy`, not POSIX `cp` or backslash line continuations.

6. **Register additively**
   - Use one stable server name.
   - Preserve all existing `mcp_servers` entries.
   - Do not duplicate the top-level `mcp_servers:` key.
   - Do not change providers, models, unrelated toolsets, or unrelated config.
   - If the Hermes version supports tool selection/filtering, restrict the server to the expected tool allowlist.

7. **Restart / fresh session**
   - Do not rely on hot reload unless installed Hermes explicitly documents it.
   - For CLI/TUI, a fresh `hermes` or `hermes chat` session is usually required before MCP tools appear.

8. **Discovery acceptance**
   - Run `hermes mcp list` and `hermes mcp test <name>` when supported.
   - In a fresh Hermes session, inspect actual discovered names.
   - Record Hermes namespaced names exactly as discovered (e.g. `mcp_<server>_<tool>`).
   - Verify:
     - expected tool count
     - no missing tools
     - no duplicates
     - no unexpected generic filesystem, shell/process, Git, publish, or other broad capability

9. **Smoke tests**
   - Start with read-only calls.
   - For fresh-session natural-language checks, `hermes chat -Q -q '<acceptance prompt>'` gives isolated output with actual tool names.
   - Then run temporary write/capture flows only if the contract has an approved fixture or cleanup workflow.
   - Prefer `dry_run=true` or `mode=prepare` for write-risk flows; record `planned_changes`, `files_affected`, `operation_id`, and `expected_hash`/`proposed_hash`.
   - Test human gates and domain errors exactly as returned; do not reinterpret or bypass them. If the live repository is not in the required gate state, use a temporary fixture repo and point the MCP server env at it.
   - Test content generation as private draft only; never publish, commit, or push unless explicitly requested.

10. **Regression and cleanup**
    - Re-run the target project's canonical validators and manifest/hash checks.
    - Confirm fixture residue, prepared operations, locks, temp files, and mutated artifacts are cleaned by approved workflows.
    - Prepare-only MCP calls may leave server-side prepared-operation files; remove only the exact operation IDs created during the acceptance run or use the project’s approved cleanup command.
    - Verify final VCS status for the target repo when available.
    - If manifest/hash/artifact membership changes unexpectedly, report a regression failure.

## Windows / Git Bash Notes

- Hermes terminal may run through Git Bash/MSYS; prefer POSIX shell syntax in `terminal` calls.
- When passing Windows paths to Node from Git Bash, prefer `C:/Users/...` over `/c/Users/...` if Node itself must resolve the path. MSYS-style `/c/...` can be misinterpreted by Windows Node in some contexts.
- `npm.cmd` is often the correct invocation for npm scripts from Git Bash on Windows.
- Some direct STDIO server checks may require PTY/background launch to verify “server is waiting for traffic” behavior. If a non-PTY background run exits because stdin is not a TTY, treat that as a launch-probe limitation and retry with PTY before concluding the MCP server is broken.

## Reporting Template

Use the user's requested report format if provided. Otherwise include:

- RESULT: ACCEPTED / PARTIAL / BLOCKED / FAIL
- Hermes version and config path
- MCP server name, transport, command, args, env keys (not secret values)
- Connection status
- Discovered tool count and tool names
- Read-only smoke test results
- Write/capture smoke test results and cleanup
- Human gate behavior and exact error codes
- Regression validator results and manifest/hash status
- Security surface: filesystem, shell, Git, publish, allowlist, expected hash, audit redaction
- Config changes only
- Code changes only
- Next step

## Pitfalls

- Do not fabricate tool discovery results if the current Hermes session has not been restarted with MCP loaded.
- Do not continue after a blocked approval prompt for config backup/mutation; user approval is required.
- Do not treat generic built-in Hermes tools as part of the external MCP server's tool surface. Acceptance concerns the tools exposed by that MCP server entry.
- Do not add delete/admin tools just to clean acceptance fixtures; use the MCP project's approved cleanup path.
- Do not save one-off artifact IDs or manifests in memory; put session-specific details in a reference file if useful.

## References

- `references/kdf-stdio-bridge-acceptance.md` — concrete Windows/Git Bash acceptance notes from integrating a KDF STDIO MCP bridge into Hermes.
