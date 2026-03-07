
// 重新導出所有開場白相關功能
export { getRandomOpening } from '../opening-templates.ts';
export { 
  ALL_OPENING_TEMPLATES, 
  getTemplatesByType, 
  getOpeningTypesForRole 
} from './template-registry.ts';
export { BASIC_TEMPLATES } from './basic-templates.ts';
export { DISCOVERY_TEMPLATES } from './discovery-templates.ts';
export { ROLE_BASED_TEMPLATES } from './role-based-templates.ts';
export { EXPERIENCE_TEMPLATES } from './experience-templates.ts';
export { SPECIAL_TEMPLATES } from './special-templates.ts';
