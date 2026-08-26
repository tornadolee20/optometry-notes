# KDF-001 Formal Manifest Baseline

Status: `RECONCILED`

Reconciled: 2026-08-21 (Asia/Taipei)

## Decision

The authoritative KDF-001 v0.1 formal manifest is:

```text
991ae3bf286ffecc823c44239de6b1bb14dc20de4e314c4a9f5ce939b98921fd
```

The previously reported value
`e11935d5af2b7e38f450b2e2697fddc5bb46df1836f2410916733c1d915ae6f2`
is a historical, non-reproducible, superseded baseline. It is not evidence of
lost KDF data. At checkpoint `a9542d7a4345ae3f80f81ef58b22ffda58ff682b`,
all 17 worktree artifacts are byte-for-byte equal to their Git blobs, the tree
is clean, both validators pass, and the historical algorithm reproduces
`991ae3...21fd` on repeated runs.

## Historical algorithm recovered from acceptance evidence

The earlier ad hoc PowerShell calculation:

1. enumerated direct `*.md` files in
   `obsidian-vault/04-知識卡片/KDF/KDF-001` and
   `obsidian-vault/07-長篇專欄與企劃/KDF`;
2. sorted `FileInfo.FullName` using PowerShell `Sort-Object`;
3. hashed each complete raw worktree file with SHA-256;
4. serialized each item as native relative path, `=`, then lowercase file hash;
5. joined those lines with LF and no trailing LF;
6. SHA-256 hashed the UTF-8 aggregate.

That calculation did not persist its 17 serialized input lines or per-file
hashes. The recorded `e11935...6f2` aggregate therefore cannot be audited or
reproduced from the checkpoint. Running the recovered algorithm three times on
the checkpoint produces `991ae3...21fd` each time. The precise historical
input difference cannot be proven after the fact, so it must not be guessed.

## Canonical algorithm: `kdf-formal-manifest-v1`

The canonical implementation is `scripts/kdf_formal_manifest.mjs`. Its input
is defined exactly:

1. Membership is the fixed 17-path KDF-001 v0.1 allowlist in the script.
2. Allowlist and reported paths use `/` and are sorted by ascending UTF-8
   bytes. Filesystem enumeration order is ignored.
3. Each complete file is read as bytes. Every CRLF byte pair is replaced by
   LF. No other bytes are changed: no Unicode normalization, BOM stripping,
   whitespace trimming, frontmatter extraction, or final-newline removal.
4. Each canonical file byte sequence is SHA-256 hashed to lowercase hex.
5. For aggregate compatibility with the reproducible checkpoint value, each
   POSIX path is converted to an explicitly forced `\` token. This is not the
   host path separator; every platform must emit the same token.
6. Aggregate lines are `path=sha256`, joined by one LF with no trailing LF,
   then UTF-8 encoded and SHA-256 hashed.
7. Hidden, Inbox, runtime, lock, temp, audit, and any non-allowlisted files are
   excluded from the immutable baseline. A new formal artifact is reported under
   `added_since_baseline` with state `BASELINE_CHANGED`; it does not alter the frozen
   hash and is validated separately as part of the current Vault.

The explicit `\` aggregate token is retained because changing it to `/` would
invent a third baseline hash during reconciliation. Cross-platform stability
comes from forcing the token in code rather than inheriting Windows behavior.
CRLF canonicalization keeps the result stable across Git autocrlf settings
while still detecting meaningful worktree content changes.

## Command

From the repository root:

```powershell
node scripts\kdf_formal_manifest.mjs
```

The command prints the algorithm metadata, all 17 POSIX paths and per-file hashes,
the aggregate hash, and additions since that release. It exits non-zero only when a
baseline member is missing or its authoritative hash no longer matches. Valid growth
returns `BASELINE_CHANGED` with exit code zero. Generate the current Vault snapshot
separately with:

```powershell
node scripts\kdf_current_snapshot.mjs current
```

Promotion is explicit and documented in
`CHATGPT-BRIDGE-v0.1.2-OPERATIONAL-CLOSURE.md`; it never changes this historical v0.1
record automatically.
