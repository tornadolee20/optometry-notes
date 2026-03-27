
import { OpeningTemplate, OpeningType, UserRole } from '../../types.ts';
import { BASIC_TEMPLATES } from './basic-templates.ts';
import { DISCOVERY_TEMPLATES } from './discovery-templates.ts';
import { ROLE_BASED_TEMPLATES } from './role-based-templates.ts';
import { EXPERIENCE_TEMPLATES } from './experience-templates.ts';
import { SPECIAL_TEMPLATES } from './special-templates.ts';

// 合併所有開場白模板
export const ALL_OPENING_TEMPLATES: OpeningTemplate[] = [
  ...BASIC_TEMPLATES,
  ...DISCOVERY_TEMPLATES,
  ...ROLE_BASED_TEMPLATES,
  ...EXPERIENCE_TEMPLATES,
  ...SPECIAL_TEMPLATES
];

// 根據類型獲取模板的輔助函數
export const getTemplatesByType = (type: OpeningType): OpeningTemplate[] => {
  return ALL_OPENING_TEMPLATES.filter(template => template.type === type);
};

// 根據用戶角色獲取適合的開場白類型
export const getOpeningTypesForRole = (userRole: UserRole): OpeningType[] => {
  if (userRole) {
    return [userRole];
  }
  
  // 如果沒有特定角色，返回通用類型
  return [
    'direct', 'friendRecommendation', 'accidental', 'urgent', 'research', 
    'local', 'pastExperience', 'empathy', 'contrast', 'observation', 'simple'
  ];
};
