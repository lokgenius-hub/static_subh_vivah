"use client";

import { motion } from "framer-motion";
import { Search, CalendarCheck, MessageCircle, PartyPopper } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Search Venues",
    description: "Browse 20+ verified venues in Bhabua, Sasaram & Kaimur with photos, pricing & reviews.",
    color: "from-pink-500 to-rose-500",
    step: "01",
  },
  {
    icon: CalendarCheck,
    title: "Check Availability",
    description: "View real-time slot availability. Filter by auspicious dates for your perfect muhurat.",
    color: "from-purple-500 to-indigo-500",
    step: "02",
  },
  {
    icon: MessageCircle,
    title: "Send Enquiry",
    description: "Connect directly with venue owners. Get instant quotes and negotiate the best deals.",
    color: "from-blue-500 to-cyan-500",
    step: "03",
  },
  {
    icon: PartyPopper,
    title: "Celebrate!",
    description: "Book your dream venue and celebrate your special day with your loved ones.",
    color: "from-amber-500 to-orange-500",
    step: "04",
  },
];

export function HowItWorks() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-charcoal)] mb-3">
            How <span className="text-gradient-primary">It Works</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            Book your dream wedding venue in 4 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
              className="relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all group"
            >
              <span className="absolute top-4 right-4 text-5xl font-extrabold text-gray-100 group-hover:text-pink-50 transition-colors select-none">
                {step.step}
              </span>
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${step.color} mb-4 shadow-md`}>
                <step.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-[var(--color-charcoal)] mb-2">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 border-t-2 border-dashed border-gray-200 z-10" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
