"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight, Crown, Star, Gem } from "lucide-react";
import Link from "next/link";

const tiers = [
  {
    name: "Silver",
    price: "₹1,50,000",
    icon: Star,
    color: "from-gray-400 to-gray-500",
    highlights: ["Venue Decoration", "Basic Catering (Veg)", "Photography"],
  },
  {
    name: "Golden",
    price: "₹3,50,000",
    icon: Crown,
    color: "from-amber-500 to-yellow-500",
    popular: true,
    highlights: ["Premium Decoration", "Multi-cuisine Catering", "Photo + Video", "DJ & Music"],
  },
  {
    name: "Diamond",
    price: "₹7,00,000",
    icon: Gem,
    color: "from-purple-500 to-indigo-500",
    highlights: ["Royal Decoration", "Luxury Catering", "Cinematic Video", "Live Band", "Fireworks"],
  },
];

export function PricingPreview() {
  return (
    <section className="py-20 bg-gradient-to-b from-[var(--color-cream)] to-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-charcoal)] mb-4">
            Wedding <span className="text-gradient-gold">Packages</span>
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            All-inclusive marriage packages — lawn, catering, photography &amp; decoration. 
            Starting from ₹1.5 Lakh in Bhabua, Sasaram &amp; surrounding areas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative bg-white rounded-2xl p-6 border ${
                tier.popular ? "border-[var(--color-primary)] shadow-lg scale-105" : "border-gray-100"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-gold text-white text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className={`inline-flex p-2 rounded-xl bg-gradient-to-br ${tier.color} mb-4`}>
                <tier.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-charcoal)]">{tier.name}</h3>
              <p className="text-2xl font-bold text-[var(--color-primary)] mt-1">{tier.price}</p>
              <p className="text-xs text-gray-400 mb-4">starting price</p>
              <ul className="space-y-2">
                {tier.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-2 text-sm text-gray-600">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    {h}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/packages"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-gold text-white font-medium hover:shadow-lg transition-shadow"
          >
            View All Packages <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
