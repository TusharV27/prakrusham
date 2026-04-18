"use client";

import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Calendar,
  Clock,
  Search,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { getTranslated as getTrans } from '@/utils/translation';

export default function BlogPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  const categories = [
    { name: 'Commercial Farming', count: 3 },
    { name: 'Mixed Farming', count: 1 },
    { name: 'Plantation Farming', count: 2 }
  ];

  useEffect(() => {
    async function fetchArticles() {
      try {
        const res = await fetch(`/api/articles`);
        const data = await res.json();
        if (data.success) setArticles(data.data);
      } catch (error) {
        console.error("Error fetching articles:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchArticles();
  }, []);

  const getTranslated = (f) => getTrans(f, language);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="bg-gradient-to-b from-green-50 to-white min-h-screen pb-12">
      {/* 1. SLIM HERO BREADCRUMB */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 pt-14">
        <div className="relative w-full overflow-hidden border border-[#14532d]/10">

          <img
            src="banners/blogs.webp"
            alt="Farm Journal"
            className="w-full h-[120px] sm:h-auto object-cover block"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/40" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col justify-center text-white px-6 sm:px-8 md:px-12 lg:px-16 ">
            <h1 className="text-sm sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-left">
              Farm Journal
            </h1>

            <div className="mt-3 inline-flex items-center w-fit gap-2 text-[7px] font-black uppercase tracking-[0.2em] bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
              <Link href="/">Home</Link>
              <ChevronRight size={10} />
              <span className="text-emerald-400">Journal</span>
            </div>
          </div>

        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-4 md:px-6 py-8 sm:py-10 md:py-12 lg:py-10 xl:py-14">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* 2. COMPACT SIDEBAR */}
          {/* <aside className="w-full lg:w-[280px] order-2 lg:order-1 space-y-6">
            <div className="bg-white p-4 rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search articles..."
                  className="w-full pl-3 pr-9 py-2 text-xs border border-slate-100 bg-slate-50/50 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] border border-slate-100">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp size={14} className="text-emerald-500" /> Topics
              </h3>
              <ul className="space-y-2">
                {categories.map((cat, i) => (
                  <li key={i} className="flex justify-between items-center group cursor-pointer py-1">
                    <span className="text-slate-500 group-hover:text-emerald-600 transition-colors text-[13px] font-medium">
                      {cat.name}
                    </span>
                    <span className="text-[10px] font-bold bg-slate-50 text-slate-400 px-2 py-0.5 rounded-md group-hover:bg-emerald-50 group-hover:text-emerald-600">
                      {cat.count}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside> */}

          {/* 3. PREMIUM ARTICLE GRID */}
          <div className="flex-1 order-1 lg:order-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10">
              {articles.map((article, index) => (
                <motion.article
                  key={article.id}
                  className="bg-white overflow-hidden border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_25px_60px_-15px_rgba(20,83,45,0.08)] transition-all duration-700 group flex flex-col h-full hover:-translate-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  {/* Cinematic Image Wrapper */}
                  <Link href={`/blog/${article.handle}`} className="relative aspect-[16/11] overflow-hidden">
                    <img
                      src={article.image || '/images/blog/default.jpg'}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      alt=""
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-[#14532d] text-[7px] font-black uppercase tracking-[0.25em] px-2 py-1.5 rounded-full border border-green-100 shadow-sm transition-colors group-hover:bg-[#14532d] group-hover:text-white group-hover:border-[#14532d]">
                      {article.category || 'Agri-Life'}
                    </div>
                  </Link>

                  {/* Body Wrapper */}
                  <div className="p-4 flex flex-col flex-grow">
                    <div className="flex items-center gap-4 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                      <span className="flex items-center gap-2"><Calendar size={12} className="text-green-500" /> {new Date(article.publishedAt).toLocaleDateString()}</span>
                      {/* <div className="w-1 h-1 bg-gray-200 rounded-full"></div> */}
                      {/* <span className="flex items-center gap-2"><Clock size={12} className="text-green-500" /> 4 MIN</span> */}
                    </div>

                    <h2 className="text-md font-serif font-black text-gray-900 mb-2leading-[1.2]">
                      <Link href={`/blog/${article.handle}`}>{getTranslated(article.title)}</Link>
                    </h2>

                    <div
                      className="text-gray-500 text-[10px] leading-relaxed line-clamp-2 mb-4 opacity-70 group-hover:opacity-100 transition-opacity"
                      dangerouslySetInnerHTML={{ __html: getTranslated(article.summaryHtml) }}
                    />

                    <div className="mt-auto flex items-center justify-between">
                      <Link
                        href={`/blog/${article.handle}`}
                        className="group/btn text-[10px] font-black uppercase tracking-normal text-[#14532d] flex items-center gap-3 transition-all"
                      >
                        {t('read_post') || "Read Post"}
                        <div className="p-2 border border-green-100 rounded-full transition-all">
                          <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}