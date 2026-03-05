"use client";

import { motion } from "framer-motion";
import { MapPin, Building, Users, Star, Heart, Shield } from "lucide-react";

const stats = [
  { icon: Building, label: "Wedding Venues", value: "20+", color: "from-pink-500 to-rose-500" },
  { icon: MapPin, label: "Cities in Kaimur", value: "8+", color: "from-blue-500 to-indigo-500" },
  { icon: Heart, label: "Happy Couples", value: "200+", color: "from-red-500 to-pink-500" },
  { icon: Star, label: "Average Rating", value: "4.8", color: "from-amber-500 to-orange-500" },
  { icon: Shield, label: "Verified Venues", value: "100%", color: "from-green-500 to-emerald-500" },
  { icon: Users, label: "Expert Team", value: "24/7", color: "from-purple-500 to-violet-500" },
];

export function Stats() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center p-4"
            >
              <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${stat.color} mb-3 shadow-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <p className="text-2xl sm:text-3xl font-extrabold text-[var(--color-charcoal)]">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
