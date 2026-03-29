// Production domain configuration - 使用自訂網域
export const REVIEW_BASE_URL = 'https://myownreviews.com';

// Environment warning configuration
export const SHOW_ENV_WARNING = import.meta.env.VITE_SHOW_ENV_WARNING === 'true';

// Get the appropriate base URL for QR codes
export const getQRCodeBaseUrl = (): string => {
  return import.meta.env.VITE_APP_URL || REVIEW_BASE_URL;
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