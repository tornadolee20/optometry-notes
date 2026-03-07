// 語感增強器 - 提升評論的自然語感和情感表達

interface LanguageStyle {
  type: string;
  patterns: string[];
  connectors: string[];
  endings: string[];
  emotionalWords: string[];
}

// 8種不同的語感風格
export const LANGUAGE_STYLES: LanguageStyle[] = [
  {
    type: "溫暖親切",
    patterns: [
      "真的覺得{keyword}，讓人很有感",
      "整個過程{keyword}，心情都變好了",
      "說真的，{keyword}這點讓我印象超深刻"
    ],
    connectors: ["而且", "加上", "另外", "更棒的是"],
    endings: ["真心推薦", "值得一試", "不會後悔"],
    emotionalWords: ["暖心", "貼心", "用心", "細心"]
  },
  {
    type: "生活化口語",
    patterns: [
      "講真的{keyword}真的沒話說",
      "不得不說{keyword}確實不錯",
      "老實講{keyword}超出我預期"
    ],
    connectors: ["然後", "接著", "後來", "結果"],
    endings: ["蠻推的", "值得去", "不踩雷"],
    emotionalWords: ["舒服", "順眼", "合我意", "滿意"]
  },
  {
    type: "情感共鳴",
    patterns: [
      "身為{角色}，最在意的就是{keyword}",
      "我這種{特質}的人，對{keyword}特別敏感",
      "以我多年的經驗來說，{keyword}真的很重要"
    ],
    connectors: ["因為", "畢竟", "尤其是", "特別是"],
    endings: ["深有同感", "感同身受", "心有戚戚"],
    emotionalWords: ["感動", "驚喜", "滿足", "放心"]
  },
  {
    type: "細膩觀察",
    patterns: [
      "細節上{keyword}做得很到位",
      "從{keyword}可以看出店家的用心",
      "注意到{keyword}這個小地方，覺得很加分"
    ],
    connectors: ["包括", "像是", "比如說", "舉例來說"],
    endings: ["很用心", "有質感", "很專業"],
    emotionalWords: ["精緻", "細膩", "周到", "體貼"]
  },
  {
    type: "對比感受",
    patterns: [
      "跟之前去的比較，這家{keyword}明顯更好",
      "原本期待不高，結果{keyword}讓我刮目相看",
      "一開始有點擔心，但{keyword}完全打消我的疑慮"
    ],
    connectors: ["相比之下", "反而", "沒想到", "意外地"],
    endings: ["超出預期", "刮目相看", "改觀了"],
    emotionalWords: ["驚艷", "意外", "轉念", "釋懷"]
  },
  {
    type: "實用分享",
    patterns: [
      "對於重視{keyword}的人來說，這裡真的適合",
      "如果你跟我一樣在意{keyword}，這家不錯",
      "想要{keyword}的話，推薦來這裡試試"
    ],
    connectors: ["所以", "因此", "這樣", "總之"],
    endings: ["值得推薦", "可以考慮", "不會錯"],
    emotionalWords: ["實用", "方便", "省心", "安心"]
  },
  {
    type: "故事敘述",
    patterns: [
      "記得那天{keyword}的感覺真的很棒",
      "整個{keyword}的過程讓我印象深刻",
      "當下感受到{keyword}的時候，就知道來對了"
    ],
    connectors: ["接下來", "然後", "於是", "就這樣"],
    endings: ["很滿意", "很開心", "很慶幸"],
    emotionalWords: ["回味", "難忘", "深刻", "珍貴"]
  },
  {
    type: "理性分析",
    patterns: [
      "從{keyword}這方面來看，表現確實不錯",
      "客觀來說{keyword}算是他們的強項",
      "綜合評估{keyword}的部分很有水準"
    ],
    connectors: ["另一方面", "同時", "此外", "再者"],
    endings: ["值得肯定", "表現優異", "水準之上"],
    emotionalWords: ["穩定", "可靠", "專業", "優質"]
  }
];

// 根據關鍵字類型選擇合適的語感風格
export function selectLanguageStyle(keywords: string[], sentiment: string): LanguageStyle {
  const hasServiceKeywords = keywords.some(k => 
    k.includes('服務') || k.includes('親切') || k.includes('專業')
  );
  const hasQualityKeywords = keywords.some(k => 
    k.includes('品質') || k.includes('優質') || k.includes('精緻')
  );
  const hasPriceKeywords = keywords.some(k => 
    k.includes('價格') || k.includes('CP值') || k.includes('划算')
  );

  let preferredStyles: number[] = [];

  if (sentiment === 'positive') {
    if (hasServiceKeywords) preferredStyles = [0, 2, 3]; // 溫暖親切、情感共鳴、細膩觀察
    else if (hasQualityKeywords) preferredStyles = [3, 7]; // 細膩觀察、理性分析
    else if (hasPriceKeywords) preferredStyles = [1, 5]; // 生活化口語、實用分享
    else preferredStyles = [0, 1, 6]; // 溫暖親切、生活化口語、故事敘述
  } else if (sentiment === 'negative') {
    preferredStyles = [4, 7]; // 對比感受、理性分析
  } else {
    preferredStyles = [4, 5, 7]; // 對比感受、實用分享、理性分析
  }

  if (preferredStyles.length === 0) {
    preferredStyles = [0, 1, 2]; // 默認選擇
  }

  const randomIndex = preferredStyles[Math.floor(Math.random() * preferredStyles.length)];
  return LANGUAGE_STYLES[randomIndex];
}

// 將關鍵字融入到語感表達中
export function enhanceLanguageExpression(
  keywords: string[], 
  sentiment: string,
  customerType: string
): {
  enhancedPatterns: string[];
  naturalConnectors: string[];
  emotionalEndings: string[];
} {
  const style = selectLanguageStyle(keywords, sentiment);
  
  // 根據客戶類型調整角色標籤
  const roleLabels: Record<string, string> = {
    '專業顧客': '比較注重細節',
    '家庭顧客': '全家都有需求',
    '學生顧客': '預算有限',
    '上班族顧客': '工作繁忙',
    '年長顧客': '經驗豐富',
    '回頭顧客': '老客戶',
    '一般顧客': '普通消費者',
    '隨性顧客': '隨興的人'
  };

  const role = roleLabels[customerType] || '一般消費者';
  
  // 將關鍵字融入模式中
  const enhancedPatterns = style.patterns.map(pattern => {
    return pattern
      .replace('{角色}', role)
      .replace('{特質}', role);
  });

  return {
    enhancedPatterns,
    naturalConnectors: style.connectors,
    emotionalEndings: style.endings
  };
}