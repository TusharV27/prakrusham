"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getTranslated } from "@/utils/translation";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

export default function BlogSection() {
  const { t, language } = useLanguage();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch('/api/articles');
        const data = await res.json();
        if (data.success) {
          setBlogs((data.data || []).slice(0, 4));
        } else {
          setError(t('failed_to_load_blogs') || 'Failed to load blog posts.');
        }
      } catch (fetchError) {
        console.error('Error fetching blog posts:', fetchError);
        setError(t('unable_to_fetch_blogs') || 'Unable to fetch blog posts.');
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, [t]);

  const formatDate = (publishedAt) => {
    if (!publishedAt) return "";
    return new Date(publishedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getTitle = (blog) => getTranslated(blog.title, language) || "Untitled article";
  const getSummary = (blog) => getTranslated(blog.summaryHtml, language) || getTranslated(blog.bodyHtml, language) || "";
  const getCategory = (blog) => getTranslated(blog.blog?.title, language) || "Agri-Life";

  return (
    <section className="py-6 sm:py-8 md:py-10 lg:py-10 xl:py-14 bg-linear-to-b from-green-50 to-white">
      <div className="max-w-360 mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div className="space-y-1">
            {/* <span className="text-xs font-black uppercase tracking-[0.2em] text-[#16a34a]">
              {t('latest_articles')}
            </span> */}

            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#14532d] leading-tight">
              {t('latest_blogs')}
            </h2>
          </div>

          {/* Navigation */}
          <div className="flex gap-2">
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

        {/* Swiper */}
        {loading ? (
          <div className="py-24 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="py-16 text-center text-sm text-red-600">{error}</div>
        ) : blogs.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-600">
            {t('no_blog_posts_found') || 'No blog posts found.'}
          </div>
        ) : (
          <Swiper
            modules={[Navigation, Autoplay]}
            spaceBetween={20}
            slidesPerView={1.2}
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
              1024: { slidesPerView: 4 },
            }}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
          >
            {blogs.map((blog, index) => (
              <SwiperSlide key={blog.id} className="pb-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group flex flex-col"
                >
                  {/* Image */}
                  <Link href={`/blog/${blog.handle}`} className="relative aspect-16/14 overflow-hidden">
                    <Image
                      src={blog.image || "/images/blog/default.jpg"}
                      alt={getTitle(blog)}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-700"
                    />
                    <span className="absolute top-3 left-3 bg-[#14532d] text-white text-[9px] font-bold px-2.5 py-1 rounded-md shadow-lg">
                      {formatDate(blog.publishedAt)}
                    </span>
                    {/* <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#14532d] text-[9px] font-black uppercase tracking-[0.25em] px-4 py-2 rounded-full border border-green-100 shadow-sm transition-colors group-hover:bg-[#14532d] group-hover:text-white group-hover:border-[#14532d]">
                      {getCategory(blog)}
                    </div> */}
                  </Link>

                  {/* Content */}
                  <div className="p-4 md:p-5 flex flex-col grow">
                    <h3 className="text-base md:text-lg font-bold text-[#14532d] mb-2 group-hover:text-[#16a34a] transition-colors line-clamp-1">
                      <Link href={`/blog/${blog.handle}`}>{getTitle(blog)}</Link>
                    </h3>

                    <p className="text-gray-500 text-xs md:text-sm mb-4 leading-relaxed line-clamp-2" dangerouslySetInnerHTML={{ __html: getSummary(blog) }} />

                    <div className="mt-auto">
                      <Link
                        href={`/blog/${blog.handle}`}
                        className="inline-flex items-center gap-1.5 text-[#16a34a] text-xs font-bold hover:gap-2 transition-all"
                      >
                        {t('read_more')}
                        <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

      </div>
    </section>
  );
}