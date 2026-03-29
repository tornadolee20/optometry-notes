// 控制店名與地名的重複出現，第二次起以代稱取代
export function enforceProperNounLimits(text: string, area: string, storeName: string): string {
  if (!text) return '';

  const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  let result = text;

  // 處理店名：只保留第一次，之後以「這家店」代稱
  if (storeName && storeName.trim()) {
    const sn = escapeRegExp(storeName.trim());
    const re = new RegExp(`(${sn})`, 'g');
    let count = 0;
    result = result.replace(re, (m) => (++count === 1 ? m : '這家店'));

    // 避免相鄰句子重複店名
    result = result.replace(new RegExp(`([。！？])\\s*${sn}`, 'g'), '$1 這家店');
  }

  // 處理地名：只保留第一次，之後以「這附近」代稱
  if (area && area.trim()) {
    const ar = escapeRegExp(area.trim());
    const re = new RegExp(`(${ar})`, 'g');
    let count = 0;
    result = result.replace(re, (m) => (++count === 1 ? m : '這附近'));

    // 避免相鄰句子重複地名
    result = result.replace(new RegExp(`([。！？])\\s*${ar}`, 'g'), '$1 這附近');
  }

  // 清除連續重複的代稱
  result = result
    .replace(/(這家店)\1+/g, '$1')
    .replace(/(這附近)\1+/g, '$1');

  return result;
}
