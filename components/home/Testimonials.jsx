"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const getTestimonials = (t) => [
  {
    name: t('testimonial_anita_name'),
    role: t('testimonial_anita_role'),
    image: "/review/review1.webp",
    content: t('testimonial_anita_content'),
    rating: 5,
  },
  {
    name: t('testimonial_rohan_name'),
    role: t('testimonial_rohan_role'),
    image: "/review/review2.webp",
    content: t('testimonial_rohan_content'),
    rating: 5,
  },
  {
    name: t('testimonial_priya_name'),
    role: t('testimonial_priya_role'),
    image: "/review/review3.webp",
    content: t('testimonial_priya_content'),
    rating: 5,
  },
  {
    name: t('testimonial_vikram_name'),
    role: t('testimonial_vikram_role'),
    image: "/review/review4.webp",
    content: t('testimonial_vikram_content'),
    rating: 4,
  },
];

export default function Testimonials() {
  const { t } = useLanguage();
  const testimonials = getTestimonials(t);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  return (
    // REDUCED: py-12/20/24 changed to py-8/12 for tighter vertical space
    <section className="w-full py-6 sm:py-8 md:py-10 lg:py-10 xl:py-14 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">

        {/* Header - Tightened margins */}
        <div className="flex justify-between items-end mb-6 md:mb-8">
          <div className="space-y-1">
            {/* <span className="text-xs font-black uppercase tracking-[0.2em] text-[#16a34a]">
              {t('kind_words')}
            </span> */}
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#14532d] leading-tight">
              {t('customer_experiences')}
            </h2>
          </div>

          {/* Navigation Arrows - Hidden on mobile, visible on tablet+ */}
          <div className="hidden sm:flex gap-2 mb-1">
            <button
              ref={prevRef}
              className="p-2 border border-green-100 rounded-full bg-white text-[#14532d] hover:bg-[#14532d] hover:text-white transition shadow-sm"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              ref={nextRef}
              className="p-2 border border-green-100 rounded-full bg-white text-[#14532d] hover:bg-[#14532d] hover:text-white transition shadow-sm"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Swiper - Responsive Breakpoints */}
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          spaceBetween={16}
          slidesPerView={1.2} // Show a peek of next slide on mobile
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          // pagination={{
          //   clickable: true,
          //   dynamicBullets: true,
          // }}
          onBeforeInit={(swiper) => {
            // @ts-ignore
            swiper.params.navigation.prevEl = prevRef.current;
            // @ts-ignore
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 12 },
            480: { slidesPerView: 2, spaceBetween: 12 },
            640: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1440: { slidesPerView: 4 },
          }}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          className="pb-20 md:pb-24 testimonial-swiper"
        >
          {testimonials.map((item, i) => (
            <SwiperSlide key={i} className="h-auto pb-2">
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-white border border-gray-100 rounded-[24px] p-5 md:p-6 shadow-sm hover:shadow-md transition-all h-full flex flex-col"
              >
                {/* Rating */}
                <div className="flex text-yellow-500 mb-3">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      size={14}
                      fill={index < item.rating ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth={2}
                    />
                  ))}
                </div>

                {/* Content - Optimized line-height */}
                <p className="text-gray-700 text-sm md:text-base leading-relaxed mb-5 flex-grow">
                  "{item.content}"
                </p>

                {/* User Info - Compact */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-50 mt-auto">
                  <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-green-50">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-[#14532d]">
                      {item.name}
                    </h4>
                    <p className="text-sm font-semibold uppercase tracking-wider text-[#16a34a]">
                      {item.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .testimonial-swiper .swiper-pagination-bullet-active {
          background: #16a34a !important;
        }
        .testimonial-swiper .swiper-pagination {
          bottom: -2px !important;
          z-index : 20;
        }
      `}</style>
    </section>
  );
}