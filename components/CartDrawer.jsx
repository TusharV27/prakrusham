"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { X, ShoppingBag, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CheckoutModal from "./checkout/CheckoutModal";

export default function CartDrawer() {
  const { 
    isDrawerOpen, 
    closeDrawer, 
    cartItems, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    shippingInfo, 
    setShippingInfo 
  } = useCart();
  const { language } = useLanguage();
  const [isRitualModalOpen, setIsRitualModalOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [taxSettings, setTaxSettings] = useState({
    defaultTaxRate: 5.0,
    pricesIncludeTax: false,
    chargeTaxOnShipping: false
  });

  const getTranslatedLocal = (field, lang = language) => {
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
    const fetchSuggestions = async () => {
      if (!isDrawerOpen) return;
      try {
        setLoadingSuggestions(true);
        const itemIds = cartItems.map(item => item.slug || item.productId || item.id).join(",");
        const res = await fetch(`/api/cart/recommendations?cartItemIds=${itemIds}`);
        const data = await res.json();
        if (data.success) {
          setSuggestions(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const fetchTaxSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings/taxes');
        const data = await res.json();
        if (data.success) {
          setTaxSettings(data.data);
        }
      } catch (error) {
        console.error("Failed to fetch tax settings:", error);
      }
    };

    fetchSuggestions();
    fetchTaxSettings();
  }, [isDrawerOpen, cartItems.length]);

  const handleAddSuggestion = (item) => {
    addToCart({
      ...item,
      name: getTranslatedLocal(item.name),
      quantity: 1,
      image: item.image || "/placeholder.png"
    });
  };

  return (
    <>
      <CheckoutModal 
        isOpen={isRitualModalOpen} 
        onClose={() => setIsRitualModalOpen(false)} 
      />
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDrawer}
              className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            />

            {/* Drawer Container */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-4xl flex-col bg-white md:flex-row"
            >
              {/* Left Section: Suggestions */}
              <div className="hidden h-full flex-1 overflow-y-auto bg-[#fdfaf5] p-8 md:block">
                <span className="text-sm font-bold uppercase tracking-widest text-[#16a34a]">
                  Complete Your Ritual
                </span>
                <h2 className="mt-2 text-3xl font-bold text-[#14532d]">
                  Handpicked For You
                </h2>

                <div className="mt-10 space-y-6">
                  {loadingSuggestions ? (
                    <div className="flex flex-col gap-4">
                      {[1, 2, 3].map(i => <div key={i} className="h-32 w-full animate-pulse rounded-[24px] bg-white/50" />)}
                    </div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((item) => (
                      <div
                        key={`suggestion-${item.id}`}
                        className="group flex items-center justify-between rounded-[24px] border border-[#14532d]/10 bg-white p-4 transition-all hover:border-[#14532d]/30 hover:shadow-lg"
                      >
                        <div className="flex items-center gap-4">
                          <Link href={`/products/${item.slug || item.id}`} onClick={closeDrawer} className="relative h-20 w-20 overflow-hidden rounded-2xl bg-[#fdfaf5]">
                            <Image
                              src={item.image || "/placeholder.png"}
                              alt={getTranslatedLocal(item.name)}
                              fill
                              className="object-cover transition-transform group-hover:scale-110"
                            />
                          </Link>
                          <div>
                            <Link href={`/products/${item.slug || item.id}`} onClick={closeDrawer}>
                              <h3 className="text-sm font-bold text-[#14532d] hover:text-[#16a34a] transition">
                                {getTranslatedLocal(item.name)}
                              </h3>
                            </Link>
                            <p className="mt-1 text-base font-bold text-[#16a34a]">
                              ₹{item.price}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleAddSuggestion(item)}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fdfaf5] text-[#14532d] transition-all hover:bg-[#14532d] hover:text-white"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No suggestions available.</p>
                  )}
                </div>
              </div>

              {/* Right Section: Cart Content */}
              <div className="flex h-full w-full flex-col md:w-[450px]">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#14532d]/10 p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fdfaf5] text-[#16a34a]">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold uppercase tracking-tight text-[#14532d]">
                        Your Cart
                      </h3>
                      <p className="text-sm font-bold uppercase tracking-widest text-[#16a34a]/70">
                        {cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)} Items Selected
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={closeDrawer}
                    className="rounded-full p-2 text-[#14532d]/50 transition-colors hover:bg-[#fdfaf5] hover:text-[#14532d]"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                {/* Items Area */}
                <div className="flex-1 overflow-y-auto p-6">
                  {cartItems.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <div className="flex h-32 w-32 items-center justify-center rounded-full bg-[#fdfaf5]">
                        <ShoppingBag className="h-16 w-16 text-[#16a34a]/20" />
                      </div>
                      <h4 className="mt-8 text-2xl font-bold text-[#14532d]">
                        Your cart is empty
                      </h4>
                      <p className="mt-2 text-sm text-[#14532d]/50">
                        Add some items to start your botanical ritual.
                      </p>
                      <button
                        onClick={closeDrawer}
                        className="mt-10 flex w-full items-center justify-center gap-2 rounded-full bg-[#16a34a] py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-[0_10px_30px_rgba(139,69,19,0.3)] transition-all hover:bg-[#14532d] hover:shadow-xl active:scale-95"
                      >
                        Start Shopping
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {cartItems.map((item) => (
                        <div key={`cart-item-${item.id}`} className="flex gap-4">
                          <Link href={`/products/${item.slug || item.id}`} onClick={closeDrawer} className="relative h-24 w-24 overflow-hidden rounded-2xl bg-[#fdfaf5]">
                            <Image
                              src={item.image || "/placeholder.png"}
                              alt={getTranslatedLocal(item.name)}
                              fill
                              className="object-cover"
                            />
                          </Link>

                          <div className="flex flex-1 flex-col justify-between py-1">
                            <div>
                              <Link href={`/products/${item.slug || item.id}`} onClick={closeDrawer}>
                                <h4 className="font-bold text-[#14532d] hover:text-[#16a34a] transition">
                                  {getTranslatedLocal(item.name)}
                                </h4>
                              </Link>
                              <p className="mt-1 text-sm font-bold text-[#16a34a]">
                                ₹{item.price}
                              </p>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 rounded-full border border-[#14532d]/10 px-3 py-1">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  className="text-[#14532d] transition-opacity hover:opacity-50"
                                >
                                  -
                                </button>
                                <span className="text-sm font-bold">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  className="text-[#14532d] transition-opacity hover:opacity-50"
                                >
                                  +
                                </button>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-sm font-bold uppercase tracking-widest text-[#16a34a] transition-colors hover:text-[#14532d]"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Section */}
                {cartItems.length > 0 && (
                  <div className="border-t border-[#14532d]/10 bg-[#fdfaf5] p-6">
                    <button 
                      onClick={() => {
                        setIsRitualModalOpen(true);
                        closeDrawer();
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-full bg-[#16a34a] py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-lg transition-all hover:bg-[#14532d] hover:shadow-xl"
                    >
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
