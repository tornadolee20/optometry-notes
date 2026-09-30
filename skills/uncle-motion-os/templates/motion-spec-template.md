# Motion Spec Template

## Render Context

- Case ID:
- Canvas:
- FPS:
- Duration:
- Renderer target:
- Audio source:
- Brand asset source:

## Scene Spec

### S01

- start:
- end:
- purpose:
- background:
- foreground:
- typography:
- assets:
- entry state:
- exit state:

#### Motions

```yaml
- id:
  target:
  token:
  start:
  end:
  duration:
  easing:
  purpose:
  trigger:
  exit:
```

## Audio Timeline

| Audio ID | Start | End | Spoken / Sound | Pause | Emphasis | Visual Sync Cue |
|---|---:|---:|---|---|---|---|
| A01 | 0.00 |  |  |  |  |  |

## Transition Map

| From | To | Token | Start | Duration | Purpose |
|---|---|---|---:|---:|---|
| S01 | S02 | HARD_CUT |  | 0 |  |

## Asset Manifest

| Asset ID | Type | Source / Path | Scene | Required | Notes |
|---|---|---|---|---|---|
| AS01 | image |  | S01 | yes |  |

## Unresolved Assumptions

- ASSUMPTION-01:
- ASSUMPTION-02:

## Render Handoff Notes

- Do not reinterpret storyboard without documenting change.
- If implementation constraint forces deviation, record:
  - original spec
  - changed behavior
  - reason
  - expected visual impact
