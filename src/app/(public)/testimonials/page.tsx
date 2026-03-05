import { Suspense } from "react";
import { getTestimonials } from "@/lib/actions";
import type { Metadata } from "next";
import { TestimonialsList } from "./testimonials-list";

export const metadata: Metadata = {
  title: "Testimonials — Happy Couples | VivahSthal Bhabua Sasaram",
  description:
    "Read real reviews from couples who celebrated their dream wedding with VivahSthal in Bhabua, Sasaram & across Kaimur district. 500+ happy families and counting!",
  keywords: [
    "wedding reviews Bhabua", "marriage testimonials Sasaram",
    "wedding venue reviews Bihar", "VivahSthal reviews",
    "happy couples Kaimur", "best wedding service Bihar",
  ],
};

async function TestimonialsContent() {
  const testimonials = await getTestimonials();
  return <TestimonialsList testimonials={testimonials} />;
}

export default function TestimonialsPage() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[var(--color-charcoal)] to-[#2D1B69] pt-24 pb-16 text-center text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-rose-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-amber-400 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4">
          <p className="text-sm font-medium text-amber-400 uppercase tracking-widest mb-3">
            Real Stories, Real Love
          </p>
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-4">
            What Couples <span className="text-gradient-primary">Say</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Hear from families who found their perfect wedding venue through VivahSthal
            in Bhabua, Sasaram &amp; the Kaimur region.
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100" />}>
        <TestimonialsContent />
      </Suspense>
    </div>
  );
}
