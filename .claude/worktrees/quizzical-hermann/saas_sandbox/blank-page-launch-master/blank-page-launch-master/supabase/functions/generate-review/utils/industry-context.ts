// 行業上下文模組 - 為不同行業提供專屬的評論生成上下文

export interface IndustryContext {
  category: string;
  description: string;
  experiencePoints: string[];
  vocabularyPatterns: string[];
  evaluationAspects: string[];
  commonSentences: string[];
  complianceReminders: string[];
}

// 行業類別映射
const INDUSTRY_CATEGORY_MAP: Record<string, string> = {
  // 餐飲業
  '餐廳': 'food_beverage',
  '飲料店': 'food_beverage', 
  '咖啡廳': 'food_beverage',
  '小吃店': 'food_beverage',
  '火鍋店': 'food_beverage',
  '燒烤店': 'food_beverage',
  '甜點店': 'food_beverage',
  '麵包店': 'food_beverage',
  '茶飲': 'food_beverage',
  '早餐店': 'food_beverage',
  '便當店': 'food_beverage',
  
  // 零售業
  '服飾店': 'retail',
  '鞋店': 'retail',
  '書店': 'retail',
  '3C賣場': 'retail',
  '家具店': 'retail',
  '花店': 'retail',
  '超市': 'retail',
  '便利商店': 'retail',
  '藥局': 'retail',
  '五金行': 'retail',
  
  // 美容美髮
  '美髮店': 'salon_beauty',
  '理髮店': 'salon_beauty',
  '美容院': 'salon_beauty',
  '按摩店': 'salon_beauty',
  '美甲店': 'salon_beauty',
  'SPA': 'salon_beauty',
  
  // 醫療健康
  '診所': 'medical_health',
  '牙科': 'medical_health',
  '中醫診所': 'medical_health',
  '復健科': 'medical_health',
  '動物醫院': 'medical_health',
  
  // 服務業
  '洗車店': 'service',
  '修車廠': 'service',
  '清潔公司': 'service',
  '搬家公司': 'service',
  '快遞': 'service',
  
  // 娛樂休閒
  'KTV': 'entertainment',
  '電影院': 'entertainment',
  '健身房': 'entertainment',
  '撞球館': 'entertainment',
  
  // 教育
  '補習班': 'education',
  '幼兒園': 'education',
  '才藝班': 'education',
  '駕訓班': 'education',
  
  // 眼鏡行（原有）
  '眼鏡行': 'optical',
  '眼科': 'optical',
  
  // 法律專業服務
  '律師': 'legal_professional',
  '律師事務所': 'legal_professional',
  '法律事務所': 'legal_professional',
  '法務': 'legal_professional',
  '代書': 'legal_professional',
  '地政士': 'legal_professional',
  '記帳士': 'legal_professional',
  '會計師': 'legal_professional',
  '會計事務所': 'legal_professional',
  
  // 住宿旅遊
  '民宿': 'accommodation_tourism',
  '飯店': 'accommodation_tourism',
  '旅館': 'accommodation_tourism',
  '大飯店': 'accommodation_tourism',
  '青年旅館': 'accommodation_tourism',
  '度假村': 'accommodation_tourism',
  '渡假村': 'accommodation_tourism',
  '山莊': 'accommodation_tourism',
  '客棧': 'accommodation_tourism',
  '旅舍': 'accommodation_tourism',
  
  // 寵物服務
  '寵物店': 'pet_services',
  '寵物美容': 'pet_services',
  '寵物美容院': 'pet_services',
  '動物醫院': 'pet_services',
  '獸醫': 'pet_services',
  '寵物旅館': 'pet_services',
  '寵物保健': 'pet_services',
  '寵物訓練': 'pet_services'
};

// 行業上下文定義
const INDUSTRY_CONTEXTS: Record<string, IndustryContext> = {
  food_beverage: {
    category: '餐飲業',
    description: '重視食物品質、服務態度、用餐環境與整體體驗',
    experiencePoints: [
      '食物味道與品質',
      '服務人員態度',
      '用餐環境氛圍',
      '價格性價比',
      '等待時間',
      '餐點份量',
      '衛生環境',
      '停車便利性'
    ],
    vocabularyPatterns: [
      '味道層次豐富',
      '食材新鮮',
      '調味恰到好處',
      '口感豐富',
      '香氣撲鼻',
      '料理精緻',
      '服務親切',
      '環境舒適',
      '氛圍溫馨'
    ],
    evaluationAspects: [
      '餐點品質：新鮮度、味道、溫度、擺盤',
      '服務品質：點餐效率、送餐速度、服務態度',
      '環境品質：清潔度、裝潢、座位舒適度、音樂',
      '價值感受：份量、價格合理性、整體滿意度'
    ],
    commonSentences: [
      '點了招牌菜，味道真的很棒',
      '服務生很親切，會主動介紹菜色',
      '環境很舒適，適合和朋友聚餐',
      '價格合理，CP值很高',
      '食材很新鮮，可以吃得出用心'
    ],
    complianceReminders: [
      '不得提及具體價格數字',
      '避免過度比較其他店家',
      '描述個人真實用餐體驗',
      '不涉及食品安全指控'
    ]
  },

  retail: {
    category: '零售業',
    description: '專注商品品質、選擇多樣性、服務專業度與購物體驗',
    experiencePoints: [
      '商品品質與選擇',
      '價格競爭力', 
      '服務專業度',
      '店面環境',
      '結帳流程',
      '售後服務',
      '位置便利性',
      '營業時間'
    ],
    vocabularyPatterns: [
      '商品齊全',
      '品質優良',
      '選擇豐富',
      '價格實惠',
      '服務專業',
      '介紹詳細',
      '購物愉快',
      '品牌多元',
      '陳列整齊'
    ],
    evaluationAspects: [
      '商品品質：款式、材質、功能性、保固',
      '服務品質：專業知識、購買建議、態度',
      '購物環境：店面整潔、商品陳列、試用空間',
      '消費體驗：價格透明、結帳便利、售後服務'
    ],
    commonSentences: [
      '商品選擇很豐富，品質也不錯',
      '店員很專業，會仔細介紹產品',
      '店面環境整潔，商品陳列得很好',
      '價格合理，還有優惠活動',
      '售後服務很好，有問題都會協助處理'
    ],
    complianceReminders: [
      '不得提及具體折扣或價格',
      '避免直接比較競爭對手',
      '描述實際購物體驗',
      '不涉及商品瑕疵指控'
    ]
  },

  salon_beauty: {
    category: '美容美髮業',
    description: '強調技術專業、服務細緻、環境舒適與成果滿意度',
    experiencePoints: [
      '技術專業度',
      '服務態度',
      '環境衛生',
      '預約便利性',
      '價格合理性',
      '產品品質',
      '隱私保護',
      '成果滿意度'
    ],
    vocabularyPatterns: [
      '技術精湛',
      '手法專業',
      '服務細心',
      '環境清潔',
      '氛圍放鬆',
      '產品優質',
      '效果明顯',
      '值得信賴',
      '用心服務'
    ],
    evaluationAspects: [
      '技術水準：專業技巧、經驗豐富、創新能力',
      '服務品質：諮詢仔細、態度親切、時間掌控',
      '環境品質：清潔衛生、設備新穎、氛圍舒適',
      '成果滿意：符合期待、持久度、整體效果'
    ],
    commonSentences: [
      '設計師很專業，會仔細諮詢需求',
      '技術很好，成果超出預期',
      '環境很舒適，讓人很放鬆',
      '服務很細心，過程很愉快',
      '用的產品品質很好，效果持久'
    ],
    complianceReminders: [
      '不得提及具體價格或療程費用',
      '避免誇大美容效果',
      '描述個人真實體驗',
      '不涉及醫療美容宣稱'
    ]
  },

  medical_health: {
    category: '醫療健康業',
    description: '重視專業醫療水準、服務品質、環境整潔與治療效果',
    experiencePoints: [
      '醫療專業度',
      '服務態度',
      '診療環境',
      '等候時間',
      '收費透明',
      '設備先進性',
      '隱私保護',
      '治療效果'
    ],
    vocabularyPatterns: [
      '醫師專業',
      '診斷仔細',
      '態度親切',
      '環境整潔',
      '設備先進',
      '服務周到',
      '説明清楚',
      '值得信賴',
      '照護用心'
    ],
    evaluationAspects: [
      '專業水準：診斷準確、經驗豐富、持續學習',
      '服務品質：耐心說明、態度和藹、時間充足',
      '環境品質：整潔衛生、設備完善、候診舒適',
      '治療成效：症狀改善、追蹤完整、預防建議'
    ],
    commonSentences: [
      '醫師很專業，診斷很仔細',
      '護理人員態度很親切',
      '環境很整潔，讓人安心',
      '說明很詳細，讓我很放心',
      '治療效果很好，症狀明顯改善'
    ],
    complianceReminders: [
      '不得提及具體醫療費用',
      '避免誇大治療效果',
      '不可提供醫療建議',
      '尊重醫療專業與隱私'
    ]
  },

  optical: {
    category: '眼鏡視光業',
    description: '專注視力檢測、鏡片品質、框架選擇與專業服務',
    experiencePoints: [
      '驗光專業度',
      '鏡片品質',
      '框架選擇',
      '服務態度',
      '價格合理性',
      '配戴舒適度',
      '售後服務',
      '環境整潔'
    ],
    vocabularyPatterns: [
      '驗光精準',
      '專業細心',
      '鏡片清晰',
      '框架時尚',
      '配戴舒適',
      '服務親切',
      '價格合理',
      '品質優良',
      '技術專業'
    ],
    evaluationAspects: [
      '專業技術：驗光準確性、配鏡精確度、專業建議',
      '產品品質：鏡片清晰度、框架耐用性、配戴舒適度',
      '服務品質：耐心說明、專業諮詢、售後追蹤',
      '環境設備：檢測設備、環境整潔、展示完整'
    ],
    commonSentences: [
      '驗光很仔細，度數調整得很精準',
      '店員很專業，會詳細說明鏡片特性',
      '框架選擇很多，款式也很時尚',
      '配戴很舒適，視覺效果很清晰',
      '售後服務很好，有問題都會協助處理'
    ],
    complianceReminders: [
      '不得提及具體價格數字',
      '避免醫療相關宣稱',
      '描述配鏡體驗與感受',
      '不涉及視力改善承諾'
    ]
  },

  education: {
    category: '教育培訓業',
    description: '重視教學品質、師資專業、學習環境與成效追蹤',
    experiencePoints: [
      '教學品質',
      '師資專業',
      '課程內容',
      '學習環境',
      '班級管理',
      '進度追蹤',
      '家長溝通',
      '收費合理性'
    ],
    vocabularyPatterns: [
      '教學認真',
      '老師專業',
      '內容豐富',
      '環境良好',
      '管理用心',
      '進步明顯',
      '溝通良好',
      '值得推薦',
      '學習愉快'
    ],
    evaluationAspects: [
      '教學品質：內容充實、方法多元、因材施教',
      '師資水準：專業資格、教學經驗、耐心指導',
      '環境設施：學習空間、設備完善、安全舒適',
      '學習成效：進步明顯、興趣培養、能力提升'
    ],
    commonSentences: [
      '老師很認真，教學方式很活潑',
      '課程內容豐富，孩子很有興趣',
      '環境很好，學習氛圍很棒',
      '老師很有耐心，會個別指導',
      '孩子進步很明顯，很有成就感'
    ],
    complianceReminders: [
      '不得提及具體學費或優惠',
      '避免誇大學習成效',
      '保護學生與家長隱私',
      '不做升學保證承諾'
    ]
  },

  service: {
    category: '生活服務業',
    description: '著重服務效率、專業技能、價格合理與客戶滿意度',
    experiencePoints: [
      '服務效率',
      '專業技能',
      '價格透明',
      '工作品質',
      '溝通態度',
      '時間準確',
      '清潔整理',
      '問題解決'
    ],
    vocabularyPatterns: [
      '服務迅速',
      '技術專業',
      '價格合理',
      '品質優良',
      '態度親切',
      '準時到達',
      '工作仔細',
      '值得信賴',
      '效率很高'
    ],
    evaluationAspects: [
      '服務效率：時間掌控、流程順暢、問題解決',
      '專業技能：技術熟練、經驗豐富、工具齊全',
      '服務態度：溝通良好、耐心說明、客戶導向',
      '服務品質：工作細緻、清潔整齊、後續追蹤'
    ],
    commonSentences: [
      '服務很迅速，技術也很專業',
      '工作人員很仔細，品質很好',
      '價格合理，服務態度也很親切',
      '準時到達，效率很高',
      '工作完成度很高，很滿意'
    ],
    complianceReminders: [
      '不得提及具體收費標準',
      '避免比較其他業者',
      '描述真實服務體驗',
      '不涉及安全責任問題'
    ]
  },

  entertainment: {
    category: '娛樂休閒業',
    description: '專注娛樂體驗、設施品質、服務態度與整體氛圍',
    experiencePoints: [
      '設施品質',
      '服務態度',
      '環境氛圍',
      '價格合理性',
      '活動豐富度',
      '安全性',
      '便利性',
      '整體體驗'
    ],
    vocabularyPatterns: [
      '設施完善',
      '服務周到',
      '氛圍很棒',
      '價格實惠',
      '活動豐富',
      '環境安全',
      '交通便利',
      '體驗愉快',
      '值得再來'
    ],
    evaluationAspects: [
      '設施品質：設備新穎、功能完善、維護良好',
      '服務品質：態度友善、回應迅速、專業協助',
      '環境氛圍：空間設計、音響效果、清潔整齊',
      '娛樂體驗：活動豐富、樂趣十足、放鬆舒壓'
    ],
    commonSentences: [
      '設施很新，品質很好',
      '服務人員很親切，很有幫助',
      '環境很棒，氛圍很好',
      '活動很豐富，很有趣',
      '整體體驗很愉快，會想再來'
    ],
    complianceReminders: [
      '不得提及具體消費金額',
      '避免涉及安全事故',
      '描述個人娛樂體驗',
      '不涉及年齡限制問題'
    ]
  },

  legal_professional: {
    category: '法律專業服務業',
    description: '重視專業能力、溝通清晰、處理效率與服務態度',
    experiencePoints: [
      '專業知識',
      '溝通說明',
      '處理效率',
      '服務態度',
      '收費透明',
      '保密性',
      '案件追蹤',
      '問題解決能力'
    ],
    vocabularyPatterns: [
      '專業度高',
      '解釋清楚',
      '態度親切',
      '處理迅速',
      '經驗豐富',
      '細心謹慎',
      '值得信賴',
      '溝通順暢',
      '效率很好'
    ],
    evaluationAspects: [
      '專業能力：法律知識、實務經驗、判斷精準',
      '溝通品質：說明淺顯易懂、耐心解答、主動告知進度',
      '服務態度：親切有禮、認真負責、客戶導向',
      '處理效率：時間掌控、文件處理、回覆迅速'
    ],
    commonSentences: [
      '律師很專業，把複雜的法律問題解釋得很清楚',
      '處理過程很有效率，隨時都能掌握案件進度',
      '態度很親切，不會讓人有距離感',
      '收費很透明，事先都會說明清楚',
      '遇到問題都會耐心回答，很有耐心'
    ],
    complianceReminders: [
      '不得提及具體案件內容或結果',
      '避免涉及收費金額細節',
      '不可暗示勝訴保證',
      '尊重律師專業與當事人隱私'
    ]
  },

  accommodation_tourism: {
    category: '住宿旅遊業',
    description: '重視房間品質、服務貼心、環境舒適與整體住宿體驗',
    experiencePoints: [
      '房間清潔度',
      '房間舒適度',
      '床鋪品質',
      '服務態度',
      '位置便利性',
      '早餐品質',
      '前台效率',
      '價格合理性'
    ],
    vocabularyPatterns: [
      '房間舒適',
      '環境優美',
      '服務貼心',
      '位置便利',
      '早餐豐富',
      '布置溫馨',
      '乾淨整潔',
      '設施完善',
      '值得推薦'
    ],
    evaluationAspects: [
      '房間品質：清潔度、舒適度、設備完整、床鋪品質',
      '服務品質：前台效率、清潔速度、問題反應、服務態度',
      '設施環境：環境整潔、裝潢風格、公共空間、安全設施',
      '整體體驗：位置便利、早餐品質、價格合理、住宿滿意度'
    ],
    commonSentences: [
      '房間很舒適，環境整潔，讓人很放鬆',
      '位置很方便，交通便利，走路就能到市中心',
      '早餐很豐富，選擇多，品質也不錯',
      '服務人員很親切，前台效率很高',
      '整體體驗很棒，價格合理，會想再來'
    ],
    complianceReminders: [
      '不得提及具體房價或優惠',
      '避免涉及隱私問題',
      '描述個人住宿體驗',
      '不涉及其他住客隱私'
    ]
  },

  pet_services: {
    category: '寵物服務業',
    description: '強調專業技術、寵物安全、服務細心與寵物滿意度',
    experiencePoints: [
      '獸醫專業度',
      '寵物護理技術',
      '環境安全衛生',
      '服務態度',
      '價格合理性',
      '寵物舒適度',
      '設備完善度',
      '後續追蹤'
    ],
    vocabularyPatterns: [
      '專業用心',
      '環境安全',
      '寵物放心',
      '態度親切',
      '設施完善',
      '技術專業',
      '衛生整潔',
      '值得信賴',
      '護理細心'
    ],
    evaluationAspects: [
      '專業能力：醫療知識、護理技術、診斷準確、經驗豐富',
      '服務品質：態度親切、耐心溝通、細心護理、後續關心',
      '環境安全：清潔衛生、設備完善、寵物隔離、防疫措施',
      '寵物體驗：寵物放心、護理舒適、恢復良好、整體滿意度'
    ],
    commonSentences: [
      '醫生很專業，檢查很仔細，診斷很準確',
      '護理人員很細心，對寵物很溫柔',
      '環境很乾淨，設備也很完善',
      '服務很親切，會耐心回答所有問題',
      '寵物檢查後恢復得很快，很放心'
    ],
    complianceReminders: [
      '不得提及具體醫療費用',
      '避免誇大治療效果',
      '不可保證治療結果',
      '尊重獸醫專業與寵物隱私'
    ]
  }
};

// 根據行業關鍵字獲取行業類別
export function getIndustryCategory(industry?: string): string {
  if (!industry) return 'general';
  
  // 直接匹配
  if (INDUSTRY_CATEGORY_MAP[industry]) {
    return INDUSTRY_CATEGORY_MAP[industry];
  }
  
  // 模糊匹配
  for (const [key, category] of Object.entries(INDUSTRY_CATEGORY_MAP)) {
    if (industry.includes(key) || key.includes(industry)) {
      return category;
    }
  }
  
  return 'general';
}

// 獲取行業上下文
export function getIndustryContext(industry?: string): IndustryContext | null {
  const category = getIndustryCategory(industry);
  return category === 'general' ? null : INDUSTRY_CONTEXTS[category];
}

// 生成行業特定的系統提示補充
export function generateIndustryPromptAddition(industry?: string): string {
  const context = getIndustryContext(industry);
  
  if (!context) {
    return `
### 通用行業指引
- 根據關鍵字內容，自然描述相關的服務體驗
- 重視服務品質、環境感受、價格合理性
- 使用真實、具體的用詞描述個人體驗
- 避免過度誇大或虛假宣傳`;
  }

  return `
### ${context.category}專業指引
- 行業特色：${context.description}
- 評價重點：${context.evaluationAspects.slice(0, 2).join('；')}
- 常用詞彙：運用「${context.vocabularyPatterns.slice(0, 4).join('」、「')}」等相關表達
- 體驗描述：可參考「${context.commonSentences.slice(0, 2).join('」或「')}」的描述方式
- 合規提醒：${context.complianceReminders.slice(0, 2).join('；')}

請確保評論內容符合${context.category}的專業特性，使用相關的行業詞彙和體驗描述。`;
}

// 獲取行業相關的語言增強建議
export function getIndustryLanguageEnhancement(industry?: string): {
  vocabularyPatterns: string[];
  experienceKeywords: string[];
  evaluationAspects: string[];
} {
  const context = getIndustryContext(industry);
  
  if (!context) {
    return {
      vocabularyPatterns: ['服務優質', '環境舒適', '價格合理', '值得推薦'],
      experienceKeywords: ['體驗', '感受', '印象', '滿意'],
      evaluationAspects: ['服務品質', '環境氛圍', '價格合理性', '整體滿意度']
    };
  }

  return {
    vocabularyPatterns: context.vocabularyPatterns,
    experienceKeywords: context.experiencePoints.slice(0, 4),
    evaluationAspects: context.evaluationAspects
  };
}