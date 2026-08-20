# KDF ChatGPT Bridge v0.1 Implementation Status

Status: `PASS`

Verified: 2026-08-21 (Asia/Taipei)

## Delivered

- isolated Node.js/TypeScript local STDIO MCP package
- exactly eight bounded KDF tools
- CLI adapter and MCP adapter sharing one `KdfService`
- machine-readable KDF/capture contracts and one canonical TypeScript validator
- Python compatibility launcher with no duplicate KDF rules
- path allowlists, traversal/UNC/drive/ADS/invalid-Unicode/reparse defenses
- expected hashes, Git target cleanliness, per-target locks, stale-lock quarantine
- pre/post validation, flushed same-directory temp files, no-replace new-file install,
  existing-file atomic replace, rollback, and scratch cleanup
- expiring server-stored prepare/save proposals
- redacted local runtime audit logs
- human Evidence/Uncle/Publish gates and Observation-not-Evidence rules

## Verification evidence

- `npm.cmd ci --cache .npm-cache --no-audit --no-fund`: PASS, 96 packages
- `npm.cmd test`: PASS, 20 tests, 0 failed, 0 skipped
- TypeScript build: PASS
- MCP SDK client smoke: PASS, exactly 8 tools and structured output
- KDF-001 E2E: PASS
- compatibility `scripts/validate_kdf.py`: PASS
- live Vault validation: 17 artifacts, 162 Wikilinks, 0 errors, 0 warnings
- canonical KDF-001 formal manifest: 17 fixed artifacts,
  `991ae3bf286ffecc823c44239de6b1bb14dc20de4e314c4a9f5ce939b98921fd`
- `git diff --check`: PASS
- protected-path audit: 0 hits
- existing KDF artifact diff: empty

Manifest reconciliation started from checkpoint
`a9542d7a4345ae3f80f81ef58b22ffda58ff682b`. No publish, migration, existing KDF
card mutation, or v0.1.1 contract change was performed.

## Manifest baseline reconciliation

The historical aggregate
`e11935d5af2b7e38f450b2e2697fddc5bb46df1836f2410916733c1d915ae6f2`
is superseded and non-reproducible from the checkpoint. It did not retain its
per-file manifest inputs. The canonical helper now fixes the 17-file membership,
sorting, path token, CRLF policy, separators, and aggregate encoding. See
`KDF-FORMAL-MANIFEST.md`.

## Environment note

The host Git installation emits a non-blocking warning because the global ignore file
under the user profile is not readable from the execution sandbox. Temporary fixture
repositories also emit CRLF conversion notices. Neither warning changed validation or
test results.
