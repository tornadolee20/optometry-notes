---
name: windows-cli-tool-setup
description: "Set up and verify developer CLI tools for Hermes on Windows/Git Bash, especially npm global CLIs and PATH shims."
version: 1.0.0
author: Hermes Agent
license: MIT
platforms: [windows]
metadata:
  hermes:
    tags: [windows, cli, path, npm, git-bash, setup, troubleshooting]
---

# Windows CLI Tool Setup

Use this skill when the user asks to install, repair, or verify a developer CLI tool on Windows from a Hermes session, especially when Hermes runs commands through Git Bash/MSYS rather than PowerShell.

## Core workflow

1. **Check prerequisites first.**
   - For npm-based tools, verify `node --version` and `npm --version`.
   - Check whether the executable is visible with `which <tool>`.
   - If npm is involved, check the global package and prefix/root with `npm list -g --depth=0 <package>` and `npm root -g`.

2. **Install or update with the official package manager command.**
   - Example for Codex CLI: `npm install -g @openai/codex`.
   - Prefer the tool's official install/update path over copying binaries manually.

3. **Account for Git Bash PATH differences.**
   - On Windows, npm global launchers often land in `%APPDATA%/npm`, e.g. `C:/Users/<user>/AppData/Roaming/npm/codex` and `codex.cmd`.
   - Hermes' Git Bash PATH may not include that npm launcher directory even when npm reports the package as globally installed.
   - If the launcher exists but `which <tool>` fails, create a small POSIX shim in a directory already on Hermes' PATH, commonly `~/.local/bin/<tool>`.

4. **Shim pattern for npm global CLIs.**

   ```bash
   # Example: expose npm-installed Codex CLI to Hermes/Git Bash
   mkdir -p ~/.local/bin
   cat > ~/.local/bin/codex <<'EOF'
   #!/usr/bin/env bash
   exec '/c/Users/<user>/AppData/Roaming/npm/codex' "$@"
   EOF
   chmod +x ~/.local/bin/codex
   ```

   Adapt `<user>` and executable name to the live machine. Prefer forward-slash or MSYS-style paths inside the shim.

5. **Verify the result from Hermes, not just from an external shell.**
   - Run `which <tool>`.
   - Run `<tool> --version`.
   - If the tool has a health check, run it too, e.g. `codex doctor`.
   - Report the actual output summary, including any remaining warnings/failures.

## Pitfalls

- Do not assume `npm list -g` success means the command is callable from Hermes; PATH may still hide the launcher.
- Do not use PowerShell syntax in Hermes terminal calls on this Windows setup; use POSIX/Git Bash syntax.
- Do not record a transient `command not found` as a durable limitation. Capture the repair path: locate the installed launcher, add PATH, or create a shim, then verify.
- Avoid hardcoding the current user's path in reusable instructions; use `$HOME`, `~`, or derive the path from tool output when possible.

## Desktop app CLIs installed by winget

Some Windows developer apps (for example Cursor) install successfully via `winget`, but their POSIX launcher is not automatically exposed to Hermes' Git Bash PATH.

Cursor install/verification pattern:

```bash
# Discover package
winget search --id Anysphere.Cursor --exact

# Install user-scoped Cursor
winget install --id Anysphere.Cursor --exact --source winget \
  --accept-package-agreements --accept-source-agreements --silent

# Verify Windows install
winget list --id Anysphere.Cursor --exact
ls "$LOCALAPPDATA/Programs/cursor" 2>/dev/null | sed -n '1,40p'

# If `cursor` is not on PATH, expose its bundled POSIX launcher
mkdir -p ~/.local/bin
cat > ~/.local/bin/cursor <<'EOF'
#!/usr/bin/env bash
exec "$LOCALAPPDATA/Programs/cursor/resources/app/bin/cursor" "$@"
EOF
chmod +x ~/.local/bin/cursor

# Verify from Hermes/Git Bash
command -v cursor
cursor --version
```

Notes:
- Prefer the bundled `resources/app/bin/cursor` launcher over calling `Cursor.exe` directly; it supports CLI arguments like `cursor .` and `--version`.
- If `$LOCALAPPDATA` is unavailable, derive the path from the user's home: `$HOME/AppData/Local/Programs/cursor/resources/app/bin/cursor`.

## Verification checklist

- `which <tool>` resolves to the expected shim or executable.
- `<tool> --version` returns the installed version.
- Tool-specific doctor/health command passes or remaining issues are clearly reported.
