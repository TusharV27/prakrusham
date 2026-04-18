"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Tag, MapPin, X, Info, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { getTranslated } from "@/utils/translation";

const getHardcodedSpecials = (t) => [
  {
    title: t('special_kesar_title') || "Special Kesar Mango",
    desc: t('special_kesar_desc') || "Experience the king of fruits, direct from our organic orchards.",
    image: "https://lushful.org/files/17434210903982.png",
    tag: t('seasonal_tag') || "Seasonal",
    color: "bg-orange-500",
  },
  {
    title: t('special_palak_title') || "Fresh Organic Palak",
    desc: t('special_palak_desc') || "Nutrient-rich, vibrant green spinach harvested at its peak.",
    image: "https://lushful.org/files/1727951462653201.3%20Palak.png",
    tag: t('fresh_tag') || "Fresh",
    color: "bg-green-600",
  },
];

export default function EventsSpecials() {
  const { t, language } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const gt = (field, fallback = '') => getTranslated(field, language) || fallback;

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/events");
        const data = await res.json();
        if (data.success) {
          const allEvents = data.data || [];
          setEvents(allEvents);

          // Check for event ID in URL to auto-open modal
          const urlParams = new URLSearchParams(window.location.search);
          const eventId = urlParams.get('event');
          if (eventId) {
            const ev = allEvents.find(e => e.id === eventId);
            if (ev) setSelectedEvent(ev);
          }
        }
      } catch (error) {
        console.error("Failed to fetch events:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
      full: date.toLocaleDateString(language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#16a34a]" />
      </div>
    );
  }

  const hasEvents = events.length > 0;
  const specials = getHardcodedSpecials(t);

  return (
    <section className="py-6 sm:py-8 md:py-10 lg:py-10 xl:py-14 bg-linear-to-b from-green-50 to-white overflow-hidden">
      <div className="max-w-360 mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {/* <div className="flex items-center gap-2 mb-2">
              <Calendar size={18} className="text-[#16a34a]" />
              <span className="text-sm font-bold uppercase tracking-[0.2em]  text-[#16a34a]">
                {hasEvents ? t('upcoming_events') || "Upcoming Events" : t('dont_miss_out')}
              </span>
            </div> */}
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#14532d]">
              {hasEvents ? t('farm_events_title') || "Farm Events & Workshops" : t('seasonal_specials')}
            </h2>
          </motion.div>
          <Link href={hasEvents ? "/events" : "/shop"} className="group text-sm font-bold text-[#14532d] hover:text-[#16a34a] transition-colors flex items-center gap-2">
            {hasEvents ? t('view_all_events') || "View All Events" : t('view_all_specials')} 
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {hasEvents ? (
            events.slice(0, 2).map((event, index) => {
              const dateInfo = formatDate(event.date);
              const eventPath = `/events/${event.slug || event.id}`;
              return (
                <Link
                  key={event.id}
                  href={eventPath}
                  className="group relative h-87.5 sm:h-100 rounded-4xl overflow-hidden shadow-2xl"
                >
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="relative h-full w-full cursor-pointer"
                  >
                    <img 
                      src={event.images?.[0]?.url || "/placeholder-event.png"} 
                      alt={gt(event.title)}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
                    
                    <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm rounded-2xl p-3 flex flex-col items-center justify-center min-w-16.25 shadow-xl border border-white/20 transform group-hover:scale-105 transition-transform">
                      <span className="text-2xl font-black text-[#14532d] leading-none">{dateInfo.day}</span>
                      <span className="text-[10px] font-bold text-[#16a34a] tracking-widest">{dateInfo.month}</span>
                    </div>

                    <div className="absolute top-6 right-6">
                      <span className="bg-[#16a34a] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                        {t('live_event') || "Live Event"}
                      </span>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8">
                      <div className="flex items-center gap-2 mb-3 text-white/90 text-xs font-medium">
                        <MapPin size={14} className="text-[#16a34a]" />
                        <span>{gt(event.location)}</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white mb-3 leading-tight group-hover:text-[#bbf7d0] transition-colors line-clamp-2">
                        {gt(event.title)}
                      </h3>
                      {/* <p className="text-white/70 text-sm mb-6 max-w-sm line-clamp-2 leading-relaxed">
                        {gt(event.shortDesc)}
                      </p> */}
                      <div className="inline-flex items-center gap-2 bg-white text-[#14532d] px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-xl group-hover:bg-[#16a34a] group-hover:text-white">
                        <Info size={14} className="transition-transform" />
                        {t('learn_more') || "Learn More"}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              );
            })
          ) : (
            specials.map((item, index) => (
              <motion.div 
                key={index} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative h-75 sm:h-87.5 rounded-4xl overflow-hidden shadow-lg"
              >
                <img 
                  src={item.image} 
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute top-6 right-6">
                  <span className={`${item.color} text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg`}>
                    {item.tag}
                  </span>
                </div>

                <div className="absolute bottom-8 left-8 right-8">
                  <h3 className="text-2xl sm:text-3xl font-black text-white mb-2">{item.title}</h3>
                  <p className="text-white/80 text-sm mb-6 max-w-sm leading-relaxed">{item.desc}</p>
                  <Link 
                    href="/shop" 
                    className="inline-flex items-center gap-2 bg-white text-[#14532d] px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-[#16a34a] hover:text-white transition-all shadow-xl"
                  >
                    <Tag size={14} />
                    {t('shop_now')}
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
