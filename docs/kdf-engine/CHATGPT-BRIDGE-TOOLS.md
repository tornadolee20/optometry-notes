# KDF ChatGPT Bridge v0.1 MCP Tool Contract (Frozen)

- Contract version: `0.1.0`
- Status: `FROZEN`
- Tool count: 8
- Transport: local MCP STDIO
- Service authority: `KdfService`

## 1. Common contract

### Common result

Every tool returns structured content matching this envelope:

```json
{
  "ok": true,
  "tool": "kdf_search",
  "mode": "read",
  "operation_id": null,
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

MCP also returns a short text summary. The structured envelope is authoritative.
Retrieved Markdown is untrusted data and never overrides server rules.

### Stable public errors

```text
INVALID_INPUT
PATH_NOT_ALLOWED
PATH_TRAVERSAL
REPARSE_POINT_ESCAPE
NOT_FOUND
AMBIGUOUS_CARD
ALREADY_EXISTS
DUPLICATE_ID
INVALID_METADATA
PARENT_NOT_FOUND
INVALID_PARENT_TYPE
PROVENANCE_REQUIRED
MISSING_REQUIREMENTS
HUMAN_CONFIRMATION_REQUIRED
TARGET_DIRTY
HASH_MISMATCH
WRITE_CONFLICT
LOCK_CONFLICT
VALIDATION_FAILED
RELATION_INVALID
PREPARE_NOT_FOUND
PREPARE_EXPIRED
ATOMIC_WRITE_FAILED
ROLLBACK_FAILED
INTERNAL_ERROR
```

Errors never return raw stacks, secrets, unrelated absolute paths, or raw operation
payloads.

### Expected hash rule

Creating a new target uses `expected_hash: null`. Updating an existing target requires
the exact SHA-256 returned by `kdf_read_card` or prepare. A mismatch is
`HASH_MISMATCH`; the target is not overwritten.

Every prepare response from `kdf_compile_mature`, `kdf_generate_content`, and
`kdf_discover` owns an explicit `data.expected_hash` property. It is a 64-character
lowercase SHA-256 for an existing target and JSON `null` for a new target; clients
must not infer an omitted value.

### Prepare rule

For higher-risk tools, candidate bytes are submitted during `prepare` and stored by
the server under an expiring `operation_id`. `save` accepts the operation ID and
expected hash, not replacement prose.

A higher-risk `save` writes only when the caller explicitly sends
`dry_run: false`. The default `dry_run: true` previews the exact stored proposal
without consuming its operation ID.

## 2. Tool summary

| Tool | Class | Mutation | Default dry run | Idempotency |
| --- | --- | --- | ---: | --- |
| `kdf_search` | READ | none | n/a | pure for one Vault snapshot |
| `kdf_read_card` | READ | none | n/a | pure for one Vault snapshot |
| `kdf_capture` | WRITE-LOW-RISK | create one Inbox file | false | `request_id` |
| `kdf_create_question` | WRITE-LOW-RISK | create one Research Question | false | duplicate question/ID rejection |
| `kdf_add_observation` | WRITE-LOW-RISK | create or hash-guarded update | false | `request_id` and target hash |
| `kdf_compile_mature` | WRITE-HIGHER-RISK | prepare/save one candidate | true | `operation_id` |
| `kdf_generate_content` | WRITE-HIGHER-RISK | prepare/save one private draft | true | `operation_id` |
| `kdf_discover` | WRITE-HIGHER-RISK | prepare/save one candidate question | true | `operation_id` |

All tools set `openWorldHint: false` and `destructiveHint: false`. The two read tools
set `readOnlyHint: true`; all others set it to `false`.

## 3. `kdf_search`

### Purpose

Recursively search allowlisted KDF, compiled knowledge, KDF content, and KDF Inbox
paths. An empty query lists indexed artifacts.

### Input

```json
{
  "query": "string, max 500, default empty",
  "type": "optional KDF/capture type",
  "root_topic": "optional immutable root ID",
  "status": "optional allowed status",
  "limit": "integer 1..50, default 10"
}
```

### Output data

```json
{
  "items": [{
    "id": "string",
    "title": "string",
    "type": "string",
    "status": "string",
    "path": "repo-relative POSIX path",
    "short_summary": "deterministic excerpt",
    "related_cards": ["IDs"],
    "sha256": "hex"
  }],
  "total": 0
}
```

### Validation and behavior

- Search is normalized literal text, never a regular expression.
- Paths are repo-relative and drawn from the server index.
- `limit` is enforced server-side.
- No file is written.

## 4. `kdf_read_card`

### Purpose

Read one indexed card or capture by immutable ID or by an exact path previously
returned by the Bridge.

### Input

```json
{
  "id": "optional string",
  "path": "optional repo-relative path"
}
```

Exactly one selector is required.

### Output data

```json
{
  "id": "string",
  "path": "repo-relative path",
  "frontmatter": {},
  "body": "string",
  "links": ["IDs or filenames"],
  "backlinks": ["IDs"],
  "provenance": [],
  "sha256": "hex"
}
```

### Validation and behavior

- Caller paths cannot escape or bypass the indexed read allowlist.
- Duplicate IDs return `AMBIGUOUS_CARD`.
- No file is written.

## 5. `kdf_capture`

### Purpose

Preserve one raw, human-provided input in the Vault Inbox without promoting it to
evidence or a formal KDF artifact.

### Input

```json
{
  "text": "required string, 1..50000",
  "title": "optional string, max 200",
  "tags": ["optional strings, max 20"],
  "related_cards": ["optional existing IDs, max 20"],
  "request_id": "optional idempotency key, max 200",
  "dry_run": false
}
```

### Output data

```json
{
  "id": "CAP-...",
  "path": "obsidian-vault/00-收件匣/KDF/...md",
  "status": "unclassified",
  "raw_content_sha256": "hex",
  "sha256": "whole-file hex",
  "created": true,
  "idempotent_replay": false
}
```

### Validation and behavior

- Forces `type: capture`, `status: unclassified`, `source: chatgpt`,
  `source_type: human-input`, and `human_provided: true`.
- Preserves raw text verbatim in the body.
- Never infers root, parent, diagnosis, evidence, frequency, or relation.
- Related IDs must exist; unknown IDs are rejected rather than invented.
- A repeated `request_id` with the same raw hash returns the first capture.
- A repeated `request_id` with different text returns `INVALID_INPUT`.
- `dry_run` returns the plan and candidate validation without creating a file.

## 6. `kdf_create_question`

### Purpose

Create one bounded Research Question under an existing Mother Topic without
fabricating PICO details or relations.

### Input

```json
{
  "question": "required string, 1..2000",
  "root_topic": "required Root ID",
  "parent": "required Mother Topic ID",
  "reason": "optional string, max 5000",
  "source_cards": ["optional existing IDs, max 50"],
  "request_id": "optional idempotency key",
  "dry_run": false
}
```

### Output data

```json
{
  "id": "KDF-...-[A-H]-NNN",
  "path": "repo-relative path",
  "sha256": "hex",
  "created": true
}
```

### Validation and behavior

- Root and parent must exist; parent must be a Mother Topic of that root.
- Every source ID must exist.
- The next ID is allocated while holding a root/mother allocation lock.
- Missing framework details remain empty; `question_framework` is `other`.
- The tool creates one file and does not silently update the parent card.
- A near-identical question under the same parent is rejected as `ALREADY_EXISTS`.
- `dry_run` does not reserve an ID and does not write.

## 7. `kdf_add_observation`

### Purpose

Create or safely append human-supplied Uncle Lens or Field Observation material.

### Input

```json
{
  "kind": "uncle-lens | field-observation",
  "research_question": "required Research Question ID",
  "text": "required verbatim human input, 1..50000",
  "source_record": "optional traceable source, max 1000",
  "human_confirmed": false,
  "expected_hash": "required when target exists",
  "request_id": "optional idempotency key",
  "dry_run": false
}
```

### Output data

```json
{
  "id": "ULC-... or FOC-...",
  "path": "repo-relative path",
  "confirmation_state": "pending_human_confirmation | confirmed | not-applicable",
  "observation_is_evidence": false,
  "validated_questionnaire": false,
  "sha256": "hex"
}
```

### Validation and behavior

- Always forces `observation_is_evidence: false`.
- Field Observation also forces `validated_questionnaire: false`.
- Uncle Lens requires a traceable Evidence Card for the same question.
- Field Observation requires a Practice Card for the same question.
- `human_confirmed: true` requires a non-empty `source_record`.
- Pending Uncle Lens maps to existing Vault status `waiting-human`; confirmed maps
  to `thinking` with `human_review: approved`.
- An existing target requires `expected_hash` and is downgraded to pending if new
  unconfirmed Uncle Lens material is appended.
- Raw text is not copied to the audit log.

## 8. `kdf_compile_mature`

### Purpose

Check Mature Knowledge readiness, prepare a candidate, and save only an eligible
prepared candidate.

### Input

```json
{
  "mode": "check | prepare | save",
  "research_question": "required for check/prepare",
  "candidate_body": "optional for prepare, max 200000",
  "operation_id": "required for save",
  "expected_hash": "required for existing target save",
  "dry_run": true
}
```

### Output data

```json
{
  "save_ready": false,
  "operation_id": "optional KDFOP-...",
  "target": "repo-relative path",
  "expected_hash": "hex or null",
  "proposed_hash": "hex or null",
  "included_sources": ["IDs"],
  "omitted_sources": ["IDs/reasons"],
  "pending_human_gates": ["Gate 1"],
  "unresolved_links": [],
  "evidence_strength": "C1 | C2 | H | empty",
  "contradictions": [],
  "candidate_content": "string",
  "expires_at": "ISO timestamp"
}
```

### Validation and behavior

- Requires Evidence with provenance, approved Gate 1, confirmed Uncle Lens, and
  Practice linked to Evidence and Uncle Lens.
- Field Observation is optional and never treated as evidence.
- `check` never creates a prepared operation.
- `prepare` may return a preview when incomplete, but `save_ready` stays false.
- A pending or unconfirmed Uncle Lens makes `prepare` fail immediately with
  `HUMAN_CONFIRMATION_REQUIRED`; no prepared operation or artifact is created.
- Other incomplete requirements remain a non-writing preview with
  `MISSING_REQUIREMENTS` in the result.
- A Mature Knowledge file remains a candidate unless lifecycle rules independently
  permit `status: mature`.

## 9. `kdf_generate_content`

### Purpose

Prepare and save a private platform draft from Mature Knowledge. It never publishes.

### Input

```json
{
  "mode": "prepare | save",
  "source_knowledge": "required for prepare, MKC ID",
  "platform": "facebook | threads | blog | short_video | podcast | teaching",
  "draft_body": "required for save-ready prepare, max 300000",
  "operation_id": "required for save",
  "expected_hash": "required for existing target save",
  "dry_run": true
}
```

### Validation and behavior

- Rejects Root, Mother, Research Question, and naked Topic inputs.
- The source must exist and have `type: mature-knowledge`.
- Prepare returns source/evidence boundaries and pending gates.
- Save forces `type: content-draft`, `status: draft`, `source_knowledge`,
  `publish_approved: false`, and Gate 3 pending.
- The operation has no network or publisher capability.

## 10. `kdf_discover`

### Purpose

Prepare and save only a Candidate Discovery Question from traceable Evidence or
Mature Knowledge origins.

### Input

```json
{
  "mode": "prepare | save",
  "root_topic": "required for prepare",
  "origin_cards": ["at least two for save-ready prepare"],
  "candidate_question": "required for save-ready prepare",
  "relation_type": "controlled relation",
  "reason": "required for save-ready prepare",
  "missing_evidence": "required for save-ready prepare",
  "priority": "low | medium | high",
  "operation_id": "required for save",
  "expected_hash": "required for existing target save",
  "dry_run": true
}
```

Controlled relations:

```text
SUPPORTS
CONTRADICTS
RELATED_TO
SHARES_MECHANISM
MAY_EXPLAIN
MISSING_LINK
CREATES_NEW_QUESTION
```

### Validation and behavior

- Origins must be existing Evidence or Mature Knowledge under the root.
- Save requires at least two origins and one controlled relation.
- Forces `type: discovery-question`, `status: candidate`,
  `human_approved: false`, and `discovery_ready: false`.
- The body labels the output unverified.
- It does not assert mechanism, causality, or scientific conclusion and cannot enter
  `researching` without a separate human-approved workflow not exposed in v0.1.

## 11. Contract changes

Any future input, output, error, path, or Human Gate change requires a versioned
contract update before adapter code changes. Legacy MCP tool contracts are unrelated
and remain untouched.
