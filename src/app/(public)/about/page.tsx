import Link from "next/link";
import { Heart, MapPin, Phone, Mail, Shield, Users, Calendar, Sparkles, Building2, Star } from "lucide-react";

export const metadata = {
  title: "About VivahSthal | #1 Wedding Platform in Kaimur & Rohtas",
  description:
    "VivahSthal is Kaimur & Rohtas district's premier wedding venue marketplace. 20+ verified venues in Bhabua, Sasaram, Mohania, Dehri & more.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[var(--color-charcoal)] via-[var(--color-charcoal)] to-[var(--color-primary-dark)] py-20 px-4 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-72 h-72 bg-[var(--color-primary)]/10 rounded-full blur-3xl" />
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full mb-6">
            <Heart className="h-4 w-4 text-pink-400 fill-pink-400" />
            <span className="text-sm text-pink-200">Kaimur &amp; Rohtas&apos;s #1 Wedding Platform</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
            About <span className="text-gradient-primary">VivahSthal</span>
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
            We are Kaimur &amp; Rohtas district&apos;s premium wedding venue marketplace —
            connecting families in Bhabua, Sasaram, Mohania, Dehri &amp; surrounding
            areas with their dream wedding venues. Our platform features AI-powered
            search, real-time availability, and dedicated support.
          </p>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-5xl px-4 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { icon: Building2, stat: "20+", label: "Verified Venues" },
            { icon: MapPin, stat: "8+", label: "Cities Covered" },
            { icon: Users, stat: "200+", label: "Happy Couples" },
            { icon: Star, stat: "4.8", label: "Average Rating" },
          ].map(({ icon: Icon, stat, label }) => (
            <div key={label}>
              <Icon className="h-6 w-6 text-[var(--color-primary)] mx-auto mb-2" />
              <p className="text-2xl font-extrabold text-[var(--color-charcoal)]">{stat}</p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Mission & Why Us */}
      <section className="section-padding px-4">
        <div className="mx-auto max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-extrabold text-[var(--color-charcoal)] mb-4">Our Mission</h2>
              <p className="text-gray-600 leading-relaxed">
                To simplify the wedding venue search for every family in Kaimur,
                Rohtas and surrounding districts. We believe every celebration
                deserves a perfect setting — from a grand banquet hall in Bhabua
                to a scenic riverside farmhouse in Mohania.
              </p>
              <p className="text-gray-600 leading-relaxed mt-4">
                We also bring destination wedding packages at beautiful tourist
                spots like Rohtasgarh Fort, Tutla Bhawani Temple, and the scenic
                Kaimur hills, making your special day truly unforgettable.
              </p>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-[var(--color-charcoal)] mb-4">Why Choose Us</h2>
              <ul className="space-y-3 text-gray-600">
                {[
                  "20+ verified venues across Kaimur & Rohtas",
                  "AI-powered search & smart recommendations",
                  "Real-time slot availability & booking",
                  "Dedicated support for every customer",
                  "Auspicious date (Shubh Muhurat) filtering",
                  "Destination wedding planning at tourist spots",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="h-6 w-6 rounded-full bg-pink-50 text-[var(--color-primary)] flex items-center justify-center text-xs shrink-0 mt-0.5">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Serving Areas */}
      <section className="section-padding px-4 bg-gray-50">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-2xl font-extrabold text-[var(--color-charcoal)] mb-3">Areas We Serve</h2>
          <p className="text-gray-500 mb-8">Find wedding venues in these cities and towns</p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Bhabua", "Sasaram", "Mohania", "Dehri-on-Sone", "Chainpur", "Bikramganj", "Rohtas", "Kudra"].map((city) => (
              <Link
                key={city}
                href={`/venues?city=${city}`}
                className="px-4 py-2 bg-white rounded-full border border-gray-200 text-sm text-gray-700 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] hover:shadow-md transition-all"
              >
                <MapPin className="inline h-3.5 w-3.5 mr-1" />
                {city}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="section-padding px-4 bg-white">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-extrabold text-[var(--color-charcoal)] mb-4">Contact Us</h2>
          <p className="text-gray-600 mb-8">
            Have questions? We&apos;d love to hear from you.
          </p>
          <div className="space-y-4 text-gray-600">
            <a href="mailto:support@vivahsthal.com" className="flex items-center gap-3 justify-center hover:text-[var(--color-primary)] transition-colors">
              <Mail className="h-5 w-5 text-[var(--color-primary)]" /> support@vivahsthal.com
            </a>
            <a href="tel:+918000000000" className="flex items-center gap-3 justify-center hover:text-[var(--color-primary)] transition-colors">
              <Phone className="h-5 w-5 text-[var(--color-primary)]" /> +91 800 000 0000
            </a>
            <p className="flex items-center gap-3 justify-center">
              <MapPin className="h-5 w-5 text-[var(--color-primary)]" /> Main Road, Bhabua, Kaimur, Bihar 821101
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
