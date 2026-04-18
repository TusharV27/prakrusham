"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { X, Phone, Lock, ArrowRight, User, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";

export default function LoginPopup() {
  const { isLoginOpen, closeLogin, login } = useAuth();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isLoginOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (data.success) {
        setIsOtpSent(true);
      } else {
        setError(data.message || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();

      if (data.success) {
        login(data.user);
      } else {
        setError(data.message || "Invalid OTP. Please check and try again.");
      }
    } catch (error) {
      setError("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeLogin}
          className="fixed inset-0 bg-[#14532d]/40 backdrop-blur-md"
        />

        {/* Popup Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-[0_25px_50px_-12px_rgba(58,38,29,0.25)]"
        >
          {/* Decorative Top Border */}
          <div className="h-2 w-full bg-[#16a34a]" />

          <button
            onClick={closeLogin}
            className="absolute right-6 top-8 rounded-full p-2 text-[#14532d]/30 transition-colors hover:bg-[#fdfaf5] hover:text-[#14532d]"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="p-8 pt-12 text-center">
            <h2 className="text-3xl font-bold text-[#14532d]">
              {isOtpSent ? "Verify OTP" : "Welcome to Prakrusham"}
            </h2>
            <p className="mt-2 text-sm text-[#14532d]/60">
              {isOtpSent 
                ? `Enter the 6-digit code sent to ${phone}` 
                : "Enter your phone number to receive a WhatsApp OTP."}
            </p>

            <form onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp} className="mt-10 space-y-4 text-left">
              {!isOtpSent ? (
                <div className="group relative">
                  <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#14532d]/30 transition-colors group-focus-within:text-[#16a34a]" />
                  <input
                    type="tel"
                    required
                    disabled={isLoading}
                    placeholder="Phone Number (e.g. 9876543210)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-2xl border border-[#14532d]/10 bg-[#fdfaf5]/50 py-4 pl-12 pr-4 text-sm font-medium outline-none transition-all focus:border-[#16a34a] focus:bg-white focus:ring-4 focus:ring-[#16a34a]/5"
                  />
                </div>
              ) : (
                <div className="group relative">
                  <ShieldCheck className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#14532d]/30 transition-colors group-focus-within:text-[#16a34a]" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    disabled={isLoading}
                    placeholder="Enter 6-digit Code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full rounded-2xl border border-[#14532d]/10 bg-[#fdfaf5]/50 py-4 pl-12 pr-4 text-center text-lg font-bold tracking-[0.5em] outline-none transition-all focus:border-[#16a34a] focus:bg-white focus:ring-4 focus:ring-[#16a34a]/5"
                  />
                </div>
              )}

              {error && (
                <p className="text-xs font-bold text-red-500 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#14532d] py-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all hover:bg-[#251812] hover:shadow-2xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : (isOtpSent ? "Verify & Login" : "Send WhatsApp OTP")}
                {!isLoading && <ArrowRight className="h-4 w-4" />}
              </button>

              {isOtpSent && (
                <button
                  type="button"
                  onClick={() => setIsOtpSent(false)}
                  className="mt-2 w-full text-center text-[11px] font-bold uppercase tracking-widest text-[#16a34a] hover:text-[#14532d]"
                >
                  Change Phone Number
                </button>
              )}
            </form>

            <p className="mt-8 text-sm text-[#14532d]/40 px-6">
              By continuing, you agree to Prakrusham's Terms of Service and Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
