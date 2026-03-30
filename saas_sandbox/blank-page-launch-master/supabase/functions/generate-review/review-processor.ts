import { CustomerType, RequestBody, ResponseData } from './types.ts';
import { findMissingKeywords } from './utils/keyword-checker.ts';
import {
  getCurrentSeason,
  detectUserRole,
  getRandomOpening,
  getRandomCustomerType,
  cleanReviewText,
  countChineseWords,
  enforceProperNounLimits,
  getRandomTone,
  getRandomSentencePattern,
  enforceParagraphLayout
} from './utils/index.ts';
import { pickToneIntensity, toneToInterjectionMood } from './utils/tone-structure.ts';
import { generateWithFallback } from './generators/ai-fallback.ts';
import { adjustParagraphRhythm } from './utils/sentence-diversifier.ts';
import { createSystemPrompt } from './prompt-builder.ts';
import { validateAndFixWordCount } from './review-validator.ts';
import { 
  generateHumanizationElements, 
  applyHumanizationPostProcessing, 
  validateHumanizedReview 
} from './humanization/index.ts';
import { sanitizeCustomFeelings, sanitizeKeywords } from './utils/input-sanitizer.ts';
import { checkContentSafety, removeUnsafeContent } from './utils/content-safety.ts';
import { getValidationWordCountRange } from './humanization/word-count-flexibility.ts';
import { stripPositiveFromNegativeReview } from './utils/negative-post-processor.ts';

// Anti-repetition memory (module-level, best-effort in Deno Deploy)
let recentOpeningTypes: string[] = [];
const MAX_RECENT_TYPES = 5;
let recentToneKeys: string[] = [];
let recentStructureKeys: string[] = [];
const MAX_RECENT_TONES = 5;
const MAX_RECENT_STRUCTURES = 5;

export async function processReviewRequest(requestData: RequestBody): Promise<ResponseData> {
  const { storeName, address, area: providedArea, keywords: rawKeywords = [], customFeelings: rawCustomFeelings = [], description, reviewStyle, enforceNegativeWhenNeeded, industry, keywordCount: requestKeywordCount, persona } = requestData;

  // === Step 0: Input sanitization ===
  const sanitizedKeywords = sanitizeKeywords(rawKeywords);
  const sanitizeResult = sanitizeCustomFeelings(rawCustomFeelings);
  const keywords = sanitizedKeywords;
  const customFeelings = sanitizeResult.sanitized;

  if (sanitizeResult.warnings.length > 0) {
    console.log('Input sanitization warnings:', sanitizeResult.warnings);
  }
  if (sanitizeResult.removed.length > 0) {
    console.log('Removed suspicious inputs:', sanitizeResult.removed.length);
  }

  // Generate humanization elements
  const humanizationResult = generateHumanizationElements({
    industry: industry || 'general',
    storeName,
    area: providedArea || '',
    keywords: keywords,
    customFeelings: customFeelings
  });

  const effectiveKeywords = [...keywords, ...customFeelings];

  if (!storeName || effectiveKeywords.length === 0) {
    throw new Error('Missing required params');
  }

  const currentSeason = getCurrentSeason();
  
  let area = providedArea;
  if (!area || area.trim() === '') {
    area = address?.match(/[^\s]*?(市區|區|鎮|鄉)/)?.[0]?.replace(/(市區|區|鎮|鄉)$/, '') || '本地區';
  }
  
  const isDev = Deno.env.get('ENVIRONMENT') === 'development';
  console.log('Review request:', { keywordCount: effectiveKeywords.length, area, industry });

  const userRole = detectUserRole(effectiveKeywords);

  // Opening with anti-repetition
  let openingResult;
  let attempts = 0;
  do {
    openingResult = getRandomOpening(area, currentSeason, userRole);
    attempts++;
  } while (recentOpeningTypes.includes(openingResult.type) && attempts < 10);
  
  recentOpeningTypes.push(openingResult.type);
  if (recentOpeningTypes.length > MAX_RECENT_TYPES) recentOpeningTypes.shift();
  
  const { type: openingType, opening } = openingResult;
  const customerType = await getRandomCustomerType();

  // Tone with anti-repetition
  let toneOption = getRandomTone(recentToneKeys);
  let attemptsTone = 0;
  while (recentToneKeys.includes(toneOption.key) && attemptsTone < 10) {
    toneOption = getRandomTone(recentToneKeys);
    attemptsTone++;
  }
  recentToneKeys.push(toneOption.key);
  if (recentToneKeys.length > MAX_RECENT_TONES) recentToneKeys.shift();

  // Derive tone intensity and interjection mood from selected tone
  const toneIntensity = pickToneIntensity(toneOption);
  const interjectionMood = toneToInterjectionMood(toneOption.key);

  // Override interjections with mood-matched ones for coherent voice
  if (humanizationResult.isHumanized && humanizationResult.interjections) {
    const { selectInterjections: selectMoodInterjections } = await import('./humanization/modules.ts');
    humanizationResult.interjections = selectMoodInterjections(2, interjectionMood);
  }

  // Sentence pattern with anti-repetition
  let structureOption = getRandomSentencePattern(recentStructureKeys);
  let attemptsStruct = 0;
  while (recentStructureKeys.includes(structureOption.key) && attemptsStruct < 10) {
    structureOption = getRandomSentencePattern(recentStructureKeys);
    attemptsStruct++;
  }
  recentStructureKeys.push(structureOption.key);
  if (recentStructureKeys.length > MAX_RECENT_STRUCTURES) recentStructureKeys.shift();

  // Special writing style (2% each)
  const randomNum = Math.random() * 100;
  let selectedStyle = "";
  if (randomNum <= 2) selectedStyle = "周星馳";
  else if (randomNum <= 4) selectedStyle = "吳念真";
  else if (randomNum <= 6) selectedStyle = "蔡康永";

  const effectiveKeywordCount = requestKeywordCount ?? effectiveKeywords.length;

  // Determine enforced style based on negative sentiment
  // enforceNegativeWhenNeeded alone is sufficient — don't require reviewStyle.style === 'negative'
  // because the sentiment analyzer may fail to detect colloquial negative expressions
  const enforcedNegative = !!enforceNegativeWhenNeeded;
  const enforcedStyleValue = enforcedNegative ? 'negative' as const : undefined;

  const systemPrompt = createSystemPrompt(
    storeName, area, effectiveKeywords, description,
    humanizationResult.opening || opening,
    selectedStyle, customerType,
    enforcedStyleValue, toneOption.label, structureOption.label,
    enforcedNegative ? 2 : undefined, customFeelings, industry,
    humanizationResult.microEvent, enforcedNegative ? null : humanizationResult.painPoint,
    humanizationResult.interjections, humanizationResult.perspective,
    humanizationResult.isHumanized, effectiveKeywordCount,
    toneOption.promptHint, toneIntensity,
    persona
  );

  // === Step 1: AI Generation ===
  let review = "";
  let originalWordCount = 0;
  let aiProvider = "";
  let aiFallbackUsed = false;
  let aiFallbackReason: string | undefined;
  
  try {
    const { getSoftWordCountRange } = await import('./humanization/word-count-flexibility.ts');
    const wordCountHintForAI = `字數${getSoftWordCountRange(effectiveKeywordCount).hint}`;
    const aiResult = await generateWithFallback(systemPrompt, selectedStyle, customerType, wordCountHintForAI);
    review = aiResult.review;
    aiProvider = aiResult.provider;
    aiFallbackUsed = aiResult.fallbackUsed;
    aiFallbackReason = aiResult.fallbackReason;
    
    console.log(`AI provider: ${aiResult.provider}${aiResult.fallbackUsed ? ' (fallback)' : ''}`);
    
    // Basic paragraph formatting
    if (!review.includes('\n\n') && review.length > 100) {
      review = review.replace(/([。！？!?])\s*/g, '$1\n\n').replace(/\n{3,}/g, '\n\n').trim();
    }
    
    originalWordCount = review.replace(/\s+/g, '').length;
    
    // Log keyword coverage (dev only)
    if (isDev) {
      const missingKeywords = findMissingKeywords(effectiveKeywords, review);
      if (missingKeywords.length > 0) {
        console.log('Missing keywords:', missingKeywords);
      }
    }

  } catch (apiError) {
    console.error('API error:', apiError);
    throw new Error('Review generation failed');
  }

  // === Step 2: Post-processing pipeline ===
  // 2a. Sentence rhythm diversification
  review = adjustParagraphRhythm(review);

  // 2b. Humanization post-processing (skip for negative reviews to avoid positive insertions)
  if (humanizationResult.isHumanized && !enforcedNegative) {
    review = applyHumanizationPostProcessing(review, humanizationResult, effectiveKeywordCount);
  }

  // 2c. Proper noun limits
  review = enforceProperNounLimits(review, area, storeName);

  // 2d. Clean + language linter (industry-aware, with char budget)
  // Skip positive linting for negative reviews
  const valRange = getValidationWordCountRange(effectiveKeywordCount);
  let cleanReview = cleanReviewText(review, industry, valRange.max, enforcedNegative);

  // 2e. Negative review post-processing: strip positive sentences
  if (enforcedNegative) {
    cleanReview = stripPositiveFromNegativeReview(cleanReview);
  }

  // 2f. Content safety check
  const safetyCheck = checkContentSafety(cleanReview);
  if (!safetyCheck.isSafe) {
    console.warn('Content safety violations detected:', safetyCheck.violations);
    cleanReview = removeUnsafeContent(cleanReview);
  }

  // === Step 3: Final word count validation (AFTER all post-processing) ===
  const finalWordCount = cleanReview.replace(/\s+/g, '').length;

  if (finalWordCount < valRange.min || finalWordCount > valRange.max) {
    console.log(`Final word count check: ${finalWordCount}, target: ${valRange.min}-${valRange.max}, adjusting...`);
    cleanReview = await validateAndFixWordCount(
      cleanReview, systemPrompt, selectedStyle, customerType,
      area, storeName, effectiveKeywords, effectiveKeywordCount
    );
  }

  // Log context detection (debug)
  try {
    const { detectReviewContext } = await import('./utils/context-detector.ts');
    const reviewContext = detectReviewContext(cleanReview);
    console.log('Review context:', {
      visitType: reviewContext.visit.type,
      visitConfidence: reviewContext.visit.confidence
    });
  } catch (_e) { /* non-critical */ }
  
  const updatedWordCount = cleanReview.replace(/\s+/g, '').length;
  console.log(`Final review: ${updatedWordCount} chars`);

  return {
    review: cleanReview,
    style: selectedStyle || '標準',
    season: currentSeason,
    openingType,
    customerType: customerType.name,
    userRole,
    wordCount: updatedWordCount,
    originalWordCount,
    reviewStyleType: humanizationResult.isHumanized ? 'humanized' : 'standard',
    tone: toneOption.label,
    starRating: undefined,
    provider: aiProvider,
    fallbackUsed: aiFallbackUsed,
    fallbackReason: aiFallbackReason
  };
}
