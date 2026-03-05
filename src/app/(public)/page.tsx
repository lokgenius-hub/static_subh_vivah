import { Suspense } from "react";
import { HeroSection } from "./sections/hero";
import { FeaturedVenues } from "./sections/featured-venues";
import { HowItWorks } from "./sections/how-it-works";
import { VenueTypes } from "./sections/venue-types";
import { Stats } from "./sections/stats";
import { Testimonials } from "./sections/testimonials";
import { CTASection } from "./sections/cta";
import { PricingPreview } from "./sections/pricing-preview";
import { getTestimonials } from "@/lib/actions";

export default async function HomePage() {
  const testimonials = await getTestimonials(true);

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
      <Testimonials testimonials={testimonials} />
      <CTASection />
    </>
  );
}
