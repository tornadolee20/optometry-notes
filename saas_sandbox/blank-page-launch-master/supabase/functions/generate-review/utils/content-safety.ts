// Post-generation content safety filter

// Patterns that should never appear in a review
const UNSAFE_PATTERNS: Array<{ pattern: RegExp; category: string }> = [
  // Hate speech / discrimination
  { pattern: /死(全家|光光|去吧)/g, category: 'hate' },
  { pattern: /(智障|白癡|廢物|垃圾人)/g, category: 'insult' },
  
  // Personal information leakage
  { pattern: /\b\d{10}\b/g, category: 'phone_number' },
  { pattern: /\b[A-Z]\d{9}\b/g, category: 'tw_id' },
  { pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, category: 'email' },
  
  // Threats / violence
  { pattern: /(要你好看|等著瞧|報警|告你|法院見)/g, category: 'threat' },
  
  // Fake engagement signals
  { pattern: /(刷評|買評|假評|給我好評|五星好評換)/g, category: 'fake_engagement' },
  { pattern: /(免費.*換.*評|評論.*折扣|寫評.*送)/g, category: 'incentivized' },
  
  // AI self-reference (might trigger Google detection)
  { pattern: /(我是AI|人工智慧生成|ChatGPT|GPT-4|語言模型)/g, category: 'ai_reference' },
  { pattern: /(作為一個AI|身為AI助手)/g, category: 'ai_reference' },
];

export interface SafetyCheckResult {
  isSafe: boolean;
  violations: Array<{ category: string; match: string }>;
}

/**
 * Check generated review content for safety violations
 */
export function checkContentSafety(text: string): SafetyCheckResult {
  const violations: Array<{ category: string; match: string }> = [];

  for (const { pattern, category } of UNSAFE_PATTERNS) {
    // Reset regex state
    pattern.lastIndex = 0;
    const matches = text.match(pattern);
    if (matches) {
      for (const match of matches) {
        violations.push({ category, match });
      }
    }
  }

  return {
    isSafe: violations.length === 0,
    violations
  };
}

/**
 * Remove unsafe content from review, replacing with neutral alternatives
 */
export function removeUnsafeContent(text: string): string {
  let result = text;

  for (const { pattern } of UNSAFE_PATTERNS) {
    pattern.lastIndex = 0;
    result = result.replace(pattern, '');
  }

  // Clean up resulting double spaces or punctuation
  result = result
    .replace(/\s{2,}/g, ' ')
    .replace(/([。！？])\s*([。！？])/g, '$1')
    .trim();

  return result;
}
