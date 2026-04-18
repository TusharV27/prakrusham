"use client";

import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight, Eye, Timer, ShoppingCart } from "lucide-react";
import ProductCard from "@/components/ProductCard";

import "swiper/css";
import "swiper/css/navigation";

const deals = [
  {
    name: "Organic Red Tomato",
    price: "₹45",
    oldPrice: "₹60",
    save: "₹15",
    image: "https://freshfarmse.com/wp-content/uploads/2025/04/OIP-61-460x460.jpeg",
    discount: "25% OFF",
    reviews: "No reviews yet",
  },
  {
    name: "Fresh Spinach (Palak)",
    price: "₹30",
    oldPrice: "₹40",
    save: "₹10",
    image: "https://bio-basket.com/cdn/shop/files/spinach-leaves-500x500-982e52f4-95e4-4020-8917-56e10256a661.webp?v=1754638727&width=400",
    discount: "20% OFF",
    reviews: "No reviews yet",
  },
  {
    name: "Golden Sweet Corn",
    price: "₹55",
    oldPrice: "₹75",
    save: "₹20",
    image: "https://bio-basket.com/cdn/shop/files/iStock-175592510_1.jpg?format=webp&v=1759999533&width=400",
    discount: "26% OFF",
    reviews: "No reviews yet",
  },
  {
    name: "Crunchy Carrots",
    price: "₹65",
    oldPrice: "₹90",
    save: "₹25",
    image: "https://bio-basket.com/cdn/shop/files/46.png?format=webp&v=1754638369&width=400",
    discount: "27% OFF",
    reviews: "No reviews yet",
  },
];

export default function DailyDeals() {
  const [time, setTime] = useState(36000);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [swiper, setSwiper] = useState(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (swiper && prevRef.current && nextRef.current) {
      swiper.params.navigation.prevEl = prevRef.current;
      swiper.params.navigation.nextEl = nextRef.current;
      swiper.navigation.init();
      swiper.navigation.update();
    }
  }, [swiper]);

  const formatTime = () => {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = time % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    // Reduced padding-top and bottom from py-20 to py-10
    <section className="w-full py-6 sm:py-8 md:py-10 lg:py-10 xl:py-14 bg-gradient-to-b from-white to-green-50/50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">

        {/* Header - More compact margin */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 md:mb-8 gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-lg bg-green-100/50 px-3 py-1.5 text-sm font-bold uppercase tracking-wider text-[#16a34a] border border-green-200/50">
              <Timer className="h-3.5 w-3.5" />
              Ends in: <span className="font-mono">{formatTime()}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#14532d]">
              Daily Deals
            </h2>
          </div>

          <div className="flex gap-2 shrink-0">
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

        {/* Slider */}
        <Swiper
          modules={[Navigation, Autoplay]}
          onSwiper={setSwiper}
          spaceBetween={16}
          slidesPerView={1.2}
          loop={true}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          breakpoints={{
            320: { slidesPerView: 1, spaceBetween: 12 },
            480: { slidesPerView: 2, spaceBetween: 12 },
            640: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1440: { slidesPerView: 5 },
          }}
          className="pb-2"
        >
          {deals.map((item, i) => (
            <SwiperSlide key={i} className="h-auto pb-2">
              <ProductCard product={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}