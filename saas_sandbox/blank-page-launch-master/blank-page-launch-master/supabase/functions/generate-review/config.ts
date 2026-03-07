
// API Keys
export const perplexityApiKey = Deno.env.get('PERPLEXITY_API_KEY');
export const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Allowed origins for CORS - production, preview, and localhost
const getAllowedOrigins = () => {
  const origins = [
    'https://gpt-5-store-keywords.lovable.app', // Production
    'https://gptomreview.com', // Custom domain
    'https://myownreviews.com', // New custom domain
    'https://www.myownreviews.com', // New custom domain with www
    'https://lovable.dev', // Lovable platform
    'http://localhost:5173', // Local development
    'http://localhost:3000', // Alternative local port
    'http://127.0.0.1:5173', // Local development
    'http://127.0.0.1:3000'  // Alternative local port
  ];
  
  // Add preview domains patterns
  const previewPatterns = [
    /^https:\/\/gpt-5-store-keywords-[a-z0-9]+\.lovable\.app$/, // App-specific preview pattern
    /^https:\/\/preview--[a-z0-9\-]+\.lovable\.app$/, // Lovable preview domains (e.g., preview--blank-page-launch.lovable.app)
    /^https:\/\/id-preview--[a-z0-9\-]+\.lovable\.app$/, // ID-based preview domains (e.g., id-preview--ce66bdf4-0a7d-4b6c-885f-08a99eb2fd7e.lovable.app)
    /^https:\/\/[a-z0-9\-]+\.sandbox\.lovable\.dev$/, // Sandbox pattern
    /^https:\/\/[a-z0-9\-]+\.lovableproject\.com$/, // Lovable project preview domains
    /^https:\/\/[a-z0-9\-]+\.vercel\.app$/, // Vercel production domains
    /^https:\/\/[a-z0-9\-]+--[a-z0-9\-]+\.vercel\.app$/, // Vercel preview domains
    /^https:\/\/[a-z0-9\-]+\.vercel\.app\/[a-z0-9\-]+$/ // Vercel custom subdirectories
  ];
  
  return { origins, previewPatterns };
};

// Dynamic CORS headers based on request origin
export const getCorsHeaders = (origin?: string) => {
  const { origins, previewPatterns } = getAllowedOrigins();
  
  // Check if origin is allowed
  const isAllowed = origin && (
    origins.includes(origin) || 
    previewPatterns.some(pattern => pattern.test(origin))
  );
  
  return {
    'Access-Control-Allow-Origin': isAllowed ? origin : origins[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
    'Vary': 'Origin', // Add Vary header for proper caching
  };
};

// Validate origin and return isAllowed flag
export const validateOrigin = (origin?: string): boolean => {
  if (!origin) return false;
  
  const { origins, previewPatterns } = getAllowedOrigins();
  return origins.includes(origin) || previewPatterns.some(pattern => pattern.test(origin));
};

// Fallback static headers for backwards compatibility
export const corsHeaders = getCorsHeaders();
