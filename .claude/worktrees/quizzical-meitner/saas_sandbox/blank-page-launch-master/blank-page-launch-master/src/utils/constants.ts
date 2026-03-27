// Production domain configuration - 使用實際可訪問的域名
export const REVIEW_BASE_URL = 'https://ce66bdf4-0a7d-4b6c-885f-08a99eb2fd7e.lovableproject.com';

// Environment warning configuration
export const SHOW_ENV_WARNING = import.meta.env.VITE_SHOW_ENV_WARNING === 'true';

// Get the appropriate base URL for QR codes
export const getQRCodeBaseUrl = (): string => {
  // 使用實際運行的 Lovable 項目 URL，確保在所有設備上都能訪問
  return REVIEW_BASE_URL;
};

// Check if current domain is production (Lovable project domain)
export const isProductionDomain = (): boolean => {
  return window.location.origin === REVIEW_BASE_URL;
};

// Check if environment warnings should be shown
export const shouldShowEnvWarning = (): boolean => {
  return SHOW_ENV_WARNING && !isProductionDomain();
};

// Get current domain info for debugging
export const getCurrentDomainInfo = () => {
  return {
    origin: window.location.origin,
    hostname: window.location.hostname,
    isProduction: isProductionDomain(),
    qrCodeBase: getQRCodeBaseUrl(),
    showEnvWarning: shouldShowEnvWarning()
  };
};