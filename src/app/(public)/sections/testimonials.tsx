"use client";

import { motion } from "framer-motion";
import { Star, Quote, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";

const testimonials = [
  {
    name: "Priya & Arjun",
    location: "Bhabua",
    rating: 5,
    text: "VivahSthal made our venue search so easy! We found the perfect banquet hall in Bhabua within minutes. Our wedding was absolutely magical!",
    avatar: "PA",
    venue: "Kaimur Palace Banquet",
  },
  {
    name: "Sneha & Rohan",
    location: "Sasaram",
    rating: 5,
    text: "We found our dream farmhouse in Sasaram within minutes. The auspicious date filter was incredibly helpful for our traditional ceremony.",
    avatar: "SR",
    venue: "Sasaram Garden Resort",
  },
  {
    name: "Anita & Vikram",
    location: "Mohania",
    rating: 5,
    text: "The team helped us find a beautiful lawn venue in Mohania. They negotiated the best price. Best service in Kaimur district!",
    avatar: "AV",
    venue: "Mohania Riverside",
  },
];

export function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50 text-[var(--color-primary)] text-sm font-medium mb-4">
            <Heart className="h-4 w-4 fill-current" />
            Love Stories
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-charcoal)] mb-3">
            What Couples <span className="text-gradient-primary">Say</span>
          </h2>
          <p className="text-gray-500">
            Real reviews from real couples who celebrated with us
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="bg-gray-50 rounded-2xl p-6 relative hover:shadow-lg transition-shadow border border-gray-100"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-[var(--color-primary)]/10" />
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-charcoal)]">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.location} &middot; {t.venue}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/testimonials"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:underline"
          >
            Read all reviews <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
