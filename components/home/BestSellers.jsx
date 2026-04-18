"use client";

import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useData";

import "swiper/css";
import "swiper/css/navigation";

export default function BestSellers() {
  const { t } = useLanguage();
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const { products, isLoading: loading } = useProducts('limit=10');

  return (
    <section className="w-full py-6 sm:py-8 md:py-10 lg:py-10 xl:py-14 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            {/* <span className="text-xs font-black uppercase tracking-[0.25em] text-[#16a34a]">
              {t('everyday_needs')}
            </span> */}
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#14532d] leading-tight">
                {t('best_sellers')}
            </h2>
          </div>

          <div className="flex gap-1.5">
            <button
              ref={prevRef}
              className="p-2 border border-[#14532d]/10 rounded-full bg-white hover:bg-[#14532d] hover:text-white transition shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              ref={nextRef}
              className="p-2 border border-[#14532d]/10 rounded-full bg-white hover:bg-[#14532d] hover:text-white transition shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#14532d] animate-spin" />
          </div>
        ) : products.length > 0 ? (
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={12}
            slidesPerView={2.2}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onBeforeInit={(swiper) => {
              if (swiper.params.navigation && typeof swiper.params.navigation !== 'boolean') {
                swiper.params.navigation.prevEl = prevRef.current;
                swiper.params.navigation.nextEl = nextRef.current;
              }
            }}
            breakpoints={{
              320: { slidesPerView: 1, spaceBetween: 12 },
              480: { slidesPerView: 2, spaceBetween: 12 },
              640: { slidesPerView: 2, spaceBetween: 16 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
              1440: { slidesPerView: 5 },
            }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            className="pb-2"
          >
            {products.map((product) => (
              <SwiperSlide key={product.id} className="h-auto pb-2">
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="text-center py-20 bg-white rounded-[24px] border border-dashed border-[#14532d]/20">
            <p className="text-[#14532d]/60 font-medium tracking-wide">{t('best_sellers_soon')}</p>
          </div>
        )}
      </div>
    </section>
  );
}