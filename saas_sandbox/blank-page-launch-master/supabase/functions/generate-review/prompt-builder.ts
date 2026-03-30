import { CustomerType } from './types.ts';
import { SPECIAL_WRITING_STYLES } from './templates.ts';
import { generateIndustryPromptAddition, getIndustryLanguageEnhancement } from './utils/industry-context.ts';
import { getSoftWordCountRange } from './humanization/word-count-flexibility.ts';

export function createSystemPrompt(
  storeName: string,
  area: string,
  keywords: string[],
  description: string | undefined,
  opening: string,
  selectedStyle: string,
  customerType: CustomerType,
  enforcedStyle?: 'negative' | 'balanced' | 'positive',
  tone?: string,
  sentencePattern?: string,
  starRating?: number,
  customFeelings: string[] = [],
  industry?: string,
  microEvent?: string | null,
  painPoint?: { pain: string; resolution: string } | null,
  interjections?: string[],
  perspective?: string,
  isHumanized: boolean = false,
  keywordCount?: number,
  tonePromptHint?: string,
  toneIntensity?: string
): string {
  
  const hasCustomFeelings = customFeelings && customFeelings.length > 0;
  const feelingsText = hasCustomFeelings
    ? `⭐ 自訂感受（最高優先）：${customFeelings.join('、')}\n- 必須作為評論核心主軸，至少60%篇幅相關\n- 若與預設關鍵字衝突，以自訂感受為準`
    : '無自訂感受';

  // Industry language
  const industryLanguage = getIndustryLanguageEnhancement(industry);
  const industryAddition = generateIndustryPromptAddition(industry);

  // Dynamic word count
  const effectiveKeywordCount = keywordCount ?? 6;
  const softRange = getSoftWordCountRange(effectiveKeywordCount);
  const wordCountHint = softRange.hint;

  const keywordReq = isHumanized 
    ? '自然融入至少80%關鍵字，允許同義詞' 
    : '每個關鍵字核心含義須清楚呈現';
  const nameRule = isHumanized 
    ? `店名與地名各可出現最多2次` 
    : `店名「${storeName}」與地名「${area}」各僅出現1次，後用「這家店／這裡」代稱`;

  // Humanization section
  let humanSection = '';
  if (isHumanized) {
    const parts = ['句長不均勻，短長交錯', '段落1-4段隨機', '允許微妙重複用詞'];
    if (interjections?.length) parts.push(`插入語助詞：${interjections.join('、')}（1-2個）`);
    if (microEvent) parts.push(`融入小插曲：${microEvent}`);
    if (painPoint) parts.push(`痛點轉折：原本擔心「${painPoint.pain}」→「${painPoint.resolution}」`);
    if (perspective) parts.push(`顧客視角：${perspective}`);
    humanSection = `\n### 人性化要求\n${parts.map(p => `- ${p}`).join('\n')}`;
  }

  const isNegativeMode = enforcedStyle === 'negative';
  const styleDesc = isNegativeMode
    ? '冷靜、具體、建設性批判，避免人身攻擊' 
    : enforcedStyle === 'balanced' 
    ? '客觀呈現優缺點' 
    : '真實描述亮點，避免過度浮誇';

  // Negative enforcement block
  let negativeEnforcement = '';
  if (isNegativeMode) {
    negativeEnforcement = `
### 負面評論強制規則（最高優先級，違反任何一條即為失敗）

#### 資料來源
- 只允許使用客戶提供的負面感受關鍵詞來撰寫
- 不可自行腦補任何額外的優點或中立評價
- 不可參考或引用任何正面關鍵字組或模板內容

#### 語氣與情緒
- 整篇必須維持負面基調（冷靜、失望、生氣、無奈皆可），禁止任何形式的稱讚、安慰或正向轉折
- 嚴格禁止以下句型：
  × 「雖然有點XX，但整體還不錯」
  × 「服務有進步空間，不過環境很舒適」
  × 「這次不太滿意，但之後還是會再給機會」
- 不要替店家說好話、找理由或下結論（例如「店家其實也不容易」）

#### 禁止的正面詞語（出現即失敗）
「氣氛不錯」「環境舒適」「價格合理」「設計很美」「手法專業」「態度其實還可以」「整體還算可以接受」

#### 禁止的官方公關語氣（出現即失敗）
「期望店家未來能持續進步」「如果能改善就更好了」「整體來說還算可以接受」

#### 結構要求
- 開頭：說明整體不滿的感受，包含情緒（很失望、很生氣、覺得不值得）
- 中段：具體描述每個負面感受的細節（等待時間、服務態度、成品品質、價錢與期待落差等）
- 結尾：明確表達「不會再來」「無法推薦」「很後悔」等結論
- 不要加入呼籲改善、理性建議等官方語氣，要像真實客人在抱怨

#### 可信度
- 寫得像真實客人打字，可保留口語情緒字眼（如「真的很傻眼」「完全不值得」「超後悔來這裡」）
- 不要加正向緩和語氣`;
  }

  // Tone personality section — the key to voice diversity
  let tonePersonality = '';
  if (tonePromptHint) {
    const intensityDesc = toneIntensity === 'high' ? '情感強烈，用詞誇張一點也沒關係'
      : toneIntensity === 'low' ? '語氣平淡克制，少用驚嘆句和強烈形容詞'
      : '情緒適中，自然表達';
    tonePersonality = `\n### 語氣人格（重要！請嚴格遵守）\n- 說話方式：${tonePromptHint}\n- 情緒強度：${intensityDesc}\n- 請讓整篇評論的用詞、句式、標點都符合這個語氣人格，不要中途切換`;
  }

  const basePrompt = `你是 Google 評論撰寫助手。根據以下條件撰寫一則真實體驗感的評論。

### 條件
- 字數：${wordCountHint}
- 店家：${storeName}（${area}）- ${description || '提供優質服務'}
- 客戶：${customerType.name}（${customerType.characteristics}）
- 風格：${enforcedStyle || '自動'}，語氣：${tone || '隨機'}，句型：${sentencePattern || '隨機'}
- ${styleDesc}
- 星等參考：${starRating ?? '自動'}（不在文中提及）
${tonePersonality}
${negativeEnforcement}

### 關鍵字
預設：${keywords.map(k => `"${k}"`).join('、')}
${feelingsText}
- ${keywordReq}
- 「回頭客多」≠「在地推薦」，不可混用
- 15%機率在最後段加入推薦親友內容（負面風格則省略）

### 開場白
${opening.replace('{storeName}', storeName)}

### 敘事結構（依序展開，不可跳躍）
1. 破題 — 一個具體觸發點切入（聽說／路過／再訪／特定需求），1-2 句，不要從「這家店很棒」開始
2. 進入體驗 — 依時間或空間順序描述真實發生的事，畫面要具體
3. 關鍵時刻 — 一個讓你印象最深的細節，要有畫面感、要夠具體
4. 收束 — 一句帶情感重量的結語，用「下次還會來」「已經介紹給家人了」「出門時整個人很輕鬆」等具體行動或感受表達，禁用「推薦」「五星」等套句收尾

### 句子節奏（人寫文字的關鍵）
- 長短交錯：每段至少要有一句 8 字以內的短句（例：「就這樣」「真的很意外」「沒想到耶」「舒服多了」）
- 禁止連續 3 句以上使用相同長度的句子
- 每句開頭字不可連續重複：禁止連續 2 句以上用「讓」「這」「我」「他」開頭

### 重複詞頻上限（超過即重寫）
- 「真的」全文最多出現 2 次
- 「讓」全文最多出現 3 次
- 「就」全文最多出現 3 次
- 同一個形容詞全文不可重複使用

### 語感守則
- 全文使用繁體中文，嚴禁夾雜任何英文單字或縮寫（包含 OK、Browse、Check、VIP、CP值 等，一律改用中文：貴賓、性價比）
- 連接詞：使用「${industryLanguage.naturalConnectors?.slice(0, 3).join('」「') || '後來」「結果'}」等
- 行業詞彙：${industryLanguage.vocabularyPatterns?.slice(0, 3).join('、') || '專業服務'}
- 禁止自行生成 AI 套話（用戶自訂感受除外）：「無可挑剔」「完全可以說是」「不負眾望」「超乎預期」「令人驚艷」「讓我驚豔」「讓人驚豔」「五星推薦」「強力推薦大家」「相當到位」「專業的對話」
- ${nameRule}
- 僅文字，不用表情符號
- Google規範：禁仇恨/歧視/個資/威脅/交換利益/刷評暗示
${humanSection}
${industryAddition}

請生成一篇自然、真實的 Google 評論。`;

  if (selectedStyle && SPECIAL_WRITING_STYLES[selectedStyle]) {
    return basePrompt + `\n\n### 特殊風格\n${SPECIAL_WRITING_STYLES[selectedStyle]}`;
  }

  return basePrompt;
}
