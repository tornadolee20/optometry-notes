/**
 * Vision Knowledge OS - RAG 檢索與 AI 安全問答引擎
 * 遵循規格書 11.2 (AI 問答流程) 與 11.3 (AI 安全硬規則)
 */

import { Question, Research, Case, Service, Person } from '../content-model/src/types';
import { questionDegreeVsAxial, topicAxialLength, personUncleGlasses } from '../content-model/src/demo/axial-length-slice';

export interface RAGSearchQuery {
  user_input: string; // 使用者輸入的自然語言問題
  audience_id?: string;
  journey_id?: string;
}

export interface RAGSearchResponse {
  intent: {
    matched_topic?: string;
    matched_question_id?: string;
    confidence: number;
  };
  direct_answer_30s: string; // 目鏡大叔 30 秒直接答案
  layered_sources: {
    research_facts: string[]; // 1. 研究事實 (Research)
    clinical_observations: string[]; // 2. 臨床觀察 (Case)
    service_cta?: string; // 3. 門市與追蹤服務 (Service)
  };
  safety_warnings: string[];
  suggested_next_step: string;
  source_citations: string[];
}

/**
 * 執行 Vision Knowledge OS 專屬 RAG 意圖匹配與安全回答生成
 */
export function processRAGQuery(query: RAGSearchQuery): RAGSearchResponse {
  const text = query.user_input;
  
  // 1. 意圖辨識 (Intent Recognition)
  let matchedQuestion: Question = questionDegreeVsAxial;
  let confidence = 0.92;

  if (text.includes("眼軸") || text.includes("度數")) {
    matchedQuestion = questionDegreeVsAxial;
  }

  // 2. 分離「研究事實」、「臨床觀察」與「商業服務」 (Strict Source Separation)
  const researchFacts = [
    "【研究事實】光學眼軸長度 (Axial Length) 代表眼球前後光學軸線距離。學齡兒童正常年化成長率約為 0.10mm~0.15mm。",
    "【研究限制】不同廠牌之眼軸測量儀器（如光學干涉儀與超音波）間之絕對數值無法直接扣減比較。",
  ];

  const clinicalObservations = [
    "【目鏡大叔臨床觀察】門市常見戴角膜塑型片或點阿托品的學童，驗光度數看似穩定，但眼軸每年仍增長 > 0.3mm。此現象多與戶外活動不足或近距離用眼過度有關。",
  ];

  const serviceCTA = "【下一步服務】建議帶著兩次眼軸報告至自己的驗光所門市，由目鏡大叔進行完整雙眼視覺與近視控制追蹤評估。";

  // 3. 注入 AI 安全硬規則 (AI Safety Guardrails)
  const safetyWarnings = [
    "🛡️ 本回答由 Vision Knowledge OS 審核知識庫生成，非替代醫師之醫療診斷。",
    "🛡️ 嚴禁將群體研究平均值直接認定為個人必然結果。",
    "🛡️ 不得僅憑單次驗光度數或單一眼軸數字判定近視控制成功與否。",
  ];

  return {
    intent: {
      matched_topic: topicAxialLength.name,
      matched_question_id: matchedQuestion.id,
      confidence: confidence,
    },
    direct_answer_30s: `💡 目鏡大叔 30 秒解答：${matchedQuestion.short_answer}`,
    layered_sources: {
      research_facts: researchFacts,
      clinical_observations: clinicalObservations,
      service_cta: serviceCTA,
    },
    safety_warnings: safetyWarnings,
    suggested_next_step: "使用「兒童視力與眼軸追蹤整理器 v1」計算兩次眼軸之年化成長率。",
    source_citations: [
      `審核專家：${personUncleGlasses.display_name} (${personUncleGlasses.credentials[0]})`,
      `引用知識物件：${matchedQuestion.question} (ID: ${matchedQuestion.id})`,
      `主題類別：${topicAxialLength.name}`,
    ],
  };
}
