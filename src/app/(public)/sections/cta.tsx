"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Phone } from "lucide-react";
import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary-dark)]/90 to-[var(--color-charcoal)]/85" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Heart className="h-10 w-10 text-pink-300 mx-auto mb-6 fill-pink-300/50" />
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
            Ready to Plan Your{" "}
            <span className="text-pink-200">Dream Wedding</span>?
          </h2>
          <p className="text-gray-200 text-lg mb-10 max-w-2xl mx-auto">
            Join 200+ happy couples in Bhabua, Sasaram &amp; Kaimur who found their perfect
            venue through VivahSthal. Your celebration deserves the best.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/venues">
              <Button size="xl" className="bg-white text-[var(--color-primary)] hover:bg-gray-100 font-bold shadow-xl">
                Explore Venues <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/enquiry">
              <Button variant="outline" size="xl" className="border-white/40 text-white hover:bg-white/10">
                <Phone className="h-5 w-5" /> Send Enquiry
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
