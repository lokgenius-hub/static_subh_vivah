import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

const DEMO_VENDOR_EMAIL = "demo.vendor@vivahsthal.com";
const DEMO_VENDOR_PASSWORD = "DemoVendor@2024!";

const DEMO_VENUES = [
  {
    name: "Royal Palace Banquet Hall",
    slug: "royal-palace-banquet",
    description:
      "Step into the grandeur of Royal Palace Banquet Hall — a stunning blend of regal architecture and modern amenities. With ornate chandeliers, marble flooring, and impeccable service, this venue transforms your wedding into a royal celebration.",
    venue_type: "banquet_hall",
    city: "Patna",
    state: "Bihar",
    address: "Exhibition Rd, Near Gandhi Maidan, Patna 800001",
    pincode: "800001",
    capacity_min: 100,
    capacity_max: 800,
    price_per_slot: 250000,
    price_per_plate: 800,
    amenities: ["AC", "Parking", "Catering", "DJ/Music", "Decoration", "Valet", "Bridal Suite", "Lawn", "Generator Backup", "CCTV", "WiFi", "Stage", "Hawan Kund", "Mandap Setup"],
    cover_image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
      "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80",
    ],
    youtube_videos: [],
    social_links: {},
    is_featured: true,
    is_active: true,
    rating: 4.8,
    total_reviews: 124,
  },
  {
    name: "Garden Paradise Resort",
    slug: "garden-paradise-resort",
    description:
      "Beautiful garden and sprawling lawns for magical outdoor celebrations. Garden Paradise Resort offers a scenic retreat with luxury amenities, lush greenery, and a professional team dedicated to making your big day unforgettable.",
    venue_type: "resort",
    city: "Gaya",
    state: "Bihar",
    address: "NH 83, Near Airport, Gaya 823001",
    pincode: "823001",
    capacity_min: 200,
    capacity_max: 1200,
    price_per_slot: 400000,
    price_per_plate: 1200,
    amenities: ["Lawn", "Parking", "Catering", "Swimming Pool", "Bridal Suite", "AC", "DJ/Music", "Stage", "Generator Backup"],
    cover_image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800&q=80",
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
    ],
    youtube_videos: [],
    social_links: {},
    is_featured: true,
    is_active: true,
    rating: 4.6,
    total_reviews: 89,
  },
  {
    name: "Heritage Haveli",
    slug: "heritage-haveli",
    description:
      "A centuries-old haveli reimagined for grand celebrations. Step back in time with intricate frescoes, courtyard gardens, and traditional architecture that lend an unmatched character to your wedding.",
    venue_type: "heritage",
    city: "Muzaffarpur",
    state: "Bihar",
    address: "Club Rd, Near Juran Chapra, Muzaffarpur 842001",
    pincode: "842001",
    capacity_min: 50,
    capacity_max: 500,
    price_per_slot: 350000,
    price_per_plate: 1000,
    amenities: ["AC", "Parking", "Hawan Kund", "Mandap Setup", "Stage", "Decoration", "Catering", "WiFi"],
    cover_image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
    ],
    youtube_videos: [],
    social_links: {},
    is_featured: true,
    is_active: true,
    rating: 4.9,
    total_reviews: 67,
  },
  {
    name: "Lakeside Farmhouse",
    slug: "lakeside-farmhouse",
    description:
      "A serene lakeside farmhouse offering a tranquil escape for intimate and grand celebrations alike. With natural landscapes and bespoke decor options, every wedding here is truly one of a kind.",
    venue_type: "farmhouse",
    city: "Bhagalpur",
    state: "Bihar",
    address: "Tilka Manjhi Rd, Near Victoria Park, Bhagalpur 812001",
    pincode: "812001",
    capacity_min: 100,
    capacity_max: 600,
    price_per_slot: 180000,
    price_per_plate: 600,
    amenities: ["Lawn", "Parking", "Kitchen", "Generator Backup", "CCTV", "Hawan Kund", "Mandap Setup"],
    cover_image: "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
    ],
    youtube_videos: [],
    social_links: {},
    is_featured: true,
    is_active: true,
    rating: 4.5,
    total_reviews: 42,
  },
  {
    name: "Grand Convention Center",
    slug: "grand-convention-center",
    description:
      "Massive convention center for large-scale celebrations. Equipped with state-of-the-art audio/visual systems, multiple breakout halls, and a dedicated event management team for weddings up to 2000 guests.",
    venue_type: "convention_center",
    city: "Patna",
    state: "Bihar",
    address: "Boring Rd, Near Maurya Lok Complex, Patna 800001",
    pincode: "800001",
    capacity_min: 300,
    capacity_max: 2000,
    price_per_slot: 500000,
    price_per_plate: 1500,
    amenities: ["AC", "Parking", "Catering", "Valet", "WiFi", "Stage", "DJ/Music", "Bridal Suite", "Generator Backup", "CCTV"],
    cover_image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80",
      "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80",
    ],
    youtube_videos: [],
    social_links: {},
    is_featured: true,
    is_active: true,
    rating: 4.7,
    total_reviews: 156,
  },
  {
    name: "Bhabua Valley Lawns",
    slug: "bhabua-valley-lawns",
    description:
      "Sprawling lawns nestled in the scenic Kaimur hills. Bhabua Valley Lawns is ideal for outdoor ceremonies with open skies, fresh air, and the gorgeous Kaimur ridge as your natural backdrop.",
    venue_type: "lawn",
    city: "Bhabua",
    state: "Bihar",
    address: "Rohtas Rd, Near Kaimur Hills, Bhabua 821101",
    pincode: "821101",
    capacity_min: 100,
    capacity_max: 1000,
    price_per_slot: 150000,
    price_per_plate: 500,
    amenities: ["Lawn", "Parking", "Mandap Setup", "Hawan Kund", "Generator Backup", "Stage", "Decoration"],
    cover_image: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=1200&q=80",
    images: [
      "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800&q=80",
    ],
    youtube_videos: [],
    social_links: {},
    is_featured: true,
    is_active: true,
    rating: 4.4,
    total_reviews: 38,
  },
];

export async function GET() {
  try {
    const serviceClient = await createServiceClient();

    // Check if venues already exist
    const { count } = await serviceClient
      .from("venues")
      .select("*", { count: "exact", head: true });

    if (count && count > 0) {
      return NextResponse.json({
        message: `Venues already seeded (${count} venues exist). Skipping.`,
        count,
      });
    }

    // Get or create a demo vendor user
    const { data: existingUsers } = await serviceClient.auth.admin.listUsers();
    let vendorId: string;

    const existingVendor = existingUsers?.users?.find(
      (u) => u.email === DEMO_VENDOR_EMAIL
    );

    if (existingVendor) {
      vendorId = existingVendor.id;
    } else {
      const { data: newUser, error: userErr } =
        await serviceClient.auth.admin.createUser({
          email: DEMO_VENDOR_EMAIL,
          password: DEMO_VENDOR_PASSWORD,
          email_confirm: true,
          user_metadata: { full_name: "Demo Venue Partner", role: "vendor" },
        });

      if (userErr || !newUser?.user) {
        return NextResponse.json(
          { error: "Failed to create demo vendor: " + userErr?.message },
          { status: 500 }
        );
      }
      vendorId = newUser.user.id;
    }

    // Ensure profile exists for this vendor
    await serviceClient.from("profiles").upsert(
      {
        id: vendorId,
        full_name: "Demo Venue Partner",
        email: DEMO_VENDOR_EMAIL,
        role: "vendor",
        city: "Patna",
      },
      { onConflict: "id" }
    );

    // Insert demo venues
    const venuesToInsert = DEMO_VENUES.map((v) => ({
      ...v,
      vendor_id: vendorId,
    }));

    const { data: inserted, error: venueErr } = await serviceClient
      .from("venues")
      .insert(venuesToInsert)
      .select();

    if (venueErr) {
      return NextResponse.json(
        { error: "Failed to seed venues: " + venueErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Successfully seeded ${inserted?.length ?? 0} demo venues!`,
      venues: inserted?.map((v) => ({ id: v.id, name: v.name, slug: v.slug })),
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
