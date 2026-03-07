import { Language } from '@/lib/translations';

export interface LandingTranslations {
  // Meta
  pageTitle: string;
  
  // Brand
  brandName: string;
  brandSubtitle: string;
  brandTagline: string;
  
  // Nav
  navStory: string;
  navChanges: string;
  navIndependent: string;
  navFit: string;
  navAbout: string;
  navReport: string;
  navPricing: string;
  navLogin: string;
  navStartNow: string;
  
  // Hero
  heroHeadline: string;
  heroSubheadline: string;
  heroCta: string;
  heroCtaSubtext: string;
  heroSecondaryCta: string;
  heroTrialNote: string;
  
  // Product description
  productDescription: string;
  
  // Story section
  storyTitle: string;
  storyIntro: string;
  storyContent: string[];
  storyBullets: string[];
  
  // Changes section
  changesTitle: string;
  changesList: string[];
  
  // Independent section
  independentTitle: string;
  independentIntro: string[];
  independentStance: string[];
  independentBullets: string[];
  
  // Fit section
  fitTitle: string;
  fitGoodTitle: string;
  fitGoodList: string[];
  fitNotGoodTitle: string;
  fitNotGoodList: string[];
  
  // About Developer section
  aboutDevTitle: string;
  aboutDevContent: string[];
  
  // Report Demo section
  reportDemoTitle: string;
  reportDemoIntro: string;
  reportDemoList: string[];
  reportDemoOutro: string;
  reportDemoPlaceholder: string;
  
  // Pricing section
  pricingTitle: string;
  pricingDescription: string;
  pricingCta: string;
  pricingSubscribeBtn: string;
  pricingMonthlyTitle: string;
  pricingMonthlyLabel: string;
  pricingMonthlyOriginal: string;
  pricingMonthlyPrice: string;
  pricingMonthlyDesc: string[];
  pricingMonthlyBtn: string;
  pricingYearlyTitle: string;
  pricingYearlyLabel: string;
  pricingYearlyOriginal: string;
  pricingYearlyPrice: string;
  pricingYearlySubtext: string;
  pricingYearlyBadge: string;
  pricingYearlyDesc: string[];
  pricingYearlyBtn: string;
  pricingTrialTitle: string;
  pricingTrialDesc: string;
  
  // Story last mile explanation
  lastMileExplanation: string;
  
  // Hero placeholder
  heroPlaceholder: string;
  
  // Testimonials section
  testimonialsTitle: string;
  testimonialPlaceholders: string[];
  
  // Disclaimer
  disclaimer: string;
  
  // Footer
  footerCopyright: string;
  footerBy: string;

  // Admin
  adminPaymentManagement: string;
  
  // LINE contact
  lineContactTitle: string;
  lineContactDesc: string;
  lineContactBtn: string;
}

export const landingTranslations: Record<Language, LandingTranslations> = {
  'zh-TW': {
    // Meta
    pageTitle: 'MYOWNVISION Binocular Vision Analysis System – 雙眼視覺分析系統',
    
    // Brand
    brandName: 'MYOWNVISION',
    brandSubtitle: 'Binocular Vision Analysis System',
    brandTagline: '源自台灣，為全球驗光師打造的雙眼視覺分析平台',
    
    // Nav
    navStory: '故事',
    navChanges: '改變',
    navIndependent: '不綁廠商',
    navFit: '適合誰',
    navAbout: '關於開發者',
    navReport: '報告展示',
    navPricing: '方案',
    navLogin: '登入',
    navStartNow: '開始使用',
    
    // Hero
    heroHeadline: '明知道雙眼視覺很重要，卻總是退縮？',
    heroSubheadline: '你不是不專業，只是被流程繁瑣、時間壓力和說明困難卡住了。',
    heroCta: '立即加入早鳥計畫（限額 50 名）',
    heroCtaSubtext: '點擊後可試用 Demo 報告或加入候補名單',
    heroSecondaryCta: '看看系統怎麼說給客戶聽',
    heroTrialNote: '你可以先用真實個案試跑兩週，如果覺得沒有幫你省時間、講得更穩，再決定要不要續用就好。',
    
    // Product description
    productDescription: '把雙眼視覺數據，變成客戶一看就懂的專業報告。',
    
    // Story section
    storyTitle: '為什麼我們總是退縮？',
    storyIntro: 'MYOWNVISION 幫你把雙眼視覺檢查，變成一條做得完、說得清、客戶撐得住的流程。',
    storyContent: [
      '我們都受過完整的視覺檢查訓練：CISS、NPC、AA、MEM、NRA/PRA、融像範圍，每一項都知道在幹嘛，也知道當客戶出現特定狀況時，該啟動哪一個檢查模組。',
      '但一想到要開一整套檢查，自己也不算熟練，流程又長，客戶也撐不了那麼久，最後只好在心裡跟自己說：「算了，下次再做。」',
      'MYOWNVISION 想補上的，就是這最後一哩路：把你已經會做、卻很難整合的檢查，變成一套可以被複製、被看懂、說得通的視覺分析故事。'
    ],
    storyBullets: [
      '把零散檢查，整理成一條客戶看得懂的視覺健康地圖',
      '把你的臨床判斷，變成系統化的診斷與建議，而不是每次都重頭想',
      '讓你花十年才摸索出的說法，變成五分鐘就能穩定複製的報告'
    ],
    
    // Changes section
    changesTitle: '實際對你的幾個改變',
    changesList: [
      '從偶爾做雙眼視覺，到敢常規放進檢查流程',
      '解釋一張報告的時間：20 分鐘 → 5 分鐘',
      '不再每次靠臨場發揮，而是每一位客戶都說得一樣穩'
    ],
    
    // Independent section
    independentTitle: '不綁設備、不賣合約，只站在驗光師這一邊',
    independentIntro: [
      '現在市面上的雙眼視覺分析系統，大多綁在特定鏡片、特定儀器或特定集團的生態系裡。',
      '往往只是想要一套像樣的分析工具，卻被迫簽下一份所費不貲的大合約，才換得到指定設備與軟體的使用權。',
      '從一個驗光師的角度來看，專業不應該由任何廠商來認定，更不應該被某一個品牌綁住檢查流程與處方思維。'
    ],
    independentStance: [
      'MYOWNVISION 選擇走另一條路：',
      '不綁設備、不綁鏡片品牌，只專心把雙眼視覺分析這件事做好，讓你用自己的臨床判斷，選擇最適合客戶的方案。'
    ],
    independentBullets: [
      '想要分析功能，不需要再被迫簽長約、買指定設備',
      '系統不推薦特定鏡片，只整理數據與風險，決定權在驗光師',
      '無論你用哪一家鏡片、哪一套訓練工具，都能搭配這套分析報告'
    ],
    
    // Fit section
    fitTitle: '這套系統適合誰？',
    fitGoodTitle: '適合的驗光師',
    fitGoodList: [
      '願意做雙眼視覺檢查，但覺得流程太散、說明太花時間',
      '想把自己的說明，變成可以複製的標準話術與報告',
      '不想被單一廠商綁住，希望保留處方與產品選擇的彈性'
    ],
    fitNotGoodTitle: '可能不適合的情況',
    fitNotGoodList: [
      '完全沒有打算做雙眼視覺檢查，只想快速配到一副看得清楚的眼鏡',
      '只想要一套幫忙推特定鏡片的銷售工具，而不是分析與溝通系統'
    ],
    
    // About Developer section
    aboutDevTitle: '關於開發者：一位還在第一線的驗光師',
    aboutDevContent: [
      'MyOwnVision 不是由軟體公司拍腦袋做出來的，而是出自一位還在第一線的驗光師。',
      '目鏡大叔從 20 多年前開始待在驗光所與門市，看過成千上萬雙眼睛，也走過「知道雙眼視覺很重要，卻總是退縮」的那段掙扎。',
      '為了讓更多驗光師有一套「真的用得起、也學得會」的工具，他在 50 歲選擇再次創業，一邊在自己的門市實戰，一邊在元培醫事科技大學企管系任教，把臨床經驗、教學經驗與管理思維，全部打包進這套系統裡。',
      'MyOwnVision 想做的，不是取代驗光師，而是讓你更像你心中那個理想的自己：專業、從容、不被任何廠商牽著走。'
    ],
    
    // Report Demo section
    reportDemoTitle: '報告展示：把複雜雙眼視覺變成一眼看懂',
    reportDemoIntro: 'MyOwnVision 會把你平常量的 CISS、NPC、AA、MEM、NRA/PRA、融像範圍等等，整理成一張客戶看得懂的視覺地圖。報告不是堆一大串數字，而是用顏色區間與簡單圖表標出：',
    reportDemoList: [
      '綠色：目前在穩定範圍，可以定期追蹤',
      '黃色：需要多留意，建議安排進一步檢查或訓練',
      '紅色：已經明顯影響用眼效率，建議儘快處理'
    ],
    reportDemoOutro: '客戶也許看不懂棱鏡度數，但他們看得懂紅綠燈。你只要順著圖講，客戶就能理解「為什麼要做這些檢查」、「為什麼這副處方對他比較好」。',
    reportDemoPlaceholder: '示意圖，實際畫面以系統為準。',
    
    // Pricing section
    pricingTitle: '準備給願意多走那一步的驗光師',
    pricingDescription: '我們正在邀請第一批願意把雙眼視覺做完整的驗光師，一起打磨這套工具。',
    pricingCta: '立即加入早鳥計畫（限額 50 名）',
    pricingSubscribeBtn: '我要訂閱',
    pricingMonthlyTitle: '月付方案',
    pricingMonthlyLabel: '先試試看',
    pricingMonthlyOriginal: 'NTD 800 / 月',
    pricingMonthlyPrice: 'NTD 500 / 月',
    pricingMonthlyDesc: [
      '創始用戶早鳥價，未來新註冊用戶可能會依標準價（800 / 月）計費。',
      '適合想先從少量個案開始，把流程跑順、話術跑熟的個人驗光人員與眼科醫師。'
    ],
    pricingMonthlyBtn: '先用月付方案試試',
    pricingYearlyTitle: '年付方案',
    pricingYearlyLabel: '驗光師首選',
    pricingYearlyOriginal: 'NTD 6,000 / 年',
    pricingYearlyPrice: 'NTD 3,600 / 年',
    pricingYearlySubtext: '平均每月 300 元，每天不到 10 元',
    pricingYearlyBadge: '最划算',
    pricingYearlyDesc: [
      '平均一個月約 300 元，比一杯咖啡還少，卻可以幫你每個月省下好幾小時的分析與說明時間。',
      '適合已經固定進行雙眼視覺檢查、希望把流程標準化的驗光所與診所。'
    ],
    pricingYearlyBtn: '我要用年付方案開始',
    pricingTrialTitle: '立即註冊，享 14 天完整功能免費試用',
    pricingTrialDesc: '無需綁定信用卡。試用期結束後，你仍可查看既有檢查報告，但無法新增新的檢查紀錄。',
    
    // Story last mile explanation
    lastMileExplanation: '（從檢查完，到說給客戶聽、讓客戶點頭的那一段）',
    
    // Hero placeholder
    heroPlaceholder: '報告展示圖（即將更新）',
    
    // Testimonials section
    testimonialsTitle: '來自同業的聲音（即將更新）',
    testimonialPlaceholders: [
      '這裡會放上一線驗光師的真實使用心得。',
      '這裡會放早期用戶如何把雙眼視覺放進日常流程的故事。'
    ],
    
    // Disclaimer
    disclaimer: 'MYOWNVISION 是一套視覺分析與溝通工具，不是醫療診斷軟體。所有評估結果與建議，都需由驗光師依自身臨床判斷，決定最終處置與配鏡方案。',
    
    // Footer
    footerCopyright: '© 2024 MYOWNVISION. All rights reserved.',
    footerBy: 'by Myownglasses',

    // Admin
    adminPaymentManagement: '付款管理',
    
    // LINE contact
    lineContactTitle: '有問題嗎？歡迎加 LINE 詢問',
    lineContactDesc: '若您對匯款或訂閱流程有任何疑問，可以透過 LINE 與我們聯繫。',
    lineContactBtn: '透過 LINE 聯繫我們',
  },
  
  'zh-CN': {
    // Meta
    pageTitle: 'MYOWNVISION Binocular Vision Analysis System – 双眼视觉分析系统',
    
    // Brand
    brandName: 'MYOWNVISION',
    brandSubtitle: 'Binocular Vision Analysis System',
    brandTagline: '源自台湾，为全球视光师打造的双眼视觉分析平台',
    
    // Nav
    navStory: '故事',
    navChanges: '改变',
    navIndependent: '不绑厂商',
    navFit: '适合谁',
    navAbout: '关于开发者',
    navReport: '报告展示',
    navPricing: '方案',
    navLogin: '登录',
    navStartNow: '开始使用',
    
    // Hero
    heroHeadline: '明知道双眼视觉很重要，却总是退缩？',
    heroSubheadline: '你不是不专业，只是被流程繁琐、时间压力和说明困难卡住了。',
    heroCta: '立即加入早鸟计划（限额 50 名）',
    heroCtaSubtext: '点击后可试用 Demo 报告或加入候补名单',
    heroSecondaryCta: '看看系统怎么说给顾客听',
    heroTrialNote: '你可以先用真实个案试跑两周，如果觉得没有帮你省时间、讲得更稳，再决定要不要续用就好。',
    
    // Product description
    productDescription: '把双眼视觉数据，变成顾客一看就懂的专业报告。',
    
    // Story section
    storyTitle: '为什么我们总是退缩？',
    storyIntro: 'MYOWNVISION 帮你把双眼视觉检查，变成一条做得完、说得清、顾客撑得住的流程。',
    storyContent: [
      '我们都受过完整的视觉检查训练：CISS、NPC、AA、MEM、NRA/PRA、融像范围，每一项都知道在干嘛，也知道当顾客出现特定状况时，该启动哪一个检查模块。',
      '但一想到要开一整套检查，自己也不算熟练，流程又长，顾客也撑不了那么久，最后只好在心里跟自己说：「算了，下次再做。」',
      'MYOWNVISION 想补上的，就是这最后一公里：把你已经会做、却很难整合的检查，变成一套可以被复制、被看懂、说得通的视觉分析故事。'
    ],
    storyBullets: [
      '把零散检查，整理成一条顾客看得懂的视觉健康地图',
      '把你的临床判断，变成系统化的诊断与建议，而不是每次都重头想',
      '让你花十年才摸索出的说法，变成五分钟就能稳定复制的报告'
    ],
    
    // Changes section
    changesTitle: '实际对你的几个改变',
    changesList: [
      '从偶尔做双眼视觉，到敢常规放进检查流程',
      '解释一张报告的时间：20 分钟 → 5 分钟',
      '不再每次靠临场发挥，而是每一位顾客都说得一样稳'
    ],
    
    // Independent section
    independentTitle: '不绑设备、不卖合约，只站在视光师这一边',
    independentIntro: [
      '现在市面上的双眼视觉分析系统，大多绑在特定镜片、特定仪器或特定集团的生态系里。',
      '往往只是想要一套像样的分析工具，却被迫签下一份所费不菲的大合约，才换得到指定设备与软件的使用权。',
      '从一个视光师的角度来看，专业不应该由任何厂商来认定，更不应该被某一个品牌绑住检查流程与处方思维。'
    ],
    independentStance: [
      'MYOWNVISION 选择走另一条路：',
      '不绑设备、不绑镜片品牌，只专心把双眼视觉分析这件事做好，让你用自己的临床判断，选择最适合顾客的方案。'
    ],
    independentBullets: [
      '想要分析功能，不需要再被迫签长约、买指定设备',
      '系统不推荐特定镜片，只整理数据与风险，决定权在视光师',
      '无论你用哪一家镜片、哪一套训练工具，都能搭配这套分析报告'
    ],
    
    // Fit section
    fitTitle: '这套系统适合谁？',
    fitGoodTitle: '适合的视光师',
    fitGoodList: [
      '愿意做双眼视觉检查，但觉得流程太散、说明太花时间',
      '想把自己的说明，变成可以复制的标准话术与报告',
      '不想被单一厂商绑住，希望保留处方与产品选择的弹性'
    ],
    fitNotGoodTitle: '可能不适合的情况',
    fitNotGoodList: [
      '完全没有打算做双眼视觉检查，只想快速配到一副看得清楚的眼镜',
      '只想要一套帮忙推特定镜片的销售工具，而不是分析与沟通系统'
    ],
    
    // About Developer section
    aboutDevTitle: '关于开发者：一位还在第一线的验光师',
    aboutDevContent: [
      'MyOwnVision 不是由软件公司拍脑袋做出来的，而是出自一位还在第一线的验光师。',
      '目镜大叔从 20 多年前开始待在验光所与门市，看过成千上万双眼睛，也走过「知道双眼视觉很重要，却总是退缩」的那段挣扎。',
      '为了让更多验光师有一套「真的用得起、也学得会」的工具，他在 50 岁选择再次创业，一边在自己的门市实战，一边在元培医事科技大学企管系任教，把临床经验、教学经验与管理思维，全部打包进这套系统里。',
      'MyOwnVision 想做的，不是取代验光师，而是让你更像你心中那个理想的自己：专业、从容、不被任何厂商牵着走。'
    ],
    
    // Report Demo section
    reportDemoTitle: '报告展示：把复杂双眼视觉变成一眼看懂',
    reportDemoIntro: 'MyOwnVision 会把你平常量的 CISS、NPC、AA、MEM、NRA/PRA、融像范围等等，整理成一张顾客看得懂的视觉地图。报告不是堆一大串数字，而是用颜色区间与简单图表标出：',
    reportDemoList: [
      '绿色：目前在稳定范围，可以定期追踪',
      '黄色：需要多留意，建议安排进一步检查或训练',
      '红色：已经明显影响用眼效率，建议尽快处理'
    ],
    reportDemoOutro: '顾客也许看不懂棱镜度数，但他们看得懂红绿灯。你只要顺着图讲，顾客就能理解「为什么要做这些检查」、「为什么这副处方对他比较好」。',
    reportDemoPlaceholder: '示意图，实际画面以系统为准。',
    
    // Pricing section
    pricingTitle: '准备给愿意多走那一步的视光师',
    pricingDescription: '我们正在邀请第一批愿意把双眼视觉做完整的视光师，一起打磨这套工具。',
    pricingCta: '立即加入早鸟计划（限额 50 名）',
    pricingSubscribeBtn: '我要订阅',
    pricingMonthlyTitle: '月付方案',
    pricingMonthlyLabel: '先试试看',
    pricingMonthlyOriginal: 'NTD 800 / 月',
    pricingMonthlyPrice: 'NTD 500 / 月',
    pricingMonthlyDesc: [
      '创始用户早鸟价，未来新注册用户可能会依标准价（800 / 月）计费。',
      '适合想先从少量个案开始，把流程跑顺、话术跑熟的个人验光人员与眼科医师。'
    ],
    pricingMonthlyBtn: '先用月付方案试试',
    pricingYearlyTitle: '年付方案',
    pricingYearlyLabel: '验光师首选',
    pricingYearlyOriginal: 'NTD 6,000 / 年',
    pricingYearlyPrice: 'NTD 3,600 / 年',
    pricingYearlySubtext: '平均每月 300 元，每天不到 10 元',
    pricingYearlyBadge: '最划算',
    pricingYearlyDesc: [
      '平均一个月约 300 元，比一杯咖啡还少，却可以帮你每个月省下好几小时的分析与说明时间。',
      '适合已经固定进行双眼视觉检查、希望把流程标准化的验光所与诊所。'
    ],
    pricingYearlyBtn: '我要用年付方案开始',
    pricingTrialTitle: '立即注册，享 14 天完整功能免费试用',
    pricingTrialDesc: '无需绑定信用卡。试用期结束后，你仍可查看既有检查报告，但无法新增新的检查记录。',
    
    // Story last mile explanation
    lastMileExplanation: '（从检查完，到说给顾客听、让顾客点头的那一段）',
    
    // Hero placeholder
    heroPlaceholder: '报告展示图（即将更新）',
    
    // Testimonials section
    testimonialsTitle: '来自同业的声音（即将更新）',
    testimonialPlaceholders: [
      '这里会放上一线视光师的真实使用心得。',
      '这里会放早期用户如何把双眼视觉放进日常流程的故事。'
    ],
    
    // Disclaimer
    disclaimer: 'MYOWNVISION 是一套视觉分析与沟通工具，不是医疗诊断软件。所有评估结果与建议，都需由视光师依自身临床判断，决定最终处置与配镜方案。',
    
    // Footer
    footerCopyright: '© 2024 MYOWNVISION. All rights reserved.',
    footerBy: 'by Myownglasses',

    // Admin
    adminPaymentManagement: '付款管理',
    
    // LINE contact
    lineContactTitle: '有问题吗？欢迎加 LINE 咨询',
    lineContactDesc: '若您对汇款或订阅流程有任何疑问，可以透过 LINE 与我们联系。',
    lineContactBtn: '通过 LINE 联系我们',
  },
  
  'en': {
    // Meta
    pageTitle: 'MYOWNVISION Binocular Vision Analysis System – Binocular Vision Analysis',
    
    // Brand
    brandName: 'MYOWNVISION',
    brandSubtitle: 'Binocular Vision Analysis System',
    brandTagline: 'A smart binocular vision analysis platform, born in Taiwan and built for optometrists worldwide.',
    
    // Nav
    navStory: 'Story',
    navChanges: 'Changes',
    navIndependent: 'Independent',
    navFit: 'Who It\'s For',
    navAbout: 'About Developer',
    navReport: 'Report Demo',
    navPricing: 'Pricing',
    navLogin: 'Log In',
    navStartNow: 'Get Started',
    
    // Hero
    heroHeadline: 'You know binocular vision matters. So why do you keep putting it off?',
    heroSubheadline: 'It\'s not that you lack expertise—you\'re stuck with cumbersome workflows, time pressure, and the challenge of explaining results.',
    heroCta: 'Join Early Adopters Program (Limited to 50)',
    heroCtaSubtext: 'Try demo report or join waitlist after clicking',
    heroSecondaryCta: 'See How It Explains to Patients',
    heroTrialNote: 'Try it for two weeks with real cases. If it doesn\'t save you time or help you explain more confidently, just decide then whether to continue.',
    
    // Product description
    productDescription: 'Turn binocular vision measurements into clear, patient-friendly reports.',
    
    // Story section
    storyTitle: 'Why Do We Keep Hesitating?',
    storyIntro: 'MYOWNVISION transforms binocular vision testing into a streamlined, understandable, patient-friendly process.',
    storyContent: [
      'We\'ve all been trained in comprehensive vision testing: CISS, NPC, AA, MEM, NRA/PRA, fusional ranges—we know what each test does and when to use it.',
      'But the thought of running a full workup—especially when you\'re not fully confident, it takes forever, and patients can\'t sit through it—leads to that familiar inner voice: "Maybe next time."',
      'MYOWNVISION is here to bridge that final gap: turning the skills you already have into a repeatable, understandable, patient-ready visual analysis story.'
    ],
    storyBullets: [
      'Organize scattered tests into a visual health roadmap patients actually understand',
      'Transform your clinical judgment into systematic diagnoses and recommendations—no more reinventing the wheel',
      'Turn a decade of experience into a 5-minute report that stays consistent every time'
    ],
    
    // Changes section
    changesTitle: 'Real Changes You\'ll Experience',
    changesList: [
      'From occasionally doing binocular vision tests to confidently including them in every exam',
      'Report explanation time: 20 min → 5 min',
      'No more improvising—every patient gets the same clear, confident delivery'
    ],
    
    // Independent section
    independentTitle: 'No Equipment Lock-In. No Contracts. Just Your Practice, Your Way.',
    independentIntro: [
      'Most binocular vision analysis systems on the market are tied to specific lens brands, proprietary equipment, or corporate ecosystems.',
      'Often, just to get a decent analysis tool, you\'re forced to sign expensive contracts and buy designated equipment.',
      'From an optometrist\'s perspective, your expertise shouldn\'t be defined by any vendor—and your clinical thinking shouldn\'t be locked into any single brand.'
    ],
    independentStance: [
      'MYOWNVISION takes a different path:',
      'No equipment requirements. No lens brand affiliations. We focus purely on binocular vision analysis—so you can use your own clinical judgment to choose what\'s best for each patient.'
    ],
    independentBullets: [
      'Access analysis features without being forced into long contracts or designated equipment',
      'The system doesn\'t push specific lenses—it organizes data and risks; you make the call',
      'Works with any lens brand or training tool you already use'
    ],
    
    // Fit section
    fitTitle: 'Who Is This For?',
    fitGoodTitle: 'Optometrists Who Will Benefit',
    fitGoodList: [
      'You want to do binocular vision testing but find the workflow scattered and explanations time-consuming',
      'You want to turn your explanations into replicable scripts and reports',
      'You value independence—keeping control over prescriptions and product choices'
    ],
    fitNotGoodTitle: 'This Might Not Be For You If...',
    fitNotGoodList: [
      'You have no intention of doing binocular vision testing and just want quick, basic refraction',
      'You\'re looking for a sales tool to push specific lenses rather than an analysis and communication system'
    ],
    
    // About Developer section
    aboutDevTitle: 'About the Developer: A Frontline Optometrist',
    aboutDevContent: [
      'MyOwnVision wasn\'t built by a software company guessing what optometrists need—it was created by an optometrist still working on the frontline.',
      'Uncle Ocular has spent over 20 years in optical shops and clinics, examining countless pairs of eyes, and lived through the same struggle: "I know binocular vision matters, but I keep hesitating."',
      'To give more optometrists a tool they can actually afford and learn to use, he chose to start again at 50—running his own practice while teaching at Yuanpei University\'s Business Administration department, packaging clinical experience, teaching insights, and management thinking all into this system.',
      'MyOwnVision isn\'t here to replace optometrists—it\'s here to help you become the professional you\'ve always wanted to be: confident, composed, and not led around by any vendor.'
    ],
    
    // Report Demo section
    reportDemoTitle: 'Report Demo: Making Complex Binocular Vision Easy to Understand',
    reportDemoIntro: 'MyOwnVision takes your everyday measurements—CISS, NPC, AA, MEM, NRA/PRA, fusional ranges—and organizes them into a visual map patients can actually understand. Instead of dumping numbers, reports use color zones and simple charts:',
    reportDemoList: [
      'Green: Currently stable, schedule regular follow-ups',
      'Yellow: Needs attention, consider further testing or training',
      'Red: Already significantly affecting visual efficiency, address promptly'
    ],
    reportDemoOutro: 'Patients may not understand prism diopters, but they understand traffic lights. Just follow the chart, and patients will grasp "why these tests matter" and "why this prescription is better for them."',
    reportDemoPlaceholder: 'Illustrative mockup. Actual interface may vary.',
    
    // Pricing section
    pricingTitle: 'For Optometrists Ready to Go the Extra Mile',
    pricingDescription: 'We\'re inviting the first group of optometrists committed to comprehensive binocular vision care to help us refine this tool together.',
    pricingCta: 'Join Early Adopters Program (Limited to 50)',
    pricingSubscribeBtn: 'Subscribe Now',
    pricingMonthlyTitle: 'Monthly Plan',
    pricingMonthlyLabel: 'Try It First',
    pricingMonthlyOriginal: 'USD 30 / month',
    pricingMonthlyPrice: 'USD 20 / month',
    pricingMonthlyDesc: [
      'Early bird pricing for founding members. Future users may be charged at the standard rate ($30/month).',
      'Perfect for individual optometrists or ophthalmologists who want to start small, get the workflow smooth, and master the scripts.'
    ],
    pricingMonthlyBtn: 'Start with Monthly Plan',
    pricingYearlyTitle: 'Annual Plan',
    pricingYearlyLabel: 'Optometrist\'s Choice',
    pricingYearlyOriginal: 'USD 240 / year',
    pricingYearlyPrice: 'USD 120 / year',
    pricingYearlySubtext: 'Just $10/month, less than $0.35/day',
    pricingYearlyBadge: 'Best Value',
    pricingYearlyDesc: [
      'Less than $10/month—cheaper than a coffee—yet saves you hours of analysis and explanation time every month.',
      'Ideal for clinics with established binocular vision testing workflows looking to standardize their process.'
    ],
    pricingYearlyBtn: 'Start with Annual Plan',
    pricingTrialTitle: 'Start your 14-day free trial today',
    pricingTrialDesc: 'No credit card required. After the trial, you can still view existing reports but cannot create new examination records.',
    
    // Story last mile explanation
    lastMileExplanation: '(the gap between completing tests and getting patient buy-in)',
    
    // Hero placeholder
    heroPlaceholder: 'Report Preview (Coming Soon)',
    
    // Testimonials section
    testimonialsTitle: 'Voices from Peers (Coming Soon)',
    testimonialPlaceholders: [
      'Real experiences from frontline optometrists will appear here.',
      'Stories of how early users integrated binocular vision into their daily workflow.'
    ],
    
    // Disclaimer
    disclaimer: 'MYOWNVISION is a visual analysis and communication tool, not medical diagnostic software. All assessments and recommendations require professional clinical judgment by the optometrist to determine final treatment and prescription decisions.',
    
    // Footer
    footerCopyright: '© 2024 MYOWNVISION. All rights reserved.',
    footerBy: 'by Myownglasses',

    // Admin
    adminPaymentManagement: 'Payment Management',
    
    // LINE contact
    lineContactTitle: 'Questions? Contact us via LINE',
    lineContactDesc: 'If you have any questions about payment or subscription, feel free to contact us via LINE.',
    lineContactBtn: 'Contact us via LINE',
  }
};

export const getLandingTranslation = (language: Language): LandingTranslations => {
  return landingTranslations[language];
};
