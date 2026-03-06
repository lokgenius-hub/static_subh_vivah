/**
 * VivahSthal — Client-Side Actions
 *
 * Replaces the old server actions (actions.ts). ALL Supabase calls now use
 * the browser client (anon key + user JWT). Security is enforced by RLS
 * policies in Supabase — no service role key is ever sent to the browser.
 *
 * Functions that used to require the service role (admin ops, profile upserts)
 * now rely on RLS policies that grant elevated access to admin-role users.
 */

import { createClient } from "@/lib/supabase/client";
import type {
  Lead, Venue, VenueSlot, VenueSearchParams,
  BlogPost, EnquiryInbox, MarriagePackage, Testimonial,
  SuccessStory,
} from "@/lib/types";

// ============================================================
// AUTH
// ============================================================

export async function signUpUser(formData: {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role?: string;
}): Promise<{ error: string | null; needsConfirmation: boolean }> {
  try {
    const supabase = createClient();
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

    if (authError) {
      if (authError.message.toLowerCase().includes("rate limit") || authError.message.toLowerCase().includes("over_email")) {
        return { error: 'Email rate limit reached. Please use "Continue with Google" instead.', needsConfirmation: false };
      }
      return { error: authError.message, needsConfirmation: false };
    }

    const user = data?.user;
    if (!user) return { error: "Signup failed. Please try again.", needsConfirmation: false };

    // Profile is created automatically by the DB trigger (handle_new_user)
    // If it didn't fire, upsert here as fallback
    await supabase.from("profiles").upsert(
      {
        id: user.id,
        full_name: formData.full_name || formData.email,
        email: formData.email,
        phone: formData.phone || null,
        role: formData.role || "customer",
        approved_status: "pending",
      },
      { onConflict: "id", ignoreDuplicates: true }
    );

    const needsConfirmation = !data.session;
    return { error: null, needsConfirmation };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "An unexpected error occurred", needsConfirmation: false };
  }
}

export async function upgradeToVendor(): Promise<{ error: string | null }> {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not logged in" };

    const { error } = await supabase
      .from("profiles")
      .update({ role: "vendor" })
      .eq("id", user.id);
    if (error) return { error: error.message };

    await supabase.auth.updateUser({ data: { role: "vendor" } });
    return { error: null };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Unexpected error" };
  }
}

export async function serverSignOut() {
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
    return { success: true };
  } catch {
    return { success: false };
  }
}

// ============================================================
// OTP (simplified — OTP is generated/verified in Supabase Edge Function)
// For now, partner registration works without OTP on static site.
// ============================================================

export async function sendRegistrationOtp(
  _email: string, _name: string, _phone: string, _role: string = "vendor"
): Promise<{ success: boolean; error?: string; fallbackOtp?: string }> {
  // OTP requires a server (in-memory store). On static site, we skip OTP
  // and do direct signup. Partner-register page should handle this gracefully.
  return { success: true, fallbackOtp: "000000" };
}

export async function verifyRegistrationOtp(
  email: string, _otp: string, password: string
): Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }> {
  // Direct signup (OTP bypassed on static site)
  const result = await signUpUser({ email, password, full_name: "", phone: "", role: "vendor" });
  if (result.error) return { success: false, error: result.error };
  return { success: true, needsConfirmation: result.needsConfirmation };
}

// ============================================================
// VENUE READS (public)
// ============================================================

export async function getVenues(params: VenueSearchParams = {}) {
  const supabase = createClient();

  let query = supabase
    .from("venues")
    .select("*", { count: "exact" })
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
  if (error) return { venues: [], total: 0 };
  return { venues: (data as Venue[]) || [], total: count || 0 };
}

export async function getVenueBySlug(slug: string) {
  const supabase = createClient();
  const { data } = await supabase
    .from("venues")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();
  return (data as Venue) ?? null;
}

export async function getVendorContact(venueId: string) {
  const supabase = createClient();
  const { data: venue } = await supabase.from("venues").select("vendor_id").eq("id", venueId).single();
  if (!venue?.vendor_id) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, email")
    .eq("id", venue.vendor_id)
    .single();
  return profile ?? null;
}

export async function getFeaturedVenues() {
  const supabase = createClient();
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
// AVAILABILITY
// ============================================================

export async function getVenueSlots(venueId: string, month?: string) {
  const supabase = createClient();
  let query = supabase
    .from("venue_slots")
    .select("*")
    .eq("venue_id", venueId)
    .order("slot_date", { ascending: true });

  if (month) {
    query = query.gte("slot_date", `${month}-01`).lte("slot_date", `${month}-31`);
  }
  const { data } = await query;
  return (data as VenueSlot[]) || [];
}

export async function checkAvailability(venueId: string, date: string, slotType: string) {
  const supabase = createClient();
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
// LEADS
// ============================================================

export async function createLead(formData: FormData) {
  const supabase = createClient();

  const rawVenueId = formData.get("venue_id") as string | null;
  const isValidUUID = rawVenueId &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawVenueId);

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

  const { data, error } = await supabase
    .from("leads")
    .insert(leadData)
    .select()
    .single();

  if (error) {
    // Retry without optional columns
    const altData: Record<string, unknown> = {
      venue_id: isValidUUID ? rawVenueId : null,
      customer_name: formData.get("customer_name") as string,
      customer_email: formData.get("customer_email") as string,
      customer_phone: formData.get("customer_phone") as string,
      event_date: formData.get("event_date") as string || null,
      guest_count: formData.get("guest_count") ? parseInt(formData.get("guest_count") as string) : null,
      message: formData.get("message") as string || null,
      status: "new",
    };
    if (user) altData.customer_id = user.id;

    const r2 = await supabase.from("leads").insert(altData).select().single();
    if (r2.error) return { success: false, error: r2.error.message };

    // Also save to enquiry_inbox
    await saveToInbox(supabase, formData, isValidUUID ? rawVenueId : null, r2.data?.id);
    return { success: true, lead: r2.data };
  }

  await saveToInbox(supabase, formData, isValidUUID ? rawVenueId : null, data?.id);
  return { success: true, lead: data };
}

/** Helper: save enquiry to inbox table */
async function saveToInbox(
  supabase: ReturnType<typeof createClient>,
  formData: FormData,
  venueId: string | null,
  leadId?: string
) {
  let vendorId: string | undefined;
  if (venueId) {
    const { data: v } = await supabase.from("venues").select("vendor_id").eq("id", venueId).single();
    vendorId = v?.vendor_id || undefined;
  }

  await supabase.from("enquiry_inbox").insert({
    lead_id: leadId || null,
    venue_id: venueId || null,
    vendor_id: vendorId || null,
    customer_name: formData.get("customer_name") as string,
    customer_phone: formData.get("customer_phone") as string,
    customer_email: (formData.get("customer_email") as string) || null,
    event_date: (formData.get("event_date") as string) || null,
    guest_count: formData.get("guest_count") ? parseInt(formData.get("guest_count") as string) : null,
    slot_preference: (formData.get("slot_preference") as string) || null,
    budget_range: (formData.get("budget_range") as string) || null,
    message: (formData.get("message") as string) || null,
    source: "website",
  }).then(() => {}).catch(() => {});
}

// ============================================================
// VENDOR: VENUE MANAGEMENT
// ============================================================

export async function getMyVenues() {
  const supabase = createClient();
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

export async function updateVenue(venueId: string, formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const imagesRaw = formData.get("images") as string | null;
  const images: string[] = imagesRaw ? JSON.parse(imagesRaw) : [];
  const coverImage = (formData.get("cover_image") as string | null) || images[0] || null;

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  for (const f of ["name", "description", "venue_type", "city", "state", "address", "pincode"]) {
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
  if (images.length > 0) { updates.images = images; updates.cover_image = coverImage; }

  const { data, error } = await supabase
    .from("venues")
    .update(updates)
    .eq("id", venueId)
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, venue: data };
}

export async function createVenue(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const imagesRaw = formData.get("images") as string | null;
  const images: string[] = imagesRaw ? JSON.parse(imagesRaw) : [];
  const coverImage = (formData.get("cover_image") as string | null) || images[0] || null;
  const latRaw = formData.get("latitude") as string | null;
  const lngRaw = formData.get("longitude") as string | null;

  const venueData = {
    vendor_id: user.id,
    name: formData.get("name") as string,
    slug: (formData.get("name") as string).toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-"),
    description: formData.get("description") as string,
    venue_type: formData.get("venue_type") as string,
    city: formData.get("city") as string,
    state: (formData.get("state") as string) || "Bihar",
    address: formData.get("address") as string,
    pincode: formData.get("pincode") as string,
    latitude: latRaw ? parseFloat(latRaw) : null,
    longitude: lngRaw ? parseFloat(lngRaw) : null,
    capacity_min: parseInt(formData.get("capacity_min") as string) || 50,
    capacity_max: parseInt(formData.get("capacity_max") as string) || 500,
    price_per_slot: parseFloat(formData.get("price_per_slot") as string) || 0,
    price_per_plate: formData.get("price_per_plate") ? parseFloat(formData.get("price_per_plate") as string) : null,
    amenities: JSON.parse(formData.get("amenities") as string || "[]"),
    youtube_videos: JSON.parse(formData.get("youtube_videos") as string || "[]"),
    social_links: JSON.parse(formData.get("social_links") as string || "{}"),
    images,
    cover_image: coverImage,
  };

  const { data, error } = await supabase.from("venues").insert(venueData).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, venue: data };
}

export async function updateVenueSlot(
  venueId: string, date: string, slotType: string,
  isAvailable: boolean, isAuspicious: boolean = false, priceOverride?: number
) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("venue_slots")
    .upsert(
      { venue_id: venueId, slot_date: date, slot_type: slotType, is_available: isAvailable, is_auspicious: isAuspicious, price_override: priceOverride || null },
      { onConflict: "venue_id,slot_date,slot_type" }
    )
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, slot: data };
}

// ============================================================
// ADMIN: LEADS
// ============================================================

export async function getLeads(status?: string) {
  const supabase = createClient();
  let query = supabase
    .from("leads")
    .select("*, venue:venues(name, city)")
    .order("created_at", { ascending: false });

  if (status && status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) {
    // Fallback: fetch leads without the join
    const fallback = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    return (fallback.data ?? []) as Lead[];
  }
  return (data ?? []) as Lead[];
}

export async function updateLeadStatus(leadId: string, status: string) {
  const supabase = createClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", leadId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ============================================================
// AUSPICIOUS DATES
// ============================================================

export async function getAuspiciousDates(year?: number) {
  const supabase = createClient();
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
  const supabase = createClient();
  let query = supabase
    .from("venues")
    .select("*, vendor:profiles!venues_vendor_id_fkey(full_name, email, phone)")
    .order("created_at", { ascending: false });

  if (params.status === "active") query = query.eq("is_active", true);
  else if (params.status === "inactive") query = query.eq("is_active", false);
  if (params.q) query = query.or(`name.ilike.%${params.q}%,city.ilike.%${params.q}%`);

  const { data, error } = await query;
  if (error) return [];
  return data || [];
}

export async function toggleVenueStatus(venueId: string, isActive: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from("venues").update({ is_active: isActive }).eq("id", venueId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function toggleVenueFeatured(venueId: string, isFeatured: boolean) {
  const supabase = createClient();
  const { error } = await supabase.from("venues").update({ is_featured: isFeatured }).eq("id", venueId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function deleteVenue(venueId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("venues").delete().eq("id", venueId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ============================================================
// ADMIN: USER MANAGEMENT
// ============================================================

export async function getAllUsers(params: { role?: string; q?: string } = {}) {
  const supabase = createClient();
  let query = supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (params.role && params.role !== "all") query = query.eq("role", params.role);
  if (params.q) query = query.or(`full_name.ilike.%${params.q}%,email.ilike.%${params.q}%,phone.ilike.%${params.q}%`);
  const { data, error } = await query;
  if (error) return [];
  return data || [];
}

export async function updateUserRole(userId: string, newRole: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };
  if (userId === user.id) return { success: false, error: "Cannot change your own role" };
  const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function adminSetUserPassword(_userId: string, _newPassword: string) {
  // auth.admin.updateUserById requires service role key — not available on client.
  // This needs a Supabase Edge Function. For now, return a clear message.
  return { success: false, error: "Password reset requires a Supabase Edge Function (not yet deployed). Ask the user to reset via email." };
}

export async function adminUpdateUserProfile(
  userId: string,
  data: { full_name?: string; phone?: string; city?: string; avatar_url?: string }
) {
  const supabase = createClient();
  const update: Record<string, unknown> = {};
  if (data.full_name !== undefined) update.full_name = data.full_name;
  if (data.phone !== undefined) update.phone = data.phone;
  if (data.city !== undefined) update.city = data.city;
  if (data.avatar_url !== undefined) update.avatar_url = data.avatar_url;
  const { error } = await supabase.from("profiles").update(update).eq("id", userId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ============================================================
// ADMIN: USER APPROVAL
// ============================================================

export async function getPendingUsers() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("approved_status", "pending")
    .order("created_at", { ascending: false });
  if (error) return [];
  return data || [];
}

export async function adminApproveUser(userId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("profiles").update({ approved_status: "approved" }).eq("id", userId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function adminRejectUser(userId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("profiles").update({ approved_status: "rejected" }).eq("id", userId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ============================================================
// PROFILE
// ============================================================

export async function getMyProfile() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data;
}

export async function updateMyProfile(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const updates: Record<string, unknown> = {};
  const fullName = formData.get("full_name") as string;
  const phone = formData.get("phone") as string;
  const city = formData.get("city") as string;
  if (fullName) updates.full_name = fullName;
  if (phone) updates.phone = phone;
  if (city) updates.city = city;

  const { error } = await supabase.from("profiles").update(updates).eq("id", user.id);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ============================================================
// ADMIN: DASHBOARD STATS
// ============================================================

export async function getAdminStats() {
  const supabase = createClient();
  const [venuesRes, usersRes, leadsRes] = await Promise.all([
    supabase.from("venues").select("id, is_active, is_featured"),
    supabase.from("profiles").select("id, role"),
    supabase.from("leads").select("id, status"),
  ]);
  const venues = venuesRes.data || [];
  const users = usersRes.data || [];
  const leads = leadsRes.data || [];
  return {
    totalVenues: venues.length,
    activeVenues: venues.filter((v: { is_active: boolean }) => v.is_active).length,
    featuredVenues: venues.filter((v: { is_featured: boolean }) => v.is_featured).length,
    totalUsers: users.length,
    vendors: users.filter((u: { role: string }) => u.role === "vendor").length,
    customers: users.filter((u: { role: string }) => u.role === "customer").length,
    totalLeads: leads.length,
    newLeads: leads.filter((l: { status: string }) => l.status === "new").length,
    convertedLeads: leads.filter((l: { status: string }) => l.status === "converted").length,
  };
}

// ============================================================
// BLOG
// ============================================================

export async function getBlogPosts(publishedOnly = true): Promise<BlogPost[]> {
  const supabase = createClient();
  let query = supabase
    .from("blog_posts")
    .select("*, author:author_id(id, full_name)")
    .order("published_at", { ascending: false });
  if (publishedOnly) query = query.eq("is_published", true);
  const { data } = await query;
  return (data ?? []) as BlogPost[];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("*, author:author_id(id, full_name)")
    .eq("slug", slug)
    .single();
  return (data as BlogPost) ?? null;
}

export async function createBlogPost(formData: FormData) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const title = formData.get("title") as string;
  const slug = title.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-") + "-" + Date.now();
  const isPublished = formData.get("is_published") === "true";

  const post = {
    author_id: user.id,
    title, slug,
    excerpt: formData.get("excerpt") as string || null,
    content: formData.get("content") as string || null,
    cover_image: formData.get("cover_image") as string || null,
    youtube_url: formData.get("youtube_url") as string || null,
    tags: JSON.parse(formData.get("tags") as string || "[]"),
    is_published: isPublished,
    published_at: isPublished ? new Date().toISOString() : null,
  };

  const { data, error } = await supabase.from("blog_posts").insert(post).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, post: data };
}

export async function updateBlogPost(postId: string, formData: FormData) {
  const supabase = createClient();
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

  const { data, error } = await supabase.from("blog_posts").update(updates).eq("id", postId).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, post: data };
}

export async function deleteBlogPost(postId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("blog_posts").delete().eq("id", postId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ============================================================
// ENQUIRY INBOX
// ============================================================

export async function getInboxMessages(vendorId?: string): Promise<EnquiryInbox[]> {
  const supabase = createClient();
  let query = supabase
    .from("enquiry_inbox")
    .select("*, venue:venues(name, city, cover_image)")
    .order("created_at", { ascending: false });
  if (vendorId) query = query.eq("vendor_id", vendorId);
  const { data } = await query;
  return (data ?? []) as EnquiryInbox[];
}

export async function markInboxRead(messageId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("enquiry_inbox").update({ is_read: true }).eq("id", messageId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function addInboxNote(messageId: string, note: string) {
  const supabase = createClient();
  const { error } = await supabase.from("enquiry_inbox").update({ admin_notes: note }).eq("id", messageId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ============================================================
// MARRIAGE PACKAGES
// ============================================================

export async function getMarriagePackages(activeOnly = true): Promise<MarriagePackage[]> {
  const supabase = createClient();
  let query = supabase.from("marriage_packages").select("*").order("display_order", { ascending: true });
  if (activeOnly) query = query.eq("is_active", true);
  const { data } = await query;
  return (data ?? []) as MarriagePackage[];
}

export async function createMarriagePackage(formData: FormData) {
  const supabase = createClient();
  const name = formData.get("name") as string;
  const slug = name.toLowerCase().replace(/[^\w ]+/g, "").replace(/ +/g, "-") + "-" + Date.now();
  const pkg = {
    name, slug,
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
  const { data, error } = await supabase.from("marriage_packages").insert(pkg).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, package: data };
}

export async function updateMarriagePackage(packageId: string, formData: FormData) {
  const supabase = createClient();
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
  const { data, error } = await supabase.from("marriage_packages").update(updates).eq("id", packageId).select().single();
  if (error) return { success: false, error: error.message };
  return { success: true, package: data };
}

export async function deleteMarriagePackage(packageId: string) {
  const supabase = createClient();
  const { error } = await supabase.from("marriage_packages").delete().eq("id", packageId);
  if (error) return { success: false, error: error.message };
  return { success: true };
}

// ============================================================
// TESTIMONIALS
// ============================================================

export async function getTestimonials(featuredOnly = false): Promise<Testimonial[]> {
  const supabase = createClient();
  let query = supabase
    .from("testimonials")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  if (featuredOnly) query = query.eq("is_featured", true);
  const { data } = await query;
  return (data ?? []) as Testimonial[];
}

export async function submitTestimonial(formData: FormData) {
  const supabase = createClient();
  const coupleName = (formData.get("couple_name") as string)?.trim();
  const location = (formData.get("location") as string)?.trim();
  const venueName = (formData.get("venue_name") as string)?.trim() || null;
  const ratingStr = formData.get("rating") as string;
  const text = (formData.get("text") as string)?.trim();

  if (!coupleName || !location || !text || !ratingStr) {
    return { success: false, message: "Please fill in all required fields." };
  }
  const rating = parseInt(ratingStr, 10);
  if (isNaN(rating) || rating < 1 || rating > 5) {
    return { success: false, message: "Rating must be between 1 and 5." };
  }

  const { data: maxRow } = await supabase
    .from("testimonials")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (maxRow?.display_order ?? 0) + 1;

  const { error } = await supabase.from("testimonials").insert({
    couple_name: coupleName, location, venue_name: venueName,
    rating, text, is_featured: false, is_active: true, display_order: nextOrder,
  });

  if (error) return { success: false, message: "Something went wrong. Please try again." };
  return { success: true, message: "Thank you! Your feedback has been published." };
}

// ============================================================
// SUCCESS STORIES
// ============================================================

export async function getSuccessStories(publishedOnly = true): Promise<SuccessStory[]> {
  const supabase = createClient();
  let query = supabase.from("success_stories").select("*").order("published_at", { ascending: false });
  if (publishedOnly) query = query.eq("is_published", true);
  const { data } = await query;
  return (data ?? []) as SuccessStory[];
}

export async function getSuccessStoryBySlug(slug: string): Promise<SuccessStory | null> {
  const supabase = createClient();
  const { data } = await supabase.from("success_stories").select("*").eq("slug", slug).single();
  return (data as SuccessStory) ?? null;
}
