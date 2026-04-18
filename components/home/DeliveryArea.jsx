"use client";

import React, { useState } from "react";
import { MapPin, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const areas = [
  "area_adajan",
  "area_vesu",
  "area_pal",
  "area_piplod",
  "area_city_light",
  "area_amroli",
  "area_katargam",
  "area_varachha",
];

export default function DeliveryArea() {
  const { t } = useLanguage();
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const checkAvailability = async () => {
    setError(null);
    setResult(null);

    const trimmed = pincode.toString().trim();
    if (!/^[0-9]{6}$/.test(trimmed)) {
      setError(t('invalid_pincode') || 'Please enter a valid 6-digit pincode.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/shipping/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pincode: trimmed })
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || 'Failed to check availability');
      } else {
        setResult(data.data);
      }
    } catch (err) {
      setError('Error checking availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-6 sm:py-8 md:py-10 lg:py-10 xl:py-14 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        <div className="bg-[#14532d] p-6 sm:p-8 md:p-12 lg:p-16 flex flex-col xl:flex-row items-center gap-12 overflow-hidden relative shadow-2xl">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="flex-1 text-center lg:text-left relative z-10">
            <div className="inline-flex items-center gap-2 bg-green-900/50 text-green-300 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 border border-green-800">
              <MapPin size={14} />
              {t('we_are_expanding')}
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white mb-6">{t('where_we_deliver')}</h2>
            <p className="text-green-100/80 text-sm sm:text-base md:text-lg mb-8 max-w-lg">
               {t('delivery_area_desc')}
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center lg:justify-start">
              <input 
                type="text" 
                placeholder={t('enter_pincode')} 
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                className="bg-white/10 border border-white/20 text-white placeholder-white/40 px-8 py-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#16a34a] w-full sm:w-64"
              />
              <button
                type="button"
                onClick={checkAvailability}
                disabled={loading}
                className="bg-white text-[#14532d] font-bold px-10 py-4 rounded-2xl hover:bg-green-100 transition-all disabled:opacity-60"
              >
                {loading ? 'Checking...' : t('check_now')}
              </button>
            </div>
            <div className="mt-4 space-y-2">
              {error && (
                <div className="text-sm text-red-100 bg-red-600/20 border border-red-500/30 rounded-2xl p-3">
                  {error}
                </div>
              )}
              {result && (
                <div className={`text-sm rounded-2xl p-3 ${result.deliverable ? 'bg-emerald-600/20 text-emerald-100 border border-emerald-400/30' : 'bg-white/10 text-white border border-white/20'}`}>
                  <p className="font-semibold mb-1">{result.deliverable ? 'Available' : 'Not Deliverable'}</p>
                  <p>{result.message}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 relative z-10 w-full">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 grid grid-cols-2 sm:grid-cols-2 gap-4">
              {areas.map((area, index) => (
                <div key={index} className="flex items-center gap-3 text-white font-medium text-sm md:text-base">
                  <CheckCircle2 size={18} className="text-[#16a34a]" />
                  {t(area)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
