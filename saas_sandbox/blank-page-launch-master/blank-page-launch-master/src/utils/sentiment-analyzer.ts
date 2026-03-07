// 情感分析引擎
export class SentimentAnalyzer {
  // 負面情感關鍵詞庫
  private static negativeKeywords = {
    // 服務相關負面詞彙
    service: [
      '態度差', '不耐煩', '冷漠', '敷衍', '無禮', '粗魯', '不友善', '傲慢',
      '沒禮貌', '服務差', '不專業', '漫不經心', '愛理不理', '擺臭臉',
      '等很久', '慢吞吞', '效率差', '反應慢', '拖拖拉拉', '強迫推銷', '過度推銷', '硬推', '推銷不停'
    ],
    
    // 品質相關負面詞彙
    quality: [
      '品質差', '很爛', '不好吃', '難吃', '變質', '過期', '不新鮮', '油膩',
      '太鹹', '太甜', '太辣', '沒味道', '口感差', '賣相差', '材料差',
      '便宜貨', '劣質', '粗糙', '做工差', '瑕疵', '破損', '故障'
    ],
    
    // 環境相關負面詞彙
    environment: [
      '髒亂', '臭味', '嘈雜', '擠迫', '陰暗', '潮濕', '悶熱', '冷清',
      '裝潢老舊', '設備故障', '沒冷氣', '太吵', '位置差', '停車不便',
      '廁所髒', '座位不舒服', '燈光太暗', '通風差'
    ],
    
    // 價格相關負面詞彙
    pricing: [
      '太貴', '貴死了', '坑錢', '不值得', '性價比差', '黑店', '亂收費',
      '偷工減料', '份量少', '縮水', '漲價', '收費不合理', 'CP值低'
    ],
    
    // 整體感受負面詞彙
    overall: [
      '失望', '後悔', '不會再來', '踩雷', '浪費時間', '浪費錢', '很糟',
      '不推薦', '避雷', '地雷店', '超爛', '很扯', '誇張', '離譜'
    ]
  };

  // 正面情感關鍵詞庫
  private static positiveKeywords = {
    service: [
      '親切', '友善', '專業', '貼心', '細心', '耐心', '熱情', '周到',
      '服務好', '態度佳', '笑容滿面', '主動', '迅速', '效率高'
    ],
    
    quality: [
      '好吃', '美味', '新鮮', '香濃', '口感好', '精緻', '優質', '高品質',
      '用料實在', '製作精良', '品質穩定', '物超所值'
    ],
    
    environment: [
      '舒適', '乾淨', '明亮', '寬敞', '溫馨', '優雅', '裝潢美', '氛圍好',
      '環境佳', '位置好', '交通便利', '停車方便'
    ],
    
    pricing: [
      '便宜', '實惠', '划算', '超值', 'CP值高', '物美價廉', '價格合理',
      '份量足', '經濟實惠'
    ],
    
    overall: [
      '滿意', '推薦', '會再來', '很棒', '不錯', '值得', '喜歡', '讚'
    ]
  };

  // 否定詞處理與匹配輔助
  private static isNegatedPositive(input: string, keyword: string): boolean {
    const patterns = [
      new RegExp(`(?:不|沒有|無|未)${keyword}`),
      new RegExp(`${keyword}(?:不足|不佳|不夠|太少)`),
      new RegExp(`(?:缺乏|欠缺)${keyword}`)
    ];
    return patterns.some((r) => r.test(input));
  }

  private static isNegatedNegative(input: string, keyword: string): boolean {
    const patterns = [
      new RegExp(`(?:不|沒有|無|未)${keyword}`)
    ];
    return patterns.some((r) => r.test(input));
  }

  // 分析用戶輸入的感受
  public static analyzeSentiment(userInput: string[]): {
    sentiment: 'positive' | 'negative' | 'neutral';
    score: number;
    negativeCount: number;
    positiveCount: number;
    categories: {
      negative: string[];
      positive: string[];
    };
  } {
    let negativeCount = 0;
    let positiveCount = 0;
    const negativeCategories: string[] = [];
    const positiveCategories: string[] = [];

    // 分析每個用戶輸入
    userInput.forEach(input => {
      // 使用原始輸入進行匹配（中文不區分大小寫）
      
      // 檢查負面關鍵詞（處理否定詞）
      Object.entries(this.negativeKeywords).forEach(([category, keywords]) => {
        keywords.forEach((keyword) => {
          if (input.includes(keyword)) {
            if (this.isNegatedNegative(input, keyword)) {
              // 否定負面 => 略作正向訊號
              positiveCount++;
              if (!positiveCategories.includes(category)) {
                positiveCategories.push(category);
              }
            } else {
              negativeCount++;
              if (!negativeCategories.includes(category)) {
                negativeCategories.push(category);
              }
            }
          }
        });
      });

      // 檢查正面關鍵詞（避免子字串誤判與否定）
      Object.entries(this.positiveKeywords).forEach(([category, keywords]) => {
        keywords.forEach((keyword) => {
          if (input.includes(keyword)) {
            // 若同一句已包含明確的負面複合詞（例如「不專業」），避免重複加分
            const hasExplicitNeg = Object.values(this.negativeKeywords).some((arr) =>
              arr.some((neg) => input.includes(neg) && neg.includes(keyword))
            );
            if (hasExplicitNeg) {
              return;
            }
            if (this.isNegatedPositive(input, keyword)) {
              // 正向詞被否定 => 視為負面
              negativeCount++;
              if (!negativeCategories.includes(category)) {
                negativeCategories.push(category);
              }
            } else {
              positiveCount++;
              if (!positiveCategories.includes(category)) {
                positiveCategories.push(category);
              }
            }
          }
        });
      });
    });

    // 計算情感分數 (-1 到 1)
    const totalCount = negativeCount + positiveCount;
    let score = 0;
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';

    if (totalCount > 0) {
      score = (positiveCount - negativeCount) / totalCount;
    }

    // 根據Google政策，如果有3個以上負面感受，應該生成負面評論
    if (negativeCount >= 3 || score <= -0.3) {
      sentiment = 'negative';
    } else if (positiveCount > negativeCount && score >= 0.3) {
      sentiment = 'positive';
    } else {
      sentiment = 'neutral';
    }

    return {
      sentiment,
      score,
      negativeCount,
      positiveCount,
      categories: {
        negative: negativeCategories,
        positive: positiveCategories
      }
    };
  }

  // 根據情感分析結果確定評論風格
  public static determineReviewStyle(sentimentAnalysis: ReturnType<typeof SentimentAnalyzer.analyzeSentiment>): {
    style: 'positive' | 'negative' | 'balanced';
    tone: 'constructive' | 'disappointed' | 'satisfied' | 'mixed';
    starRating: number;
    suggestions: string[];
  } {
    const { sentiment, score: _score, negativeCount, positiveCount: _positiveCount } = sentimentAnalysis;

    let style: 'positive' | 'negative' | 'balanced';
    let tone: 'constructive' | 'disappointed' | 'satisfied' | 'mixed';
    let starRating: number;
    const suggestions: string[] = [];

    if (sentiment === 'negative') {
      style = 'negative';
      
      if (negativeCount >= 5) {
        tone = 'disappointed';
        starRating = Math.floor(Math.random() * 2) + 1; // 1-2星
        suggestions.push('強調具體問題');
        suggestions.push('提供改善建議');
        suggestions.push('保持客觀描述');
      } else {
        tone = 'constructive';
        starRating = Math.floor(Math.random() * 2) + 2; // 2-3星
        suggestions.push('平衡正負面評價');
        suggestions.push('給予建設性意見');
      }
    } else if (sentiment === 'positive') {
      style = 'positive';
      tone = 'satisfied';
      starRating = Math.floor(Math.random() * 2) + 4; // 4-5星
      suggestions.push('強調優點');
      suggestions.push('推薦給他人');
    } else {
      style = 'balanced';
      tone = 'mixed';
      starRating = 3; // 3星
      suggestions.push('平衡描述優缺點');
      suggestions.push('提供中肯評價');
    }

    return {
      style,
      tone,
      starRating,
      suggestions
    };
  }

  // 生成評論指導原則
  public static generateReviewGuidelines(
    sentimentAnalysis: ReturnType<typeof SentimentAnalyzer.analyzeSentiment>,
    reviewStyle: ReturnType<typeof SentimentAnalyzer.determineReviewStyle>
  ): {
    opening: string[];
    bodyStructure: string[];
    closing: string[];
    avoidances: string[];
  } {
    const { style, tone: _tone } = reviewStyle;
    const { categories: _categories } = sentimentAnalysis;

    const guidelines = {
      opening: [] as string[],
      bodyStructure: [] as string[],
      closing: [] as string[],
      avoidances: [] as string[]
    };

    if (style === 'negative') {
      guidelines.opening = [
        '以客觀的事實描述開始',
        '提及期待與現實的落差',
        '說明選擇該店家的原因'
      ];
      
      guidelines.bodyStructure = [
        '具體描述遇到的問題',
        '分別針對服務、品質、環境等方面說明',
        '保持客觀，避免情緒性字眼',
        '可以提及其他顧客的反應'
      ];
      
      guidelines.closing = [
        '提供改善建議',
        '表達希望店家能改進',
        '說明是否會再次光顧',
        '建議其他顧客注意的事項'
      ];
      
      guidelines.avoidances = [
        '避免使用極端負面詞彙',
        '不要人身攻擊',
        '不要完全否定店家',
        '避免不實指控'
      ];
      
    } else if (style === 'positive') {
      guidelines.opening = [
        '表達整體滿意度',
        '說明推薦原因',
        '描述第一印象'
      ];
      
      guidelines.bodyStructure = [
        '詳細描述優質體驗',
        '分別讚美不同面向',
        '提及具體細節',
        '描述感受和情緒'
      ];
      
      guidelines.closing = [
        '表達會再次光顧',
        '推薦給朋友',
        '總結推薦理由'
      ];
      
    } else {
      guidelines.opening = [
        '平衡描述整體印象',
        '說明體驗的複雜性'
      ];
      
      guidelines.bodyStructure = [
        '先提及優點',
        '客觀描述需改善之處',
        '比較同類店家',
        '給予公平評價'
      ];
      
      guidelines.closing = [
        '總結優缺點',
        '給予中性建議',
        '說明適合的顧客群'
      ];
    }

    return guidelines;
  }

  // 驗證評論是否符合Google政策
  public static validateGoogleCompliance(
    userInput: string[],
    sentimentAnalysis: ReturnType<typeof SentimentAnalyzer.analyzeSentiment>
  ): {
    isCompliant: boolean;
    warnings: string[];
    recommendations: string[];
  } {
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // 檢查是否只允許正面評論（違反Google政策）
    if (sentimentAnalysis.negativeCount >= 3 && sentimentAnalysis.sentiment !== 'negative') {
      warnings.push('檢測到多個負面感受，但系統可能強制生成正面評論');
      recommendations.push('應該根據用戶真實感受生成對應風格的評論');
    }

    // 檢查評論真實性
    if (userInput.some(input => input.includes('一定要給五星') || input.includes('必須好評'))) {
      warnings.push('檢測到可能的評論操作意圖');
      recommendations.push('評論應基於真實體驗，不應強制要求特定評分');
    }

    // 檢查是否有虛假信息指標
    const suspiciousPatterns = [
      '完美無缺', '絕對沒問題', '百分百滿意', '世界第一'
    ];

    userInput.forEach(input => {
      suspiciousPatterns.forEach(pattern => {
        if (input.includes(pattern)) {
          warnings.push(`檢測到可能過於誇張的描述: "${pattern}"`);
          recommendations.push('評論應該更加真實和具體');
        }
      });
    });

    const isCompliant = warnings.length === 0;

    if (isCompliant) {
      recommendations.push('評論風格符合Google政策要求');
      recommendations.push('可以根據真實感受生成對應評論');
    }

    return {
      isCompliant,
      warnings,
      recommendations
    };
  }
}

// React Hook for sentiment analysis
export const useSentimentAnalysis = () => {
  return {
    analyzeSentiment: SentimentAnalyzer.analyzeSentiment,
    determineReviewStyle: SentimentAnalyzer.determineReviewStyle,
    generateGuidelines: SentimentAnalyzer.generateReviewGuidelines,
    validateCompliance: SentimentAnalyzer.validateGoogleCompliance
  };
};