import { CalculationResult } from './calculateLogic';
import { Language, TranslationKey } from './translations';

export interface SuggestionItem {
  keywordKey: TranslationKey;
  textKey: TranslationKey;
}

export function getBasicSuggestions(res: CalculationResult): SuggestionItem[] {
  const suggestions: SuggestionItem[] = [];

  // 1. 症狀 / 現況 - 客戶感受導向，關鍵字前置
  if (res.ciss?.symptomatic) {
    suggestions.push({ keywordKey: 'keywordSymptom', textKey: 'suggestionSymptomFatigue' });
  } else if (res.diag.code !== 'NORMAL') {
    suggestions.push({ keywordKey: 'keywordCondition', textKey: 'suggestionConditionBurden' });
  } else {
    suggestions.push({ keywordKey: 'keywordCondition', textKey: 'suggestionConditionGood' });
  }

  // 2. 解決方向（鏡片 / 訓練）- 關鍵字前置
  if (res.accom?.status === 'Presbyopia' || res.accom?.status === 'Pre-Presbyopia') {
    suggestions.push({ keywordKey: 'keywordLens', textKey: 'suggestionLensMultifocal' });
  } else if (res.diag.code === 'CI' || res.diag.code === 'Pseudo-CI') {
    suggestions.push({ keywordKey: 'keywordTraining', textKey: 'suggestionTrainingCI' });
  } else if (res.priority === 'Treat') {
    suggestions.push({ keywordKey: 'keywordTreatment', textKey: 'suggestionTreatmentNeeded' });
  } else {
    suggestions.push({ keywordKey: 'keywordSuggestion', textKey: 'suggestionNoTreatment' });
  }

  // 3. 追蹤建議 - 關鍵字前置
  if (res.priority === 'Treat') {
    suggestions.push({ keywordKey: 'keywordFollowUp', textKey: 'suggestionFollowUp3Month' });
  } else {
    suggestions.push({ keywordKey: 'keywordFollowUp', textKey: 'suggestionFollowUp12Month' });
  }

  return suggestions.slice(0, 3);
}
