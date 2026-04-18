"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, 
  User as UserIcon, 
  Clock, 
  ChevronLeft, 
  Share2,
  Tag,
  BookOpen,
  ArrowRight,
  AlertCircle,
  MessageSquare,
  ThumbsUp,
  Bookmark,
  ExternalLink,
  ChevronRight,
  Link as LinkIcon
} from 'lucide-react';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useParams } from 'next/navigation';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";


export default function ArticleDetailPage() {
  const params = useParams();
  const { id } = params;
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  const prevRef = useRef(null);
  const nextRef = useRef(null);
  
  // Scroll Progress Implementation
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/articles/${id}`);
        const data = await res.json();
        if (data.success) {
          setArticle(data.data);
          
          const relRes = await fetch(`/api/articles`);
          const relData = await relRes.json();
          if (relData.success) {
            setRelatedArticles(relData.data.filter(a => a.id !== id).slice(0, 3));
          }
        }
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchData();
  }, [id]);

  const getTranslated = (field, fallback = "") => {
    if (!field) return fallback;
    let parsed = field;
    if (typeof field === "string") {
      try {
        parsed = JSON.parse(field);
      } catch (e) {
        return field;
      }
    }
    if (typeof parsed === "object" && parsed !== null) {
      const value = parsed[language] || parsed.en || parsed.hi || parsed.gu || Object.values(parsed)[0];
      return value !== undefined && value !== null ? value : fallback;
    }
    return typeof parsed === "string" || typeof parsed === "number" ? parsed : fallback;
  };

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareTitle = article ? getTranslated(article.title) : '';

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center p-4">
         <div className="flex flex-col items-center gap-6">
            <div className="w-12 h-12 border-4 border-[#14532d] border-t-white rounded-full animate-spin"></div>
            <p className="text-[10px] font-black text-[#14532d] uppercase tracking-[0.4em] animate-pulse">
                {t('loading_journal') || "Loading Story..."}
            </p>
         </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center bg-white">
        <div className="space-y-6 max-w-md">
          <AlertCircle size={64} className="mx-auto text-rose-500" />
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{t('article_not_found') || "Story Not Found"}</h1>
          <Link href="/blog" className="inline-flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-600 transition-all active:scale-95">
             <ChevronLeft size={16} /> {t('back_to_journal') || 'Back to Journal'}
          </Link>
        </div>
      </div>
    );
  }

  const publishedDate = new Date(article.publishedAt || article.createdAt).toLocaleDateString(
    language === 'en' ? 'en-US' : (language === 'hi' ? 'hi-IN' : 'gu-IN'), 
    { month: 'long', day: 'numeric', year: 'numeric' }
  );
// ... keep existing imports and logic (fetch, getTranslated, etc.)

return (
  <article className="bg-gradient-to-b from-green-50 to-white min-h-screen relative overflow-x-hidden font-sans">
    {/* Hero Section - Background Image */}
    <section className="relative w-full overflow-hidden">
        {/* Aspect Ratio Container */}
        <div className="relative w-full aspect-[16/9] sm:aspect-[16/7] md:aspect-[16/6] lg:aspect-[16/5]">

          <img
            src={article.image || '/images/blog/default.jpg'}
            className="absolute inset-0 w-full h-full object-cover"
            alt={getTranslated(article.title)}
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#fdfcf7]/30"></div>

        </div>

    </section>

    {/* Floating Content Container */}
    <section className="relative -mt-30 sm:-mt-25 px-4 sm:px-6 pb-20">
      <div className="max-w-[1440px] mx-auto sm:px-6 w-full">
        
        {/* The White Card (Main Content) */}
        <main className="bg-white rounded-2xl  overflow-hidden border border-stone-100">
          <div className="p-6 sm:p-10 md:p-16">
            
            {/* Header / Meta */}
            <header className="mb-10 text-center">
               <span className="text-[#14532d] font-bold text-xs uppercase tracking-[0.2em] mb-4 block">
                {article.blog?.title ? getTranslated(article.blog.title) : 'Sustainable Living'}
              </span>
              <h1 className="text-[22px] sm:text-[28px] md:text-[32px] font-serif font-medium text-slate-800 leading-tight mb-6">
                {getTranslated(article.title)}
              </h1>
              <div className="flex items-center justify-center gap-4 text-slate-400 text-[12px] sm:text-[13px] font-bold uppercase tracking-widest">
                <span>{publishedDate}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span>By {article.author?.name ? getTranslated(article.author.name) : 'Admin'}</span>
              </div>
            </header>

            {/* Content Body */}
            <div className="rich-content"
              dangerouslySetInnerHTML={{ __html: getTranslated(article.bodyHtml) }}
            />

            {/* Tags */}
            {article.tags && (
              <div className="mt-12 pt-8 border-t border-stone-100 flex flex-wrap gap-2">
                {article.tags.split(",").map((tag, idx) => (
                  <span key={idx} className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* "You May Also Like" Slider */}
        <div className="mt-16">
  
  {/* Header */}
  <div className="flex items-center justify-between mb-8">
    <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#14532d]">
      You May Also Like
    </h3>

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
    modules={[Navigation]}
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
      1024: { slidesPerView: 3 },
    }}
  >
    {relatedArticles.map((rel) => (
      <SwiperSlide key={rel.id} className="h-auto py-2">
        <Link
          href={`/blog/${rel.handle || rel.id}`}
          className="group block"
        >
          <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-stone-100">

            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={rel.image}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                alt=""
              />
            </div>

            <div className="p-5">
              <p className="text-[10px] font-bold text-stone-400 uppercase mb-2">
                {new Date(rel.createdAt).toLocaleDateString()}
              </p>

              <h4 className="text-[14px] sm:text-[15px] font-semibold text-slate-800 line-clamp-2 leading-relaxed">
                {getTranslated(rel.title)}
              </h4>

              <p className="text-[#14532d] text-[10px] font-bold uppercase mt-4 inline-flex items-center gap-1">
                Read More <ArrowRight size={12} />
              </p>
            </div>
          </div>
        </Link>
      </SwiperSlide>
    ))}
  </Swiper>
</div>
      </div>
    </section>

  <style>{`
    .rich-content {
  word-wrap: break-word;
  overflow-wrap: break-word;
  word-break: break-word;
  hyphens: auto;

  color: #44403c;

  /* PERFECT BODY TEXT SCALE */
  font-size: clamp(0.95rem, 0.9rem + 0.3vw, 1.1rem);
  line-height: 1.75;
}
    /* Headings Styled Like the Provided Image */
    .rich-content h2 {
  color: #c2410c;

  /* MATCH HERO / SECTION TITLES */
  font-size: clamp(1.4rem, 1.2rem + 1vw, 2rem);

  font-weight: 700;
  margin: 2.5rem 0 1.25rem;
  line-height: 1.3;
}

.rich-content h3 {
  color: #1c1917;

  font-size: clamp(1.15rem, 1rem + 0.6vw, 1.5rem);

  font-weight: 600;
  margin: 2rem 0 1rem;
}

    .rich-content p {
  margin-bottom: 1.25rem;
  opacity: 0.95;
}

    /* Bullet Point Fix for Mobile */
    .rich-content ul {
      list-style-type: none;
      padding-left: 0.5rem;
      margin-bottom: 2rem;
    }

    .rich-content li {
      position: relative;
      padding-left: 1.75rem;
      margin-bottom: 1rem;
      line-height: 1.6;
    }

    .rich-content li::before {
      content: "•";
      color: #14532d;
      font-weight: bold;
      position: absolute;
      left: 0;
      font-size: 1.5rem;
      top: -4px;
    }

    /* Image/Media Safety */
    .rich-content img {
      width: 100%;
      max-width: 100%;
      height: auto !important;
      object-fit: cover;
      border-radius: 16px;
      margin: 2.5rem 0;
      box-shadow: 0 10px 30px rgba(0,0,0,0.05);
    }

    /* Table Safety for small screens */
    .rich-content table {
      display: block;
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      border-collapse: collapse;
      margin: 2rem 0;
    }

    @media (max-width: 640px) {
      .rich-content {
        line-height: 1.6;
      }
      .rich-content h2 {
        margin: 2rem 0 1rem;
      }
    }
  `}</style>
  </article>
);  
}
