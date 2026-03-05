"use server";

import { createClient, createServiceClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Lead, Venue, VenueSlot, VenueSearchParams, BlogPost, EnquiryInbox, MarriagePackage, Testimonial, SuccessStory } from "@/lib/types";
import { sendVendorEnquiryEmail, sendOtpEmail } from "@/lib/email";
import type { SupabaseClient } from "@supabase/supabase-js";

// In-memory OTP store (for dev — in production use Redis or DB)
const otpStore = new Map<string, { otp: string; expiresAt: number; name: string; phone: string; role: string }>();

// ============================================================
// VENDOR EMAIL NOTIFICATION (fire-and-forget)
// ============================================================

const SUPER_ADMIN_EMAIL = "admin@vivahsthal.com";
const SUPER_ADMIN_WHATSAPP = "918000000000"; // Replace with actual

async function notifyVendorByEmail(
  serviceClient: SupabaseClient,
  venueId: string,
  lead: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    eventDate?: string;
    guestCount?: number;
    slotPreference?: string;
    budgetRange?: string;
    message?: string;
  },
  leadId?: string
) {
  const { data: venue } = await serviceClient
    .from("venues")
    .select("name, vendor_id")
    .eq("id", venueId)
    .single();

  if (!venue?.vendor_id) return;

  const { data: vendor } = await serviceClient
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", venue.vendor_id)
    .single();

  if (!vendor?.email) return;

  // 1. Send email to vendor
  await sendVendorEnquiryEmail({
    vendorEmail: vendor.email,
    vendorName: vendor.full_name || "Vendor",
    customerName: lead.customerName,
    customerPhone: lead.customerPhone,
    customerEmail: lead.customerEmail,
    venueName: venue.name,
    eventDate: lead.eventDate,
    guestCount: lead.guestCount,
    slotPreference: lead.slotPreference,
    budgetRange: lead.budgetRange,
    message: lead.message,
  });

  // 2. Send email to super admin
  await sendVendorEnquiryEmail({
    vendorEmail: SUPER_ADMIN_EMAIL,
    vendorName: "Super Admin",
    customerName: lead.customerName,
    customerPhone: lead.customerPhone,
    customerEmail: lead.customerEmail,
    venueName: venue.name,
    eventDate: lead.eventDate,
    guestCount: lead.guestCount,
    slotPreference: lead.slotPreference,
    budgetRange: lead.budgetRange,
    message: `[Vendor: ${vendor.full_name}] ${lead.message || ""}`,
  });

  // 3. Save to enquiry inbox
  await serviceClient.from("enquiry_inbox").insert({
    lead_id: leadId || null,
    venue_id: venueId,
    vendor_id: venue.vendor_id,
    customer_name: lead.customerName,
    customer_phone: lead.customerPhone,
    customer_email: lead.customerEmail || null,
    event_date: lead.eventDate || null,
    guest_count: lead.guestCount || null,
    slot_preference: lead.slotPreference || null,
    budget_range: lead.budgetRange || null,
    message: lead.message || null,
    source: "website",
  });

  // 4. WhatsApp notification links (auto-compose messages)
  // These are logged; in production, integrate with WhatsApp Business API
  const whatsappMsg = encodeURIComponent(
    `🎊 New Enquiry for ${venue.name}!\n\nCustomer: ${lead.customerName}\nPhone: ${lead.customerPhone}\n${lead.eventDate ? `Date: ${lead.eventDate}\n` : ""}${lead.guestCount ? `Guests: ${lead.guestCount}\n` : ""}${lead.message ? `Message: ${lead.message}` : ""}`
  );

  // Log WhatsApp links (vendor phone & super admin)
  if (vendor.phone) {
    console.log(`WhatsApp Vendor: https://wa.me/${vendor.phone.replace(/\D/g, "")}?text=${whatsappMsg}`);
  }
  console.log(`WhatsApp Admin: https://wa.me/${SUPER_ADMIN_WHATSAPP}?text=${whatsappMsg}`);
}

// ============================================================
// OTP ACTIONS
// ============================================================

export async function sendRegistrationOtp(email: string, name: string, phone: string, role: string = "vendor") {
  if (!email || !name) return { success: false, error: "Email and name are required" };

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  otpStore.set(email.toLowerCase(), { otp, expiresAt, name, phone, role });

  const result = await sendOtpEmail({ email, otp, name });

  if (!result.success && result.emailNotDelivered) {
    // Resend free tier can't deliver to unverified addresses — return OTP directly
    return { success: true, fallbackOtp: otp };
  }

  if (!result.success) {
    return { success: false, error: result.error || "Failed to send OTP" };
  }

  return { success: true };
}

export async function verifyRegistrationOtp(email: string, otp: string, password: string) {
  const key = email.toLowerCase();
  const stored = otpStore.get(key);

  if (!stored) return { success: false, error: "No OTP found. Please request a new one." };
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(key);
    return { success: false, error: "OTP expired. Please request a new one." };
  }
  if (stored.otp !== otp) return { success: false, error: "Invalid OTP. Please try again." };

  otpStore.delete(key);

  const result = await signUpUser({
    email,
    password,
    full_name: stored.name,
    phone: stored.phone,
    role: stored.role,
  });

  if (result.error) return { success: false, error: result.error };
  return { success: true, needsConfirmation: result.needsConfirmation };
}

// ============================================================
// AUTH ACTIONS
// ============================================================

export async function serverSignOut() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return { success: true };
  } catch {
    return { success: false };
  }
}

/**
 * Guarantee a profile row exists for the given auth user.
 * Progressively strips columns until the insert succeeds,
 * so it works regardless of which columns or constraints the table has.
 */
async function ensureProfileExists(user: { id: string; email?: string; user_metadata?: Record<string, unknown> }): Promise<boolean> {
  try {
    const svc = await createServiceClient();

    const { data: existing } = await svc
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .single();
    if (existing) return true;

    const fullName =
      (user.user_metadata?.full_name as string) ||
      (user.user_metadata?.name as string) ||
      user.email?.split("@")[0] ||
      "User";

    // Try progressively simpler inserts. Handles missing columns (PGRST204)
    // AND check constraint violations (23514) by dropping the problematic field.
    const attempts: Record<string, unknown>[] = [
      { id: user.id, full_name: fullName, email: user.email ?? "", phone: (user.user_metadata?.phone as string) || null, role: (user.user_metadata?.role as string) || "vendor" },
      { id: user.id, full_name: fullName, email: user.email ?? "", role: (user.user_metadata?.role as string) || "vendor" },
      { id: user.id, full_name: fullName, email: user.email ?? "" },
      { id: user.id, full_name: fullName },
      { id: user.id },
    ];

    for (const row of attempts) {
      const { error } = await svc.from("profiles").insert(row);
      if (!error) return true;

      // PGRST204 = column missing, 23514 = check constraint violation — try fewer columns
      if (error.code === "PGRST204" || error.code === "23514") continue;

      console.error("ensureProfileExists failed:", error);
      return false;
    }

    console.error("ensureProfileExists: could not insert even with just {id}");
    return false;
  } catch (err) {
    console.error("ensureProfileExists error:", err);
    return false;
  }
}

export async function signUpUser(formData: {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role?: string;
}): Promise<{ error: string | null; needsConfirmation: boolean }> {
  try {
    // Step 1: Create auth user (anon client so cookies/session are set correctly)
    const supabase = await createClient();
    const { data, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
          role: formData.role || "customer",
        },
      },
    });

    // "Database error saving new user" = trigger crashed but auth still created the user in some cases
    // We check if it's a trigger-related error and try to recover via service role
    if (authError) {
      if (authError.message.toLowerCase().includes("database error")) {
        // Supabase trigger may have failed but the user could still exist
        // Try a lookup via service role to recover
        try {
          const serviceClient = await createServiceClient();
          const { data: existing } = await serviceClient.auth.admin.listUsers();
          const existingUser = existing?.users?.find(u => u.email === formData.email);
          if (existingUser) {
            // User was created despite trigger error — upsert profile and continue
            await serviceClient.from("profiles").upsert(
              {
                id: existingUser.id,
                full_name: formData.full_name || formData.email,
                email: formData.email,
                phone: formData.phone || null,
                role: (formData.role as "customer" | "vendor" | "admin" | "rm") || "customer",
              },
              { onConflict: "id" }
            );
            return { error: null, needsConfirmation: true };
          }
        } catch {
          // Recovery failed — fall through to original error
        }
      }
      return { error: authError.message, needsConfirmation: false };
    }

    const user = data?.user;
    if (!user) return { error: "Signup failed. Please try again.", needsConfirmation: false };

    // Step 2: Manually upsert profile using service role — works even if trigger is broken/missing
    const serviceClient = await createServiceClient();
    await serviceClient.from("profiles").upsert(
      {
        id: user.id,
        full_name: formData.full_name || formData.email,
        email: formData.email,
        phone: formData.phone || null,
        role: (formData.role as "customer" | "vendor" | "admin" | "rm") || "customer",
      },
      { onConflict: "id" }
    );
    // We intentionally ignore upsert errors here — the trigger may have already created it

    // If no session, email confirmation is required
    const needsConfirmation = !data.session;
    return { error: null, needsConfirmation };
  } catch (err: unknown) {
    return {
      error: err instanceof Error ? err.message : "An unexpected error occurred",
      needsConfirmation: false,
    };
  }
}

/** Upgrade a logged-in customer account to vendor role */
export async function upgradeToVendor(): Promise<{ error: string | null }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not logged in" };

    // Use service client to bypass RLS on profiles table
    const serviceClient = await createServiceClient();
    const { error: profileError } = await serviceClient
      .from("profiles")
      .update({ role: "vendor" })
      .eq("id", user.id);
    if (profileError) return { error: profileError.message };

    // Update auth user_metadata so JWT reflects new role immediately
    await supabase.auth.updateUser({ data: { role: "vendor" } });

    revalidatePath("/");
    return { error: null };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unexpected error" };
  }
}


export async function getVenues(params: VenueSearchParams = {}) {
  const supabase = await createClient();

  let query = supabase
    .from("venues")
    .select("*")
    .eq("is_active", true)
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (params.city) query = query.eq("city", params.city);
  if (params.venue_type) query = query.eq("venue_type", params.venue_type);
  if (params.capacity) query = query.gte("capacity_max", params.capacity);
  if (params.budget_min) query = query.gte("price_per_slot", params.budget_min);
  if (params.budget_max) query = query.lte("price_per_slot", params.budget_max);
  if (params.q) query = query.or(`name.ilike.%${params.q}%,city.ilike.%${params.q}%,description.ilike.%${params.q}%`);

  const limit = params.limit || 12;
  const page = params.page || 1;
  const from = (page - 1) * limit;

  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching venues:", error);
    return { venues: [], total: 0 };
  }

  return { venues: (data as Venue[]) || [], total: count || 0 };
}

export async function getVenueBySlug(slug: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data as Venue;
}

/** Get vendor contact info (phone + name) for a given venue */
export async function getVendorContact(venueId: string): Promise<{ full_name: string; phone: string | null; email: string | null } | null> {
  const supabase = await createServiceClient();
  // First get vendor_id from venue
  const { data: venue } = await supabase.from("venues").select("vendor_id").eq("id", venueId).single();
  if (!venue?.vendor_id) return null;
  const { data: profile } = await supabase.from("profiles").select("full_name, phone, email").eq("id", venue.vendor_id).single();
  return profile ?? null;
}

export async function getFeaturedVenues() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("venues")
    .select("*")
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("rating", { ascending: false })
    .limit(6);

  return (data as Venue[]) || [];
}

// ============================================================
// AVAILABILITY ACTIONS
// ============================================================

export async function getVenueSlots(venueId: string, month?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("venue_slots")
    .select("*")
    .eq("venue_id", venueId)
    .order("slot_date", { ascending: true });

  if (month) {
    const start = `${month}-01`;
    const end = `${month}-31`;
    query = query.gte("slot_date", start).lte("slot_date", end);
  }

  const { data } = await query;
  return (data as VenueSlot[]) || [];
}

export async function checkAvailability(
  venueId: string,
  date: string,
  slotType: string
) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("venue_slots")
    .select("*")
    .eq("venue_id", venueId)
    .eq("slot_date", date)
    .eq("slot_type", slotType)
    .single();

  if (!data) return { available: true, slot: null };
  return { available: data.is_available, slot: data as VenueSlot };
}

// ============================================================
// LEAD ACTIONS
// ============================================================

export async function createLead(formData: FormData) {
  const supabase = await createClient();

  const rawVenueId = formData.get("venue_id") as string | null;
  const isValidUUID = rawVenueId &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawVenueId);

  // Build lead data — try both column naming conventions (code vs migration schema)
  const leadData: Record<string, unknown> = {
    venue_id: isValidUUID ? rawVenueId : null,
    customer_name: formData.get("customer_name") as string,
    customer_email: formData.get("customer_email") as string,
    customer_phone: formData.get("customer_phone") as string,
    event_date: formData.get("event_date") as string || null,
    slot_preference: formData.get("slot_preference") as string || null,
    guest_count: formData.get("guest_count") ? parseInt(formData.get("guest_count") as string) : null,
    budget_range: formData.get("budget_range") as string || null,
    message: formData.get("message") as string || null,
    source: (formData.get("source") as string) || "website",
    status: "new",
  };

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    leadData.customer_id = user.id;
    leadData.user_id = user.id;
  }

  // Use service client to bypass RLS (leads can come from anyone)
  const serviceClient = await createServiceClient();

  // Try with the code's column names first
  let { data, error } = await serviceClient
    .from("leads")
    .insert(leadData)
    .select()
    .single();

  // If columns don't match, try with migration schema column names
  if (error?.code === "PGRST204") {
    const altData: Record<string, unknown> = {
      venue_id: isValidUUID ? rawVenueId : null,
      name: formData.get("customer_name") as string,
      email: formData.get("customer_email") as string,
      phone: formData.get("customer_phone") as string,
      event_date: formData.get("event_date") as string || null,
      guest_count: formData.get("guest_count") ? parseInt(formData.get("guest_count") as string) : null,
      message: formData.get("message") as string || null,
      status: "new",
    };
    if (user) altData.user_id = user.id;

    ({ data, error } = await serviceClient
      .from("leads")
      .insert(altData)
      .select()
      .single());
  }

  if (error) {
    console.error("Lead creation error:", error);
    return { success: false, error: error.message };
  }

  // Send email notification to vendor + super admin (fire-and-forget, don't block the response)
  if (isValidUUID && rawVenueId) {
    notifyVendorByEmail(serviceClient, rawVenueId, {
      customerName: formData.get("customer_name") as string,
      customerPhone: formData.get("customer_phone") as string,
      customerEmail: (formData.get("customer_email") as string) || undefined,
      eventDate: (formData.get("event_date") as string) || undefined,
      guestCount: formData.get("guest_count") ? parseInt(formData.get("guest_count") as string) : undefined,
      slotPreference: (formData.get("slot_preference") as string) || undefined,
      budgetRange: (formData.get("budget_range") as string) || undefined,
      message: (formData.get("message") as string) || undefined,
    }, data?.id).catch((err) => console.error("Vendor email notification failed:", err));
  }

  revalidatePath("/admin/leads");
  return { success: true, lead: data };
}

export async function createLeadFromAI(leadInfo: {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  venue_id?: string;
  event_date?: string;
  guest_count?: number;
  message?: string;
}) {
  const serviceClient = await createServiceClient();

  const { data, error } = await serviceClient
    .from("leads")
    .insert({
      ...leadInfo,
      source: "ai_chatbot",
      status: "new",
    })
    .select()
    .single();

  if (error) {
    console.error("AI lead creation error:", error);
    return { success: false, error: error.message };
  }

  return { success: true, lead: data };
}

// ============================================================
// VENDOR ACTIONS
// ============================================================

/** Fetch all venues owned by the currently logged-in vendor */
export async function getMyVenues() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { venues: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .eq("vendor_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { venues: [], error: error.message };
  return { venues: data ?? [], error: null };
}

/** Update a venue's data (only the owning vendor or admin may do this) */
export async function updateVenue(venueId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Verify ownership
  const { data: existing } = await supabase
    .from("venues")
    .select("vendor_id")
    .eq("id", venueId)
    .single();

  if (!existing) return { success: false, error: "Venue not found" };

  // Check profile for admin bypass
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (existing.vendor_id !== user.id && profile?.role !== "admin") {
    return { success: false, error: "You do not have permission to edit this venue" };
  }

  const imagesRaw = formData.get("images") as string | null;
  const images: string[] = imagesRaw ? JSON.parse(imagesRaw) : [];
  const coverImage = (formData.get("cover_image") as string | null) || images[0] || null;

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  const fields = [
    "name", "description", "venue_type", "city", "state",
    "address", "pincode",
  ];
  for (const f of fields) {
    const v = formData.get(f);
    if (v !== null && v !== "") updates[f] = v as string;
  }
  const cap_min = formData.get("capacity_min");
  const cap_max = formData.get("capacity_max");
  const price_slot = formData.get("price_per_slot");
  const price_plate = formData.get("price_per_plate");
  if (cap_min) updates.capacity_min = parseInt(cap_min as string);
  if (cap_max) updates.capacity_max = parseInt(cap_max as string);
  if (price_slot) updates.price_per_slot = parseFloat(price_slot as string);
  if (price_plate) updates.price_per_plate = parseFloat(price_plate as string);

  const latRaw = formData.get("latitude") as string | null;
  const lngRaw = formData.get("longitude") as string | null;
  if (latRaw) updates.latitude = parseFloat(latRaw);
  if (lngRaw) updates.longitude = parseFloat(lngRaw);

  const amenitiesRaw = formData.get("amenities") as string | null;
  if (amenitiesRaw) updates.amenities = JSON.parse(amenitiesRaw);

  const ytRaw = formData.get("youtube_videos") as string | null;
  if (ytRaw) updates.youtube_videos = JSON.parse(ytRaw);

  const socialRaw = formData.get("social_links") as string | null;
  if (socialRaw) updates.social_links = JSON.parse(socialRaw);

  if (images.length > 0) {
    updates.images = images;
    updates.cover_image = coverImage;
  }

  const { data, error } = await supabase
    .from("venues")
    .update(updates)
    .eq("id", venueId)
    .select()
    .single();

  if (error) {
    console.error("Venue update error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/partner/venues");
  revalidatePath(`/venues/${data.slug}`);
  return { success: true, venue: data };
}

export async function createVenue(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  // Ensure the profile row exists before inserting a venue (FK constraint).
  const profileOk = await ensureProfileExists(user);
  if (!profileOk) {
    return { success: false, error: "Could not verify your profile. Please try again or contact support." };
  }

  const imagesRaw = formData.get("images") as string | null;
  const images: string[] = imagesRaw ? JSON.parse(imagesRaw) : [];
  const coverImage = (formData.get("cover_image") as string | null) || images[0] || null;

  const latRaw = formData.get("latitude") as string | null;
  const lngRaw = formData.get("longitude") as string | null;

  const venueData = {
    vendor_id: user.id,
    name: formData.get("name") as string,
    slug: (formData.get("name") as string)
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-"),
    description: formData.get("description") as string,
    venue_type: formData.get("venue_type") as string,
    city: formData.get("city") as string,
    state: formData.get("state") as string || "Bihar",
    address: formData.get("address") as string,
    pincode: formData.get("pincode") as string,
    latitude: latRaw ? parseFloat(latRaw) : null,
    longitude: lngRaw ? parseFloat(lngRaw) : null,
    capacity_min: parseInt(formData.get("capacity_min") as string) || 50,
    capacity_max: parseInt(formData.get("capacity_max") as string) || 500,
    price_per_slot: parseFloat(formData.get("price_per_slot") as string) || 0,
    price_per_plate: formData.get("price_per_plate")
      ? parseFloat(formData.get("price_per_plate") as string)
      : null,
    amenities: JSON.parse(formData.get("amenities") as string || "[]"),
    youtube_videos: JSON.parse(formData.get("youtube_videos") as string || "[]"),
    social_links: JSON.parse(formData.get("social_links") as string || "{}"),
    images,
    cover_image: coverImage,
  };

  const { data, error } = await supabase
    .from("venues")
    .insert(venueData)
    .select()
    .single();

  if (error) {
    console.error("Venue creation error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/partner/dashboard");
  return { success: true, venue: data };
}

export async function updateVenueSlot(
  venueId: string,
  date: string,
  slotType: string,
  isAvailable: boolean,
  isAuspicious: boolean = false,
  priceOverride?: number
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("venue_slots")
    .upsert(
      {
        venue_id: venueId,
        slot_date: date,
        slot_type: slotType,
        is_available: isAvailable,
        is_auspicious: isAuspicious,
        price_override: priceOverride || null,
      },
      { onConflict: "venue_id,slot_date,slot_type" }
    )
    .select()
    .single();

  if (error) {
    console.error("Slot update error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath(`/venues/${venueId}`);
  return { success: true, slot: data };
}

// ============================================================
// ADMIN ACTIONS
// ============================================================

export async function getLeads(status?: string) {
  const supabase = await createClient();

  let query = supabase
    .from("leads")
    .select("*, venue:venues(name, city), customer:profiles!leads_customer_id_fkey(full_name, phone)")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching leads:", error);
    return [];
  }

  return data as Lead[];
}

export async function updateLeadStatus(leadId: string, status: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("leads")
    .update({ status })
    .eq("id", leadId);

  if (error) {
    console.error("Lead status update error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/leads");
  return { success: true };
}

// ============================================================
// AUSPICIOUS DATES
// ============================================================

export async function getAuspiciousDates(year?: number) {
  const supabase = await createClient();

  const currentYear = year || new Date().getFullYear();

  const { data } = await supabase
    .from("auspicious_dates")
    .select("*")
    .eq("year", currentYear)
    .order("date", { ascending: true });

  return data || [];
}

// ============================================================
// ADMIN: VENUE MANAGEMENT
// ============================================================

export async function getAllVenues(params: { status?: string; q?: string } = {}) {
  const serviceClient = await createServiceClient();

  let query = serviceClient
    .from("venues")
    .select("*, vendor:profiles!venues_vendor_id_fkey(full_name, email, phone)")
    .order("created_at", { ascending: false });

  if (params.status === "active") query = query.eq("is_active", true);
  else if (params.status === "inactive") query = query.eq("is_active", false);

  if (params.q) {
    query = query.or(`name.ilike.%${params.q}%,city.ilike.%${params.q}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching all venues:", error);
    return [];
  }
  return data || [];
}

export async function toggleVenueStatus(venueId: string, isActive: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const serviceClient = await createServiceClient();
  const { data: profile } = await serviceClient.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { success: false, error: "Admin access required" };

  const { error } = await serviceClient
    .from("venues")
    .update({ is_active: isActive })
    .eq("id", venueId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/venues");
  return { success: true };
}

export async function toggleVenueFeatured(venueId: string, isFeatured: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const serviceClient = await createServiceClient();
  const { data: profile } = await serviceClient.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { success: false, error: "Admin access required" };

  const { error } = await serviceClient
    .from("venues")
    .update({ is_featured: isFeatured })
    .eq("id", venueId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/venues");
  return { success: true };
}

export async function deleteVenue(venueId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const serviceClient = await createServiceClient();
  const { data: profile } = await serviceClient.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { success: false, error: "Admin access required" };

  const { error } = await serviceClient
    .from("venues")
    .delete()
    .eq("id", venueId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/venues");
  return { success: true };
}

// ============================================================
// ADMIN: USER MANAGEMENT
// ============================================================

export async function getAllUsers(params: { role?: string; q?: string } = {}) {
  const serviceClient = await createServiceClient();

  let query = serviceClient
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (params.role && params.role !== "all") {
    query = query.eq("role", params.role);
  }

  if (params.q) {
    query = query.or(`full_name.ilike.%${params.q}%,email.ilike.%${params.q}%,phone.ilike.%${params.q}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching users:", error);
    return [];
  }
  return data || [];
}

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const serviceClient = await createServiceClient();
  const { data: profile } = await serviceClient.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return { success: false, error: "Admin access required" };

  if (userId === user.id) return { success: false, error: "Cannot change your own role" };

  const { error } = await serviceClient
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/users");
  return { success: true };
}

// ============================================================
// PARTNER: PROFILE MANAGEMENT
// ============================================================

export async function getMyProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Auto-create the profile if it doesn't exist
  await ensureProfileExists(user);

  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}

export async function updateMyProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const updates: Record<string, unknown> = {};
  const fullName = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const city = formData.get("city") as string;

  if (fullName) updates.full_name = fullName;
  if (phone) updates.phone = phone;
  if (city) updates.city = city;

  const serviceClient = await createServiceClient();
  const { error } = await serviceClient
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/partner/settings");
  return { success: true };
}

// ============================================================
// ADMIN: DASHBOARD STATS
// ============================================================

export async function getAdminStats() {
  const serviceClient = await createServiceClient();

  const [venuesRes, usersRes, leadsRes] = await Promise.all([
    serviceClient.from("venues").select("id, is_active, is_featured", { count: "exact" }),
    serviceClient.from("profiles").select("id, role", { count: "exact" }),
    serviceClient.from("leads").select("id, status", { count: "exact" }),
  ]);

  const venues = venuesRes.data || [];
  const users = usersRes.data || [];
  const leads = leadsRes.data || [];

  return {
    totalVenues: venues.length,
    activeVenues: venues.filter(v => v.is_active).length,
    featuredVenues: venues.filter(v => v.is_featured).length,
    totalUsers: users.length,
    vendors: users.filter(u => u.role === "vendor").length,
    customers: users.filter(u => u.role === "customer").length,
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === "new").length,
    convertedLeads: leads.filter(l => l.status === "converted").length,
  };
}

// ============================================================
// BLOG ACTIONS
// ============================================================

export async function getBlogPosts(publishedOnly = true): Promise<BlogPost[]> {
  const supabase = await createServiceClient();
  let query = supabase
    .from("blog_posts")
    .select("*, author:author_id(id, full_name, avatar_url)")
    .order("published_at", { ascending: false });

  if (publishedOnly) query = query.eq("is_published", true);

  const { data, error } = await query;
  if (error) { console.error("getBlogPosts error:", error); return []; }
  return (data ?? []) as BlogPost[];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createServiceClient();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*, author:author_id(id, full_name, avatar_url)")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data as BlogPost;
}

export async function createBlogPost(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const profile = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile.data?.role !== "admin") return { success: false, error: "Admin only" };

  const title = formData.get("title") as string;
  const slug = title.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-") + "-" + Date.now();
  const isPublished = formData.get("is_published") === "true";

  const post = {
    author_id: user.id,
    title,
    slug,
    excerpt: formData.get("excerpt") as string || null,
    content: formData.get("content") as string || null,
    cover_image: formData.get("cover_image") as string || null,
    youtube_url: formData.get("youtube_url") as string || null,
    tags: JSON.parse(formData.get("tags") as string || "[]"),
    is_published: isPublished,
    published_at: isPublished ? new Date().toISOString() : null,
  };

  const svc = await createServiceClient();
  const { data, error } = await svc.from("blog_posts").insert(post).select().single();
  if (error) return { success: false, error: error.message };

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return { success: true, post: data };
}

export async function updateBlogPost(postId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const profile = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile.data?.role !== "admin") return { success: false, error: "Admin only" };

  const isPublished = formData.get("is_published") === "true";

  const updates: Record<string, unknown> = {
    title: formData.get("title"),
    excerpt: formData.get("excerpt") || null,
    content: formData.get("content") || null,
    cover_image: formData.get("cover_image") || null,
    youtube_url: formData.get("youtube_url") || null,
    tags: JSON.parse(formData.get("tags") as string || "[]"),
    is_published: isPublished,
    updated_at: new Date().toISOString(),
  };
  if (isPublished) updates.published_at = new Date().toISOString();

  const svc = await createServiceClient();
  const { data, error } = await svc.from("blog_posts").update(updates).eq("id", postId).select().single();
  if (error) return { success: false, error: error.message };

  revalidatePath("/blog");
  revalidatePath(`/blog/${data.slug}`);
  revalidatePath("/admin/blog");
  return { success: true, post: data };
}

export async function deleteBlogPost(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const profile = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile.data?.role !== "admin") return { success: false, error: "Admin only" };

  const svc = await createServiceClient();
  const { error } = await svc.from("blog_posts").delete().eq("id", postId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  return { success: true };
}

// ============================================================
// ENQUIRY INBOX
// ============================================================

export async function getInboxMessages(vendorId?: string): Promise<EnquiryInbox[]> {
  const svc = await createServiceClient();
  let query = svc
    .from("enquiry_inbox")
    .select("*, venue:venues(name, city, cover_image)")
    .order("created_at", { ascending: false });

  if (vendorId) query = query.eq("vendor_id", vendorId);

  const { data, error } = await query;
  if (error) { console.error("getInboxMessages error:", error); return []; }
  return (data ?? []) as EnquiryInbox[];
}

export async function markInboxRead(messageId: string) {
  const svc = await createServiceClient();
  const { error } = await svc.from("enquiry_inbox").update({ is_read: true }).eq("id", messageId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/inbox");
  revalidatePath("/partner/inbox");
  return { success: true };
}

export async function addInboxNote(messageId: string, note: string) {
  const svc = await createServiceClient();
  const { error } = await svc.from("enquiry_inbox").update({ admin_notes: note }).eq("id", messageId);
  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/inbox");
  return { success: true };
}

// ============================================================
// MARRIAGE PACKAGES
// ============================================================

export async function getMarriagePackages(activeOnly = true): Promise<MarriagePackage[]> {
  const svc = await createServiceClient();
  let query = svc
    .from("marriage_packages")
    .select("*")
    .order("display_order", { ascending: true });

  if (activeOnly) query = query.eq("is_active", true);

  const { data, error } = await query;
  if (error) { console.error("getMarriagePackages error:", error); return []; }
  return (data ?? []) as MarriagePackage[];
}

export async function createMarriagePackage(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const svc = await createServiceClient();
  const profile = await svc.from("profiles").select("role").eq("id", user.id).single();
  if (profile.data?.role !== "admin") return { success: false, error: "Admin only" };

  const name = formData.get("name") as string;
  const slug = name.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-") + "-" + Date.now();

  const pkg = {
    name,
    slug,
    tier: formData.get("tier") as string,
    tagline: formData.get("tagline") as string || null,
    description: formData.get("description") as string || null,
    price: parseFloat(formData.get("price") as string) || 0,
    original_price: formData.get("original_price") ? parseFloat(formData.get("original_price") as string) : null,
    features: JSON.parse(formData.get("features") as string || "[]"),
    inclusions: JSON.parse(formData.get("inclusions") as string || "[]"),
    cover_image: formData.get("cover_image") as string || null,
    is_popular: formData.get("is_popular") === "true",
    display_order: parseInt(formData.get("display_order") as string) || 0,
  };

  const { data, error } = await svc.from("marriage_packages").insert(pkg).select().single();
  if (error) return { success: false, error: error.message };

  revalidatePath("/packages");
  revalidatePath("/admin/packages");
  return { success: true, package: data };
}

export async function updateMarriagePackage(packageId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const svc = await createServiceClient();
  const profile = await svc.from("profiles").select("role").eq("id", user.id).single();
  if (profile.data?.role !== "admin") return { success: false, error: "Admin only" };

  const updates: Record<string, unknown> = {
    name: formData.get("name"),
    tier: formData.get("tier"),
    tagline: formData.get("tagline") || null,
    description: formData.get("description") || null,
    price: parseFloat(formData.get("price") as string) || 0,
    original_price: formData.get("original_price") ? parseFloat(formData.get("original_price") as string) : null,
    features: JSON.parse(formData.get("features") as string || "[]"),
    inclusions: JSON.parse(formData.get("inclusions") as string || "[]"),
    cover_image: formData.get("cover_image") || null,
    is_popular: formData.get("is_popular") === "true",
    display_order: parseInt(formData.get("display_order") as string) || 0,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await svc.from("marriage_packages").update(updates).eq("id", packageId).select().single();
  if (error) return { success: false, error: error.message };

  revalidatePath("/packages");
  revalidatePath("/admin/packages");
  return { success: true, package: data };
}

export async function deleteMarriagePackage(packageId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const svc = await createServiceClient();
  const profile = await svc.from("profiles").select("role").eq("id", user.id).single();
  if (profile.data?.role !== "admin") return { success: false, error: "Admin only" };

  const { error } = await svc.from("marriage_packages").delete().eq("id", packageId);
  if (error) return { success: false, error: error.message };

  revalidatePath("/packages");
  revalidatePath("/admin/packages");
  return { success: true };
}

// ============================================================
// TESTIMONIALS
// ============================================================

export async function getTestimonials(featuredOnly = false): Promise<Testimonial[]> {
  const svc = await createServiceClient();
  let query = svc
    .from("testimonials")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });

  if (featuredOnly) query = query.eq("is_featured", true);

  const { data, error } = await query;
  if (error) { console.error("getTestimonials error:", error); return []; }
  return (data ?? []) as Testimonial[];
}

// ============================================================
// SUCCESS STORIES
// ============================================================

export async function getSuccessStories(publishedOnly = true): Promise<SuccessStory[]> {
  const svc = await createServiceClient();
  let query = svc
    .from("success_stories")
    .select("*")
    .order("published_at", { ascending: false });

  if (publishedOnly) query = query.eq("is_published", true);

  const { data, error } = await query;
  if (error) { console.error("getSuccessStories error:", error); return []; }
  return (data ?? []) as SuccessStory[];
}

export async function getSuccessStoryBySlug(slug: string): Promise<SuccessStory | null> {
  const svc = await createServiceClient();
  const { data, error } = await svc
    .from("success_stories")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data as SuccessStory;
}

// ============================================================
// SUBMIT TESTIMONIAL (Public — auto-publishes)
// ============================================================

export async function submitTestimonial(formData: FormData) {
  "use server";
  const svc = await createServiceClient();

  const coupleName = (formData.get("couple_name") as string)?.trim();
  const location   = (formData.get("location") as string)?.trim();
  const venueName  = (formData.get("venue_name") as string)?.trim() || null;
  const ratingStr  = formData.get("rating") as string;
  const text       = (formData.get("text") as string)?.trim();

  if (!coupleName || !location || !text || !ratingStr) {
    return { success: false, message: "Please fill in all required fields." };
  }

  const rating = parseInt(ratingStr, 10);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return { success: false, message: "Rating must be between 1 and 5." };
  }

  // Get max display_order
  const { data: maxRow } = await svc
    .from("testimonials")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (maxRow?.display_order ?? 0) + 1;

  const { error } = await svc.from("testimonials").insert({
    couple_name: coupleName,
    location,
    venue_name: venueName,
    rating,
    text,
    is_featured: false,
    is_active: true,          // auto-publish
    display_order: nextOrder,
  });

  if (error) {
    console.error("submitTestimonial error:", error);
    return { success: false, message: "Something went wrong. Please try again." };
  }

  return { success: true, message: "Thank you! Your feedback has been published." };
}
