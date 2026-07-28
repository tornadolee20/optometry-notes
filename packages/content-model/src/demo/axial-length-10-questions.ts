/**
 * Vision Knowledge OS - 「眼軸與度數」示範主題 10 大核心自然語言提問庫
 * 遵循規格書 14.2 節全量定義
 */

import { Question } from '../types';

export const axialLength10Questions: Question[] = [
  {
    id: 'q1_degree_stable_axial_growth',
    question: '孩子度數沒增加，眼軸為什麼還會變長？',
    slug: 'degree-stable-axial-growth',
    short_answer: '度數與眼軸反映的是不同面向。睫狀肌調節力、點散瞳劑放鬆或角膜曲率微調，都可能暫時掩蓋度數變化。但眼軸長度是眼球實體前後徑，長大就縮不回去，這才是看守近視控制的黃金指標。',
    topics: ['topic_axial_length'],
    audiences: ['aud_parents_myopia'],
    journeys: ['journey_report_reading'],
    risk_level: 'medium',
    updated_at: '2026-07-24'
  },
  {
    id: 'q2_annual_axial_growth_rate',
    question: '眼軸一年增加多少算快？',
    slug: 'annual-axial-growth-rate',
    short_answer: '學齡兒童正常生理性眼軸成長每年約為 0.10mm~0.15mm。若一年增長超過 0.2mm~0.3mm，代表眼軸過速拉長，近視控制方案需要進行檢視或調整。',
    topics: ['topic_axial_length'],
    audiences: ['aud_parents_myopia'],
    journeys: ['journey_myopia_control'],
    risk_level: 'medium',
    updated_at: '2026-07-24'
  },
  {
    id: 'q3_axial_stable_degree_growth',
    question: '眼軸沒變，度數為什麼增加？',
    slug: 'axial-stable-degree-growth',
    short_answer: '多半與眼睛「假性近視」或「調節痙攣」有關。當睫狀肌太緊張過度用力時，電腦驗光儀會量出較高的近視度數，但眼軸骨架實際上並未拉長。',
    topics: ['topic_axial_length'],
    audiences: ['aud_parents_myopia'],
    journeys: ['journey_report_reading'],
    risk_level: 'low',
    updated_at: '2026-07-24'
  },
  {
    id: 'q4_different_instruments_comparison',
    question: '不同儀器測的眼軸可以直接比較嗎？',
    slug: 'different-instruments-comparison',
    short_answer: '不可以直接互相扣減！不同廠牌的光學干涉儀或超音波測量儀有不同的系統校正值，跨診所或跨儀器比較時，應看趨勢而非單次相減。',
    topics: ['topic_axial_length'],
    audiences: ['aud_parents_myopia'],
    journeys: ['journey_report_reading'],
    risk_level: 'low',
    updated_at: '2026-07-24'
  },
  {
    id: 'q5_single_measurement_accuracy',
    question: '單次眼軸測量準嗎？',
    slug: 'single-measurement-accuracy',
    short_answer: '單次測量容易受到學童合作度、淚液品質或眼球固視目標偏移影響。臨床上通常會取多次高重覆性平滑曲線，並觀察半期以上的時序變化。',
    topics: ['topic_axial_length'],
    audiences: ['aud_parents_myopia'],
    journeys: ['journey_report_reading'],
    risk_level: 'low',
    updated_at: '2026-07-24'
  },
  {
    id: 'q6_orthok_axial_tracking',
    question: '為什麼角膜塑形追蹤常看眼軸？',
    slug: 'orthok-axial-tracking',
    short_answer: '因為角膜塑形片會改變角膜弧度，配戴期間電腦驗光度數已經無法反映真實眼睛狀態。唯有眼軸長度不受塑型壓平影響，能精準呈現控制效益。',
    topics: ['topic_axial_length'],
    audiences: ['aud_parents_myopia'],
    journeys: ['journey_myopia_control'],
    risk_level: 'low',
    updated_at: '2026-07-24'
  },
  {
    id: 'q7_ser_refraction_status',
    question: 'SER（等價球面度數）能代表孩子完整的屈光狀態嗎？',
    slug: 'ser-refraction-status',
    short_answer: '不能。SER 是將「近視/遠視」加上「散光的一半」算的平均值，會蓋掉高度散光的細節。必須結合散光軸度與雙眼視覺調節力評估。',
    topics: ['topic_axial_length'],
    audiences: ['aud_parents_myopia'],
    journeys: ['journey_report_reading'],
    risk_level: 'medium',
    updated_at: '2026-07-24'
  },
  {
    id: 'q8_axial_not_only_metric',
    question: '為什麼不能只看眼軸判定近視控制成效？',
    slug: 'axial-not-only-metric',
    short_answer: '因為孩子的用眼習慣、雙眼視覺融像功能、瞳孔大小與角膜周邊離焦量，都會影響控制成效。眼軸是最佳成績單，但不是唯一的考題。',
    topics: ['topic_axial_length'],
    audiences: ['aud_parents_myopia'],
    journeys: ['journey_myopia_control'],
    risk_level: 'medium',
    updated_at: '2026-07-24'
  },
  {
    id: 'q9_followup_frequency',
    question: '多久應追蹤一次眼軸與視力？',
    slug: 'followup-frequency',
    short_answer: '近視控制期間，建議每 3 個月至 6 個月定期追蹤一次眼軸與屈光度數，以及時檢視控制方案的有效性。',
    topics: ['topic_axial_length'],
    audiences: ['aud_parents_myopia'],
    journeys: ['journey_myopia_control'],
    risk_level: 'low',
    updated_at: '2026-07-24'
  },
  {
    id: 'q10_report_reading_check_items',
    question: '看報告時還要一起確認哪些資料？',
    slug: 'report-reading-check-items',
    short_answer: '除了眼軸與度數，還要確認：1. 是否點過散瞳劑；2. 戶外活動時間；3. 近距離閱讀距離；4. 雙眼視覺融像與調節靈敏度。',
    topics: ['topic_axial_length'],
    audiences: ['aud_parents_myopia'],
    journeys: ['journey_report_reading'],
    risk_level: 'low',
    updated_at: '2026-07-24'
  }
];
