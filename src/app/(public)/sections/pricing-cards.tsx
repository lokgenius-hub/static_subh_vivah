"use client";

import { motion } from "framer-motion";
import { Check, Crown, Sparkles, Star, ArrowRight, Phone, Award, Gem, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { MarriagePackage } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

const tierConfig = {
  silver: {
    icon: Shield,
    color: "from-gray-300 via-gray-400 to-gray-500",
    textColor: "text-gray-600",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    badgeColor: "bg-gray-100 text-gray-700",
    ring: "",
  },
  golden: {
    icon: Crown,
    color: "from-amber-400 via-yellow-500 to-amber-600",
    textColor: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-300",
    badgeColor: "bg-amber-100 text-amber-800",
    ring: "ring-2 ring-amber-400 ring-offset-2",
  },
  diamond: {
    icon: Gem,
    color: "from-purple-400 via-pink-500 to-purple-600",
    textColor: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    badgeColor: "bg-purple-100 text-purple-800",
    ring: "",
  },
  custom: {
    icon: Sparkles,
    color: "from-rose-400 via-pink-500 to-rose-600",
    textColor: "text-rose-700",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    badgeColor: "bg-rose-100 text-rose-800",
    ring: "",
  },
};

// Demo packages (fallback when DB is empty)
const demoPackages: MarriagePackage[] = [
  {
    id: "1", name: "Silver Package", slug: "silver-wedding-package", tier: "silver",
    tagline: "Perfect Start for Your Special Day",
    description: "Our Silver Package gives you everything essential for a beautiful wedding celebration. Ideal for intimate gatherings of up to 300 guests.",
    price: 149999, original_price: 199999,
    features: [
      { title: "Venue Booking", desc: "Full-day venue booking with basic setup" },
      { title: "Basic Decoration", desc: "Mandap decoration, entrance gate, stage setup" },
      { title: "Catering (Veg)", desc: "Welcome drink + 2 starters + main course + dessert for up to 300 guests" },
      { title: "Sound System", desc: "Professional DJ with basic sound and lighting" },
      { title: "Photography", desc: "1 photographer for ceremony coverage" },
    ],
    inclusions: ["Venue for full day", "Basic mandap decoration", "Stage & entrance setup", "Veg catering (300 guests)", "DJ & sound system", "1 photographer", "Parking management", "Generator backup"],
    cover_image: null, images: [], is_popular: false, is_active: true, display_order: 1, created_at: "", updated_at: "",
  },
  {
    id: "2", name: "Golden Package", slug: "golden-wedding-package", tier: "golden",
    tagline: "Most Popular — Complete Wedding Solution",
    description: "Our most popular package! Includes premium decoration, multi-cuisine catering, professional photography & videography, and entertainment.",
    price: 349999, original_price: 449999,
    features: [
      { title: "Premium Venue", desc: "Full-day premium venue with AC banquet hall + lawn" },
      { title: "Grand Decoration", desc: "Themed decoration, flower mandap, lighting, draping, entrance" },
      { title: "Multi-Cuisine Catering", desc: "Welcome drinks + 4 starters + main course (veg/non-veg) + live counters + desserts for up to 500 guests" },
      { title: "Entertainment", desc: "Professional DJ, LED wall, choreographed lighting" },
      { title: "Photo & Video", desc: "2 photographers + 1 videographer + drone shoot + album" },
      { title: "Bridal Makeup", desc: "Professional bridal makeup & groom styling" },
    ],
    inclusions: ["Premium venue (hall + lawn)", "Themed grand decoration", "Flower mandap & phool ki chadar", "Multi-cuisine catering (500 guests)", "Live food counters", "Professional DJ + LED wall", "2 photographers + videographer", "Drone shoot + wedding film", "Bridal makeup & styling", "Mehndi artist", "Valet parking", "Generator backup", "Dedicated coordinator"],
    cover_image: null, images: [], is_popular: true, is_active: true, display_order: 2, created_at: "", updated_at: "",
  },
  {
    id: "3", name: "Diamond Package", slug: "diamond-wedding-package", tier: "diamond",
    tagline: "Ultra Luxury — Your Royal Wedding",
    description: "The Diamond Package is for couples who want nothing but the best. All-inclusive luxury wedding experience from pre-wedding shoots to bidai.",
    price: 699999, original_price: 899999,
    features: [
      { title: "5-Star Venue", desc: "Full 2-day booking of premium heritage/palace venue" },
      { title: "Royal Decoration", desc: "Celebrity designer decoration, imported flowers, crystal mandap, LED tunnels" },
      { title: "Gourmet Catering", desc: "7-course fine dining, live counters, midnight snacks for up to 1000 guests" },
      { title: "Entertainment", desc: "Celebrity DJ, live band, choreographer, fireworks" },
      { title: "Cinema Package", desc: "3 photographers, 2 videographers, pre-wedding shoot, wedding film, drone + jib" },
      { title: "Complete Styling", desc: "Bridal & groom makeover by celebrity stylist, family styling" },
      { title: "Hospitality", desc: "Guest welcome kits, hotel bookings, airport transfers" },
    ],
    inclusions: ["2-day premium venue booking", "Celebrity designer decoration", "Crystal/flower mandap + LED tunnels", "Gourmet catering (1000 guests)", "Multiple live food counters", "Celebrity DJ + live band", "Fireworks & sparklers", "3 photographers + 2 videographers", "Pre-wedding shoot", "Cinematic wedding film", "Drone + jib coverage", "Celebrity bridal makeover", "Groom styling + family makeover", "Mehndi + sangeet coordination", "Haldi ceremony setup", "Baraat arrangements (ghodi/car)", "Guest welcome kits", "Hotel booking assistance", "Airport/station transfers", "Dedicated wedding planner", "24/7 support team"],
    cover_image: null, images: [], is_popular: false, is_active: true, display_order: 3, created_at: "", updated_at: "",
  },
];

function PackageCard({ pkg, index }: { pkg: MarriagePackage; index: number }) {
  const config = tierConfig[pkg.tier] || tierConfig.custom;
  const Icon = config.icon;
  const discount = pkg.original_price ? Math.round(((pkg.original_price - pkg.price) / pkg.original_price) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.15, duration: 0.5 }}
      className={`relative bg-white rounded-3xl overflow-hidden border-2 ${config.borderColor} ${config.ring} shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col`}
    >
      {/* Popular Badge */}
      {pkg.is_popular && (
        <div className="absolute top-0 right-0 z-10">
          <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl flex items-center gap-1">
            <Star className="h-3 w-3 fill-white" /> MOST POPULAR
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`bg-gradient-to-r ${config.color} p-6 text-center text-white`}>
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-4">
          <Icon className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-bold mb-1">{pkg.name}</h3>
        <p className="text-sm opacity-90">{pkg.tagline}</p>
      </div>

      {/* Pricing */}
      <div className="p-6 text-center border-b border-gray-100">
        <div className="flex items-center justify-center gap-3 mb-1">
          {pkg.original_price && (
            <span className="text-lg text-gray-400 line-through">
              {formatPrice(pkg.original_price)}
            </span>
          )}
          {discount > 0 && (
            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {discount}% OFF
            </span>
          )}
        </div>
        <p className="text-4xl font-extrabold text-[var(--color-charcoal)]">
          {formatPrice(pkg.price)}
        </p>
        <p className="text-sm text-gray-500 mt-1">All inclusive</p>
      </div>

      {/* Features */}
      <div className="p-6 flex-1">
        <p className="text-sm text-gray-500 mb-4">{pkg.description}</p>
        <div className="space-y-3">
          {pkg.features.map((f, i) => (
            <div key={i} className="flex gap-3">
              <div className={`h-6 w-6 rounded-full ${config.bgColor} flex items-center justify-center shrink-0 mt-0.5`}>
                <Check className={`h-3.5 w-3.5 ${config.textColor}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{f.title}</p>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Inclusions */}
      <div className="px-6 pb-4">
        <details className="group">
          <summary className="text-xs font-medium text-gray-500 cursor-pointer hover:text-gray-700 flex items-center gap-1">
            <ArrowRight className="h-3 w-3 transition-transform group-open:rotate-90" />
            View all {pkg.inclusions.length} inclusions
          </summary>
          <div className="mt-3 grid grid-cols-1 gap-1">
            {pkg.inclusions.map((inc, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                <Check className="h-3 w-3 text-green-500 shrink-0" />
                {inc}
              </div>
            ))}
          </div>
        </details>
      </div>

      {/* CTA */}
      <div className="p-6 pt-2 mt-auto">
        <Link href={`/enquiry?package=${pkg.slug}`}>
          <Button className="w-full" size="lg">
            <Phone className="h-4 w-4" /> Book This Package
          </Button>
        </Link>
        <p className="text-[10px] text-gray-400 text-center mt-2">
          Customizable — Call us to personalize your package
        </p>
      </div>
    </motion.div>
  );
}

export function PricingCards({ packages }: { packages: MarriagePackage[] }) {
  const displayPackages = packages.length > 0 ? packages : demoPackages;

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Award className="h-5 w-5 text-[var(--color-primary)]" />
            <span className="text-sm font-medium text-[var(--color-primary)] uppercase tracking-wider">
              Wedding Packages
            </span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-[var(--color-charcoal)] mb-4">
            Choose Your <span className="text-gradient-gold">Dream Package</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Complete wedding solutions designed for Bhabua, Sasaram &amp; Kaimur region. Every package
            includes venue, catering, decoration, and entertainment — customizable to your needs.
          </p>
        </motion.div>

        {/* Package Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayPackages.map((pkg, i) => (
            <PackageCard key={pkg.id} pkg={pkg} index={i} />
          ))}
        </div>

        {/* Custom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <div className="bg-gradient-to-r from-[var(--color-primary)]/5 to-[var(--color-accent)]/5 rounded-3xl p-8 sm:p-12 border border-[var(--color-primary)]/10">
            <Sparkles className="h-8 w-8 text-[var(--color-primary)] mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-[var(--color-charcoal)] mb-2">
              Need a Custom Package?
            </h3>
            <p className="text-gray-500 mb-6 max-w-lg mx-auto">
              Every wedding is unique. Tell us your requirements and we&apos;ll create a personalized
              package tailored just for you — at the best price in the Bhabua &amp; Sasaram region.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="tel:+918000000000">
                <Button size="lg" variant="accent">
                  <Phone className="h-4 w-4" /> Call Now
                </Button>
              </a>
              <Link href="/enquiry">
                <Button size="lg" variant="outline">
                  Send Enquiry <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
