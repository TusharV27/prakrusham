"use client";

import { useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { motion } from "framer-motion";

import "swiper/css";
import "swiper/css/navigation";

const reels = [
  {
    id: 1,
    video: "https://cdn.shopify.com/videos/c/o/v/22adcf86befc4e08abf3a5df3f126c12.mp4",
    title: "Harvest Day",
  },
  {
    id: 2,
    video: "https://cdn.shopify.com/videos/c/o/v/5f5a6004994d43da8a057db2c5d74076.mp4",
    title: "Organic Grains",
  },
  {
    id: 3,
    video: "https://cdn.shopify.com/videos/c/o/v/8897685643c740e6af3fadd899c4cd07.mp4",
    title: "Cold Pressed Info",
  },
  {
    id: 4,
    video: "https://cdn.shopify.com/videos/c/o/v/22adcf86befc4e08abf3a5df3f126c12.mp4",
    title: "Soil Health",
  },
  {
    id: 5,
    video: "https://cdn.shopify.com/videos/c/o/v/5f5a6004994d43da8a057db2c5d74076.mp4",
    title: "Farmers Choice",
  },
  {
    id: 6,
    video: "https://cdn.shopify.com/videos/c/o/v/5f5a6004994d43da8a057db2c5d74076.mp4",
    title: "Farmers Choice",
  },
  {
    id: 7,
    video: "https://cdn.shopify.com/videos/c/o/v/5f5a6004994d43da8a057db2c5d74076.mp4",
    title: "Farmers Choice",
  }
];

export default function ReelsSection() {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const videoRefs = useRef([]);
  const [activeVideo, setActiveVideo] = useState(null);

  const handlePlayPause = (id, index) => {
    const video = videoRefs.current[index];
    if (!video) return;

    if (activeVideo === id) {
      video.pause();
      setActiveVideo(null);
    } else {
      videoRefs.current.forEach((v) => v && v.pause());
      video.play();
      setActiveVideo(id);
    }
  };

  return (
    // Reduced padding from py-24 to py-8 (mobile) and py-12 (desktop)
    <section className="w-full py-6 sm:py-8 md:py-10 lg:py-10 xl:py-14 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">

        {/* Header - Reduced mb-12 to mb-6 */}
        <div className="flex justify-between items-end mb-6">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#16a34a]">
              Stories
            </span>
            <h2 className="text-xl sm:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#14532d]">
              Fresh Reels
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

        {/* Swiper */}
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={12}
          slidesPerView={2.2}
          navigation={{
            prevEl: prevRef.current,
            nextEl: nextRef.current,
          }}
          onBeforeInit={(swiper) => {
            swiper.params.navigation.prevEl = prevRef.current;
            swiper.params.navigation.nextEl = nextRef.current;
          }}
          breakpoints={{
            480: { slidesPerView: 3 },
            768: { slidesPerView: 4 },
            1024: { slidesPerView: 5 },
          }}
        >
          {reels.map((reel, index) => (
            <SwiperSlide key={reel.id}>
              <motion.div
                whileHover={{ y: -4 }}
                onClick={() => handlePlayPause(reel.id, index)}
                className="relative aspect-[9/16] rounded-[20px] overflow-hidden group cursor-pointer shadow-sm"
              >
                {/* Video */}
                <video
                  ref={(el) => (videoRefs.current[index] = el)}
                  src={reel.video}
                  muted
                  loop
                  playsInline
                  className="h-full w-full object-cover"
                />

                {/* Play Button - Refined sizing */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className={`h-10 w-10 flex items-center justify-center rounded-full backdrop-blur-md border border-white/30 text-white transition-all duration-300 ${activeVideo === reel.id ? 'bg-[#16a34a]/80 opacity-0 group-hover:opacity-100' : 'bg-white/20 opacity-100'}`}>
                    {activeVideo === reel.id ? (
                      <Pause fill="currentColor" size={16} />
                    ) : (
                      <Play fill="currentColor" size={16} className="ml-1" />
                    )}
                  </div>
                </div>

                {/* Subtle Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

                {/* Title - Always visible but pops on hover */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-white text-[11px] md:text-xs font-bold leading-tight drop-shadow-md transition-transform duration-300 group-hover:scale-105">
                    {reel.title}
                  </h3>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}