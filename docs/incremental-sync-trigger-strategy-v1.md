# Incremental Sync Trigger Strategy v1

## Current platform capability

As of 2026-09-29, the website MCP exposes article listing, article detail, create/update/publish/unpublish operations, but does **not** expose:

- article publish webhook registration
- generic webhook registration
- external integration trigger
- documented public article REST endpoint suitable for GitHub Actions

Therefore the sync engine must not assume a webhook exists.

## Recommended trigger now: polling

Use a scheduled external orchestrator to:

1. call Website `article_list(status=published)`
2. compare returned article idx values against `incremental-sync-state.v1.json`
3. for new idx values, call Website `article_get(article_idx)`
4. assemble a full article JSON batch
5. run:
   `python scripts/incremental_sync.py <full-article-json> --inventory-json <inventory-json>`
6. commit resulting Markdown/index/state changes only when reconciliation succeeds

## Frequency

A 15–60 minute cadence is sufficient for knowledge mirroring. This is not a user-facing publish dependency, so near-real-time execution is unnecessary.

## Upgrade path

When the website platform later exposes a publish webhook/event:

```
article_publish success
        ↓
publish event/webhook
        ↓
fetch that article payload
        ↓
same incremental_sync.py
```

Only the trigger changes. The importer, identity rules, reconciliation, and state model remain the same.

## Failure policy

- Website failure: do not advance sync state.
- GitHub failure: do not advance sync state.
- Import conflict: report and stop; do not overwrite.
- Reconciliation failure: report and stop.
- Missing/deleted website item: never delete Obsidian automatically.
- Registered orphan assets: ignored as sync errors.

## End-state definition

The system is considered automated when an external scheduler/agent performs the polling loop without requiring the user to manually compare or copy article data.

The knowledge sync must remain non-blocking for website publishing.
