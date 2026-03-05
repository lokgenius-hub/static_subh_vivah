import { Suspense } from "react";
import { getMarriagePackages } from "@/lib/actions";
import { PricingCards } from "../sections/pricing-cards";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wedding Packages & Pricing — Silver, Golden, Diamond | VivahSthal Bhabua Sasaram",
  description:
    "Affordable all-inclusive marriage packages in Bhabua, Sasaram & Kaimur region. Silver, Golden & Diamond packages with venue, catering, decoration, photography & entertainment. Book your dream wedding today!",
  keywords: [
    "wedding package Bhabua", "marriage package Sasaram",
    "wedding price Bihar", "shaadi package", "vivah package",
    "banquet hall package", "lawn booking Bhabua",
    "wedding catering Sasaram", "marriage decoration Kaimur",
    "affordable wedding Bihar",
  ],
  openGraph: {
    title: "Wedding Packages — VivahSthal | Bhabua & Sasaram",
    description: "All-inclusive wedding packages starting at ₹1.5 Lakh. Venue + Catering + Decoration + Photography.",
  },
};

async function PackagesContent() {
  const packages = await getMarriagePackages();
  return <PricingCards packages={packages} />;
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[var(--color-charcoal)] to-[#2D1B69] pt-24 pb-16 text-center text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-amber-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4">
          <p className="text-sm font-medium text-amber-400 uppercase tracking-widest mb-3">
            Transparent Pricing
          </p>
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-4">
            Wedding <span className="text-gradient-gold">Packages</span>
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            All-inclusive marriage packages designed for Bhabua, Sasaram &amp; the Kaimur region.
            No hidden costs — venue, catering, decoration, photography &amp; entertainment all included.
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100" />}>
        <PackagesContent />
      </Suspense>

      {/* Trust Section */}
      <section className="py-12 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { num: "500+", label: "Weddings Completed" },
              { num: "100%", label: "Transparent Pricing" },
              { num: "4.8★", label: "Average Rating" },
              { num: "24/7", label: "Support Available" },
            ].map(({ num, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-gradient-gold">{num}</p>
                <p className="text-sm text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
