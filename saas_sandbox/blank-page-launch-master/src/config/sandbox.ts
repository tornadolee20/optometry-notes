// 沙盒測試模式設定 - 重新導出 industryTemplates 的函數和常數
export { 
  SANDBOX_EMAIL, 
  isSandboxMode as isSandboxStore,
  INDUSTRY_TEMPLATES,
  getTemplateById,
  TEMPLATE_CATEGORY_MAP,
  TEMPLATE_CATEGORY_LABELS,
  type IndustryTemplate,
  type TemplateKeyword,
  type TemplateCategory,
} from './industryTemplates';
