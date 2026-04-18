"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Animated Counter Component
 */
function Counter({ value, direction = "up" }) {
  const ref = useRef(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
  });
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, value, isInView]);

  useEffect(() => {
    springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Intl.NumberFormat("en-US").format(
          Math.floor(latest)
        );
      }
    });
  }, [springValue]);

  return <span ref={ref} />;
}

export default function BannerFarmers() {
  const { t } = useLanguage();

  return (
    <section className="relative w-full aspect-[24/9] flex items-center overflow-hidden bg-black">
      {/* Background Image with Parallax-like feel */}
      <div className="absolute inset-0">
        <img
          src="banners/banner3.webp"
          alt="Gujarat Farmers"
          className="w-full h-full object-cover scale-105"
        />
        {/* Smarter Overlay: darker on left for text, clear on right for image visibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent md:via-black/40" />
      </div>

      {/* Content Container */}
      <div className="relative max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 w-full">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Tag */}
            {/* <span className="inline-flex items-center bg-[#16a34a] text-white text-[10px] md:text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-6 shadow-lg shadow-green-900/20">
              <span className="w-1.5 h-1.5 bg-white hidden sm:block rounded-full mr-2 animate-pulse" />
              {t('direct_impact') || "Direct Impact"}
            </span> */}

            {/* Heading */}
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white leading-[1.1] mb-8 ">
              {t('farmers_banner_title') || "Empowering Local Farmers"}
            </h2>

            {/* Stats Row */}
            <div className="hidden md:grid grid-cols-3 gap-4 sm:gap-8 md:gap-12 border-l-2 border-[#16a34a] pl-6 md:pl-8 py-2">
              {/* Stat 1 */}
              <div className="flex flex-col">
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white flex items-center">
                  <Counter value={500} />
                  <span className="ml-1">+</span>
                </div>
                <span className="text-white/60 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">
                  {t('farmers_label')}
                </span>
              </div>

              {/* Stat 2 */}
              <div className="flex flex-col">
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white flex items-center">
                  <Counter value={100} />
                  <span className="ml-1">%</span>
                </div>
                <span className="text-white/60 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">
                  {t('prakrutik_label')}
                </span>
              </div>

              {/* Stat 3 */}
              <div className="flex flex-col">
                <div className="text-2xl sm:text-3xl md:text-4xl font-black text-white flex items-center">
                  <Counter value={24} />
                  <span className="ml-1">h</span>
                </div>
                <span className="text-white/60 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">
                  {t('harvest_cycle') || t('farm_to_home_label')}
                </span>
              </div>
                

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}