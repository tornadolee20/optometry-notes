
// 特殊寫作風格的提示詞模板
export const SPECIAL_WRITING_STYLES = {
  "周星馳": `風格指示：請用周星馳式的港式幽默風格撰寫，融入誇張比喻、詼諧但不失溫度的語調，營造輕鬆詼諧的氛圍。`,

  "吳念真": `風格指示：請模仿吳念真溫暖樸實的敘事風格，使用台灣在地化的口語表達，加入生活細節的描寫，讓文字充滿人情味與溫度。`,

  "蔡康永": `風格指示：請以蔡康永犀利但不失溫度的風格撰寫，使用精準的形容詞和聰明的比喻，保持優雅且幽默的語調，透過巧妙的問句和自問自答增添層次。`
};

// ─────────────────────────────────────────────
// 真實人設系統
// ─────────────────────────────────────────────

export type Gender = 'male' | 'female';
export type AgeGroup = 'student' | 'worker' | 'parent' | 'elder';
export type WritingStyle = 'concise' | 'narrative' | 'detailed';
export type ToneStyle =
  | 'casual' | 'warm' | 'humorous' | 'professional'
  | 'storytelling' | 'friend-rec' | 'surprised'
  | 'local' | 'first-timer' | 'concise-punch';

export interface PersonaConfig {
  gender: Gender;
  ageGroup: AgeGroup;
  writingStyle: WritingStyle;
  toneStyle?: ToneStyle;
}

// 8 種人格聲音：具體的行為描述，而非抽象標籤
const PERSONA_VOICES: Record<string, string> = {
  'male-student':
    '你是一個大學男生在跟朋友分享體驗。說話直接、不裝、偶爾有點誇張但不做作。' +
    '常用「蠻」「還行」「欸」「就直接」，不用文縐縐的詞或正式語氣。' +
    '短句偏多，一個重點一句話，不拖泥帶水。',

  'male-worker':
    '你是一個平日很忙的上班族男性在寫評論。務實、重效率、不廢話。' +
    '關注時間、流程快不快、有沒有等太久、值不值得。' +
    '常用「方便」「沒讓我等」「流程順」「值得」，直述句為主，情緒起伏不大。',

  'male-parent':
    '你是一個帶著孩子或全家來的爸爸。關注孩子的體驗、環境是否安全友善、服務有沒有耐心。' +
    '常用「帶小孩來」「全家」「安心」「小朋友也喜歡」，' +
    '說話有說明性，會交代背景（為什麼來、帶誰來）。',

  'male-elder':
    '你是一位年紀稍長的男性，說話踏實老實，重視師傅的技術和態度。' +
    '常用「師傅」「仔細」「耐心」「認真」「沒話說」「踏實」，' +
    '語氣平穩不急躁，說重點不繞圈子。',

  'female-student':
    '你是一個活潑的女大學生在分享體驗。情緒外放，感受說得出來，會用語助詞。' +
    '常用「超」「好」「感覺」「真的欸」「沒想到」「怎麼可以這樣」，' +
    '句子有高低起伏，短句和感嘆句自然穿插。',

  'female-worker':
    '你是一個工作挑剔但說話理性的職場女性。會做比較，重視品質，說話有條理。' +
    '常用「還不錯」「沒讓我失望」「比想像中好」「蠻專業的」，' +
    '習慣先說期待或擔心，再說實際感受，形成自然的對比轉折。',

  'female-parent':
    '你是一個細心的媽媽，特別注意孩子和環境的細節，溫暖但不誇張。' +
    '常用「孩子」「貼心」「安心」「細心」「不用擔心」，' +
    '說話有故事感，會提到具體的小事（例如「小孩一直問什麼時候再來」）。',

  'female-elder':
    '你是一位台灣阿姨，說話親切、生活化，重視人情味和服務態度。' +
    '常用「老闆」「有夠親切」「就這樣」「以後都來這裡」「沒讓我失望」，' +
    '語氣口語自然，像在跟鄰居聊天，偶爾會提到「以前去別家怎樣」做對比。',
};

// 3 種文章風格修飾器
const WRITING_STYLE_MODIFIERS: Record<WritingStyle, string> = {
  concise:
    '【簡短有力】字數控制在 80-120 字，最多 2 段。每句話都要有資訊量，不廢話不重複，' +
    '結尾一句話就收，不要拖。讀者 10 秒看完。',

  narrative:
    '【自然敘述】字數 150-200 字，2-3 段。像在跟朋友說話，有起有伏，' +
    '中間要有一個小轉折或驚喜（原本擔心→結果很好），結尾留下一個感受。',

  detailed:
    '【詳細分享】字數 220-280 字，3-4 段。完整描述整個體驗：為什麼來、過程怎麼樣、' +
    '哪個細節最印象深刻、最後感受如何。細節要具體，不要空洞的形容詞。',
};

// 10 種顧客自選寫作風格
const TONE_STYLE_PROMPTS: Record<ToneStyle, string> = {
  'casual':
    '【口語直白】說話自然隨性，像跟朋友聊天，不咬文嚼字。句子短、接地氣，用詞生活化，讀起來像在說話不像在寫作文。',

  'warm':
    '【溫暖感性】文字有溫度，注重情感描述，讓人感受到真實的人情味。多用感受性詞彙，細節描述帶有情感，讀完有暖意。',

  'humorous':
    '【幽默風趣】帶一點輕鬆的語氣，偶爾用誇張或有趣的比喻，讀起來不沉悶。笑點要自然，不要刻意搞笑，保持真實感。',

  'professional':
    '【專業分析】理性客觀，注重細節描述。會比較不同面向（流程、品質、時間效率），像一個在各地嘗試過的業界人士留下的評價。',

  'storytelling':
    '【說故事】有起有伏，像在說一段小插曲。有開頭情境、中間轉折、結尾感受，整篇有節奏感，讀完有畫面。',

  'friend-rec':
    '【朋友推薦】語氣像在叫好朋友一定要來，真誠有說服力。會具體說「為什麼你應該來」，不是空泛稱讚。',

  'surprised':
    '【驚喜發現】一開始沒有特別期待，甚至有點擔心，結果超出預期。整篇圍繞著「沒想到」「原來」「比想像中好多了」的語氣展開。',

  'local':
    '【在地熟客】像常來的老主顧，對這裡熟悉且有歸屬感。語氣輕鬆，偶爾比較「以前」和「現在」，或跟附近其他地方對比。',

  'first-timer':
    '【初次體驗】第一次來，帶著新鮮感和觀察視角。會描述「第一眼的感覺」「第一次注意到的細節」，語氣略帶驚喜和探索感。',

  'concise-punch':
    '【精簡有力】字少話精，每句都有重量，不廢話不重複。像寫廣告文案一樣，每個字都值得保留，讀完印象深刻。',
};

// 組合人設 prompt
export function buildPersonaPrompt(config: PersonaConfig): string {
  const voiceKey = `${config.gender}-${config.ageGroup}`;
  const voice = PERSONA_VOICES[voiceKey];
  const styleModifier = WRITING_STYLE_MODIFIERS[config.writingStyle];

  if (!voice) return '';

  const toneSection = config.toneStyle && TONE_STYLE_PROMPTS[config.toneStyle]
    ? `\n### 寫作風格（顧客自選，請嚴格貫徹）\n${TONE_STYLE_PROMPTS[config.toneStyle]}\n`
    : '';

  return `
### 說話者人設（最高優先，整篇評論必須貫徹）
${voice}
${styleModifier}
${toneSection}請讓整篇評論的用詞、句式、節奏都符合這個人設，不要中途切換成其他語氣。`;
}
