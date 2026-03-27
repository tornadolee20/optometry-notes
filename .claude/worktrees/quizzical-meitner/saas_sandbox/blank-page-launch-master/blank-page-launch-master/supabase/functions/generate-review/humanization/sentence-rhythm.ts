// Sentence rhythm and structure humanization

export interface SentenceInfo {
  content: string;
  length: number;
  type: 'short' | 'medium' | 'long';
}

// Classify sentence length
function classifySentence(sentence: string): SentenceInfo {
  const length = sentence.replace(/\s+/g, '').length;
  let type: 'short' | 'medium' | 'long';
  
  if (length <= 15) type = 'short';
  else if (length <= 35) type = 'medium';
  else type = 'long';
  
  return { content: sentence, length, type };
}

// Adjust sentence rhythm while preserving logical order
export function shuffleSentenceRhythm(text: string): string {
  if (!text) return '';
  
  // Split into sentences, preserving punctuation
  const sentences = text
    .split(/([。！？!?])/)
    .reduce<string[]>((acc, cur, idx, arr) => {
      if (/[。！？!?]/.test(cur)) {
        const prev = acc.pop() ?? '';
        acc.push(prev + cur);
      } else if (cur.trim()) {
        acc.push(cur.trim());
      }
      return acc;
    }, [])
    .filter(Boolean);

  if (sentences.length <= 2) return text;
  
  // PRESERVE LOGICAL ORDER - only adjust within safe ranges
  // Don't reorder opening (first 1-2) and closing (last 1-2) sentences
  const opening = sentences.slice(0, Math.min(2, sentences.length));
  const closing = sentences.slice(-Math.min(2, sentences.length));
  const middle = sentences.slice(opening.length, sentences.length - closing.length);
  
  // Only lightly shuffle middle sentences if there are enough
  if (middle.length > 2) {
    // Minor adjacent swaps only - preserve general flow
    for (let i = 0; i < middle.length - 1; i++) {
      if (Math.random() < 0.3) { // 30% chance of swapping adjacent sentences
        const temp = middle[i];
        middle[i] = middle[i + 1];
        middle[i + 1] = temp;
        i++; // Skip next to avoid double-swapping
      }
    }
  }
  
  return [...opening, ...middle, ...closing].join('');
}

// Add abrupt short sentences for natural feel (more conservative)
export function insertAbruptSentences(text: string): string {
  if (!text || Math.random() > 0.2) return text; // Reduced to 20% chance
  
  const abruptSentences = [
    '真的。',
    '沒錯。',
    '挺好的。',
    '很棒。',
    '讚。',
    '真心推薦。'
  ];
  
  const sentences = text.split(/([。！？!?])/).filter(Boolean);
  if (sentences.length < 6) return text; // Only for longer reviews
  
  // Only insert near the end (after experience, before conclusion)
  const safeZoneStart = Math.floor(sentences.length * 0.6);
  const safeZoneEnd = Math.floor(sentences.length * 0.8);
  
  if (safeZoneEnd <= safeZoneStart) return text;
  
  const insertPos = safeZoneStart + Math.floor(Math.random() * (safeZoneEnd - safeZoneStart));
  const abrupt = abruptSentences[Math.floor(Math.random() * abruptSentences.length)];
  
  sentences.splice(insertPos, 0, abrupt);
  
  return sentences.join('');
}

// Create emotional curve: concern -> experience -> satisfaction
export function generateEmotionalCurve(
  painPoint: string | null,
  microEvent: string | null,
  satisfaction: string
): string {
  const curves = [];
  
  // Start with concern/uncertainty
  if (painPoint) {
    curves.push(`本來${painPoint}，`);
  } else {
    const concerns = [
      '一開始有點擔心，',
      '原本不太確定，',
      '第一次來不知道會怎樣，',
      '說實話原本沒抱太大期待，'
    ];
    if (Math.random() < 0.4) { // 40% chance
      curves.push(concerns[Math.floor(Math.random() * concerns.length)]);
    }
  }
  
  // Add experience detail
  if (microEvent) {
    curves.push(`${microEvent}。`);
  }
  
  // End with satisfaction
  curves.push(satisfaction);
  
  return curves.join('');
}

// Enforce logical paragraph layout based on content structure
export function enforceFlexibleParagraphs(text: string): string {
  if (!text) return '';
  
  // Normalize line breaks
  const normalized = text
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  
  // If already has good paragraph breaks, preserve them
  if (normalized.includes('\n\n')) {
    return normalized;
  }
  
  // Split into sentences while preserving structure
  const sentences = normalized
    .split(/([。！？!?])/)
    .reduce<string[]>((acc, cur, idx, arr) => {
      if (/[。！？!?]/.test(cur)) {
        const prev = acc.pop() ?? '';
        acc.push(prev + cur);
      } else if (cur.trim()) {
        acc.push(cur.trim());
      }
      return acc;
    }, [])
    .filter(Boolean);
    
  if (sentences.length <= 2) return normalized;
  
  // Create logical breaks based on content patterns
  const paragraphs: string[] = [];
  let currentParagraph = '';
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    currentParagraph += sentence;
    
    // Natural break points: after experience description, before conclusion
    const isExperienceEnd = /這次|今天|整體|總的來說|後來|結果/.test(sentence);
    const isConclusionStart = i >= sentences.length - 2; // Last 2 sentences
    const hasGoodLength = currentParagraph.replace(/\s+/g, '').length > 50;
    
    if ((isExperienceEnd || isConclusionStart) && hasGoodLength && paragraphs.length < 3) {
      paragraphs.push(currentParagraph.trim());
      currentParagraph = '';
    }
  }
  
  // Add remaining sentences
  if (currentParagraph.trim()) {
    if (paragraphs.length > 0) {
      paragraphs.push(currentParagraph.trim());
    } else {
      paragraphs.push(normalized); // fallback to original
    }
  }
  
  // Ensure we don't have too many short paragraphs
  while (paragraphs.length > 3) {
    const last = paragraphs.pop()!;
    paragraphs[paragraphs.length - 1] += last;
  }
  
  return paragraphs.length > 1 ? paragraphs.join('\n\n') : normalized;
}