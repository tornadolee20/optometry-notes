import { CustomerType } from '../types.ts';
// 不再從 templates.ts 導入 CUSTOMER_TYPES，而是在此定義客戶類型

// 定義不同類型的顧客特徵
const CUSTOMER_TYPES: CustomerType[] = [
  {
    type: 'regular',
    name: '一般顧客',
    characteristics: '重視服務品質和體驗，對價格和價值有合理期望'
  },
  {
    type: 'first_time',
    name: '首次造訪顧客',
    characteristics: '好奇心強，注重初次體驗印象，會比較其他選擇'
  },
  {
    type: 'returning',
    name: '回頭顧客',
    characteristics: '對品牌有一定忠誠度，注重一致性和被認可感'
  },
  {
    type: 'value_conscious',
    name: '重視價值顧客',
    characteristics: '特別關注性價比，會比較不同選項以尋找最大價值'
  },
  {
    type: 'enthusiastic',
    name: '熱情顧客',
    characteristics: '對體驗充滿熱情，樂於分享詳細且熱情的評價'
  },
  {
    type: 'critical',
    name: '挑剔顧客',
    characteristics: '注重細節，有較高標準，評論中會提及值得改進之處'
  },
  {
    type: 'casual',
    name: '隨性顧客', 
    characteristics: '輕鬆隨意，享受整體體驗，不太關注細節'
  },
  {
    type: 'family',
    name: '家庭顧客',
    characteristics: '重視適合全家人的環境和服務，特別注重安全與舒適'
  }
];

// 隨機獲取一種顧客類型
export const getRandomCustomerType = async (): Promise<CustomerType> => {
  const randomIndex = Math.floor(Math.random() * CUSTOMER_TYPES.length);
  return CUSTOMER_TYPES[randomIndex];
};