"use client";

import { motion } from "framer-motion";
import { Truck, Headphones, Store, Mail } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    desc: "Free doorstep delivery across your city for orders above ₹1000",
    bg: "bg-[#ecfdf5]",
  },
  {
    icon: Headphones,
    title: "Customer Service",
    desc: "Available on WhatsApp & calls from Monday to Saturday",
    bg: "bg-[#ecfdf5]",
  },
  {
    icon: Store,
    title: "COD Available",
    desc: "Cash on delivery and online payment options available",
    bg: "bg-[#ecfdf5]",
  },
  {
    icon: Mail,
    title: "Contact Us",
    desc: "Email us anytime or call for quick support",
    bg: "bg-[#ecfdf5]",
  },
];

export default function FeaturesSection() {
  return (
    <section className="w-full py-6 sm:py-8 md:py-10 lg:py-10 xl:py-14 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">

          {features.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl p-6 md:p-7 border border-gray-100 flex flex-col items-start"
            >
              {/* Icon */}
              <div
                className={`w-16 h-16 md:w-18 md:h-18 flex items-center justify-center rounded-full ${item.bg} mb-4`}
              >
                <item.icon size={26} className="text-gray-800" />
              </div>

              {/* Title */}
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-[#14532d] mb-2">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-xs sm:text-sm md:text-[15px] text-black leading-relaxed">
                {item.desc}
              </p>
            </motion.div>
          ))}

        </div>
      </div>
    </section>
  );
}