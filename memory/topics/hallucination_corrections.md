# Hallucination Self-Correction & Lessons Learned

## 2026-02-06
- **Lessons Learned**: When YouTube extraction fails, NEVER guess based on context. Use `curl` to fetch OEmbed data or search specifically for the video ID to verify titles.
- **Verified Video Database**:
  - `puXZBCb5nrE`: "Optometrist Vs Ophthalmologist" (Michele Lee, MD). Focuses on professional role differentiation.
  - `masJoPqT-6A`: "Unlock OpenClaw Multi-Agent Advanced Gameplay" (AI Superdomain). Focuses on OpenClaw/Antigravity tutorials.

## 2026-02-10
- **Lessons Learned**: When automated social media scraping (Facebook/LINE) fails due to technical errors (browser/webhook), DO NOT allow sub-agents to fabricate summaries. 
- **Strict Rule**: If content fetching fails, return "ERROR: DATA FETCH FAILED". No creative synthesis is allowed for factual reporting.
- **Verification Protocol**: Factual news reports must have a verified URL source before presentation to the user.

## 2026-02-11
- **Lessons Learned**: When a PDF has no text layer, `pdftotext` returns nothing. NEVER use local files with similar names as "hallucination filler". 
- **The PDF "Force-Read" Protocol**:
  1. Use `pdfimages -j` to extract raw image streams.
  2. Use `convert` to standardize image formats.
  3. Use `tesseract` with `chi_tra` (Traditional Chinese) for OCR.
- **Verification**: Content summary must be anchored to specific OCR-extracted text (e.g., "值日生：李錫彥") to ensure authenticity.
