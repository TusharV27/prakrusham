"use client";

import React from "react";
import { motion } from "framer-motion";
import { Truck, Leaf, ShieldCheck, Heart } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export default function AboutHighlight() {
  const { t } = useLanguage();
  
  const features = [
    {
      icon: Leaf,
      title: t('feature_prakrutik_title'),
      desc: t('feature_prakrutik_desc'),
    },
    {
      icon: Truck,
      title: t('feature_farm_to_home_title'),
      desc: t('feature_farm_to_home_desc'),
    },
    {
      icon: ShieldCheck,
      title: t('feature_quality_title'),
      desc: t('feature_quality_desc'),
    },
    {
      icon: Heart,
      title: t('feature_farmer_first_title'),
      desc: t('feature_farmer_first_desc'),
    },
  ];

  return (
    // REDUCED: py-12/20 to py-6 (mobile) and py-10 (desktop)
    <section className="w-full py-6 sm:py-8 md:py-10 lg:py-10 xl:py-14 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">

        {/* Responsive Grid: Stacks on mobile, side-by-side from lg (laptop) up */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 items-center">

          {/* Left Visual Element */}
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden group">
            <img
              src="banners/banner1.webp"
              alt="Fresh Organic Produce"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>

          {/* Right Content Side */}
          <div className="flex flex-col">
            
            {/* Tag & Heading - Reduced margins and font sizes for a cleaner look */}
            <h2 className="text-2xl sm:text-3xl md:text-4xl text-[#14532d] font-black leading-tight">
              {t('mission_title')} <br/> 
              <span className="text-[#16a34a]">{t('mission_highlight')}</span>
            </h2>

            {/* Description - Optimized readability */}
            <p className="mt-3 text-sm md:text-base text-gray-600 leading-relaxed">
              {t('mission_desc')}
            </p>

            {/* Feature Cards Grid - 1 col on mobile, 2 col on tablet/desktop */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              {features.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-green-50/50 border border-green-100/50 rounded-xl p-4 flex items-start gap-3 hover:bg-white hover:shadow-md transition-all duration-300"
                >
                  <div className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg bg-[#14532d] text-white">
                    <item.icon size={18} />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#14532d]">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}