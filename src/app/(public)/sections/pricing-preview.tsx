"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Crown, Star, Gem } from "lucide-react";
import Link from "next/link";

const tiers = [
  {
    name: "Silver",
    price: "₹1,50,000",
    icon: Star,
    gradient: "from-gray-400 to-gray-500",
    bg: "bg-gray-50",
    popular: false,
    highlights: ["Venue Decoration", "Basic Catering (Veg)", "Photography", "Sound System"],
  },
  {
    name: "Golden",
    price: "₹3,50,000",
    icon: Crown,
    gradient: "from-[var(--color-primary)] to-[var(--color-primary-dark)]",
    bg: "bg-pink-50",
    popular: true,
    highlights: ["Premium Decoration", "Multi-cuisine Catering", "Photo + Video", "DJ & Music", "Bridal Makeup"],
  },
  {
    name: "Diamond",
    price: "₹7,00,000",
    icon: Gem,
    gradient: "from-purple-500 to-indigo-500",
    bg: "bg-purple-50",
    popular: false,
    highlights: ["Royal Decoration", "Luxury 5-Star Catering", "Cinematic Film", "Live Band", "Fireworks", "Destination Add-on"],
  },
];

export function PricingPreview() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-charcoal)] mb-3">
            Wedding <span className="text-gradient-primary">Packages</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            All-inclusive marriage packages with venue, catering, photography &amp; decoration.
            Starting from ₹1.5 Lakh in Bhabua, Sasaram &amp; Kaimur.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 border-2 transition-all hover:shadow-xl ${
                tier.popular
                  ? "border-[var(--color-primary)] shadow-lg scale-[1.03] bg-white"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-primary text-white text-xs font-bold px-5 py-1.5 rounded-full shadow-md">
                  Most Popular
                </div>
              )}
              <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${tier.gradient} mb-4 shadow-md`}>
                <tier.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-charcoal)]">{tier.name}</h3>
              <p className="text-3xl font-extrabold text-[var(--color-primary)] mt-2">{tier.price}</p>
              <p className="text-xs text-gray-400 mb-5">starting price</p>
              <ul className="space-y-2.5 mb-6">
                {tier.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2.5 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
              <Link
                href="/packages"
                className={`block text-center py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  tier.popular
                    ? "bg-gradient-primary text-white hover:shadow-lg"
                    : "border border-gray-200 text-gray-700 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                }`}
              >
                View Details
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-gradient-primary text-white font-semibold hover:shadow-lg transition-shadow"
          >
            View All Packages <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
