import { CustomerType } from '../types.ts';

export async function generateWithPerplexity(
  systemPrompt: string,
  selectedStyle: string,
  customerType: CustomerType,
  apiKey: string
): Promise<string> {
  console.log('開始使用 Perplexity 生成評論...');
  
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `請生成一篇符合要求的 Google 評論，字數控制在 201-230 字之間。客戶類型：${customerType.name}，特徵：${customerType.characteristics}`
          }
        ],
        temperature: 0.8,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Perplexity API 錯誤:', errorData);
      throw new Error(`Perplexity API 錯誤: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const review = data.choices[0].message.content.trim();
    
    console.log('Perplexity 生成的評論字數:', review.replace(/\s+/g, '').length);
    return review;
    
  } catch (error) {
    console.error('Perplexity 生成評論失敗:', error);
    throw error;
  }
}