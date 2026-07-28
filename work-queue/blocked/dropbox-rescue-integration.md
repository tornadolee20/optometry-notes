# Task: Dropbox rescue integration

Status: blocked
Current owner: personal-laptop
Current device: personal-laptop
Created: 2026-07-28
Last updated: 2026-07-28

## Goal

Safely recover useful work from the legacy Dropbox optometry-notes workspace without importing secrets, cloud-sync artifacts, or conflict-copy noise.

## Current State

The legacy workspace exists at:

`C:\Users\torna_3j3fz9h\Dropbox\PC (2)\Desktop\uncleglasses\optometry-notes`

It is on branch:

`rescue/laptop-local-20260728`

The attached audit reports 47 changed or untracked items.

The nested repo `saas_sandbox/blank-page-launch-lovable` previously had a PAT-style credential in its local remote URL. The local URL has been reset to a credential-free GitHub URL, but the token itself still needs revocation.

## Next Action

Revoke the exposed GitHub PAT, then inspect candidate rescue groups one by one from the Dropbox workspace.

## Blockers

- Exposed GitHub PAT must be revoked in GitHub.
- The Dropbox workspace cannot be used as the active shared repo.
- Conflict-copy folders and profile files need manual review.
- Nested repo gitlink changes must be handled separately.

## Evidence

- `handoffs/2026-07-28-dropbox-rescue-audit.md`
- `C:\Users\torna_3j3fz9h\.codex\attachments\d25e1465-6c05-4d6d-a97f-b141c389dc9f\pasted-text.txt`
