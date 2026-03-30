

## Plan: Limit Humanization Word Count Growth for 5-6 Keyword Reviews

### Problem
Humanization post-processing (`applyWordSlippage`, `shuffleSentenceRhythm`, `insertAbruptSentences`, `enforceFlexibleParagraphs`) can inflate 5-6 keyword reviews well past target ranges (e.g. 197→280+).

### Changes

**File 1: `supabase/functions/generate-review/humanization/index.ts`**

Modify `applyHumanizationPostProcessing` signature to accept optional `keywordCount`:

```ts
export function applyHumanizationPostProcessing(
  text: string, 
  humanizationResult: HumanizationResult,
  keywordCount?: number
): string
```

Before each word-count-increasing step (`applyWordSlippage`, `insertAbruptSentences`, `enforceFlexibleParagraphs`), check current char count against `getValidationWordCountRange(keywordCount).max`. If already at or above max, skip the step. If between min and max, only apply the step if the result doesn't exceed max (apply tentatively, revert if over).

`shuffleSentenceRhythm` does not add characters (only reorders), so it runs unconditionally.

Specific guard logic:
```ts
import { getValidationWordCountRange } from './word-count-flexibility.ts';

// Inside applyHumanizationPostProcessing:
const charCount = () => processedText.replace(/\s+/g, '').length;
const maxChars = keywordCount !== undefined 
  ? getValidationWordCountRange(keywordCount).max 
  : Infinity;

// 1. Word slippage — generally char-neutral, but guard anyway
if (charCount() < maxChars) {
  processedText = applyWordSlippage(processedText);
}

// 2. Shuffle — no char change, always run
processedText = shuffleSentenceRhythm(processedText);

// 3. Abrupt sentences — adds chars, tentative apply
if (charCount() < maxChars) {
  const candidate = insertAbruptSentences(processedText);
  if (candidate.replace(/\s+/g, '').length <= maxChars) {
    processedText = candidate;
  }
}

// 4. Flexible paragraphs — may add newlines only, but guard
if (isFeatureEnabled('flexible_word_count') && charCount() < maxChars) {
  const candidate = enforceFlexibleParagraphs(processedText);
  if (candidate.replace(/\s+/g, '').length <= maxChars) {
    processedText = candidate;
  }
}
```

**File 2: `supabase/functions/generate-review/review-processor.ts`**

Update the call site at line 196 to pass `effectiveKeywordCount`:
```ts
review = applyHumanizationPostProcessing(review, humanizationResult, effectiveKeywordCount);
```

**File 3: `supabase/functions/generate-review/review-validator.ts`**

Add early-exit for 5-6 keyword reviews that are already within an acceptable zone. After computing `wordCount` and `range`, before the expansion logic:

```ts
// For 5-6 keywords: if already >= base max but within validation tolerance, accept as-is
if (keywordCount && keywordCount >= 5) {
  const baseRange = getBaseWordCountRange(keywordCount);
  if (wordCount >= baseRange.max && wordCount <= range.max) {
    console.log(`5-6 keyword review at ${wordCount} chars, above base max ${baseRange.max} but within tolerance ${range.max}, accepting as-is`);
    return review;
  }
}
```

This requires importing `getBaseWordCountRange` alongside `getValidationWordCountRange`.

### Files Modified
| File | Change |
|------|--------|
| `humanization/index.ts` | Add `keywordCount` param, guard each post-processing step against max |
| `review-processor.ts` | Pass `effectiveKeywordCount` to `applyHumanizationPostProcessing` |
| `review-validator.ts` | Import `getBaseWordCountRange`, early-exit for 5-6 kw reviews near base max |

### What stays unchanged
- `word-count-flexibility.ts` — all range functions untouched
- `sentence-rhythm.ts`, `modules.ts` — internal logic untouched
- `generateHumanizationElements` — pre-processing element selection untouched

