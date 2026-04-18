"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCategories } from "@/hooks/useData";
import Image from "next/image";
import { getTranslated } from "@/utils/translation";

import "swiper/css";
import "swiper/css/navigation";

export default function CategorySlider() {
  const { language, t } = useLanguage();
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [swiper, setSwiper] = useState(null);
  const { categories, isLoading: loading } = useCategories();

  const gt = (field) => getTranslated(field, language);

  useEffect(() => {
    if (swiper && prevRef.current && nextRef.current) {
      swiper.params.navigation.prevEl = prevRef.current;
      swiper.params.navigation.nextEl = nextRef.current;
      swiper.navigation.init();
      swiper.navigation.update();
    }
  }, [swiper]);

  return (
    <section className="w-full py-6 sm:py-8 md:py-10 lg:py-10 xl:py-14 bg-gradient-to-b from-green-50 to-white overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 relative">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 md:mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#14532d]">
            {t('shop_by_category')}
          </h2>

          <div className="flex gap-2">
            <button
              ref={prevRef}
              className="p-1.5 md:p-2 border border-[#14532d]/10 rounded-full bg-white hover:bg-[#14532d] hover:text-white transition-all duration-300 shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              ref={nextRef}
              className="p-1.5 md:p-2 border border-[#14532d]/10 rounded-full bg-white hover:bg-[#14532d] hover:text-white transition-all duration-300 shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="animate-spin text-[#14532d]" />
          </div>
        ) : categories.length > 0 ? (
          <Swiper
            modules={[Navigation, Autoplay]}
            onSwiper={setSwiper}
            spaceBetween={20}
            slidesPerView={2.2}
            grabCursor={true}
            loop={categories.length > 8} // Only loop if we have enough items
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
            }}
            breakpoints={{
              320: { slidesPerView: 3.5, spaceBetween: 10 },
              480: { slidesPerView: 4.5, spaceBetween: 15 },
              640: { slidesPerView: 4.5, spaceBetween: 16 },
              768: { slidesPerView: 5 },
              1024: { slidesPerView: 7 },
              1280: { slidesPerView: 8 },
            }}
            className="pb-2"
          >
            {categories.map((cat) => (
              <SwiperSlide key={cat.id} className="pt-4" >
                <Link href={`/category/${cat.slug}`} className="flex flex-col items-center group cursor-pointer">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full overflow-hidden shadow-sm border-2 border-transparent group-hover:border-[#14532d] group-hover:scale-110 transition-all duration-500 bg-white hover:shadow-lg">
                    <Image
                      src={cat.displayImage || cat.icon || cat.image || "/placeholder.png"}
                      alt={gt(cat.name)}
                      width={120}
                      height={120}
                      className="w-full h-full object-cover p-1 rounded-full"
                    />
                  </div>
                  <p className="mt-2 text-[10px] sm:text-[11px] md:text-xs font-semibold uppercase tracking-wider text-black group-hover:text-[#14532d] transition-colors text-center px-1">
                    {gt(cat.name)}
                  </p>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="text-center py-10">
            <p className="text-[#14532d]/50 italic">{t('exploring_collections')}</p>
          </div>
        )}

      </div>
    </section>
  );
}