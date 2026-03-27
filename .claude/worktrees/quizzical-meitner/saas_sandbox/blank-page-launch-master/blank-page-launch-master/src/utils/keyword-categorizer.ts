/**
 * 關鍵字分類器工具
 * 用於將關鍵字按照不同維度進行分類和組織
 */

export interface KeywordCategory {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  weight: number; // 權重，影響關鍵字在生成評論中的重要性
}

export interface CategorizedKeyword {
  keyword: string;
  category: string;
  subcategory?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  intensity: 'low' | 'medium' | 'high';
  frequency: number; // 使用頻率
}

/**
 * 預定義的關鍵字分類
 */
export const DEFAULT_CATEGORIES: KeywordCategory[] = [
  {
    id: 'product_quality',
    name: '產品品質',
    description: '描述產品質量和特性的關鍵字',
    keywords: [
      '品質優良', '物超所值', '設計精美', '耐用持久', '創新實用',
      '工藝精湛', '材質優質', '功能完善', '性能卓越', '品質穩定'
    ],
    weight: 0.9
  },
  {
    id: 'service_experience',
    name: '服務體驗',
    description: '描述客戶服務和購物體驗的關鍵字',
    keywords: [
      '服務親切', '快速回應', '專業細心', '耐心解答', '樂於助人',
      '態度友善', '服務周到', '專業素養', '貼心服務', '效率很高'
    ],
    weight: 0.8
  },
  {
    id: 'delivery_logistics',
    name: '配送物流',
    description: '描述配送和物流相關的關鍵字',
    keywords: [
      '快速配送', '包裝完整', '準時到達', '小心處理', '物流透明',
      '配送迅速', '包裝精美', '運送安全', '到貨及時', '物流順暢'
    ],
    weight: 0.7
  },
  {
    id: 'emotional_expression',
    name: '情感表達',
    description: '表達情感和滿意度的關鍵字',
    keywords: [
      '非常滿意', '大力推薦', '值得信賴', '愉快體驗', '超出期待',
      '印象深刻', '驚喜連連', '心滿意足', '讚不絕口', '五星好評'
    ],
    weight: 0.85
  },
  {
    id: 'value_proposition',
    name: '價值主張',
    description: '描述性價比和價值的關鍵字',
    keywords: [
      '性價比高', '價格合理', '經濟實惠', '超值選擇', '物美價廉',
      '划算購買', '值得購買', '投資報酬率高', 'CP值很高', '價格親民'
    ],
    weight: 0.75
  },
  {
    id: 'user_experience',
    name: '使用體驗',
    description: '描述產品使用感受的關鍵字',
    keywords: [
      '使用方便', '操作簡單', '功能實用', '體驗良好', '效果顯著',
      '易於上手', '直覺操作', '使用順暢', '效果明顯', '符合需求'
    ],
    weight: 0.8
  }
];

/**
 * 關鍵字分類器類
 */
export class KeywordCategorizer {
  private categories: KeywordCategory[];
  private keywordMap: Map<string, CategorizedKeyword>;

  constructor(categories: KeywordCategory[] = DEFAULT_CATEGORIES) {
    this.categories = categories;
    this.keywordMap = new Map();
    this.initializeKeywordMap();
  }

  /**
   * 初始化關鍵字映射表
   */
  private initializeKeywordMap(): void {
    this.categories.forEach(category => {
      category.keywords.forEach(keyword => {
        const categorizedKeyword: CategorizedKeyword = {
          keyword,
          category: category.id,
          sentiment: this.determineSentiment(keyword),
          intensity: this.determineIntensity(keyword),
          frequency: Math.floor(Math.random() * 100) + 1 // 模擬使用頻率
        };
        this.keywordMap.set(keyword, categorizedKeyword);
      });
    });
  }

  /**
   * 判斷關鍵字的情感傾向
   */
  private determineSentiment(keyword: string): 'positive' | 'neutral' | 'negative' {
    const positiveIndicators = ['優', '好', '棒', '讚', '滿意', '推薦', '值得', '愉快', '驚喜'];
    const negativeIndicators = ['差', '壞', '爛', '失望', '不滿', '問題', '困難'];

    if (positiveIndicators.some(indicator => keyword.includes(indicator))) {
      return 'positive';
    }
    if (negativeIndicators.some(indicator => keyword.includes(indicator))) {
      return 'negative';
    }
    return 'neutral';
  }

  /**
   * 判斷關鍵字的強度
   */
  private determineIntensity(keyword: string): 'low' | 'medium' | 'high' {
    const highIntensityIndicators = ['非常', '超', '極', '大力', '強烈', '驚'];
    const lowIntensityIndicators = ['稍', '略', '還', '算'];

    if (highIntensityIndicators.some(indicator => keyword.includes(indicator))) {
      return 'high';
    }
    if (lowIntensityIndicators.some(indicator => keyword.includes(indicator))) {
      return 'low';
    }
    return 'medium';
  }

  /**
   * 根據關鍵字獲取分類信息
   */
  public categorizeKeyword(keyword: string): CategorizedKeyword | null {
    return this.keywordMap.get(keyword) || null;
  }

  /**
   * 根據分類獲取關鍵字列表
   */
  public getKeywordsByCategory(categoryId: string): string[] {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.keywords : [];
  }

  /**
   * 獲取所有分類
   */
  public getCategories(): KeywordCategory[] {
    return this.categories;
  }

  /**
   * 根據情感傾向篩選關鍵字
   */
  public getKeywordsBySentiment(sentiment: 'positive' | 'neutral' | 'negative'): CategorizedKeyword[] {
    return Array.from(this.keywordMap.values()).filter(
      keyword => keyword.sentiment === sentiment
    );
  }

  /**
   * 根據強度篩選關鍵字
   */
  public getKeywordsByIntensity(intensity: 'low' | 'medium' | 'high'): CategorizedKeyword[] {
    return Array.from(this.keywordMap.values()).filter(
      keyword => keyword.intensity === intensity
    );
  }

  /**
   * 智能推薦關鍵字
   * 根據已選關鍵字推薦相關的關鍵字
   */
  public recommendKeywords(selectedKeywords: string[], limit: number = 10): string[] {
    if (selectedKeywords.length === 0) {
      // 如果沒有選擇關鍵字，返回高頻使用的關鍵字
      return Array.from(this.keywordMap.values())
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, limit)
        .map(k => k.keyword);
    }

    // 分析已選關鍵字的分類分佈
    const categoryCount = new Map<string, number>();
    selectedKeywords.forEach(keyword => {
      const categorized = this.categorizeKeyword(keyword);
      if (categorized) {
        const count = categoryCount.get(categorized.category) || 0;
        categoryCount.set(categorized.category, count + 1);
      }
    });

    // 找出主要分類
    const dominantCategories = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(entry => entry[0]);

    // 從主要分類中推薦關鍵字
    const recommendations: string[] = [];
    dominantCategories.forEach(categoryId => {
      const categoryKeywords = this.getKeywordsByCategory(categoryId)
        .filter(keyword => !selectedKeywords.includes(keyword));
      recommendations.push(...categoryKeywords.slice(0, Math.ceil(limit / dominantCategories.length)));
    });

    return recommendations.slice(0, limit);
  }

  /**
   * 分析關鍵字組合的平衡性
   */
  public analyzeKeywordBalance(keywords: string[]): {
    categoryDistribution: Record<string, number>;
    sentimentDistribution: Record<string, number>;
    intensityDistribution: Record<string, number>;
    suggestions: string[];
  } {
    const categoryDist: Record<string, number> = {};
    const sentimentDist: Record<string, number> = {};
    const intensityDist: Record<string, number> = {};
    const suggestions: string[] = [];

    keywords.forEach(keyword => {
      const categorized = this.categorizeKeyword(keyword);
      if (categorized) {
        categoryDist[categorized.category] = (categoryDist[categorized.category] || 0) + 1;
        sentimentDist[categorized.sentiment] = (sentimentDist[categorized.sentiment] || 0) + 1;
        intensityDist[categorized.intensity] = (intensityDist[categorized.intensity] || 0) + 1;
      }
    });

    // 生成平衡性建議
    if ((sentimentDist.positive || 0) < keywords.length * 0.7) {
      suggestions.push('建議增加更多正面情感的關鍵字');
    }

    if (Object.keys(categoryDist).length < 3) {
      suggestions.push('建議選擇更多不同分類的關鍵字以增加多樣性');
    }

    if ((intensityDist.high || 0) > keywords.length * 0.5) {
      suggestions.push('高強度關鍵字過多，建議適度調整以保持自然感');
    }

    return {
      categoryDistribution: categoryDist,
      sentimentDistribution: sentimentDist,
      intensityDistribution: intensityDist,
      suggestions
    };
  }

  /**
   * 生成關鍵字統計報告
   */
  public generateReport(keywords: string[]): {
    totalKeywords: number;
    categorizedKeywords: number;
    uncategorizedKeywords: string[];
    topCategories: Array<{ category: string; count: number; percentage: number }>;
    sentimentScore: number; // -1 到 1 的分數
  } {
    const categorized: string[] = [];
    const uncategorized: string[] = [];
    const categoryCount = new Map<string, number>();

    keywords.forEach(keyword => {
      const categorizedKeyword = this.categorizeKeyword(keyword);
      if (categorizedKeyword) {
        categorized.push(keyword);
        const count = categoryCount.get(categorizedKeyword.category) || 0;
        categoryCount.set(categorizedKeyword.category, count + 1);
      } else {
        uncategorized.push(keyword);
      }
    });

    const topCategories = Array.from(categoryCount.entries())
      .map(([category, count]) => ({
        category,
        count,
        percentage: (count / categorized.length) * 100
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 計算情感分數
    let sentimentScore = 0;
    categorized.forEach(keyword => {
      const categorizedKeyword = this.categorizeKeyword(keyword);
      if (categorizedKeyword) {
        switch (categorizedKeyword.sentiment) {
          case 'positive':
            sentimentScore += 1;
            break;
          case 'negative':
            sentimentScore -= 1;
            break;
          // neutral 不改變分數
        }
      }
    });
    sentimentScore = categorized.length > 0 ? sentimentScore / categorized.length : 0;

    return {
      totalKeywords: keywords.length,
      categorizedKeywords: categorized.length,
      uncategorizedKeywords: uncategorized,
      topCategories,
      sentimentScore
    };
  }
}

/**
 * 預設的關鍵字分類器實例
 */
export const defaultCategorizer = new KeywordCategorizer();

/**
 * 快捷函數：分類單個關鍵字
 */
export function categorizeKeyword(keyword: string): CategorizedKeyword | null {
  return defaultCategorizer.categorizeKeyword(keyword);
}

/**
 * 快捷函數：推薦關鍵字
 */
export function recommendKeywords(selectedKeywords: string[], limit: number = 10): string[] {
  return defaultCategorizer.recommendKeywords(selectedKeywords, limit);
}

/**
 * 快捷函數：分析關鍵字平衡性
 */
export function analyzeKeywordBalance(keywords: string[]) {
  return defaultCategorizer.analyzeKeywordBalance(keywords);
}

/**
 * 根據分類分組關鍵字
 */
export function groupKeywordsByCategory(keywords: string[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  
  keywords.forEach(keyword => {
    const categorized = defaultCategorizer.categorizeKeyword(keyword);
    const categoryId = categorized?.category || 'uncategorized';
    
    if (!grouped[categoryId]) {
      grouped[categoryId] = [];
    }
    grouped[categoryId].push(keyword);
  });
  
  return grouped;
}

/**
 * 關鍵字分類常數 (向後兼容)
 */
export const KEYWORD_CATEGORIES = DEFAULT_CATEGORIES;