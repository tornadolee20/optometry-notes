// 排版多樣化器 - 創造不同的段落結構和節奏感

interface LayoutPattern {
  name: string;
  paragraphCount: number;
  sentenceDistribution: number[];
  rhythm: 'fast' | 'medium' | 'slow';
  characteristics: string[];
}

// 12種不同的排版模式
export const LAYOUT_PATTERNS: LayoutPattern[] = [
  {
    name: "開門見山式",
    paragraphCount: 2,
    sentenceDistribution: [3, 4], // 第一段3句，第二段4句
    rhythm: 'fast',
    characteristics: ["直接切入重點", "結尾強化印象"]
  },
  {
    name: "層層遞進式", 
    paragraphCount: 3,
    sentenceDistribution: [2, 3, 2], // 短-長-短結構
    rhythm: 'medium',
    characteristics: ["循序漸進", "中段詳述", "簡潔收尾"]
  },
  {
    name: "情境帶入式",
    paragraphCount: 3, 
    sentenceDistribution: [3, 2, 3], // 長-短-長結構
    rhythm: 'slow',
    characteristics: ["場景描述", "核心體驗", "感受總結"]
  },
  {
    name: "對比反差式",
    paragraphCount: 2,
    sentenceDistribution: [4, 3], // 長短對比
    rhythm: 'medium',
    characteristics: ["前後對比", "反差強調"]
  },
  {
    name: "細節展開式",
    paragraphCount: 3,
    sentenceDistribution: [2, 4, 2], // 短-詳-短
    rhythm: 'slow',
    characteristics: ["簡單開頭", "細節豐富", "簡潔總結"]
  },
  {
    name: "節奏明快式",
    paragraphCount: 2,
    sentenceDistribution: [2, 3], // 短段落快節奏
    rhythm: 'fast',
    characteristics: ["簡潔明瞭", "重點突出"]
  },
  {
    name: "故事敘述式",
    paragraphCount: 3,
    sentenceDistribution: [3, 3, 2], // 平穩敘述
    rhythm: 'medium',
    characteristics: ["事件開端", "過程描述", "結果感受"]
  },
  {
    name: "重點強調式",
    paragraphCount: 2,
    sentenceDistribution: [2, 4], // 短開頭，長結尾
    rhythm: 'medium',
    characteristics: ["快速引入", "重點詳述"]
  },
  {
    name: "均衡分布式",
    paragraphCount: 3,
    sentenceDistribution: [3, 3, 3], // 三段均等
    rhythm: 'medium',
    characteristics: ["結構平衡", "邏輯清晰"]
  },
  {
    name: "漸強推進式",
    paragraphCount: 3,
    sentenceDistribution: [2, 3, 4], // 逐漸加強
    rhythm: 'slow',
    characteristics: ["緩慢開始", "逐步深入", "強烈結尾"]
  },
  {
    name: "精簡專注式",
    paragraphCount: 2,
    sentenceDistribution: [3, 2], // 精簡高效
    rhythm: 'fast',
    characteristics: ["重點明確", "不拖泥帶水"]
  },
  {
    name: "深度體驗式",
    paragraphCount: 3,
    sentenceDistribution: [2, 4, 3], // 深度描述
    rhythm: 'slow',
    characteristics: ["引入話題", "深度體驗", "感受分享"]
  }
];

// 根據關鍵字類型和情感選擇排版模式
export function selectLayoutPattern(
  keywords: string[], 
  sentiment: string,
  customerType: string
): LayoutPattern {
  const hasDetailKeywords = keywords.some(k => 
    k.includes('專業') || k.includes('細心') || k.includes('詳細')
  );
  const hasSpeedKeywords = keywords.some(k => 
    k.includes('快速') || k.includes('效率') || k.includes('迅速')
  );
  const hasExperienceKeywords = keywords.some(k => 
    k.includes('體驗') || k.includes('感受') || k.includes('過程')
  );

  let preferredPatterns: number[] = [];

  // 根據客戶類型選擇合適的排版
  if (customerType.includes('專業')) {
    preferredPatterns = [4, 8, 11]; // 細節展開、均衡分布、深度體驗
  } else if (customerType.includes('學生') || customerType.includes('上班族')) {
    preferredPatterns = [0, 5, 10]; // 開門見山、節奏明快、精簡專注
  } else if (customerType.includes('家庭') || customerType.includes('年長')) {
    preferredPatterns = [2, 6, 9]; // 情境帶入、故事敘述、漸強推進
  } else {
    // 根據關鍵字特性選擇
    if (hasDetailKeywords) {
      preferredPatterns = [4, 11]; // 細節展開、深度體驗
    } else if (hasSpeedKeywords) {
      preferredPatterns = [0, 5, 10]; // 開門見山、節奏明快、精簡專注
    } else if (hasExperienceKeywords) {
      preferredPatterns = [2, 6, 9]; // 情境帶入、故事敘述、漸強推進
    } else {
      preferredPatterns = [1, 7, 8]; // 層層遞進、重點強調、均衡分布
    }
  }

  // 根據情感調整
  if (sentiment === 'negative') {
    preferredPatterns = [3, 7, 8]; // 對比反差、重點強調、均衡分布
  } else if (sentiment === 'positive') {
    // 保持原有偏好
  }

  if (preferredPatterns.length === 0) {
    preferredPatterns = [1, 6, 8]; // 默認選擇
  }

  const randomIndex = preferredPatterns[Math.floor(Math.random() * preferredPatterns.length)];
  return LAYOUT_PATTERNS[randomIndex];
}

// 高級段落重組 - 根據選定的排版模式重新組織內容
export function restructureParagraphs(
  text: string, 
  pattern: LayoutPattern,
  keywords: string[]
): string {
  if (!text) return '';

  // 清理並分句
  const normalized = text
    .replace(/\r/g, '')
    .replace(/\n{2,}/g, ' ')
    .trim();

  const sentences = normalized
    .split(/([。！？!?])/)
    .reduce<string[]>((acc, cur, idx) => {
      if (/[。！？!?]/.test(cur)) {
        const prev = acc.pop() ?? '';
        acc.push((prev + cur).trim());
      } else if (cur.trim()) {
        acc.push(cur.trim());
      }
      return acc;
    }, [])
    .filter(s => s.length > 0);

  if (sentences.length < 3) {
    return normalized; // 句子太少，保持原樣
  }

  const targetDistribution = pattern.sentenceDistribution;
  const totalTargetSentences = targetDistribution.reduce((a, b) => a + b, 0);
  
  // 如果句子數不匹配，進行調整
  let adjustedSentences = [...sentences];
  
  if (sentences.length > totalTargetSentences) {
    // 句子太多，合併一些
    while (adjustedSentences.length > totalTargetSentences) {
      const lastIndex = adjustedSentences.length - 1;
      const secondLastIndex = lastIndex - 1;
      if (secondLastIndex >= 0) {
        adjustedSentences[secondLastIndex] += adjustedSentences[lastIndex];
        adjustedSentences.pop();
      } else {
        break;
      }
    }
  } else if (sentences.length < totalTargetSentences) {
    // 句子太少，嘗試拆分較長的句子
    const longSentences = adjustedSentences
      .map((s, i) => ({sentence: s, index: i, length: s.length}))
      .filter(s => s.length > 30)
      .sort((a, b) => b.length - a.length);

    for (const longSentence of longSentences) {
      if (adjustedSentences.length >= totalTargetSentences) break;
      
      const sentence = longSentence.sentence;
      const midPoint = Math.floor(sentence.length / 2);
      const splitPoint = sentence.indexOf('，', midPoint) !== -1 
        ? sentence.indexOf('，', midPoint) + 1
        : sentence.indexOf('、', midPoint) !== -1
        ? sentence.indexOf('、', midPoint) + 1
        : midPoint;

      if (splitPoint > 0 && splitPoint < sentence.length - 5) {
        const part1 = sentence.substring(0, splitPoint).trim();
        const part2 = sentence.substring(splitPoint).trim();
        
        adjustedSentences[longSentence.index] = part1;
        adjustedSentences.splice(longSentence.index + 1, 0, part2);
        break;
      }
    }
  }

  // 根據模式分配句子到段落
  const paragraphs: string[] = [];
  let sentenceIndex = 0;

  for (const count of targetDistribution) {
    const paragraphSentences = adjustedSentences.slice(sentenceIndex, sentenceIndex + count);
    if (paragraphSentences.length > 0) {
      paragraphs.push(paragraphSentences.join(''));
    }
    sentenceIndex += count;
  }

  // 處理剩餘句子
  if (sentenceIndex < adjustedSentences.length) {
    const remaining = adjustedSentences.slice(sentenceIndex);
    if (paragraphs.length > 0) {
      paragraphs[paragraphs.length - 1] += remaining.join('');
    } else {
      paragraphs.push(remaining.join(''));
    }
  }

  return paragraphs.filter(p => p.trim().length > 0).join('\n\n');
}

// 增加段落間的節奏變化
export function addRhythmVariation(text: string, rhythm: 'fast' | 'medium' | 'slow'): string {
  const paragraphs = text.split('\n\n').filter(p => p.trim());
  
  if (paragraphs.length < 2) return text;

  // 根據節奏類型調整段落間的連接詞和語氣
  const rhythmAdjustments = {
    fast: {
      connectors: ['', '然後', '接著', '結果'],
      intensity: ['真的', '確實', '超級', '非常']
    },
    medium: {
      connectors: ['', '而且', '另外', '此外', '同時'],
      intensity: ['很', '蠻', '相當', '挺']
    },
    slow: {
      connectors: ['', '除此之外', '更重要的是', '值得一提的是', '另一方面'],
      intensity: ['', '深深', '由衷', '打從心底']
    }
  };

  const adjustments = rhythmAdjustments[rhythm];
  
  return paragraphs.map((paragraph, index) => {
    if (index === 0) return paragraph; // 第一段保持原樣
    
    // 隨機決定是否添加連接詞 (30% 機率)
    if (Math.random() < 0.3) {
      const connector = adjustments.connectors[Math.floor(Math.random() * adjustments.connectors.length)];
      if (connector && !paragraph.startsWith(connector)) {
        return connector + paragraph;
      }
    }
    
    return paragraph;
  }).join('\n\n');
}