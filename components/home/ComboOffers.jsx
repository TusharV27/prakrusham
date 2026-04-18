"use client";

import React, { useRef, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useWishlist } from "@/context/WishlistContext";
import AddToCartIcon from "@/components/icons/AddToCartIcon";

// Swiper Styles
import "swiper/css";
import "swiper/css/navigation";

const combos = [
  {
    id: "fruits-combo",
    title: "FRUITS COMBO", // This is uppercase for fallback
    items: ["apple", "mango", "banana", "orange"],
    price: "₹405",
    oldPrice: "₹420",
    savings: "₹15 OFF",
    image: "https://theorganicworld.com/storage/app/public/product/2024-03-24-65fffde385e05.png",
    slug: "fruits-combo"
  }
];

const ComboOffers = () => {
  const { addToCart } = useCart();
  const { language, t } = useLanguage();
  const { toggleWishlist, isFavorited } = useWishlist();
  
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const [displayCombos, setDisplayCombos] = useState(combos);

  const handleAddToCart = (e, combo) => {
    e.preventDefault();
    e.stopPropagation();
    const cleanPrice = Number(String(combo.price).replace(/[^0-9.]/g, "")) || 0;
    
    addToCart({
      ...combo,
      id: combo.id || combo.slug,
      name: combo.title,
      price: cleanPrice,
      quantity: 1,
      image: combo.image,
    });
  };

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const res = await fetch('/api/offers');
        const data = await res.json();
        if (data.success && data.data.combos?.length > 0) {
          const mapped = data.data.combos.map(c => ({
            id: c.id,
            title: typeof c.name === 'object' ? (c.name[language] || c.name.en).toUpperCase() : c.name.toUpperCase(),
            items: c.products.map(p => typeof p.name === 'object' ? (p.name[language] || p.name.en).toLowerCase() : p.name.toLowerCase()),
            price: `₹${Math.round(c.discountType === 'PERCENTAGE' ? c.products.reduce((acc, p) => acc + p.price, 0) * (1 - c.value/100) : c.products.reduce((acc, p) => acc + p.price, 0) - c.value)}`,
            oldPrice: `₹${c.products.reduce((acc, p) => acc + p.price, 0)}`,
            savings: c.discountType === 'PERCENTAGE' ? `${c.value}% OFF` : `₹${c.value} OFF`,
            image: c.images[0]?.url || "https://theorganicworld.com/storage/app/public/product/2024-03-24-65fffde385e05.png",
            slug: c.slug
          }));
          setDisplayCombos(mapped);
        }
      } catch (err) { console.error("Failed to fetch combos", err); }
    };
    fetchCombos();
  }, [language]);

  return (
    <section className="py-6 sm:py-8 md:py-10 lg:py-10 xl:py-14 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div className="space-y-0.5">
            {/* <span className="text-[#16a34a] font-bold uppercase text-sm tracking-[0.2em]  block">
              {t('exclusive_combos') || t('farmers_selection') || "Farmer's Selection"}
            </span> */}
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#14532d] tracking-tight ">
              {t('farm_fresh_combos') || t('fresh_bundles') || "Fresh Bundles"}
            </h2>
          </div>

          <div className="flex gap-2">
            <button ref={prevRef} className="h-8 w-8 md:h-10 md:w-10 rounded-full border border-gray-200 flex items-center justify-center text-[#14532d] hover:bg-[#14532d] hover:text-white transition-all">
              <ChevronLeft size={16} />
            </button>
            <button ref={nextRef} className="h-8 w-8 md:h-10 md:w-10 rounded-full border border-gray-200 flex items-center justify-center text-[#14532d] hover:bg-[#14532d] hover:text-white transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={12}
          slidesPerView={1.4}
          navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          breakpoints={{
              320: { slidesPerView: 1, spaceBetween: 12 },
              480: { slidesPerView: 2, spaceBetween: 12 },
              640: { slidesPerView: 2, spaceBetween: 16 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
              1440: { slidesPerView: 5 },
          }}
          className="!overflow-visible"
        >
          {displayCombos.map((combo, index) => {
            const favorited = isFavorited(combo.id || combo.slug);
            return (
              <SwiperSlide key={index} className="h-auto">
                <div className="bg-white border border-gray-100 rounded-[24px] transition-all duration-500 overflow-hidden flex flex-col h-full relative group shadow-sm hover:shadow-md">
                  
                  {/* Image Section */}
                  <Link href={`/offers/${combo.slug}`} className="relative aspect-square overflow-hidden bg-[#f8fcf9] block">
                    <Image
                      src={combo.image}
                      alt={combo.title}
                      fill
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Discount Badge */}
                    <div className="absolute top-3 left-3 bg-[#14532d] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full z-10">
                      {combo.savings}
                    </div>
                  </Link>

                  {/* Wishlist Button (Matching Product Card) */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleWishlist(combo.id || combo.slug);
                    }}
                    className={`absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full shadow-sm transition-all duration-300 z-10 ${
                      favorited
                        ? "bg-[#14532d] text-white"
                        : "bg-white/90 backdrop-blur-sm text-gray-400 hover:bg-[#14532d] hover:text-white"
                    }`}
                  >
                    <Heart size={14} fill={favorited ? "currentColor" : "none"} />
                  </button>

                  {/* Content Section */}
                  <div className="p-3 sm:p-4 flex flex-col flex-grow bg-white">
                    <Link href={`/offers/${combo.slug}`}>
                      <h3 className="text-[13px] font-black text-slate-800 mb-3 line-clamp-2 group-hover:text-emerald-700 transition-colors duration-300 leading-tight uppercase tracking-tight">
                        {combo.title}
                      </h3>
                    </Link>

                    {/* 2-Column Item Grid */}
                    <div className="grid grid-cols-2 gap-x-2 gap-y-2 mb-4">
                      {combo.items.slice(0, 4).map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5 min-w-0">
                          <div className="w-1 h-1 bg-emerald-500 rounded-full shrink-0" />
                          <span className="text-[10px] md:text-[11px] text-slate-500 truncate font-medium capitalize">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Footer - Final Price Layout */}
                    <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between gap-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[15px] sm:text-[18px] font-black text-[#14532d] leading-none">
                          {combo.price}
                        </span>
                        <span className="text-[11px] md:text-[12px] text-slate-300 line-through font-bold">
                          {combo.oldPrice}
                        </span>
                      </div>
                      
                      {/* Integrated Add to Cart Button */}
                      <button
                        onClick={(e) => handleAddToCart(e, combo)}
                        className="h-9 px-3 flex items-center justify-center gap-2 bg-[#14532d] text-white rounded-xl text-sm font-bold hover:bg-[#114224] transition-all duration-300 active:scale-95 shadow-sm min-w-[40px]"
                      >
                        <AddToCartIcon size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
};

export default ComboOffers;