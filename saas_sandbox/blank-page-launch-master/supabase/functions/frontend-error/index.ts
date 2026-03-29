import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { errorId, message, stack, componentStack, route, userAgent, userId, metadata } = body;

    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing required field: message' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Truncate large fields to prevent abuse
    const sanitize = (val: unknown, max: number): string | null => {
      if (typeof val !== 'string') return null;
      return val.slice(0, max);
    };

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { error } = await supabase.from('frontend_error_logs').insert({
      error_id: sanitize(errorId, 100) ?? `fe_${Date.now()}`,
      message: sanitize(message, 2000)!,
      stack: sanitize(stack, 5000),
      component_stack: sanitize(componentStack, 3000),
      route: sanitize(route, 500),
      user_agent: sanitize(userAgent, 500),
      user_id: sanitize(userId, 100),
      metadata: typeof metadata === 'object' ? metadata : {},
    });

    if (error) {
      console.error('[frontend-error] DB insert error:', error.message);
      return new Response(
        JSON.stringify({ error: 'Failed to log error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[frontend-error] Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
