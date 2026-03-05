import { getFeaturedVenues } from "@/lib/actions";
import { VenueCard } from "@/components/venue/venue-card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Crown } from "lucide-react";
import Link from "next/link";

export async function FeaturedVenues() {
  const venues = await getFeaturedVenues();

  // Demo venues if database is empty
  const displayVenues =
    venues.length > 0
      ? venues
      : [
          {
            id: "1",
            vendor_id: "v1",
            name: "Kaimur Palace Banquet Hall",
            slug: "kaimur-palace-banquet",
            description: "An opulent banquet hall with regal architecture in Bhabua",
            venue_type: "banquet_hall" as const,
            city: "Bhabua",
            state: "Bihar",
            address: "Station Road, Bhabua",
            pincode: "821101",
            latitude: null,
            longitude: null,
            capacity_min: 100,
            capacity_max: 800,
            price_per_slot: 150000,
            price_per_plate: 500,
            amenities: ["AC", "Parking", "Catering", "DJ/Music", "Decoration"],
            cover_image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80",
            images: [],
            youtube_videos: [],
            social_links: {},
            is_featured: true,
            is_active: true,
            rating: 4.8,
            total_reviews: 124,
            created_at: "",
            updated_at: "",
          },
          {
            id: "2",
            vendor_id: "v2",
            name: "Sasaram Garden Resort",
            slug: "sasaram-garden-resort",
            description: "Beautiful garden and lawns for outdoor celebrations in Sasaram",
            venue_type: "resort" as const,
            city: "Sasaram",
            state: "Bihar",
            address: "GT Road, Sasaram",
            pincode: "821115",
            latitude: null,
            longitude: null,
            capacity_min: 200,
            capacity_max: 1200,
            price_per_slot: 200000,
            price_per_plate: 600,
            amenities: ["Lawn", "Parking", "Catering", "Swimming Pool", "Bridal Suite"],
            cover_image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80",
            images: [],
            youtube_videos: [],
            social_links: {},
            is_featured: true,
            is_active: true,
            rating: 4.6,
            total_reviews: 89,
            created_at: "",
            updated_at: "",
          },
          {
            id: "3",
            vendor_id: "v3",
            name: "Rohtas Heritage Haveli",
            slug: "rohtas-heritage-haveli",
            description: "A heritage haveli reimagined for grand celebrations near Rohtasgarh Fort",
            venue_type: "heritage" as const,
            city: "Rohtas",
            state: "Bihar",
            address: "Near Rohtasgarh Fort, Rohtas",
            pincode: "821113",
            latitude: null,
            longitude: null,
            capacity_min: 50,
            capacity_max: 500,
            price_per_slot: 180000,
            price_per_plate: 550,
            amenities: ["AC", "Parking", "Hawan Kund", "Mandap Setup", "Stage", "Decoration"],
            cover_image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=600&q=80",
            images: [],
            youtube_videos: [],
            social_links: {},
            is_featured: true,
            is_active: true,
            rating: 4.9,
            total_reviews: 67,
            created_at: "",
            updated_at: "",
          },
          {
            id: "4",
            vendor_id: "v4",
            name: "Mohania Riverside Farmhouse",
            slug: "mohania-riverside-farmhouse",
            description: "A serene riverside farmhouse in Mohania",
            venue_type: "farmhouse" as const,
            city: "Mohania",
            state: "Bihar",
            address: "NH-2, Mohania",
            pincode: "821109",
            latitude: null,
            longitude: null,
            capacity_min: 100,
            capacity_max: 600,
            price_per_slot: 120000,
            price_per_plate: 400,
            amenities: ["Lawn", "Parking", "Kitchen", "Generator Backup", "CCTV"],
            cover_image: "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=600&q=80",
            images: [],
            youtube_videos: [],
            social_links: {},
            is_featured: true,
            is_active: true,
            rating: 4.5,
            total_reviews: 42,
            created_at: "",
            updated_at: "",
          },
          {
            id: "5",
            vendor_id: "v5",
            name: "Dehri Grand Convention Center",
            slug: "dehri-grand-convention",
            description: "Large convention center for grand celebrations in Dehri-on-Sone",
            venue_type: "convention_center" as const,
            city: "Dehri",
            state: "Bihar",
            address: "Dalmianagar Road, Dehri-on-Sone",
            pincode: "821307",
            latitude: null,
            longitude: null,
            capacity_min: 300,
            capacity_max: 2000,
            price_per_slot: 250000,
            price_per_plate: 700,
            amenities: ["AC", "Parking", "Catering", "Valet", "WiFi", "Stage"],
            cover_image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80",
            images: [],
            youtube_videos: [],
            social_links: {},
            is_featured: true,
            is_active: true,
            rating: 4.7,
            total_reviews: 156,
            created_at: "",
            updated_at: "",
          },
          {
            id: "6",
            vendor_id: "v6",
            name: "Chainpur Valley Lawns",
            slug: "chainpur-valley-lawns",
            description: "Sprawling lawns nestled in the scenic Kaimur hills of Chainpur",
            venue_type: "lawn" as const,
            city: "Chainpur",
            state: "Bihar",
            address: "Main Road, Chainpur",
            pincode: "821110",
            latitude: null,
            longitude: null,
            capacity_min: 100,
            capacity_max: 1000,
            price_per_slot: 100000,
            price_per_plate: 350,
            amenities: ["Lawn", "Parking", "Mandap Setup", "Hawan Kund", "Generator Backup"],
            cover_image: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&q=80",
            images: [],
            youtube_videos: [],
            social_links: {},
            is_featured: true,
            is_active: true,
            rating: 4.4,
            total_reviews: 38,
            created_at: "",
            updated_at: "",
          },
        ];

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Crown className="h-5 w-5 text-[var(--color-primary)]" />
              <span className="text-sm font-medium text-[var(--color-primary)] uppercase tracking-wider">
                Handpicked for You
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-charcoal)]">
              Featured <span className="text-gradient-gold">Venues</span>
            </h2>
          </div>
          <Link href="/venues" className="hidden sm:block">
            <Button variant="outline">
              View All <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayVenues.map((venue, i) => (
            <VenueCard key={venue.id} venue={venue} index={i} />
          ))}
        </div>

        <div className="mt-10 text-center sm:hidden">
          <Link href="/venues">
            <Button variant="outline">
              View All Venues <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
