# 🔧 修復版本的函數代碼

請複製以下**完整修復版本**，替換dashboard中的代碼：

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // === 除錯日誌 Level 1: 請求接收 ===
    console.log('=== 開始處理評論生成請求 ===');
    
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('✅ JSON解析成功');
      console.log('📦 請求參數:', {
        hasStoreName: !!requestBody.storeName,
        hasAddress: !!requestBody.address,
        hasArea: !!requestBody.area,
        keywordsCount: Array.isArray(requestBody.keywords) ? requestBody.keywords.length : 0,
        customFeelingsCount: Array.isArray(requestBody.customFeelings) ? requestBody.customFeelings.length : 0,
        hasSentimentAnalysis: !!requestBody.sentimentAnalysis,
        hasReviewStyle: !!requestBody.reviewStyle
      });
    } catch (jsonError) {
      console.error('❌ JSON解析失敗:', jsonError);
      return new Response(
        JSON.stringify({ error: 'JSON解析失敗', details: jsonError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // === 除錯日誌 Level 2: 參數解構和驗證 ===
    console.log('🔍 開始參數解構...');
    
    let storeName, address, area, keywords, customFeelings, description;
    let isEducationInstitution, isOpticalStore, sentimentAnalysis, reviewStyle;
    let makeMoreNatural, avoidListStyle, avoidSummaryEnding, complianceMode, enforceNegativeWhenNeeded;
    
    try {
      ({
        storeName,
        address,
        area,
        keywords = [],
        customFeelings = [],
        description,
        isEducationInstitution = false,
        isOpticalStore = false,
        sentimentAnalysis,
        reviewStyle,
        guidelines,
        makeMoreNatural = true,
        avoidListStyle = true,
        avoidSummaryEnding = true,
        complianceMode = true,
        enforceNegativeWhenNeeded = false,
      } = requestBody);
      
      console.log('✅ 參數解構成功');
    } catch (destructureError) {
      console.error('❌ 參數解構失敗:', destructureError);
      return new Response(
        JSON.stringify({ error: '參數解構失敗', details: destructureError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // === 除錯日誌 Level 3: 關鍵參數驗證 ===
    console.log('🔍 驗證關鍵參數...');
    
    const validationErrors = [];
    
    if (!storeName || typeof storeName !== 'string') {
      validationErrors.push('storeName 必須是非空字符串');
    }
    
    if (!address || typeof address !== 'string') {
      validationErrors.push('address 必須是非空字符串');
    }
    
    if (!Array.isArray(keywords)) {
      validationErrors.push('keywords 必須是陣列');
    }
    
    if (!Array.isArray(customFeelings)) {
      validationErrors.push('customFeelings 必須是陣列');
    }
    
    if (keywords.length === 0 && customFeelings.length === 0) {
      validationErrors.push('keywords 或 customFeelings 至少要有一個包含內容');
    }
    
    if (validationErrors.length > 0) {
      console.error('❌ 參數驗證失敗:', validationErrors);
      return new Response(
        JSON.stringify({ 
          error: '參數驗證失敗', 
          details: validationErrors,
          received: {
            storeName: typeof storeName,
            address: typeof address,
            keywords: Array.isArray(keywords) ? keywords.length : typeof keywords,
            customFeelings: Array.isArray(customFeelings) ? customFeelings.length : typeof customFeelings
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('✅ 關鍵參數驗證通過');
    
    // === 除錯日誌 Level 4: 安全變數處理 ===
    console.log('🔍 處理安全變數...');
    
    // 安全的區域名稱處理
    let safeArea = area;
    if (!safeArea) {
      console.log('⚠️  area參數為空，嘗試從address提取');
      try {
        if (typeof address === 'string') {
          if (address.includes('市')) {
            const parts = address.split('市');
            if (parts.length > 1 && parts[0]) {
              safeArea = parts[0] + '市';
              console.log('✅ 從address提取市級區域:', safeArea);
            }
          } else if (address.includes('區')) {
            const parts = address.split('區');
            if (parts.length > 1 && parts[0]) {
              safeArea = parts[0] + '區';
              console.log('✅ 從address提取區級區域:', safeArea);
            }
          }
        }
        
        if (!safeArea) {
          safeArea = '該地區';
          console.log('⚠️  無法提取區域，使用默認值:', safeArea);
        }
      } catch (areaError) {
        console.error('❌ 區域提取失敗:', areaError);
        safeArea = '該地區';
      }
    }
    
    // 安全的陣列處理
    const safeKeywords = Array.isArray(keywords) ? 
      keywords.filter(k => k && typeof k === 'string') : [];
    const safeCustomFeelings = Array.isArray(customFeelings) ? 
      customFeelings.filter(f => f && typeof f === 'string') : [];
    
    console.log('✅ 安全變數處理完成:', {
      safeArea,
      safeKeywordsCount: safeKeywords.length,
      safeCustomFeelingsCount: safeCustomFeelings.length
    });

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: '找不到 OpenAI API 金鑰' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // 判斷是否加入推薦朋友元素 (只有正面評論才會推薦，15%的機率)
    let includeFriendRecommendation = Math.random() < 0.15;
    
    // 如果是負面評論，不推薦朋友
    if (reviewStyle && reviewStyle.style === 'negative') {
      includeFriendRecommendation = false;
    }
    
    // 檢查是否包含負面詞彙，決定評論模式
    const isNegativeMode = sentimentAnalysis && reviewStyle && reviewStyle.style === 'negative';
    
    // 設定評論字數限制
    const wordLimit = isNegativeMode ? 150 : 230;
    const wordRange = isNegativeMode ? "120-150字" : "201-230字";
    
    // 根據是否為負面模式創建不同的提示語
    let systemPrompt;
    
    if (isNegativeMode) {
      // 負面評論模式：簡單直接的陳述事實風格
      systemPrompt = `請撰寫一則簡潔客觀的負面 Google 評論：

負面評論要求：
1. 字數範圍：${wordRange}
2. 風格：陳述事實，客觀描述
3. 地區：自然提及 "${safeArea}"
4. 內容要求：
   - 關鍵字: "${safeKeywords.join('", "')}"
   - 負面感受: "${safeCustomFeelings.join('", "')}"
   - 所有內容都要自然出現在評論中
5. 語氣：平實、客觀、不情緒化
6. 結構：簡單直接，一段式陳述

重要：不要使用複雜的修辭，不要推薦朋友，直接陳述體驗問題即可。`;
    } else {
      // 原本的正面/中性評論邏輯
      systemPrompt = `請根據以下條件，撰寫一則符合顧客親身體驗的 Google 評論：

基本條件：
1. 字數範圍：${wordRange}
2. 地名關鍵字：必須包含店家所在地區 "${safeArea}"
3. 關鍵字和感受：
   - 用戶選擇的關鍵字: "${safeKeywords.join('", "')}"
   - 用戶自訂感受: "${safeCustomFeelings.join('", "')}"
   - 必須確保所有關鍵字和感受都自然地出現在評論內
4. 風格：自然、真實、具體
5. 語氣：正面積極、推薦給他人`;
    }

    console.log('=== 評論生成參數 ===');
    console.log('評論模式:', isNegativeMode ? '負面模式' : '正面/中性模式');
    console.log('字數限制:', wordRange);
    console.log('關鍵字:', safeKeywords);
    console.log('自訂感受:', safeCustomFeelings);
    console.log('===============');

    // === 除錯日誌 Level 4.5: 安全準備請求內容 ===
    console.log('🔍 準備用戶消息...');
    
    let userMessage;
    try {
      // 安全處理可能包含特殊字符的內容
      const safeStoreName = storeName?.replace(/"/g, "'") || '未知店家';
      const safeAddress = address?.replace(/"/g, "'") || '未知地址';
      const safeDescription = (description || '無特別描述').replace(/"/g, "'");
      
      console.log('📝 消息構建參數:', {
        isNegativeMode,
        safeKeywordsCount: safeKeywords.length,
        safeCustomFeelingsCount: safeCustomFeelings.length,
        safeArea,
        safeStoreName,
        wordRange
      });
      
      if (isNegativeMode) {
        userMessage = `請生成一則簡潔的負面Google評論：
- 關鍵字：${safeKeywords.map(k => `"${k}"`).join(', ')}
- 負面感受：${safeCustomFeelings.map(f => `"${f}"`).join(', ')}
- 地區：${safeArea}
- 店家：${safeStoreName}
- 地址：${safeAddress}
- 要求：客觀陳述問題，${wordRange}，不要情緒化`;
      } else {
        userMessage = `請幫我生成一則真實的Google評論，需要包含：
- 關鍵字：${safeKeywords.map(k => `"${k}"`).join(', ')}
- 自訂感受：${safeCustomFeelings.map(f => `"${f}"`).join(', ')}
- 地區：${safeArea}
- 店家：${safeStoreName}
- 地址：${safeAddress}
- 描述：${safeDescription}`;
      }
      
      console.log('✅ 用戶消息構建成功，長度:', userMessage.length);
      
    } catch (e) {
      console.error('❌ 準備用戶消息時發生錯誤:', {
        errorType: e.constructor.name,
        errorMessage: e.message,
        safeKeywords,
        safeCustomFeelings,
        safeArea
      });
      throw new Error(`準備請求內容時發生錯誤: ${e.message}`);
    }

    // === 除錯日誌 Level 5: OpenAI API調用防護 ===
    console.log('🔍 準備OpenAI API調用...');
    
    let generatedText; // 在外部作用域定義變數
    
    try {
      const requestPayload = {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.88,
        max_tokens: 500,
      };

      console.log('📤 OpenAI請求載荷檢查:', {
        model: requestPayload.model,
        messagesCount: requestPayload.messages.length,
        systemPromptLength: systemPrompt ? systemPrompt.length : 0,
        userMessageLength: userMessage ? userMessage.length : 0,
        temperature: requestPayload.temperature,
        maxTokens: requestPayload.max_tokens
      });

      if (!systemPrompt || !userMessage) {
        throw new Error('系統提示語或用戶消息為空');
      }

      console.log('🚀 發送OpenAI API請求...');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      console.log('📥 OpenAI API響應狀態:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        let errorText;
        try {
          const errorData = await response.json();
          errorText = errorData.error?.message || errorData.message || '未知錯誤';
          console.error('❌ OpenAI API詳細錯誤:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData
          });
        } catch (parseError) {
          errorText = await response.text();
          console.error('❌ OpenAI API錯誤(無法解析JSON):', {
            status: response.status,
            statusText: response.statusText,
            rawError: errorText
          });
        }
        
        throw new Error(`OpenAI API錯誤 [${response.status}]: ${errorText}`);
      }

      let data;
      try {
        data = await response.json();
        console.log('✅ OpenAI API響應解析成功:', {
          hasChoices: !!data.choices,
          choicesLength: data.choices ? data.choices.length : 0,
          hasContent: !!(data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
        });
      } catch (parseError) {
        console.error('❌ OpenAI API響應解析失敗:', parseError);
        throw new Error('OpenAI API響應格式錯誤，無法解析JSON');
      }

      if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
        console.error('❌ OpenAI API響應結構異常:', data);
        throw new Error('OpenAI API響應結構異常，缺少必要的content字段');
      }

      generatedText = data.choices[0].message.content.trim();
      
      if (!generatedText) {
        console.error('❌ 生成的評論內容為空');
        throw new Error('OpenAI生成的評論內容為空');
      }

      console.log('✅ 評論生成成功:', {
        contentLength: generatedText.length,
        contentPreview: generatedText.substring(0, 50) + '...'
      });

    } catch (apiError) {
      console.error('❌ OpenAI API調用失敗:', {
        errorType: apiError.constructor.name,
        errorMessage: apiError.message,
        errorStack: apiError.stack
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'API調用失敗',
          details: apiError.message,
          type: 'API_ERROR',
          timestamp: new Date().toISOString()
        }),
        { 
          status: 502, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // === 除錯日誌 Level 6: 成功響應 ===
    console.log('🎉 評論生成完全成功!');
    console.log('=== 結束處理評論生成請求 ===');
    
    // 最終安全檢查
    if (!generatedText) {
      console.error('❌ 嚴重錯誤：generatedText為空但沒有拋出異常');
      throw new Error('評論生成失敗：內容為空');
    }
    
    return new Response(
      JSON.stringify({ review: generatedText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating review:', error);
    return new Response(
      JSON.stringify({ error: error.message || '生成評論時發生錯誤' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```