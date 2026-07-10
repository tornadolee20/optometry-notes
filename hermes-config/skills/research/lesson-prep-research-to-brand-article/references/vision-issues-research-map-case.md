# Vision Issues Research Map Case — Master-View PubMed Scan

Session lesson from a 目鏡大叔 optometry research request: user asked to use major optometry/binocular-vision masters as lenses to identify the visual topics optometrists must enter, then scan recent research and expand item-by-item.

## Reusable pattern

Use this when the requested output is a broad professional agenda / research map, not one article.

1. Build the topic architecture first from expert lenses.
   - Example lenses: Hubel & Wiesel, Scheiman, Ciuffreda, Schor, Hess, Levi, Earl Smith, Zadnik, Cooper, Skeffington.
   - Convert lenses into agenda buckets: BV/VT, accommodation-vergence/prism, amblyopia/dichoptic, perceptual learning/VR, myopia control optics, atropine co-management, digital eye strain, pediatric vision/learning, concussion/TBI neuro-optometry, strabismus/stereopsis/suppression, presbyopia/BV quality, AI/teleoptometry.

2. Run PubMed in two passes.
   - Pass 1: broad 2021–2026 scan for each agenda bucket.
   - Pass 2: refined queries for noisy buckets (e.g. convergence insufficiency, accommodation/AC-A, prism, teleoptometry, AI pediatric eye screening, outdoor myopia, ortho-k safety).
   - Do not force noisy first-pass hits into conclusions. Label broad/noisy results and refine.

3. For each topic, synthesize the same schema:
   - Master-view / intellectual lineage.
   - Why optometrists must enter this issue.
   - Recent representative literature with PMID/DOI.
   - Optometrist entry points: screening, diagnosis, co-management, education, referral, SOP, AI/data structure.
   - Evidence level and interpretation caution.
   - Overclaiming firewall.

4. Archive as a durable Obsidian map, not only chat prose.
   - Suggested location: `04-知識卡片/YYYY-MM-DD-大師視角驗光師必切入視覺議題近五年研究掃描.md`.
   - Link back to relevant MOCs such as `雙眼視覺總覽` and the master-list note.

## Consent/blocker pitfall

If a batch research script/tool is blocked for lack of explicit user consent, immediately say that **no scan actually ran**, ask for the exact consent needed, and stop. Do not make the response look like work is underway. If the user expresses frustration (e.g. “怎都沒動”), treat that as permission to be more direct, but still be transparent about what ran and what did not.

## Example PubMed query buckets

- `"convergence insufficiency" AND (diagnosis OR treatment OR vision therapy OR vergence) AND (2021:2026[pdat])`
- `(accommodative insufficiency OR accommodative dysfunction OR accommodative facility) AND (children OR binocular vision) AND (2021:2026[pdat])`
- `(amblyopia) AND (dichoptic OR binocular treatment OR binocular therapy) AND (2021:2026[pdat])`
- `(amblyopia) AND (perceptual learning OR virtual reality OR video game OR videogame) AND (2021:2026[pdat])`
- `(myopia control) AND (peripheral defocus OR orthokeratology OR multifocal contact lens OR DIMS OR highly aspherical lenslets OR spectacle lens) AND (2021:2026[pdat])`
- `(myopia control) AND (atropine OR low dose atropine) AND (children) AND (2021:2026[pdat])`
- `(digital eye strain OR computer vision syndrome) AND (2021:2026[pdat])`
- `(concussion OR traumatic brain injury) AND (vergence OR accommodation OR eye movements OR oculomotor) AND (2021:2026[pdat])`
- `(teleoptometry OR tele-optometry OR remote refraction OR smartphone vision screening) AND (2021:2026[pdat])`
- `(artificial intelligence OR deep learning) AND (pediatric eye disease OR amblyopia OR strabismus OR vision screening) AND (2021:2026[pdat])`
