# KDF ChatGPT Bridge v0.1 Test Plan

Status: `FROZEN`

## Layers

1. Unit: frontmatter, path policy, hashes, IDs, semantic validation.
2. Storage: locks, stale locks, atomic replace, rollback, hash conflicts, temp cleanup.
3. Service: eight tools, prepare/save expiry, capture idempotency.
4. Adapter: MCP schemas and CLI route into the same service.
5. Fixture: isolated temporary copy of KDF-001 plus generated writes.
6. Regression: canonical validator and protected-path diff check.

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

Negative coverage also includes malformed restricted YAML, wrong parent type, missing
provenance, dirty target, expected-hash conflict, concurrent writers, stale lock,
interruption, rollback, expired/reused prepare, and audit redaction.

## Commands and pass gate

```powershell
cd mcp-servers\kdf-chatgpt-bridge
npm.cmd ci
npm.cmd run build
npm.cmd test
npm.cmd run kdf -- validate
cd ..\..
python scripts\validate_kdf.py
git diff --check
```

Final status is `PASS` only if all new tests, compatibility validation, KDF-001 fixture
regression, protected-path checks, and `git diff --check` pass.
