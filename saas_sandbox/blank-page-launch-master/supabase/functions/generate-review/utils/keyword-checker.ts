// Synonym dictionary for keyword matching across industries
const KEYWORD_SYNONYMS: Record<string, string[]> = {
  // Optical store specific
  '商務親切': ['親切', '服務好', '態度好', '友善', '熱情', '貼心'],
  '設備專業': ['專業', '設備', '器材', '技術', '精準', '先進'],
  '同理客戶': ['同理', '理解', '體貼', '了解需求', '貼心', '細心'],

  // General service
  '回頭客多': ['回頭客', '再次光顧', '常客', '熟客', '老顧客', '重複消費'],
  '在地推薦': ['推薦', '在地', '本地', '當地', '口碑好', '鄰居介紹'],
  '服務態度好': ['服務', '態度', '親切', '友善', '熱情'],
  '環境舒適': ['環境', '舒適', '氛圍', '空間', '整潔'],
  '價格合理': ['價格', '合理', '划算', '實惠', '性價比'],
  '交通便利': ['交通', '便利', '方便', '位置', '地點'],
  '停車方便': ['停車', '方便', '車位', '交通'],
  '專業技術': ['專業', '技術', '技巧', '水準'],
  '值得推薦': ['推薦', '值得', '不錯', '優質'],

  // Food & beverage
  '食物美味': ['美味', '好吃', '味道', '口感', '料理', '餐點', '菜色'],
  '份量充足': ['份量', '充足', '實在', '豐富', '飽足'],
  '衛生乾淨': ['衛生', '乾淨', '整潔', '清潔'],
  '氣氛佳': ['氣氛', '氛圍', '環境', '感覺', '溫馨'],
  '服務迅速': ['迅速', '快速', '效率', '及時', '出餐快'],

  // Retail
  '商品齊全': ['商品', '齊全', '選擇多', '種類豐富', '貨品完整'],
  '品質優良': ['品質', '優良', '質量好', '做工精緻'],
  '裝潢優雅': ['裝潢', '優雅', '設計', '佈置', '美觀'],

  // Beauty & hair
  '技術精湛': ['技術', '精湛', '手法', '專業', '技巧好'],
  '產品優質': ['產品', '優質', '用料好', '品牌好'],

  // Medical
  '醫師專業': ['醫師', '專業', '醫生', '診斷', '經驗豐富'],
  '設備先進': ['設備', '先進', '器材', '儀器', '現代化'],

  // Education
  '教學認真': ['教學', '認真', '老師', '用心', '負責'],
  '師資優良': ['師資', '優良', '老師好', '教師專業'],

  // Service industry
  '服務效率': ['效率', '迅速', '快速', '及時', '準時'],
  '工作仔細': ['仔細', '細心', '用心', '認真', '負責'],

  // Entertainment & leisure
  '設施完善': ['設施', '完善', '設備', '齊全', '功能多'],
  '環境安全': ['安全', '環境', '放心', '可靠'],

  // Other
  '老闆很帥': ['老闆', '帥', '外型', '形象', '氣質', '有型'],
  '親子友善': ['親子', '友善', '小孩', '家庭', '適合帶小朋友'],
  '寵物友善': ['寵物', '友善', '毛小孩', '可帶寵物'],
  '無障礙設施': ['無障礙', '設施', '友善', '便利', '輪椅'],
};

/**
 * Check if a keyword is present in the review text,
 * considering both direct match and synonym match.
 */
export function isKeywordPresent(keyword: string, review: string): boolean {
  if (review.includes(keyword)) return true;

  const synonyms = KEYWORD_SYNONYMS[keyword] || [];
  return synonyms.some((synonym) => review.includes(synonym));
}

/**
 * Find keywords that are missing from the review text.
 */
export function findMissingKeywords(
  keywords: string[],
  review: string
): string[] {
  return keywords.filter((kw) => !isKeywordPresent(kw, review));
}
