"use client";

import { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import ProductCard from "@/components/ProductCard";

import "swiper/css";
import "swiper/css/navigation";

const initialProducts = [
  {
    name: "Organic Red Tomato",
    price: "₹45",
    oldPrice: "₹60",
    image:
      "https://bio-basket.com/cdn/shop/files/organic-cherry-tomato-1000x1000.webp?v=1697542743&width=400",
    discount: "25% OFF",
  },
  {
    name: "Fresh Spinach (Palak)",
    price: "₹30",
    oldPrice: "₹40",
    image:
      "https://bio-basket.com/cdn/shop/files/spinach-leaves-500x500.webp?v=1754638727&width=400",
    discount: "20% OFF",
  },
  {
    name: "Golden Sweet Corn",
    price: "₹55",
    oldPrice: "₹75",
    image:
      "https://bio-basket.com/cdn/shop/files/iStock-175592510_1.jpg?v=1759999533&width=400",
    discount: "26% OFF",
  },
  {
    name: "Crunchy Carrots",
    price: "₹65",
    oldPrice: "₹90",
    image:
      "https://bio-basket.com/cdn/shop/files/46.png?v=1754638369&width=700",
    discount: "27% OFF",
  },
   {
    name: "Golden Sweet Corn",
    price: "₹55",
    oldPrice: "₹75",
    image:
      "https://bio-basket.com/cdn/shop/files/iStock-175592510_1.jpg?v=1759999533&width=400",
    discount: "26% OFF",
  },
  {
    name: "Organic Red Tomato",
    price: "₹45",
    oldPrice: "₹60",
    image:
      "https://bio-basket.com/cdn/shop/files/organic-cherry-tomato-1000x1000.webp?v=1697542743&width=400",
    discount: "25% OFF",
  },
];

export default function RecommendedProducts() {
  const [products, setProducts] = useState(initialProducts);
  const [isLoading, setIsLoading] = useState(true);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=5');
        const result = await res.json();
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          setProducts(result.data);
        }
      } catch (error) {
        console.error('Failed to load recommended products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <section className="py-6 sm:py-8 md:py-10 lg:py-10 xl:py-14 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>

            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#14532d] mt-2">
              Recommended For You
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              ref={prevRef}
              className="p-3 border border-[#14532d]/10 rounded-full hover:bg-[#14532d] hover:text-white transition"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              ref={nextRef}
              className="p-3 border border-[#14532d]/10 rounded-full hover:bg-[#14532d] hover:text-white transition"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Swiper */}
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          breakpoints={{
            320: { slidesPerView: 1 },
            480: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 5 },
          }}
        >
          {products.map((item, i) => (
            <SwiperSlide key={i} className="py-2 h-auto">
              <ProductCard product={item} />
            </SwiperSlide>
          ))}
        </Swiper>

      </div>
    </section>
  );
}