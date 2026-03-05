"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Star, Quote, MapPin, Heart, Calendar, ArrowRight, Send, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitTestimonial } from "@/lib/actions";
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

      {/* ── Feedback / Testimonial Submission Form ── */}
      <FeedbackForm />
    </section>
  );
}

/* ─────── Public Feedback Form ─────── */
function FeedbackForm() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(5);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    fd.set("rating", String(selectedRating));

    startTransition(async () => {
      const res = await submitTestimonial(fd);
      setResult(res);
      if (res.success) form.reset();
    });
  }

  if (result?.success) {
    return (
      <div className="py-16 bg-gradient-to-br from-green-50 to-emerald-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mx-auto max-w-lg text-center px-4"
        >
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-[var(--color-charcoal)] mb-2">Thank You!</h3>
          <p className="text-gray-600 mb-6">{result.message}</p>
          <Button onClick={() => setResult(null)} variant="outline">Submit Another Review</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="py-16 bg-gradient-to-br from-[var(--color-cream)] to-amber-50/50">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-sm font-medium text-[var(--color-primary)] uppercase tracking-widest mb-2">
            Share Your Experience
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-charcoal)]">
            Tell Us About Your <span className="text-gradient-gold">Wedding</span>
          </h2>
          <p className="mt-3 text-gray-500 max-w-lg mx-auto">
            Your feedback helps other couples find their perfect venue. Submit a review and it will be
            published on our website automatically!
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 space-y-6"
        >
          {/* Couple Name */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-charcoal)] mb-1.5">
              Your Names <span className="text-red-400">*</span>
            </label>
            <Input name="couple_name" placeholder="e.g. Priya & Rahul" required />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-charcoal)] mb-1.5">
              City / Location <span className="text-red-400">*</span>
            </label>
            <Input name="location" placeholder="e.g. Bhabua, Sasaram" required />
          </div>

          {/* Venue Name (optional) */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-charcoal)] mb-1.5">
              Venue Name <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <Input name="venue_name" placeholder="e.g. Sharda Palace" />
          </div>

          {/* Star Rating */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-charcoal)] mb-2">
              Rating <span className="text-red-400">*</span>
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className="focus:outline-none transition-transform hover:scale-110"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setSelectedRating(star)}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      star <= (hoverRating || selectedRating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-200"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500 self-center">
                {selectedRating}/5
              </span>
            </div>
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-semibold text-[var(--color-charcoal)] mb-1.5">
              Your Review <span className="text-red-400">*</span>
            </label>
            <textarea
              name="text"
              rows={4}
              required
              placeholder="Share your wedding experience — how was the venue, service, food, decoration?"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 outline-none resize-none"
            />
          </div>

          {result && !result.success && (
            <p className="text-sm text-red-500">{result.message}</p>
          )}

          <Button type="submit" disabled={isPending} className="w-full" size="lg">
            {isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="h-4 w-4" /> Submit Your Review
              </span>
            )}
          </Button>

          <p className="text-xs text-center text-gray-400">
            Your review will be published on our website. By submitting, you agree to share your feedback publicly.
          </p>
        </motion.form>
      </div>
    </div>
  );
}
