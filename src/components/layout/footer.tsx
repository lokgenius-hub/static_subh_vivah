import Link from "next/link";
import {
  Heart, MapPin, Phone, Mail,
  Instagram, Facebook, Twitter, Youtube,
} from "lucide-react";

const footerLinks = {
  "Popular Cities": [
    { label: "Wedding Venues in Bhabua", href: "/venues?city=Bhabua" },
    { label: "Wedding Venues in Sasaram", href: "/venues?city=Sasaram" },
    { label: "Wedding Venues in Mohania", href: "/venues?city=Mohania" },
    { label: "Wedding Venues in Chainpur", href: "/venues?city=Chainpur" },
    { label: "Wedding Venues in Dehri", href: "/venues?city=Dehri" },
    { label: "Wedding Venues in Bikramganj", href: "/venues?city=Bikramganj" },
  ],
  "Venue Types": [
    { label: "Banquet Halls", href: "/venues?type=banquet_hall" },
    { label: "Farmhouses", href: "/venues?type=farmhouse" },
    { label: "Resorts & Hotels", href: "/venues?type=resort" },
    { label: "Lawns & Gardens", href: "/venues?type=lawn" },
    { label: "Heritage Venues", href: "/venues?type=heritage" },
    { label: "Convention Centers", href: "/venues?type=convention_center" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Wedding Packages", href: "/packages" },
    { label: "Testimonials", href: "/testimonials" },
    { label: "Success Stories", href: "/stories" },
    { label: "Blog & Wedding Tips", href: "/blog" },
    { label: "List Your Venue", href: "/partner-register" },
  ],
};

/* ─── Schema.org JSON-LD ─────────────────────────────────── */
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "VivahSthal",
  url: "https://www.vivahsthal.com",
  logo: "https://www.vivahsthal.com/logo.png",
  description:
    "Bihar's premium wedding venue marketplace serving Bhabua, Sasaram, Kaimur, Rohtas and surrounding areas. Find banquet halls, resorts, farmhouses and lawn venues with AI-powered search and real-time availability.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Bhabua",
    addressRegion: "Bihar",
    addressCountry: "IN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: "support@vivahsthal.com",
  },
  sameAs: [
    "https://www.instagram.com/vivahsthal",
    "https://www.facebook.com/vivahsthal",
    "https://twitter.com/vivahsthal",
    "https://www.youtube.com/@vivahsthal",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "VivahSthal",
  url: "https://www.vivahsthal.com",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://www.vivahsthal.com/venues?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export function Footer() {
  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <footer className="bg-[var(--color-charcoal)] text-white">
        {/* SEO Keyword-Rich Strip */}
        <div className="border-b border-gray-800">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-xs text-gray-500 leading-relaxed max-w-4xl mx-auto">
              VivahSthal is Kaimur &amp; Rohtas&apos;s #1 wedding venue booking platform — find{" "}
              <Link href="/venues?type=banquet_hall" className="hover:text-[var(--color-primary-light)] hover:underline underline-offset-2">banquet halls</Link>,{" "}
              <Link href="/venues?type=farmhouse" className="hover:text-[var(--color-primary-light)] hover:underline underline-offset-2">farmhouses</Link>,{" "}
              <Link href="/venues?type=resort" className="hover:text-[var(--color-primary-light)] hover:underline underline-offset-2">wedding resorts</Link>,{" "}
              <Link href="/venues?type=lawn" className="hover:text-[var(--color-primary-light)] hover:underline underline-offset-2">lawn &amp; garden venues</Link> and{" "}
              <Link href="/venues?type=heritage" className="hover:text-[var(--color-primary-light)] hover:underline underline-offset-2">heritage havelis</Link> in{" "}
              <Link href="/venues?city=Bhabua" className="hover:text-[var(--color-primary-light)] hover:underline underline-offset-2">Bhabua</Link>,{" "}
              <Link href="/venues?city=Sasaram" className="hover:text-[var(--color-primary-light)] hover:underline underline-offset-2">Sasaram</Link>,{" "}
              <Link href="/venues?city=Mohania" className="hover:text-[var(--color-primary-light)] hover:underline underline-offset-2">Mohania</Link>,{" "}
              <Link href="/venues?city=Chainpur" className="hover:text-[var(--color-primary-light)] hover:underline underline-offset-2">Chainpur</Link>,{" "}
              <Link href="/venues?city=Dehri" className="hover:text-[var(--color-primary-light)] hover:underline underline-offset-2">Dehri-on-Sone</Link> and across Bihar.
              Compare prices, check real-time availability, browse{" "}
              <Link href="/packages" className="hover:text-[var(--color-primary-light)] hover:underline underline-offset-2">wedding packages</Link> and book your perfect shaadi venue in minutes.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          {/* Top Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-2" aria-label="VivahSthal Home">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <span className="text-xl font-bold">
                  <span className="text-gradient-primary">Vivah</span>
                  <span className="text-white">Sthal</span>
                </span>
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
                Kaimur &amp; Rohtas&apos;s premium wedding venue marketplace. Find the perfect
                banquet hall, farmhouse or lawn for your dream shaadi in Bhabua, Sasaram,
                Mohania, Chainpur and surrounding areas.
              </p>

              {/* Contact Info */}
              <div className="space-y-2 pt-1">
                <a href="mailto:support@vivahsthal.com" className="flex items-center gap-2 text-xs text-gray-500 hover:text-[var(--color-primary-light)] transition-colors">
                  <Mail className="h-3.5 w-3.5" /> support@vivahsthal.com
                </a>
                <a href="tel:+918000000000" className="flex items-center gap-2 text-xs text-gray-500 hover:text-[var(--color-primary-light)] transition-colors">
                  <Phone className="h-3.5 w-3.5" /> +91 800 000 0000
                </a>
                <p className="flex items-center gap-2 text-xs text-gray-500">
                  <MapPin className="h-3.5 w-3.5 shrink-0" /> Main Road, Bhabua, Kaimur, Bihar 821101
                </p>
              </div>

              {/* Social Icons */}
              <div className="flex items-center gap-3 pt-1">
                <a href="https://instagram.com/vivahsthal" target="_blank" rel="noreferrer"
                  aria-label="VivahSthal Instagram"
                  className="text-gray-400 hover:text-pink-400 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://facebook.com/vivahsthal" target="_blank" rel="noreferrer"
                  aria-label="VivahSthal Facebook"
                  className="text-gray-400 hover:text-blue-400 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://twitter.com/vivahsthal" target="_blank" rel="noreferrer"
                  aria-label="VivahSthal Twitter"
                  className="text-gray-400 hover:text-sky-400 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://youtube.com/@vivahsthal" target="_blank" rel="noreferrer"
                  aria-label="VivahSthal YouTube"
                  className="text-gray-400 hover:text-red-500 transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Links */}
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-semibold text-white mb-4 tracking-wider uppercase">
                  {title}
                </h3>
                <ul className="space-y-2.5">
                  {links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-400 hover:text-[var(--color-primary-light)] transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="mt-12 py-6 border-t border-b border-gray-800 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { stat: "20+", label: "Verified Venues" },
              { stat: "200+", label: "Happy Couples" },
              { stat: "8+ Cities", label: "Kaimur & Rohtas" },
              { stat: "4.8 ★", label: "Average Rating" },
            ].map(({ stat, label }) => (
              <div key={label}>
                <p className="text-lg font-bold text-gradient-primary">{stat}</p>
                <p className="text-xs text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Bottom Bar */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} VivahSthal — Wedding Venue Marketplace. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-[var(--color-accent)] fill-current" /> in Bihar, India
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
