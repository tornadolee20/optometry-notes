

export const defaultKeywords = [
  "服務態度好", "環境整潔", "價格實惠", "專業技術", 
  "設備完善", "交通方便", "停車方便", "氣氛舒適",
  "CP值高", "回客率高", "推薦朋友", "值得再訪", 
  "商品多樣", "品質保證", "服務親切", "經驗豐富", "有溫度的"
].map((keyword, index) => ({
  id: crypto.randomUUID(),
  keyword,
  category: 'general' as const,
  source: 'ai' as const,
  is_primary: false,
  usage_count: 0,
  priority: index
}));
