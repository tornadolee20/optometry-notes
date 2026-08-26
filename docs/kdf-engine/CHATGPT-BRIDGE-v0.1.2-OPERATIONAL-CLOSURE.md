# KDF Bridge v0.1.2 Operational Closure

Status: `IMPLEMENTED — OWNER ACCEPTANCE REQUIRED`

Base HEAD: `2b3a505aeb6db2213df86c4e3985659c763173c0`

## Scope

This release closes long-running operational gaps without adding a ninth MCP tool or
changing the KDF knowledge model. It separates immutable release baselines from the
valid current Vault, adds explicit snapshot promotion, completes create-question
idempotency, tightens mode contracts, expires private runtime state on startup, makes
the KDF runtime Node-only, and adds Windows CI and failure drills.

## Starting state

- current Vault: 18 formal artifacts, 172 Wikilinks, 0 errors, 0 warnings;
- immutable v0.1 baseline: 17 artifacts and
  `991ae3bf286ffecc823c44239de6b1bb14dc20de4e314c4a9f5ce939b98921fd`;
- unrelated pre-existing untracked files: `docs/kdf-engine/evidence-search-plans/` and
  `DQ-KDF-001-002.md`;
- no tracked or staged modification at preflight.

The owner-created `DQ-KDF-001-002.md` was preserved and not edited by this work.

## Decisions

1. The v0.1 baseline remains immutable. New valid cards produce `BASELINE_CHANGED`,
   not a corruption error. A baseline member changing or disappearing still fails.
2. `scripts/kdf_current_snapshot.mjs current` produces a deterministic identity and
   content snapshot. `generated_at` is informational and excluded from its integrity
   hash.
3. Promotion is a separate atomic create and requires `--reviewed-by` plus the exact
   confirmation token `VALIDATED_AND_HUMAN_REVIEWED`. It never overwrites a baseline.
4. Research Question idempotency is persisted on the artifact itself using an opaque
   request ID and input fingerprint. The Vault remains authoritative; audit metadata
   records the operation. A second database-like ledger was deliberately not added.
5. Prepared candidates retain complete proposed text for 15 minutes because save must
   install the exact reviewed bytes. Startup removes expired or malformed proposals.
6. Audit metadata is retained for 90 days and never includes note or candidate bodies.
7. Node.js 22 is the only KDF Bridge runtime. The obsolete Python compatibility
   launcher was removed; unrelated repository Python utilities are unchanged.

## Out of scope

No embeddings, vector database, remote tunnel, Web UI, automatic publish, automatic
Git mutation, new MCP tool, cloud dependency, search ranking change, or Skill Runtime
was added.

## Commands

```powershell
cd mcp-servers\kdf-chatgpt-bridge
npm.cmd ci
npm.cmd run build
npm.cmd test
cd ..\..
node mcp-servers\kdf-chatgpt-bridge\dist\cli.js validate
node scripts\kdf_current_snapshot.mjs current
node scripts\kdf_formal_manifest.mjs
git diff --check
```

Explicit baseline promotion, only after human review:

```powershell
node scripts\kdf_current_snapshot.mjs promote `
  --version kdf-v0.1.2 `
  --reviewed-by "OWNER" `
  --confirm VALIDATED_AND_HUMAN_REVIEWED
```

## Remaining limitation

Actual ChatGPT frontend execution cannot be performed from this Codex environment.
The acceptance sheet is ready at `CHATGPT-E2E-v0.1.2.md` and must remain
`READY BUT NOT EXECUTED` until run in the intended ChatGPT frontend.

The Windows workflow is implemented but has not run on a real GitHub runner. At the
acceptance continuation, the workflow remained uncommitted by explicit scope and the
configured GitHub CLI account reported an invalid token. This is
`WORKFLOW IMPLEMENTED — RUNNER NOT VERIFIED`, not a local substitute for CI.

The protected `.agents/workflows/knowledge-discovery.md` file still contains one
historical invocation of the removed `scripts/validate_kdf.py`. The Bridge package,
CLI, tests, documentation, and Windows CI are Node-only, but the protected workflow
reference could not be updated because the workspace exposes `.agents` through a
read-only reparse-point boundary. Therefore AC-15 is only partially satisfied until
the owner replaces that command with:

```powershell
node mcp-servers/kdf-chatgpt-bridge/dist/cli.js validate
```

## Final local verification

- dependency install: PASS (`npm.cmd ci --cache .npm-cache --no-audit --no-fund`,
  96 packages);
- TypeScript build: PASS;
- full test suite: PASS (31/31, 0 failed, 0 skipped);
- live Node validator: PASS (18 artifacts, 172 Wikilinks, 0 errors, 0 warnings);
- immutable v0.1 baseline integrity: PASS, hash
  `991ae3bf286ffecc823c44239de6b1bb14dc20de4e314c4a9f5ce939b98921fd`;
- current snapshot run 1 = run 2 = run 3:
  `0a89900ee850fd816d5c3c97ca76da8ad0ee8ec5f05000e868b6746770980323`;
- `git diff --check`: PASS;
- tracked `obsidian-vault` diff: empty;
- baseline promotion: not performed;
- commit/push: not performed.
