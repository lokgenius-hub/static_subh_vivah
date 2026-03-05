"use client";

import { motion } from "framer-motion";
import { Suspense } from "react";
import { SearchFilters } from "@/components/venue/search-filters";
import { Heart, MapPin, Star, Camera, Users, ArrowRight } from "lucide-react";
import Link from "next/link";

const popularSearches = [
  { label: "Banquet Halls", href: "/venues?type=banquet_hall" },
  { label: "Farmhouses", href: "/venues?type=farmhouse" },
  { label: "Resorts", href: "/venues?type=resort" },
  { label: "Lawns & Gardens", href: "/venues?type=lawn" },
  { label: "Heritage Venues", href: "/venues?type=heritage" },
];

const quickCategories = [
  { icon: MapPin, label: "Venues", count: "20+", href: "/venues", color: "bg-pink-50 text-pink-600" },
  { icon: Camera, label: "Photography", count: "Coming Soon", href: "/venues", color: "bg-purple-50 text-purple-600" },
  { icon: Star, label: "Packages", count: "3 Tiers", href: "/packages", color: "bg-amber-50 text-amber-600" },
  { icon: Users, label: "Reviews", count: "50+", href: "/testimonials", color: "bg-blue-50 text-blue-600" },
];

export function HeroSection() {
  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden">
      {/* Stunning background with parallax-feel */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-white" />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full pt-24 pb-12">
        <div className="max-w-3xl mx-auto text-center mb-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 bg-white/15 backdrop-blur-md border border-white/25 rounded-full text-white text-sm font-medium mb-6">
              <Heart className="h-4 w-4 text-pink-300 fill-pink-300" />
              #1 Wedding Platform in Kaimur &amp; Rohtas District
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-6"
          >
            Your Wedding,{" "}
            <span className="text-gradient-primary bg-clip-text" style={{ WebkitTextFillColor: "transparent", background: "linear-gradient(135deg, #F06292, #FF5722)", WebkitBackgroundClip: "text" }}>
              Your Way
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-gray-200 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Discover 20+ handpicked wedding venues in Bhabua, Sasaram, Mohania &amp; Kaimur.
            Book banquet halls, resorts &amp; farmhouses with real-time availability.
          </motion.p>
        </div>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="max-w-4xl mx-auto"
        >
          <Suspense fallback={<div className="h-20 bg-white/10 rounded-2xl animate-pulse" />}>
            <SearchFilters variant="hero" />
          </Suspense>
        </motion.div>

        {/* Popular Searches */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-2 mt-6"
        >
          <span className="text-white/60 text-sm">Popular:</span>
          {popularSearches.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm hover:bg-white/20 hover:text-white transition-all border border-white/10"
            >
              {s.label}
            </Link>
          ))}
        </motion.div>

        {/* Quick Category Cards — WedMeGood style */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-12 max-w-3xl mx-auto"
        >
          {quickCategories.map((cat, i) => (
            <Link
              key={cat.label}
              href={cat.href}
              className="group bg-white rounded-xl p-4 text-center shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <div className={`inline-flex p-2.5 rounded-lg ${cat.color} mb-2`}>
                <cat.icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold text-gray-800 group-hover:text-[var(--color-primary)] transition-colors">{cat.label}</p>
              <p className="text-xs text-gray-400">{cat.count}</p>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
