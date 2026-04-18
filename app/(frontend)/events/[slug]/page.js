"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Loader2, Clock, Users, Share2, ChevronRight, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";

export default function EventDetailPage() {
  const { slug } = useParams();
  const { t, language } = useLanguage();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const getTranslated = (field, fallback = "") => {
    if (!field) return fallback;
    let parsed = field;
    if (typeof field === "string") {
      try { parsed = JSON.parse(field); } catch (e) { return field; }
    }
    if (typeof parsed === "object" && parsed !== null) {
      const value = parsed[language] || parsed.en || parsed.hi || parsed.gu || Object.values(parsed)[0];
      return value !== undefined && value !== null ? value : fallback;
    }
    return typeof parsed === "string" || typeof parsed === "number" ? parsed : fallback;
  };

  const formatDate = (dateString, type = 'full') => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = type === 'full' 
      ? { day: "numeric", month: "short", year: "numeric" }
      : { hour: "2-digit", minute: "2-digit", hour12: true };
    return date.toLocaleDateString(language === "hi" ? "hi-IN" : "en-GB", options);
  };

  useEffect(() => {
    const fetchEvent = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/events/${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (data.success) setEvent(data.data);
        else setError(data.error || "Event not found");
      } catch (err) {
        setError("Unable to load event details");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!event || error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900 mb-4">Event not found</h1>
          <Link href="/events" className="text-emerald-600 font-bold text-sm border-b-2 border-emerald-600 pb-1">Return to listing</Link>
        </div>
      </div>
    );
  }

  const title = getTranslated(event.title);
  const location = getTranslated(event.location);
  const description = getTranslated(event.description);
  const shortDesc = getTranslated(event.shortDesc);

  return (
    <div className="min-h-screen bg-[#FCFCFC] ">
      <main className="max-w-[1420] mx-auto px-4 pt-8 pb-8 lg:pt-12 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          
          {/* LEFT: MAIN CONTENT */}
          <div className="lg:col-span-7">
            {/* Header */}
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-wider border border-emerald-100">
                  {event.isLive ? 'Live' : 'On-Site'}
                </span>
                <span className="text-slate-300 text-[10px]">•</span>
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{formatDate(event.date)}</span>
              </div>
              
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#14532d] leading-tight mb-4 tracking-tight">
                {title}
              </h1>
              <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed">
                {shortDesc}
              </p>
            </header>

            {/* Image Section */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="relative aspect-video rounded-3xl overflow-hidden bg-slate-100 mb-10 group shadow-sm border border-slate-100"
            >
              <img 
                src={event.images?.[0]?.url || "/placeholder-event.png"} 
                alt={title} 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              />
            </motion.div>

            {/* Content Body */}
            <article className="prose prose-sm prose-emerald max-w-none">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-4 w-1 bg-emerald-500 rounded-full" />
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 m-0">{t('description')}</h2>
              </div>
              <div 
                className="text-slate-600 leading-relaxed text-sm md:text-base selection:bg-emerald-100"
                dangerouslySetInnerHTML={{ __html: description }} 
              />
            </article>
          </div>

          {/* RIGHT: STICKY SIDEBAR */}
          <aside className="lg:col-span-5 relative">
            <div className="lg:sticky lg:top-24 space-y-6">
              
              {/* Refined Detail Card */}
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-8 flex items-center gap-2">
                   <CheckCircle2 size={12} />
                   {t('event_summary') || 'Event Summary'}
                </h3>
                
                <div className="grid grid-cols-1 gap-6 mb-6">
                  {[
                    { label: 'Date', val: formatDate(event.date), icon: Calendar },
                    { label: 'Time', val: formatDate(event.date, 'time'), icon: Clock },
                    { label: 'Location', val: location, icon: MapPin },
                    { label: 'Capacity', val: `${event.capacity} Spots`, icon: Users, hide: !event.capacity },
                  ].map((item, i) => !item.hide && (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100/50">
                        <item.icon size={16} className="text-slate-600" />
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{item.label}</p>
                        <p className="text-xs font-bold text-slate-800">{item.val}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Minimal Support Card */}
              <div className="bg-emerald-900 rounded-[2rem] p-7 text-emerald-100/80 relative overflow-hidden group">
                 {/* <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                   <Users size={80} />
                 </div> */}
                 <h4 className="text-xs font-black text-white uppercase tracking-widest mb-2">{t('assistance_title')}</h4>
                 <p className="text-[11px] leading-relaxed mb-4 max-w-[80%]">
                    {t('assistance_desc')}
                 </p>
                 <Link href="/contact" className="inline-flex items-center px-5 py-2.5 bg-white text-[#14532d] text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-[#14532d] hover:text-white transition-all duration-300">
                    {t('contact_us')}
                 </Link>
              </div>

            </div>
          </aside>
        </div>
      </main>

      {/* MOBILE FIXED BOTTOM ACTION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] p-4 bg-white/80 backdrop-blur-md border-t border-slate-100">
        <div className="max-w-md mx-auto flex items-center gap-4">
           <div className="flex-1">
              <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Registration</p>
              <p className="text-xs font-bold text-slate-900">Spots remaining: {event.capacity || 'Open'}</p>
           </div>
           <button className="bg-emerald-600 text-white px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-600/20 active:scale-95 transition-transform">
              Register
           </button>
        </div>
      </div>
    </div>
  );
}