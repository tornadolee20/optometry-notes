# Winget CLI installs: session notes

## Google Antigravity CLI (`agy`) on Windows

Observed install path for a Hermes Windows/Git Bash session:

```bash
winget search antigravity --accept-source-agreements
winget install --id Google.AntigravityCLI --exact --source winget \
  --accept-package-agreements --accept-source-agreements --silent
```

Useful observed winget search results included:

- `Google.AntigravityCLI` — Antigravity CLI
- `Google.AntigravityIDE` — Antigravity IDE
- `Google.Antigravity` — broader Antigravity package

Successful installation printed `新增的命令列別名: "agy"` and exposed:

```bash
command -v agy
# /c/Users/<user>/AppData/Local/Microsoft/WinGet/Links/agy

agy --version
# 1.1.4

agy models
# Gemini 3.5 Flash (Medium)
# Gemini 3.5 Flash (High)
# Gemini 3.5 Flash (Low)
# Gemini 3.1 Pro (Low)
# Gemini 3.1 Pro (High)
# Claude Sonnet 4.6 (Thinking)
# Claude Opus 4.6 (Thinking)
# GPT-OSS 120B (Medium)
```

A minimal non-interactive smoke test worked:

```bash
agy -p '請只回覆：OK' --model 'Gemini 3.1 Pro (High)' --print-timeout 30s
```

For `cc-to-antigravity-cli-bridge`, a POSIX shim can expose the wrapper as `ccagy`:

```bash
mkdir -p "$HOME/.local/bin"
cat > "$HOME/.local/bin/ccagy" <<'EOF'
#!/usr/bin/env bash
exec "$HOME/tools/cc-to-antigravity-cli-bridge/scripts/ccagy.sh" "$@"
EOF
chmod +x "$HOME/.local/bin/ccagy"
chmod +x "$HOME/tools/cc-to-antigravity-cli-bridge/scripts/ccagy.sh"
```

Verify both the underlying CLI and wrapper:

```bash
agy -p '請只回覆：OK' --model 'Gemini 3.1 Pro (High)' --print-timeout 30s
ccagy '請做最小可行測試：只要確認你收到問題，回覆 OK。不要展開研究。' 'Gemini 3.1 Pro (High)'
```

Billing/login pitfall: when intending to use Google/Gemini subscription quota, check `GEMINI_API_KEY` is unset before running `agy`; project docs warn that setting it routes usage through API billing instead of subscription login.

Subscription/login verification details observed in practice:

```bash
# Quick route checks
[ -n "$GEMINI_API_KEY" ] && echo 'WARNING: GEMINI_API_KEY is set' || echo 'OK: GEMINI_API_KEY is not set'
agy -p '請只回覆 OK' --model 'Gemini 3.1 Pro (High)' --print-timeout 30s
ccagy '請只回覆 OK' 'Gemini 3.1 Pro (High)'
```

If a one-shot hangs or times out, do not immediately conclude login failed. Inspect the latest logs under `~/.gemini/antigravity-cli/log/` and look for lines like:

```text
keyringAuth: loaded token, expiry=... expired=false
ChainedAuth: authenticated via keyring (effective: keyring)
applyAuthResult: email=<google-account>, authMethod=consumer, quotaProject=
OAuth: authenticated successfully as <google-account>
```

Interpretation:
- `authMethod=consumer` indicates a normal Google account login path.
- `expired=false` indicates the keyring token is currently usable.
- `GEMINI_API_KEY` unset avoids forcing Gemini API-key billing.
- Hermes model/provider switching is separate: `ccagy` runs an external `agy` CLI call and does not require switching Hermes itself to a Gemini or GitHub Copilot provider.
