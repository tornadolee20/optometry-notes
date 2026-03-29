// Industry-aware concrete actions and micro episodes for language linting

export interface IndustryLintTemplate {
  concreteActions: Record<string, string[]>;
  microEpisodes: Array<{ problem: string; solution: string }>;
  sensoryWords: Record<string, string[]>;
  endingTemplates: string[];
  serviceSubjectReplacements: string[];
}

const OPTICAL_TEMPLATE: IndustryLintTemplate = {
  concreteActions: {
    'kind': [
      '一來就先跟我聊天放鬆一下',
      '會主動問我戴起來舒不舒服',
      '還幫我倒了杯水',
      '很有耐心地聽我講需求',
      '進門就笑笑地問我今天想看什麼',
      '看我帶小孩來，還拿了小點心給他',
      '態度很自然，不會讓人有壓力'
    ],
    'professional': [
      '會邊驗邊解釋給我聽',
      '會讓我慢慢比對鏡片差異',
      '對度數調整解釋得很清楚',
      '直接分析我用眼習慣再推薦',
      '先問了我平常用電腦的時間，再給建議',
      '不只看度數，連散光軸度都講得很仔細',
      '還用模擬片讓我實際感受差異'
    ],
    'careful': [
      '會一直確認鏡架有沒有壓到',
      '調整到我覺得剛剛好才停',
      '還特別提醒我平時要注意的事',
      '反覆確認我看遠看近都OK',
      '試戴的時候一直微調鼻墊位置',
      '連鏡腳的弧度都幫我調過',
      '最後還幫我確認兩邊有沒有平衡'
    ],
    'patient': [
      '完全不催我，讓我慢慢挑',
      '問題問了好幾次都沒不耐煩',
      '一個一個慢慢跟我說差在哪',
      '等我想清楚才繼續下一步',
      '我在兩副之間猶豫很久，他都沒催',
      '還說想再試一次也沒關係',
      '從頭到尾都很有耐心，不趕人'
    ],
    'comfortable': [
      '燈光很溫暖',
      '椅子坐起來很軟',
      '有淡淡的木頭香',
      '背景音樂很輕柔',
      '空間不大但很整潔，待著很舒服',
      '驗光室裡面蠻安靜的，可以專心'
    ]
  },
  microEpisodes: [
    { problem: '假日人多', solution: '不過他們一直過來確認，不會被晾著' },
    { problem: '等了幾分鐘', solution: '老闆還泡茶讓我們慢慢選' },
    { problem: '小孩坐不住', solution: '驗光師很會逗小朋友開心' },
    { problem: '本來只是想驗光', solution: '結果不知不覺就挑到一副剛好的' },
    { problem: '第一次來有點緊張', solution: '他口氣始終很平，我就放鬆了' },
    { problem: '度數變化有點擔心', solution: '還好他解釋得很清楚，原來很正常' }
  ],
  sensoryWords: {
    'environment': ['光線是暖的', '木頭香味', '背景音樂不吵', '坐下來就鬆了'],
    'comfort': ['椅子不硬', '空間不擠', '溫度剛好', '聲音輕柔'],
    'relax': ['肩膀鬆下來', '心就定了', '呼吸順暢', '沒有壓迫感']
  },
  endingTemplates: [
    '價格合理、不推銷。之後會帶家人再來。',
    '整體來說還不錯，下次驗光會考慮這裡。',
    '雖然等了一下，但效果值得。會推薦朋友。',
    '比預期的好，改天帶小孩來配眼鏡。',
    '服務到位，就是停車稍微麻煩一點。'
  ],
  serviceSubjectReplacements: [
    '驗光師邊講邊畫重點，我跟得上',
    '驗光師很仔細地幫我檢查'
  ]
};

const RESTAURANT_TEMPLATE: IndustryLintTemplate = {
  concreteActions: {
    'kind': [
      '一坐下就先幫我們倒水',
      '一開始就先問我們有沒有不吃的',
      '還幫小孩拿了兒童椅跟餐具',
      '笑笑的問我們今天想吃什麼',
      '進門就很熱情地招呼我們',
      '看我們帶長輩來，主動安排比較好坐的位置',
      '還沒坐定就先送上熱茶'
    ],
    'professional': [
      '會跟我講今天哪些食材特別新鮮',
      '推薦搭配的時候講得蠻有道理的',
      '上菜節奏抓得很好，不會一次來太多',
      '還解釋了料理方式跟一般的差在哪',
      '看我們猶豫就推薦招牌菜，果然沒踩雷',
      '連醬料搭配都會建議，蠻用心的'
    ],
    'careful': [
      '點餐前會確認我們有沒有忌口',
      '還特地問有沒有不能吃的食材',
      '會先了解我們不吃什麼，再推薦菜',
      '沒有直接亂推，會先問我們有沒有避開的東西',
      '點餐時很細心地確認忌口和過敏',
      '還問我們家小朋友有沒有不吃的',
      '看到杯子快空了就過來加水',
      '上菜時特別提醒小心燙',
      '幫忙把骨頭多的菜放小孩那邊比較遠的位置',
      '有先確認我朋友的過敏食材'
    ],
    'patient': [
      '讓我們看菜單看了好一陣子也沒催',
      '問了很多問題都很有耐心地回答',
      '慢慢解釋每道菜有什麼不同',
      '等我們討論完才來點餐',
      '我們改了兩次菜也沒有不耐煩',
      '看我們選很久，還說不急慢慢看'
    ],
    'comfortable': [
      '燈光暖暖的很有氣氛',
      '座位之間距離剛好，不會聽到隔壁在講什麼',
      '冷氣溫度很舒服',
      '背景音樂放得剛剛好',
      '桌面乾乾淨淨的，餐具也擺得很整齊',
      '整個空間不會太擠，坐起來很自在'
    ]
  },
  microEpisodes: [
    { problem: '假日人多等了一下', solution: '不過店員一直來關心，還先送了小點心' },
    { problem: '帶小孩怕吵到別人', solution: '店員很貼心地安排角落座位' },
    { problem: '菜單選擇太多猶豫', solution: '店員推薦的果然沒讓我失望' },
    { problem: '不確定份量夠不夠', solution: '老闆說不夠可以再加，很大方' },
    { problem: '第一次來不熟菜色', solution: '店員解釋得很清楚，點完很安心' },
    { problem: '朋友有過敏體質', solution: '廚房特別注意，讓我們很放心' }
  ],
  sensoryWords: {
    'environment': ['香氣撲鼻', '擺盤精緻', '氣氛溫馨', '乾淨明亮'],
    'comfort': ['座位寬敞', '不會太吵', '溫度舒適', '動線流暢'],
    'relax': ['吃得很放鬆', '像在家一樣自在', '不趕時間的感覺', '氣氛很chill']
  },
  endingTemplates: [
    '份量足、味道好，下次聚餐會再來。',
    '整體CP值不錯，會推薦給朋友。',
    '雖然等了一下，但餐點品質值得。',
    '環境舒適餐點好吃，適合家庭聚餐。',
    '口味合，就是停車不太方便。'
  ],
  serviceSubjectReplacements: [
    '店員介紹得很仔細，我很快就決定了',
    '服務人員很有耐心地推薦'
  ]
};

const MEDICAL_TEMPLATE: IndustryLintTemplate = {
  concreteActions: {
    'kind': [
      '護理師看我緊張還主動過來安慰',
      '幫我倒了杯溫水',
      '先跟我說大概要等多久',
      '一直笑笑的讓我比較不怕',
      '進來就問我今天哪裡不舒服，語氣很溫和',
      '看我帶小孩來，還拿了貼紙給他',
      '離開時還提醒我外面下雨小心路滑'
    ],
    'professional': [
      '問診問得很仔細，不是隨便看看',
      '解釋病情的時候用我聽得懂的話',
      '用藥的注意事項講得很清楚',
      '該做的檢查一個都沒漏',
      '會先問我之前有沒有吃過什麼藥，再開處方',
      '還畫了簡單的圖解給我看，馬上就懂了',
      '把可能的狀況都講了一遍，讓我有心理準備'
    ],
    'careful': [
      '症狀反覆確認好幾次才下結論',
      '離開前還特別叮嚀回家要注意什麼',
      '後來還主動打電話追蹤狀況',
      '我講完他又追問了幾個細節才放心',
      '開藥前特別問我有沒有藥物過敏',
      '還提醒我幾天後如果沒改善要回診',
      '連我提到的小症狀都有記下來一起評估'
    ],
    'patient': [
      '看診完全不趕，讓我慢慢講',
      '我問了好幾個問題都沒有不耐煩',
      '每個步驟都慢慢解釋',
      '一直講到我真的聽懂為止',
      '我重複問了同一個問題，他還是很有耐心地回答',
      '看完診還問我有沒有其他想問的',
      '沒有因為後面還有人就催我'
    ],
    'comfortable': [
      '候診區蠻乾淨的',
      '椅子坐起來不會不舒服',
      '空調不會太冷也不會太悶',
      '整體環境比想像中安靜',
      '候診區有提供雜誌和飲水機',
      '廁所也維持得很乾淨',
      '掛號櫃檯動線很順，不用到處問'
    ]
  },
  microEpisodes: [
    { problem: '掛號等比較久', solution: '不過醫師看診很仔細，不趕時間' },
    { problem: '第一次看這科有點緊張', solution: '護理師一直安撫我，讓我安心不少' },
    { problem: '帶長輩來行動不便', solution: '工作人員馬上過來協助' },
    { problem: '小孩怕看醫生哭鬧', solution: '醫師很有技巧地轉移注意力' },
    { problem: '對用藥有疑慮', solution: '醫師解釋得很清楚，疑慮都消除了' },
    { problem: '擔心費用問題', solution: '櫃檯先說明了大概費用，很透明' }
  ],
  sensoryWords: {
    'environment': ['環境整潔', '消毒味不重', '空間明亮', '動線清楚'],
    'comfort': ['候診區寬敞', '座椅舒適', '溫度適中', '氣氛不緊張'],
    'relax': ['心情放鬆了', '沒有壓迫感', '整個過程很順', '不像以前看診那麼怕']
  },
  endingTemplates: [
    '醫師專業又親切，之後固定來這看。',
    '整體看診體驗不錯，會推薦給家人。',
    '雖然等了一下，但看診品質很好。',
    '環境舒適、醫師專業，值得信賴。',
    '服務到位，就是停車稍微麻煩一點。'
  ],
  serviceSubjectReplacements: [
    '醫師邊看邊解釋，我聽得很清楚',
    '護理師很仔細地說明注意事項'
  ]
};

const BEAUTY_TEMPLATE: IndustryLintTemplate = {
  concreteActions: {
    'kind': [
      '一進來就先幫我倒杯花茶',
      '聊了一下我的需求才開始做',
      '邊做邊跟我聊天讓我很放鬆',
      '主動跟我說哪個方案比較適合我',
      '進門就問我今天想加強哪個部位',
      '還幫我把包包放好，很周到',
      '看我第一次來，先帶我參觀環境'
    ],
    'professional': [
      '先摸了一下我的膚質再決定怎麼做',
      '推薦的產品用起來真的有差',
      '手法很穩不會一下重一下輕',
      '每個步驟都解釋為什麼要這樣做',
      '還教我回家怎麼保養才能延續效果',
      '看了我的膚況後，建議我先做保濕再做其他',
      '手法很細膩，連眼周都有顧到'
    ],
    'careful': [
      '中間一直問我力道OK嗎',
      '發現我皮膚比較敏感就換了產品',
      '整個過程都在注意我的反應',
      '痘痘的地方特別小心繞過去',
      '做之前先在手背試了一下產品，確認我不會過敏',
      '發現我某個部位比較乾，多加了一層精華液',
      '每換一個步驟都會先跟我說接下來要做什麼'
    ],
    'patient': [
      '讓我慢慢看方案不會催',
      '完全沒有推銷的感覺',
      '我問了很多問題都很認真回答',
      '不會為了趕下一個客人就加快速度',
      '我猶豫了很久她也沒有不耐煩',
      '還說可以先體驗再決定要不要買療程',
      '從頭到尾都很溫柔，不急不徐'
    ],
    'comfortable': [
      '燈光調得很舒服不刺眼',
      '床躺起來軟軟的很好睡',
      '香氛味道淡淡的剛剛好',
      '整個空間很有私密感',
      '背景音樂很輕柔，整個人都放鬆了',
      '毛巾熱熱的敷上來超舒服'
    ]
  },
  microEpisodes: [
    { problem: '第一次做臉有點緊張', solution: '美容師邊做邊解釋，讓我安心很多' },
    { problem: '皮膚狀況不太好', solution: '美容師沒有批評，而是給了很中肯的建議' },
    { problem: '不確定要選哪個方案', solution: '她根據我的需求推薦，沒有硬推貴的' },
    { problem: '怕會痛', solution: '力道控制得很好，幾乎沒感覺' },
    { problem: '時間比較趕', solution: '她很有效率但不馬虎，剛好在時間內完成' },
    { problem: '之前在別家做過不好的經驗', solution: '這次完全不同，手法很溫柔' }
  ],
  sensoryWords: {
    'environment': ['香氛舒服', '裝潢有質感', '很有氛圍', '乾淨整潔'],
    'comfort': ['床鋪軟硬適中', '室溫剛好', '包巾很柔軟', '空間私密'],
    'relax': ['整個人都鬆了', '差點睡著', '壓力釋放', '身心都放鬆']
  },
  endingTemplates: [
    '做完皮膚摸起來滑滑的，會再回來。',
    '整體體驗很好，價格也合理。',
    '手法專業不推銷，很舒服的體驗。',
    '環境舒適效果好，已經預約下次了。',
    '服務很棒，就是假日要提早預約。'
  ],
  serviceSubjectReplacements: [
    '美容師邊做邊解釋，讓我很放心',
    '技師手法很穩，整個過程很舒服'
  ]
};

const GENERAL_TEMPLATE: IndustryLintTemplate = {
  concreteActions: {
    'kind': [
      '一進門就笑笑地跟我打招呼',
      '看我手上東西多還主動幫忙拿',
      '問我有沒有需要幫忙的地方',
      '整個人態度很親切讓人很自在',
      '進來就招呼我坐下來慢慢看',
      '看我帶小孩來，還拿了糖果給他',
      '離開時還笑著說歡迎再來'
    ],
    'professional': [
      '對自家產品超熟，問什麼都答得出來',
      '推薦的東西真的蠻適合我的',
      '解釋的時候講得很清楚不會讓人霧煞煞',
      '處理問題的速度蠻快的',
      '還主動比較了幾個選項讓我好選',
      '用很淺的方式說明差異，我一聽就懂',
      '不只講優點，連注意事項也一起說了'
    ],
    'careful': [
      '有先跟我確認需求才開始介紹',
      '連小細節都有注意到',
      '包裝得很仔細不馬虎',
      '結帳前又再確認了一次',
      '還特別提醒我使用上要注意的地方',
      '發現我猶豫就多給了一些參考建議',
      '離開前再確認我有沒有問題'
    ],
    'patient': [
      '讓我慢慢看不會在旁邊一直催',
      '完全不急，一個一個慢慢介紹',
      '我問了好幾個問題都很認真回',
      '從頭到尾都陪著我沒有不耐煩',
      '我改了主意他也沒有面露難色',
      '等我想好了才開始處理，不急不徐'
    ],
    'comfortable': [
      '環境蠻乾淨整齊的',
      '空間夠大不會覺得擠',
      '溫度剛剛好很舒服',
      '氣氛很輕鬆沒有壓力',
      '整體動線蠻順的，不用到處找東西',
      '連廁所都維持得很乾淨'
    ]
  },
  microEpisodes: [
    { problem: '假日人比較多', solution: '不過服務沒有因此打折扣' },
    { problem: '第一次來不太熟', solution: '工作人員很快就來引導了' },
    { problem: '帶小孩有點麻煩', solution: '他們很包容，讓我很放心' },
    { problem: '原本有點猶豫', solution: '試了之後就決定了' },
    { problem: '趕時間怕來不及', solution: '他們效率很高，很快就搞定' },
    { problem: '不確定適不適合', solution: '服務人員給了很中肯的建議' }
  ],
  sensoryWords: {
    'environment': ['明亮乾淨', '擺設整齊', '空氣清新', '整體舒適'],
    'comfort': ['坐起來舒服', '不擁擠', '溫度剛好', '很自在'],
    'relax': ['心情很好', '沒有壓力', '很輕鬆', '整個人都放鬆']
  },
  endingTemplates: [
    '整體體驗不錯，下次會再來。',
    '服務好、品質佳，會推薦朋友。',
    '雖然小等了一下，但整體滿意。',
    '比想像中好，值得再訪。',
    '不錯的體驗，就是停車不太方便。'
  ],
  serviceSubjectReplacements: [
    '工作人員解釋得很清楚，我很滿意',
    '服務人員很仔細地處理'
  ]
};

// Industry keyword to template mapping
const INDUSTRY_TEMPLATE_MAP: Record<string, IndustryLintTemplate> = {
  'optical': OPTICAL_TEMPLATE,
  'eyewear': OPTICAL_TEMPLATE,
  'optician': OPTICAL_TEMPLATE,
  'restaurant': RESTAURANT_TEMPLATE,
  'cafe': RESTAURANT_TEMPLATE,
  'food': RESTAURANT_TEMPLATE,
  'dining': RESTAURANT_TEMPLATE,
  'medical': MEDICAL_TEMPLATE,
  'clinic': MEDICAL_TEMPLATE,
  'dental': MEDICAL_TEMPLATE,
  'hospital': MEDICAL_TEMPLATE,
  'beauty': BEAUTY_TEMPLATE,
  'salon': BEAUTY_TEMPLATE,
  'spa': BEAUTY_TEMPLATE,
  'skincare': BEAUTY_TEMPLATE,
  'nail': BEAUTY_TEMPLATE,
  'hair': BEAUTY_TEMPLATE,
};

// Chinese industry names mapping
const CN_INDUSTRY_MAP: Record<string, string> = {
  '眼鏡': 'optical',
  '眼鏡行': 'optical',
  '驗光': 'optical',
  '餐廳': 'restaurant',
  '餐飲': 'restaurant',
  '咖啡': 'cafe',
  '飲料': 'restaurant',
  '小吃': 'restaurant',
  '火鍋': 'restaurant',
  '燒烤': 'restaurant',
  '醫療': 'medical',
  '診所': 'clinic',
  '牙醫': 'dental',
  '醫院': 'hospital',
  '美容': 'beauty',
  '美甲': 'nail',
  '美髮': 'hair',
  '護膚': 'skincare',
  'SPA': 'spa',
};

export function getIndustryTemplate(industry?: string): IndustryLintTemplate {
  if (!industry) return GENERAL_TEMPLATE;

  const lower = industry.toLowerCase().trim();

  // Direct English match
  if (INDUSTRY_TEMPLATE_MAP[lower]) {
    return INDUSTRY_TEMPLATE_MAP[lower];
  }

  // Chinese name match
  for (const [cnKey, enKey] of Object.entries(CN_INDUSTRY_MAP)) {
    if (industry.includes(cnKey)) {
      return INDUSTRY_TEMPLATE_MAP[enKey] || GENERAL_TEMPLATE;
    }
  }

  // Partial English match
  for (const [key, template] of Object.entries(INDUSTRY_TEMPLATE_MAP)) {
    if (lower.includes(key) || key.includes(lower)) {
      return template;
    }
  }

  return GENERAL_TEMPLATE;
}
