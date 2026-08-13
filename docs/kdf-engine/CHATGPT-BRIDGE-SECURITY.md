# KDF ChatGPT Bridge v0.1 Security Boundary

Status: `FROZEN`

## Trust boundary

The bridge trusts only its compiled configuration and the machine-readable KDF
contract. ChatGPT input, Markdown bodies, YAML values, Wikilinks, prepared-operation
identifiers, environment variables, and repository contents are untrusted inputs.

The server exposes no shell, arbitrary filesystem, delete, rename, Git, publish, or
network tool. Its allowed roots are limited to:

- `obsidian-vault/00-收件匣/KDF/`
- `obsidian-vault/04-知識卡片/`
- `obsidian-vault/07-長篇專欄與企劃/KDF/`
- `logs/kdf-bridge/` for local runtime state and redacted audit events

The repo root must contain both `.git` and `obsidian-vault` sentinels. The bridge does
not accept a vault root from an MCP request.

## Path policy

Every path is decoded once, normalized with Node `path` APIs, and checked before I/O.
The server rejects:

- absolute paths, drive-qualified paths, UNC and device paths
- `..` segments before or after percent decoding
- NUL, alternate data stream (`:`), mixed encoded separators, and invalid UTF-8
- targets outside an operation-specific allowlist
- symlink, junction, or other reparse-point escapes detected from the nearest existing
  ancestor's real path

Containment is checked case-insensitively on Windows using `path.relative`; prefix
string comparison is not used. Chinese paths and Markdown filenames remain supported.

## Write integrity

All writes follow the same sequence:

1. validate the request and current repository graph
2. acquire an exclusive per-target lock
3. verify target existence and expected SHA-256
4. write a same-directory temporary file with exclusive creation
5. flush the file and validate the candidate
6. atomically install it: no-replace same-directory hard link for a new target, or
   rename replace after a final expected-hash recheck for an existing target
7. validate the complete repository graph
8. rollback to the saved bytes when post-write validation fails
9. append a redacted audit event and release the lock

An existing target cannot be updated without an expected hash. An unmerged Git target
or a target already dirty relative to `HEAD` fails closed. A dirty tree elsewhere does
not block creation of one new card. The bridge never commits or pushes.

Lock files are local runtime artifacts. A stale lock is quarantined with an audit
warning; it is never silently ignored. Lock acquisition has a bounded timeout.

## Human and provenance gates

- Observations always persist `observation_is_evidence: false`.
- Field observations also persist `validated_questionnaire: false`.
- AI cannot create first-person observations. A human-input provenance field is
  required.
- Pending Uncle Lens maps to existing KDF fields `status: waiting-human`,
  `human_confirmed: false`, `human_review: pending`.
- Confirmed Uncle Lens maps to `status: thinking`, `human_confirmed: true`,
  `human_review: approved`, with non-empty `human_source`.
- Mature Knowledge save requires Gate 1 approval, source provenance, a confirmed Uncle
  Lens, and a Practice Card.
- Content output is always a private draft with `publish_approved: false`.
- Discovery output is always a candidate with `human_approved: false`.

## Prepare/save boundary

`kdf_compile_mature`, `kdf_generate_content`, and `kdf_discover` use two phases.
Prepare validates and stores exact candidate bytes in local expiring state. Save accepts
only `operation_id` and `expected_hash`; it cannot substitute new prose. Expired,
missing, already-consumed, or hash-mismatched operations fail without writing.

## Logging and privacy

Runtime files under `logs/kdf-bridge/` are Git-ignored. Each write event records time,
operation, operation ID, card ID, repo-relative path, input SHA-256 summary, result,
old/new hashes, validation summary, and stable error code. It does not record raw note
bodies, observation text, secrets, host environment, or unrelated absolute paths.

## Known residual risks

- Local users with write access can edit the Vault or runtime state outside the bridge.
- Git does not serialize two external editors; hashes and locks protect only bridge
  operations and detected concurrent changes.
- Windows antivirus/indexers can transiently delay rename or lock operations; the
  implementation fails closed instead of retrying indefinitely.
- Markdown remains prompt-injection-capable content. Adapters must treat retrieved text
  as data, and server-side rules remain authoritative.
