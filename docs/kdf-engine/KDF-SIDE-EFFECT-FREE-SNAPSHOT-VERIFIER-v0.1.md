# KDF Side-effect-free Snapshot Verifier v0.1

## Purpose

`scripts/kdf_side_effect_free_snapshot.mjs` provides deterministic formal KDF integrity verification for closure workflows without starting the operational Bridge runtime. It reports validation state, artifact and Wikilink counts, the current snapshot digest, dependency hashes, and optional key-artifact hashes.

This verifier replaces only the integrity-check portion of strict closure workflows. It does not replace operational Bridge startup, audit logging, or baseline promotion.

## Threat Model

The verifier is designed for runs where even expected Bridge startup telemetry would violate a strict no-side-effect gate. It addresses accidental audit append, prepared-state cleanup, persistent lock creation, cache or temporary-file creation, baseline writes, and formal KDF mutation during verification. It also detects a changed input set between its initial and final read phases.

It does not prevent another process from writing concurrently and does not provide a transactional filesystem snapshot.

## Read-only Boundary

The production verifier imports only read-capable filesystem APIs: `readFile`, `readdir`, `lstat`, `stat`, and `realpath`. It does not import or instantiate:

- `KdfService`
- Bridge CLI or MCP runtime
- `AuditLog`
- `PreparedStore`
- `SafeWriter`
- `LockManager`
- runtime persistence helpers

It writes structured JSON only to stdout and fatal diagnostics only to stderr. It never creates a file, directory, cache, lock, temporary artifact, audit event, or baseline.

## Architecture

The verifier performs these bounded phases:

1. Discover a repository root using `.git` and `obsidian-vault` sentinels.
2. Verify required prebuilt validation dependencies without building them.
3. Import only the compiled pure repository, validator, configuration, and frontmatter modules.
4. Compute input fingerprint A.
5. Run the existing `KdfValidator` directly over `VaultRepository`.
6. Enumerate and hash formal KDF artifacts independently.
7. Resolve any requested key IDs.
8. Compute input fingerprint B and fail closed when A differs from B.
9. Emit one JSON result.

No phase enters `KdfService.create()`.

## Dependency Policy

The verifier does not run `npm`, TypeScript, a Bridge build, or any equivalent build command. These source/dist pairs are required:

- `config`
- `contract`
- `domain`
- `frontmatter`
- `path-policy`
- `repository`
- `validator`

It fails closed when a required file is missing, a TypeScript source is newer than its compiled JavaScript, the expected pure exports are unavailable, or compiled `FORMAL_ROOTS` differ from the approved roots. Output includes SHA-256 hashes for every required source/dist pair, the Bridge package, and the active KDF contract.

Timestamp comparison is a conservative stale-build signal, not a proof that source and compiled code are semantically identical. Dependency hashes make the exact implementation visible to the caller.

## Deterministic Digest

The digest remains compatible with `kdf-current-snapshot-v1`:

1. Recursively enumerate Markdown files under the two formal KDF roots.
2. Convert relative paths to POSIX separators.
3. Sort paths by raw UTF-8 bytes.
4. Read artifact bytes.
5. Convert only CRLF byte pairs to LF; do not trim, decode-normalize, strip BOM, or alter the final newline.
6. SHA-256 each canonical artifact.
7. Build each identity row as `path + NUL + id + NUL + type + NUL + content_sha256`.
8. Join rows with LF and SHA-256 the aggregate bytes.

## Validation Semantics

The verifier directly uses the existing compiled `VaultRepository` and `KdfValidator`. It does not copy or redefine KDF validation rules. Validation includes formal metadata, ID/type relationships, parent and root relationships, semantic card rules, duplicate IDs, and Wikilink resolution.

Malformed or invalid KDF state produces `validation_passed: false` and a non-zero exit code.

## Concurrent Mutation Detection

Input fingerprint A is calculated before validation and snapshot work. Fingerprint B is calculated afterward. The fingerprint covers:

- formal artifact paths and raw content hashes
- all Vault Markdown paths used for Wikilink stem resolution
- active KDF contract hash
- required source and compiled dependency hashes

If A differs from B, or fingerprint B cannot be completed because input disappeared, the result contains `concurrent_mutation.detected: true` and exits non-zero. The verifier does not acquire a lock or stop another writer.

## Key Artifact Hashes

Repeat `--key-id` to request selected artifact hashes:

```powershell
node scripts/kdf_side_effect_free_snapshot.mjs `
  --key-id KDF-001-F-001 `
  --key-id KDF-002-A-001
```

Known IDs appear under `key_artifacts` with their relative path and canonical SHA-256. An unknown ID produces `UNKNOWN_KEY_ID`, makes validation unsuccessful for the invocation, and exits non-zero. IDs are never silently ignored.

## Exit Codes

- `0`: KDF validation passed, requested IDs resolved, and no concurrent mutation was detected.
- `1`: validation, key-ID resolution, snapshot parsing, or concurrent-mutation gate failed.
- `2`: repository discovery, dependency, build-artifact, import, or other operational gate failed.

## JSON Output Contract

Every CLI invocation emits exactly one JSON document to stdout:

```json
{
  "verifier_version": "kdf-side-effect-free-snapshot-verifier-v0.1",
  "validation_passed": true,
  "errors": [],
  "warnings": [],
  "artifact_count": 22,
  "wikilink_count": 186,
  "snapshot_sha256": "...",
  "dependencies": {},
  "key_artifacts": {},
  "concurrent_mutation": {
    "detected": false,
    "fingerprint_before": "...",
    "fingerprint_after": "..."
  }
}
```

Fatal operational details may additionally be written to stderr. No human-oriented prose is mixed into stdout.

## No-side-effect Guarantee

The verifier contains no write-capable filesystem import and does not invoke a write-capable subsystem. Acceptance testing compares pre/post fingerprints for audit logs, runtime state, locks, formal roots, repository content, and repeated executions.

The guarantee applies to this verifier's own code path. It cannot prevent an unrelated process from changing the repository while verification is running; such changes are handled by the concurrent-mutation gate when visible between phases.

## Relationship To Existing Snapshot Script

`scripts/kdf_current_snapshot.mjs` invokes `dist/cli.js validate`. The CLI constructs `KdfService` before dispatching `validate`, so normal startup cleanup and audit telemetry occur. That script also retains explicit, human-confirmed baseline promotion behavior.

The side-effect-free verifier does not modify, wrap, or weaken the existing script. It has no `promote` command and never writes a baseline.

## Relationship To Bridge

Operational Bridge startup must continue to perform retention cleanup and append audit events. The verifier avoids that runtime entirely and reuses only modules proven to be read-only at initialization.

No audit/log exception established during an earlier Owner-approved closure becomes a permanent scope rule. Strict no-side-effect closure checks should use this verifier.

## Limitations

- Required prebuilt modules must already exist and pass conservative freshness checks.
- File timestamps cannot prove semantic source/dist identity; dependency hashes expose the exact inputs for review.
- Two-phase fingerprints detect a changed end state but cannot provide filesystem transaction isolation.
- The verifier validates current formal KDF state only; it does not promote, repair, normalize, or index cards.
- Key hashes cover canonical artifact bytes and do not confer Evidence, Practice, or Owner approval.

## Acceptance Tests

Run:

```powershell
node --check scripts/kdf_side_effect_free_snapshot.mjs
node --check scripts/kdf_side_effect_free_snapshot.test.mjs
node --test scripts/kdf_side_effect_free_snapshot.test.mjs
```

The test suite covers deterministic repeated snapshots, CRLF/LF equivalence, UTF-8 byte sorting, unknown IDs, malformed artifacts, concurrent fingerprint mismatch, missing build artifacts, JSON stdout, non-zero validation failure, audit/lock/temp/cache/formal no-mutation gates, deterministic key hashes, independent artifact and Wikilink counts, and isolated old-vs-new digest compatibility.

Live acceptance must capture filesystem fingerprints before and after the verifier and confirm that audit logs, runtime state, formal artifacts, locks, and unrelated repository content remain unchanged.
