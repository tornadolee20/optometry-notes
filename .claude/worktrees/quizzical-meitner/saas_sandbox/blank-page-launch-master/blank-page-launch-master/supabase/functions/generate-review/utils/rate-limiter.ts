// Rate limiting utility for Edge Functions
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Rate limiting configuration
const RATE_LIMITS = {
  'generate-review': {
    maxRequests: 20,        // Max requests per window
    windowMinutes: 15,      // Time window in minutes
    blockDurationMinutes: 60 // How long to block after exceeding limit
  }
};

// Initialize Supabase client with service role for rate limiting operations
const getSupabaseServiceClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration for rate limiting');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
};

export interface RateLimitResult {
  allowed: boolean;
  remaining?: number;
  resetTime?: Date;
  error?: string;
}

export async function checkRateLimit(
  functionName: string,
  origin?: string,
  ipAddress?: string
): Promise<RateLimitResult> {
  try {
    const config = RATE_LIMITS[functionName as keyof typeof RATE_LIMITS];
    if (!config) {
      return { allowed: true }; // No rate limit configured
    }
    
    const supabase = getSupabaseServiceClient();
    const now = new Date();
    const windowStart = new Date(now.getTime() - (config.windowMinutes * 60 * 1000));
    
    // Clean up old records first
    await supabase
      .from('function_usage_logs')
      .delete()
      .lt('created_at', new Date(now.getTime() - (24 * 60 * 60 * 1000)).toISOString());
    
    // Check current usage within the time window
    let query = supabase
      .from('function_usage_logs')
      .select('request_count, last_request_at')
      .eq('function_name', functionName)
      .gte('window_start', windowStart.toISOString());
    
    // Prefer origin over IP for rate limiting
    if (origin) {
      query = query.eq('origin', origin);
    } else if (ipAddress) {
      query = query.eq('ip_address', ipAddress);
    } else {
      return { allowed: true }; // No identifier available
    }
    
    const { data: usageLogs, error: queryError } = await query;
    
    if (queryError) {
      console.error('Rate limit query error:', queryError);
      return { allowed: true }; // Allow on error to avoid blocking legitimate users
    }
    
    // Calculate total requests in current window
    const totalRequests = usageLogs?.reduce((sum, log) => sum + log.request_count, 0) || 0;
    
    if (totalRequests >= config.maxRequests) {
      // Check if user is still in block period
      const lastRequest = usageLogs?.[0]?.last_request_at;
      if (lastRequest) {
        const blockUntil = new Date(new Date(lastRequest).getTime() + (config.blockDurationMinutes * 60 * 1000));
        if (now < blockUntil) {
          return {
            allowed: false,
            remaining: 0,
            resetTime: blockUntil,
            error: `請求過於頻繁，請等待 ${Math.ceil((blockUntil.getTime() - now.getTime()) / 60000)} 分鐘後再試`
          };
        }
      }
    }
    
    // Update or create usage log
    const identifier = origin || ipAddress;
    const { error: upsertError } = await supabase
      .from('function_usage_logs')
      .upsert({
        origin: origin || null,
        ip_address: ipAddress || null,
        function_name: functionName,
        request_count: totalRequests + 1,
        window_start: windowStart.toISOString(),
        last_request_at: now.toISOString()
      }, {
        onConflict: origin ? 'origin,function_name,window_start' : 'ip_address,function_name,window_start'
      });
    
    if (upsertError) {
      console.error('Rate limit update error:', upsertError);
    }
    
    const remaining = Math.max(0, config.maxRequests - totalRequests - 1);
    const resetTime = new Date(windowStart.getTime() + (config.windowMinutes * 60 * 1000));
    
    return {
      allowed: totalRequests < config.maxRequests,
      remaining,
      resetTime
    };
    
  } catch (error) {
    console.error('Rate limiting error:', error);
    return { allowed: true }; // Allow on error to avoid disrupting service
  }
}

// Extract IP address from request headers with preference for Cloudflare
export function getClientIP(request: Request): string | undefined {
  // Prefer CF-Connecting-IP for Cloudflare, then fallback to other headers
  const preferredHeaders = [
    'cf-connecting-ip', // Cloudflare - most trusted
    'x-forwarded-for',  // Common proxy header
    'x-real-ip',        // Nginx proxy
    'x-client-ip',      // Alternative
    'x-forwarded',
    'forwarded-for',
    'forwarded'
  ];
  
  for (const header of preferredHeaders) {
    const value = request.headers.get(header);
    if (value) {
      // x-forwarded-for may contain multiple IPs, take the first one
      const ip = value.split(',')[0].trim();
      // Sanitize IP - basic validation for IPv4/IPv6
      if (ip && ip !== 'unknown' && isValidIP(ip)) {
        return ip;
      }
    }
  }
  
  return undefined;
}

// Basic IP validation helper
function isValidIP(ip: string): boolean {
  // IPv4 regex
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 regex (simplified)
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
  
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}