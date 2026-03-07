import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Profile {
  id: string;
  user_id: string;
  optometrist_name: string;
  clinic_name: string;
  clinic_email: string | null;
  paid_until: string;
  plan_type: string;
  registration_language: string;
}

function getEmailContent(
  name: string,
  clinicName: string,
  daysUntilExpiry: number,
  expiryDate: string,
  lang: string
) {
  const isZhTW = lang === 'zh-TW';
  
  const subject = isZhTW
    ? `【眼視光健康分析系統】您的訂閱將於 ${daysUntilExpiry} 天後到期`
    : `【眼视光健康分析系统】您的订阅将于 ${daysUntilExpiry} 天后到期`;

  const html = isZhTW
    ? `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .highlight { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>訂閱即將到期提醒</h1>
          </div>
          <div class="content">
            <p>親愛的 ${name} 先生/女士，您好：</p>
            <p>感謝您使用眼視光健康分析系統！</p>
            <div class="highlight">
              <strong>⚠️ 重要提醒：</strong><br>
              您的「${clinicName}」帳戶訂閱將於 <strong>${expiryDate}</strong>（${daysUntilExpiry} 天後）到期。
            </div>
            <p>為確保您能持續使用完整功能，建議您儘早完成續訂。到期後將無法使用以下功能：</p>
            <ul>
              <li>眼健康數據分析</li>
              <li>患者報告生成</li>
              <li>歷史記錄查詢</li>
            </ul>
            <p>請登入系統完成續訂，或透過銀行轉帳方式付款。</p>
            <p>如有任何問題，歡迎隨時與我們聯繫。</p>
            <p>祝您工作順利！</p>
          </div>
          <div class="footer">
            <p>此郵件由系統自動發送，請勿直接回覆。</p>
            <p>© ${new Date().getFullYear()} 眼視光健康分析系統</p>
          </div>
        </div>
      </body>
      </html>
    `
    : `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
          .highlight { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>订阅即将到期提醒</h1>
          </div>
          <div class="content">
            <p>亲爱的 ${name} 先生/女士，您好：</p>
            <p>感谢您使用眼视光健康分析系统！</p>
            <div class="highlight">
              <strong>⚠️ 重要提醒：</strong><br>
              您的「${clinicName}」账户订阅将于 <strong>${expiryDate}</strong>（${daysUntilExpiry} 天后）到期。
            </div>
            <p>为确保您能持续使用完整功能，建议您尽早完成续订。到期后将无法使用以下功能：</p>
            <ul>
              <li>眼健康数据分析</li>
              <li>患者报告生成</li>
              <li>历史记录查询</li>
            </ul>
            <p>请登录系统完成续订，或通过银行转账方式付款。</p>
            <p>如有任何问题，欢迎随时与我们联系。</p>
            <p>祝您工作顺利！</p>
          </div>
          <div class="footer">
            <p>此邮件由系统自动发送，请勿直接回复。</p>
            <p>© ${new Date().getFullYear()} 眼视光健康分析系统</p>
          </div>
        </div>
      </body>
      </html>
    `;

  return { subject, html };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting expiry reminder check...");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get current date and calculate target dates (7 days and 3 days from now)
    const now = new Date();
    const sevenDaysLater = new Date(now);
    sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
    const threeDaysLater = new Date(now);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    // Format dates for comparison (start and end of day)
    const formatDateStart = (date: Date) => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T00:00:00`;
    };
    const formatDateEnd = (date: Date) => {
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T23:59:59`;
    };

    // Query profiles expiring in 7 days
    const { data: profiles7Days, error: error7Days } = await supabase
      .from('optometrist_profiles')
      .select('id, user_id, optometrist_name, clinic_name, clinic_email, paid_until, plan_type, registration_language')
      .eq('is_active', true)
      .gte('paid_until', formatDateStart(sevenDaysLater))
      .lte('paid_until', formatDateEnd(sevenDaysLater));

    if (error7Days) {
      console.error("Error fetching 7-day profiles:", error7Days);
      throw error7Days;
    }

    // Query profiles expiring in 3 days
    const { data: profiles3Days, error: error3Days } = await supabase
      .from('optometrist_profiles')
      .select('id, user_id, optometrist_name, clinic_name, clinic_email, paid_until, plan_type, registration_language')
      .eq('is_active', true)
      .gte('paid_until', formatDateStart(threeDaysLater))
      .lte('paid_until', formatDateEnd(threeDaysLater));

    if (error3Days) {
      console.error("Error fetching 3-day profiles:", error3Days);
      throw error3Days;
    }

    console.log(`Found ${profiles7Days?.length || 0} profiles expiring in 7 days`);
    console.log(`Found ${profiles3Days?.length || 0} profiles expiring in 3 days`);

    const results: Array<{ email: string; daysUntilExpiry: number; status: string; error?: string }> = [];

    // Send 7-day reminders
    for (const profile of (profiles7Days || []) as Profile[]) {
      if (!profile.clinic_email) {
        console.log(`Skipping profile ${profile.id} - no email address`);
        results.push({ email: 'N/A', daysUntilExpiry: 7, status: 'skipped', error: 'No email address' });
        continue;
      }

      const expiryDate = new Date(profile.paid_until).toLocaleDateString(
        profile.registration_language === 'zh-TW' ? 'zh-TW' : 'zh-CN'
      );
      const { subject, html } = getEmailContent(
        profile.optometrist_name,
        profile.clinic_name,
        7,
        expiryDate,
        profile.registration_language || 'zh-TW'
      );

      try {
        const emailResponse = await resend.emails.send({
          from: "眼視光健康分析系統 <onboarding@resend.dev>",
          to: [profile.clinic_email],
          subject,
          html,
        });
        console.log(`7-day reminder sent to ${profile.clinic_email}:`, emailResponse);
        results.push({ email: profile.clinic_email, daysUntilExpiry: 7, status: 'sent' });
      } catch (emailError: any) {
        console.error(`Failed to send email to ${profile.clinic_email}:`, emailError);
        results.push({ email: profile.clinic_email, daysUntilExpiry: 7, status: 'failed', error: emailError.message });
      }
    }

    // Send 3-day reminders
    for (const profile of (profiles3Days || []) as Profile[]) {
      if (!profile.clinic_email) {
        console.log(`Skipping profile ${profile.id} - no email address`);
        results.push({ email: 'N/A', daysUntilExpiry: 3, status: 'skipped', error: 'No email address' });
        continue;
      }

      const expiryDate = new Date(profile.paid_until).toLocaleDateString(
        profile.registration_language === 'zh-TW' ? 'zh-TW' : 'zh-CN'
      );
      const { subject, html } = getEmailContent(
        profile.optometrist_name,
        profile.clinic_name,
        3,
        expiryDate,
        profile.registration_language || 'zh-TW'
      );

      try {
        const emailResponse = await resend.emails.send({
          from: "眼視光健康分析系統 <onboarding@resend.dev>",
          to: [profile.clinic_email],
          subject,
          html,
        });
        console.log(`3-day reminder sent to ${profile.clinic_email}:`, emailResponse);
        results.push({ email: profile.clinic_email, daysUntilExpiry: 3, status: 'sent' });
      } catch (emailError: any) {
        console.error(`Failed to send email to ${profile.clinic_email}:`, emailError);
        results.push({ email: profile.clinic_email, daysUntilExpiry: 3, status: 'failed', error: emailError.message });
      }
    }

    console.log("Expiry reminder check completed. Results:", results);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Expiry reminder check completed",
        results,
        summary: {
          total: results.length,
          sent: results.filter(r => r.status === 'sent').length,
          skipped: results.filter(r => r.status === 'skipped').length,
          failed: results.filter(r => r.status === 'failed').length,
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-expiry-reminder function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
