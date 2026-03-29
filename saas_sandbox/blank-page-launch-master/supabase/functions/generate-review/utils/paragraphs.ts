// 自然段落排版：1-6 段動態分配，依內容自然斷句
export function enforceParagraphLayout(text: string): string {
  if (!text) return '';

  // 清理多餘空白，但保留現有段落結構
  const normalized = text
    .replace(/\r/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // 如果已有合理段落結構，優先保留
  if (normalized.includes('\n\n')) {
    const existingParagraphs = normalized.split('\n\n').filter(p => p.trim());
    if (existingParagraphs.length >= 1 && existingParagraphs.length <= 6) {
      return normalized;
    }
  }

  // 切分句子，保留標點
  const sentences = normalized
    .split(/([。！？!?])/)
    .reduce<string[]>((acc, cur) => {
      if (/[。！？!?]/.test(cur)) {
        const prev = acc.pop() ?? '';
        acc.push(prev + cur);
      } else if (cur.trim()) {
        acc.push(cur.trim());
      }
      return acc;
    }, [])
    .filter(Boolean);

  if (sentences.length <= 1) {
    return normalized;
  }

  // 根據內容長度和句子數動態決定段落數
  const totalLength = normalized.replace(/\s+/g, '').length;
  let targetParagraphs: number;
  
  if (totalLength < 80 || sentences.length <= 2) {
    targetParagraphs = 1; // 短評論單段
  } else if (totalLength < 150 || sentences.length <= 4) {
    targetParagraphs = Math.random() < 0.7 ? 2 : 3; // 中等長度2-3段
  } else if (totalLength < 250 || sentences.length <= 7) {
    targetParagraphs = Math.random() < 0.4 ? 2 : Math.random() < 0.8 ? 3 : 4; // 較長內容2-4段
  } else {
    // 長評論允許更多段落
    const weights = [0.1, 0.2, 0.3, 0.25, 0.1, 0.05]; // 1-6段的權重
    const rand = Math.random();
    let cumulative = 0;
    targetParagraphs = 3; // 默認值
    
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (rand <= cumulative) {
        targetParagraphs = i + 1;
        break;
      }
    }
  }

  // 智能分段：找自然斷點
  const paragraphs: string[] = [];
  let currentParagraph = '';
  let sentenceIndex = 0;
  
  for (let p = 0; p < targetParagraphs; p++) {
    const isLastParagraph = p === targetParagraphs - 1;
    const remainingSentences = sentences.length - sentenceIndex;
    const remainingParagraphs = targetParagraphs - p;
    
    // 計算當前段落應該包含的句子數
    let sentencesForThisParagraph;
    if (isLastParagraph) {
      sentencesForThisParagraph = remainingSentences;
    } else {
      const avgPerParagraph = Math.ceil(remainingSentences / remainingParagraphs);
      sentencesForThisParagraph = Math.max(1, avgPerParagraph + Math.floor(Math.random() * 2) - 1);
    }
    
    // 組建段落
    currentParagraph = '';
    for (let s = 0; s < sentencesForThisParagraph && sentenceIndex < sentences.length; s++) {
      currentParagraph += sentences[sentenceIndex];
      sentenceIndex++;
    }
    
    if (currentParagraph.trim()) {
      paragraphs.push(currentParagraph.trim());
    }
  }

  return paragraphs.join('\n\n');
}
