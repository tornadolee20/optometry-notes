import { detectReviewContext } from './context-detector.ts';
import { getIndustryTemplate, type IndustryLintTemplate } from './industry-lint-templates.ts';

// Language linting and correction module - industry-aware version
export interface LintRule {
  pattern: RegExp;
  fix: (match: string, ...groups: string[]) => string;
  priority: number;
  isConcreteAction?: boolean;
  name?: string;
}

// Build industry-specific concrete actions mapping
function getConcreteActions(template: IndustryLintTemplate): Record<string, string[]> {
  return {
    'kind': template.concreteActions['kind'] || [],
    'professional': template.concreteActions['professional'] || [],
    'careful': template.concreteActions['careful'] || [],
    'patient': template.concreteActions['patient'] || [],
    'comfortable': template.concreteActions['comfortable'] || [],
  };
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Cross-review global action memory (module-level, best-effort in Deno Deploy) ──
// Tracks how many times each concreteAction phrase has been used across reviews
// within the same Edge Function execution lifetime.
const globalActionUsageCount = new Map<string, number>();
const MAX_GLOBAL_USES = 2;          // after 2 uses, a phrase is deprioritized
const DEPRIORITIZED_CHANCE = 0.15;  // 15 % chance to still pick a heavily-used phrase

/**
 * Pick a random phrase from arr that is NOT similar to any already-used phrase
 * AND respects the global cross-review usage limit.
 * Similarity = first 6 chars match or one contains the other.
 */
function pickUnusedPhrase(arr: string[], usedPhrases: Set<string>): string | null {
  if (!arr || arr.length === 0) return null;

  // Step 1: filter out same-review duplicates
  const localCandidates = arr.filter(phrase => {
    for (const used of usedPhrases) {
      if (phrase === used) return false;
      if (phrase.slice(0, 6) === used.slice(0, 6)) return false;
      if (phrase.includes(used) || used.includes(phrase)) return false;
    }
    return true;
  });

  if (localCandidates.length === 0) return null;

  // Step 2: separate into fresh vs overused based on global memory
  const fresh: string[] = [];
  const overused: string[] = [];
  for (const phrase of localCandidates) {
    const count = globalActionUsageCount.get(phrase) || 0;
    if (count < MAX_GLOBAL_USES) {
      fresh.push(phrase);
    } else {
      overused.push(phrase);
    }
  }

  let chosen: string;
  if (fresh.length > 0) {
    chosen = pickRandom(fresh);
  } else if (overused.length > 0 && Math.random() < DEPRIORITIZED_CHANCE) {
    // All candidates are overused, but allow with low probability
    chosen = pickRandom(overused);
  } else {
    return null; // suppress this insertion entirely
  }

  // Record in global memory
  globalActionUsageCount.set(chosen, (globalActionUsageCount.get(chosen) || 0) + 1);
  return chosen;
}

// Noun-phrase suffixes that indicate we should NOT insert a concreteAction here
const NOUN_SUFFIXES = ['的店家', '的眼鏡行', '的地方', '的店', '的診所', '的餐廳', '的老闆', '的師傅', '的醫師'];

// Words that commonly follow adjectives to form compound terms (e.g. 專業驗光, 親切服務)
const COMPOUND_FOLLOWERS = ['驗光', '服務', '態度', '技術', '品質', '水準', '程度', '能力', '團隊', '人員', '師傅', '老師', '醫師', '技師'];

/**
 * Check if the matched position sits right before a noun phrase or compound word,
 * which would make insertion awkward (e.g. "專業，會邊驗邊解釋驗光").
 */
function isUnsafeInsertPosition(fullText: string, matchEnd: number): boolean {
  const after = fullText.slice(matchEnd, matchEnd + 10);
  // Check for 的 + noun pattern
  if (NOUN_SUFFIXES.some(suffix => after.startsWith(suffix)) || after.startsWith('的')) return true;
  // Check for compound words (專業驗光, 親切服務, etc.)
  if (COMPOUND_FOLLOWERS.some(word => after.startsWith(word))) return true;
  // Check if immediately followed by another Chinese character (no punctuation/space break)
  // This catches cases like "專業又" or "親切地"
  const firstChar = after.charAt(0);
  if (firstChar && /[\u4e00-\u9fff]/.test(firstChar) && !['，', '。', '！', '？', '、', '\n', ' '].includes(firstChar)) {
    // Allow only if it's a natural continuation particle
    const safeFollowers = ['，', '。', '！', '？', '的', '地', '得'];
    if (!safeFollowers.includes(firstChar)) return true;
  }
  return false;
}

// Build lint rules dynamically based on industry
function buildLintRules(template: IndustryLintTemplate): LintRule[] {
  const actions = getConcreteActions(template);

  return [
    {
      name: 'naturalize_professional',
      pattern: /(服務很專業)/g,
      fix: () => '老實說，比我想的還仔細',
      priority: 1,
      isConcreteAction: false
    },
    {
      name: 'concretize_kind',
      pattern: /(很|非常)?(親切|貼心)/g,
      fix: (match: string) => match, // placeholder, real logic in applyRulesWithLimits
      priority: 1,
      isConcreteAction: true,
      _actionKey: 'kind'
    },
    {
      name: 'concretize_professional',
      pattern: /(很|非常)?(專業|厲害)/g,
      fix: (match: string) => match,
      priority: 1,
      isConcreteAction: true,
      _actionKey: 'professional'
    },
    {
      name: 'sensory_environment',
      pattern: /環境(很)?(舒適|不錯|好)/g,
      fix: (match: string) => `${match}，${pickRandom(template.sensoryWords['environment'] || template.sensoryWords['comfort'] || ['整體感覺不錯'])}`,
      priority: 2,
      isConcreteAction: false
    },
    {
      name: 'concretize_no_pressure',
      pattern: /沒有推銷壓力/g,
      fix: (match: string) => match,
      priority: 1,
      isConcreteAction: true,
      _actionKey: 'patient'
    },
    {
      name: 'concretize_careful',
      pattern: /(很|非常)?(仔細|細心)/g,
      fix: (match: string) => match,
      priority: 1,
      isConcreteAction: true,
      _actionKey: 'careful'
    },
    {
      name: 'concretize_service_quality',
      pattern: /服務品質(很好|佳|不錯)/g,
      fix: () => pickRandom(template.serviceSubjectReplacements),
      priority: 2,
      isConcreteAction: false
    },
    {
      name: 'fix_unnatural_professional',
      pattern: /很有專業(?![度])/g,
      fix: () => '很有專業度',
      priority: 1,
      isConcreteAction: false
    },
    {
      name: 'fix_repeated_let_me',
      pattern: /(讓我[^。！？]*[。！？])\s*(讓我)/g,
      fix: (_match: string, firstSentence: string) => firstSentence + ' 也因此我',
      priority: 2,
      isConcreteAction: false
    },
    {
      name: 'fix_service_highlight',
      pattern: /服務畫重點給我看/g,
      fix: () => pickRandom(template.serviceSubjectReplacements),
      priority: 1,
      isConcreteAction: false
    },
    {
      name: 'fix_pushed_selection',
      pattern: /幫我選擇了最適合/g,
      fix: () => '最後一起挑到合適的',
      priority: 1,
      isConcreteAction: false
    },
    {
      name: 'fix_incomplete_sentence',
      pattern: /特別是鏡框的可以試試/g,
      fix: () => '可以親自試試看',
      priority: 1,
      isConcreteAction: false
    },
    {
      name: 'fix_highlight_expression',
      pattern: /畫重點給我看/g,
      fix: () => '邊講邊說明重點',
      priority: 1,
      isConcreteAction: false
    },
    {
      name: 'fix_selection_expression',
      pattern: /選擇了.*最適合/g,
      fix: () => '一起挑到合適的',
      priority: 1,
      isConcreteAction: false
    }
  ] as (LintRule & { _actionKey?: string })[];
}

/**
 * Apply lint rules with concreteAction limits:
 * - Max 2 concreteAction insertions per review
 * - No duplicate/similar phrases
 * - Skip if match is before a noun phrase (的店家, 的眼鏡行, etc.)
 * - Skip if the sentence already has a concreteAction
 */
function applyRulesWithLimits(
  text: string,
  template: IndustryLintTemplate,
  usedPhrases: Set<string>
): string {
  const actions = getConcreteActions(template);
  const rules = buildLintRules(template) as (LintRule & { _actionKey?: string })[];
  const sortedRules = rules.sort((a, b) => (b.priority || 0) - (a.priority || 0));

  let result = text;
  let concreteActionCount = 0;
  const MAX_CONCRETE_ACTIONS = 2;

  // Track which sentence indices already got a concreteAction
  const sentencesWithAction = new Set<number>();

  for (const rule of sortedRules) {
    if (!rule.isConcreteAction) {
      // Non-concreteAction rules: apply normally
      result = result.replace(rule.pattern, rule.fix);
      continue;
    }

    // ConcreteAction rule: apply with limits
    if (concreteActionCount >= MAX_CONCRETE_ACTIONS) continue;

    const actionKey = rule._actionKey || 'kind';
    const actionPool = actions[actionKey] || [];
    if (actionPool.length === 0) continue;

    // Use replaceAll-like logic but with control
    const newResult: string[] = [];
    let lastIndex = 0;
    const regex = new RegExp(rule.pattern.source, 'g');
    let m: RegExpExecArray | null;

    while ((m = regex.exec(result)) !== null) {
      if (concreteActionCount >= MAX_CONCRETE_ACTIONS) {
        // Over limit, keep original
        break;
      }

      const matchStart = m.index;
      const matchEnd = matchStart + m[0].length;

      // Check: is this before a noun phrase or compound word?
      if (isUnsafeInsertPosition(result, matchEnd)) {
        continue; // skip, keep original
      }

      // Check: which sentence is this in?
      const textBefore = result.slice(0, matchStart);
      const sentenceIndex = (textBefore.match(/[。！？]/g) || []).length;

      if (sentencesWithAction.has(sentenceIndex)) {
        continue; // this sentence already has an action, skip
      }

      // Pick an unused phrase
      const phrase = pickUnusedPhrase(actionPool, usedPhrases);
      if (!phrase) continue; // all used up, skip

      // Build replacement: original match + ，+ phrase
      const replacement = `${m[0]}，${phrase}`;

      newResult.push(result.slice(lastIndex, matchStart));
      newResult.push(replacement);
      lastIndex = matchEnd;

      usedPhrases.add(phrase);
      concreteActionCount++;
      sentencesWithAction.add(sentenceIndex);
    }

    if (newResult.length > 0) {
      newResult.push(result.slice(lastIndex));
      result = newResult.join('');
    }
  }

  return result;
}

// Insert micro episode from industry-specific templates
export function insertMicroEpisode(text: string, industry?: string, usedPhrases?: Set<string>): string {
  const template = getIndustryTemplate(industry);
  const episodes = template.microEpisodes;

  const hasEpisode = episodes.some(ep =>
    text.includes(ep.problem) || text.includes(ep.solution)
  );

  if (hasEpisode || text.length < 80) return text;

  const sentences = text.split(/([。！？])/).filter(Boolean);
  if (sentences.length < 4) return text;

  const insertPos = Math.floor(sentences.length * 0.5);
  if (insertPos < sentences.length && /[。！？]/.test(sentences[insertPos])) {
    // Pick an episode not similar to already-used phrases
    let episode = pickRandom(episodes);
    if (usedPhrases) {
      const unusedEpisodes = episodes.filter(ep => {
        const key = ep.problem.slice(0, 6);
        for (const used of usedPhrases) {
          if (used.slice(0, 6) === key) return false;
        }
        return true;
      });
      if (unusedEpisodes.length > 0) {
        episode = pickRandom(unusedEpisodes);
      }
    }

    const episodeText = `${episode.problem}，${episode.solution}`;
    sentences[insertPos] = sentences[insertPos] + ' ' + episodeText + '。';

    if (usedPhrases) {
      usedPhrases.add(episode.problem);
      usedPhrases.add(episode.solution);
    }
  }

  return sentences.join('');
}

// Discourse markers insertion
export function insertDiscourseMarkers(text: string): string {
  const markers = ['其實', '老實說', '還好', '沒想到', '結果', '欸'];

  const existingCount = markers.filter(marker => text.includes(marker)).length;
  if (existingCount >= 2) return text;

  const sentences = text.split(/([。！？])/).filter(Boolean);
  if (sentences.length < 4) return text;

  const middlePos = Math.floor(sentences.length * 0.4);

  if (middlePos < sentences.length && /[。！？]/.test(sentences[middlePos])) {
    const marker = pickRandom(markers);
    if (sentences[middlePos - 1] && !sentences[middlePos - 1].includes(marker)) {
      const naturalInsert = `${marker}，${sentences[middlePos - 1].replace(/[。！？]$/, '')}`;
      sentences[middlePos - 1] = naturalInsert;
    }
  }

  return sentences.join('');
}

// Ending optimization using industry templates
export function optimizeEnding(text: string, industry?: string, usedPhrases?: Set<string>): string {
  const template = getIndustryTemplate(industry);
  const sentences = text.split(/([。！？])/).filter(Boolean);
  if (sentences.length < 2) return text;

  const lastSentence = sentences[sentences.length - 2] + sentences[sentences.length - 1];

  const perfectEndings = ['推薦', '值得', '滿意', '很好', '不錯', '很棒'];
  const isPerfectEnding = perfectEndings.some(word => lastSentence.includes(word));

  if (isPerfectEnding && Math.random() < 0.3) {
    let candidates = template.endingTemplates;
    if (usedPhrases) {
      const filtered = candidates.filter(e => {
        for (const used of usedPhrases) {
          if (e.slice(0, 6) === used.slice(0, 6)) return false;
        }
        return true;
      });
      if (filtered.length > 0) candidates = filtered;
    }
    const newEnding = pickRandom(candidates);
    sentences[sentences.length - 2] = newEnding.replace(/[。！？]$/, '');
    sentences[sentences.length - 1] = '。';
    if (usedPhrases) usedPhrases.add(newEnding);
  }

  return sentences.join('');
}

// Rhythm optimization (unchanged)
export function optimizeRhythm(text: string): string {
  const sentences = text.split(/([。！？])/).filter(Boolean);
  if (sentences.length < 6) return text;

  for (let i = 0; i < sentences.length - 1; i += 2) {
    const sentence = sentences[i];
    if (sentence && sentence.length > 20 && Math.random() < 0.3) {
      const breakPoints = ['，但', '，不過', '，還', '，所以'];
      for (const breakPoint of breakPoints) {
        if (sentence.includes(breakPoint)) {
          const parts = sentence.split(breakPoint);
          if (parts.length === 2) {
            sentences[i] = parts[0] + '。';
            sentences[i + 1] = '。';
            sentences.splice(i + 2, 0, parts[1].trim(), '。');
            break;
          }
        }
      }
    }
  }

  return sentences.join('');
}

// Consistency guard (unchanged)
export function consistencyGuard(text: string): string {
  let context;
  try {
    context = detectReviewContext(text);
  } catch (_error) {
    console.log('Context detector not available, skipping consistency check');
    return text;
  }

  let result = text;

  if (context.visit.type === 'first' && context.visit.confidence > 0.6) {
    const repeatVisitDenyList = [
      { pattern: /記得我上次配的框/g, replacement: '很細心地幫我挑選' },
      { pattern: /還是老樣子/g, replacement: '依然保持著好品質' },
      { pattern: /一如既往/g, replacement: '從頭到尾都很' },
      { pattern: /上次來的時候/g, replacement: '這次體驗的過程中' },
      { pattern: /跟之前一樣/g, replacement: '整個過程都很' },
      { pattern: /老闆認識我/g, replacement: '老闆很親切' },
      { pattern: /熟悉的感覺/g, replacement: '溫馨的感覺' },
      { pattern: /常來這裡/g, replacement: '這次來這裡' },
      { pattern: /習慣了這裡/g, replacement: '喜歡這裡的氛圍' },
      { pattern: /記得我.*需求/g, replacement: '很了解客戶需求' },
      { pattern: /跟上次一樣/g, replacement: '整個過程很' },
      { pattern: /還記得.*上次/g, replacement: '很用心地' }
    ];

    for (const rule of repeatVisitDenyList) {
      if (rule.pattern.test(result)) {
        result = result.replace(rule.pattern, rule.replacement);
      }
    }
  }

  return result;
}

/**
 * Main optimization function - industry-aware with humanization limits.
 * Shared usedPhrases set ensures no duplicate phrases across all insertions.
 * Total humanization additions capped at 1-2 per review.
 */
export function optimizeLanguageNaturalness(
  text: string,
  industry?: string,
  maxChars?: number
): string {
  let result = text;
  const originalLength = result.replace(/\s+/g, '').length;

  // Shared dedup set across all humanization insertions
  const usedPhrases = new Set<string>();

  // Apply consistency guard
  try {
    result = consistencyGuard(result);
  } catch (_error) {
    console.log('Consistency guard error, continuing without it');
  }

  // Apply lint rules with concreteAction limits (max 2, dedup, position-aware)
  const template = getIndustryTemplate(industry);
  result = applyRulesWithLimits(result, template, usedPhrases);

  // Count how many humanization items were already added by concreteActions
  const humanizationCount = usedPhrases.size;

  // Only add micro episodes if we have headroom AND haven't exceeded humanization budget
  const currentLength = result.replace(/\s+/g, '').length;
  const budget = maxChars ? maxChars - currentLength : 60;

  if (budget > 20 && humanizationCount < 2) {
    result = insertMicroEpisode(result, industry, usedPhrases);
  }

  // Only add discourse markers if total humanization additions <= 2
  const afterEpisode = result.replace(/\s+/g, '').length;
  const remainingBudget = maxChars ? maxChars - afterEpisode : 30;

  if (remainingBudget > 10 && usedPhrases.size < 3) {
    result = insertDiscourseMarkers(result);
  }

  // Rhythm and ending optimizations
  result = optimizeRhythm(result);
  result = optimizeEnding(result, industry, usedPhrases);

  const finalLength = result.replace(/\s+/g, '').length;
  const growth = finalLength - originalLength;
  if (growth > 0) {
    console.log(`Language optimization added ${growth} chars (${originalLength} -> ${finalLength}), humanization items: ${usedPhrases.size}`);
  }

  return result;
}

// Re-export for backward compatibility
export { getIndustryTemplate } from './industry-lint-templates.ts';
