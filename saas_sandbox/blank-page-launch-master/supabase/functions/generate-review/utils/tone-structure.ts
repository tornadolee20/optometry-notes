// 語氣與句型的隨機挑選與去重輔助
export type ToneKey =
  | 'friendly'
  | 'casual'
  | 'humor'
  | 'story_experience'
  | 'balanced_objective'
  | 'professional'
  | 'colloquial_feel'
  | 'scenario_empathy'
  | 'chill_chat'
  | 'earnest_review'
  | 'low_key_praise'
  | 'slightly_picky'
  | 'warm_gratitude';

export type StructureKey =
  | 'direct_recommendation'
  | 'contrast'
  | 'inner_monologue'
  | 'bullet_emphasis'
  | 'story_narration'
  | 'question_start'
  | 'scene_description';

// Emotional intensity level — affects word choice intensity in prompt
export type ToneIntensity = 'low' | 'medium' | 'high';

export interface ToneOption {
  key: ToneKey;
  label: string;
  promptHint: string; // 給 AI 的語感說明，讓每種語氣更有辨識度
  intensityRange: [ToneIntensity, ToneIntensity]; // 允許的情緒強度範圍
}

export interface StructureOption {
  key: StructureKey;
  label: string;
}

export const TONES: ToneOption[] = [
  { key: 'friendly', label: '親切自然', promptHint: '像鄰居聊天，用「蠻…的」「還不錯」等詞，語氣溫和不浮誇', intensityRange: ['low', 'medium'] },
  { key: 'casual', label: '生活化', promptHint: '像在 LINE 跟朋友講話，可以用省略句、口語縮寫，節奏輕快', intensityRange: ['low', 'medium'] },
  { key: 'humor', label: '幽默風趣', promptHint: '帶一點自嘲或小幽默，像在 PTT 發心得文，不要刻意搞笑', intensityRange: ['medium', 'high'] },
  { key: 'story_experience', label: '小故事 + 體驗', promptHint: '像寫部落格遊記，用時間線交代前因後果，有畫面感', intensityRange: ['medium', 'high'] },
  { key: 'balanced_objective', label: '帶小缺點 + 客觀', promptHint: '語氣冷靜理性，先講優點再帶一個不影響整體的小缺點，像消費者報告', intensityRange: ['low', 'medium'] },
  { key: 'professional', label: '專業分析型', promptHint: '用具體數字或比較來佐證，像專業評測，少用情感詞', intensityRange: ['low', 'low'] },
  { key: 'colloquial_feel', label: '口語 + 感受型', promptHint: '大量使用「超…」「真的會…」「笑死」等口語，像 IG 限動留言', intensityRange: ['medium', 'high'] },
  { key: 'scenario_empathy', label: '情境帶入 + 共鳴', promptHint: '從一個具體場景切入（下雨天、加班後、帶小孩），讓讀者代入', intensityRange: ['medium', 'high'] },
  { key: 'chill_chat', label: '隨性閒聊', promptHint: '像跟不熟的同事聊天，語氣淡淡的但正面，用「還行」「可以」「不會失望」等低調措辭', intensityRange: ['low', 'low'] },
  { key: 'earnest_review', label: '認真寫心得', promptHint: '像在 Google Map 認真留評論，條理分明，用「首先」「再來」「整體來說」等連接詞', intensityRange: ['medium', 'medium'] },
  { key: 'low_key_praise', label: '低調好評', promptHint: '不會直說「超讚」，而是用「比預期好」「沒什麼好挑剔的」「下次還會來」這種含蓄肯定', intensityRange: ['low', 'medium'] },
  { key: 'slightly_picky', label: '微挑剔但滿意', promptHint: '會先提一個小在意的地方，然後話鋒一轉說整體還是很好，像「雖然…但…」結構', intensityRange: ['medium', 'medium'] },
  { key: 'warm_gratitude', label: '暖心感謝', promptHint: '語氣真誠帶感激，像在謝謝老闆或店員，會提到「很感動」「很窩心」等情感詞', intensityRange: ['medium', 'high'] },
];

export const STRUCTURES: StructureOption[] = [
  { key: 'direct_recommendation', label: '直接推薦型' },
  { key: 'contrast', label: '對比轉折型' },
  { key: 'inner_monologue', label: '內心獨白型' },
  { key: 'bullet_emphasis', label: '列點強調型' },
  { key: 'story_narration', label: '故事敘述型' },
  { key: 'question_start', label: '問題開頭型' },
  { key: 'scene_description', label: '情境描述型' },
];

function pickOneNotInRecent<T extends { key: string }>(
  all: T[],
  recentKeys: string[] = [],
  maxAttempts = 10
): T {
  let attempt = 0;
  let choice: T;
  do {
    choice = all[Math.floor(Math.random() * all.length)];
    attempt++;
  } while (recentKeys.includes(choice.key) && attempt < maxAttempts);
  return choice;
}

export function getRandomTone(recentToneKeys: string[] = []): ToneOption {
  return pickOneNotInRecent(TONES, recentToneKeys);
}

export function getRandomSentencePattern(
  recentStructureKeys: string[] = []
): StructureOption {
  return pickOneNotInRecent(STRUCTURES, recentStructureKeys);
}

// Pick a random intensity within a tone's allowed range
export function pickToneIntensity(tone: ToneOption): ToneIntensity {
  const [min, max] = tone.intensityRange;
  const levels: ToneIntensity[] = ['low', 'medium', 'high'];
  const minIdx = levels.indexOf(min);
  const maxIdx = levels.indexOf(max);
  const idx = minIdx + Math.floor(Math.random() * (maxIdx - minIdx + 1));
  return levels[idx];
}

// Map tone to interjection mood for coherent voice
export function toneToInterjectionMood(toneKey: ToneKey): 'chill' | 'earnest' | 'emotional' | 'neutral' {
  const mapping: Record<ToneKey, 'chill' | 'earnest' | 'emotional' | 'neutral'> = {
    friendly: 'neutral',
    casual: 'chill',
    humor: 'emotional',
    story_experience: 'earnest',
    balanced_objective: 'earnest',
    professional: 'earnest',
    colloquial_feel: 'emotional',
    scenario_empathy: 'emotional',
    chill_chat: 'chill',
    earnest_review: 'earnest',
    low_key_praise: 'chill',
    slightly_picky: 'earnest',
    warm_gratitude: 'emotional',
  };
  return mapping[toneKey] || 'neutral';
}
