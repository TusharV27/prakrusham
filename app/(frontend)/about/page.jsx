"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView, animate } from "framer-motion";
import { Leaf, Truck, Users, ShieldCheck, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

// --- CUSTOM COUNTER COMPONENT ---
function ScrollingNumber({ value }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (isInView) {
      // Parse numeric part (e.g., "12k+" -> 12, "4.9" -> 4.9)
      const numericValue = parseFloat(value.replace(/[^\d.]/g, ""));
      const isDecimal = value.includes(".");

      const controls = animate(0, numericValue, {
        duration: 2,
        ease: "easeOut",
        onUpdate: (latest) => {
          setDisplayValue(isDecimal ? latest.toFixed(1) : Math.floor(latest));
        },
      });

      return () => controls.stop();
    }
  }, [isInView, value]);

  // Extract non-numeric parts for the suffix (like "k+")
  const suffix = value.replace(/[\d.]/g, "");

  return (
    <span ref={ref}>
      {displayValue}
      {suffix}
    </span>
  );
}

const getFeatures = (t) => [
  { 
    title: t('about_healthy_products_title'), 
    desc: t('about_healthy_products_desc')
  },
  { 
    title: t('about_fresh_vegetables_title'), 
    desc: t('about_fresh_vegetables_desc')
  },
  { 
    title: t('about_dry_fruits_title'), 
    desc: t('about_dry_fruits_desc')
  },
  { 
    title: t('about_exotic_vegetables_title'), 
    desc: t('about_exotic_vegetables_desc')
  },
  { 
    title: t('about_seasonal_fruits_title'), 
    desc: t('about_seasonal_fruits_desc')
  },
  { 
    title: t('about_farm_mangoes_title'), 
    desc: t('about_farm_mangoes_desc')
  },
];

const getStats = (t) => [
  { n: "12k+", l: t('happy_deliveries') },
  { n: "45+", l: t('crop_variety') },
  { n: "800+", l: t('organic_acres') },
  { n: "4.9", l: t('customer_rating_label') },
];

export default function AboutPage() {
  const { t } = useLanguage();
  const features = getFeatures(t);
  const stats = getStats(t);
  return (
    <div className="bg-gradient-to-b from-green-50 to-white text-gray-800 overflow-hidden">
      
      {/* ================= HERO BANNER ================= */}
      {/* ================= HERO BANNER ================= */}
<div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-14">
  <div className="relative w-full overflow-hidden border border-[#14532d]/10">

    <img
      src="banners/about.webp"
      alt="About"
      className="w-full h-[120px] sm:h-auto object-cover block"
    />

    {/* Overlay */}
    <div className="absolute inset-0 bg-black/40" />

    {/* Content */}
    <div className="absolute inset-0 flex flex-col justify-center text-white px-6 sm:px-8 md:px-12 lg:px-16">

      <h1 className="text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-left">
        {t('our_story')}
      </h1>

      <div className="mt-3 inline-flex items-center w-fit gap-2 text-[10px] sm:text-[10px] font-black uppercase tracking-[0.2em] bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
        <Link href="/">{t('home')}</Link>
        <ChevronRight size={10} />
        <span className="text-emerald-400">{t('our_story')}</span>
      </div>

    </div>

  </div>
</div>

      {/* ================= FEATURE SECTION ================= */}
      <section className="py-8 sm:py-10 md:py-12 lg:py-10 xl:py-14">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 ">
          
          <div className="mb-14">
            <p className="text-[#16a34a] font-medium mb-2">
              {t('fresh_organic_products')}
            </p>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#14532d]">
              {t('bringing_fresh_fruits')}
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-10">
              {features.slice(0, 3).map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h4 className="text-base sm:text-lg md:text-xl font-semibold text-[#14532d] mb-2">{f.title}</h4>
                  <p className="text-black text-xs sm:text-sm md:text-base leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>

            {/* Center Image */}
            <div className="relative w-full h-[350px] md:h-[420px]">
              <img 
                src="banners/about_2nd.webp"
                alt="Organic Basket"
                className="object-cover rounded-2xl shadow-xl"
              />
            </div>

            {/* Right Content */}
            <div className="space-y-10">
              {features.slice(3, 6).map((f, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h4 className="text-base sm:text-lg md:text-xl font-semibold text-[#14532d] mb-2">{f.title}</h4>
                  <p className="text-black text-xs sm:text-sm md:text-base leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= CORE VALUES ================= */}
      <section className="bg-[#14532d] py-6 sm:py-8 md:py-10 lg:py-10 xl:py-14 text-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { icon: Leaf, title: t('natural_100'), desc: t('natural_100_desc') },
              { icon: Truck, title: t('fast_delivery'), desc: t('fast_delivery_desc') },
              { icon: Users, title: t('local_farmers'), desc: t('local_farmers_desc') },
              { icon: ShieldCheck, title: t('quality_check'), desc: t('quality_check_desc') },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-left"
              >
                <div className="mb-4">
                  <item.icon size={32} className="text-green-300"/>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-green-100 text-xs sm:text-sm md:text-base">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= STATS (SCROLLING NUMBERS) ================= */}
      <section className="py-6 sm:py-8 md:py-10 lg:py-10 xl:py-14 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-10">
            {stats.map((s, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-left"
              >
                <h3 className="text-2xl md:text-3xl font-bold text-[#14532d] mb-2">
                  <ScrollingNumber value={s.n} />
                </h3>
                <p className="text-black text-[10px] sm:text-xs md:text-sm lg:text-base font-semibold uppercase tracking-widest">
                  {s.l}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}