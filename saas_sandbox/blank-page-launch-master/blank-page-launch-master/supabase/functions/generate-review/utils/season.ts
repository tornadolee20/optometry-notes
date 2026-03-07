// 獲取當前季節
export const getCurrentSeason = (): string => {
  const now = new Date();
  const month = now.getMonth() + 1; // JavaScript months are 0-indexed
  
  if (month >= 3 && month <= 5) {
    return '春季';
  } else if (month >= 6 && month <= 8) {
    return '夏季';
  } else if (month >= 9 && month <= 11) {
    return '秋季';
  } else {
    return '冬季';
  }
};