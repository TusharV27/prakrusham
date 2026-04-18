"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { 
    ShoppingBag, 
    ArrowLeft, 
    CheckCircle2, 
    Timer, 
    ChevronRight,
    Loader2,
    Plus,
    ShoppingCart,
    Percent,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

export default function OfferDetailsPage() {
    const { slug } = useParams();
    const { addToCart } = useCart();
    const { language, t } = useLanguage();
    
    const [offer, setOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAddingAll, setIsAddingAll] = useState(false);
    const [addedStatus, setAddedStatus] = useState(false);

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

    useEffect(() => {
        const fetchOffer = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/offers/${slug}`);
                const data = await res.json();
                if (data.success) {
                    setOffer(data.data);
                }
            } catch (error) {
                console.error("Error fetching offer:", error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchOffer();
    }, [slug, language]);

    const handleAddAllToCart = async () => {
        if (!offer || !offer.products.length) return;
        
        setIsAddingAll(true);
        
        // Calculate bundle price portions if needed, but for now we add individual items
        // In a real Shopify combo, you might add a single "Bundle" item, 
        // but here we add all individual items to the cart.
        
        offer.products.forEach(product => {
            addToCart({
                ...product,
                name: getTranslated(product.name),
                quantity: 1,
                image: product.images?.[0]?.url || "/placeholder.png"
            });
        });

        setTimeout(() => {
            setIsAddingAll(false);
            setAddedStatus(true);
            setTimeout(() => setAddedStatus(false), 3000);
        }, 800);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white">
                <Loader2 className="h-10 w-10 animate-spin text-[#14532d]" />
                <p className="mt-4 text-sm font-bold uppercase tracking-widest text-[#14532d]/40">Gathering the bounty...</p>
            </div>
        );
    }

    if (!offer) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-red-50 p-6 rounded-[32px] mb-6">
                    <ShoppingBag className="h-12 w-12 text-red-400 mx-auto" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 uppercase">Promotion Not Found</h1>
                <p className="text-slate-500 mt-2 max-w-sm">This offer may have expired or was relocated to another ritual.</p>
                <Link href="/" className="mt-8 bg-[#14532d] text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl">
                    Back to Market
                </Link>
            </div>
        );
    }

    const isCombo = offer.discountType === 'COMBO' || offer.products.length >= 2;
    const totalOriginalPrice = offer.products.reduce((acc, p) => acc + (p.price || 0), 0);
    
    let discountedPrice = totalOriginalPrice;
    if (offer.discountType === 'PERCENTAGE') {
        discountedPrice = totalOriginalPrice * (1 - offer.value / 100);
    } else if (offer.discountType === 'FIXED_AMOUNT') {
        discountedPrice = Math.max(0, totalOriginalPrice - offer.value);
    } else if (isCombo) {
        discountedPrice = totalOriginalPrice * 0.8; // default 20% off for bundle
    }

    return (
        <div className="min-h-screen bg-white">
            <main className="max-w-[1440px] mx-auto px-4 sm:px-8 py-8 md:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-20">
                    
                    {/* Left: Banner & Info */}
                    <div className="lg:col-span-6 space-y-8">
                        {/* Banner Image */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative aspect-[4/3] rounded-[48px] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm sticky top-28"
                        >
                            <img 
                                src={offer.images[0]?.url || "/placeholder.png"} 
                                alt={getTranslated(offer.name)}
                                className="w-full h-full object-cover"
                            />
                            {/* {offer.discountType === 'PERCENTAGE' && (
                                <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-[#14532d] text-white flex items-center justify-center">
                                        <Percent size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#14532d]/50 leading-none">Discount</p>
                                        <p className="text-xl font-black text-[#14532d] leading-none mt-1">{offer.value}% OFF</p>
                                    </div>
                                </div>
                            )} */}
                        </motion.div>
                        
                    </div>

                    {/* Right: Product List & Action */}
                    <div className="lg:col-span-6 space-y-8">

                        {/* Text Content */}
                        <div className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-3 text-[#16a34a]"
                            >
                                <Timer size={14} />
                                <span className="text-[11px] font-black uppercase tracking-widest">
                                    Limited Time Ritual • Ends {new Date(offer.endTime).toLocaleDateString()}
                                </span>
                            </motion.div>
                            
                            <motion.h1 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#14532d] tracking-tight leading-[0.95]"
                            >
                                {getTranslated(offer.name)}
                            </motion.h1>
                            
                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-sm text-black font-medium leading-relaxed"
                            >
                                {getTranslated(offer.description)}
                            </motion.p>
                        </div>

                        {/* Highlights */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">

  {/* Fresh From Farm */}
  <div className="p-5 rounded-2xl bg-[#ecfdf5] border border-[#bbf7d0] flex items-start gap-4">
    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-[#14532d] shadow-sm">
      <CheckCircle2 size={20} />
    </div>
    <div>
      <h4 className="text-xs font-black uppercase tracking-widest text-[#14532d]">
        Fresh From Farm
      </h4>
      <p className="text-xs text-black mt-1 font-medium">
        100% Organic produce harvested within 24 hours.
      </p>
    </div>
  </div>

  {/* Best Value */}
  <div className="p-5 rounded-2xl bg-[#ecfdf5] border border-[#bbf7d0] flex items-start gap-4">
    <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-[#14532d] shadow-sm">
      <ShoppingBag size={20} />
    </div>
    <div>
      <h4 className="text-xs font-black uppercase tracking-widest text-[#14532d]">
        Best Value Guarantee
      </h4>
      <p className="text-xs text-black mt-1 font-medium">
        Save significantly compared to individual purchases.
      </p>
    </div>
  </div>

</div>

                        <div className="bg-[#fcfcfc] border border-slate-100 rounded-[40px] p-6 md:p-10 shadow-xl shadow-[#14532d]/5">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-[#14532d] uppercase">Products Included</h3>
                                <span className="text-[10px] font-black bg-[#14532d] text-white px-3 py-1 rounded-full uppercase tracking-widest">
                                    {offer.products.length} Items
                                </span>
                            </div>

                            {/* Product Items */}
                            <div className="space-y-4 mb-10 pr-2 custom-scrollbar">
                                {offer.products.map((product) => (
                                    <div key={product.id} className="group flex items-center gap-4 bg-white p-3 rounded-[24px] border border-slate-50 hover:border-slate-200 hover:shadow-lg transition-all">
                                        <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-slate-50 shadow-inner">
                                            <Image 
                                                src={product.images?.[0]?.url || "/placeholder.png"} 
                                                alt={getTranslated(product.name)}
                                                fill
                                                className="object-cover transition-transform group-hover:scale-110"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-sm font-bold text-[#14532d] line-clamp-1">{getTranslated(product.name)}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs font-black text-[#16a34a]">₹{product.price}</span>
                                                <div className="h-1 w-1 rounded-full bg-slate-200" />
                                                <span className="text-[10px] font-bold text-slate-400">Fixed Weight</span>
                                            </div>
                                        </div>
                                        <Link 
                                            href={`/products/${product.slug || product.id}`}
                                            className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-[#14532d] opacity-0 group-hover:opacity-100 transition-all hover:bg-[#14532d] hover:text-white"
                                        >
                                            <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                ))}
                            </div>

                            {/* Totals & Add to Cart */}
                            <div className="space-y-6 pt-6 border-t border-slate-100">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-slate-400 font-bold text-[11px] uppercase tracking-widest">
                                        <span>Subtotal (Individual)</span>
                                        <span className="line-through">₹{totalOriginalPrice}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-[#14532d] font-black text-xs uppercase tracking-widest">
                                        <span>Total Savings</span>
                                        <span>- ₹{Math.round(totalOriginalPrice - discountedPrice)}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <span className="text-sm font-black text-[#14532d] uppercase tracking-widest leading-none">Offer Price</span>
                                        <span className="text-3xl font-black text-[#14532d] leading-none italic tracking-tighter">₹{Math.round(discountedPrice)}</span>
                                    </div>
                                </div>

                                <button 
                                    onClick={handleAddAllToCart}
                                    disabled={isAddingAll}
                                    className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl shadow-[#14532d]/20 ${
                                        addedStatus 
                                            ? "bg-emerald-500 text-white" 
                                            : "bg-[#14532d] text-white hover:bg-[#114224]"
                                    }`}
                                >
                                    {isAddingAll ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : addedStatus ? (
                                        <>
                                            <CheckCircle2 size={16} />
                                            Bundle Added
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart size={16} />
                                            {isCombo ? t('Buy Bundle') : t('Add to Cart')}
                                        </>
                                    )}
                                </button>
                                
                                {/* <p className="text-[9px] text-center font-bold text-slate-400 uppercase tracking-widest">
                                    Enjoy fresh, farm-direct ingredients at wholesale prices.
                                </p> */}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Additional Content Section */}
                {/* <div className="mt-20 py-20 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                    <div className="space-y-4">
                        <div className="h-16 w-16 bg-[#eef6f0] text-[#14532d] rounded-[24px] flex items-center justify-center mx-auto">
                            <Plus size={32} />
                        </div>
                        <h4 className="font-black text-[#14532d] uppercase tracking-widest text-sm">Curated Selection</h4>
                        <p className="text-xs text-slate-500 font-bold leading-relaxed">Handpicked by our experts to ensure the perfect ritual balance for your kitchen.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="h-16 w-16 bg-[#fdfaf5] text-[#14532d] rounded-[24px] flex items-center justify-center mx-auto">
                            <ShoppingCart size={32} />
                        </div>
                        <h4 className="font-black text-[#14532d] uppercase tracking-widest text-sm">Value First</h4>
                        <p className="text-xs text-slate-500 font-bold leading-relaxed">We cut out the middleman so you get premium organic food without the premium price.</p>
                    </div>
                    <div className="space-y-4">
                        <div className="h-16 w-16 bg-[#fafafa] text-[#14532d] rounded-[24px] flex items-center justify-center mx-auto">
                            <ArrowRight size={32} />
                        </div>
                        <h4 className="font-black text-[#14532d] uppercase tracking-widest text-sm">Easy Fulfillment</h4>
                        <p className="text-xs text-slate-500 font-bold leading-relaxed">Next-day delivery available for most locations within the Bangalore metropolitan area.</p>
                    </div>
                </div> */}
            </main>
        </div>
    );
}
