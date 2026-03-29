// Security-enhanced Edge Function for review generation
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { RequestBody, ResponseData } from './types.ts';
import { getCorsHeaders, validateOrigin } from './config.ts';
import { processReviewRequest } from './review-processor.ts';
import { checkRateLimit, getClientIP } from './utils/rate-limiter.ts';
import { recordResponse, evaluateAndAlert } from './utils/error-monitor.ts';

// Helper: send response and feed status into error monitor
function monitoredResponse(body: string, init: ResponseInit): Response {
  const status = init.status || 200;
  recordResponse(status);
  // Fire-and-forget alert evaluation (non-blocking)
  evaluateAndAlert('generate-review').catch(() => {});
  return new Response(body, init);
}

// Dual-mode JWT verification: validates token when present, allows anonymous otherwise
async function verifyOptionalJWT(req: Request): Promise<{ authenticated: boolean; userId?: string; error?: string }> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    // No token provided — anonymous mode allowed
    return { authenticated: false };
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');

    // Skip validation for anon key (used by anonymous requests from frontend)
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (token === anonKey) {
      return { authenticated: false };
    }

    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      return { authenticated: false, error: 'Invalid or expired JWT token' };
    }

    return { authenticated: true, userId: data.user.id };
  } catch {
    return { authenticated: false, error: 'JWT verification failed' };
  }
}

// Input validation and security checks
const validateRequest = (requestData: RequestBody, origin?: string): { isValid: boolean; error?: string } => {
  const { storeName, address, keywords = [], customFeelings = [], description } = requestData;
  
  // Basic required fields
  if (!storeName?.trim()) {
    return { isValid: false, error: '商店名稱為必填欄位' };
  }
  
  // Input length limits to prevent abuse
  if (storeName.length > 100) {
    return { isValid: false, error: '商店名稱長度不能超過100字元' };
  }
  
  if (address && address.length > 200) {
    return { isValid: false, error: '地址長度不能超過200字元' };
  }
  
  if (description && description.length > 500) {
    return { isValid: false, error: '描述長度不能超過500字元' };
  }
  
  // Keywords validation
  if (keywords.length > 20) {
    return { isValid: false, error: '關鍵字數量不能超過20個' };
  }
  
  if (customFeelings.length > 10) {
    return { isValid: false, error: '自訂感受數量不能超過10個' };
  }
  
  // Individual keyword length check
  const allKeywords = [...keywords, ...customFeelings];
  for (const keyword of allKeywords) {
    if (keyword && keyword.length > 50) {
      return { isValid: false, error: '單個關鍵字長度不能超過50字元' };
    }
  }
  
  return { isValid: true };
};


Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);
  const clientIP = getClientIP(req);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Require and validate Origin header for security
  if (!origin) {
    console.warn('Blocked request missing Origin header');
    return monitoredResponse(
      JSON.stringify({ error: '缺少必要的Origin標頭' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  if (!validateOrigin(origin)) {
    console.warn('Blocked request from unauthorized origin:', origin);
    return monitoredResponse(
      JSON.stringify({ error: '未經授權的來源' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Rate limiting check
  const rateLimitResult = await checkRateLimit('generate-review', origin, clientIP);
  if (!rateLimitResult.allowed) {
    return monitoredResponse(
      JSON.stringify({ 
        error: rateLimitResult.error || '請求過於頻繁，請稍後再試',
        resetTime: rateLimitResult.resetTime?.toISOString()
      }),
      { 
        status: 429,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Retry-After': '900',
          'X-RateLimit-Remaining': String(rateLimitResult.remaining || 0),
          'X-RateLimit-Reset': rateLimitResult.resetTime?.toISOString() || ''
        } 
      }
    );
  }

  // Dual-mode JWT verification
  const jwtResult = await verifyOptionalJWT(req);
  
  // If a JWT was provided but is invalid, reject with 401
  if (jwtResult.error && req.headers.get('Authorization')?.startsWith('Bearer ')) {
    const token = req.headers.get('Authorization')!.replace('Bearer ', '');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (token !== anonKey) {
      return monitoredResponse(
        JSON.stringify({ error: jwtResult.error }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  }

  try {
    // Parse and validate request
    const requestData: RequestBody = await req.json();
    
    // Input validation
    const validation = validateRequest(requestData, origin);
    if (!validation.isValid) {
      return monitoredResponse(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Process the review request
    const responseData = await processReviewRequest(requestData);

    return monitoredResponse(
      JSON.stringify({
        ...responseData,
        authenticated: jwtResult.authenticated,
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': String(rateLimitResult.remaining || 0)
        } 
      }
    );
  } catch (error) {
    const errorId = crypto.randomUUID().slice(0, 8);
    console.error(`[${errorId}] Edge function error:`, error instanceof Error ? error.message : 'Unknown error');
    
    const message = error instanceof Error ? error.message : 'Service temporarily unavailable';
    const status = typeof message === 'string' && message.includes('Missing required') ? 400 : 500;
    
    return monitoredResponse(
      JSON.stringify({ error: message, errorId }),
      { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
