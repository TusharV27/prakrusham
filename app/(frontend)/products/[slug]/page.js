"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  FaStar,
  FaMinus,
  FaPlus,
  FaHeart,
  FaShareAlt,
  FaCheck,
  FaAward,
  FaShieldAlt,
  FaCreditCard,
  FaUsers,
  FaTrash,
  FaTruck,
  FaTag,
  FaFacebookF,
  FaWhatsapp,
  FaTwitter,
  FaEnvelope
} from "react-icons/fa";
import AddToCartIcon from "@/components/icons/AddToCartIcon";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import ProductTimeline from "@/components/product/ProductTimeline";
import ProductAccordions, { AccordionItem } from "@/components/product/ProductAccordions";
import TrustBadges from "@/components/product/TrustBadges";
import ProductReviews from "@/components/product/ProductReviews";
import RecommendedProducts from "@/components/product/RecommendedProducts";
import RecentlyViewed from "@/components/product/RecentlyViewed";
import FarmerSection from "@/components/product/FarmerSection";
import ReviewSection from "@/components/product/ReviewSection";
import { useWishlist } from "@/context/WishlistContext";
import ShippingAvailability from "@/components/product/ShippingAvailability";

export default function ProductPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { toggleWishlist, isFavorited } = useWishlist();
  const { language, t, changeLanguage } = useLanguage();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [hideSticky, setHideSticky] = useState(false);

  const getVariantQuantity = (variant) => {
    if (!variant) return 0;
    const rawValue = variant.quantity ?? variant.stock ?? variant.inventory ?? 0;
    const value = Number(rawValue);
    return Number.isFinite(value) ? value : 0;
  };

  const getDefaultVariant = (variants = []) => {
    const validVariants = Array.isArray(variants) ? variants : [];
    if (!validVariants.length) return null;
    const defaultVariant = validVariants.find(
      (v) => (v.isDefault || v.is_default || v.default) && getVariantQuantity(v) > 0
    );
    if (defaultVariant) return defaultVariant;
    return validVariants.find((v) => getVariantQuantity(v) > 0) || validVariants[0];
  };

  const productVariants = Array.isArray(product?.variants) ? product.variants : [];
  const rawInventory = product?.inventory ?? product?.stock ?? 0;
  const productInventory = productVariants.length
    ? productVariants.reduce((sum, variant) => sum + getVariantQuantity(variant), 0)
    : Number.isFinite(Number(rawInventory))
      ? Number(rawInventory)
      : 0;

  const selectedVariantQuantity = getVariantQuantity(selectedVariant);
  const selectedVariantOutOfStock = selectedVariant
    ? selectedVariantQuantity <= 0
    : productInventory <= 0;
  const productOutOfStock = productInventory <= 0;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();
        
        if (data.success && data.data) {
          const p = data.data;
          console.log(p);
          
          const normalizedVariants = Array.isArray(p.variants) ? p.variants : [];
          const defaultVariant = getDefaultVariant(normalizedVariants);

          setProduct({
            ...p,
            images: p.images?.length > 0 ? p.images.map(img => img.url) : ["/placeholder.png"],

            farmer: p.farmer
              ? {
                  ...p.farmer,
                  image:
                    p.farmer.image ||
                    p.farmer.profile_pic ||
                    p.farmer.photo ||
                    "/farmer-placeholder.png",
                }
              : null,
          });

          if (defaultVariant) {
            setSelectedVariant(defaultVariant);
          }
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchProduct();
  }, [slug]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    if (!product || typeof window === "undefined") return;

    const storageKey = "recentlyViewedProducts";
    try {
      const stored = localStorage.getItem(storageKey);
      const existing = stored ? JSON.parse(stored) : [];
      const recentItem = {
        id: product.id,
        slug: product.slug,
        name: product.name,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        image: product.images?.[0] || "/placeholder.png",
        tags: product.tags,
        category: product.categoryName || "",
        farmerName: product.farmerName || "",
        variants: product.variants || [],
      };

      const updated = [recentItem, ...existing.filter(item => item.id !== recentItem.id && item.slug !== recentItem.slug)];
      const trimmed = updated.slice(0, 10);
      localStorage.setItem(storageKey, JSON.stringify(trimmed));
      window.dispatchEvent(new Event("recentlyViewedUpdated"));
    } catch (error) {
      console.error("Failed to update recently viewed products:", error);
    }
  }, [product]);

  useEffect(() => {
  const handleScroll = () => {
    const trigger = document.getElementById("add-to-cart-section");

    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    setShowStickyBar(rect.bottom < 0);
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);


useEffect(() => {
  const handleFooter = () => {
    const footer = document.getElementById("site-footer");
    if (!footer) return;

    const rect = footer.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    setHideSticky(rect.top <= windowHeight);
  };

  window.addEventListener("scroll", handleFooter);
  return () => window.removeEventListener("scroll", handleFooter);
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

  const shareUrl = currentUrl || (typeof window !== 'undefined' ? window.location.href : '');
  const shareText = `${getTranslated(product?.name || '')} ${shareUrl}`.trim();

  const handleCopyLink = async () => {
    const fallbackCopy = (text) => {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        return successful;
      } catch (err) {
        return false;
      }
    };

    try {
      let success = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        success = true;
      } else {
        success = fallbackCopy(shareUrl);
      }

      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } else {
        console.error('Copy failed: clipboard not available');
      }
    } catch (error) {
      console.error('Copy failed:', error);
      fallbackCopy(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
    x: `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    email: `mailto:?subject=${encodeURIComponent(getTranslated(product?.name || 'Product'))}&body=${encodeURIComponent(shareText)}`,
  };

  const handleAddToCart = () => {
    if (!product || productOutOfStock || selectedVariantOutOfStock) return;
    
    const finalPrice = selectedVariant ? selectedVariant.price : product.price;
    const finalName = selectedVariant
      ? `${getTranslated(product.name)} (${selectedVariant.title})`
      : getTranslated(product.name);
      
    addToCart({
      ...product,
      id: selectedVariant ? selectedVariant.id : product.id,
      name: finalName,
      price: finalPrice,
      quantity: quantity,
      image: product.images[activeImage]
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-green-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#14532d]"></div>
    </div>
  );

  if (!product || product.status?.toString().toUpperCase() === 'DRAFT') return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-green-50 p-10 text-center">
        <div>
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Product Not Found</h1>
            <p className="text-slate-500 mt-4">The product you're looking for doesn't exist, is not published, or has been removed.</p>
            <Link href="/" className="inline-block mt-8 bg-[#14532d] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest">Back to Home</Link>
        </div>
    </div>
  );

  const displayPrice = selectedVariant ? selectedVariant.price : product.price;
  const displayOldPrice = selectedVariant ? selectedVariant.compareAtPrice : product.compareAtPrice;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 pb-20 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT: Product Gallery */}
          <div className="lg:col-span-6 relative">
            <div className="lg:sticky lg:top-[120px] flex flex-col md:flex-row gap-3 sm:gap-4"> 
              {/* The inner wrapper (Sticks and stays h-fit) */}
              
              <div className="order-2 md:order-1 flex md:flex-col gap-2 sm:gap-3 min-w-[60px] sm:min-w-[80px]">
                {product.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-[#14532d]' : 'border-transparent hover:border-gray-200'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                  </button>
                ))}
              </div>
              
              <div className="order-1 md:order-2 flex-1 relative max-h-[70vh] rounded-[48px] overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                <img 
                  src={product.images[activeImage]} 
                  alt={getTranslated(product.name)}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div className="lg:col-span-6 flex flex-col ">
            <div className="mb-2">
              <span className={`${productOutOfStock ? 'bg-emerald-50 text-emerald-700' : 'bg-emerald-50 text-emerald-700'} text-sm font-black px-3 py-1.5 rounded-full uppercase tracking-widest`}>
                {productOutOfStock ? t('out_of_stock') : t('in_stock')}
              </span>
            </div>

            <div className="mt-3 flex items-start justify-between gap-2">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#14532d] leading-tight">
                {getTranslated(product.name)}
              </h1>
             <button
                  type="button"
                  onClick={() => setIsShareOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#14532d] bg-white px-3 py-1.5 text-[10px] sm:px-4 sm:py-2 sm:text-[11px] font-black uppercase tracking-wider text-[#14532d] hover:bg-[#14532d] hover:text-white transition-all w-fit"
                >
                  <FaShareAlt size={14} />
                  <span className="hidden sm:inline">
                    {t('share')}
                  </span>
                </button>
            </div>

            {/* Tags */}
            {product.tags && (
              <div className="flex flex-wrap gap-2 mt-4">
                {product.tags.split(',').map((tag, i) => (
                  <span key={i} className="bg-emerald-50 text-emerald-700 text-[7px] font-black px-2.5 py-1.5 rounded-full uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5">
                    <FaTag size={8} /> {tag.trim()}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 mt-6">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} size={14} className="text-[#FBBF24]" />
                ))}
              </div>
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                5.0 ({product.reviews?.length || 0} {t('reviews')})
              </span>
            </div>

            {/* Price section */}
            <div className="mt-4 mb-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-2xl md:text-4xl font-bold text-[#14532d]">₹{displayPrice}</span>
                {displayOldPrice && (
                  <span className="text-sm sm:text-base md:text-lg line-through text-gray-300 font-medium ml-2">₹{displayOldPrice}</span>
                )}
              </div>
            </div>

            {/* Summary description (HTML) */}
            {/* <div 
                className="text-gray-600 leading-relaxed font-normal mb-8 prose-sm"
                dangerouslySetInnerHTML={{ __html: getTranslated(product.summaryHtml || product.shortDesc) }}
            /> */}

            {/* Variants Selector */}
            {product.variants && product.variants.length > 0 && (
                <div className="mt-4 mb-4">
                    {/* <label className="text-sm font-black tracking-widest text-gray-400 uppercase mb-3 block">
                        {t('select_variant')}
                    </label> */}
                    <div className="flex flex-wrap gap-2">
                        {product.variants.map((v) => {
                            const variantStock = getVariantQuantity(v);
                            const isVariantOutOfStock = variantStock <= 0;
                            return (
                              <button
                                  key={v.id}
                                  disabled={isVariantOutOfStock}
                                  onClick={() => setSelectedVariant(v)}
                                  className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all ${
                                      selectedVariant?.id === v.id
                                          ? "bg-[#14532d] text-white border-[#14532d]"
                                          : isVariantOutOfStock
                                            ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                                            : "border-slate-100 bg-white text-slate-500 hover:border-slate-200"
                                  }`}
                              >
                                  {v.title}
                                  {isVariantOutOfStock && (
                                    <span className="ml-2 text-[8px] uppercase tracking-[0.2em] text-gray-300">
                                      {t('out_of_stock') || 'Sold Out'}
                                    </span>
                                  )}
                              </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Quantity and Add to Cart */}
            {/* <div  id="add-to-cart-section" className="flex flex-col sm:flex-row gap-2 mb-4">
              <div className="flex items-center justify-between border-2 border-slate-100 rounded-2xl px-5 py-1 bg-white min-w-[140px] sm">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-1 hover:bg-gray-50 rounded-lg text-gray-300 hover:text-[#14532d] transition-colors"
                >
                  <FaMinus size={18} />
                </button>
                <span className="font-black text-xl text-slate-900 px-4">{quantity}</span>
                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="p-1 hover:bg-gray-50 rounded-lg text-gray-300 hover:text-[#14532d] transition-colors"
                >
                  <FaPlus size={18} />
                </button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                disabled={productOutOfStock || selectedVariantOutOfStock}
                className={`flex-[2] py-5 rounded-2xl font-black flex items-center justify-center gap-3 transition-all shadow-2xl shadow-[#14532d]/20 active:scale-[0.98] ${
                  productOutOfStock || selectedVariantOutOfStock
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-[#14532d] text-white hover:bg-[#114224]'
                }`}
              >
                <AddToCartIcon size={20} />
                <span className="tracking-widest text-xs uppercase">{t('add_to_cart')}</span>
              </button>
            </div> */}

            <div id="add-to-cart-section" className="flex flex-row gap-2 mb-4">

            {/* Quantity */}
            <div className="flex items-center justify-between border border-slate-200 rounded-xl px-3 py-1 bg-white w-[110px] sm:w-auto">
                <button 
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-1 text-gray-400 hover:text-[#14532d]"
                >
                  <FaMinus size={14} />
                </button>

                <span className="font-black text-sm text-slate-900 px-2">
                  {quantity}
                </span>

                <button 
                  onClick={() => setQuantity(q => q + 1)}
                  className="p-1 text-gray-400 hover:text-[#14532d]"
                >
                  <FaPlus size={14} />
                </button>
            </div>

            {/* Add To Cart */}
            <button 
              onClick={handleAddToCart}
              disabled={productOutOfStock || selectedVariantOutOfStock}
              className={`flex-1 py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all 
              ${productOutOfStock || selectedVariantOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-[#14532d] text-white hover:bg-[#114224]'
              }`}
            >
              <AddToCartIcon size={16} />
              <span className="text-[11px] uppercase tracking-wider">
                {t('add_to_cart')}
              </span>
            </button>

         </div>

            {selectedVariantOutOfStock && !productOutOfStock && (
                <div className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-rose-600">
                  {t('selected_variant_out_of_stock') || 'Selected variant is out of stock'}
                </div>
            )}
            <div className="flex gap-4 mb-4">
              <button className="flex-1 border-2 border-[#14532d] text-[#14532d] py-3 rounded-2xl font-black tracking-widest text-xs uppercase hover:bg-[#14532d] hover:text-white transition-all">
                {t('buy_now')}
              </button>
              <button 
                onClick={() => toggleWishlist(product.id)}
                className={`px-8 border-2 rounded-2xl flex items-center justify-center transition-all ${
                  isFavorited(product.id)
                    ? "border-[#14532d] bg-[#14532d] text-slate-100"
                    : "border-slate-100 bg-slate-50 text-slate-400 hover:border-[#14532d] hover:text-[#14532d]"
                }`}
              >
                <FaHeart size={18} />
              </button>
            </div>

            {/* Shipping Availability Check */}
            <div className="mb-8">
               <ShippingAvailability productId={product.id} />
            </div>

            {/* Description Accordion (Body HTML) */}
            <div className="mt-0 border-b border-gray-100">
              <AccordionItem title={t('full_details')} defaultOpen={false}>
                <div 
                    className="w-full text-gray-600 leading-relaxed py-4 break-words whitespace-normal"
                    dangerouslySetInnerHTML={{ __html: getTranslated(product.bodyHtml || product.description) }}
                />
              </AccordionItem>
            </div>

            {/* <div className="mt-8">
                 <ProductTimeline />
            </div> */}

            {/* Farmer Section */}
            {/* Farmer Section removed in favor of Accordion style */}

            {/* Rewards Box */}
            {/* <div className="bg-emerald-50 rounded-[32px] p-8 flex items-start gap-6 mt-4 mb-4 border border-emerald-100">
              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-[#14532d] shadow-sm shrink-0">
                <FaCheck size={28} />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="font-black text-[#14532d] text-sm tracking-widest uppercase mb-1">{t('prakrushi_promise')}</h3>
                <p className="text-sm text-emerald-800 font-bold leading-tight">100% Prakrutik & Farm Fresh. Shop for ₹999/- & Get Free Shipping!</p>
              </div>
            </div> */}

            {/* Quick Features */}
           <div className="mt-2 grid grid-cols-2 gap-2 sm:gap-4">
                  {[
                      { icon: <FaTruck />, text: t('free_shipping') },
                      { icon: <FaShieldAlt />, text: t('secure_pay') },
                      { icon: <FaAward />, text: t('best_quality') },
                      { icon: <FaUsers />, text: `8L+ ${t('customers')}` }
                  ].map((item, i) => (
                      <div 
                          key={i} 
                          className="flex items-center gap-2 sm:gap-3 bg-slate-50 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100/50"
                      >
                          {/* Smaller icon size for mobile */}
                          <div className="text-emerald-600 text-sm sm:text-lg shrink-0">
                              {item.icon}
                          </div>
                          
                          {/* Micro-typography for mobile text */}
                          <span className="text-[9px] sm:text-sm font-black tracking-[0.1em] sm:tracking-widest text-slate-900 uppercase leading-tight">
                              {item.text}
                          </span>
                      </div>
                  ))}
              </div>

            {/* Policy Accordions */}
            <ProductAccordions product={product} />

            {/* Metafields / Specifications */}
            {product.metafields && product.metafields.length > 0 && (
                <div className="mt-8 bg-white rounded-[32px] p-8 border border-emerald-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                       <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <FaAward size={14} />
                       </div>
                       <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-800">{t('specifications') || "Technical Specifications"}</h4>
                    </div>
                    <div className="grid grid-cols-1 gap-1">
                        {product.metafields.map((meta, idx) => (
                            <div key={idx} className="flex justify-between items-center py-3 border-b border-emerald-50 last:border-0 hover:bg-emerald-50/30 px-3 rounded-xl transition-colors">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">{meta.key.replace(/_/g, ' ')}</span>
                                <span className="text-sm font-bold text-slate-900">{meta.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Trust Badges */}
            <TrustBadges />

          </div>
        </div>
      </div>

       <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4">
          <ProductReviews 
            productId={product.id}
            rating={product.rating}
            reviews={product.reviews || []} 
          />
      </div>

       <div id="farmer-reviews" className="max-w-[1440px] mx-auto px-4 sm:px-6 py-6 pb-20 border-t border-emerald-50">
          <ReviewSection 
            farmerId={product.farmerId}
            title={`${product.farmer?.user?.name?.en || "Farmer"} Feedback`}
            ctaText="REVIEW THIS FARMER"
            emptyText="How was your experience with this farmer's produce? Your feedback helps them grow better!"
          />
      </div>

      <RecommendedProducts />
      <RecentlyViewed />

      {isShareOpen && (
        <div onClick={() => setIsShareOpen(false)} className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-[28px] bg-white shadow-2xl border border-[#E6F2EB] p-6">

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#14532d]/10 flex items-center justify-center text-[#14532d]">
                  <FaShareAlt />
                </div>
                <h3 className="text-lg font-black text-[#14532d]">
                  Share Link
                </h3>
              </div>

              <button
                onClick={() => setIsShareOpen(false)}
                className="text-gray-400 hover:text-[#14532d] text-xl"
              >
                ×
              </button>
            </div>

            {/* Link Box */}
            <div className="bg-[#F6FBF7] border border-[#E3F1E9] rounded-2xl p-3 flex items-center gap-2">
              <input
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent outline-none text-sm text-gray-600"
              />

              <button
                onClick={handleCopyLink}
                className="bg-[#14532d] text-white px-3 py-2 rounded-xl text-sm font-semibold hover:bg-[#0f3f28]"
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            {/* Share Title */}
            <p className="text-xs font-bold tracking-widest text-gray-400 mt-6 mb-4 uppercase">
              Share using
            </p>

            {/* Social Icons */}
            <div className="grid grid-cols-4 gap-4">

              {/* Facebook */}
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shadow-md">
                  <FaFacebookF />
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  Facebook
                </span>
              </a>

              {/* WhatsApp */}
              <a
                href={shareLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-md">
                  <FaWhatsapp />
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  WhatsApp
                </span>
              </a>

              {/* X */}
              <a
                href={shareLinks.x}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center shadow-md">
                  <FaTwitter />
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  X
                </span>
              </a>

              {/* Email */}
              <a
                href={shareLinks.email}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-xl bg-[#EA4335] text-white flex items-center justify-center shadow-md">
                  <FaEnvelope />
                </div>
                <span className="text-xs font-semibold text-gray-500">
                  Email
                </span>
              </a>

            </div>

          </div>

        </div>
      )}

      {/* Sticky Product Bar */}
      {showStickyBar && !hideSticky && product && (
        <div className="fixed bottom-4 left-0 right-0 z-50 px-4 sm:px-8 transition-all duration-300 animate-slideUp">
          
          <div className="max-w-[800px] mx-auto bg-white border border-gray-100 shadow-xl rounded-2xl px-4 py-3 flex items-center justify-between gap-4">

            <div className="flex items-center gap-3 min-w-0">
              
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={product.images?.[0]}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0 flex gap-3 items-center">
                <p className="hidden sm:block text-sm font-bold text-[#14532d] truncate">
                  {getTranslated(product.name)}
                </p>

                <p className="text-xl font-black text-gray-900">
                  ₹ {displayPrice}
                </p>

                <p className="text-sm sm:text-base md:text-lg line-through text-gray-300 font-medium">
                  ₹ {displayOldPrice}
                </p>
              </div>

            </div>

            <button
              onClick={handleAddToCart}
              className="bg-[#14532d] hover:bg-[#114224] text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap shadow-lg"
            >
              {t("add_to_cart")}
            </button>

          </div>

        </div>
      )}
    </div>
  );
}
