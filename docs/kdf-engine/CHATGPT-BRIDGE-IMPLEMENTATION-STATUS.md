# KDF ChatGPT Bridge v0.1 Implementation Status

Status: `REAL CLIENT ACCEPTED`

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
- `npm.cmd test`: PASS, 22 tests, 0 failed, 0 skipped
- focused core/storage safety suite: PASS, 12 tests, 0 failed, 0 skipped
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

## v0.1.1 contract closure

- all three prepare-capable services explicitly return `data.expected_hash`;
  a real client observed JSON `null` for a new content target and a 64-character
  SHA-256 for an existing Mature target
- pending Uncle Lens compile prepare returns
  `HUMAN_CONFIRMATION_REQUIRED` immediately; real-client readback proved the Mature
  hash unchanged, `operation_id: null`, and zero prepared-operation delta
- Codex Desktop bundled CLI `0.148.0-alpha.21` connected to the local STDIO server
  and discovered exactly the eight documented tools
- the real client prepared existing target hash
  `917bd9452f155cf6d84b59d28c6cda55346b57ecd66b522f6d7d404a87f8f722`;
  the dedicated temp-fixture helper committed a different target hash, and save
  returned `HASH_MISMATCH` within the unchanged 15-minute TTL
- post-conflict readback preserved the helper marker and did not install proposal
  content; lock/temp counts were zero, audit recorded `HASH_MISMATCH`, audit contained
  no proposal text, and no rollback failure occurred
- both acceptance fixtures were removed by the namespace-restricted helper; final
  existence checks were false

Manifest reconciliation started from checkpoint
`a9542d7a4345ae3f80f81ef58b22ffda58ff682b`. Contract closure changed only the
bridge service, isolated tests/helper, and directly related bridge documents. No
publish, migration, schema/lifecycle change, or existing KDF card mutation occurred.

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
