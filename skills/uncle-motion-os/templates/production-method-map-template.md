# Production Method Map Template

Case ID:

## Allowed Methods

- ARCHIVAL
- IMAGE_TO_VIDEO
- TEXT_TO_VIDEO
- REAL_HOST
- REMOTION
- COMPOSITE
- STATIC_DESIGN
- SFX_ONLY

## Shot Map

| Shot | Method | Why this method | Source asset | Continuity ID | AI prompt required? | Post work |
|---|---|---|---|---|---|---|
| SH001 |  |  |  |  | yes / no |  |

## Selection Logic

Prefer the method with the highest combined score for:

1. continuity
2. factual fidelity
3. editability
4. generation stability
5. iteration speed

Do not choose AI video generation merely because it is available.

## Composite Rule

Use `COMPOSITE` when a shot requires multiple stable layers, e.g.:

- aircraft + HUD
- archival image + graphic overlay
- real host + generated environment
- radar screen + labels
- product footage + cursor / UI animation
