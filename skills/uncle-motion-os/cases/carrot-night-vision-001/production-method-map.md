# Production Method Map — Case 001

CASE_ID: CARROT-NIGHT-VISION-001

## Method Strategy

This film is hybrid by design.

Do NOT force every shot through one AI video model.

| Beat | Preferred Method | Why |
|---|---|---|
| WWII atmospheric opening | IMAGE_TO_VIDEO + COMPOSITE | aircraft continuity matters more than text-to-video novelty |
| Historical aircraft / radar truth beats | ARCHIVAL + COMPOSITE where licensing permits | factual fidelity and visual authority |
| Carrot Hero Reveal | IMAGE_TO_VIDEO or controlled live-action macro | prop stability, precise composition |
| Wartime propaganda | ARCHIVAL / STATIC_DESIGN + camera motion | real materials are stronger than fake posters |
| Radar Reveal | ARCHIVAL + REMOTION / COMPOSITE | preserve historical texture while making information legible |
| Match cut WWII carrot -> modern Taiwan carrot | controlled stills / IMAGE_TO_VIDEO + edit | requires exact orientation and framing |
| Uncle Glasses host | REAL_HOST or approved identity-preserving generation | trust and continuity |
| Dark-room adaptation | REAL_HOST POV / IMAGE_TO_VIDEO | experiential realism |
| beta-carotene -> Vitamin A -> visual mechanism | REMOTION + designed assets | precise, editable, avoids medical-3D cliché |
| Three-carrot joke | REAL_HOST / controlled prop shoot | comic timing and object continuity |
| Night vision activation | COMPOSITE + REMOTION HUD | generated HUD text is unstable |
| Final bomber callback | reuse GER_BOMBER_01 plate + COMPOSITE HUD | strongest continuity and lowest generation risk |

## Generation Prompt Rule

Only `IMAGE_TO_VIDEO` and `TEXT_TO_VIDEO` shots receive generative-video prompts.

ARCHIVAL shots receive:
- source ID
- crop / motion instructions
- license / provenance note

REMOTION shots receive:
- composition spec
- asset list
- timing
- motion tokens

COMPOSITE shots receive:
- layer manifest
- blend / mask instructions
- tracking instructions
- post-production overlays

## Highest Risk Shots

1. WWII bomber in cloud with stable aircraft geometry
2. WWII carrot -> modern carrot match cut
3. host + carrot comedy timing
4. final same-bomber callback with HUD

These must be solved with continuity-first production, not one-shot generation.
