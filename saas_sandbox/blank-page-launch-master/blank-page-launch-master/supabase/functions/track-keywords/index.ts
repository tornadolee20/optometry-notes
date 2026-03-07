import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storeId, keywords, action = 'selected' } = await req.json();
    
    if (!storeId || !keywords || !keywords.length) {
      throw new Error('缺少必要參數：storeId 和 keywords');
    }

    console.log('追蹤關鍵字使用:', { storeId, keywords, action });

    // 這裡可以添加實際的追蹤邏輯
    // 例如記錄到數據庫或分析服務
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: '關鍵字使用已記錄',
        tracked: {
          storeId,
          keywords,
          action,
          timestamp: new Date().toISOString()
        }
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('追蹤關鍵字錯誤:', error);
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