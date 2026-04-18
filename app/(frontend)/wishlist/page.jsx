"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";
import { useLanguage } from "@/context/LanguageContext";
import { Heart, ShoppingBag, ArrowLeft } from "lucide-react";

export default function WishlistPage() {
  const { wishlistItems } = useWishlist();
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/wishlist");
        const data = await res.json();
        
        if (data.success && data.data?.items) {
          // Flatten items to product list
          const p = data.data.items.map(item => item.product);
          setProducts(p);
        }
      } catch (error) {
        console.error("Failed to fetch wishlist products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlistDetails();
  }, [wishlistItems.length]); // Re-fetch if count changes

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fdfaf5]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#14532d]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfaf5] pt-24 pb-10">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-6 sm:mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Link href="/" className="h-5 w-5 rounded-full bg-white flex items-center justify-center text-[#14532d] hover:bg-[#14532d] hover:text-white transition-all shadow-sm">
                <ArrowLeft size={18} />
              </Link>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#14532d]/50">My Collections</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#14532d] uppercase tracking-tighter leading-none">
              Your Wishlist
            </h1>
          </div>
          <div className="bg-white px-4 sm:px-6 py-2 rounded-[32px] border border-[#14532d]/5 shadow-sm self-start w-fit">
             <div className="flex items-center gap-3">
                <div className="h-5 w-5 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
                  <Heart size={20} fill="currentColor" />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Saved</div>
                  <div className="text-[10px] font-black text-slate-800 leading-none">{products.length} Items</div>
                </div>
             </div>
          </div>
        </div>

        {/* Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[48px] p-20 text-center border-2 border-dashed border-[#14532d]/10">
            <div className="h-24 w-24 bg-[#f8fcf9] rounded-full flex items-center justify-center text-[#14532d]/20 mx-auto mb-8">
              <Heart size={48} />
            </div>
            <h2 className="text-3xl font-black text-[#14532d] uppercase tracking-tight mb-4">Your wishlist is empty</h2>
            <p className="text-slate-500 max-w-md mx-auto mb-10 font-medium">Save your favorite organic products and sustainable decor here to find them easily later.</p>
            <Link 
              href="/categories" 
              className="inline-flex items-center gap-3 bg-[#14532d] text-white px-10 py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] hover:bg-[#114224] transition-all shadow-xl shadow-[#14532d]/20"
            >
              <ShoppingBag size={18} />
              Explore Shop
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
