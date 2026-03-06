"use client";

import { useEffect, useState } from "react";
import { getTestimonials } from "@/lib/client-actions";
import { Testimonials } from "./testimonials";

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<{ couple_name: string; location: string; rating: number; text: string; venue_name: string | null }[]>([]);

  useEffect(() => {
    getTestimonials(true).then(setTestimonials).catch(() => {});
  }, []);

  return <Testimonials testimonials={testimonials} />;
}
