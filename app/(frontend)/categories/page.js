"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CategoriesPage() {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const getTranslated = (field, lang = language) => {
    if (!field) return "";
    let parsed = field;
    if (typeof field === "string") {
      try {
        parsed = JSON.parse(field);
      } catch (e) {
        return field;
      }
    }
    if (typeof parsed === "object" && parsed !== null) {
      const v = parsed[lang] || parsed.en || parsed.hi || parsed.gu || Object.values(parsed)[0];
      return v !== undefined && v !== null ? v : "";
    }
    return typeof parsed === 'string' || typeof parsed === 'number' ? parsed : "";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-[#14532d]" />
        <p className="mt-4 text-[#14532d] font-bold uppercase tracking-widest text-xs">Loading Collections...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[1440px] mx-auto">
        <header className="mb-12 border-b border-[#14532d]/10 pb-10 text-center">
          <span className="text-sm font-black uppercase tracking-[0.3em] text-[#22c55e] mb-3 block">
            Explore Our
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#14532d] uppercase tracking-tighter mb-4">
            Organic Collections
          </h1>
          <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base font-medium tracking-tight">
            Discover farm-fresh products categorized for your convenience. From seasonal vegetables to daily essentials, we bring the best of nature to your doorstep.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              href={`/category/${cat.slug}`}
              className="group relative flex flex-col h-[350px] rounded-[40px] overflow-hidden border border-[#14532d]/5 shadow-sm hover:shadow-2xl hover:shadow-[#14532d]/10 transition-all duration-500 bg-[#f8fcf9]"
            >
              <div className="absolute inset-0 z-0">
                <img 
                  src={cat.image || "/placeholder.png"} 
                  alt={getTranslated(cat.name)}
                  className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent group-hover:via-black/50 transition-all duration-500"></div>
              </div>

              <div className="relative z-10 p-8 mt-auto flex flex-col items-start translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <span className="bg-[#22c55e] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-3 shadow-[0_4px_10px_rgba(34,197,94,0.3)]">
                  Collection
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-2">
                  {getTranslated(cat.name)}
                </h2>
                <p className="text-white/70 text-xs font-medium tracking-tight line-clamp-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  {getTranslated(cat.description) || `The finest and freshest ${getTranslated(cat.name)} selected with care.`}
                </p>
                <div className="inline-flex items-center gap-2 text-white font-black uppercase tracking-widest text-sm bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl group-hover:bg-[#22c55e] transition-colors duration-300">
                  Explore <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-[48px] border-2 border-dashed border-[#14532d]/10">
            <h3 className="text-xl font-black text-[#14532d] uppercase tracking-tighter">No categories found</h3>
            <p className="text-gray-500 mt-2">Check back soon for our new organic collections!</p>
          </div>
        )}
      </div>
    </div>
  );
}
