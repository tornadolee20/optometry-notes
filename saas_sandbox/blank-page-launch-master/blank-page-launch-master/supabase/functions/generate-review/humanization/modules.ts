// Humanization modules for natural review generation

// 1. 小插曲模組 - Micro-event module
export interface MicroEvent {
  industry: string;
  event: string;
  probability: number;
}

// Categorized micro-events for visit consistency
export interface CategorizedMicroEvent extends MicroEvent {
  visitType?: 'first' | 'repeat' | 'neutral';
}

export const MICRO_EVENTS: CategorizedMicroEvent[] = [
  // 眼鏡店 - First visit only
  { industry: 'optical', event: '第一次驗光有點緊張，但驗光師很會安撫', probability: 0.25, visitType: 'first' },
  { industry: 'optical', event: '不太懂流程，店員很耐心地一步步解釋', probability: 0.3, visitType: 'first' },
  { industry: 'optical', event: '朋友推薦來的，果然沒有讓我失望', probability: 0.2, visitType: 'first' },
  
  // 眼鏡店 - Repeat visit only  
  { industry: 'optical', event: '這次來換鏡片，服務還是一樣好', probability: 0.25, visitType: 'repeat' },
  { industry: 'optical', event: '老闆還記得我上次的需求，很貼心', probability: 0.3, visitType: 'repeat' },
  
  // 眼鏡店 - Neutral (any visit)
  { industry: 'optical', event: '驗光過程中提醒我要記得眨眼，很細心', probability: 0.25, visitType: 'neutral' },
  { industry: 'optical', event: '假日人多但依然很有耐心地解釋', probability: 0.2, visitType: 'neutral' },
  { industry: 'optical', event: '試戴時發現度數變化，還好有來檢查', probability: 0.25, visitType: 'neutral' },
  
  // 餐飲 - First visit only
  { industry: 'restaurant', event: '第一次來不知道招牌菜，老闆推薦得很棒', probability: 0.3, visitType: 'first' },
  { industry: 'restaurant', event: '看到網路評價來嘗試，確實名不虛傳', probability: 0.25, visitType: 'first' },
  
  // 餐飲 - Repeat visit only
  { industry: 'restaurant', event: '老闆認出我們，主動推薦新菜色', probability: 0.3, visitType: 'repeat' },
  { industry: 'restaurant', event: '還是點老樣子，味道依然很棒', probability: 0.25, visitType: 'repeat' },
  
  // 餐飲 - Neutral  
  { industry: 'restaurant', event: '小孩挑食，但老闆特別調整口味', probability: 0.3, visitType: 'neutral' },
  { industry: 'restaurant', event: '等位時老闆請我們喝茶，很貼心', probability: 0.25, visitType: 'neutral' },
  { industry: 'restaurant', event: '點錯餐，廚師還是很快重做', probability: 0.3, visitType: 'neutral' },
  
  // 美容 - First visit only
  { industry: 'beauty', event: '第一次做，技師很耐心解釋每個步驟', probability: 0.3, visitType: 'first' },
  { industry: 'beauty', event: '朋友介紹來的，果然專業度很高', probability: 0.25, visitType: 'first' },
  
  // 美容 - Repeat visit only
  { industry: 'beauty', event: '熟悉的技師，知道我皮膚的狀況', probability: 0.3, visitType: 'repeat' },
  { industry: 'beauty', event: '定期來保養，每次都很滿意', probability: 0.25, visitType: 'repeat' },
  
  // 美容 - Neutral
  { industry: 'beauty', event: '敷面膜時還幫我按摩肩膀', probability: 0.25, visitType: 'neutral' },
  { industry: 'beauty', event: '皮膚敏感，立刻換了溫和的產品', probability: 0.2, visitType: 'neutral' },
  { industry: 'beauty', event: '做完還教我居家保養方法', probability: 0.25, visitType: 'neutral' },
  
  // 通用 - First visit only
  { industry: 'general', event: '第一次來找不到路，電話裡指路很清楚', probability: 0.25, visitType: 'first' },
  { industry: 'general', event: '不熟悉環境，店員主動協助', probability: 0.2, visitType: 'first' },
  
  // 通用 - Repeat visit only
  { industry: 'general', event: '老闆一看到我就知道我要什麼', probability: 0.2, visitType: 'repeat' },
  { industry: 'general', event: '熟門熟路，直接找到想要的', probability: 0.15, visitType: 'repeat' },
  
  // 通用 - Neutral
  { industry: 'general', event: '停車位滿了，老闆幫忙指路找車位', probability: 0.2, visitType: 'neutral' },
  { industry: 'general', event: '雨天忘帶傘，離開時還借我傘', probability: 0.15, visitType: 'neutral' },
];

// 2. 語助詞庫 - Natural interjections
export const INTERJECTIONS = [
  '其實啦', '欸', '還好', '沒想到', '結果', '真的', '老實說',
  '不過', '只是', '應該', '大概', '感覺', '好像', '畢竟',
  '基本上', '總之', '反正', '說真的', '講實話'
];

// 3. 自然錯落模組 - Natural slippage patterns
export const SLIPPAGE_PATTERNS = [
  { original: '舒適', alternatives: ['舒服', '放鬆', '自在'] },
  { original: '專業', alternatives: ['厲害', '很會', '有經驗'] },
  { original: '環境', alternatives: ['地方', '空間', '店裡'] },
  { original: '服務', alternatives: ['態度', '服務態度', '待客'] },
  { original: '推薦', alternatives: ['值得', '不錯', '可以試試'] },
  { original: '價格', alternatives: ['價錢', '收費', '費用'] },
];

// 4. 痛點模組 - Industry pain points
export interface PainPoint {
  industry: string;
  pain: string;
  resolution: string;
  probability: number;
}

export const PAIN_POINTS: PainPoint[] = [
  // 眼鏡店
  { 
    industry: 'optical', 
    pain: '小孩不耐煩配眼鏡', 
    resolution: '這裡的驗光師很會跟小朋友互動', 
    probability: 0.3 
  },
  { 
    industry: 'optical', 
    pain: '擔心驗光會有壓力感', 
    resolution: '整個過程很輕鬆，沒有不舒服', 
    probability: 0.25 
  },
  { 
    industry: 'optical', 
    pain: '框架選擇太少', 
    resolution: '這裡的款式還蠻多樣的', 
    probability: 0.2 
  },
  
  // 餐飲
  { 
    industry: 'restaurant', 
    pain: '怕踩雷點到難吃的', 
    resolution: '老闆推薦的都很好吃', 
    probability: 0.3 
  },
  { 
    industry: 'restaurant', 
    pain: '帶小孩用餐怕吵到別人', 
    resolution: '這裡很親子友善，不用擔心', 
    probability: 0.25 
  },
  { 
    industry: 'restaurant', 
    pain: '假日人多要等很久', 
    resolution: '雖然要等位，但上菜速度很快', 
    probability: 0.3 
  },
  
  // 美容
  { 
    industry: 'beauty', 
    pain: '怕做臉會痛', 
    resolution: '技師手法很溫柔，完全不會不舒服', 
    probability: 0.3 
  },
  { 
    industry: 'beauty', 
    pain: '皮膚敏感怕過敏', 
    resolution: '用的都是溫和產品，很安心', 
    probability: 0.25 
  },
];

// 5. 多視角模組 - Multi-perspective module
export interface Perspective {
  type: 'first_time' | 'returning' | 'picky' | 'family';
  industry: string;
  weight: number;
  characteristics: string[];
}

export const PERSPECTIVES: Perspective[] = [
  // 餐飲業權重
  { type: 'first_time', industry: 'restaurant', weight: 0.4, characteristics: ['怕踩雷', '小心翼翼', '意外驚喜'] },
  { type: 'returning', industry: 'restaurant', weight: 0.25, characteristics: ['熟悉菜色', '一如既往', '老客人'] },
  { type: 'picky', industry: 'restaurant', weight: 0.1, characteristics: ['注重細節', '要求高', '最終滿意'] },
  { type: 'family', industry: 'restaurant', weight: 0.25, characteristics: ['帶孩子', '家庭聚餐', '照顧需求'] },
  
  // 眼鏡店權重
  { type: 'first_time', industry: 'optical', weight: 0.35, characteristics: ['不熟流程', '有點緊張', '專業安心'] },
  { type: 'returning', industry: 'optical', weight: 0.3, characteristics: ['熟悉驗光師', '信任品質', '習慣來這'] },
  { type: 'picky', industry: 'optical', weight: 0.15, characteristics: ['要求精準', '比較細節', '專業滿意'] },
  { type: 'family', industry: 'optical', weight: 0.2, characteristics: ['帶家人', '全家配鏡', '照顧需求'] },
  
  // 美容業權重
  { type: 'first_time', industry: 'beauty', weight: 0.45, characteristics: ['第一次來', '有點擔心', '意外滿意'] },
  { type: 'returning', industry: 'beauty', weight: 0.3, characteristics: ['熟悉技師', '指定服務', '持續效果'] },
  { type: 'picky', industry: 'beauty', weight: 0.1, characteristics: ['要求細節', '比較挑剔', '專業認可'] },
  { type: 'family', industry: 'beauty', weight: 0.15, characteristics: ['母女同行', '一起保養', '家庭時光'] },
  
  // 通用權重（其他行業）
  { type: 'first_time', industry: 'general', weight: 0.35, characteristics: ['初次體驗', '觀察謹慎', '建立信任'] },
  { type: 'returning', industry: 'general', weight: 0.3, characteristics: ['常客關係', '熟悉服務', '持續選擇'] },
  { type: 'picky', industry: 'general', weight: 0.15, characteristics: ['標準較高', '注重品質', '嚴格評估'] },
  { type: 'family', industry: 'general', weight: 0.2, characteristics: ['家庭需求', '多人服務', '照顧考量'] },
];

// Utility functions
export function selectMicroEvent(industry: string, visitType?: 'first' | 'repeat' | 'unknown'): string | null {
  // Filter events by industry and visit type compatibility
  const events = MICRO_EVENTS.filter(e => {
    const matchesIndustry = e.industry === industry || e.industry === 'general';
    
    if (!visitType || visitType === 'unknown') {
      // If visit type is unknown, prefer neutral events
      return matchesIndustry && (e.visitType === 'neutral' || !e.visitType);
    }
    
    // Match visit type or neutral events
    return matchesIndustry && (e.visitType === visitType || e.visitType === 'neutral' || !e.visitType);
  });
  
  if (events.length === 0) return null;
  
  const totalProbability = events.reduce((sum, e) => sum + e.probability, 0);
  
  if (Math.random() > 0.4) return null; // 40% chance of no micro event
  
  let random = Math.random() * totalProbability;
  for (const event of events) {
    random -= event.probability;
    if (random <= 0) return event.event;
  }
  
  return null;
}

export function selectInterjections(count: number = 2): string[] {
  const shuffled = [...INTERJECTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function selectPainPoint(industry: string): PainPoint | null {
  const points = PAIN_POINTS.filter(p => p.industry === industry);
  if (points.length === 0 || Math.random() > 0.3) return null; // 30% chance
  
  const totalProbability = points.reduce((sum, p) => sum + p.probability, 0);
  let random = Math.random() * totalProbability;
  
  for (const point of points) {
    random -= point.probability;
    if (random <= 0) return point;
  }
  
  return null;
}

export function selectPerspective(industry: string): Perspective {
  const perspectives = PERSPECTIVES.filter(p => p.industry === industry || p.industry === 'general');
  if (perspectives.length === 0) {
    // Fallback to general if no industry-specific perspectives
    return PERSPECTIVES.find(p => p.industry === 'general' && p.type === 'first_time')!;
  }
  
  const totalWeight = perspectives.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const perspective of perspectives) {
    random -= perspective.weight;
    if (random <= 0) return perspective;
  }
  
  return perspectives[0]; // Fallback
}

export function applyWordSlippage(text: string): string {
  let result = text;
  
  // Apply 1-2 slippage patterns randomly
  const patterns = [...SLIPPAGE_PATTERNS].sort(() => Math.random() - 0.5).slice(0, 2);
  
  for (const pattern of patterns) {
    if (Math.random() < 0.3 && result.includes(pattern.original)) { // 30% chance per pattern
      const alternative = pattern.alternatives[Math.floor(Math.random() * pattern.alternatives.length)];
      // Only replace first occurrence to avoid over-changing
      result = result.replace(pattern.original, alternative);
    }
  }
  
  return result;
}