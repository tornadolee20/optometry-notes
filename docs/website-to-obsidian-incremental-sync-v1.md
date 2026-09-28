# Website → Obsidian Incremental Sync v1

## Purpose

Mirror newly published uncle-glasses.net articles into the Obsidian history vault without overwriting existing knowledge files.

## Current baseline

The reconciled website inventory contains **79 published articles**.

Those 79 `websiteArticleIdx` values are seeded into:

`obsidian-vault/10-歷史文章智庫/indexes/incremental-sync-state.v1.json`

Therefore the first normal sync run treats them as already known and does not re-import them.

## Flow

```
Website article export
        ↓
scripts/incremental_sync.py
        ↓
compare websiteArticleIdx against sync state
        ↓
new IDs only
        ↓
scripts/import_new_site_articles.py
        ↓
Obsidian Markdown mirror
        ↓
scripts/build_site_index.py
        ↓
reconciliation-report.v1.json
        ↓
update sync state only after success
```

## Safety rules

- Existing Markdown is **not overwritten** by default.
- Missing website articles do **not** cause Markdown deletion.
- Conflict resolution remains a **human gate**.
- Sync state is updated only after import + reconciliation succeed.
- `--dry-run` does not update state.
- Orphan registry assets are knowledge-vault exceptions, not website-sync errors.

## Command

```bash
python scripts/incremental_sync.py path/to/full-website-articles.json \
  --inventory-json path/to/current-website-inventory.json
```

Dry run:

```bash
python scripts/incremental_sync.py path/to/full-website-articles.json \
  --inventory-json path/to/current-website-inventory.json \
  --dry-run
```

## Trigger boundary

This repository now owns the **sync engine**, but it does not invent a website API endpoint.

To make sync fully automatic, the website side must later provide one of:

1. a publish webhook that supplies the published article payload, or
2. an authenticated/public API endpoint that GitHub Actions can call, or
3. a scheduled export artifact deposited where this repository can retrieve it.

Until one of those exists, triggering remains external/manual while reconciliation and import behavior are deterministic and safe.
