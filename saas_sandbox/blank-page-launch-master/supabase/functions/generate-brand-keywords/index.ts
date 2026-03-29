import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const DIMENSIONS = [
  { key: 'expertise', label: 'Professional expertise and product quality' },
  { key: 'communication', label: 'Communication and education' },
  { key: 'process', label: 'Service process and flow' },
  { key: 'environment', label: 'Space, environment and atmosphere' },
  { key: 'pricing', label: 'Pricing and transparency' },
  { key: 'aftercare', label: 'After-sales tracking and warranty' },
  { key: 'demographics', label: 'Specific group experience (family, elderly, students)' },
  { key: 'trust', label: 'Local trust and brand image' },
];

function buildBrandPrompt(
  parentCategory: string,
  templateName: string,
  brandName: string,
  brandStyleHint: string,
) {
  return `你是一位熟悉台灣在地服務業與品牌經營的行銷企劃。
現在要替一個「連鎖品牌」設計一組 48 個「顧客感受關鍵字」，用在 AI 生成 Google 評論的內部設定。

基本條件：
- 主產業類別：${parentCategory}
- 產業子類：${templateName}
- 品牌名稱：${brandName}
- 品牌風格簡述：${brandStyleHint || '無特別說明'}

請你產出 48 個關鍵字，每個嚴格限制 3-7 個中文字（含標點），分成八大面向，語言為繁體中文，符合台灣顧客口語：

1. 專業技術與商品力（例：咖啡風味穩 / 驗配很精準 / 烘焙很到位）
2. 解說溝通與教育（例：說明很清楚 / 介紹很詳細 / 推薦很中肯）
3. 服務流程與動線（例：出餐速度快 / 點餐很順暢 / 不用久等）
4. 空間環境與氛圍（例：座位很舒適 / 燈光很溫馨 / 環境乾淨）
5. 價格與收費透明（例：價格很透明 / CP值很高 / 套餐很划算）
6. 售後與回訪關懷（例：會員有好康 / 集點很實用 / 活動常更新）
7. 特定客群體驗（例：適合帶小孩 / 學生愛來 / 長輩也喜歡）
8. 在地信任與品牌形象（例：在地人推薦 / 品牌有保障 / 口碑很好）

每個面向產出 6 個關鍵字，共 48 個。

【最重要規則 - 字數】
- 每個關鍵字嚴格 3 到 7 個字。超過 7 個字的一律不合格！
- 數字數的方法：「咖啡風味穩」= 5字 ✓、「咖啡風味很穩定好喝」= 8字 ✗
- 3字範例：味道好、很乾淨、好划算
- 4字範例：座位舒適、出餐很快
- 5字範例：咖啡風味穩、拿鐵很好喝
- 6字範例：店員態度很好、甜點選擇很多
- 7字範例：用餐環境很舒適、飲品選擇很豐富

【其他規則】
- 禁止空泛詞（例：服務很好、很專業、品質優良）。
- 禁止只有形容詞（例：親切、舒服），要有具體事件或特徵。
- 禁止與產業無關的通用詞。
- 不得重複或語意高度相似。
- 優先寫出品牌特色。

請直接輸出一個 JSON 陣列，格式為：
[{"text":"配鏡說明超清楚","dimension":"communication"}, ...]

dimension 值只能是以下八種之一：
expertise, communication, process, environment, pricing, aftercare, demographics, trust

不要加多餘說明文字，直接回傳 JSON 陣列。`;
}

interface BrandKeyword {
  text: string;
  dimension: string;
}

const VALID_DIMENSIONS = ['expertise', 'communication', 'process', 'environment', 'pricing', 'aftercare', 'demographics', 'trust'];

// Map dimension to the existing 4-category system for storage compatibility
const DIMENSION_TO_CATEGORY: Record<string, string> = {
  expertise: 'tech',
  communication: 'service',
  process: 'service',
  environment: 'env',
  pricing: 'price',
  aftercare: 'service',
  demographics: 'service',
  trust: 'service',
};

function isValidBrandKeyword(k: any): k is BrandKeyword {
  return (
    k &&
    typeof k.text === 'string' &&
    typeof k.dimension === 'string' &&
    k.text.length >= 3 &&
    k.text.length <= 7 &&
    VALID_DIMENSIONS.includes(k.dimension)
  );
}

async function callOpenAI(apiKey: string, systemPrompt: string, userMessage: string): Promise<any[]> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  let content = data.choices[0].message.content.trim();
  if (content.startsWith('```')) {
    content = content.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  return JSON.parse(content);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { parentCategoryName, industryTemplateName, brandName, brandStyleHint } = await req.json();
    console.log('Brand keyword generation request:', { parentCategoryName, industryTemplateName, brandName });

    if (!brandName || !industryTemplateName) {
      throw new Error('Missing required fields: brandName, industryTemplateName');
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) throw new Error('Missing OpenAI API key');

    const systemPrompt = buildBrandPrompt(
      parentCategoryName || '',
      industryTemplateName,
      brandName,
      brandStyleHint || '',
    );

    const TARGET = 48;
    const MAX_RETRIES = 3;

    // Initial generation
    const raw = await callOpenAI(openAIApiKey, systemPrompt, `Please generate ${TARGET} brand keywords for "${brandName}" in JSON format.`);
    let valid: BrandKeyword[] = raw.filter(isValidBrandKeyword);

    // De-duplicate
    const seen = new Set<string>();
    valid = valid.filter(k => {
      if (seen.has(k.text)) return false;
      seen.add(k.text);
      return true;
    });

    console.log(`Initial generation: ${raw.length} raw, ${valid.length} valid`);

    // Auto-refill loop
    let retries = 0;
    while (valid.length < TARGET && retries < MAX_RETRIES) {
      retries++;
      const needed = TARGET - valid.length;
      const existingList = valid.map(k => k.text).join(', ');
      const refillPrompt = `Currently have ${valid.length} keywords, need ${needed} more. Only output ${needed} new keywords that don't repeat these: ${existingList}. Same JSON array format.`;

      console.log(`Refill attempt ${retries}, need ${needed}`);

      try {
        const extra = await callOpenAI(openAIApiKey, systemPrompt, refillPrompt);
        const extraValid = extra.filter(isValidBrandKeyword).filter(k => !seen.has(k.text));
        for (const k of extraValid) {
          if (valid.length >= TARGET) break;
          seen.add(k.text);
          valid.push(k);
        }
        console.log(`After refill: ${valid.length} valid`);
      } catch (e) {
        console.error(`Refill attempt ${retries} failed:`, e);
      }
    }

    // Convert to storage-compatible format with both dimension and category
    const keywords = valid.map(k => ({
      keyword: k.text,
      category: DIMENSION_TO_CATEGORY[k.dimension] || 'service',
      dimension: k.dimension,
    }));

    // Compute dimension distribution
    const dimensionCounts: Record<string, number> = {};
    for (const k of keywords) {
      dimensionCounts[k.dimension] = (dimensionCounts[k.dimension] || 0) + 1;
    }

    console.log(`Final: ${keywords.length} keywords, distribution:`, dimensionCounts);

    return new Response(JSON.stringify({
      keywords,
      total: keywords.length,
      target: TARGET,
      dimensionCounts,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
