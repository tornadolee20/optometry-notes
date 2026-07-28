/**
 * Vertical Slice 1: 「眼軸與度數」示範主題測試資料庫
 */

import { Topic, Question, Case, Tool, Person } from '../types';

export const personUncleGlasses: Person = {
  id: 'person_li_xiyan',
  name: '李錫彥',
  display_name: '目鏡大叔',
  role: ['驗光師', '自己的眼鏡負責人', '自己的驗光所負責人'],
  credentials: ['臺灣視光視力保健學會常務理事', '國家高考合格驗光師'],
  organization: '自己的眼鏡 / 自己的驗光所',
  bio_short: '專業驗光師，擅長用暖心電影感與生活比喻解構雙眼視覺與近視控制。',
  expertise_topics: ['兒童近視追蹤', '眼軸長度分析', '角膜塑型與離焦鏡片', '雙眼視覺功能'],
  updated_at: '2026-07-24',
};

export const topicAxialLength: Topic = {
  id: 'topic_axial_length',
  name: '眼軸長度',
  slug: 'axial-length',
  aliases: ['眼軸', 'Axial Length', 'AL'],
  definition_short: '眼球前後徑的長度。在兒童近視控制中，眼軸生長速度是比眼科度數更精準的黃金指標。',
  definition_long: '眼軸代表眼球光學中心到視網膜的實體距離。正常學齡兒童眼軸每年生理性微幅成長約 0.1mm。若一年成長超過 0.2mm~0.3mm，代表眼軸過速拉長，近視風險大增。',
  audiences: ['aud_parents_myopia'],
  journeys: ['journey_myopia_control', 'journey_report_reading'],
  hero_message: '度數只是眼球屈光的結果，眼軸才是看守眼睛健康的實體防線。',
  persona_note: '許多家長以為度數沒變就放鬆警惕，大叔提醒你：每年定期的眼軸測量，才是保護未來視網膜的關鍵。',
  status: 'published',
  reviewed_by: 'person_li_xiyan',
  updated_at: '2026-07-24',
};

export const questionDegreeVsAxial: Question = {
  id: 'question_degree_stable_axial_growth',
  question: '孩子度數沒增加，眼軸為什麼還會變長？',
  slug: 'degree-stable-axial-growth',
  short_answer: '度數與眼軸反映的是不同面向。睫狀肌調節力、角膜曲率或點散瞳劑都可能暫時掩蓋度數變化，但眼軸長度不會騙人。',
  long_answer: `許多家長在近視控制過程中常感到困惑：為什麼驗光度數維持在 200 度沒變，但光學眼軸儀量出來卻比半年前長了 0.2mm？

原因主要有三點：
1. **水晶體與角膜的代償機制**：兒童生長發育期，角膜與水晶體的屈光度可能稍微變平緩，抵消了一部分眼軸拉長所產生的度數。
2. **藥物或調節張力的影響**：使用低濃度阿托品（Atropine）時，睫狀肌放鬆會讓點藥驗光度數看起來「很漂亮」，但物理眼軸可能仍在慢慢伸長。
3. **測量時間與散瞳狀態**：早晚的水分變化與是否散瞳驗光，也會影響電腦驗光儀的數據判讀。`,
  emotional_context: '家長常因度數沒有增加而以為近視控制絕對成功，一旦得知眼軸變長易產生嚴重焦慮與挫折感。',
  topics: ['topic_axial_length'],
  audiences: ['aud_parents_myopia'],
  journeys: ['journey_report_reading'],
  risk_level: 'medium',
  cta_type: 'tool',
  updated_at: '2026-07-24',
};

export const toolAxialTracker: Tool = {
  id: 'tool_child_vision_tracker_v1',
  name: '兒童視力與眼軸追蹤整理器 v1',
  slug: 'child-vision-tracker',
  description: '輸入孩子的驗光度數與眼軸測量紀錄，自動整理時序曲線並提示哪些條件具可比性。',
  tool_type: 'tracker',
  input_schema: {
    type: 'object',
    properties: {
      date: { type: 'string', format: 'date' },
      sphere_od: { type: 'number' },
      cylinder_od: { type: 'number' },
      axial_length_od: { type: 'number' },
      axial_length_os: { type: 'number' },
      is_dilated: { type: 'boolean' },
      instrument_name: { type: 'string' },
    },
  },
  output_schema: {
    type: 'object',
    properties: {
      annualized_growth_rate: { type: 'number' },
      comparability_warning: { type: 'string' },
      suggested_questions_for_doctor: { type: 'array', items: { type: 'string' } },
    },
  },
  limitations: [
    '本工具僅作為時序數據整理與諮詢準備，不做任何醫療診斷或療效保證。',
    '不同眼軸測量儀器（如 IOL Master vs Myopia Master）之絕對數值不可直接互相扣減。',
  ],
  risk_notice: '若孩子單眼眼軸一年增長超過 0.3mm，建議盡速至眼科醫師門市進行完整雙眼視覺評估。',
  topics: ['topic_axial_length'],
  questions: ['question_degree_stable_axial_growth'],
  audiences: ['aud_parents_myopia'],
  journeys: ['journey_report_reading'],
  requires_login: false,
  stores_user_data: false,
  version: '1.0.0',
  updated_at: '2026-07-24',
};

export const caseAxialMismatch: Case = {
  id: 'case_axial_mismatch_story',
  title: '【臨床故事】小明的「隱形眼軸成長」：當度數沒變，我們發現了什麼？',
  summary: '10 歲的小明戴角膜塑型片已經一年，驗光度數完美控制在原點，但追蹤眼軸卻發現一年長了 0.35mm。',
  situation: '小明媽媽在門市高興地說孩子度數一年都沒有增加，但拿出隨身紀錄的眼軸報告時，發現右眼軸從 24.1mm 成長到 24.45mm。',
  initial_belief: '家長以為只要不用換鏡片度數，孩子眼睛的發育就完全處於停滯的安全狀態。',
  observations: '大叔細看報告發現：小明過去半年戶外活動量極少，每日近距離看平板超過 3 小時，且塑型片配戴時間過短致使周邊離焦效果未達最佳化。',
  decision_process: '大叔陪媽媽重新拆解生活作息，建議與主治眼科醫師討論調整塑型片設計或搭配低濃度藥水，並建立每日戶外 2 小時習慣。',
  outcome: '經過半年的作息與療程調整，小明隨後的半年眼軸成長降至 0.08mm 的正常生理範圍。',
  lesson: '度數是表象，眼軸是骨架。追蹤近視控制，永遠要看眼軸這張「成績單」。',
  topics: ['topic_axial_length'],
  questions: ['question_degree_stable_axial_growth'],
  audiences: ['aud_parents_myopia'],
  privacy_level: 'fictionalized_composite',
  consent_status: true,
  fictionalized: true,
};
