import { detectReviewContext } from './context-detector.ts';

// 語言檢查和修正模組 - Language linting and correction
export interface LintRule {
  pattern: RegExp;
  fix: (match: string, ...groups: string[]) => string;
  priority: number; // 1=highest, 5=lowest
}

// 具象場景與微動作庫
export const CONCRETE_ACTIONS = {
  '親切': ['端水', '遞紙巾', '問我坐得舒不舒服', '主動解釋流程'],
  '專業': ['邊講邊操作', '把兩種鏡片放在我面前對比', '記得我上次配的框', '畫重點給我看'],
  '仔細': ['提醒我眨眼', '幫我調鼻墊', '確認我看得清楚', '問鼻樑會不會壓'],
  '耐心': ['讓我自己想一下', '不追著我下決定', '慢慢解釋差在哪', '一直過來確認'],
  '舒適': ['光線是暖的', '椅子不硬', '木頭香味', '背景音樂不吵']
};

// 微小插曲模板（不完美→被照顧）
export const MICRO_EPISODES = [
  { problem: '假日人多', solution: '不過他們一直過來確認，不會被晾著' },
  { problem: '等了幾分鐘', solution: '老闆還泡茶讓我們慢慢選' },
  { problem: '小孩坐不住', solution: '驗光師很會逗小朋友開心' },
  { problem: '本來只是想驗光', solution: '結果不知不覺就挑到一副剛好的' },
  { problem: '第一次來有點緊張', solution: '他口氣始終很平，我就放鬆了' },
  { problem: '度數變化有點擔心', solution: '還好他解釋得很清楚，原來很正常' }
];

// 感官與生活詞庫
export const SENSORY_WORDS = {
  '環境': ['光線是暖的', '木頭香味', '背景音樂不吵', '坐下來就鬆了'],
  '舒適': ['椅子不硬', '空間不擠', '溫度剛好', '聲音輕柔'],
  '放鬆': ['肩膀鬆下來', '心就定了', '呼吸順暢', '沒有壓迫感']
};

// 收尾模板（輕微保留或後續打算）
export const ENDING_TEMPLATES = [
  '價格合理、不推銷。之後會帶家人再來。',
  '整體來說還不錯，下次驗光會考慮這裡。',
  '雖然等了一下，但效果值得。會推薦朋友。',
  '比預期的好，改天帶小孩來配眼鏡。',
  '服務到位，就是停車稍微麻煩一點。'
];

// 語言修正規則
export const LINT_RULES: LintRule[] = [
  // 1. 口語粒子與語氣（控制數量1-2個）
  {
    name: '自然化表達語氣',
    pattern: /(服務很專業)/g,
    fix: () => '老實說，比我想的還仔細',
    priority: 1
  },

  // 2. 具象場景替換抽象形容詞
  {
    name: '具象化親切行為',
    pattern: /(很|非常)?(親切|貼心)/g,
    fix: () => {
      const actions = CONCRETE_ACTIONS['親切'];
      return actions[Math.floor(Math.random() * actions.length)];
    },
    priority: 1
  },

  {
    name: '具象化專業表現',
    pattern: /(很|非常)?(專業|厲害)/g,
    fix: () => {
      const actions = CONCRETE_ACTIONS['專業'];
      return actions[Math.floor(Math.random() * actions.length)];
    },
    priority: 1
  },

  // 3. 環境描述感官化
  {
    name: '感官化環境描述',
    pattern: /環境(很)?(舒適|不錯|好)/g,
    fix: () => {
      const sensory = SENSORY_WORDS['環境'];
      return sensory[Math.floor(Math.random() * sensory.length)];
    },
    priority: 2
  },

  // 4. 動詞優先替換
  {
    name: '動詞化服務描述',
    pattern: /沒有推銷壓力/g,
    fix: () => '問完就讓我自己想一下，不追著我下決定',
    priority: 1
  },

  {
    name: '動詞化仔細服務',
    pattern: /(很|非常)?(仔細|細心)/g,
    fix: () => {
      const actions = CONCRETE_ACTIONS['仔細'];
      return actions[Math.floor(Math.random() * actions.length)];
    },
    priority: 1
  },

  // 5. 人稱活化
  {
    name: '活化服務主體',
    pattern: /服務品質(很好|佳|不錯)/g,
    fix: () => '驗光師邊講邊畫重點，我跟得上',
    priority: 2
  },

  // 6. 修正不自然語法
  {
    name: '修正「很有專業」',
    pattern: /很有專業(?![度])/g,
    fix: () => '他把流程解釋得很清楚',
    priority: 1
  },

  // 7. 修正「讓我」重複
  {
    name: '修正連續讓我',
    pattern: /(讓我[^。！？]*[。！？])\s*(讓我)/g,
    fix: (match, firstSentence) => {
      return firstSentence + ' 也因此我';
    },
    priority: 2
  },

  // 8. 修正具體語病和生硬表達
  {
    name: '修正畫重點表達',
    pattern: /服務畫重點給我看/g,
    fix: () => '驗光師邊講邊畫重點，我跟得上',
    priority: 1
  },

  {
    name: '修正被推銷感',
    pattern: /幫我選擇了最適合/g,
    fix: () => '最後一起挑到一副合臉型的款式',
    priority: 1
  },

  {
    name: '修正不完整句子',
    pattern: /特別是鏡框的可以試試/g,
    fix: () => '鏡框先試了幾款，鼻樑不會被壓',
    priority: 1
  },

  {
    name: '修正生硬動作描述',
    pattern: /畫重點給我看/g,
    fix: () => '邊講邊畫重點',
    priority: 1
  },

  {
    name: '修正選擇表達',
    pattern: /選擇了.*最適合/g,
    fix: () => '一起挑到合適的款式',
    priority: 1
  }
];

// 插入微小插曲
export function insertMicroEpisode(text: string): string {
  // 檢查是否已有插曲
  const hasEpisode = MICRO_EPISODES.some(ep => 
    text.includes(ep.problem) || text.includes(ep.solution)
  );
  
  if (hasEpisode || text.length < 80) return text;

  const sentences = text.split(/([。！？])/).filter(Boolean);
  if (sentences.length < 4) return text;

  // 在中段插入一個微插曲
  const insertPos = Math.floor(sentences.length * 0.5);
  if (insertPos < sentences.length && /[。！？]/.test(sentences[insertPos])) {
    const episode = MICRO_EPISODES[Math.floor(Math.random() * MICRO_EPISODES.length)];
    const episodeText = `${episode.problem}，${episode.solution}`;
    sentences[insertPos] = sentences[insertPos] + ' ' + episodeText + '。';
  }

  return sentences.join('');
}

// 控制口語粒子數量（1-2個）
export function insertDiscourseMarkers(text: string): string {
  const markers = ['其實', '老實說', '還好', '沒想到', '結果', '欸'];
  
  // 檢查已有的語氣詞數量
  const existingCount = markers.filter(marker => text.includes(marker)).length;
  if (existingCount >= 2) return text;

  const sentences = text.split(/([。！？])/).filter(Boolean);
  if (sentences.length < 4) return text;

  // 最多插入2個，優先中段
  const needToInsert = Math.min(2 - existingCount, 1);
  const middlePos = Math.floor(sentences.length * 0.4);
  
  if (middlePos < sentences.length && /[。！？]/.test(sentences[middlePos])) {
    const marker = markers[Math.floor(Math.random() * markers.length)];
    // 自然插入，不是簡單前綴
    if (sentences[middlePos - 1] && !sentences[middlePos - 1].includes(marker)) {
      const naturalInsert = `${marker}，${sentences[middlePos - 1].replace(/[。！？]$/, '')}`;
      sentences[middlePos - 1] = naturalInsert;
    }
  }

  return sentences.join('');
}

// 優化收尾（不必完美）
export function optimizeEnding(text: string): string {
  const sentences = text.split(/([。！？])/).filter(Boolean);
  if (sentences.length < 2) return text;

  const lastSentence = sentences[sentences.length - 2] + sentences[sentences.length - 1];
  
  // 如果結尾太完美（全是讚美），加入輕微保留
  const perfectEndings = ['推薦', '值得', '滿意', '很好', '不錯', '很棒'];
  const isPerfectEnding = perfectEndings.some(word => lastSentence.includes(word));
  
  if (isPerfectEnding && Math.random() < 0.3) {
    const newEnding = ENDING_TEMPLATES[Math.floor(Math.random() * ENDING_TEMPLATES.length)];
    sentences[sentences.length - 2] = newEnding.replace(/[。！？]$/, '');
    sentences[sentences.length - 1] = '。';
  }

  return sentences.join('');
}

// 節奏優化（長短句交錯）
export function optimizeRhythm(text: string): string {
  const sentences = text.split(/([。！？])/).filter(Boolean);
  if (sentences.length < 6) return text;

  // 找到可以拆分的長句（>20字）
  for (let i = 0; i < sentences.length - 1; i += 2) {
    const sentence = sentences[i];
    if (sentence && sentence.length > 20 && Math.random() < 0.3) {
      // 嘗試自然拆分
      const breakPoints = ['，但', '，不過', '，還', '，所以'];
      for (const breakPoint of breakPoints) {
        if (sentence.includes(breakPoint)) {
          const parts = sentence.split(breakPoint);
          if (parts.length === 2) {
            sentences[i] = parts[0] + '。';
            sentences[i + 1] = '。';
            // 插入新的短句
            sentences.splice(i + 2, 0, parts[1].trim(), '。');
            break;
          }
        }
      }
    }
  }

  return sentences.join('');
}

// 完整的人味語感優化
// (moved) See enhanced optimizeLanguageNaturalness below

// Consistency guard for logical review coherence
export function consistencyGuard(text: string): string {
  let context;
  try {
    context = detectReviewContext(text);
  } catch (error) {
    console.log('Context detector not available, skipping consistency check');
    return text;
  }
  
  let result = text;
  const appliedFixes: string[] = [];
  
  // Visit consistency rules
  if (context.visit.type === 'first' && context.visit.confidence > 0.6) {
    // Remove phrases that imply repeat visits
    const repeatVisitDenyList = [
      { pattern: /記得我上次配的框/g, replacement: '很細心地幫我挑選框架' },
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
        appliedFixes.push(`修正重複訪問語句: ${rule.pattern.source}`);
      }
    }
  }
  
  // Log applied fixes
  if (appliedFixes.length > 0) {
    console.log('一致性守衛應用修正:', appliedFixes);
    console.log('訪問情境:', context.visit);
  }
  
  return result;
}

// Enhanced optimize function with consistency guard
export function optimizeLanguageNaturalness(text: string): string {
  let result = text;
  
  // Apply consistency guard first (async function made sync for now)
  try {
    result = consistencyGuard(result);
  } catch (error) {
    console.log('Consistency guard error, continuing without it:', error);
  }
  
  // Apply lint rules by priority order
  const sortedRules = LINT_RULES.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  
  for (const rule of sortedRules) {
    const before = result;
    result = rule.fix(result);
    
    // Log changes for debugging (only in development)
    if (before !== result && Deno?.env?.get('ENVIRONMENT') === 'development') {
      console.log(`Applied ${rule.name}:`, { before: before.substring(0, 100), after: result.substring(0, 100) });
    }
  }
  
  // 1. 微插曲注入（問題→解決）
  result = insertMicroEpisode(result);
  
  // 2. 語助詞注入（"其實啦"、"不過"）
  result = insertDiscourseMarkers(result);
  
  // 4. 節奏優化（長短句交錯）
  result = optimizeRhythm(result);
  
  // 5. 收尾優化（不必完美）
  result = optimizeEnding(result);
  
  return result;
}