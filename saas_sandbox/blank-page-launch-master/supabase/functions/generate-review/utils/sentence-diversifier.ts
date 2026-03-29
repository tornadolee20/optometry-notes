// 句子長短變化和自然語感優化工具

/**
 * 增加句子長短變化，讓評論更自然
 */
export function diversifySentenceLength(text: string): string {
  // 分割成句子
  const sentences = text.split(/([。！？])/).filter(part => part.trim().length > 0);
  
  // 重新組合句子，添加長短變化
  const processedSentences: string[] = [];
  let i = 0;
  
  while (i < sentences.length) {
    const sentence = sentences[i];
    const punctuation = sentences[i + 1];
    
    if (!sentence || !punctuation) {
      if (sentence) processedSentences.push(sentence);
      break;
    }
    
    const fullSentence = sentence + punctuation;
    const wordCount = sentence.replace(/\s+/g, '').length;
    
    // 根據句子長度決定是否進行調整
    if (wordCount > 25) {
      // 長句子：嘗試分割
      const splitSentence = splitLongSentence(sentence, punctuation);
      processedSentences.push(splitSentence);
    } else if (wordCount < 8 && i + 3 < sentences.length) {
      // 短句子：可能合併下一句
      const nextSentence = sentences[i + 2];
      const nextPunctuation = sentences[i + 3];
      
      if (nextSentence && nextPunctuation && Math.random() < 0.4) {
        const combinedSentence = combineShortSentences(sentence, punctuation, nextSentence, nextPunctuation);
        processedSentences.push(combinedSentence);
        i += 4; // 跳過已處理的句子
        continue;
      } else {
        processedSentences.push(fullSentence);
      }
    } else {
      processedSentences.push(fullSentence);
    }
    
    i += 2;
  }
  
  return processedSentences.join('');
}

/**
 * 分割長句子
 */
function splitLongSentence(sentence: string, punctuation: string): string {
  // 尋找適合的分割點
  const splitPoints = ['，而且', '，但是', '，不過', '，另外', '，同時', '，因為'];
  
  for (const point of splitPoints) {
    if (sentence.includes(point)) {
      const parts = sentence.split(point);
      if (parts.length === 2 && parts[0].length > 5 && parts[1].length > 5) {
        return parts[0] + '。' + parts[1].trim() + punctuation;
      }
    }
  }
  
  // 如果找不到合適的分割點，在句子中間插入停頓
  const midPoint = Math.floor(sentence.length / 2);
  const nearbyComma = sentence.indexOf('，', midPoint - 5);
  
  if (nearbyComma !== -1 && nearbyComma < midPoint + 5) {
    const beforeComma = sentence.substring(0, nearbyComma);
    const afterComma = sentence.substring(nearbyComma + 1);
    
    if (beforeComma.length > 6 && afterComma.length > 6) {
      return beforeComma + '。' + afterComma + punctuation;
    }
  }
  
  return sentence + punctuation;
}

/**
 * 合併短句子
 */
function combineShortSentences(sentence1: string, punct1: string, sentence2: string, punct2: string): string {
  // 移除第一個句子的標點，用連接詞連接
  const connectors = ['，而且', '，同時', '，另外', '，不過'];
  const connector = connectors[Math.floor(Math.random() * connectors.length)];
  
  return sentence1 + connector + sentence2 + punct2;
}

/**
 * 添加自然的語氣變化
 */
export function addNaturalVariation(text: string): string {
  // 隨機添加一些自然的語氣詞和表達方式
  const variations = [
    { from: '很好', to: ['真的很棒', '相當不錯', '蠻好的', '挺滿意的'] },
    { from: '不錯', to: ['很棒', '相當好', '挺不錯', '很滿意'] },
    { from: '非常', to: ['真的', '相當', '超級', '特別'] },
    { from: '覺得', to: ['感覺', '認為', '發現', '體驗到'] },
    { from: '推薦', to: ['建議', '值得去', '可以試試', '不妨考慮'] }
  ];
  
  let result = text;
  
  variations.forEach(variation => {
    if (result.includes(variation.from) && Math.random() < 0.3) {
      const replacement = variation.to[Math.floor(Math.random() * variation.to.length)];
      // 只替換第一個出現的位置，避免過度修改
      result = result.replace(variation.from, replacement);
    }
  });
  
  return result;
}

/**
 * 調整段落內句子的節奏
 */
export function adjustParagraphRhythm(text: string): string {
  const paragraphs = text.split('\n\n');
  
  return paragraphs.map(paragraph => {
    if (paragraph.trim().length === 0) return paragraph;
    
    // 對每個段落進行句子長短調整
    let processedParagraph = diversifySentenceLength(paragraph);
    processedParagraph = addNaturalVariation(processedParagraph);
    
    return processedParagraph;
  }).join('\n\n');
}