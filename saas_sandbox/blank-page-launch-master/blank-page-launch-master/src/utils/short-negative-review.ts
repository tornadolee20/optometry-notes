// 產生本地短評（負面），不含店名與地區，最長 100 字
export function generateShortNegativeReview(customFeelings: string[]): string {
  // 基礎清理
  const cleaned = (customFeelings || [])
    .map((s) => (s || "").trim())
    .filter((s) => s.length > 0);

  // 嘗試挑選負面點（簡單關鍵詞判斷）
  const negPattern = /(不|沒|無|未|差|慢|貴|吵|亂|髒|冷漠|敷衍|強迫|過度|硬推|失望|糟|爛|差勁|不專業|不推|不推薦|抱怨|糟糕)/;
  const negativePoints = cleaned.filter((s) => negPattern.test(s));

  // 至多 3 點，若負面不足則以原本輸入補足
  const points = (negativePoints.length > 0 ? negativePoints : cleaned)
    .slice(0, 3)
    // 每點做適度截斷，避免單點過長
    .map((p) => (p.length > 12 ? p.slice(0, 12) : p));

  // 若沒有任何可用輸入，給出通用短評
  if (points.length === 0) {
    return "體驗不佳，期望改善。";
  }

  const templates = [
    (list: string) => `體驗不佳：${list}，請盡快改善。`,
    (list: string) => `令人失望：${list}，有待加強。`,
    (list: string) => `整體表現不理想：${list}。`
  ];

  const list = points.join("、");
  const pick = templates[Math.floor(Math.random() * templates.length)];
  let result = pick(list);

  // 最長 160 字截斷（使用者回饋：原本 100 字太短）
  const MAX = 160;
  if (result.length > MAX) {
    result = result.slice(0, MAX);
    // 結尾補上句點（若結尾不是標點）
    if (!/[。.!！]$/.test(result)) {
      result = result.replace(/[，、,]$/, "");
      result += "。";
    }
  }

  return result;
}
