"use server";

import { Resend } from "resend";

// ─── Config ────────────────────────────────────────────────
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "VivahSthal <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@vivahsthal.com";
const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP || process.env.NEXT_PUBLIC_HOTEL_PHONE || "";
const HOTEL_PHONE = process.env.NEXT_PUBLIC_HOTEL_PHONE || "8000000000";

// ─── Resend helper ─────────────────────────────────────────
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

// ─── Types ─────────────────────────────────────────────────
export interface EnquiryData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  venueName?: string;
  vendorName?: string;
  vendorEmail?: string;
  eventDate?: string;
  guestCount?: number;
  slotPreference?: string;
  budgetRange?: string;
  message?: string;
}

// ================================================================
// 1. SEND EMAIL TO ADMIN — Notification about new enquiry
// ================================================================
export async function sendAdminNotificationEmail(data: EnquiryData): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn("[Notification] RESEND_API_KEY not set — skipping admin email");
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ADMIN_EMAIL],
      subject: `🎊 New Enquiry${data.venueName ? ` for ${data.venueName}` : ""} — ${data.customerName}`,
      html: buildAdminEmailHtml(data),
    });

    if (error) {
      console.error("[Notification] Admin email error:", error);
      // Try plain text fallback if HTML fails
      const { error: textError } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [ADMIN_EMAIL],
        subject: `New Enquiry${data.venueName ? ` for ${data.venueName}` : ""} — ${data.customerName}`,
        text: buildAdminEmailText(data),
      });
      if (textError) {
        console.error("[Notification] Admin text email also failed:", textError);
        return false;
      }
    }
    console.log("[Notification] Admin email sent successfully");
    return true;
  } catch (err) {
    console.error("[Notification] Admin email exception:", err);
    return false;
  }
}

// ================================================================
// 2. SEND EMAIL TO VENDOR — Notification about their venue enquiry
// ================================================================
export async function sendVendorNotificationEmail(data: EnquiryData): Promise<boolean> {
  if (!data.vendorEmail) return false;

  const resend = getResend();
  if (!resend) {
    console.warn("[Notification] RESEND_API_KEY not set — skipping vendor email");
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [data.vendorEmail],
      subject: `New Enquiry for ${data.venueName || "Your Venue"} — ${data.customerName}`,
      html: buildVendorEmailHtml(data),
    });

    if (error) {
      console.error("[Notification] Vendor email error:", error);
      // Fallback to text
      await resend.emails.send({
        from: FROM_EMAIL,
        to: [data.vendorEmail],
        subject: `New Enquiry for ${data.venueName || "Your Venue"} — ${data.customerName}`,
        text: buildAdminEmailText(data),
      }).catch(() => {});
      return false;
    }
    console.log("[Notification] Vendor email sent to", data.vendorEmail);
    return true;
  } catch (err) {
    console.error("[Notification] Vendor email exception:", err);
    return false;
  }
}

// ================================================================
// 3. SEND AUTO-REPLY EMAIL TO CUSTOMER — Confirmation
// ================================================================
export async function sendCustomerAutoReplyEmail(data: EnquiryData): Promise<boolean> {
  if (!data.customerEmail) return false;

  const resend = getResend();
  if (!resend) {
    console.warn("[Notification] RESEND_API_KEY not set — skipping customer auto-reply");
    return false;
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [data.customerEmail],
      subject: `Thank you for your enquiry${data.venueName ? ` about ${data.venueName}` : ""} — VivahSthal`,
      html: buildCustomerAutoReplyHtml(data),
    });

    if (error) {
      console.error("[Notification] Customer auto-reply error:", error);
      // Fallback text
      await resend.emails.send({
        from: FROM_EMAIL,
        to: [data.customerEmail],
        subject: `Thank you for your enquiry — VivahSthal`,
        text: buildCustomerAutoReplyText(data),
      }).catch(() => {});
      return false;
    }
    console.log("[Notification] Customer auto-reply sent to", data.customerEmail);
    return true;
  } catch (err) {
    console.error("[Notification] Customer auto-reply exception:", err);
    return false;
  }
}

// ================================================================
// 4. WHATSAPP AUTO-REPLY TO CUSTOMER (via wa.me deeplink or Cloud API)
// ================================================================
export async function sendWhatsAppAutoReply(phone: string, data: EnquiryData): Promise<{ sent: boolean; link: string }> {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const fullPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;

  const message = buildCustomerWhatsAppMessage(data);
  const waLink = `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;

  // Try WhatsApp Cloud API if configured
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (token && phoneId) {
    try {
      const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: fullPhone,
          type: "text",
          text: { body: message },
        }),
      });
      if (res.ok) {
        console.log("[Notification] WhatsApp auto-reply sent to", fullPhone);
        return { sent: true, link: waLink };
      }
      console.error("[Notification] WhatsApp API error:", await res.text());
    } catch (err) {
      console.error("[Notification] WhatsApp API exception:", err);
    }
  } else {
    console.log("[Notification] WHATSAPP_TOKEN/PHONE_ID not configured — auto-reply link generated only");
  }

  return { sent: false, link: waLink };
}

// ================================================================
// 5. WHATSAPP NOTIFICATION TO ADMIN
// ================================================================
export async function sendAdminWhatsAppNotification(data: EnquiryData): Promise<boolean> {
  if (!ADMIN_WHATSAPP) return false;

  const message = buildAdminWhatsAppMessage(data);
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;

  if (!token || !phoneId) {
    console.log("[Notification] WhatsApp not configured — admin WA notification skipped. Link: https://wa.me/" + ADMIN_WHATSAPP);
    return false;
  }

  try {
    const fullPhone = ADMIN_WHATSAPP.length === 10 ? `91${ADMIN_WHATSAPP}` : ADMIN_WHATSAPP;
    const res = await fetch(`https://graph.facebook.com/v18.0/${phoneId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: fullPhone,
        type: "text",
        text: { body: message },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ================================================================
// MESSAGE TEMPLATES
// ================================================================

function buildCustomerWhatsAppMessage(data: EnquiryData): string {
  return `🙏 नमस्कार ${data.customerName} जी!

VivahSthal पर आपकी enquiry मिल गई है। 🎊
${data.venueName ? `\n📍 Venue: ${data.venueName}` : ""}
${data.eventDate ? `📅 Date: ${data.eventDate}` : ""}

हमारे representative जल्द ही आपसे संपर्क करेंगे (30 min के अंदर)।

Thank you for choosing VivahSthal! 💕
Kaimur & Rohtas ka #1 Wedding Platform

📞 Helpline: ${HOTEL_PHONE}
🌐 www.vivahsthal.com`;
}

function buildAdminWhatsAppMessage(data: EnquiryData): string {
  return `🔔 NEW ENQUIRY — VivahSthal

👤 ${data.customerName}
📱 ${data.customerPhone}
${data.customerEmail ? `📧 ${data.customerEmail}` : ""}
${data.venueName ? `🏛 Venue: ${data.venueName}` : ""}
${data.eventDate ? `📅 Date: ${data.eventDate}` : ""}
${data.guestCount ? `👥 Guests: ${data.guestCount}` : ""}
${data.budgetRange ? `💰 Budget: ${data.budgetRange}` : ""}
${data.message ? `💬 ${data.message}` : ""}

Call now: tel:${data.customerPhone}`;
}

function buildCustomerAutoReplyHtml(data: EnquiryData): string {
  return `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fefefe; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
  <div style="background: linear-gradient(135deg, #E91E63, #C2185B); padding: 24px 32px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 24px;">💕 VivahSthal</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px;">Kaimur & Rohtas ka #1 Wedding Platform</p>
  </div>
  <div style="padding: 28px 32px;">
    <p style="color: #374151; font-size: 16px; margin: 0 0 8px;">
      🙏 नमस्कार <strong>${data.customerName}</strong> जी!
    </p>
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
      आपकी enquiry हमें मिल गई है। हमारे representative <strong>30 minutes</strong> के अंदर आपसे संपर्क करेंगे।
    </p>
    ${data.venueName ? `<p style="color: #374151; font-size: 14px; margin: 0 0 4px;">🏛 <strong>Venue:</strong> ${data.venueName}</p>` : ""}
    ${data.eventDate ? `<p style="color: #374151; font-size: 14px; margin: 0 0 4px;">📅 <strong>Date:</strong> ${data.eventDate}</p>` : ""}
    ${data.guestCount ? `<p style="color: #374151; font-size: 14px; margin: 0 0 4px;">👥 <strong>Guests:</strong> ${data.guestCount}</p>` : ""}
    <div style="text-align: center; margin: 24px 0;">
      <a href="https://wa.me/91${HOTEL_PHONE}" style="display: inline-block; background: #25D366; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
        💬 WhatsApp हमसे बात करें
      </a>
    </div>
    <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 20px;">
      📞 Helpline: ${HOTEL_PHONE} | 🌐 www.vivahsthal.com
    </p>
  </div>
</div>`;
}

function buildCustomerAutoReplyText(data: EnquiryData): string {
  return `Namaste ${data.customerName} ji!

Aapki enquiry VivahSthal par mil gayi hai.${data.venueName ? `\nVenue: ${data.venueName}` : ""}${data.eventDate ? `\nDate: ${data.eventDate}` : ""}

Humare representative 30 minutes ke andar aapse contact karenge.

Thank you for choosing VivahSthal!
Helpline: ${HOTEL_PHONE}
Website: www.vivahsthal.com`;
}

function buildAdminEmailHtml(data: EnquiryData): string {
  return `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fefefe; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
  <div style="background: linear-gradient(135deg, #E91E63, #C2185B); padding: 24px 32px;">
    <h1 style="color: white; margin: 0; font-size: 22px;">🔔 New Enquiry Received!</h1>
    <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0; font-size: 14px;">${data.venueName || "General Enquiry"}</p>
  </div>
  <div style="padding: 24px 32px;">
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <tr><td style="padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; color: #6b7280; font-size: 13px; width: 140px;">Customer</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827; font-size: 14px;">${data.customerName}</td></tr>
      <tr><td style="padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; color: #6b7280; font-size: 13px;">Phone</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827; font-size: 14px;"><a href="tel:${data.customerPhone}" style="color: #E91E63;">${data.customerPhone}</a></td></tr>
      ${data.customerEmail ? `<tr><td style="padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; color: #6b7280; font-size: 13px;">Email</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827; font-size: 14px;"><a href="mailto:${data.customerEmail}" style="color: #E91E63;">${data.customerEmail}</a></td></tr>` : ""}
      ${data.venueName ? `<tr><td style="padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; color: #6b7280; font-size: 13px;">Venue</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827; font-size: 14px;">${data.venueName}</td></tr>` : ""}
      ${data.eventDate ? `<tr><td style="padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; color: #6b7280; font-size: 13px;">Event Date</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827; font-size: 14px;">${data.eventDate}</td></tr>` : ""}
      ${data.guestCount ? `<tr><td style="padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; color: #6b7280; font-size: 13px;">Guests</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827; font-size: 14px;">${data.guestCount}</td></tr>` : ""}
      ${data.slotPreference ? `<tr><td style="padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; color: #6b7280; font-size: 13px;">Slot</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827; font-size: 14px;">${data.slotPreference}</td></tr>` : ""}
      ${data.budgetRange ? `<tr><td style="padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; color: #6b7280; font-size: 13px;">Budget</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827; font-size: 14px;">${data.budgetRange}</td></tr>` : ""}
      ${data.message ? `<tr><td style="padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; color: #6b7280; font-size: 13px;">Message</td><td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827; font-size: 14px;">${data.message}</td></tr>` : ""}
    </table>
    <div style="text-align: center; margin-top: 24px;">
      <a href="tel:${data.customerPhone}" style="display: inline-block; background: linear-gradient(135deg, #E91E63, #C2185B); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
        📞 Call Customer Now
      </a>
    </div>
    <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; text-align: center;">
      Respond within 30 minutes — VivahSthal Admin Panel
    </p>
  </div>
</div>`;
}

function buildAdminEmailText(data: EnquiryData): string {
  return `NEW ENQUIRY — VivahSthal

Customer: ${data.customerName}
Phone: ${data.customerPhone}
${data.customerEmail ? `Email: ${data.customerEmail}` : ""}
${data.venueName ? `Venue: ${data.venueName}` : "General Enquiry"}
${data.eventDate ? `Date: ${data.eventDate}` : ""}
${data.guestCount ? `Guests: ${data.guestCount}` : ""}
${data.budgetRange ? `Budget: ${data.budgetRange}` : ""}
${data.message ? `Message: ${data.message}` : ""}

Please respond within 30 minutes.`;
}

function buildVendorEmailHtml(data: EnquiryData): string {
  return buildAdminEmailHtml({
    ...data,
    message: `[Via VivahSthal] ${data.message || "Customer wants to enquire about your venue."}`,
  });
}

// ================================================================
// MASTER FUNCTION — Call this from createLead / enquiry form
// ================================================================
export async function sendAllNotifications(
  data: EnquiryData,
  options?: { skipVendor?: boolean }
): Promise<{
  adminEmailSent: boolean;
  vendorEmailSent: boolean;
  customerEmailSent: boolean;
  customerWhatsApp: { sent: boolean; link: string };
  adminWhatsAppSent: boolean;
}> {
  // Fire all notifications in parallel — never block, never fail
  const [adminEmail, vendorEmail, customerEmail, customerWA, adminWA] = await Promise.allSettled([
    sendAdminNotificationEmail(data),
    options?.skipVendor ? Promise.resolve(false) : sendVendorNotificationEmail(data),
    sendCustomerAutoReplyEmail(data),
    sendWhatsAppAutoReply(data.customerPhone, data),
    sendAdminWhatsAppNotification(data),
  ]);

  return {
    adminEmailSent: adminEmail.status === "fulfilled" && adminEmail.value === true,
    vendorEmailSent: vendorEmail.status === "fulfilled" && vendorEmail.value === true,
    customerEmailSent: customerEmail.status === "fulfilled" && customerEmail.value === true,
    customerWhatsApp: customerWA.status === "fulfilled" ? customerWA.value : { sent: false, link: "" },
    adminWhatsAppSent: adminWA.status === "fulfilled" && adminWA.value === true,
  };
}
