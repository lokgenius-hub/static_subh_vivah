import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/* ──────────────────────────────────────────────────────────
   REAL BHABUA-AREA VENUES + PARTNER ACCOUNTS + BLOGS
   Hit GET /api/seed-venues to run this seeder.
   ────────────────────────────────────────────────────────── */

const ADMIN_EMAIL = "admin@vivahsthal.com";
const ADMIN_PASSWORD = "Admin@Vivah2024";

// Each venue gets its own partner account
const VENUE_PARTNERS = [
  {
    email: "sharda.palace@vivahsthal.com",
    password: "Sharda@2024!",
    name: "Sharda Palace Manager",
    venue: {
      name: "Sharda Palace",
      slug: "sharda-palace-bhabua",
      description:
        "Sharda Palace is one of Bhabua's most popular banquet halls with 4.4 rating and 208+ reviews. Known for its elegant interiors, spacious dining area, and excellent catering services including dine-in, takeaway and delivery options. Perfect for grand wedding celebrations in the heart of Bhabua city.",
      venue_type: "banquet_hall",
      city: "Bhabua",
      address: "2JV8+2C, Bhabua, Kaimur, Bihar",
      pincode: "821101",
      latitude: 25.0415,
      longitude: 83.6065,
      capacity_min: 100,
      capacity_max: 800,
      price_per_slot: 80000,
      price_per_plate: 500,
      amenities: ["AC", "Parking", "Catering", "DJ/Music", "Decoration", "Stage", "Generator Backup"],
      rating: 4.4,
      total_reviews: 208,
    },
  },
  {
    email: "rajwanti.vatica@vivahsthal.com",
    password: "Rajwanti@2024!",
    name: "Rajwanti Vatica Manager",
    venue: {
      name: "Rajwanti Vatica",
      slug: "rajwanti-vatica-bhabua",
      description:
        "Rajwanti Vatica is a premium wedding venue in Bhabua with 7+ years in the business. Rated 3.8 with 179 reviews, it's known for being 'very good, neat and clean.' The spacious lawn and decorated halls make it ideal for both intimate and large wedding celebrations.",
      venue_type: "lawn",
      city: "Bhabua",
      address: "2HRW+W2G, Bhabua, Kaimur, Bihar",
      pincode: "821101",
      latitude: 25.038,
      longitude: 83.604,
      capacity_min: 150,
      capacity_max: 1000,
      price_per_slot: 60000,
      price_per_plate: 400,
      amenities: ["Lawn", "Parking", "Catering", "Decoration", "Mandap Setup", "Hawan Kund", "Stage", "Generator Backup"],
      rating: 3.8,
      total_reviews: 179,
    },
  },
  {
    email: "vimla.palace@vivahsthal.com",
    password: "Vimla@2024!",
    name: "Vimla Palace Manager",
    venue: {
      name: "Marriage Hall Vimla Palace",
      slug: "vimla-palace-bhabua",
      description:
        "Vimla Palace is a highly rated resort hotel and marriage hall in Bhabua with an impressive 4.7 rating. Located in Ward No 11, Chakbandi Road, it offers premium accommodation along with a beautiful wedding venue. The resort setting provides a unique blend of comfort and celebration.",
      venue_type: "resort",
      city: "Bhabua",
      address: "Ward No 11, Chakbandi Rd, Bhabua, Kaimur, Bihar",
      pincode: "821101",
      latitude: 25.04,
      longitude: 83.61,
      capacity_min: 100,
      capacity_max: 500,
      price_per_slot: 70000,
      price_per_plate: 450,
      amenities: ["AC", "Parking", "Catering", "Bridal Suite", "Decoration", "Generator Backup", "WiFi"],
      rating: 4.7,
      total_reviews: 6,
    },
  },
  {
    email: "atul.vatika@vivahsthal.com",
    password: "Atul@2024!",
    name: "Atul Vatika Manager",
    venue: {
      name: "Atul Vatika",
      slug: "atul-vatika-bhabua",
      description:
        "Atul Vatika is a well-known banquet hall on the Bhabua-Kudra bypass road with a 4.0 rating and 131 reviews. Guests praise it for 'spacious rooms and a hall big enough for any function.' The venue features modern amenities with ample parking space.",
      venue_type: "banquet_hall",
      city: "Bhabua",
      address: "Bhabua - Kudra, Bypass Road, Bhabua, Kaimur, Bihar",
      pincode: "821101",
      latitude: 25.0425,
      longitude: 83.612,
      capacity_min: 100,
      capacity_max: 700,
      price_per_slot: 65000,
      price_per_plate: 400,
      amenities: ["AC", "Parking", "Catering", "DJ/Music", "Stage", "Decoration", "Generator Backup", "CCTV", "Bridal Suite"],
      rating: 4.0,
      total_reviews: 131,
    },
  },
  {
    email: "gulzar.vatica@vivahsthal.com",
    password: "Gulzar@2024!",
    name: "Gulzar Vatica Manager",
    venue: {
      name: "Gulzar Vatica",
      slug: "gulzar-vatica-bhabua",
      description:
        "Gulzar Vatica is a popular wedding venue with 7+ years in the business, rated 3.9 with 179 reviews. Located in the heart of town, it's praised for being 'very spacious with an excellent banquet hall.' The central location makes it easily accessible for all guests.",
      venue_type: "banquet_hall",
      city: "Bhabua",
      address: "2JV6+QXQ, Bhabua, Kaimur, Bihar",
      pincode: "821101",
      latitude: 25.041,
      longitude: 83.6055,
      capacity_min: 150,
      capacity_max: 900,
      price_per_slot: 75000,
      price_per_plate: 450,
      amenities: ["AC", "Parking", "Catering", "Decoration", "Stage", "DJ/Music", "Generator Backup", "WiFi"],
      rating: 3.9,
      total_reviews: 179,
    },
  },
  {
    email: "shankar.palace@vivahsthal.com",
    password: "Shankar@2024!",
    name: "Shankar Palace Manager",
    venue: {
      name: "Shankar Palace",
      slug: "shankar-palace-kudra",
      description:
        "Shankar Palace on Kudra Bypass Road is rated 5.0 and has been called the 'Best marriage hall in Bhabua Kaimur.' Located at Ward Number 20, it offers premium wedding services with expert marriage consultation. The venue provides a perfect blend of tradition and modern celebrations.",
      venue_type: "banquet_hall",
      city: "Bhabua",
      address: "Ward Number 20, Kudra - Bhabhua Rd, Bhabua, Kaimur, Bihar",
      pincode: "821101",
      latitude: 25.0445,
      longitude: 83.613,
      capacity_min: 100,
      capacity_max: 600,
      price_per_slot: 55000,
      price_per_plate: 350,
      amenities: ["Parking", "Catering", "Decoration", "Mandap Setup", "Hawan Kund", "Stage", "Generator Backup"],
      rating: 5.0,
      total_reviews: 13,
    },
  },
  {
    email: "aashirwad.palace@vivahsthal.com",
    password: "Aashirwad@2024!",
    name: "Aashirwad Palace Manager",
    venue: {
      name: "Aashirwad Palace",
      slug: "aashirwad-palace-bhabua",
      description:
        "Aashirwad Palace is a well-established wedding venue in Bhabua with 7+ years of experience in hosting memorable celebrations. With 71 reviews and consistent service quality, it has been the choice for hundreds of families in the Kaimur region.",
      venue_type: "banquet_hall",
      city: "Bhabua",
      address: "Main Road, Bhabua, Bihar",
      pincode: "821101",
      latitude: 25.039,
      longitude: 83.607,
      capacity_min: 100,
      capacity_max: 500,
      price_per_slot: 50000,
      price_per_plate: 350,
      amenities: ["Parking", "Catering", "Decoration", "Stage", "Generator Backup", "Hawan Kund"],
      rating: 3.5,
      total_reviews: 71,
    },
  },
  {
    email: "ramapal.palace@vivahsthal.com",
    password: "Ramapal@2024!",
    name: "RamaPal Palace Manager",
    venue: {
      name: "RamaPal Palace",
      slug: "ramapal-palace-bhabua",
      description:
        "RamaPal Palace is an excellent event venue on NH 219 with a 4.7 rating. Guests call it the 'best place for lawns, weddings, marriage halls, and all functions.' The venue features a beautiful lawn and well-maintained facilities.",
      venue_type: "lawn",
      city: "Bhabua",
      address: "2HRV+Q93, NH 219, Bhabua, Kaimur, Bihar",
      pincode: "821101",
      latitude: 25.0375,
      longitude: 83.6035,
      capacity_min: 200,
      capacity_max: 1200,
      price_per_slot: 70000,
      price_per_plate: 400,
      amenities: ["Lawn", "Parking", "Catering", "Mandap Setup", "Decoration", "Stage", "Generator Backup"],
      rating: 4.7,
      total_reviews: 10,
    },
  },
  {
    email: "shail.palace@vivahsthal.com",
    password: "Shail@2024!",
    name: "Shail Rajendram Palace Manager",
    venue: {
      name: "Shail Rajendram Palace",
      slug: "shail-rajendram-palace-bhabua",
      description:
        "Shail Rajendram Palace is a top-rated event venue on Bhabua Road with 4.3 rating and 187 reviews. Known for its 'AC Banquet hall with best view and excellent parking facility.' The venue offers a premium wedding experience with modern amenities.",
      venue_type: "banquet_hall",
      city: "Bhabua",
      address: "Bhabua Rd, Bhabua, Kaimur, Bihar",
      pincode: "821101",
      latitude: 25.0405,
      longitude: 83.609,
      capacity_min: 100,
      capacity_max: 800,
      price_per_slot: 85000,
      price_per_plate: 500,
      amenities: ["AC", "Parking", "Catering", "DJ/Music", "Stage", "Decoration", "Generator Backup", "Valet", "WiFi"],
      rating: 4.3,
      total_reviews: 187,
    },
  },
  {
    email: "mohini.mahal@vivahsthal.com",
    password: "Mohini@2024!",
    name: "Mohini Mahal Manager",
    venue: {
      name: "Mohini Mahal",
      slug: "mohini-mahal-mohania",
      description:
        "Mohini Mahal is the best banquet and party hall in Mohania, rated 4.6 with 37 reviews. Located on Bhabua Road, it offers multi-cuisine dining with dine-in and drive-through services. The venue is ideal for weddings, receptions, and all celebrations in the Mohania area.",
      venue_type: "banquet_hall",
      city: "Mohania",
      address: "Plot No-560, Ward 16, Mohania Bhabua Road, Anwari, Mohania, Kaimur, Bihar",
      pincode: "821109",
      latitude: 24.956,
      longitude: 83.565,
      capacity_min: 100,
      capacity_max: 600,
      price_per_slot: 60000,
      price_per_plate: 400,
      amenities: ["AC", "Parking", "Catering", "DJ/Music", "Decoration", "Stage", "Generator Backup"],
      rating: 4.6,
      total_reviews: 37,
    },
  },
  {
    email: "green.valley@vivahsthal.com",
    password: "GreenValley@2024!",
    name: "Green Valley Resort Manager",
    venue: {
      name: "Green Valley Resort",
      slug: "green-valley-resort-bhabua",
      description:
        "Green Valley Resort in Sarangpur, Dharhanian is a premium wedding venue rated 4.8 with 13 reviews. Guests say 'the banquet hall is big enough to host any kind of event.' Surrounded by natural greenery, it offers a serene and beautiful setting for weddings.",
      venue_type: "resort",
      city: "Bhabua",
      address: "Sarangpur, Dharhanian, Bhabua, Kaimur, Bihar",
      pincode: "821101",
      latitude: 25.035,
      longitude: 83.595,
      capacity_min: 200,
      capacity_max: 1000,
      price_per_slot: 90000,
      price_per_plate: 550,
      amenities: ["Lawn", "Parking", "Catering", "AC", "Bridal Suite", "Decoration", "Stage", "Generator Backup", "Swimming Pool"],
      rating: 4.8,
      total_reviews: 13,
    },
  },
  {
    email: "patel.bhawan@vivahsthal.com",
    password: "Patel@2024!",
    name: "Patel Bhawan Manager",
    venue: {
      name: "Patel Bhawan Marriage Hall & Hotel",
      slug: "patel-bhawan-bhabua",
      description:
        "Patel Bhawan is a trusted resort hotel and marriage hall near Mundeshwari Temple Road. Rated 4.6 with 28 reviews, it offers affordable pricing with hotel accommodation. A favorite for families seeking value-for-money wedding celebrations.",
      venue_type: "resort",
      city: "Bhabua",
      address: "Naya Road, Mundeshwari Temple Rd, Bhabua, Kaimur, Bihar",
      pincode: "821101",
      latitude: 25.037,
      longitude: 83.611,
      capacity_min: 100,
      capacity_max: 500,
      price_per_slot: 45000,
      price_per_plate: 300,
      amenities: ["Parking", "Catering", "Bridal Suite", "Decoration", "Generator Backup", "Hawan Kund"],
      rating: 4.6,
      total_reviews: 28,
    },
  },
  {
    email: "swyamvar.vatika@vivahsthal.com",
    password: "Swyamvar@2024!",
    name: "Swyamvar Vatika Manager",
    venue: {
      name: "Swyamvar Vatika",
      slug: "swyamvar-vatika-bhabua",
      description:
        "Swyamvar Vatika is a well-located banquet hall near Collectorate Road, opposite Lallu Bhai. Rated 3.9 with 13 reviews, it offers dine-in facilities and a convenient central location perfect for wedding functions.",
      venue_type: "banquet_hall",
      city: "Bhabua",
      address: "16, Collectorate Rd, Opposite Lallu Bhai, Bhabua, Kaimur, Bihar",
      pincode: "821101",
      latitude: 25.0398,
      longitude: 83.6078,
      capacity_min: 80,
      capacity_max: 400,
      price_per_slot: 40000,
      price_per_plate: 300,
      amenities: ["AC", "Parking", "Catering", "Decoration", "Stage", "Generator Backup"],
      rating: 3.9,
      total_reviews: 13,
    },
  },
  {
    email: "varmala.palace@vivahsthal.com",
    password: "Varmala@2024!",
    name: "Varmala Palace Manager",
    venue: {
      name: "Varmala Palace",
      slug: "varmala-palace-bhabua",
      description:
        "Varmala Palace is a modern banquet hall in Bhabua offering dine-in and takeaway services. Rated 4.2 with 10 reviews, it provides a well-decorated and maintained space for wedding celebrations and events.",
      venue_type: "banquet_hall",
      city: "Bhabua",
      address: "2JPJ+MC2, Bhabua, Kaimur, Bihar",
      pincode: "821101",
      latitude: 25.0388,
      longitude: 83.605,
      capacity_min: 80,
      capacity_max: 400,
      price_per_slot: 45000,
      price_per_plate: 350,
      amenities: ["AC", "Parking", "Catering", "Decoration", "Stage", "Generator Backup"],
      rating: 4.2,
      total_reviews: 10,
    },
  },
  {
    email: "radha.krishna@vivahsthal.com",
    password: "RadhaKrishna@2024!",
    name: "Radha Krishna Vatika Manager",
    venue: {
      name: "Radha Krishna Vatika (Lawn)",
      slug: "radha-krishna-vatika-bhabua",
      description:
        "Radha Krishna Vatika is a highly rated lawn venue near Bus Stand Road with a perfect 5.0 rating. Guests describe it as the 'best place for marriage with wide place & garden.' The beautiful garden setting makes it ideal for traditional outdoor weddings.",
      venue_type: "lawn",
      city: "Bhabua",
      address: "2JPG+PPJ, Bus Stand Road, Bhabua, Kaimur, Bihar",
      pincode: "821101",
      latitude: 25.0395,
      longitude: 83.606,
      capacity_min: 200,
      capacity_max: 1000,
      price_per_slot: 55000,
      price_per_plate: 350,
      amenities: ["Lawn", "Parking", "Mandap Setup", "Hawan Kund", "Decoration", "Stage", "Generator Backup"],
      rating: 5.0,
      total_reviews: 3,
    },
  },
  {
    email: "shree.ganesh@vivahsthal.com",
    password: "ShreeGanesh@2024!",
    name: "Shree Ganesh Vatika Manager",
    venue: {
      name: "Shree Ganesh Vatika",
      slug: "shree-ganesh-vatika-bhabua",
      description:
        "Shree Ganesh Vatika is an established wedding venue with 10+ years in business, rated 3.8 with 58 reviews. Described as 'peaceful and the better lawn for birthday party, marriage and any function.' A trusted name for celebrations in Bhabua.",
      venue_type: "lawn",
      city: "Bhabua",
      address: "2JP3+562, Bhabua, Kaimur, Bihar",
      pincode: "821101",
      latitude: 25.0385,
      longitude: 83.6045,
      capacity_min: 100,
      capacity_max: 800,
      price_per_slot: 50000,
      price_per_plate: 350,
      amenities: ["Lawn", "Parking", "Catering", "Decoration", "Mandap Setup", "Hawan Kund", "Stage", "Generator Backup"],
      rating: 3.8,
      total_reviews: 58,
    },
  },
  {
    email: "radha.palace@vivahsthal.com",
    password: "RadhaPalace@2024!",
    name: "Radha Palace Manager",
    venue: {
      name: "Radha Palace & Hotel",
      slug: "radha-palace-hotel-bhabua",
      description:
        "Radha Palace & Hotel on Main Road offers an 'excellent arrangement and spacious place' for weddings. Rated 4.5 with 13 reviews, it provides hotel accommodation alongside wedding venue services, making it convenient for families from out of town.",
      venue_type: "banquet_hall",
      city: "Bhabua",
      address: "Main Road, Bhabua, Kaimur, Bihar",
      pincode: "821101",
      latitude: 25.0402,
      longitude: 83.6075,
      capacity_min: 100,
      capacity_max: 500,
      price_per_slot: 55000,
      price_per_plate: 400,
      amenities: ["AC", "Parking", "Catering", "Bridal Suite", "Decoration", "Stage", "Generator Backup", "WiFi"],
      rating: 4.5,
      total_reviews: 13,
    },
  },
  {
    email: "nagababa.hall@vivahsthal.com",
    password: "Nagababa@2024!",
    name: "Nagababa Marriage Hall Manager",
    venue: {
      name: "Nagababa Marriage Hall",
      slug: "nagababa-marriage-hall-bhabua",
      description:
        "Nagababa Marriage Hall is a well-located banquet hall with a perfect 5.0 rating. Near the bus stand area, it's a convenient choice for families in and around Bhabua for hosting weddings and celebrations.",
      venue_type: "banquet_hall",
      city: "Bhabua",
      address: "3J27+RJQ, Near Bus Stand, Bhabua, Kaimur, Bihar",
      pincode: "821101",
      latitude: 25.042,
      longitude: 83.6085,
      capacity_min: 80,
      capacity_max: 400,
      price_per_slot: 40000,
      price_per_plate: 300,
      amenities: ["Parking", "Catering", "Decoration", "Stage", "Generator Backup", "Mandap Setup"],
      rating: 5.0,
      total_reviews: 2,
    },
  },
  {
    email: "sanjay.vatika@vivahsthal.com",
    password: "Sanjay@2024!",
    name: "Sanjay Vatika Manager",
    venue: {
      name: "Sanjay Vatika",
      slug: "sanjay-vatika-bhabua",
      description:
        "Sanjay Vatika is a spacious marriage lawn on Bhabua bypass road. Rated 3.4 with 24 reviews, it offers a budget-friendly option for outdoor wedding celebrations with ample space for ceremonies and receptions.",
      venue_type: "lawn",
      city: "Bhabua",
      address: "Bhabua Rd, Bypass, Bhabua, Kaimur, Bihar",
      pincode: "821101",
      latitude: 25.0435,
      longitude: 83.6105,
      capacity_min: 150,
      capacity_max: 800,
      price_per_slot: 35000,
      price_per_plate: 250,
      amenities: ["Lawn", "Parking", "Decoration", "Mandap Setup", "Hawan Kund", "Generator Backup"],
      rating: 3.4,
      total_reviews: 24,
    },
  },
  {
    email: "nagababa.residency@vivahsthal.com",
    password: "NagababaR@2024!",
    name: "Nagababa Residency Manager",
    venue: {
      name: "NAGABABA RESIDENCY",
      slug: "nagababa-residency-bhabua",
      description:
        "NAGABABA RESIDENCY is a modern banquet hall located near the bus stand bypass in Bhabua. A newer venue offering fresh facilities and a convenient location for guests traveling from nearby towns.",
      venue_type: "banquet_hall",
      city: "Bhabua",
      address: "Bus Stand Bypass, Bhabua, Kaimur, Bihar",
      pincode: "821101",
      latitude: 25.0430,
      longitude: 83.6095,
      capacity_min: 80,
      capacity_max: 350,
      price_per_slot: 35000,
      price_per_plate: 250,
      amenities: ["AC", "Parking", "Catering", "Decoration", "Stage", "Generator Backup"],
      rating: 0,
      total_reviews: 0,
    },
  },
];

// Dummy blog posts — SEO-friendly content for Bhabua wedding market
const BLOG_POSTS = [
  {
    title: "Top 10 Wedding Venues in Bhabua for 2025-2026",
    slug: "top-10-wedding-venues-bhabua-2025",
    excerpt:
      "Planning a wedding in Bhabua? Here's our handpicked list of the top 10 marriage halls and lawns in Kaimur district that will make your special day truly memorable.",
    content: `<h2>Finding the Perfect Venue in Bhabua</h2>
<p>Bhabua, the heart of Kaimur district, has emerged as a popular destination for grand wedding celebrations. With scenic Kaimur hills as a backdrop and a growing number of world-class venues, couples now have plenty of choices right here.</p>
<h3>1. Sharda Palace</h3>
<p>With a stellar 4.4 rating and 208+ reviews, Sharda Palace tops our list. The elegant banquet hall offers AC interiors, full catering, and professional decoration services. Located centrally, it's easily accessible for all your guests.</p>
<h3>2. Green Valley Resort</h3>
<p>Rated 4.8, this resort in Sarangpur offers a unique blend of nature and luxury. The lush green surroundings create a dreamlike atmosphere for outdoor ceremonies.</p>
<h3>3. Vimla Palace</h3>
<p>A resort hotel with a 4.7 rating, Vimla Palace offers the convenience of accommodation combined with a beautiful wedding venue. Ideal for destination wedding vibes without traveling far.</p>
<h3>4. Shail Rajendram Palace</h3>
<p>Known for its AC banquet hall with the best view and excellent parking, this venue is perfect for large gatherings with 187+ positive reviews.</p>
<h3>5. Rajwanti Vatica</h3>
<p>A veteran in the wedding industry with 7+ years, Rajwanti Vatica's spacious lawns are perfect for traditional outdoor ceremonies.</p>
<h3>Budget Planning Tips</h3>
<ul>
<li>Book at least 3-4 months in advance during wedding season (November-February)</li>
<li>Ask about off-season discounts (July-September)</li>
<li>Compare per-plate rates — most Bhabua venues offer ₹250-₹500 per plate</li>
<li>Negotiate package deals that include decoration and catering</li>
</ul>`,
    tags: ["bhabua", "wedding venues", "kaimur", "top venues"],
    cover_image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200&q=80",
  },
  {
    title: "Complete Guide to Wedding Planning in Kaimur District",
    slug: "wedding-planning-guide-kaimur-district",
    excerpt:
      "Everything you need to know about planning a wedding in Kaimur — from choosing the right venue to booking caterers, decorators, and photographers in Bhabua and surrounding areas.",
    content: `<h2>Your Complete Kaimur Wedding Planning Checklist</h2>
<p>Planning a wedding in Kaimur district doesn't have to be stressful. Whether you're hosting in Bhabua, Mohania, Chainpur, or any nearby town, this comprehensive guide will help you organize a beautiful celebration.</p>
<h3>6-12 Months Before</h3>
<ul>
<li><strong>Set your budget:</strong> Typical Bhabua weddings range from ₹3-15 lakhs depending on guest count and venue choice</li>
<li><strong>Choose your venue:</strong> Visit VivahSthal to compare all venues in Bhabua, check availability, and get instant quotes</li>
<li><strong>Book your pandit ji:</strong> Especially important during peak wedding season</li>
</ul>
<h3>3-6 Months Before</h3>
<ul>
<li><strong>Finalize catering:</strong> Most Bhabua venues offer in-house catering from ₹250-₹500 per plate</li>
<li><strong>Book photographer/videographer:</strong> Local photographers charge ₹15,000-₹50,000</li>
<li><strong>Send invitations:</strong> Digital invites are trending — save on printing costs</li>
</ul>
<h3>1-3 Months Before</h3>
<ul>
<li><strong>Decoration planning:</strong> Discuss mandap, stage, and entrance decoration with your venue</li>
<li><strong>Music & DJ:</strong> Book local DJ services — typically ₹10,000-₹25,000 in Bhabua</li>
<li><strong>Accommodation:</strong> Book hotel rooms for outstation guests at venues like Vimla Palace or Patel Bhawan</li>
</ul>
<h3>Popular Muhurat Months</h3>
<p>In Bihar, the most popular wedding months are November, December, January, February, April, and May. The Kaimur weather is pleasant during winter months, making it ideal for outdoor lawn ceremonies.</p>`,
    tags: ["wedding planning", "kaimur", "bhabua", "guide"],
    cover_image: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200&q=80",
  },
  {
    title: "Why Bhabua is Becoming Bihar's Next Wedding Destination",
    slug: "bhabua-next-wedding-destination-bihar",
    excerpt:
      "From scenic Kaimur hills to affordable luxury venues, discover why more couples are choosing Bhabua for their dream wedding celebrations.",
    content: `<h2>Bhabua: The Rising Star of Bihar Weddings</h2>
<p>While cities like Patna and Gaya have traditionally been the go-to for grand weddings in Bihar, Bhabua is rapidly emerging as a preferred destination. Here's why smart couples are making this choice.</p>
<h3>Unbeatable Value for Money</h3>
<p>Wedding venues in Bhabua offer prices 30-50% lower than Patna while delivering comparable quality. A grand banquet hall that costs ₹2-3 lakhs per slot in Patna can be found for ₹50,000-₹90,000 in Bhabua. This means more budget for decoration, food, and entertainment.</p>
<h3>Scenic Natural Beauty</h3>
<p>The Kaimur hills provide a stunning natural backdrop that no amount of artificial decoration can match. Venues like Green Valley Resort and the various vatika-style lawns take advantage of this natural beauty.</p>
<h3>Growing Infrastructure</h3>
<p>Bhabua has seen significant development in recent years with improved roads, better connectivity, and an increasing number of modern wedding venues with AC halls, parking, and professional services.</p>
<h3>Local Hospitality</h3>
<p>What truly sets Bhabua apart is the warmth of local hospitality. Venue owners personally ensure every detail is taken care of, giving your wedding that personal touch that big-city venues often lack.</p>
<h3>The Numbers Speak</h3>
<p>With 20+ wedding venues, average ratings of 4.0+, and prices starting from just ₹35,000 per slot, Bhabua offers the perfect blend of quality and affordability for your dream wedding.</p>`,
    tags: ["bhabua", "destination wedding", "bihar", "kaimur hills"],
    cover_image: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=1200&q=80",
  },
  {
    title: "Auspicious Wedding Dates (Shubh Muhurat) 2025-2026 for Bihar",
    slug: "auspicious-wedding-dates-2025-2026-bihar",
    excerpt:
      "Check the complete list of shubh muhurat and auspicious wedding dates for 2025-2026 according to the Hindu Panchang, tailored for Bhabua and Bihar region weddings.",
    content: `<h2>Shubh Vivah Muhurat 2025-2026</h2>
<p>Choosing an auspicious date is one of the most important decisions in Indian wedding planning. Here's a comprehensive guide to shubh muhurat dates for weddings in 2025-2026.</p>
<h3>Peak Wedding Season (Nov 2025 - Feb 2026)</h3>
<ul>
<li><strong>November 2025:</strong> Tue 18, Wed 19, Thu 20, Mon 24, Tue 25, Wed 26</li>
<li><strong>December 2025:</strong> Mon 1, Tue 2, Fri 5, Mon 8, Tue 9, Wed 10</li>
<li><strong>January 2026:</strong> Mon 12, Tue 13, Wed 14, Thu 15, Mon 19, Tue 20</li>
<li><strong>February 2026:</strong> Mon 2, Tue 3, Wed 4, Mon 9, Tue 10, Fri 13</li>
</ul>
<h3>Spring Season (Apr-May 2026)</h3>
<ul>
<li><strong>April 2026:</strong> Mon 13, Tue 14, Thu 16, Mon 20, Tue 21, Wed 22, Mon 27</li>
<li><strong>May 2026:</strong> Mon 4, Tue 5, Wed 6, Mon 11, Tue 12, Mon 18</li>
</ul>
<h3>Tips for Bhabua Weddings</h3>
<p>Weather in Bhabua is best during November-February (15-25°C), making it perfect for outdoor lawn weddings. Summer months (April-June) can be hot — prefer AC banquet halls. The monsoon season (July-September) is generally avoided.</p>
<p><strong>Pro tip:</strong> Book your Bhabua venue as soon as you finalize the date — popular venues like Sharda Palace and Shail Rajendram Palace fill up quickly during peak season!</p>`,
    tags: ["muhurat", "auspicious dates", "wedding dates", "2025-2026", "bihar"],
    cover_image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=1200&q=80",
  },
  {
    title: "Budget Wedding in Bhabua: How to Plan Under ₹3 Lakhs",
    slug: "budget-wedding-bhabua-under-3-lakhs",
    excerpt:
      "Dream of a beautiful wedding but working with a tight budget? Here's a complete guide to planning an elegant wedding in Bhabua under ₹3 lakhs.",
    content: `<h2>A Beautiful Wedding Doesn't Need to Break the Bank</h2>
<p>In Bhabua and Kaimur district, it's absolutely possible to host a memorable wedding celebration without overspending. Here's your budget breakdown.</p>
<h3>Budget Breakdown (₹3 Lakhs)</h3>
<table>
<tr><td><strong>Venue Booking</strong></td><td>₹35,000 - ₹50,000</td></tr>
<tr><td><strong>Catering (200 guests)</strong></td><td>₹50,000 - ₹75,000</td></tr>
<tr><td><strong>Decoration</strong></td><td>₹15,000 - ₹25,000</td></tr>
<tr><td><strong>Photography</strong></td><td>₹15,000 - ₹25,000</td></tr>
<tr><td><strong>Music/DJ</strong></td><td>₹10,000 - ₹15,000</td></tr>
<tr><td><strong>Invitation Cards</strong></td><td>₹5,000 - ₹8,000</td></tr>
<tr><td><strong>Bride/Groom Outfits</strong></td><td>₹20,000 - ₹40,000</td></tr>
<tr><td><strong>Miscellaneous</strong></td><td>₹20,000 - ₹30,000</td></tr>
<tr><td><strong>Total</strong></td><td>₹1,70,000 - ₹2,68,000</td></tr>
</table>
<h3>Money-Saving Tips</h3>
<ul>
<li><strong>Choose lawn venues</strong> like Sanjay Vatika or Radha Krishna Vatika — starting at just ₹35,000</li>
<li><strong>Opt for lunch ceremonies</strong> — morning/afternoon slots are usually cheaper</li>
<li><strong>Combine services</strong> — many Bhabua venues offer bundled decoration + catering packages</li>
<li><strong>Use VivahSthal's Silver Package</strong> at ₹1.5 lakhs — includes venue, basic catering, photography, and decoration</li>
<li><strong>Go digital</strong> — WhatsApp invitations save ₹5,000+ on printing</li>
</ul>
<h3>Best Budget Venues in Bhabua</h3>
<p>1. Sanjay Vatika (₹35,000/slot) — Great lawn with open space<br/>
2. Nagababa Marriage Hall (₹40,000/slot) — Central location<br/>
3. Swyamvar Vatika (₹40,000/slot) — Near Collectorate Road<br/>
4. Patel Bhawan (₹45,000/slot) — Includes hotel rooms</p>`,
    tags: ["budget wedding", "bhabua", "affordable", "wedding tips"],
    cover_image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=1200&q=80",
  },
];

export async function GET() {
  try {
    const serviceClient = await createServiceClient();
    const results: string[] = [];

    // ── 1. Create / ensure super admin ──
    const { data: existingUsers } = await serviceClient.auth.admin.listUsers();
    let adminUser = existingUsers?.users?.find((u) => u.email === ADMIN_EMAIL);

    if (!adminUser) {
      const { data: newAdmin } = await serviceClient.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { full_name: "Super Admin", role: "admin" },
      });
      if (newAdmin?.user) {
        adminUser = newAdmin.user;
        await serviceClient.from("profiles").upsert(
          { id: newAdmin.user.id, full_name: "Super Admin", email: ADMIN_EMAIL, role: "admin", city: "Bhabua" },
          { onConflict: "id" }
        );
        results.push("✅ Super Admin created");
      }
    } else {
      await serviceClient.from("profiles").upsert(
        { id: adminUser.id, full_name: "Super Admin", email: ADMIN_EMAIL, role: "admin", city: "Bhabua" },
        { onConflict: "id" }
      );
      results.push("✅ Super Admin already exists — profile synced");
    }

    // ── 2. Create venue partners + venues ──
    let venuesCreated = 0;
    let partnersCreated = 0;
    const partnerCredentials: { email: string; password: string; venue: string }[] = [];

    for (const partner of VENUE_PARTNERS) {
      let existingPartner = existingUsers?.users?.find((u) => u.email === partner.email);

      if (!existingPartner) {
        const { data: newPartner, error: pErr } = await serviceClient.auth.admin.createUser({
          email: partner.email,
          password: partner.password,
          email_confirm: true,
          user_metadata: { full_name: partner.name, role: "vendor" },
        });
        if (pErr) {
          results.push(`⚠️ Partner ${partner.email}: ${pErr.message}`);
          continue;
        }
        existingPartner = newPartner?.user;
        partnersCreated++;
      }

      if (!existingPartner) continue;

      // Upsert profile
      await serviceClient.from("profiles").upsert(
        { id: existingPartner.id, full_name: partner.name, email: partner.email, role: "vendor", city: partner.venue.city },
        { onConflict: "id" }
      );

      // Check if venue already seeded
      const { data: existingVenue } = await serviceClient
        .from("venues")
        .select("id")
        .eq("slug", partner.venue.slug)
        .maybeSingle();

      if (!existingVenue) {
        const { error: vErr } = await serviceClient.from("venues").insert({
          vendor_id: existingPartner.id,
          ...partner.venue,
          state: "Bihar",
          images: [],
          youtube_videos: [],
          social_links: {},
          is_featured: true,
          is_active: true,
        });
        if (vErr) {
          results.push(`⚠️ Venue ${partner.venue.name}: ${vErr.message}`);
        } else {
          venuesCreated++;
        }
      }

      partnerCredentials.push({ email: partner.email, password: partner.password, venue: partner.venue.name });
    }

    results.push(`✅ ${venuesCreated} venues created, ${partnersCreated} new partner accounts`);

    // ── 3. Seed blog posts ──
    let blogsCreated = 0;
    const adminId = adminUser?.id;

    for (const post of BLOG_POSTS) {
      const { data: existingBlog } = await serviceClient
        .from("blog_posts")
        .select("id")
        .eq("slug", post.slug)
        .maybeSingle();

      if (!existingBlog) {
        const { error: bErr } = await serviceClient.from("blog_posts").insert({
          author_id: adminId,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          cover_image: post.cover_image,
          tags: post.tags,
          is_published: true,
          published_at: new Date().toISOString(),
        });
        if (!bErr) blogsCreated++;
        else results.push(`⚠️ Blog "${post.title}": ${bErr.message}`);
      }
    }

    results.push(`✅ ${blogsCreated} blog posts created`);

    return NextResponse.json({
      success: true,
      summary: results,
      admin: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
      partners: partnerCredentials,
      totalVenues: venuesCreated,
      totalBlogs: blogsCreated,
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}
