// Supabase Edge Function: /functions/v1/notify-lead
// Triggered by Supabase Database Webhook when a new lead is inserted.
// Uses SMTP (nodemailer) — no third-party email service needed.
//
// ─── DEPLOY ──────────────────────────────────────────────────────────────────
// supabase functions deploy notify-lead
//
// ─── SET SECRETS ─────────────────────────────────────────────────────────────
// supabase secrets set \
//   SMTP_HOST=smtp.gmail.com \
//   SMTP_PORT=587 \
//   SMTP_USER=your-gmail@gmail.com \
//   SMTP_PASS="your-gmail-app-password" \
//   ADMIN_EMAIL=bhabuasavvy@gmail.com \
//   SUPABASE_URL=https://qvuxmnysvmebwpiupink.supabase.co \
//   SUPABASE_SERVICE_ROLE_KEY=eyJ...
//
// Gmail App Password: https://myaccount.google.com/apppasswords
// (Enable 2FA first, then generate App Password for "Mail")
//
// ─── WEBHOOK (Supabase Dashboard → Database → Webhooks) ───────────────────────
//   Name: notify-new-lead
//   Table: leads, Event: INSERT
//   URL: https://qvuxmnysvmebwpiupink.supabase.co/functions/v1/notify-lead
//
// ─── EMAIL ROUTING ────────────────────────────────────────────────────────────
//   • Super admin email  → ALWAYS sent
//   • Venue owner email  → sent if venue.subscription_plan IN ('gold','diamond')
//     Uses venues.notify_email if set, else profiles.email of the vendor

import nodemailer from "npm:nodemailer@6";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── Build HTML email body ────────────────────────────────────────────────────
function buildEmailHtml(record: Record<string, string | null>, venueName: string, forVenueOwner = false) {
  const customerName    = record.customer_name    ?? "Unknown";
  const customerPhone   = record.customer_phone   ?? "N/A";
  const customerEmail   = record.customer_email   ?? "Not provided";
  const eventDate       = record.event_date       ?? "Not specified";
  const guestCount      = record.guest_count      ?? "Not specified";
  const budgetRange     = record.budget_range     ?? "Not specified";
  const slotPreference  = record.slot_preference  ?? "Any";
  const message         = record.message          ?? "No message";
  const createdAt       = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const recipientNote = forVenueOwner
    ? `<div style="background:#fff3cd;border-left:4px solid #f59e0b;padding:14px 18px;border-radius:6px;margin-bottom:20px;font-size:13px;color:#92400e;">
        <strong>📌 Note:</strong> This enquiry was submitted for <strong>${venueName}</strong>.
        Reply directly to the customer — no middleman!
      </div>`
    : `<div style="background:#fef2f2;border-left:4px solid #c0392b;padding:14px 18px;border-radius:6px;margin-bottom:20px;font-size:13px;color:#7f1d1d;">
        <strong>⚡ Action:</strong> Contact <strong>${customerName}</strong> at <strong>${customerPhone}</strong> within 30 minutes for best conversion.
      </div>`;

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:sans-serif;background:#fff8f0;padding:20px;margin:0;">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#c62a47,#8b1a2f);padding:28px 32px;">
      <h1 style="color:white;margin:0;font-size:22px;font-weight:800;">
        🎊 New Wedding Enquiry
      </h1>
      <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">
        ${venueName ? `Venue: ${venueName}` : "VivahSthal"} &nbsp;|&nbsp; ${createdAt}
      </p>
    </div>
    <div style="padding:28px 32px;">
      ${recipientNote}
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        <tr style="border-bottom:1px solid #f3f4f6;">
          <td style="padding:10px 0;color:#6b7280;width:42%;">👤 Customer Name</td>
          <td style="padding:10px 0;font-weight:700;color:#111827;">${customerName}</td>
        </tr>
        <tr style="border-bottom:1px solid #f3f4f6;">
          <td style="padding:10px 0;color:#6b7280;">📞 Phone</td>
          <td style="padding:10px 0;font-weight:700;color:#c62a47;font-size:16px;">${customerPhone}</td>
        </tr>
        <tr style="border-bottom:1px solid #f3f4f6;">
          <td style="padding:10px 0;color:#6b7280;">📧 Email</td>
          <td style="padding:10px 0;">${customerEmail}</td>
        </tr>
        <tr style="border-bottom:1px solid #f3f4f6;">
          <td style="padding:10px 0;color:#6b7280;">📅 Event Date</td>
          <td style="padding:10px 0;">${eventDate}</td>
        </tr>
        <tr style="border-bottom:1px solid #f3f4f6;">
          <td style="padding:10px 0;color:#6b7280;">👥 Guest Count</td>
          <td style="padding:10px 0;">${guestCount}</td>
        </tr>
        <tr style="border-bottom:1px solid #f3f4f6;">
          <td style="padding:10px 0;color:#6b7280;">💰 Budget Range</td>
          <td style="padding:10px 0;">${budgetRange}</td>
        </tr>
        <tr style="border-bottom:1px solid #f3f4f6;">
          <td style="padding:10px 0;color:#6b7280;">🕐 Slot Preference</td>
          <td style="padding:10px 0;">${slotPreference}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;color:#6b7280;">📝 Message</td>
          <td style="padding:10px 0;font-style:italic;color:#374151;">${message}</td>
        </tr>
      </table>
    </div>
    <div style="background:#f9fafb;padding:16px 32px;font-size:12px;color:#9ca3af;text-align:center;">
      VivahSthal — Kaimur District ka No.1 Wedding Venue Platform
    </div>
  </div>
</body>
</html>`;
}

// ─── SMTP transporter ─────────────────────────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    host:   Deno.env.get("SMTP_HOST") ?? "smtp.gmail.com",
    port:   parseInt(Deno.env.get("SMTP_PORT") ?? "587"),
    secure: false,   // true for port 465, false for 587 (STARTTLS)
    auth: {
      user: Deno.env.get("SMTP_USER"),
      pass: Deno.env.get("SMTP_PASS"),
    },
  });
}

// ─── MAIN HANDLER ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    // Supabase webhook payload: { type: "INSERT", record: {...} }
    const record: Record<string, string | null> = payload.record ?? payload;

    const adminEmail = Deno.env.get("ADMIN_EMAIL") ?? "bhabuasavvy@gmail.com";
    const smtpUser   = Deno.env.get("SMTP_USER");
    const smtpPass   = Deno.env.get("SMTP_PASS");

    if (!smtpUser || !smtpPass) {
      console.error("SMTP_USER or SMTP_PASS not set");
      return new Response(
        JSON.stringify({ error: "SMTP credentials not configured. Run: supabase secrets set SMTP_USER=... SMTP_PASS=..." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Look up venue name + owner email via Supabase service role ──────────
    let venueName     = record.venue_name ?? "";
    let venueOwnerEmail: string | null = null;
    let subscriptionPlan = "free";

    const venueId = record.venue_id;
    if (venueId) {
      const supabaseUrl        = Deno.env.get("SUPABASE_URL") ?? "https://qvuxmnysvmebwpiupink.supabase.co";
      const serviceRoleKey     = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (serviceRoleKey) {
        const supabase = createClient(supabaseUrl, serviceRoleKey);
        const { data: venue } = await supabase
          .from("venues")
          .select("name, subscription_plan, notify_email, vendor_id")
          .eq("id", venueId)
          .single();

        if (venue) {
          venueName         = venue.name ?? venueName;
          subscriptionPlan  = venue.subscription_plan ?? "free";

          // Determine venue owner notification email
          if (venue.notify_email) {
            venueOwnerEmail = venue.notify_email;
          } else if (venue.vendor_id && (subscriptionPlan === "gold" || subscriptionPlan === "diamond")) {
            // Fetch vendor email from profiles
            const { data: profile } = await supabase
              .from("profiles")
              .select("email")
              .eq("id", venue.vendor_id)
              .single();
            venueOwnerEmail = profile?.email ?? null;
          }
        }
      }
    }

    const transporter = createTransporter();
    const fromAddress = `"VivahSthal Enquiries" <${smtpUser}>`;
    const customerName = record.customer_name ?? "A customer";
    const subject = `🎊 New Enquiry${venueName ? ` for ${venueName}` : ""} — ${customerName}`;

    // ── Always send to Admin ──────────────────────────────────────────────
    await transporter.sendMail({
      from:    fromAddress,
      to:      adminEmail,
      subject: `[ADMIN] ${subject}`,
      html:    buildEmailHtml(record, venueName, false),
    });
    console.log(`Admin email sent to ${adminEmail}`);

    // ── Send to Venue Owner if Gold/Diamond plan ───────────────────────────
    if (venueOwnerEmail && (subscriptionPlan === "gold" || subscriptionPlan === "diamond")) {
      await transporter.sendMail({
        from:    fromAddress,
        to:      venueOwnerEmail,
        subject: `[${subscriptionPlan.toUpperCase()}] ${subject}`,
        html:    buildEmailHtml(record, venueName, true),
      });
      console.log(`Venue owner email sent to ${venueOwnerEmail} (plan: ${subscriptionPlan})`);
    } else {
      console.log(`Venue owner email skipped — plan: ${subscriptionPlan}, email: ${venueOwnerEmail ?? "none"}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        adminNotified: adminEmail,
        venueOwnerNotified: venueOwnerEmail ?? null,
        plan: subscriptionPlan,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("notify-lead error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

