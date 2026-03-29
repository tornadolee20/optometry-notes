// Prompt injection protection for user-supplied text fields

// Patterns that indicate prompt injection attempts
const INJECTION_PATTERNS: RegExp[] = [
  /忽略(以上|上面|之前|前面)(所有|全部)?(的)?(指令|指示|規則|要求)/i,
  /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|rules?|prompts?)/i,
  /disregard\s+(all\s+)?(previous|above|prior)/i,
  /你(現在|從現在開始)是/i,
  /you\s+are\s+now/i,
  /act\s+as\s+(a|an|if)/i,
  /pretend\s+(to\s+be|you\s+are)/i,
  /system\s*:\s*/i,
  /\[INST\]/i,
  /\[\/INST\]/i,
  /<<SYS>>/i,
  /<\|im_start\|>/i,
  /role\s*:\s*(system|assistant|user)/i,
  /new\s+instruction/i,
  /override\s+(the\s+)?(system|prompt|instructions?)/i,
  /請(改為|變成|切換|扮演)/i,
  /不要(遵守|遵循|按照)(以上|上面|之前)/i,
  /forget\s+(everything|all|the\s+above)/i,
  /do\s+not\s+follow/i,
  /instead\s*,?\s*(generate|write|output|produce)/i,
];

// Maximum allowed length for a single custom feeling
const MAX_FEELING_LENGTH = 50;

// Maximum total custom feelings
const MAX_CUSTOM_FEELINGS = 10;

export interface SanitizeResult {
  sanitized: string[];
  removed: string[];
  warnings: string[];
}

/**
 * Sanitize custom feelings input to prevent prompt injection
 */
export function sanitizeCustomFeelings(feelings: string[]): SanitizeResult {
  const sanitized: string[] = [];
  const removed: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(feelings)) {
    return { sanitized: [], removed: [], warnings: ['Input is not an array'] };
  }

  // Limit total count
  const limited = feelings.slice(0, MAX_CUSTOM_FEELINGS);
  if (feelings.length > MAX_CUSTOM_FEELINGS) {
    warnings.push(`Truncated from ${feelings.length} to ${MAX_CUSTOM_FEELINGS} items`);
  }

  for (const feeling of limited) {
    if (typeof feeling !== 'string') {
      removed.push(String(feeling));
      continue;
    }

    const trimmed = feeling.trim();

    // Skip empty
    if (!trimmed) continue;

    // Length check
    if (trimmed.length > MAX_FEELING_LENGTH) {
      // Truncate instead of removing
      sanitized.push(trimmed.substring(0, MAX_FEELING_LENGTH));
      warnings.push(`Truncated feeling from ${trimmed.length} to ${MAX_FEELING_LENGTH} chars`);
      continue;
    }

    // Injection pattern check
    let isInjection = false;
    for (const pattern of INJECTION_PATTERNS) {
      if (pattern.test(trimmed)) {
        isInjection = true;
        removed.push(trimmed);
        warnings.push(`Removed suspicious input matching: ${pattern.source.substring(0, 30)}`);
        break;
      }
    }

    if (!isInjection) {
      sanitized.push(trimmed);
    }
  }

  return { sanitized, removed, warnings };
}

/**
 * Sanitize keywords input (lighter check since these come from predefined options mostly)
 */
export function sanitizeKeywords(keywords: string[]): string[] {
  if (!Array.isArray(keywords)) return [];

  return keywords
    .filter(k => typeof k === 'string' && k.trim().length > 0)
    .map(k => k.trim().substring(0, 20)) // Keywords should be short
    .slice(0, 20);
}
