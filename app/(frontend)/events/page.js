"use client";

import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Loader2, ArrowLeft, Info, Clock } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";

export default function EventsListingPage() {
  const { t, language } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        if (data.success) {
          setEvents(data.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getTranslated = (field, fallback = '') => {
    if (!field) return fallback;
    let parsed = field;
    if (typeof field === 'string') {
        try { parsed = JSON.parse(field); } catch (e) { return field; }
    }
    if (typeof parsed === 'object' && parsed !== null) {
        const v = parsed[language] || parsed.en || parsed.hi || parsed.gu || Object.values(parsed)[0];
        return v !== undefined && v !== null ? v : fallback;
    }
    return typeof parsed === 'string' || typeof parsed === 'number' ? parsed : fallback;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-12 h-12 animate-spin text-green-600" />
        <p className="mt-4 text-green-900 font-bold uppercase tracking-tighter text-sm animate-pulse">Loading Farm Events...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* --- HERO BANNER --- */}
      <section className="relative bg-[#064e3b] pt-20 pb-24 md:pt-32 md:pb-40 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-400/10 rounded-full blur-[120px] -mr-64 -mt-64" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -ml-64 -mb-64" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-emerald-200/80 hover:text-white transition-all mb-8 group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold uppercase tracking-widest">{t('back_to_home') || 'Back to Home'}</span>
          </Link>
          
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-[1.1] tracking-tight">
              Rooted in <span className="text-emerald-400">Community.</span>
            </h1>
            <p className="text-lg md:text-xl text-emerald-50/80 leading-relaxed font-medium">
              Discover workshops, organic harvest festivals, and hands-on farming experiences designed to connect you back to nature.
            </p>
          </div>
        </div>
      </section>

      {/* --- EVENTS GRID --- */}
      <main className="max-w-7xl mx-auto px-6 -mt-12 pb-24">
        {events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event, index) => {
              const eventPath = `/events/${event.slug || event.id}`;
              const eventDate = new Date(event.date);
              
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={eventPath} className="group flex flex-col h-full bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                    {/* Image Header */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img 
                        src={event.images?.[0]?.url || "/placeholder-event.png"} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt={getTranslated(event.title)}
                      />
                      {/* Date Badge Overlay */}
                      <div className="absolute top-4 left-4 bg-white px-3 py-1.5 rounded-2xl shadow-xl flex flex-col items-center min-w-[55px]">
                        <span className="text-[10px] font-bold text-gray-400 uppercase leading-none">{eventDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="text-xl font-black text-green-900 leading-none">{eventDate.getDate()}</span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-black uppercase tracking-widest mb-3">
                        <MapPin size={14} fill="currentColor" className="fill-emerald-100" />
                        <span className="truncate">{getTranslated(event.location)}</span>
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                        {getTranslated(event.title)}
                      </h3>
                      
                      <p className="text-gray-500 text-sm line-clamp-2 mb-6 leading-relaxed">
                        {getTranslated(event.shortDesc)}
                      </p>
                      
                      {/* Footer Info */}
                      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-400">
                           <Clock size={14} />
                           <span className="text-xs font-semibold">{eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="flex items-center gap-1 text-emerald-700 font-bold text-sm">
                          {t('learn_more') || 'View Details'}
                          <Info size={16} />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-white rounded-[40px] border border-gray-100 shadow-inner mt-12">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar size={32} className="text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No events scheduled</h2>
            <p className="text-gray-500 max-w-sm mx-auto">
              We're currently harvesting new ideas. Please check back later for upcoming workshops!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}