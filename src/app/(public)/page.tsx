import { Suspense } from "react";
import { HeroSection } from "./sections/hero";
import { FeaturedVenues } from "./sections/featured-venues";
import { HowItWorks } from "./sections/how-it-works";
import { VenueTypes } from "./sections/venue-types";
import { Stats } from "./sections/stats";
import { TestimonialsSection } from "./sections/testimonials-section";
import { CTASection } from "./sections/cta";
import { PricingPreview } from "./sections/pricing-preview";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <Stats />
      <Suspense fallback={<div className="h-96 animate-pulse bg-gray-100" />}>
        <FeaturedVenues />
      </Suspense>
      <VenueTypes />
      <PricingPreview />
      <HowItWorks />
      <Suspense fallback={<div className="h-64 animate-pulse bg-gray-50" />}>
        <TestimonialsSection />
      </Suspense>
      <CTASection />
    </>
  );
}
