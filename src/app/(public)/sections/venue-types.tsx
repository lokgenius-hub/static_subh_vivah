"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const types = [
  {
    label: "Banquet Halls",
    value: "banquet_hall",
    count: "8 Venues",
    image: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=400&q=80",
  },
  {
    label: "Farmhouses",
    value: "farmhouse",
    count: "5 Venues",
    image: "https://images.unsplash.com/photo-1510076857177-7470076d4098?w=400&q=80",
  },
  {
    label: "Hotels & Resorts",
    value: "resort",
    count: "4 Venues",
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
  },
  {
    label: "Lawns & Gardens",
    value: "lawn",
    count: "6 Venues",
    image: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=400&q=80",
  },
  {
    label: "Heritage Venues",
    value: "heritage",
    count: "3 Venues",
    image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?w=400&q=80",
  },
  {
    label: "Community Halls",
    value: "community_hall",
    count: "4 Venues",
    image: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=400&q=80",
  },
];

export function VenueTypes() {
  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-charcoal)] mb-3">
            Browse by <span className="text-gradient-primary">Venue Type</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Choose your perfect wedding setting from handpicked venues across Kaimur District
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
          {types.map((type, i) => (
            <motion.div
              key={type.value}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                href={`/venues?type=${type.value}`}
                className="group block relative h-48 sm:h-56 rounded-2xl overflow-hidden category-card"
              >
                <Image
                  src={type.image}
                  alt={type.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
                {/* Dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-base sm:text-lg">{type.label}</h3>
                  <p className="text-white/70 text-xs sm:text-sm">{type.count}</p>
                </div>
                {/* Pink hover accent */}
                <div className="absolute inset-0 bg-[var(--color-primary)]/0 group-hover:bg-[var(--color-primary)]/15 transition-colors duration-300" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
