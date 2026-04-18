"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import ProductCard from "@/components/ProductCard";
import { FaSearch, FaArrowRight, FaFilter } from "react-icons/fa";
import Link from "next/link";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=20`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.data);
        }
      } catch (error) {
        console.error("Search fetch failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#14532d]"></div>
        <p className="mt-4 text-xs font-black uppercase tracking-widest text-[#14532d]/40">Searching for {query}...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 sm:px-8 py-12 bg-white">
      
      {/* Search Header */}
      <div className="mb-12 border-b border-[#14532d]/5 pb-10">
         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
               <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-[#14532d]/5 flex items-center justify-center text-[#14532d]">
                     <FaSearch size={16} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#14532d]/50">
                     {t("search_results") || "Search Results"}
                  </span>
               </div>
               <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                  {query ? `"${query}"` : t("all_products") || "All Products"}
               </h1>
            </div>
            
            <div className="flex items-center gap-4">
               <span className="text-sm font-black text-[#14532d]/40 uppercase tracking-widest">
                  {products.length} {t("items_found") || "Items Found"}
               </span>
               <div className="h-10 w-px bg-[#14532d]/10 mx-2 hidden md:block" />
               <button className="flex items-center gap-2 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#14532d] hover:border-[#14532d]/20 transition-all">
                  <FaFilter /> {t("filter") || "Filter"}
               </button>
            </div>
         </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-8">
          {products.map((product) => (
            <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-32 bg-[#f0f9f4]/30 rounded-[48px] border border-dashed border-[#14532d]/10">
           <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-[#14532d]/20 mx-auto mb-6 shadow-sm">
              <FaSearch size={32} />
           </div>
           <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-3">
              {t("no_results_found") || "No Results Found"}
           </h2>
           <p className="text-slate-500 max-w-md mx-auto mb-10 text-sm leading-relaxed">
              We couldn't find any products matching your search. Please check your spelling or try broader keywords.
           </p>
           <Link 
             href="/categories" 
             className="inline-flex items-center gap-3 bg-[#14532d] text-white px-10 py-5 rounded-[22px] text-[12px] font-black uppercase tracking-widest hover:bg-[#114224] transition-all hover:-translate-y-1 shadow-2xl shadow-[#14532d]/20"
           >
              {t("explore_categories") || "Explore Categories"} <FaArrowRight />
           </Link>
        </div>
      )}

      {/* Recommended for you Section - Optional but good for empty state */}
      <div className="mt-32">
         {/* Could add RecommendedProducts component here if available */}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="min-h-screen pt-20">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#14532d]"></div>
        </div>
      }>
        <SearchResultsContent />
      </Suspense>
    </div>
  );
}
