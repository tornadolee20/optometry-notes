# KDF ChatGPT Frontend E2E v0.1.2

Status: `READY BUT NOT EXECUTED`

This sheet must be executed in the intended ChatGPT frontend. Codex Desktop, a unit
test, CLI invocation, or direct MCP SDK client cannot change this status to PASS.

## Execution rules

- Use a dedicated acceptance request namespace such as `chatgpt-e2e-v012-*`.
- Execute the prompts in order. Replace values in braces with the preceding actual
  response; do not invent missing IDs or hashes.
- Record only the minimum evidence needed. Do not copy private clinical text into the
  evidence table or runtime audit.
- Do not save prepared content/discovery candidates and do not publish anything.
- Any generated artifact remains in the Vault until a separate owner-approved
  maintenance task; the Bridge intentionally has no delete tool.
- `PASS` requires actual ChatGPT routing, structured response evidence, readback where
  specified, and an explicit reviewer decision.

## Golden Path

| Test ID | User prompt | Expected tool / mode | Expected structured result | Expected artifact/state change | Expected no-change condition |
| --- | --- | --- | --- | --- | --- |
| E2E-01 | 幫我查周邊離焦以前有哪些資料。 | `kdf_search` / `read` | `ok=true`; results include KDF-001 references and typed IDs, paths, status | None | No file write |
| E2E-02 | 讀取 MKC-KDF-001-B-001，包含來源、連結與 provenance。 | `kdf_read_card` / `read` | Correct Mature card, frontmatter, links and provenance | None | No file write |
| E2E-03 | 把這段本人提供的驗收測試資料先放進收件匣，不要當證據：「E2E 測試：動態運動時的周邊感受需要另行研究；這不是臨床事實。」request_id 用 `chatgpt-e2e-v012-capture-001`。 | `kdf_capture` / `write` | `status=unclassified`; `request_id` echoed; `artifact_ref`; `created=true` | One Inbox capture with `source=chatgpt`, `human_provided=true` | No formal Evidence Card; no publish/Git action |
| E2E-04 | 建立研究問題：「周邊離焦鏡片配戴者在動態球類運動中的周邊主觀不適，是否不同於靜態日常活動？」root topic 用 KDF-001，parent 用 KDF-001-B，理由是這是 E2E 驗收用候選問題，來源卡用 KDF-001-B-001，request_id 用 `chatgpt-e2e-v012-question-001`，正式寫入。 | `kdf_create_question` / `write` | `created=true`; `idempotent_replay=false`; same request ID; new `artifact_ref` and SHA-256 | Exactly one Research Question | No second question; no commit/push |
| E2E-05 | 完全重送 E2E-04 的相同請求與相同 request_id。 | `kdf_create_question` / `write` | Same `artifact_ref` and hash; `created=false`; `idempotent_replay=true` | None | No second card and no ID increment |
| E2E-06 | 把以下本人提供的驗收測試輸入掛到 `{E2E-04 artifact_ref}`，kind 用 field-observation，request_id 用 `chatgpt-e2e-v012-observation-001`，source record 記為 `Owner-provided ChatGPT E2E acceptance input`，human confirmed 為 true：「E2E 測試輸入；Observation 不等於 Evidence，不代表真實臨床結論。」正式寫入。 | `kdf_add_observation` / `write` | `created=true`; typed `artifact_ref`; provenance present; observation/evidence flags false | Exactly one Field Observation under E2E-04 question | No Evidence Card; no scientific conclusion |
| E2E-07 | 檢查 `{E2E-04 artifact_ref}` 是否成熟；只做 check，不足就列 missing requirements，不要 prepare 或 save。 | `kdf_compile_mature` / `check` | `missing_requirements` is explicit; `save_ready=false` when incomplete; no operation ID | None | No Mature card write and no prepared payload |
| E2E-08 | 從 MKC-KDF-001-B-001 準備一份 Facebook 草稿，內容只寫「E2E draft placeholder」，只 prepare，不要 save 或發布。 | `kdf_generate_content` / `prepare` | `operation_id`, `prepared_ref`, `expected_hash`, `proposed_hash`, `expires_at`; `save_ready=true` | One expiring prepared operation only | No Content Card write; `publish_approved` unchanged; no publication |
| E2E-09 | 以 EVC-KDF-001-B-001 和 MKC-KDF-001-B-001 為來源，提出候選問題「動態運動情境是否需要獨立的周邊視覺研究設計？」relation 用 MISSING_LINK，原因是現有資料未直接回答動態活動，missing evidence 記為缺少動態運動研究，priority 用 medium；只 prepare，不要 save。 | `kdf_discover` / `prepare` | Candidate `artifact_ref`; `human_approved=false`; operation/hash/expiry fields | One expiring prepared operation only | No Discovery Question write; no new scientific conclusion |
| E2E-10 | 請重新查讀剛才建立的研究問題與 field observation，確認沒有第二張重複問題，也沒有把 observation 當 evidence；並說明你沒有發布、push 或覆寫既有卡。 | `kdf_search` + `kdf_read_card` / `read` | Same E2E-04 artifact; one related observation; evidence distinction stated | None | Owner separately confirms no publish, push, overwrite or duplicate |

## Evidence record

Create one row per step during the actual ChatGPT run. `User prompt` may reference the
exact prompt above when no text was changed; otherwise record a minimally redacted
version and its hash.

| Step | Timestamp | User prompt | Tool selected | Mode / arguments summary | request_id | operation_id | artifact_ref | prepared_ref | Status | Expected result | Actual result | PASS / FAIL | Evidence note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| E2E-01 | — | See Golden Path | — | — | — | — | — | — | NOT_EXECUTED | Search routes correctly | — | — | — |
| E2E-02 | — | See Golden Path | — | — | — | — | — | — | NOT_EXECUTED | Mature card read | — | — | — |
| E2E-03 | — | See Golden Path | — | — | — | — | — | — | NOT_EXECUTED | One capture | — | — | — |
| E2E-04 | — | See Golden Path | — | — | — | — | — | — | NOT_EXECUTED | One question | — | — | — |
| E2E-05 | — | See Golden Path | — | — | — | — | — | — | NOT_EXECUTED | Idempotent replay | — | — | — |
| E2E-06 | — | See Golden Path | — | — | — | — | — | — | NOT_EXECUTED | Observation only | — | — | — |
| E2E-07 | — | See Golden Path | — | — | — | — | — | — | NOT_EXECUTED | Missing requirements | — | — | — |
| E2E-08 | — | See Golden Path | — | — | — | — | — | — | NOT_EXECUTED | Prepared content | — | — | — |
| E2E-09 | — | See Golden Path | — | — | — | — | — | — | NOT_EXECUTED | Prepared candidate | — | — | — |
| E2E-10 | — | See Golden Path | — | — | — | — | — | — | NOT_EXECUTED | Safe readback | — | — | — |

## Recovery path — blocking acceptance support

After E2E-08, ask ChatGPT:

> 請用 prepared reference `KDFOP-000000000000000000000000` 預覽剛才的 Facebook
> 草稿，不要 save；如果 reference 不存在，請解釋目前狀態並重新 prepare，不能跳過
> prepare，也不能建立正式內容卡。

Expected behavior:

1. The first preview returns typed `PREPARE_NOT_FOUND`.
2. ChatGPT explains that no save occurred and does not guess candidate bytes.
3. ChatGPT repeats the E2E-08 prepare request and receives a new prepared reference.
4. It does not save either proposal, publish, duplicate a formal artifact, or bypass
   the prepare gate.

| Timestamp | Initial error | Explanation correct | Re-prepare result | Formal card delta | PASS / FAIL | Evidence note |
| --- | --- | --- | --- | --- | --- | --- |
| — | NOT_EXECUTED | — | — | — | — | — |

An optional expiry drill may instead wait beyond the recorded `expires_at` and must
observe `PREPARE_EXPIRED` before re-preparing. Do not shorten runtime TTL for E2E.

## Natural-language Uncle Test — non-blocking v0.2 input

Use this prompt exactly, without naming any tool:

> 我今天有個小朋友戴周邊離焦鏡片，媽媽說平常很好，
> 但打羽球時一直覺得側邊怪怪的，
> 這個之前 KDF 有沒有相關研究？

Expected routing: natural-language intent → search → relevant KDF artifact → read →
answer that distinguishes existing evidence, research gaps, and observation context.
It must not silently capture the prompt or present the anecdote as Evidence.

| Timestamp | Tool route | Search refs / rank | Read refs | Evidence-gap distinction | Final-answer usefulness | PASS / FAIL | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| — | NOT_EXECUTED | — | — | — | — | — | — |

This Uncle Test is recorded for future Skill Runtime design and is not a blocking
v0.1.2 AC unless the owner explicitly promotes it into the acceptance contract.

## Completion rule

Golden Path status becomes PASS only when all 10 rows are PASS and recovery evidence
shows safe stop and re-prepare behavior. Until actual ChatGPT execution, retain
`READY BUT NOT EXECUTED` and do not substitute local or Codex-client evidence.
