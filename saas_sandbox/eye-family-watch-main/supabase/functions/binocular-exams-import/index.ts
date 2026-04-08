import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Verify API key
  const apiKey = req.headers.get("x-api-key");
  const expectedKey = Deno.env.get("BINOCULAR_API_KEY");
  if (!apiKey || apiKey !== expectedKey) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const {
      pairing_code,
      exam_date,
      clinic_name,
      overall_level,
      overall_color,
      convergence,
      accommodation,
      stereopsis,
      short_conclusion,
      report_url,
      source_id,
    } = body;

    if (!pairing_code || !exam_date || !clinic_name) {
      return new Response(
        JSON.stringify({ error: "pairing_code, exam_date, clinic_name are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Validate pairing code
    const { data: pairingRecord, error: pairingError } = await supabase
      .from("pairing_codes")
      .select("id, member_id")
      .eq("code", pairing_code)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (pairingError || !pairingRecord) {
      return new Response(
        JSON.stringify({ error: "配對碼無效或已過期" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const member_id = pairingRecord.member_id;

    // Upsert by source_id if provided
    let result;
    if (source_id) {
      const { data: existing } = await supabase
        .from("binocular_exams")
        .select("id")
        .eq("source_id", source_id)
        .maybeSingle();

      if (existing) {
        result = await supabase
          .from("binocular_exams")
          .update({
            member_id, exam_date, clinic_name, overall_level, overall_color,
            convergence, accommodation, stereopsis, short_conclusion, report_url,
          })
          .eq("id", existing.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from("binocular_exams")
          .insert({
            member_id, exam_date, clinic_name, overall_level, overall_color,
            convergence, accommodation, stereopsis, short_conclusion, report_url, source_id,
          })
          .select()
          .single();
      }
    } else {
      result = await supabase
        .from("binocular_exams")
        .insert({
          member_id, exam_date, clinic_name, overall_level, overall_color,
          convergence, accommodation, stereopsis, short_conclusion, report_url,
        })
        .select()
        .single();
    }

    if (result.error) {
      return new Response(JSON.stringify({ error: result.error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark pairing code as used
    await supabase
      .from("pairing_codes")
      .update({ used: true })
      .eq("id", pairingRecord.id);

    return new Response(JSON.stringify({ success: true, data: result.data }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
