import { OpeningTemplate, OpeningType, UserRole } from '../types.ts';
import { 
  ALL_OPENING_TEMPLATES, 
  getTemplatesByType, 
  getOpeningTypesForRole 
} from './opening-templates/template-registry.ts';

// 根據區域、季節和用戶角色獲取隨機開場白
export const getRandomOpening = (area: string, season: string, userRole: UserRole = null): OpeningTemplate => {
  let filteredTemplates: OpeningTemplate[] = [];
  
  // 根據用戶角色篩選模板
  if (userRole) {
    filteredTemplates = getTemplatesByType(userRole);
    
    // 如果沒有找到符合用戶角色的模板，則從其他類型中選擇
    if (filteredTemplates.length === 0) {
      const generalTypes: OpeningType[] = ['direct', 'friendRecommendation', 'accidental', 'simple'];
      filteredTemplates = ALL_OPENING_TEMPLATES.filter(template => generalTypes.includes(template.type));
    }
  } else {
    // 使用更平衡的選擇策略，確保多樣性
    const allTypes = getOpeningTypesForRole(userRole);
    
    // 隨機選擇一個類型，然後從該類型中選擇模板
    const randomType = allTypes[Math.floor(Math.random() * allTypes.length)];
    const typeTemplates = getTemplatesByType(randomType);
    
    if (typeTemplates.length > 0) {
      filteredTemplates = typeTemplates;
    } else {
      // 備案：選擇簡單直述型
      filteredTemplates = getTemplatesByType('simple');
    }
  }
  
  // 從篩選後的模板中隨機選擇
  const randomIndex = Math.floor(Math.random() * filteredTemplates.length);
  const template = filteredTemplates[randomIndex];
  
  // 替換開場白中的佔位符
  const opening = template.opening
    .replace('{area}', area)
    .replace('{store}', '{storeName}'); // 商店名稱會在後續流程中替換
  
  return {
    type: template.type,
    opening
  };
};