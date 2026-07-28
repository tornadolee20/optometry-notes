/**
 * Topic 2: 「角膜塑型與離焦鏡片」知識切片與 Questions 庫
 */

import { Topic, Question } from '../types';

export const topicOrthoKDefocus: Topic = {
  id: 'topic_orthok_defocus',
  name: '角膜塑型與離焦鏡片',
  slug: 'orthok-and-defocus-lenses',
  aliases: ['角膜塑形', 'Ortho-K', '離焦鏡片', '周邊離焦'],
  definition_short: '透過光學周邊近視離焦原理，在視網膜周邊形成近視性離焦信號，進而延緩眼軸過速拉長的光學控制方式。',
  audiences: ['aud_parents_myopia'],
  journeys: ['journey_control_options'],
  hero_message: '光學離焦的原理不是改變眼睛，而是透過光線焦點引導眼睛健康成長。',
  persona_note: '角膜塑形片與離焦鏡片各有適合的生活情境，最重要的是孩子的配戴習慣與戶外配合度。',
  status: 'published',
  reviewed_by: 'person_li_xiyan',
  updated_at: '2026-07-24'
};

export const orthokDefocusQuestions: Question[] = [
  {
    id: 'q_orthok_vs_defocus',
    question: '角膜塑形片和離焦鏡片哪一個控制效果比較好？',
    slug: 'orthok-vs-defocus-lenses-effect',
    short_answer: '大型臨床研究顯示兩者的控制效益在統計上相近。關鍵在於個案配戴的合規性（每天配戴時間）、角膜條件與近距離用眼習慣。沒有絕對好壞，只有適不適合。',
    topics: ['topic_orthok_defocus'],
    audiences: ['aud_parents_myopia'],
    journeys: ['journey_control_options'],
    risk_level: 'low',
    updated_at: '2026-07-24'
  },
  {
    id: 'q_orthok_cleaning_care',
    question: '戴角膜塑型片最重要的清潔注意事項是什麼？',
    slug: 'orthok-cleaning-care-points',
    short_answer: '最關鍵的是「洗手、去蛋白與生理食鹽水沖洗」，絕對不能使用自來水沖洗鏡片以避免棘阿米巴角膜炎風險。',
    topics: ['topic_orthok_defocus'],
    audiences: ['aud_parents_myopia'],
    journeys: ['journey_control_options'],
    risk_level: 'high_consult_doctor',
    updated_at: '2026-07-24'
  }
];
