import { UserRole } from '../types.ts';

// 根據關鍵字偵測用戶角色
export const detectUserRole = (keywords: string[]): UserRole => {
  const keywordString = keywords.join(' ').toLowerCase();
  
  // 家長角色關鍵字
  if (keywordString.includes('兒童') || keywordString.includes('小孩') || keywordString.includes('孩子') || keywordString.includes('親子')) {
    return 'parent';
  }
  
  // 長者角色關鍵字
  if (keywordString.includes('老花') || keywordString.includes('長者') || keywordString.includes('年長') || keywordString.includes('銀髮')) {
    return 'elder';
  }
  
  // 學生角色關鍵字
  if (keywordString.includes('學生') || keywordString.includes('近視') || keywordString.includes('課業') || keywordString.includes('唸書')) {
    return 'student';
  }
  
  // 專業人士角色關鍵字
  if (keywordString.includes('上班') || keywordString.includes('工作') || keywordString.includes('商務') || keywordString.includes('電腦')) {
    return 'professional';
  }
  
  // 本地居民角色關鍵字
  if (keywordString.includes('鄰近') || keywordString.includes('附近') || keywordString.includes('社區') || keywordString.includes('在地')) {
    return 'local_resident';
  }
  
  return null; // 無特定角色
};