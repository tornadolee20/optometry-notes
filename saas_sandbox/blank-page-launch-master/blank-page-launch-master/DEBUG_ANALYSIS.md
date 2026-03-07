# 🔧 資深除錯工程師分析報告

## 🎯 **問題定位矩陣**

| 錯誤層級 | 錯誤類型 | 影響範圍 | 緊急程度 |
|---------|----------|----------|----------|
| **HTTP 500** | 服務器內部錯誤 | 完全功能失效 | 🔴 P0 - 緊急 |
| **Function Error** | Edge Function 執行失敗 | 評論生成失效 | 🔴 P0 - 緊急 |
| **Parameter Error** | 參數驗證/處理錯誤 | 特定場景失效 | 🟡 P1 - 高 |

## 🔍 **步驟1: 根本原因分析 (RCA)**

### 1.1 **錯誤追踪鏈**
```
用戶操作 → 前端調用 → Supabase Function → OpenAI API → 返回500錯誤
```

### 1.2 **可能的失敗點**
1. **前端參數傳遞**
   - 情感分析數據格式錯誤
   - 必要參數缺失
   - 數據類型不匹配

2. **後端函數執行**
   - 變數未定義錯誤
   - 陣列操作失敗
   - 字符串模板錯誤
   - API金鑰問題

3. **OpenAI API調用**
   - 請求格式錯誤
   - 內容過長
   - API配額問題

## 🛠️ **步驟2: 系統化除錯方法**

### 2.1 **分層除錯策略**

#### 第一層：前端參數驗證
```typescript
// 添加前端參數檢查
console.log("=== 前端參數檢查 ===");
console.log("selectedKeywords:", selectedKeywords);
console.log("customFeelings:", customFeelings);
console.log("sentimentAnalysis:", sentimentAnalysis);
console.log("reviewStyle:", reviewStyle);

// 參數完整性檢查
const hasValidParams = (
  (selectedKeywords && selectedKeywords.length > 0) ||
  (customFeelings && customFeelings.length > 0)
);

if (!hasValidParams) {
  throw new Error("前端參數驗證失敗：缺少關鍵字或自訂感受");
}
```

#### 第二層：後端函數穩定性
```typescript
// 後端安全檢查
try {
  // 參數解構安全化
  const {
    storeName = '',
    address = '',
    area = '',
    keywords = [],
    customFeelings = [],
    // ... 其他參數全部設置默認值
  } = requestBody || {};

  // 立即驗證關鍵參數
  if (!storeName || !address) {
    throw new Error("缺少必要參數");
  }

  console.log("後端參數驗證通過");
} catch (error) {
  console.error("後端參數驗證失敗:", error);
  return new Response(
    JSON.stringify({ 
      error: `參數驗證失敗: ${error.message}`,
      received: requestBody 
    }),
    { status: 400, headers: corsHeaders }
  );
}
```

#### 第三層：API調用防護
```typescript
// OpenAI API 調用保護
try {
  const requestPayload = {
    model: 'gpt-4o-mini',
    messages: messages,
    temperature: 0.88,
    max_tokens: 500
  };

  console.log("OpenAI請求載荷:", JSON.stringify(requestPayload, null, 2));

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI API 錯誤:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText
    });
    throw new Error(`OpenAI API 錯誤: ${response.status} - ${errorText}`);
  }

} catch (apiError) {
  console.error("API調用失敗:", apiError);
  return new Response(
    JSON.stringify({ 
      error: "API調用失敗",
      details: apiError.message,
      type: "API_ERROR"
    }),
    { status: 502, headers: corsHeaders }
  );
}
```

## 🎯 **步驟3: 漸進式修復策略**

### 3.1 **最小可行修復 (MVP Fix)**
```typescript
// 1. 簡化版本先確保基本功能
export const generateReviewSimple = async (req) => {
  try {
    const { storeName, address, keywords } = await req.json();
    
    // 最基本的參數檢查
    if (!storeName || !address || !keywords) {
      return error400("缺少基本參數");
    }

    // 簡化的提示語，避免複雜邏輯
    const prompt = `請為${storeName}寫一則評論，包含：${keywords.join(', ')}`;
    
    // 直接調用OpenAI
    const result = await callOpenAI(prompt);
    
    return success(result);
  } catch (error) {
    return error500(error.message);
  }
};
```

### 3.2 **分階段功能恢復**
1. **階段1**: 基本評論生成 ✅
2. **階段2**: 添加情感分析 
3. **階段3**: 添加複雜邏輯
4. **階段4**: 優化和性能調整

## 🔬 **步驟4: 測試驗證方法**

### 4.1 **單元測試**
```typescript
// 測試各個組件
describe('評論生成除錯測試', () => {
  test('參數驗證', () => {
    expect(validateParams(validParams)).toBe(true);
    expect(validateParams(invalidParams)).toBe(false);
  });

  test('字符串模板安全性', () => {
    const result = buildPrompt(safeParams);
    expect(result).not.toContain('undefined');
  });

  test('API調用穩定性', async () => {
    const result = await callOpenAI(testPrompt);
    expect(result.status).toBe(200);
  });
});
```

### 4.2 **集成測試場景**
1. **正常流程**: 完整參數 → 成功生成
2. **邊界條件**: 最少參數 → 降級處理
3. **異常處理**: 錯誤參數 → 優雅失敗
4. **負載測試**: 並發請求 → 穩定響應

## 📊 **步驟5: 監控和預警**

### 5.1 **關鍵指標監控**
- **成功率**: > 99%
- **響應時間**: < 5秒
- **錯誤類型分布**: 4xx vs 5xx
- **API調用狀態**: OpenAI響應時間

### 5.2 **告警觸發條件**
- 連續3次500錯誤
- 成功率低於95%
- 響應時間超過10秒
- API金鑰問題

## 💡 **除錯最佳實踐**

### ✅ **DO - 應該做的**
1. **日誌先行**: 詳細記錄每個步驟
2. **防禦性編程**: 假設所有輸入都可能出錯
3. **優雅降級**: 部分功能失效時提供基本服務
4. **分層處理**: 不同層級用不同的錯誤處理策略
5. **持續監控**: 實時追蹤系統健康狀況

### ❌ **DON'T - 避免做的**
1. **不要忽略錯誤**: 每個異常都要妥善處理
2. **不要過度複雜**: 複雜邏輯增加出錯機率
3. **不要硬編碼**: 配置和邏輯要分離
4. **不要單點失敗**: 避免關鍵路徑上的單點故障
5. **不要缺少回滾**: 每個部署都要有回滾方案

---

## 🎯 **立即行動項目**

### 高優先級 (今天完成)
- [ ] 實施最小可行修復
- [ ] 添加全面的錯誤日誌
- [ ] 驗證基本功能正常

### 中優先級 (本週完成)
- [ ] 完善參數驗證邏輯
- [ ] 添加單元測試
- [ ] 實施監控告警

### 低優先級 (下週完成)
- [ ] 性能優化
- [ ] 文檔更新
- [ ] 用戶體驗改進

**建議**: 先確保基本功能穩定，再逐步添加複雜特性。"穩定 > 功能完整性"