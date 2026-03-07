// Main humanization orchestrator

import { isFeatureEnabled } from './feature-flags.ts';
import { 
  selectMicroEvent, 
  selectInterjections, 
  selectPainPoint, 
  selectPerspective,
  applyWordSlippage 
} from './modules.ts';
import { selectWeightedOpening } from './weighted-openings.ts';
import { 
  shuffleSentenceRhythm, 
  insertAbruptSentences, 
  generateEmotionalCurve,
  enforceFlexibleParagraphs 
} from './sentence-rhythm.ts';
import { isWithinFlexibleRange } from './word-count-flexibility.ts';

export interface HumanizationConfig {
  industry: string;
  storeName: string;
  area: string;
  keywords: string[];
  customFeelings: string[];
}

export interface HumanizationResult {
  microEvent?: string | null;
  painPoint?: { pain: string; resolution: string } | null;
  interjections?: string[];
  perspective?: string;
  opening?: string;
  isHumanized: boolean;
}

// Generate humanization elements
export function generateHumanizationElements(config: HumanizationConfig): HumanizationResult {
  if (!isFeatureEnabled('humanize_reviews_enabled')) {
    return { isHumanized: false };
  }

  const result: HumanizationResult = { isHumanized: true };

  // 1. Micro events
  if (isFeatureEnabled('micro_events')) {
    result.microEvent = selectMicroEvent(config.industry);
  }

  // 2. Pain points
  if (isFeatureEnabled('industry_pain_points')) {
    result.painPoint = selectPainPoint(config.industry);
  }

  // 3. Natural interjections
  if (isFeatureEnabled('natural_interjections')) {
    result.interjections = selectInterjections(2);
  }

  // 4. Multi-perspective
  if (isFeatureEnabled('multi_perspective')) {
    const perspective = selectPerspective(config.industry);
    result.perspective = `${perspective.type} - ${perspective.characteristics.join(', ')}`;
  }

  // 5. Weighted openings
  if (isFeatureEnabled('weighted_openings')) {
    const weightedOpening = selectWeightedOpening();
    result.opening = weightedOpening.opening.replace('{storeName}', config.storeName);
  }

  return result;
}

// Post-process generated review with humanization
export function applyHumanizationPostProcessing(
  text: string, 
  humanizationResult: HumanizationResult
): string {
  if (!humanizationResult.isHumanized) {
    return text;
  }

  let processedText = text;

  // 1. Apply word slippage for natural imperfection
  processedText = applyWordSlippage(processedText);

  // 2. Shuffle sentence rhythm
  processedText = shuffleSentenceRhythm(processedText);

  // 3. Insert abrupt sentences occasionally
  processedText = insertAbruptSentences(processedText);

  // 4. Enforce flexible paragraph structure
  if (isFeatureEnabled('flexible_word_count')) {
    processedText = enforceFlexibleParagraphs(processedText);
  }

  return processedText;
}

// Validate humanized review
export function validateHumanizedReview(
  text: string, 
  keywords: string[], 
  isHumanized: boolean
): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Word count validation with flexibility
  const wordCount = text.replace(/\s+/g, '').length;
  if (!isWithinFlexibleRange(wordCount, isHumanized)) {
    const range = isHumanized ? '190-240' : '201-230';
    issues.push(`Word count ${wordCount} outside ${range} range`);
  }

  // Keyword validation - allow 80% coverage for humanized reviews
  const requiredCoverage = isHumanized ? 0.8 : 1.0;
  const foundKeywords = keywords.filter(keyword => 
    text.includes(keyword) || 
    // Allow some synonym flexibility for humanized reviews
    (isHumanized && checkSynonymMatch(text, keyword))
  );
  
  const coverage = foundKeywords.length / keywords.length;
  if (coverage < requiredCoverage) {
    const requiredPercentage = Math.round(requiredCoverage * 100);
    issues.push(`Keyword coverage ${Math.round(coverage * 100)}% below required ${requiredPercentage}%`);
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

// Simple synonym checking for humanized mode
function checkSynonymMatch(text: string, keyword: string): boolean {
  const synonymMap: Record<string, string[]> = {
    '舒適': ['舒服', '放鬆', '自在'],
    '專業': ['厲害', '很會', '有經驗'],
    '環境': ['地方', '空間', '店裡'],
    '服務': ['態度', '服務態度', '待客'],
    '推薦': ['值得', '不錯', '可以試試'],
    '價格': ['價錢', '收費', '費用'],
  };

  const synonyms = synonymMap[keyword];
  if (!synonyms) return false;

  return synonyms.some(synonym => text.includes(synonym));
}

// Export all for easy access
export {
  isFeatureEnabled,
  selectMicroEvent,
  selectInterjections,
  selectPainPoint,
  selectPerspective,
  selectWeightedOpening,
  shuffleSentenceRhythm,
  insertAbruptSentences,
  generateEmotionalCurve,
  enforceFlexibleParagraphs,
  isWithinFlexibleRange,
  applyWordSlippage
};