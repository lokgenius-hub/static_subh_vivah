// Server component wrapper — fetches testimonials from DB and passes to client component
import { getTestimonials } from "@/lib/actions";
import { Testimonials } from "./testimonials";

export async function TestimonialsSection() {
  const testimonials = await getTestimonials(true);
  return <Testimonials testimonials={testimonials} />;
}
