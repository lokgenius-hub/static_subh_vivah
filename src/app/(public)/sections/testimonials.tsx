"use client";

import { motion } from "framer-motion";
import { Star, Quote, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";

// Fallback if no testimonials in DB
const fallbackTestimonials = [
  {
    couple_name: "Priya & Rahul",
    location: "Bhabua",
    rating: 5,
    text: "VivahSthal made our dream wedding in Bhabua come true! The venue was decorated beautifully and the mandap setup was beyond our expectations.",
    venue_name: "Sharda Palace",
  },
  {
    couple_name: "Sneha & Amit",
    location: "Sasaram",
    rating: 5,
    text: "Finding a perfect banquet hall was so easy with VivahSthal. The AI chatbot helped us compare prices and the availability calendar saved us weeks of phone calls.",
    venue_name: "Shail Rajendram Palace",
  },
  {
    couple_name: "Anita & Vikash",
    location: "Mohania",
    rating: 5,
    text: "We had a beautiful outdoor wedding at a gorgeous venue. VivahSthal's team coordinated everything with the vendor perfectly. Highly recommend!",
    venue_name: "Mohini Mahal",
  },
];

interface TestimonialData {
  couple_name: string;
  location: string;
  rating: number;
  text: string;
  venue_name: string | null;
}

export function Testimonials({ testimonials: dbTestimonials }: { testimonials?: TestimonialData[] }) {
  const testimonials = dbTestimonials && dbTestimonials.length > 0 ? dbTestimonials.slice(0, 3) : fallbackTestimonials;
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
          {testimonials.map((t, i) => {
            const initials = t.couple_name.split(" & ").map(n => n[0]).join("");
            return (
            <motion.div
              key={t.couple_name + i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="bg-gray-50 rounded-2xl p-6 relative hover:shadow-lg transition-shadow border border-gray-100"
            >
              <Quote className="absolute top-4 right-4 h-8 w-8 text-[var(--color-primary)]/10" />
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-[var(--color-charcoal)]">{t.couple_name}</p>
                  <p className="text-xs text-gray-500">{t.location}{t.venue_name ? ` · ${t.venue_name}` : ""}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
            </motion.div>
          );})}
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
