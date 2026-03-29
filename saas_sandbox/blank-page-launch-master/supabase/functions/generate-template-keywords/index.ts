// generate-template-keywords edge function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function buildSystemPrompt(parentLabel: string, templateLabel: string, description: string) {
  return `你是一位專業的台灣在地服務業行銷顧問，熟悉 Google 評論的語言模式與消費者心理。

你的任務是：為「${parentLabel} → ${templateLabel}」這個類型的店家，生成高品質的關鍵字，讓店家可以用這些關鍵字來引導顧客寫出更具體、更有說服力的 Google 評論。

【硬性規則】

1. 每個關鍵字必須介於 3–7 個中文字之間，不可超出，不可使用標點符號。
   注意：台灣中文字數計算以「每一個中文字算 1 字」為準。例如「驗光解說清楚」是 6 個字（符合），「兒童近視控制追蹤」是 8 個字（不符合，請拆開或縮短）。輸出前請自行逐一確認每個關鍵字的字數。

2. 嚴禁出現以下類型的關鍵字：
   - 空泛詞（例：服務很好、很專業、環境不錯、整體滿意、顧客服務、服務效率）
   - 純形容詞（例：親切、舒適、便利、乾淨）
   - 無產業特色的通用詞（例：停車方便、交通便利、設施齊全）

3. 每個關鍵字必須「具體、有畫面、帶有產業特色」，讓人看到這個詞就知道這是什麼產業的哪一種服務體驗。

4. 嚴禁誇大療效或違反台灣醫療廣告法規的用詞（例：根治、治癒、保證改善）。

5. 不得出現重複或語意高度相似的關鍵字。

【關鍵字構面分布要求】

請確保關鍵字涵蓋以下構面，每個構面至少 4–6 個：

- 專業技術（這個產業的核心技術或手法）
- 解說溝通（專業人員如何跟客人解釋說明）
- 服務流程（預約、等待、接待、結束的體驗）
- 空間環境（診間、設備、清潔度、氛圍）
- 價格與透明度（費用說明、不過度推銷、CP 值）
- 售後與追蹤（回訪、追蹤、關懷）
- 特定族群體驗（依產業特性，例如：兒童友善、長輩友善、第一次來的新手）
- 在地信任感（老客戶、社區口碑、口耳相傳）

【輸出格式】

只輸出 JSON 陣列，格式為：
[{"keyword":"xxx","category":"service"},...]

category 對應：
- service：解說溝通、服務流程、售後與追蹤
- tech：專業技術
- env：空間環境
- price：價格與透明度

特定族群體驗與在地信任感請歸入最相關的 category。

直接回傳 JSON 陣列，不要加任何說明文字。${description ? `\n\n補充說明：${description}` : ''}`;
}

interface Keyword {
  keyword: string;
  category: string;
}

function isValidKeyword(k: any): k is Keyword {
  return (
    k &&
    typeof k.keyword === 'string' &&
    typeof k.category === 'string' &&
    k.keyword.length >= 3 &&
    k.keyword.length <= 7 &&
    ['service', 'tech', 'env', 'price'].includes(k.category)
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
    const { templateLabel, parentLabel, description } = await req.json();
    console.log('生成模板關鍵字:', { templateLabel, parentLabel, description });

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) throw new Error('Missing OpenAI API key');

    const systemPrompt = buildSystemPrompt(parentLabel, templateLabel, description || '');
    const TARGET = 48;
    const MAX_RETRIES = 3;

    // Initial generation
    const raw = await callOpenAI(openAIApiKey, systemPrompt, `請為「${parentLabel} → ${templateLabel}」生成 ${TARGET} 個關鍵字，JSON 格式。`);
    let valid: Keyword[] = raw.filter(isValidKeyword);

    // De-duplicate
    const seen = new Set<string>();
    valid = valid.filter(k => {
      if (seen.has(k.keyword)) return false;
      seen.add(k.keyword);
      return true;
    });

    console.log(`初次生成: ${raw.length} 個原始, ${valid.length} 個有效`);

    // Auto-refill loop
    let retries = 0;
    while (valid.length < TARGET && retries < MAX_RETRIES) {
      retries++;
      const needed = TARGET - valid.length;
      const existingList = valid.map(k => k.keyword).join('、');
      const refillPrompt = `目前已有 ${valid.length} 個關鍵字，還需要 ${needed} 個。請只輸出 ${needed} 個新的關鍵字，不要重複以下已有的關鍵字：${existingList}。同樣以 JSON 陣列格式輸出。`;

      console.log(`補足第 ${retries} 次, 需要 ${needed} 個`);

      try {
        const extra = await callOpenAI(openAIApiKey, systemPrompt, refillPrompt);
        const extraValid = extra.filter(isValidKeyword).filter(k => !seen.has(k.keyword));
        for (const k of extraValid) {
          if (valid.length >= TARGET) break;
          seen.add(k.keyword);
          valid.push(k);
        }
        console.log(`補足後共 ${valid.length} 個有效`);
      } catch (e) {
        console.error(`補足第 ${retries} 次失敗:`, e);
      }
    }

    console.log(`最終生成 ${valid.length} 個有效關鍵字`);

    return new Response(JSON.stringify({ keywords: valid, total: valid.length, target: TARGET }), {
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
