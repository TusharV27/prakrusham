"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

const getSlides = (t) => [
  {
    desktop: "/D1.webp",
    mobile: "/M1.webp",
    // sub: t('hero_slide1_sub'),
    title: t('hero_slide1_title'),
    highlight: t('hero_slide1_highlight'),
  },
  {
    desktop: "/D2.webp",
    mobile: "/M2.webp",
    // sub: t('hero_slide2_sub'),
    title: t('hero_slide2_title'),
    highlight: t('hero_slide2_highlight'),
  },
  {
    desktop: "/D3.webp",
    mobile: "/M3.webp",
    // sub: t('hero_slide3_sub'),
    title: t('hero_slide3_title'),
    highlight: t('hero_slide3_highlight'),
  },
];

export default function HeroSection() {
  const { t } = useLanguage();
  const slides = getSlides(t);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 1024);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const currentImage = isMobile ? slides[currentIndex].mobile : slides[currentIndex].desktop;

  return (
    <section className="relative h-[85vh] md:h-screen w-full overflow-hidden bg-gray-50">
      {/* Background Images */}
      <div className="absolute inset-0">
        <AnimatePresence mode="wait">
         <motion.img
  key={currentImage}
  src={currentImage}
  alt="Hero Background"
  className="absolute inset-0 w-full h-full object-cover object-center sm:object-center md:object-center lg:object-center"
  initial={{ opacity: 0, scale: 1.05 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 1.2, ease: "easeOut" }}
/>
        </AnimatePresence>
      </div>

      {/* Modern Soft Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/40 to-transparent md:from-white/90" />

      {/* Content Wrapper */}
      <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
              }}
              className="max-w-xl md:max-w-2xl"
            >
              {/* Animated Subheading */}
              <motion.span
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0 },
                }}
                className="inline-block text-sm md:text-xs font-black uppercase tracking-[0.3em] text-green-700 mb-3"
              >
                {slides[currentIndex].sub}
              </motion.span>

              {/* Animated Main Title */}
              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight"
              >
                {slides[currentIndex].title}
                <span className="block text-green-600 drop-shadow-sm">
                  {slides[currentIndex].highlight}
                </span>
              </motion.h1>

              {/* Animated Description */}
              {slides[currentIndex].desc && (
                <motion.p
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="mt-4 md:mt-6 text-sm md:text-base text-gray-900 leading-relaxed max-w-md font-medium"
                >
                  {slides[currentIndex].desc}
                </motion.p>
              )}

              {/* Buttons with Hover Effects */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="mt-6 md:mt-8 flex flex-wrap gap-2.5 sm:gap-3"
              >
                <Link
                  href="/category/natural-vegetables"
                  className="px-6 py-2.5 sm:px-7 sm:py-3 md:px-9 md:py-3.5 bg-[#14532d] text-white rounded-full text-[10px] sm:text-[11px] md:text-xs font-black uppercase tracking-widest hover:-translate-y-1 transition-all duration-300"
                >
                  {t('shop_now')}
                </Link>

                <Link
                  href="/about"
                  className="px-6 py-2.5 sm:px-7 sm:py-3 md:px-9 md:py-3.5 border-2 border-[#14532d] text-[#14532d] rounded-full text-[10px] sm:text-[11px] md:text-xs font-black uppercase tracking-widest hover:bg-[#14532d] hover:text-white hover:-translate-y-1 transition-all duration-300"
                >
                  {t('learn_more')}
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Pagination: Perfect Circular Dots */}
      

      {/* Pagination: Perfect Circular Dots */}
<div className="absolute bottom-10 left-0 w-full">
  <div className="mx-auto max-w-[1400px] px-4 sm:px-6 flex items-center gap-3">
    {slides.map((_, index) => (
      <button
        key={index}
        onClick={() => setCurrentIndex(index)}
        className="group relative flex items-center justify-center h-6 w-6"
      >
        {currentIndex === index && (
          <motion.span 
            layoutId="activeDot"
            className="absolute inset-0 border-2 border-green-600 rounded-full"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}

        <span
          className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
            currentIndex === index 
              ? "bg-green-600 scale-125" 
              : "bg-gray-400 group-hover:bg-green-300"
          }`}
        />
      </button>
    ))}
  </div>
</div>
      
      {/* Decorative vertical line */}
      <div className="absolute bottom-0 right-12 hidden lg:block w-px h-24 bg-gradient-to-t from-green-600 to-transparent" />
    </section>
  );
}