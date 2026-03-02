"use server";

import { Resend } from "resend";

const FROM_EMAIL = "VivahSthal <onboarding@resend.dev>";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendVendorEnquiryEmail(opts: {
  vendorEmail: string;
  vendorName: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  venueName: string;
  eventDate?: string;
  guestCount?: number;
  slotPreference?: string;
  budgetRange?: string;
  message?: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping vendor notification email");
    return { success: false, error: "Email not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.vendorEmail,
      subject: `New Enquiry for ${opts.venueName} — ${opts.customerName}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fefefe; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
          <div style="background: linear-gradient(135deg, #C8956C, #B8860B); padding: 24px 32px;">
            <h1 style="color: white; margin: 0; font-size: 22px;">New Enquiry Received!</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0; font-size: 14px;">${opts.venueName}</p>
          </div>

          <div style="padding: 24px 32px;">
            <p style="color: #374151; margin: 0 0 16px; font-size: 15px;">
              Hi <strong>${opts.vendorName}</strong>, you have a new enquiry from a potential customer.
            </p>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; color: #6b7280; font-size: 13px; width: 140px;">Customer Name</td>
                <td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827; font-size: 14px;">${opts.customerName}</td>
              </tr>
              <tr>
                <td style="padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; color: #6b7280; font-size: 13px;">Phone</td>
                <td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827; font-size: 14px;">
                  <a href="tel:${opts.customerPhone}" style="color: #C8956C; text-decoration: none;">${opts.customerPhone}</a>
                </td>
              </tr>
              ${opts.customerEmail ? `
              <tr>
                <td style="padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; color: #6b7280; font-size: 13px;">Email</td>
                <td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827; font-size: 14px;">
                  <a href="mailto:${opts.customerEmail}" style="color: #C8956C; text-decoration: none;">${opts.customerEmail}</a>
                </td>
              </tr>` : ""}
              ${opts.eventDate ? `
              <tr>
                <td style="padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; color: #6b7280; font-size: 13px;">Event Date</td>
                <td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827; font-size: 14px;">${opts.eventDate}</td>
              </tr>` : ""}
              ${opts.guestCount ? `
              <tr>
                <td style="padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; color: #6b7280; font-size: 13px;">Guest Count</td>
                <td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827; font-size: 14px;">${opts.guestCount} guests</td>
              </tr>` : ""}
              ${opts.slotPreference ? `
              <tr>
                <td style="padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; color: #6b7280; font-size: 13px;">Preferred Slot</td>
                <td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827; font-size: 14px; text-transform: capitalize;">${opts.slotPreference.replace("_", " ")}</td>
              </tr>` : ""}
              ${opts.budgetRange ? `
              <tr>
                <td style="padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; color: #6b7280; font-size: 13px;">Budget Range</td>
                <td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827; font-size: 14px;">${opts.budgetRange}</td>
              </tr>` : ""}
              ${opts.message ? `
              <tr>
                <td style="padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; font-weight: 600; color: #6b7280; font-size: 13px;">Message</td>
                <td style="padding: 10px 12px; border: 1px solid #e5e7eb; color: #111827; font-size: 14px;">${opts.message}</td>
              </tr>` : ""}
            </table>

            <div style="text-align: center; margin-top: 24px;">
              <a href="tel:${opts.customerPhone}" style="display: inline-block; background: linear-gradient(135deg, #C8956C, #B8860B); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                Call Customer Now
              </a>
            </div>

            <p style="color: #9ca3af; font-size: 12px; margin-top: 24px; text-align: center;">
              This email was sent by VivahSthal. Please respond to the customer within 30 minutes for the best conversion rate.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("Resend email error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: unknown) {
    console.error("Email send failed:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function sendOtpEmail(opts: {
  email: string;
  otp: string;
  name: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping OTP email");
    return { success: false, error: "Email not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.email,
      subject: `${opts.otp} — Your VivahSthal Verification Code`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #fefefe; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
          <div style="background: linear-gradient(135deg, #C8956C, #B8860B); padding: 24px 32px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 22px;">VivahSthal</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0; font-size: 13px;">Partner Registration Verification</p>
          </div>

          <div style="padding: 32px; text-align: center;">
            <p style="color: #374151; margin: 0 0 8px; font-size: 15px;">Hi <strong>${opts.name}</strong>,</p>
            <p style="color: #6b7280; margin: 0 0 24px; font-size: 14px;">Use this code to verify your email and complete registration:</p>

            <div style="background: #f9fafb; border: 2px dashed #C8956C; border-radius: 12px; padding: 20px; margin: 0 auto; max-width: 240px;">
              <p style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #111827; margin: 0;">${opts.otp}</p>
            </div>

            <p style="color: #9ca3af; font-size: 12px; margin-top: 20px;">
              This code expires in <strong>10 minutes</strong>. Do not share it with anyone.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error("OTP email error:", error);
      const isDomainError = typeof error.message === "string" &&
        (error.message.includes("verify a domain") || error.message.includes("testing emails"));
      return { success: false, error: error.message, emailNotDelivered: isDomainError };
    }

    return { success: true, id: data?.id };
  } catch (err: unknown) {
    console.error("OTP email send failed:", err);
    return { success: false, error: err instanceof Error ? err.message : "Unknown error", emailNotDelivered: true };
  }
}
