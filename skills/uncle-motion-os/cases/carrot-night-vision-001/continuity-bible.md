# Continuity Bible — Case 001

CASE_ID: CARROT-NIGHT-VISION-001

## Locked IDs

### GER_BOMBER_01

Role:
Opening mystery + final callback.

Working identity:
Junkers Ju 88 family silhouette, WWII German bomber.

Rules:
- same aircraft identity opening / ending
- same major silhouette and proportions
- do not allow generative model to switch to Heinkel / Dornier / generic bomber
- final HUD is a modern comedic overlay, not historical instrumentation

### RAF_NIGHT_FIGHTER_01

Working identity:
Bristol Beaufighter night fighter, 1940–41 visual language.

Rules:
- twin-engine heavy fighter silhouette
- period-correct RAF markings where visible
- no modern antennas / missiles
- radar-specific external details must follow chosen historical reference, not invention

### PROP_CARROT_01

Role:
Hero reveal + wartime propaganda bridge + modern match cut + three-carrot joke.

Rules:
- visually recognizable medium carrot
- warm orange focal color
- match-cut carrot must preserve orientation and screen position
- three-carrot joke can use separate props PROP_CARROT_01/02/03 but consistent size family

### ENV_WWII_NIGHT_01

- low-light European night sky
- dark cloud mass
- minimal moon
- low saturation
- no modern city lighting
- restrained grain

### ENV_WARTIME_BRITAIN_01

- wartime home-front visual language
- paper / print / rationing context
- archival or archive-inspired, never fake archival presented as real

### ENV_TAIWAN_HOME_01

- modern Taiwan domestic dining environment
- natural warm light
- lived-in, non-studio
- carrot match-cut anchor preserved

### CHAR_UNCLE_01

Role:
Second-hook host and modern explanation.

Rules:
- use approved Uncle Glasses visual reference when available
- consistent glasses, hairstyle, age presentation, wardrobe within all modern host shots
- natural Taiwan presence, not medical-clinic staging

### HUD_NIGHTVISION_01

Role:
Comedy-only visual system.

Rules:
- military-green modern night-vision language
- no fake historical claim
- same HUD design for first comedy activation and final bomber callback
- target box / scan / beep consistent
- typography rendered in post, not generated inside source video

## Callback Lock

Opening object ID:
GER_BOMBER_01

Ending object ID:
GER_BOMBER_01

Hard requirement:
Must read as the same aircraft identity to make the callback feel intentional.
