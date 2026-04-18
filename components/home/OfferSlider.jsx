"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { getTranslated } from "@/utils/translation";

const getOffers = (t) => [
  {
    title: t('Prakritik Farming'),
    subtitle: t('Farm Fresh,Chemical-Free'),
    image: "offer/1.webp",
  },
  {
    title: t('Natural Vegetables'),
    subtitle: t('Freshness You Can Trust'),
    image: "offer/2.webp",
  },
  {
    title: t('Harvest Fresh Market Day'),
    subtitle: t('Fresh Picks Delivered Daily'),
    image: "offer/3.webp",
  },
  {
    title: t('Eat Healthy, Live Better'),
    subtitle: t('Daily Dose of Freshness'),
    image: "offer/4.webp",
  },
  {
    title: t('100% Fresh Vegetables'),
    subtitle: t('Healthy Choice for Every Family'),
    image: "offer/5.webp",
  },
  // {
  //   title: t('offer_organic_staples_title'),
  //   subtitle: t('offer_organic_staples_subtitle'),
  //   image: "https://theorganicworld.com/storage/app/public/banner/2026-04-03-69cfc4119b233.png",
  // },
];

export default function OfferSection() {
  const { t, language } = useLanguage();
  const [offers, setOffers] = useState(getOffers(t));
  const [active, setActive] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const gt = (field) => getTranslated(field, language);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/offers');
        const result = await res.json();
          if (result.success && result.data.banners.length > 0) {
          const dynamicBanners = result.data.banners.map(offer => ({
            title: gt(offer.name),
            subtitle: gt(offer.description),
            image: offer.images[0]?.url,
            slug: offer.slug,
            isDynamic: true
          }));
          setOffers(dynamicBanners);
        } else {
          setOffers(getOffers(t));
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
        setOffers(getOffers(t));
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanners();
  }, [language, t]);
  const tabRefs = useRef([]);
  const containerRef = useRef(null);

  // Auto change banner
  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % offers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Sync scroll for desktop tabs
  useEffect(() => {
    const container = containerRef.current;
    const activeTab = tabRefs.current[active];

    if (container && activeTab && window.innerWidth >= 768) {
      container.scrollTo({
        left: activeTab.offsetLeft - container.offsetWidth / 2 + activeTab.offsetWidth / 2,
        behavior: "smooth",
      });
    }
  }, [active]);

  return (
    <section className="w-full py-6 sm:py-8 md:py-10 lg:py-10 xl:py-14 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">

        {/* Banner Section */}
        <Link
          href={offers[active].slug ? `/offers/${offers[active].slug}` : "#"}
          className="relative w-full block aspect-[3/1] md:aspect-auto md:h-[240px] lg:h-[300px] rounded-xl sm:rounded-2xl overflow-hidden shadow-sm"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={offers[active].image}
              src={offers[active].image}
              className="absolute inset-0 w-full h-full object-fill md:object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            />
          </AnimatePresence>
        </Link>

        {/* Tabs Section - Hidden on Mobile */}
        <div
          ref={containerRef}
          className="hidden md:flex mt-3 bg-white rounded-xl shadow-sm overflow-x-auto no-scrollbar border border-gray-100"
        >
          {offers.map((item, i) => (
            <button
              key={i}
              ref={(el) => (tabRefs.current[i] = el)}
              onMouseEnter={() => setActive(i)}
              onClick={() => setActive(i)}
              className={`
                flex-1 
                min-w-[170px]
                px-4 
                py-3 
                text-left 
                transition-all 
                relative
                whitespace-nowrap
                ${active === i ? "bg-green-50/50" : "hover:bg-gray-50"}
              `}
            >
              <p className={`text-sm md:text-base font-bold transition-colors ${active === i ? "text-green-700" : "text-gray-800"}`}>
                {item.title}
              </p>
              <span className="text-xs text-gray-500 mt-0.5 block font-medium">
                {item.subtitle}
              </span>

              {active === i && (
                <motion.div 
                  layoutId="activeTabBorder"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-green-600"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}