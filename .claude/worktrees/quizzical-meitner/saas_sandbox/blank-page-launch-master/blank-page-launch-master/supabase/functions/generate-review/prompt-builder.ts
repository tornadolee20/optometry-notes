import { CustomerType } from './types.ts';
import { SPECIAL_WRITING_STYLES } from './templates.ts';
import { enhanceLanguageExpression } from './utils/language-enhancer.ts';
import { generateIndustryPromptAddition, getIndustryLanguageEnhancement } from './utils/industry-context.ts';

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
  // Humanization parameters
  microEvent?: string | null,
  painPoint?: { pain: string; resolution: string } | null,
  interjections?: string[],
  perspective?: string,
  isHumanized: boolean = false
): string {
  
  const feelingsText = (customFeelings && customFeelings.length)
    ? `- 自訂感受：${customFeelings.join('、')}
- 請回應這些感受點，避免生硬重複。`
    : `- 自訂感受：無`;

  // 增強語感表達
  const languageEnhancement = enhanceLanguageExpression(
    keywords, 
    enforcedStyle || 'positive', 
    customerType.name
  );

  // 獲取行業特定的語言增強
  const industryLanguage = getIndustryLanguageEnhancement(industry);

  // 生成行業特定的系統提示補充
  const industryPromptAddition = generateIndustryPromptAddition(industry);

  const styleBlock = `
### 評論風格約束
- 預期風格：${enforcedStyle || '自動（根據條件自行調整）'}
- 預期語氣：${tone || '自動（自然、口語、真實）'}
- 星等參考：${starRating ?? '自動'}（不要在文中直接提及星等）
- 若為「負面」：採取冷靜、具體、禮貌且建設性的批判語氣；描述具體問題、影響與期望改善；避免人身攻擊、辱罵、煽動或法律言詞。
- 若為「平衡」：客觀呈現優缺點，給出中肯建議與改善方向。
- 若為「正向」：真實描述亮點與獲得的幫助，避免過度浮誇或重複讚美。
`;

  // 人性化增強段落
  let humanizationSection = '';
  if (isHumanized) {
    let humanizationInstructions = `
### 人性化寫作要求
- 句子長度不均勻（短句與長句交錯，避免工整感）
- 段落數：隨機 1-4 段，可加入突兀短句增加自然感
- 允許小跳躍和微妙重複用詞來模擬真實寫作
- 關鍵字位置隨機分布，避免都在開頭或結尾
- 店名與地名：允許在自然情境下最多出現 2 次（而非 1 次）`;

    if (interjections && interjections.length > 0) {
      humanizationInstructions += `
- 自然插入語助詞：${interjections.join('、')}（每篇 1-2 個）`;
    }

    if (microEvent) {
      humanizationInstructions += `
- 必須融入這個小插曲：${microEvent}`;
    }

    if (painPoint) {
      humanizationInstructions += `
- 呈現痛點轉折：原本擔心「${painPoint.pain}」，但「${painPoint.resolution}」`;
    }

    if (perspective) {
      humanizationInstructions += `
- 顧客視角：${perspective}`;
    }

    humanizationSection = humanizationInstructions;
  }

  const wordCountRange = isHumanized ? '190 - 240 字之間（允許 ±15% 彈性）' : '201 - 230 字之間';
  const keywordRequirement = isHumanized 
    ? '必須自然融入至少 80% 的關鍵字，允許使用同義詞替換' 
    : '必須確保每個關鍵字都在評論中明確出現';
  const paragraphRule = isHumanized ? '1-4段隨機，允許突兀短句' : '自然分段，語意完整、避免贅詞（可以是1-4段，依內容自然決定）';
  const nameRule = isHumanized 
    ? `店名「${storeName}」與地名「${area}」各自可在自然情境下出現最多 2 次；避免過度重複即可` 
    : `店名「${storeName}」與地名「${area}」各自僅自然出現 1 次即可；之後請改用「這家店／這裡／這附近」等代稱`;

  const structureBlock = `
  ### 結構與規範
  - 字數必須在 ${wordCountRange}
  - 段落：${paragraphRule}
  - 圖文：僅文字，不要使用表情符號（除非風格要求）
  - 店名與地名使用規則：${nameRule}
    - 不要在同一句或相鄰兩句重複出現店名或地名
  - Google 規範：不得含仇恨/歧視/人身攻擊/個資/威脅/交換利益/刷評暗示；內容須為個人真實體驗
  ${isHumanized ? '- 允許些許不完美和真實感，避免過於工整完美' : ''}
  `;

  const basePrompt = `你是一位專業的 Google 評論撰寫助手。請根據以下條件，撰寫一則符合顧客親身體驗的 Google 評論，確保評論內容、風格、語氣、結構不重複，並強調情感共鳴與推薦元素：

### 基本條件
1. 字數範圍：${wordCountRange}
2. 地名關鍵字：請自然出現，避免過度重複
   - 店家位於 ${area}（此資訊僅供參考，無需逐字出現）
   - ${isHumanized ? '可在自然情境下出現最多 2 次' : '若已提及一次，後續以「這附近」「在地」等代稱'}
 3. 關鍵字（重要約束）
   - 使用者已選擇的關鍵字組：${keywords.map(k => `"${k}"`).join('、')}
   - ⚠️ ${keywordRequirement}，不能只是暗示或相關詞彙
   - ⚠️ 評論內容必須與關鍵字主題一致，不能生成不相關的商家類型內容
   - ⚠️ 特別注意：「回頭客多」和「在地推薦」是不同概念，不可混用
     * 回頭客多：強調客戶會再次光顧、重複消費
     * 在地推薦：強調本地人推薦、口碑傳播
   - 可以使用同義詞或自然的描述方式，${isHumanized ? '允許故事化嵌入' : '但每個關鍵字的核心含義必須清楚呈現'}
4. 推薦給親朋好友的元素
   - 15% 的評論需在最後一段加入「推薦給親朋好友」的內容（若整體風格為負面則省略推薦）${isHumanized ? '，但不必過度完美' : ''}

### 開場白
${opening.replace('{storeName}', storeName)}

### 客戶屬性
- 客戶類型：${customerType.name}
- 特徵：${customerType.characteristics}

### 店家資訊
- 店名：${storeName}  
- 地區：${area}
- 特色：${description || '提供優質服務'}

### 使用者感受
${feelingsText}

### 語氣風格要求
請從下列語氣中隨機選擇其一（若有預期風格則以預期風格為主；若有指定語氣則必須使用指定語氣）：
1. 【親切自然】：「這家店真的很不錯，老闆很親切！」
2. 【生活化】：「某天經過這間店，剛好想換眼鏡，進去看看沒想到收穫超大。」
3. 【幽默風趣】：「本來只是驗光，結果被推坑買了一副超適合我的眼鏡🤣」
4. 【小故事 + 體驗】：「之前眼睛很容易疲勞，朋友推薦來這家試試，結果發現他們的防藍光鏡片真的有效。」
5. 【帶小缺點 + 客觀】：「店員很有耐心，就是假日人多，等了一下才輪到。」
6. 【專業分析型】：「這家店的驗光流程很細緻，鏡片選擇也多，價格合理。」
7. 【口語 + 感受型】：「這次配的眼鏡真的超輕，戴起來完全沒負擔！」
8. 【情境帶入 + 共鳴】：「長時間用電腦讓我眼睛超累，這次配的防藍光眼鏡真的解救了我！」

### 語感增強指引
為了讓評論更有語感和情感共鳴，請運用以下表達方式：
- 自然表達模式：${languageEnhancement.enhancedPatterns.slice(0, 2).join('；')}
- 連接詞變化：使用「${languageEnhancement.naturalConnectors.slice(0, 3).join('」、「')}」等詞彙增加語感流暢度
- 情感結尾：可適時運用「${languageEnhancement.emotionalEndings.slice(0, 2).join('」、「')}」類型的總結
- 行業詞彙：適當運用「${industryLanguage.vocabularyPatterns.slice(0, 3).join('」、「')}」等行業相關表達

### 本次指定語氣與句型
- 指定語氣：${tone || '隨機其一'}
- 指定句型：${sentencePattern || '隨機其一'}
- 若有指定則必須優先採用；可輔以最多一種其他句型增添自然度

### 句型結構（隨機使用）
1. 直接推薦型：「這家店真的很棒，推薦給所有需要換眼鏡的人！」（負面時改為提出具體建議）
2. 對比轉折型：「原本沒抱太大期待，沒想到整個體驗超出預期！」
3. 內心獨白型：「其實我一開始有點猶豫，結果一試戴就決定要買！」
4. 列點強調型：「這家店有三個優點：1. 服務專業 2. 眼鏡款式多 3. 價格合理。」
5. 故事敘述型：「某天朋友介紹我來這家，結果我現在也成了常客！」
6. 問題開頭型：「還在找一間專業又貼心的眼鏡行嗎？這家真的值得一試！」
7. 情境描述型：「假日午後，剛好來到這家店，體驗真的很好。」

${styleBlock}
${humanizationSection}
${structureBlock}

${industryPromptAddition}

請根據以上條件生成一篇自然、真實、具有個人體驗感的 Google 評論。`;

  // 如果有特定風格，添加風格指引
  if (selectedStyle && SPECIAL_WRITING_STYLES[selectedStyle]) {
    const styleInstruction = SPECIAL_WRITING_STYLES[selectedStyle];
    return basePrompt + `

### 特殊風格要求
${styleInstruction}`;
  }

  return basePrompt;
}