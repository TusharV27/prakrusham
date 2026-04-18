"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Phone, MapPin, Truck, CheckCircle2, Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { getTranslated } from "@/utils/translation";

export default function CheckoutModal({ isOpen, onClose }) {
  const { cartItems, shippingInfo, clearCart } = useCart();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    street: "",
    apartment: "",
    city: "",
    state: "",
    pincode: shippingInfo.pincode || "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null); // stores { id, orderNumber }
  const [error, setError] = useState("");

  // Auto-fill user details if logged in
  useEffect(() => {
    if (user && isOpen && !formData.name) {
      const gt = (field) => getTranslated(field, language);
      setFormData(prev => ({
        ...prev,
        name: gt(user.name) || "",
        phone: user.phone || "",
      }));
    }
  }, [user, isOpen]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingCharge = 30; // Static Shipping Charge
  const total = subtotal + shippingCharge;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (formData.phone.length < 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setIsSubmitting(true);

    // Consolidate address
    const fullAddress = `${formData.street}${formData.apartment ? `, ${formData.apartment}` : ""}, ${formData.city}, ${formData.state}`;

    try {
      const response = await fetch("/api/checkout/proceed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: user?.id || null,
          customerName: formData.name,
          customerPhone: formData.phone,
          items: cartItems.map(item => ({
            // Prefer slug (stable across DB restores); server resolves slug->id.
            productId: item.slug || item.product?.slug || item.productId || item.id,
            quantity: item.quantity,
            price: item.price,
            weight: item.weight
          })),
          shippingAddress: fullAddress,
          pincode: formData.pincode,
          subtotal,
          taxAmount: subtotal * 0.05, // Placeholder tax
          shippingCharge,
          shippingMethodName: "Standard Shipping",
          total,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setOrderSuccess({ id: data.orderId, orderNumber: data.orderNumber });
        clearCart();
      } else {
        setError(data.message || "Failed to place order. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen && !orderSuccess) return null;

  return (
    <AnimatePresence>
      {(isOpen || orderSuccess) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={orderSuccess ? null : onClose}
            className="absolute inset-0 bg-[#14532d]/40 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-xl overflow-hidden rounded-[40px] bg-white shadow-2xl"
          >
            {orderSuccess ? (
              <div className="p-10 text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#f0f9f4] text-[#16a34a]">
                  <CheckCircle2 size={48} strokeWidth={1.5} />
                </div>
                <h2 className="text-3xl font-black text-[#14532d] uppercase tracking-tighter">Order Placed!</h2>
                <p className="mt-4 text-slate-500 font-medium">
                  Your ritual has begun. We've received your order and are preparing it with care.
                </p>
                <div className="mt-8 rounded-3xl bg-[#fdfaf5] p-6 border border-[#14532d]/5">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#14532d]/40">Your Order Number</span>
                   <div className="mt-1 text-4xl font-black text-[#14532d] tracking-tight">{orderSuccess.orderNumber}</div>
                </div>
                <button
                  onClick={() => {
                    setOrderSuccess(null);
                    onClose();
                  }}
                  className="mt-10 w-full rounded-full bg-[#14532d] py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl hover:bg-[#114224] transition-all"
                >
                  Continue Journey
                </button>
              </div>
            ) : (
              <div className="relative">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#14532d]/5 p-8">
                  <div>
                    <h2 className="text-2xl font-black text-[#14532d] uppercase tracking-tighter leading-none">Checkout Ritual</h2>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#16a34a]">Finalize your order details</p>
                  </div>
                  <button onClick={onClose} className="rounded-full p-2 text-slate-300 hover:bg-slate-50 hover:text-slate-600 transition-all">
                    <X size={24} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="max-h-[70vh] overflow-y-auto p-8 pt-6">
                  {error && (
                    <div className="mb-6 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-2">
                      {error}
                    </div>
                  )}

                  <div className="space-y-5">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="relative">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#14532d]/50 ml-4 mb-1 block">Full Name</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#14532d]/20" size={16} />
                          <input
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full rounded-2xl border border-[#14532d]/10 bg-[#fdfaf5] py-3.5 pl-11 pr-4 text-sm font-bold focus:border-[#16a34a] focus:outline-none transition-all"
                            placeholder="Your Name"
                          />
                        </div>
                      </div>
                      <div className="relative">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#14532d]/50 ml-4 mb-1 block">Phone Number</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[#14532d]/20" size={16} />
                          <input
                            required
                            type="tel"
                            maxLength={10}
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "") })}
                            className="w-full rounded-2xl border border-[#14532d]/10 bg-[#fdfaf5] py-3.5 pl-11 pr-4 text-sm font-bold focus:border-[#16a34a] focus:outline-none transition-all"
                            placeholder="98765 00000"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="h-px w-full bg-[#14532d]/5 my-2" />

                    {/* Address Details */}
                    <div className="space-y-4">
                      <div className="relative">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#14532d]/50 ml-4 mb-1 block">Street Address</label>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#14532d]/20" size={16} />
                          <input
                            required
                            type="text"
                            value={formData.street}
                            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                            className="w-full rounded-2xl border border-[#14532d]/10 bg-[#fdfaf5] py-3.5 pl-11 pr-4 text-sm font-bold focus:border-[#16a34a] focus:outline-none transition-all"
                            placeholder="House No, Building, Street Name"
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#14532d]/50 ml-4 mb-1 block">Apartment, suite, etc. (optional)</label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.apartment}
                            onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                            className="w-full rounded-2xl border border-[#14532d]/10 bg-[#fdfaf5] py-3.5 px-4 text-sm font-bold focus:border-[#16a34a] focus:outline-none transition-all"
                            placeholder="Apt 101, Floor 2"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="relative">
                          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#14532d]/50 ml-4 mb-1 block">City</label>
                          <input
                            required
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            className="w-full rounded-2xl border border-[#14532d]/10 bg-[#fdfaf5] py-3.5 px-4 text-sm font-bold focus:border-[#16a34a] focus:outline-none transition-all"
                            placeholder="e.g. Surat"
                          />
                        </div>
                        <div className="relative">
                          <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#14532d]/50 ml-4 mb-1 block">State</label>
                          <input
                            required
                            type="text"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            className="w-full rounded-2xl border border-[#14532d]/10 bg-[#fdfaf5] py-3.5 px-4 text-sm font-bold focus:border-[#16a34a] focus:outline-none transition-all"
                            placeholder="e.g. Gujarat"
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <label className="text-[9px] font-black uppercase tracking-[0.2em] text-[#14532d]/50 ml-4 mb-1 block">Pincode</label>
                        <input
                          required
                          type="text"
                          maxLength={6}
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "") })}
                          className="w-full rounded-2xl border border-[#14532d]/10 bg-[#fdfaf5] py-3.5 px-4 text-sm font-bold focus:border-[#16a34a] focus:outline-none transition-all"
                          placeholder="380001"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="mt-8 flex items-center justify-between rounded-3xl bg-[#fdfaf5] p-6 border border-[#14532d]/5">
                     <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#14532d]/40">Total Amount</span>
                        <span className="text-2xl font-black text-[#14532d]">₹{total.toFixed(2)}</span>
                     </div>
                     <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black uppercase tracking-widest text-[#16a34a]">Shipping</span>
                        <span className="text-sm font-bold text-[#14532d]">{shippingCharge === 0 ? "FREE" : `₹${shippingCharge}`}</span>
                     </div>
                  </div>

                  <button
                    disabled={isSubmitting}
                    className="mt-6 flex w-full items-center justify-center gap-3 rounded-full bg-[#16a34a] py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all hover:bg-[#14532d] disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Processing...
                      </>
                    ) : (
                      <>
                        Complete Ritual
                        <Truck size={18} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
