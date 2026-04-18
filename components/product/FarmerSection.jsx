"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaUserCircle, FaAward, FaMapMarkerAlt, FaStar, FaCommentDots, FaLeaf, FaSeedling, FaVectorSquare } from "react-icons/fa";
import { useLanguage } from "@/context/LanguageContext";
import { getTranslated } from "@/utils/translation";

export default function FarmerSection({ farmer }) {
  const { language, t } = useLanguage();
  const [stats, setStats] = useState({ rating: 0, count: 0 });

  useEffect(() => {
    if (farmer?.id) {
      fetchFarmerStats();
    }
  }, [farmer?.id]);

  const fetchFarmerStats = async () => {
    try {
      const res = await fetch(`/api/reviews?farmerId=${farmer.id}`);
      const data = await res.json();
      if (data.success && data.data) {
        const approved = data.data.filter(r => r.status === 'APPROVED');
        if (approved.length > 0) {
          const avg = approved.reduce((acc, curr) => acc + curr.rating, 0) / approved.length;
          setStats({ rating: avg.toFixed(1), count: approved.length });
        }
      }
    } catch (error) {
      console.error("Error fetching farmer stats:", error);
    }
  };

  if (!farmer) return null;

  const gt = (field) => getTranslated(field, language);

  const name = farmer.user?.name ? gt(farmer.user.name) : t("farmers_label") || "Our Dedicated Farmer";
  const profileImage = farmer.user?.profileImage;
  const farmDetails = farmer.farmDetails ? gt(farmer.farmDetails) : null;
  const landSize = farmer.landSize;
  const metafields = farmer.metafields || [];

  // Enhanced practices detection
  const practiceKeys = ["specialization", "practices", "farming_focus", "methods", "expertise", "work"];
  const practicesMeta = metafields.find(m => 
    practiceKeys.includes(m.key.toLowerCase())
  );
  
  // Fallback: If no meta, use a localized default if they have land
  const farmingPractices = practicesMeta ? practicesMeta.value : (landSize > 0 ? t('natural_farming_default') : null);

  return (
    <div className="bg-[#f0f9f4]/40 border border-[#e2f2e9] rounded-[48px] p-6 sm:p-12 mt-12 mb-10 pb-36 relative overflow-hidden group">
      
      {/* Subtle organic pattern */}
      <div className="absolute top-0 right-0 w-56 h-56 bg-[#e2f2e9]/50 rounded-bl-full -z-0 opacity-25 pointer-events-none transition-transform group-hover:scale-110 duration-1000" />

      <div className="flex flex-col md:flex-row items-center md:items-start gap-12 relative z-10">
        
        {/* Farmer Image Card */}
        <div className="relative shrink-0">
          <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-[56px] overflow-hidden border-[8px] border-white shadow-2xl ring-1 ring-emerald-100/50 transform group-hover:-rotate-3 transition-transform duration-700">
            {profileImage ? (
              <img src={profileImage} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <FaUserCircle className="text-8xl" />
              </div>
            )}
          </div>
          {/* Award Badge positioned for better hierarchy */}
          <div className="absolute -top-3 -right-3 bg-yellow-400 text-white p-3.5 rounded-[22px] border-4 border-white shadow-xl z-20 transform rotate-12 group-hover:rotate-0 transition-all duration-500">
            <FaAward className="text-xl" />
          </div>
        </div>

        {/* Content Info */}
        <div className="flex-1 text-center md:text-left">
          
          <div className="flex flex-col gap-3.5 mb-8">
             {/* Micro Header */}
             <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                <FaLeaf className="text-emerald-500 text-sm animate-bounce" />
                <span className="text-[12px] font-black uppercase tracking-[0.4em] text-emerald-800/50">
                  {t("producer_story")}
                </span>
             </div>

             <div className="flex flex-wrap items-center justify-center md:justify-start gap-5">
                <h3 className="text-4xl sm:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                  {name}
                </h3>
                <div className="flex items-center gap-2.5 py-2 px-5 bg-emerald-500 text-white rounded-full text-[11px] font-black uppercase tracking-[0.15em] shadow-lg shadow-emerald-500/20 border-2 border-white">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Verified
                </div>
             </div>
             
             <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-8 gap-y-4 mt-3">
                <div className="flex items-center gap-3">
                   <div className="flex text-yellow-500 drop-shadow-md">
                     <FaStar size={18} />
                   </div>
                   <span className="text-xl font-black text-slate-900 leading-none">{stats.rating > 0 ? stats.rating : "5.0"}</span>
                   <span className="text-[13px] text-slate-400 font-black uppercase tracking-widest leading-none">({stats.count || 0} reviews)</span>
                </div>
                <div className="text-emerald-200/50 md:block hidden text-2xl font-light">|</div>
                <div className="flex items-center gap-3 text-[13px] font-black text-slate-400 uppercase tracking-widest leading-none">
                  <FaMapMarkerAlt className="text-emerald-500 text-base" />
                  Gujarat, India
                </div>
             </div>
          </div>

          <div className="relative mb-10 pl-2">
            <div className="absolute left-0 top-0 w-1.5 h-full bg-emerald-500/20 rounded-full hidden md:block" />
            <p className="text-xl text-slate-600/90 leading-relaxed max-w-4xl italic font-semibold md:pl-6">
              {farmDetails ? `"${farmDetails}"` : t('mission_desc')}
            </p>
          </div>

          {/* Land & Practices Detail Grid - 2-Column Side-by-Side balanced layout */}
          {(landSize > 0 || farmingPractices) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-10 max-w-5xl">
               {landSize > 0 && (
                 <div className="flex items-center gap-6 bg-white p-6 rounded-[32px] border border-emerald-50 shadow-sm transition-all hover:shadow-xl hover:translate-y-[-2px] group/card">
                    <div className="w-16 h-16 rounded-[22px] bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 group-hover/card:bg-emerald-600 group-hover/card:text-white transition-all duration-500">
                       <FaVectorSquare size={26} />
                    </div>
                    <div className="flex flex-col text-left">
                       <span className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                          {t('land_size')}
                       </span>
                       <span className="text-2xl font-black text-slate-900 leading-none">
                          {landSize} <span className="text-sm uppercase ml-1.5 opacity-40">{t('acres')}</span>
                       </span>
                    </div>
                 </div>
               )}

               {farmingPractices && (
                 <div className="flex items-center gap-6 bg-white p-6 rounded-[32px] border border-amber-50 shadow-sm transition-all hover:shadow-xl hover:translate-y-[-2px] group/card">
                    <div className="w-16 h-16 rounded-[22px] bg-amber-50 flex items-center justify-center text-amber-600 shrink-0 group-hover/card:bg-amber-600 group-hover/card:text-white transition-all duration-500">
                       <FaSeedling size={26} />
                    </div>
                    <div className="flex flex-col text-left">
                       <span className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
                          {t('farming_practices')}
                       </span>
                       <span className="text-lg font-black text-slate-900 leading-tight">
                          {farmingPractices}
                       </span>
                    </div>
                 </div>
               )}
            </div>
          )}

          <div className="mt-12 flex flex-wrap items-center justify-center md:justify-start gap-6">
            <Link
              href="#farmer-reviews"
              className="bg-[#14532d] text-white px-12 py-5 rounded-[24px] text-[13px] font-black uppercase tracking-[0.25em] hover:bg-emerald-900 hover:shadow-2xl hover:shadow-emerald-900/40 transition-all hover:-translate-y-1.5 flex items-center gap-4 active:scale-95 group/btn"
            >
              <FaCommentDots size={20} className="group-hover/btn:rotate-12 transition-transform" /> {t('see_reviews')}
            </Link>
            <Link
              href="/about"
              className="bg-white text-[#14532d] border-[3px] border-[#14532d]/10 px-12 py-5 rounded-[24px] text-[13px] font-black uppercase tracking-[0.25em] hover:border-[#14532d] transition-all hover:bg-emerald-50/20 active:scale-95"
            >
              {t('learn_more')}
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}