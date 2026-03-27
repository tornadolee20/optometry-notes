// 語氣與句型的隨機挑選與去重輔助
export type ToneKey =
  | 'friendly'
  | 'casual'
  | 'humor'
  | 'story_experience'
  | 'balanced_objective'
  | 'professional'
  | 'colloquial_feel'
  | 'scenario_empathy';

export type StructureKey =
  | 'direct_recommendation'
  | 'contrast'
  | 'inner_monologue'
  | 'bullet_emphasis'
  | 'story_narration'
  | 'question_start'
  | 'scene_description';

export interface ToneOption {
  key: ToneKey;
  label: string; // 對應到 prompt 中的語氣名稱
}

export interface StructureOption {
  key: StructureKey;
  label: string; // 對應到 prompt 中的句型名稱
}

export const TONES: ToneOption[] = [
  { key: 'friendly', label: '親切自然' },
  { key: 'casual', label: '生活化' },
  { key: 'humor', label: '幽默風趣' },
  { key: 'story_experience', label: '小故事 + 體驗' },
  { key: 'balanced_objective', label: '帶小缺點 + 客觀' },
  { key: 'professional', label: '專業分析型' },
  { key: 'colloquial_feel', label: '口語 + 感受型' },
  { key: 'scenario_empathy', label: '情境帶入 + 共鳴' },
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
