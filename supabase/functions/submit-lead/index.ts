// Supabase Edge Function: /functions/v1/submit-lead
// Accepts lead form data and inserts using SERVICE ROLE — no RLS issues.
// This is more reliable than direct PostgREST inserts from an anon client.
//
// Deploy: supabase functions deploy submit-lead --no-verify-jwt

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json();

    // Validate required fields
    if (!body.customer_name || !body.customer_phone) {
      return new Response(
        JSON.stringify({ success: false, error: "customer_name and customer_phone are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use service role to bypass RLS — safe because this function validates input
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "https://qvuxmnysvmebwpiupink.supabase.co";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Build safe lead object — only allowed columns
    const leadData: Record<string, unknown> = {
      customer_name:   String(body.customer_name).trim(),
      customer_phone:  String(body.customer_phone).trim(),
      customer_email:  body.customer_email || null,
      venue_id:        body.venue_id || null,
      event_date:      body.event_date || null,
      slot_preference: body.slot_preference || null,
      guest_count:     body.guest_count ? parseInt(String(body.guest_count)) : null,
      budget_range:    body.budget_range || null,
      message:         body.message || null,
      source:          body.source || "website",
      status:          "new",
    };

    // Only set customer_id if it's a valid UUID (logged-in user)
    if (body.customer_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.customer_id)) {
      leadData.customer_id = body.customer_id;
    }

    const { data: lead, error } = await supabase
      .from("leads")
      .insert(leadData)
      .select()
      .single();

    if (error) {
      console.error("Lead insert error:", error);
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Also insert into enquiry_inbox for vendor visibility
    if (lead?.id) {
      let vendorId: string | null = null;
      if (leadData.venue_id) {
        const { data: venue } = await supabase
          .from("venues")
          .select("vendor_id")
          .eq("id", leadData.venue_id)
          .single();
        vendorId = venue?.vendor_id ?? null;
      }

      await supabase.from("enquiry_inbox").insert({
        lead_id:        lead.id,
        venue_id:       leadData.venue_id ?? null,
        vendor_id:      vendorId,
        customer_name:  leadData.customer_name,
        customer_phone: leadData.customer_phone,
        customer_email: leadData.customer_email ?? null,
        message:        leadData.message ?? null,
        source:         leadData.source,
        is_read:        false,
      }).then(({ error: inboxErr }) => {
        if (inboxErr) console.warn("enquiry_inbox insert warning:", inboxErr.message);
      });
    }

    return new Response(
      JSON.stringify({ success: true, lead }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("submit-lead error:", err);
    return new Response(
      JSON.stringify({ success: false, error: "Server error. Please try again." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
