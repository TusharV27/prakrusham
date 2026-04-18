"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, Heart, OctagonX } from "lucide-react";
import AddToCartIcon from "@/components/icons/AddToCartIcon";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useWishlist } from "@/context/WishlistContext";
import { getTranslated } from "@/utils/translation";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { language, t } = useLanguage();
  const { toggleWishlist, isFavorited } = useWishlist();

  if (product.status === "draft" || product.status === "DRAFT") {
    return null;
  }

  const favorited = isFavorited(product.id || product.slug);
  const variantQuantity = (variant) => {
    if (variant == null) return 0;
    const rawValue = variant.quantity ?? variant.stock ?? variant.inventory;
    const value = Number(rawValue);
    return Number.isFinite(value) ? value : 0;
  };

  const availableStock = product.inventory ?? product.stock ?? (product.variants || []).reduce((sum, variant) => {
    return sum + variantQuantity(variant);
  }, 0);
  const productHasStock = availableStock > 0;

  // Local helper for centralized translation
  const gt = (field) => getTranslated(field, language);

  const fallbackVariants = [
    { title: "250g", price: product.price, multiplier: 1 },
    { title: "500g", price: Math.round(product.price * 1.9), multiplier: 1.9 },
    { title: "1kg", price: Math.round(product.price * 3.6), multiplier: 3.6 },
  ];

  const variants = product.variants?.length > 0 ? product.variants : fallbackVariants;
  const getVariantKey = (variant) => String(variant?.id ?? variant?.title ?? variant?.label ?? "");

  const getInitialVariant = () => {
    if (!product.variants?.length) return variants[0];
    const defaultVariant = variants.find((v) => v.isDefault && variantQuantity(v) > 0);
    if (defaultVariant) return defaultVariant;
    return variants.find((v) => variantQuantity(v) > 0) || variants[0];
  };

  const [selectedVariantKey, setSelectedVariantKey] = useState(getVariantKey(getInitialVariant()));
  const selectedVariant = variants.find((v) => getVariantKey(v) === selectedVariantKey) || variants[0];

  useEffect(() => {
    setSelectedVariantKey(getVariantKey(getInitialVariant()));
  }, [product.id, product.slug, variants]);

  const isCombo = product.category === "Combo Offer" || product.categoryId === "combo-id";

  const rawPrice = selectedVariant?.price ?? product.price ?? 0;
  const currentPrice = Number(rawPrice.toString().replace(/[^0-9.]/g, ""));
  const currentOldPrice = selectedVariant?.compareAtPrice || 
    (product.compareAtPrice ? Math.round(product.compareAtPrice * (selectedVariant?.multiplier || 1)) : null);

  const selectedVariantStock = product.variants?.length > 0 ? variantQuantity(selectedVariant) : availableStock;
  const selectedVariantOutOfStock = selectedVariantStock <= 0;
  const isOutOfStock = !productHasStock;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedVariantOutOfStock) return;

    const finalName = `${gt(product.name)} (${selectedVariant?.title || selectedVariant?.label || "Default"})`;

    addToCart({
      ...product,
      // Important: cart logic (and backend) expects `productId` to refer to Product.id (or a stable slug),
      // not a variant id. Some UI paths override `id` for display uniqueness, so always pass `productId`.
      productId: product.slug || product.id,
      variantId: selectedVariant?.id || null,
      name: finalName,
      price: currentPrice,
      quantity: 1,
      image: product.image || product.images?.[0]?.url || "/placeholder.png",
    });
  };

  const productLink = `/products/${product.slug || product.id}`;

  return (
    <div className={`group block h-full ${isOutOfStock ? "opacity-90" : ""}`}>
      <div className="bg-white border border-gray-100 rounded-[24px] transition-all duration-500 overflow-hidden flex flex-col h-full relative">
        
        {/* Image Container */}
        <Link href={productLink}  className="block min-w-0" >
          <div className="relative aspect-square overflow-hidden bg-[#f8fcf9]">
            <Image
              src={product.image || product.images?.[0]?.url || "/placeholder.png"}
              alt={gt(product.name)}
              width={400}
              height={400}
              className={`w-full h-full object-cover transition duration-700 group-hover:scale-105 ${isOutOfStock ? "grayscale-[0.5]" : ""}`}
              loading="lazy"
            />
            <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
              {isOutOfStock ? (
                <div className="bg-red-600 text-white text-[9px]  uppercase tracking-widest px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                  <OctagonX size={10} /> {t("out_of_stock") || "Sold Out"}
                </div>
              ) : (
                (product.discount || product.compareAtPrice) && (
                  <div className="bg-[#14532d] text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
                    {product.discount || "SALE"}
                  </div>
                )
              )}
            </div>
          </div>
        </Link>

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product.id || product.slug);
          }}
          className={`absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full shadow-sm transition-all duration-300 z-10 ${
            favorited ? "bg-[#14532d] text-white" : "bg-white/90 backdrop-blur-sm text-gray-400 hover:bg-[#14532d] hover:text-white"
          }`}
        >
          <Heart size={14} fill={favorited ? "currentColor" : "none"} />
        </button>

        {/* Content */}
        <div className="p-3 sm:p-4 flex flex-col flex-grow bg-white">
          <div className="mb-1">
            {product.farmerName && (
              <div className="">
                <span className="text-sm font-black text-gray-400 py-0.5 rounded-md">{product.farmerName}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1 mt-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={i < Math.round(product.rating || 0) ? "text-amber-400 fill-amber-400" : "text-gray-200"}
                />
              ))}
              <span className="text-sm text-slate-400 font-bold ml-1">
                {product.rating > 0 ? product.rating.toFixed(1) : "0.0"} ({product.reviewCount || 0})
              </span>
            </div>

            <Link href={productLink}  className="block min-w-0" >
              <h3
  title={gt(product.name)}
  className="text-sm font-black text-[#14532d] capitalize truncate min-w-0"
>
  {gt(product.name)}
</h3>
            </Link>

              

            {/* Variant Tabs - Clean & Compact */}
            {!isCombo && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {variants.map((v) => {
                  const key = getVariantKey(v);
                  const isSelected = selectedVariantKey === key;
                  const variantStock = product.variants?.length > 0 ? variantQuantity(v) : availableStock;
                  const variantOut = variantStock <= 0;

                  return (
                    <button
                      key={key}
                      disabled={variantOut}
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedVariantKey(key);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all duration-200 uppercase tracking-tighter border ${
                        isSelected
                          ? "bg-[#14532d] border-[#14532d] text-white shadow-sm"
                          : variantOut
                            ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                            : "bg-white border-slate-100 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                      }`}
                    >
                      {v.title || v.label}
                      {variantOut && product.variants?.length > 0 && (
                        <span className="ml-1 text-[8px] uppercase tracking-normal text-gray-300">
                          {t("out_of_stock") || "Sold Out"}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {selectedVariantOutOfStock && !isOutOfStock && (
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
                {t("selected_variant_out_of_stock") || "Selected variant is out of stock"}
              </p>
            )}

          </div>

          {/* Bottom Section */}
          <div className="mt-auto pt-2 border-t border-slate-50">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-row items-center gap-2">
                <span className={`text-[15px] sm:text-base font-black leading-tight ${isOutOfStock ? "text-slate-400" : "text-[#14532d]"}`}>
                  ₹{currentPrice}
                </span>
                {currentOldPrice && (
                  <span className="text-[12px] line-through text-slate-300 font-bold">
                    ₹{currentOldPrice}
                  </span>
                )}
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`h-9 flex items-center justify-center gap-2 rounded-xl transition-all duration-300 active:scale-95 shadow-sm 
                  ${isOutOfStock 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed px-2" 
                    : "bg-[#14532d] text-white hover:bg-[#114224] px-1 sm:px-2"
                  } 
                  ${isCombo ? "w-full mt-2" : "flex-none w-auto px-3"}
                `}
              >
                {isOutOfStock ? (
                  <>
                  <OctagonX size={14} className="sm:hidden" />
                  <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest">
                    {t("out_of_stock") || "Sold Out"}
                  </span>
                  </>
                ) : (
                  <>
                    <AddToCartIcon size={14} className="shrink-0" />
                    <span className="hidden sm:inline text-[10px] font-black uppercase tracking-normal sm:tracking-wider">
                      {t("add_to_cart") || "Add to Cart"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
