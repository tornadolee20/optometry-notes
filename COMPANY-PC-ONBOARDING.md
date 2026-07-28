# Company PC Onboarding

Status: draft
Primary source: personal-laptop

## Rule

The company computer should inherit state from the personal laptop. It should not create a parallel memory universe.

## Setup Location

Clone repositories into a normal local development folder, not inside:

- OneDrive
- Dropbox
- iCloud
- Google Drive
- Any company-managed automatic sync folder

Recommended pattern:

```powershell
C:\dev\optometry-notes
C:\dev\eye-family-watch
C:\dev\uncle-glasses-seo-geo
```

## First Startup

1. Install Git.
2. Sign in to GitHub with the correct account.
3. Clone this repository.
4. Run `scripts/sync-start.ps1`.
5. Open `SHARED-MEMORY-PROTOCOL.md`.
6. Open `devices/company-pc.template.md`.
7. Copy the template to `devices/company-pc.md` and fill only non-secret machine facts.

## Company PC Initial Mode

Until the first successful handoff test, the company PC should be:

- Read-only for memory files.
- Read-only for long-term decisions.
- Allowed to run diagnostics.
- Allowed to edit only when an active task assigns ownership to `company-pc`.

## Bring Back Work From Company PC

If work was already started on the company PC before this protocol:

1. Do not overwrite this repository.
2. Export or list changed files from the company PC.
3. Create a handoff under `handoffs/`.
4. Compare the work manually against the personal laptop version.
