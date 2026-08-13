# KDF Bridge Service Layer v0.1

## Responsibility

`KdfService` is the only public business-logic boundary used by MCP and CLI.
Adapters may validate transport shapes, but all repository, KDF, concurrency,
Human Gate, and write decisions belong here.

## Public capabilities

```ts
listArtifacts()
getArtifact()
searchArtifacts()
capture()
createQuestion()
addObservation()
prepareArtifactWrite()
savePreparedArtifact()
validateArtifact()
validateVault()
validateFixture()
compileMaturePrepare()
compileMatureSave()
generateContentPrepare()
generateContentSave()
discoverPrepare()
discoverSave()
```

`prepareArtifactWrite` and `savePreparedArtifact` are internal service primitives;
they are not additional MCP tools.

## Service invariants

- The repository root is process configuration, never a tool argument.
- `.git` and `obsidian-vault` sentinels must exist.
- Every input path passes the path policy before filesystem access.
- Every existing-target update requires `expected_hash`.
- A prepared save uses server-stored bytes and an unexpired `operation_id`.
- Every formal artifact candidate passes generic validation before replacement.
- Every final Vault state passes generic validation after replacement.
- Failure preserves or restores the original bytes.
- Runtime logs contain identifiers and hashes, not raw user or patient text.

## Result envelope

Service operations return:

```json
{
  "ok": true,
  "tool": "kdf_capture",
  "mode": "apply",
  "operation_id": "KDFOP-...",
  "data": {},
  "planned_changes": [],
  "files_affected": [],
  "validation": {
    "pre_write": {"passed": true, "errors": []},
    "post_write": {"passed": true, "errors": []}
  },
  "missing_requirements": [],
  "warnings": []
}
```

Errors are `BridgeError` instances with a stable public code and optional safe
details. Raw stacks are restricted to local debug output.

## Write classes

### Direct low-risk create

- capture;
- new research question;
- new observation artifact.

These still use lock, candidate validation, atomic create, final validation, and an
operation log. An existing observation aggregate is an update and therefore requires
`expected_hash`.

### Prepared higher-risk write

- Mature Knowledge candidate;
- platform content draft;
- Discovery Question candidate;
- any internal update of an existing formal artifact.

Prepare is non-mutating for formal artifacts. Save re-checks all state.

## Dependency direction

```text
adapters -> KdfService -> validator/repository/write coordinator
                         -> path policy/lock/prepare store/audit log
```

Storage and domain modules do not import adapters.
