"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Heart, Star, ArrowRight, Camera, Mountain,
  TreePine, Castle, Sun, Sparkles, Phone, Calendar,
} from "lucide-react";

const destinations = [
  {
    name: "Rohtasgarh Fort",
    tagline: "Heritage Grandeur",
    description:
      "Get married at one of India's most ancient hill forts. The panoramic views of the Kaimur range and Son River valley create a breathtaking backdrop for your wedding.",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
    highlights: ["Panoramic hilltop views", "Historical fort backdrop", "Sunset ceremonies"],
    icon: Castle,
    priceLabel: "From ₹3,50,000",
  },
  {
    name: "Tutla Bhawani Mandir",
    tagline: "Spiritual Bliss",
    description:
      "A sacred destination amidst the lush Kaimur hills. Perfect for couples who want their wedding blessed in a divine and serene atmosphere.",
    image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80",
    highlights: ["Temple wedding ceremonies", "Scenic hill surroundings", "Traditional rituals"],
    icon: Sparkles,
    priceLabel: "From ₹2,50,000",
  },
  {
    name: "Kaimur Hills & Wildlife",
    tagline: "Nature's Paradise",
    description:
      "Exchange vows surrounded by the breathtaking natural beauty of the Kaimur wildlife sanctuary — dense forests, waterfalls, and serene valleys.",
    image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=800&q=80",
    highlights: ["Forest-themed decor", "Waterfall photoshoots", "Wildlife sanctuary views"],
    icon: TreePine,
    priceLabel: "From ₹2,00,000",
  },
  {
    name: "Sasaram & Sher Shah Tomb",
    tagline: "Mughal Elegance",
    description:
      "Historic Sasaram offers the majestic Sher Shah Suri tomb as a stunning backdrop. The perfect blend of Mughal architecture and modern celebration.",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=800&q=80",
    highlights: ["Mughal architecture", "Grand lakeside setting", "Royal processions"],
    icon: Mountain,
    priceLabel: "From ₹3,00,000",
  },
  {
    name: "Son River Riverside",
    tagline: "Waterfront Romance",
    description:
      "Celebrate your love on the banks of the scenic Son River at Dehri-on-Sone. The sounds of flowing water and golden sunsets make it magical.",
    image: "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=800&q=80",
    highlights: ["Riverside mandap setup", "Sunset boat rides", "Open-air celebrations"],
    icon: Sun,
    priceLabel: "From ₹1,80,000",
  },
];

const packages = [
  {
    name: "Classic Destination",
    price: "₹2,00,000",
    features: [
      "Single destination venue",
      "Basic decoration & mandap",
      "Catering for 200 guests",
      "Photography (8 hrs)",
      "DJ & sound system",
      "Transportation arrangement",
    ],
  },
  {
    name: "Premium Destination",
    price: "₹4,50,000",
    popular: true,
    features: [
      "Choice of 2 destinations",
      "Premium decoration & lighting",
      "Catering for 400 guests",
      "Photography + Videography",
      "Live band + DJ",
      "Bridal makeup & styling",
      "Guest accommodation (2 nights)",
      "Haldi + Mehendi ceremony",
    ],
  },
  {
    name: "Royal Destination",
    price: "₹8,00,000+",
    features: [
      "All 5 destinations access",
      "Luxury themed decoration",
      "Catering for 500+ guests",
      "Cinematic wedding film",
      "Celebrity makeup artist",
      "Guest accommodation (3 nights)",
      "Full wedding events (5 ceremonies)",
      "Drone coverage + album",
      "Personal wedding planner",
    ],
  },
];

export default function DestinationWeddingsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1920&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[var(--color-charcoal)]" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full mb-6">
              <MapPin className="h-4 w-4 text-pink-400" />
              <span className="text-sm text-pink-200">Kaimur &amp; Rohtas Tourist Destinations</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 leading-tight">
              Destination Weddings in{" "}
              <span className="text-gradient-primary">Kaimur &amp; Sasaram</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
              Get married at the most stunning tourist places of Kaimur hills,
              Rohtasgarh Fort, and the historic towns of Rohtas district.
              Your dream destination wedding, close to home.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/enquiry">
                <Button size="xl" className="bg-gradient-primary text-white shadow-xl">
                  Plan Your Destination Wedding <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href="tel:+918000000000">
                <Button variant="outline" size="xl" className="border-white/40 text-white hover:bg-white/10">
                  <Phone className="h-5 w-5" /> Call Us Now
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Destinations Grid */}
      <section className="section-padding bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 bg-pink-50 px-4 py-1.5 rounded-full mb-4">
              <Heart className="h-4 w-4 text-[var(--color-primary)] fill-[var(--color-primary)]/30" />
              <span className="text-sm font-semibold text-[var(--color-primary)]">Top Destinations</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-charcoal)]">
              Stunning Locations for Your <span className="text-gradient-primary">Dream Wedding</span>
            </h2>
            <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
              Explore the most beautiful tourist spots in Kaimur &amp; Rohtas for your destination wedding
            </p>
          </div>

          <div className="space-y-10">
            {destinations.map((dest, i) => {
              const Icon = dest.icon;
              const isReverse = i % 2 !== 0;
              return (
                <motion.div
                  key={dest.name}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex flex-col ${isReverse ? "lg:flex-row-reverse" : "lg:flex-row"} gap-8 bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow`}
                >
                  {/* Image */}
                  <div className="relative lg:w-1/2 min-h-[300px]">
                    <Image
                      src={dest.image}
                      alt={dest.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-gradient-primary text-white text-sm font-bold px-3 py-1 rounded-full">
                        {dest.priceLabel}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="lg:w-1/2 p-6 lg:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="text-sm text-[var(--color-primary)] font-semibold uppercase tracking-wider">
                        {dest.tagline}
                      </span>
                    </div>
                    <h3 className="text-2xl font-extrabold text-[var(--color-charcoal)] mb-3">
                      {dest.name}
                    </h3>
                    <p className="text-gray-600 leading-relaxed mb-5">{dest.description}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {dest.highlights.map((h) => (
                        <span
                          key={h}
                          className="text-xs px-3 py-1 bg-pink-50 text-[var(--color-primary)] rounded-full font-medium"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                    <Link href="/enquiry">
                      <Button className="bg-gradient-primary text-white w-fit">
                        Plan Wedding Here <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Destination Packages */}
      <section className="section-padding bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-charcoal)]">
              Destination Wedding <span className="text-gradient-primary">Packages</span>
            </h2>
            <p className="mt-3 text-gray-500">All-inclusive packages crafted for Kaimur &amp; Rohtas destinations</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <motion.div
                key={pkg.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`relative rounded-2xl p-8 border ${
                  pkg.popular
                    ? "border-[var(--color-primary)] shadow-xl ring-2 ring-[var(--color-primary)]/20"
                    : "border-gray-200 shadow-md"
                } bg-white hover:shadow-xl transition-shadow`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary text-white text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold text-[var(--color-charcoal)] mb-2">{pkg.name}</h3>
                <p className="text-3xl font-extrabold text-[var(--color-primary)] mb-6">
                  {pkg.price}
                </p>
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="h-5 w-5 rounded-full bg-pink-50 text-[var(--color-primary)] flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href="/enquiry" className="block">
                  <Button
                    className={`w-full ${
                      pkg.popular
                        ? "bg-gradient-primary text-white"
                        : "bg-gray-100 text-[var(--color-charcoal)] hover:bg-gray-200"
                    }`}
                  >
                    Get Quote <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Destination Wedding CTA */}
      <section className="section-padding bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold text-[var(--color-charcoal)] mb-4">
            Why Choose a Destination Wedding in Kaimur?
          </h2>
          <p className="text-gray-500 max-w-3xl mx-auto mb-10">
            Forget expensive faraway destinations — Kaimur and Rohtas district offer
            stunning natural beauty, rich history, and affordable grandeur right at your doorstep.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Mountain, title: "Scenic Beauty", desc: "Kaimur hills, waterfalls & lush greenery" },
              { icon: Castle, title: "Historic Venues", desc: "Ancient forts & heritage architecture" },
              { icon: Camera, title: "Instagram Worthy", desc: "Picture-perfect wedding photo spots" },
              { icon: Calendar, title: "Budget Friendly", desc: "50% cheaper than metro destinations" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow text-center">
                <div className="h-12 w-12 bg-gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-bold text-[var(--color-charcoal)] mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/enquiry">
              <Button size="xl" className="bg-gradient-primary text-white shadow-lg">
                Start Planning Today <Heart className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
