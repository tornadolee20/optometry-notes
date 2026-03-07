// 測試腳本：直接調用Supabase函數來查看詳細錯誤
import { createClient } from '@supabase/supabase-js'

// 從環境變數或直接設定（測試用）
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'

// 如果您有本地環境變數檔案，請使用：
// const supabaseUrl = process.env.VITE_SUPABASE_URL
// const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testFunction() {
  console.log('=== 開始測試評論生成函數 ===')
  
  try {
    const testData = {
      storeName: "測試餐廳",
      address: "台北市大安區測試路123號",
      area: "大安區",
      keywords: ["美味", "服務好"],
      customFeelings: ["很棒", "推薦"],
      description: "測試餐廳描述",
      industry: "餐飲業",
      isEducationInstitution: false,
      isOpticalStore: false,
      sentimentAnalysis: {
        sentiment: "positive",
        score: 0.8,
        negativeCount: 0,
        positiveCount: 2,
        categories: {
          negative: [],
          positive: ["quality", "service"]
        }
      },
      reviewStyle: {
        style: "positive",
        tone: "satisfied",
        starRating: 5,
        suggestions: ["強調優點", "推薦給他人"]
      },
      guidelines: {},
      makeMoreNatural: true,
      avoidListStyle: true,
      avoidSummaryEnding: true,
      complianceMode: true,
      enforceNegativeWhenNeeded: false
    }
    
    console.log('發送測試數據:', JSON.stringify(testData, null, 2))
    
    const { data, error } = await supabase.functions.invoke('generate-review', {
      body: JSON.stringify(testData)
    })
    
    if (error) {
      console.error('❌ 函數調用錯誤:', error)
      console.error('錯誤詳情:', JSON.stringify(error, null, 2))
    } else {
      console.log('✅ 函數調用成功:', data)
    }
    
  } catch (err) {
    console.error('❌ 意外錯誤:', err)
  }
}

// 如果是 Node.js 環境
if (typeof module !== 'undefined' && module.exports) {
  testFunction()
}

// 如果是瀏覽器環境
if (typeof window !== 'undefined') {
  window.testFunction = testFunction
}

export { testFunction }