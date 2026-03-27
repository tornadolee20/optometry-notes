import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.87.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PaymentConfirmedRequest {
  paymentId: string;
  userId: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { paymentId, userId }: PaymentConfirmedRequest = await req.json();

    console.log("Processing payment confirmation email:", { paymentId, userId });

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch payment details
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .maybeSingle();

    if (paymentError || !payment) {
      console.error("Payment not found:", paymentError);
      return new Response(
        JSON.stringify({ error: "Payment not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("optometrist_profiles")
      .select("optometrist_name, clinic_email, paid_until")
      .eq("user_id", userId)
      .maybeSingle();

    if (profileError || !profile) {
      console.error("Profile not found:", profileError);
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user email from auth
    const { data: authUser } = await supabase.auth.admin.getUserById(userId);
    const userEmail = profile.clinic_email || authUser?.user?.email;

    if (!userEmail) {
      console.error("No email found for user");
      return new Response(
        JSON.stringify({ error: "No email found for user" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const planName = payment.plan_type === "yearly" ? "年付方案" : "月付方案";
    const paidUntilFormatted = new Date(profile.paid_until).toLocaleDateString("zh-TW");

    // Send confirmation email
    const emailResponse = await resend.emails.send({
      from: "MYWONVISION <noreply@resend.dev>",
      to: [userEmail],
      subject: "【MYWONVISION】您的付款已確認",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #0ea5e9, #0284c7); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
            .info-box { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e2e8f0; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
            .info-row:last-child { border-bottom: none; }
            .label { color: #64748b; }
            .value { font-weight: 600; color: #0f172a; }
            .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; }
            .btn { display: inline-block; background: #0ea5e9; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">MYWONVISION</h1>
              <p style="margin: 10px 0 0;">付款確認通知</p>
            </div>
            <div class="content">
              <p>親愛的 ${profile.optometrist_name || "用戶"} 您好，</p>
              <p>感謝您選擇 MYWONVISION！我們已確認收到您的付款，您的訂閱已成功啟用。</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">訂閱方案</span>
                  <span class="value">${planName}</span>
                </div>
                <div class="info-row">
                  <span class="label">付款金額</span>
                  <span class="value">NT$ ${payment.amount.toLocaleString()}</span>
                </div>
                <div class="info-row">
                  <span class="label">匯款帳號後五碼</span>
                  <span class="value">${payment.provider_trade_no || "-"}</span>
                </div>
                <div class="info-row">
                  <span class="label">使用權效期至</span>
                  <span class="value">${paidUntilFormatted}</span>
                </div>
              </div>
              
              <p>如有任何問題，歡迎隨時透過 LINE 或 Email 與我們聯繫。</p>
              
              <p style="margin-top: 30px;">
                祝您使用愉快！<br>
                MYWONVISION 團隊
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} MYWONVISION. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-payment-confirmed function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
