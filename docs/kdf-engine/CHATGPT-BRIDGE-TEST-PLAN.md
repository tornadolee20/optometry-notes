# KDF ChatGPT Bridge v0.1 Test Plan

Status: `FROZEN`

## Layers

1. Unit: frontmatter, path policy, hashes, IDs, semantic validation.
2. Storage: locks, stale locks, atomic replace, rollback, hash conflicts, temp cleanup.
3. Service: eight tools, prepare/save expiry, capture idempotency.
4. Adapter: MCP schemas and CLI route into the same service.
5. Fixture: isolated temporary copy of KDF-001 plus generated writes.
6. Regression: canonical validator and protected-path diff check.
7. Baseline: fixed-membership KDF-001 formal manifest with canonical newline handling.

Tests use temporary repositories with `.git` and `obsidian-vault` sentinels and never
write to live KDF-001 artifacts.

## Required scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | Search `周邊離焦` | finds `KDF-001` |
| 2 | Read Mother and Evidence | frontmatter/body/hash returned |
| 3 | Capture human text | one Inbox envelope, verbatim body, provenance |
| 4 | Add observation | observation flags false; human state enforced |
| 5 | Mature check | missing gates returned without write |
| 6 | Content from Mature | private draft backlinks Mature card |
| 7 | Discover | candidate only, controlled relation, human false |
| 8 | traversal/drive/UNC/reparse path | rejected before access |
| 9 | invalid frontmatter | no final file or temp residue |
| 10 | duplicate ID | rejected, original unchanged |
| 11 | prepare new/existing targets | explicit `expected_hash`: null/SHA-256 |
| 12 | pending Uncle Lens compile prepare | `HUMAN_CONFIRMATION_REQUIRED`, no operation or mutation |
| 13 | real client prepare, fixture revision, save | `HASH_MISMATCH`, helper revision preserved |

Negative coverage also includes malformed restricted YAML, wrong parent type, missing
provenance, dirty target, expected-hash conflict, concurrent writers, stale lock,
interruption, rollback, expired/reused prepare, and audit redaction.

Real-client conflict acceptance uses only a temporary `kdf-bridge-test-*` repository.
The compiled test helper validates that the root is a direct child of the system temp
directory and fixes the only mutable target to `MKC-KDF-001-B-001.md`. It is not an
MCP tool, never enters the formal manifest, and removes the whole isolated fixture
after lock, temp, prepared-operation, audit-redaction, and target-integrity checks.

## Commands and pass gate

```powershell
cd mcp-servers\kdf-chatgpt-bridge
npm.cmd ci
npm.cmd run build
npm.cmd test
npm.cmd run kdf -- validate
cd ..\..
python scripts\validate_kdf.py
node scripts\kdf_formal_manifest.mjs
git diff --check
```

Final status is `PASS` only if all new tests, compatibility validation, KDF-001 fixture
regression, protected-path checks, formal manifest verification, and `git diff --check`
pass. The manifest command must reproduce
`991ae3bf286ffecc823c44239de6b1bb14dc20de4e314c4a9f5ce939b98921fd`.
Its exact membership and serialization rules are frozen in
`KDF-FORMAL-MANIFEST.md`.
