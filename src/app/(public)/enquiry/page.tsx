import type { Metadata } from "next";
import { LeadForm } from "@/components/venue/lead-form";
import { Phone, Mail, MapPin, Clock, Shield, Heart } from "lucide-react";

export const metadata: Metadata = {
  title: "Send Enquiry — Book Your Wedding | VivahSthal Bhabua Sasaram",
  description:
    "Send an enquiry about wedding venues or packages in Bhabua, Sasaram & Kaimur region. Our team will respond within 30 minutes!",
};

export default function EnquiryPage() {
  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[var(--color-charcoal)] to-[#2D1B69] pt-24 pb-12 text-center text-white">
        <div className="mx-auto max-w-4xl px-4">
          <p className="text-sm font-medium text-amber-400 uppercase tracking-widest mb-3">
            We&apos;re Here to Help
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Send <span className="text-gradient-primary">Enquiry</span>
          </h1>
          <p className="text-gray-300 max-w-xl mx-auto">
            Tell us about your dream wedding and we&apos;ll get back to you within 30 minutes
            with the best venue &amp; package options.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-3 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-[var(--color-charcoal)] mb-6">Your Details</h2>
            <LeadForm inline trigger="contact" />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-[var(--color-charcoal)] mb-4">Contact Us Directly</h3>
              <div className="space-y-3">
                <a href="tel:+918000000000" className="flex items-center gap-3 text-sm text-gray-600 hover:text-[var(--color-primary)] transition-colors">
                  <div className="h-10 w-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-[var(--color-primary)]" />
                  </div>
                  +91 800 000 0000
                </a>
                <a href="mailto:support@vivahsthal.com" className="flex items-center gap-3 text-sm text-gray-600 hover:text-[var(--color-primary)] transition-colors">
                  <div className="h-10 w-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-[var(--color-primary)]" />
                  </div>
                  support@vivahsthal.com
                </a>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="h-10 w-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                    <MapPin className="h-4 w-4 text-[var(--color-primary)]" />
                  </div>
                  Bhabua, Kaimur, Bihar
                </div>
              </div>
            </div>

            {/* Promise Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
              <h3 className="font-bold text-[var(--color-charcoal)] mb-4">Our Promise</h3>
              <div className="space-y-3">
                {[
                  { icon: Clock, text: "Response within 30 minutes" },
                  { icon: Shield, text: "No hidden charges — transparent pricing" },
                  { icon: Heart, text: "Personalized wedding planning support" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm text-gray-700">
                    <Icon className="h-4 w-4 text-amber-600 shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>

            {/* WhatsApp CTA */}
            <a
              href="https://wa.me/918000000000?text=Hi%20VivahSthal!%20I%27m%20looking%20for%20a%20wedding%20venue."
              target="_blank"
              rel="noreferrer"
              className="block bg-green-500 hover:bg-green-600 text-white rounded-2xl p-5 text-center transition-colors"
            >
              <p className="font-bold text-lg mb-1">Chat on WhatsApp</p>
              <p className="text-sm text-white/80">Quick reply guaranteed</p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
