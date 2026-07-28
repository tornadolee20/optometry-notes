# Handoff: Dropbox Rescue Audit

Date: 2026-07-28
From owner: company-pc / prior run
To owner: personal-laptop
From device: company-pc or Dropbox legacy workspace
To device: personal-laptop

## Task

Review and safely integrate useful work from the legacy Dropbox workspace:

`C:\Users\torna_3j3fz9h\Dropbox\PC (2)\Desktop\uncleglasses\optometry-notes`

## Current State

The legacy workspace exists and is on branch:

`rescue/laptop-local-20260728`

Read-only status confirmed many local changes and untracked files, matching the attached audit's 47-item rescue set.

The current primary workspace is:

`C:\Users\torna_3j3fz9h\Desktop\optometry-notes`

Current primary branch:

`shared-memory-baseline`

## Why This Matters

The Dropbox workspace appears to contain useful historical content, skills, memory files, Obsidian notes, content drafts, and SaaS sandbox artifacts. It also contains unsafe or noisy items that should not be merged blindly.

## Security Blocker

The nested repo:

`saas_sandbox/blank-page-launch-lovable`

had a Git remote URL containing a GitHub PAT-style credential. The local remote URL was changed to the credential-free form:

`https://github.com/tornadolee1720/blank-page-launch.git`

This local cleanup does not revoke the leaked token. The token must be revoked in GitHub before any rescue integration work is considered safe.

## Suggested Classification

Likely useful:

- `.claude/skills/` additions for bazi, iching, qimen-dunjia, ziwei-doushu, and ak-threads-booster.
- `content-planning/threads-drafts/` historical drafts.
- `memory/` historical daily logs.
- `obsidian-vault/04-*` knowledge cards.
- `obsidian-vault/10-*` historical article files.
- `saas_sandbox/pse-v6.html`.

Needs manual review:

- `Inbox/*`
- `memory/2026-07-19.md`
- `content-planning/threads-drafts/2026-07-19.md`
- Obsidian UI state files under `.obsidian/`.
- `skills/paper-researcher/fetch_log.txt`.

Do not integrate yet:

- Duplicate conflict folders with names like `(... conflict copy ...)`.
- `UNCLE_GLASSES_PROFILE (... conflict copy ...).md`.
- Unnamed `.canvas` or `.base` files until their purpose is known.
- Nested repo gitlink changes under `saas_sandbox/blank-page-launch-lovable`.

## Expected Output

Create small reviewed commits from the legacy rescue branch only after the PAT has been revoked and each group has been inspected.

Suggested commit groups:

- Add approved local skills.
- Add historical Threads drafts.
- Add historical daily memory logs.
- Add reviewed Obsidian knowledge cards.
- Add reviewed historical article files.
- Add reviewed inbox paper-researcher findings.

## Blockers

- GitHub PAT must be revoked.
- Legacy workspace is inside Dropbox, so it must not become the active Git working repo.
- Nested repo state must be handled separately from this primary memory repo.
- Conflict-copy files need manual review.

## Links And Paths

- Attached audit source: `C:\Users\torna_3j3fz9h\.codex\attachments\d25e1465-6c05-4d6d-a97f-b141c389dc9f\pasted-text.txt`
- Legacy rescue workspace: `C:\Users\torna_3j3fz9h\Dropbox\PC (2)\Desktop\uncleglasses\optometry-notes`
- Primary workspace: `C:\Users\torna_3j3fz9h\Desktop\optometry-notes`
