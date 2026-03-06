// ============================================================
// VivahSthal - TypeScript Types
// ============================================================

export type UserRole = "customer" | "vendor" | "admin" | "rm";
export type SlotType = "morning" | "evening" | "full_day";
export type LeadStatus = "new" | "contacted" | "qualified" | "converted" | "lost";
export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type VenueType =
  | "banquet_hall"
  | "farmhouse"
  | "resort"
  | "hotel"
  | "lawn"
  | "temple"
  | "palace"
  | "heritage"
  | "convention_center"
  | "community_hall";

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  city: string | null;
  assigned_rm_id: string | null;
  approved_status: ApprovalStatus;
  created_at: string;
  updated_at: string;
}

export interface Venue {
  id: string;
  vendor_id: string;
  name: string;
  slug: string;
  description: string | null;
  venue_type: VenueType;
  city: string;
  state: string;
  address: string;
  pincode: string | null;
  latitude: number | null;
  longitude: number | null;
  capacity_min: number;
  capacity_max: number;
  price_per_slot: number;
  price_per_plate: number | null;
  amenities: string[];
  cover_image: string | null;
  images: string[];
  youtube_videos: string[];
  social_links: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    whatsapp?: string;
  };
  is_featured: boolean;
  is_active: boolean;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
}

export interface VenueSlot {
  id: string;
  venue_id: string;
  slot_date: string;
  slot_type: SlotType;
  is_available: boolean;
  is_auspicious: boolean;
  price_override: number | null;
  booking_status: BookingStatus;
  booked_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  venue_id: string | null;
  customer_id: string | null;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  event_date: string | null;
  slot_preference: SlotType | null;
  guest_count: number | null;
  budget_range: string | null;
  message: string | null;
  source: string;
  status: LeadStatus;
  assigned_rm_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  venue?: Venue;
  customer?: Profile;
  assigned_rm?: Profile;
}

export interface AuspiciousDate {
  id: string;
  date: string;
  name: string;
  description: string | null;
  year: number;
}

export interface VenueEmbedding {
  id: string;
  venue_id: string;
  content: string;
  similarity?: number;
}

export interface VenueReview {
  id: string;
  venue_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user?: Profile;
}

export interface BlogPost {
  id: string;
  author_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  youtube_url: string | null;
  tags: string[];
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface EnquiryInbox {
  id: string;
  lead_id: string | null;
  venue_id: string;
  vendor_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  event_date: string | null;
  guest_count: number | null;
  slot_preference: string | null;
  budget_range: string | null;
  message: string | null;
  source: string;
  is_read: boolean;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  venue?: Venue;
}

export interface MarriagePackage {
  id: string;
  name: string;
  slug: string;
  tier: "silver" | "golden" | "diamond" | "custom";
  tagline: string | null;
  description: string | null;
  price: number;
  original_price: number | null;
  features: { title: string; desc: string }[];
  inclusions: string[];
  cover_image: string | null;
  images: string[];
  is_popular: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  id: string;
  couple_name: string;
  location: string;
  venue_name: string | null;
  event_date: string | null;
  rating: number;
  text: string;
  avatar_url: string | null;
  photo_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface SuccessStory {
  id: string;
  couple_name: string;
  slug: string;
  location: string;
  venue_name: string | null;
  event_date: string | null;
  story: string;
  excerpt: string | null;
  cover_image: string | null;
  images: string[];
  youtube_url: string | null;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// Search / filter types
export interface VenueSearchParams {
  city?: string;
  venue_type?: VenueType;
  capacity?: number;
  budget_min?: number;
  budget_max?: number;
  date?: string;
  slot_type?: SlotType;
  auspicious_only?: boolean;
  q?: string;
  page?: number;
  limit?: number;
}
