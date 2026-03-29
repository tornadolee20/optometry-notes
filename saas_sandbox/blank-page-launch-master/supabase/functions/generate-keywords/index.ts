import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const getIndustryPrompt = (industry: string) => {
  const prompts: Record<string, { keywords: string[], avoid: string[] }> = {
    '眼鏡店': {
      keywords: [
        '驗光技術', '鏡片品質', '鏡框選擇', '配鏡精準度', '售後服務',
        '價格透明', '專業建議', '舒適度', '視覺效果', '品牌正貨'
      ],
      avoid: ['最便宜', '免費', '絕對保證', '百分百', '最優惠']
    },
    '餐廳': {
      keywords: [
        '食材新鮮', '口感特色', '份量適中', '環境整潔', '服務態度',
        '價格合理', '用餐氛圍', '等候時間', '座位舒適', '特色菜品'
      ],
      avoid: ['最好吃', '必吃', '人生必訪', '絕無僅有', '無敵']
    },
    '美容院': {
      keywords: [
        '專業技術', '服務態度', '環境衛生', '效果明顯', '價格透明',
        '設備完善', '產品品質', '預約制度', '隱私保護', '售後跟進'
      ],
      avoid: ['最專業', '保證效果', '永久', '最低價', '包證']
    }
  };

  const defaultPrompt = {
    keywords: [
      '服務品質', '專業水準', '環境整潔', '價格合理', '服務態度',
      '設備完善', '交通方便', '停車方便', '整體評價', '推薦程度'
    ],
    avoid: ['最好', '最棒', '必選', '保證', '永久']
  };

  return prompts[industry] || defaultPrompt;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storeName, industry, description, primaryKeywords = [] } = await req.json();
    console.log('接收到的請求參數:', { storeName, industry, description, primaryKeywords });

    // 如果已有40個或更多關鍵字，只生成建議但不自動返回舊的
    if (primaryKeywords.length >= 40) {
      // 接近上限，生成少量建議
      const remainingSlots = Math.max(0, 48 - primaryKeywords.length);
      if (remainingSlots === 0) {
        return new Response(
          JSON.stringify({ keywords: [] }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('Missing OpenAI API key');
    }

    const industryData = getIndustryPrompt(industry);
    const maxSuggestions = 8; // 每次建議8個關鍵字
    const remainingSlots = Math.max(0, 48 - primaryKeywords.length);
    const suggestionsToGenerate = Math.min(maxSuggestions, remainingSlots);
    
    const systemPrompt = `你是一位專業的${industry}評論關鍵字推薦助手。請基於以下資訊生成恰好${suggestionsToGenerate}個補充關鍵字：

店家名稱：${storeName}
行業類別：${industry}
店家特色：${description || ''}
已有關鍵字：${primaryKeywords.join('、')}

關鍵字生成要求：
1. 必須生成恰好${suggestionsToGenerate}個關鍵字，不能多也不能少
2. 每個關鍵字2-6個中文字
3. 新生成的關鍵字不能與已有關鍵字重複
4. 關鍵字應涵蓋：
   - 專業服務：${industryData.keywords.slice(0, 3).join('、')}等
   - 顧客體驗：${industryData.keywords.slice(3, 6).join('、')}等
   - 環境設施：${industryData.keywords.slice(6, 9).join('、')}等
5. 嚴格禁止使用這些詞：${industryData.avoid.join('、')}

格式要求：
- 直接返回${suggestionsToGenerate}個關鍵字，用頓號分隔
- 不要加編號或其他說明文字
- 確保關鍵字可以自然組合`;

    console.log('使用的提示詞:', systemPrompt);

    console.log('開始調用 OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `請生成${suggestionsToGenerate}個補充關鍵字` }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API 錯誤:', error);
      console.error('錯誤狀態碼:', response.status);
      console.error('錯誤詳情:', await response.text());
      throw new Error(error.error?.message || '生成關鍵字時發生錯誤');
    }

    console.log('成功獲得 OpenAI 回應');
    const data = await response.json();
    console.log('OpenAI 回應內容:', data);
    
    const keywordString = data.choices[0].message.content.trim();
    let generatedKeywords = keywordString.split('、')
      .map(k => k.trim())
      .filter(k => {
        const isValidLength = k.length >= 2 && k.length <= 6;
        const hasNoAds = !industryData.avoid.some(ad => k.includes(ad));
        const isNotDuplicate = !primaryKeywords.includes(k);
        return isValidLength && hasNoAds && isNotDuplicate;
      });

    // 如果生成的關鍵字不足，用行業默認關鍵字補充
    while (generatedKeywords.length < suggestionsToGenerate && generatedKeywords.length < remainingSlots) {
      const needed = Math.min(suggestionsToGenerate, remainingSlots) - generatedKeywords.length;
      const defaultKeywords = industryData.keywords
        .filter(k => !primaryKeywords.includes(k) && !generatedKeywords.includes(k))
        .slice(0, needed);
      generatedKeywords = [...generatedKeywords, ...defaultKeywords];
    }

    // 確保不超過可用空間和建議數量
    generatedKeywords = generatedKeywords.slice(0, Math.min(suggestionsToGenerate, remainingSlots));

    // 只返回新生成的關鍵字作為建議
    const finalKeywords = generatedKeywords;

    console.log('最終生成的關鍵字組合:', finalKeywords);

    return new Response(
      JSON.stringify({ keywords: finalKeywords }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Edge function 錯誤:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : '未知錯誤'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
