/**
 * Report-specific translations for components that need localized text
 * outside of the main translation file
 */

import { Language } from '../translations';

type TranslationRecord = Record<Language, string>;

// Helper function to get translation based on language
export const getT = (language: Language) => (zhTW: string, zhCN: string, en: string) => {
  if (language === 'en') return en;
  if (language === 'zh-CN') return zhCN;
  return zhTW;
};

// Follow-up schedule translations
export const followUpTranslations = {
  week4: { 'zh-TW': '第 4 週', 'zh-CN': '第 4 周', 'en': 'Week 4' } as TranslationRecord,
  week8: { 'zh-TW': '第 8 週', 'zh-CN': '第 8 周', 'en': 'Week 8' } as TranslationRecord,
  week12: { 'zh-TW': '第 12 週', 'zh-CN': '第 12 周', 'en': 'Week 12' } as TranslationRecord,
  week24: { 'zh-TW': '第 24 週', 'zh-CN': '第 24 周', 'en': 'Week 24' } as TranslationRecord,
  month3: { 'zh-TW': '3 個月', 'zh-CN': '3 个月', 'en': '3 Months' } as TranslationRecord,
  year1: { 'zh-TW': '1 年', 'zh-CN': '1 年', 'en': '1 Year' } as TranslationRecord,
  
  // Schedule descriptions
  initialEvaluation: { 'zh-TW': '初期評估・確認訓練反應', 'zh-CN': '初期评估・确认训练反应', 'en': 'Initial evaluation - Confirm training response' } as TranslationRecord,
  midEvaluation: { 'zh-TW': '中期評估・調整訓練強度', 'zh-CN': '中期评估・调整训练强度', 'en': 'Mid-term evaluation - Adjust training intensity' } as TranslationRecord,
  stageComplete: { 'zh-TW': '階段完成・評估是否需延長', 'zh-CN': '阶段完成・评估是否需延长', 'en': 'Stage complete - Evaluate if extension needed' } as TranslationRecord,
  finalEvaluation: { 'zh-TW': '最終評估・確認穩定性', 'zh-CN': '最终评估・确认稳定性', 'en': 'Final evaluation - Confirm stability' } as TranslationRecord,
  routineCheckup: { 'zh-TW': '常規追蹤檢查', 'zh-CN': '常规追踪检查', 'en': 'Routine follow-up checkup' } as TranslationRecord,
  annualCheckup: { 'zh-TW': '年度完整檢查', 'zh-CN': '年度完整检查', 'en': 'Annual comprehensive checkup' } as TranslationRecord,
  
  // Section titles
  recommendedSchedule: { 'zh-TW': '建議回診時間表', 'zh-CN': '建议回诊时间表', 'en': 'Recommended Follow-up Schedule' } as TranslationRecord,
  detailedTrainingPlan: { 'zh-TW': '詳細訓練計畫', 'zh-CN': '详细训练计划', 'en': 'Detailed Training Plan' } as TranslationRecord,
  downloadManual: { 'zh-TW': '下載完整訓練手冊 PDF', 'zh-CN': '下载完整训练手册 PDF', 'en': 'Download Complete Training Manual PDF' } as TranslationRecord,
  printPlan: { 'zh-TW': '列印訓練計畫', 'zh-CN': '列印训练计划', 'en': 'Print Training Plan' } as TranslationRecord,
  downloadStarted: { 'zh-TW': '下載已開始', 'zh-CN': '下载已开始', 'en': 'Download Started' } as TranslationRecord,
  generatingPdf: { 'zh-TW': '訓練手冊 PDF 正在生成...', 'zh-CN': '训练手册 PDF 正在生成...', 'en': 'Generating training manual PDF...' } as TranslationRecord,
  treatmentMilestones: { 'zh-TW': '預期治療里程碑', 'zh-CN': '预期治疗里程碑', 'en': 'Expected Treatment Milestones' } as TranslationRecord,
  clinicalProgress: { 'zh-TW': '基於臨床研究的預期進度', 'zh-CN': '基于临床研究的预期进度', 'en': 'Expected progress based on clinical research' } as TranslationRecord,
  homeTrainingReminders: { 'zh-TW': '居家訓練提醒', 'zh-CN': '居家训练提醒', 'en': 'Home Training Reminders' } as TranslationRecord,
  dailyTrainingTime: { 'zh-TW': '每日訓練時間', 'zh-CN': '每日训练时间', 'en': 'Daily Training Time' } as TranslationRecord,
  dailyTrainingDesc: { 'zh-TW': '建議每日 15-20 分鐘，分 2-3 次進行', 'zh-CN': '建议每日 15-20 分钟，分 2-3 次进行', 'en': 'Recommended 15-20 minutes daily, divided into 2-3 sessions' } as TranslationRecord,
  trainingLog: { 'zh-TW': '訓練記錄', 'zh-CN': '训练记录', 'en': 'Training Log' } as TranslationRecord,
  trainingLogDesc: { 'zh-TW': '建議使用訓練日誌記錄每次訓練時間和感受', 'zh-CN': '建议使用训练日志记录每次训练时间和感受', 'en': 'Recommend using a training log to record each session time and feelings' } as TranslationRecord,
  warningSigns: { 'zh-TW': '警示徵兆', 'zh-CN': '警示征兆', 'en': 'Warning Signs' } as TranslationRecord,
  warningSignsDesc: { 'zh-TW': '出現以下情況請提前回診', 'zh-CN': '出现以下情况请提前回诊', 'en': 'Please return for consultation if the following occurs' } as TranslationRecord,
};

// Empathy opener translations
export const empathyTranslations = {
  cissHigh: { 
    'zh-TW': '長時間使用手機或電腦後，您是否常感到眼睛痠澀、頭脹？', 
    'zh-CN': '长时间使用手机或电脑后，您是否常感到眼睛酸涩、头胀？', 
    'en': 'After prolonged phone or computer use, do you often feel eye strain or head pressure?' 
  } as TranslationRecord,
  diagCI: { 
    'zh-TW': '閱讀或看手機時，您是否常需要休息，才能繼續看下去？', 
    'zh-CN': '阅读或看手机时，您是否常需要休息，才能继续看下去？', 
    'en': 'When reading or using your phone, do you often need to rest before continuing?' 
  } as TranslationRecord,
  diagCE: { 
    'zh-TW': '看近距離的東西時，眉心是否會感到痠痛或緊繃？', 
    'zh-CN': '看近距离的东西时，眉心是否会感到酸痛或紧绷？', 
    'en': 'When looking at near objects, do you feel aching or tension between your eyebrows?' 
  } as TranslationRecord,
  diagAI: { 
    'zh-TW': '看近的小字時，您是否需要特別用力才能看清楚？', 
    'zh-CN': '看近的小字时，您是否需要特别用力才能看清楚？', 
    'en': 'When reading small text up close, do you need to make extra effort to see clearly?' 
  } as TranslationRecord,
  npcHigh: { 
    'zh-TW': '您是否在閱讀時，會不自覺地把書拿遠一些？', 
    'zh-CN': '您是否在阅读时，会不自觉地把书拿远一些？', 
    'en': 'When reading, do you unconsciously hold the book farther away?' 
  } as TranslationRecord,
  scoreHigh: { 
    'zh-TW': '您的雙眼協調狀況良好，讓我們來看看詳細的分析結果。', 
    'zh-CN': '您的双眼协调状况良好，让我们来看看详细的分析结果。', 
    'en': 'Your binocular coordination is good. Let\'s look at the detailed analysis results.' 
  } as TranslationRecord,
  scoreMedium: { 
    'zh-TW': '我們發現了一些可以改善的地方，一起來看看如何讓眼睛更舒服。', 
    'zh-CN': '我们发现了一些可以改善的地方，一起来看看如何让眼睛更舒服。', 
    'en': 'We found some areas for improvement. Let\'s see how to make your eyes more comfortable.' 
  } as TranslationRecord,
  scoreLow: { 
    'zh-TW': '您的眼睛可能一直在努力工作，我們來看看有什麼方法可以幫助它們。', 
    'zh-CN': '您的眼睛可能一直在努力工作，我们来看看有什么方法可以帮助它们。', 
    'en': 'Your eyes may have been working hard. Let\'s see what methods can help them.' 
  } as TranslationRecord,
};

// Warning signs translations
export const warningSignTranslations = {
  blurryReading: { 'zh-TW': '閱讀時視力模糊加重', 'zh-CN': '阅读时视力模糊加重', 'en': 'Increased blurry vision while reading' } as TranslationRecord,
  diplopia: { 'zh-TW': '複視頻率增加', 'zh-CN': '复视频率增加', 'en': 'Increased frequency of double vision' } as TranslationRecord,
  headache: { 'zh-TW': '頭痛頻率增加', 'zh-CN': '头痛频率增加', 'en': 'Increased frequency of headaches' } as TranslationRecord,
  readingAvoidance: { 'zh-TW': '閱讀迴避行為', 'zh-CN': '阅读回避行为', 'en': 'Reading avoidance behavior' } as TranslationRecord,
  nearWorkDiscomfort: { 'zh-TW': '近距離工作不適', 'zh-CN': '近距离工作不适', 'en': 'Discomfort during near work' } as TranslationRecord,
  eyeFatigue: { 'zh-TW': '眼睛疲勞加重', 'zh-CN': '眼睛疲劳加重', 'en': 'Increased eye fatigue' } as TranslationRecord,
  nearDiplopia: { 'zh-TW': '近距離複視', 'zh-CN': '近距离复视', 'en': 'Double vision at near' } as TranslationRecord,
  newDiplopia: { 'zh-TW': '任何新發複視', 'zh-CN': '任何新发复视', 'en': 'Any new double vision' } as TranslationRecord,
  suddenVisionChange: { 'zh-TW': '視力突然改變', 'zh-CN': '视力突然改变', 'en': 'Sudden vision change' } as TranslationRecord,
  persistentHeadache: { 'zh-TW': '持續性頭痛', 'zh-CN': '持续性头痛', 'en': 'Persistent headache' } as TranslationRecord,
};

// Milestone translations for CI/Pseudo-CI
export const ciMilestoneTranslations = {
  week4Title: { 'zh-TW': '建立生理複視認知', 'zh-CN': '建立生理复视认知', 'en': 'Establish physiological diplopia awareness' } as TranslationRecord,
  week4Desc: { 'zh-TW': '患者能正確識別 Brock String 複視', 'zh-CN': '患者能正确识别 Brock String 复视', 'en': 'Patient can correctly identify Brock String diplopia' } as TranslationRecord,
  week8Title: { 'zh-TW': 'NPC 顯著改善', 'zh-CN': 'NPC 显著改善', 'en': 'Significant NPC improvement' } as TranslationRecord,
  week8Desc: { 'zh-TW': 'NPC 達到或接近正常範圍', 'zh-CN': 'NPC 达到或接近正常范围', 'en': 'NPC reaches or approaches normal range' } as TranslationRecord,
  week12Title: { 'zh-TW': '症狀明顯緩解', 'zh-CN': '症状明显缓解', 'en': 'Significant symptom relief' } as TranslationRecord,
  week12Desc: { 'zh-TW': 'CISS 分數下降，日常症狀減少', 'zh-CN': 'CISS 分数下降，日常症状减少', 'en': 'CISS score decreased, daily symptoms reduced' } as TranslationRecord,
  week24Title: { 'zh-TW': '功能穩定', 'zh-CN': '功能稳定', 'en': 'Function stabilized' } as TranslationRecord,
  week24Desc: { 'zh-TW': '維持改善效果，無明顯復發', 'zh-CN': '维持改善效果，无明显复发', 'en': 'Maintain improvement, no significant relapse' } as TranslationRecord,
};

// CE milestone translations
export const ceMilestoneTranslations = {
  week4Title: { 'zh-TW': '鏡片適應確認', 'zh-CN': '镜片适应确认', 'en': 'Lens adaptation confirmed' } as TranslationRecord,
  week4Desc: { 'zh-TW': '確認 ADD 鏡片適應情況', 'zh-CN': '确认 ADD 镜片适应情况', 'en': 'Confirm ADD lens adaptation' } as TranslationRecord,
  week12Title: { 'zh-TW': '功能評估', 'zh-CN': '功能评估', 'en': 'Function evaluation' } as TranslationRecord,
  week12Desc: { 'zh-TW': '評估是否需調整處方', 'zh-CN': '评估是否需调整处方', 'en': 'Evaluate if prescription adjustment needed' } as TranslationRecord,
};

// Default milestone translations
export const defaultMilestoneTranslations = {
  routineFollowUp: { 'zh-TW': '常規追蹤', 'zh-CN': '常规追踪', 'en': 'Routine follow-up' } as TranslationRecord,
  confirmStability: { 'zh-TW': '確認雙眼視覺功能穩定', 'zh-CN': '确认双眼视觉功能稳定', 'en': 'Confirm binocular vision function stability' } as TranslationRecord,
};

// Helper to get translation from record
export const tr = (record: TranslationRecord, language: Language): string => {
  return record[language] || record['zh-TW'];
};
