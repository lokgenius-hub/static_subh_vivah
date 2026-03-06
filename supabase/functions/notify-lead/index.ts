// Supabase Edge Function: /functions/v1/notify-lead
// Triggered by Supabase Database Webhook when a new lead is inserted
// 
// Setup steps:
// 1. Deploy: supabase functions deploy notify-lead
// 2. Set secrets: supabase secrets set RESEND_API_KEY=re_... ADMIN_EMAIL=bhabuasavvy@gmail.com
// 3. In Supabase Dashboard → Database → Webhooks → Create webhook:
//    - Table: leads, Event: INSERT
//    - URL: https://<your-project-ref>.supabase.co/functions/v1/notify-lead
//    - HTTP method: POST

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();

    // Supabase webhook sends: { type: "INSERT", table: "leads", record: {...} }
    const record = payload.record ?? payload;

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_EMAIL") ?? "bhabuasavvy@gmail.com";

    if (!resendApiKey) {
      console.error("RESEND_API_KEY not set in Edge Function secrets");
      return new Response(JSON.stringify({ error: "RESEND_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customerName = record.customer_name ?? "Unknown";
    const customerPhone = record.customer_phone ?? "N/A";
    const customerEmail = record.customer_email ?? "Not provided";
    const eventDate = record.event_date ?? "Not specified";
    const guestCount = record.guest_count ?? "Not specified";
    const budgetRange = record.budget_range ?? "Not specified";
    const slotPreference = record.slot_preference ?? "Any";
    const message = record.message ?? "No message";
    const source = record.source ?? "website";
    const createdAt = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="font-family: sans-serif; background: #fff8f0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #c0392b, #e74c3c); padding: 24px;">
      <h1 style="color: white; margin: 0; font-size: 22px;">🎊 New Venue Enquiry — VivahSthal</h1>
      <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">${createdAt}</p>
    </div>
    <div style="padding: 28px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; color: #666; font-size: 14px; width: 40%;">👤 Customer Name</td><td style="padding: 8px 0; font-weight: 600;">${customerName}</td></tr>
        <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">📞 Phone</td><td style="padding: 8px 0; font-weight: 600; color: #c0392b;">${customerPhone}</td></tr>
        <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">📧 Email</td><td style="padding: 8px 0;">${customerEmail}</td></tr>
        <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">📅 Event Date</td><td style="padding: 8px 0;">${eventDate}</td></tr>
        <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">👥 Guest Count</td><td style="padding: 8px 0;">${guestCount}</td></tr>
        <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">💰 Budget Range</td><td style="padding: 8px 0;">${budgetRange}</td></tr>
        <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">🕐 Slot Preference</td><td style="padding: 8px 0;">${slotPreference}</td></tr>
        <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">📝 Message</td><td style="padding: 8px 0; font-style: italic;">${message}</td></tr>
        <tr><td style="padding: 8px 0; color: #666; font-size: 14px;">🔗 Source</td><td style="padding: 8px 0;">${source}</td></tr>
      </table>
      <div style="margin-top: 24px; padding: 16px; background: #fef9f0; border-left: 4px solid #c0392b; border-radius: 4px;">
        <p style="margin: 0; font-size: 14px; color: #666;">
          📌 <strong>Action needed:</strong> Contact <strong>${customerName}</strong> at <strong>${customerPhone}</strong> within 30 minutes for best conversion.
        </p>
      </div>
    </div>
    <div style="padding: 16px 28px; background: #f9f9f9; font-size: 12px; color: #999; text-align: center;">
      VivahSthal — Bihar's Premier Wedding Venue Marketplace
    </div>
  </div>
</body>
</html>`;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "VivahSthal Enquiries <onboarding@resend.dev>",
        to: [adminEmail],
        subject: `🎊 New Enquiry from ${customerName} — VivahSthal`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errText = await emailResponse.text();
      console.error("Resend error:", errText);
      return new Response(JSON.stringify({ error: "Email send failed", details: errText }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("notify-lead error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
