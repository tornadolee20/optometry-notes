# 2026-07-28 Dropbox Rescue Security Note

## Event

Reviewed the attached rescue audit for the old Dropbox optometry-notes workspace.

## Findings

- Legacy workspace exists under Dropbox and should not become the active Git workspace.
- The rescue branch is `rescue/laptop-local-20260728`.
- A nested repo remote URL contained a GitHub PAT-style credential.
- The local nested remote URL was reset to a credential-free GitHub URL.

## Remaining Risk

The exposed GitHub PAT still needs to be revoked in GitHub. Local URL cleanup does not invalidate the credential.

## Next

Keep the Dropbox rescue integration blocked until token revocation is confirmed.
