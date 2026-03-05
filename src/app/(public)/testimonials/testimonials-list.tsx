"use client";

import { motion } from "framer-motion";
import { Star, Quote, MapPin, Heart, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Testimonial } from "@/lib/types";

const demoTestimonials: Testimonial[] = [
  { id: "1", couple_name: "Priya & Rahul", location: "Bhabua", venue_name: "Kaimur Valley Lawns", event_date: null, rating: 5, text: "VivahSthal made our dream wedding in Bhabua come true! The venue was decorated beautifully and the mandap setup was beyond our expectations. Our families are still talking about it!", avatar_url: null, photo_url: null, is_featured: true, is_active: true, display_order: 1, created_at: "" },
  { id: "2", couple_name: "Sneha & Amit", location: "Sasaram", venue_name: "Shershah Heritage Hall", event_date: null, rating: 5, text: "Finding a perfect banquet hall in Sasaram was so easy with VivahSthal. The AI chatbot helped us compare prices and the availability calendar saved us weeks.", avatar_url: null, photo_url: null, is_featured: true, is_active: true, display_order: 2, created_at: "" },
  { id: "3", couple_name: "Anita & Vikash", location: "Mohania", venue_name: "Mohania Garden Resort", event_date: null, rating: 5, text: "We had a beautiful outdoor wedding at a gorgeous garden resort. VivahSthal's team coordinated everything with the vendor perfectly. Highly recommend!", avatar_url: null, photo_url: null, is_featured: true, is_active: true, display_order: 3, created_at: "" },
  { id: "4", couple_name: "Ritu & Manish", location: "Bhabua", venue_name: "Royal Bhabua Banquet", event_date: null, rating: 5, text: "The whole marriage package was excellent value. Catering, decoration, photography — everything was top-notch. Best wedding service in Bhabua!", avatar_url: null, photo_url: null, is_featured: true, is_active: true, display_order: 4, created_at: "" },
  { id: "5", couple_name: "Neha & Sanjay", location: "Chainpur", venue_name: "Chainpur Green Lawns", event_date: null, rating: 5, text: "VivahSthal helped us find an affordable lawn venue near Chainpur with all amenities. The enquiry process was smooth and we got instant responses.", avatar_url: null, photo_url: null, is_featured: true, is_active: true, display_order: 5, created_at: "" },
  { id: "6", couple_name: "Kavita & Deepak", location: "Sasaram", venue_name: "Grand Sasaram Palace", event_date: null, rating: 4, text: "Great experience booking through VivahSthal! The venue was exactly as shown in the photos. Our guests loved the heritage ambiance.", avatar_url: null, photo_url: null, is_featured: true, is_active: true, display_order: 6, created_at: "" },
];

function TestimonialCard({ t, index }: { t: Testimonial; index: number }) {
  const initials = t.couple_name.split(" & ").map(n => n[0]).join("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow relative group"
    >
      <Quote className="absolute top-4 right-4 h-10 w-10 text-[var(--color-primary)]/5 group-hover:text-[var(--color-primary)]/10 transition-colors" />

      {/* Avatar + Info */}
      <div className="flex items-center gap-4 mb-4">
        <div className="h-14 w-14 rounded-full bg-gradient-gold flex items-center justify-center text-white font-bold text-lg shrink-0">
          {initials}
        </div>
        <div>
          <p className="font-bold text-[var(--color-charcoal)] text-lg">{t.couple_name}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <MapPin className="h-3 w-3" />
            {t.location}
            {t.venue_name && <span className="text-[var(--color-primary)]">· {t.venue_name}</span>}
          </div>
        </div>
      </div>

      {/* Rating */}
      <div className="flex gap-0.5 mb-3">
        {Array.from({ length: t.rating }).map((_, j) => (
          <Star key={j} className="h-4 w-4 text-amber-400 fill-amber-400" />
        ))}
        {Array.from({ length: 5 - t.rating }).map((_, j) => (
          <Star key={`e-${j}`} className="h-4 w-4 text-gray-200" />
        ))}
      </div>

      {/* Text */}
      <p className="text-gray-600 leading-relaxed text-sm">&ldquo;{t.text}&rdquo;</p>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-gray-50 flex items-center gap-2">
        <Heart className="h-3.5 w-3.5 text-[var(--color-accent)]" />
        <span className="text-xs text-gray-400">Verified VivahSthal Customer</span>
      </div>
    </motion.div>
  );
}

export function TestimonialsList({ testimonials }: { testimonials: Testimonial[] }) {
  const display = testimonials.length > 0 ? testimonials : demoTestimonials;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
          {[
            { icon: Heart, num: "500+", label: "Happy Couples" },
            { icon: Star, num: "4.8★", label: "Average Rating" },
            { icon: Calendar, num: "1000+", label: "Events Managed" },
          ].map(({ icon: Icon, num, label }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="text-center p-4 rounded-2xl bg-white shadow-sm border border-gray-100"
            >
              <Icon className="h-5 w-5 text-[var(--color-primary)] mx-auto mb-2" />
              <p className="text-xl font-bold text-gradient-gold">{num}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </motion.div>
          ))}
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {display.map((t, i) => (
            <TestimonialCard key={t.id} t={t} index={i} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-gray-500 mb-4">Ready to write your own love story?</p>
          <div className="flex gap-3 justify-center">
            <Link href="/venues">
              <Button size="lg">
                Find Your Venue <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/packages">
              <Button size="lg" variant="outline">
                View Packages
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
