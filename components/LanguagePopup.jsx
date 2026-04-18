"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { X, Globe, Check } from "lucide-react";

export default function LanguagePopup() {
  const { language, changeLanguage, isLanguageOpen, closeLanguage } = useLanguage();

  if (!isLanguageOpen) return null;

  const languages = [
    { name: "English", code: "en", local: "English", font: "font-sans" },
    { name: "Hindi", code: "hi", local: "हिन्दी", font: "font-serif" },
    { name: "Gujarati", code: "gu", local: "ગુજરાતી", font: "font-sans" }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
        {/* Minimalist Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeLanguage}
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px]"
        />

        {/* Compact & Proper Popup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          className="relative w-full max-w-[400px] overflow-hidden rounded-[24px] bg-white shadow-2xl p-6 border border-gray-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <div className="bg-[#f0f9f1] p-2 rounded-xl">
                 <Globe className="h-5 w-5 text-[#0c831f]" />
               </div>
               <h2 className="text-[18px] font-bold text-gray-800 tracking-tight">Select Language</h2>
            </div>
            <button
               onClick={closeLanguage}
               className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
            >
               <X className="h-4 w-4" />
            </button>
          </div>

          {/* Prompt Message */}
          <p className="text-[13px] font-medium text-gray-500 mb-6 px-1">
             Your text and notifications will appear in your preferred language.
          </p>

          {/* Grid Layout Cards */}
          <div className="flex flex-col gap-2.5">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  changeLanguage(lang.code);
                  setTimeout(closeLanguage, 400); // Tiny delay to show checkmark
                }}
                className={`group relative flex items-center justify-between rounded-[20px] border-2 px-5 py-4 transition-all duration-200 ${
                  language === lang.code
                    ? "border-[#0c831f] bg-[#f7fdf8]"
                    : "border-gray-50 bg-white hover:border-gray-100 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-4">
                   <div className={`h-10 w-10 flex items-center justify-center rounded-xl text-[12px] font-black tracking-wider transition-colors ${
                      language === lang.code ? "bg-[#0c831f] text-white" : "bg-white border border-gray-100 text-gray-400 group-hover:text-gray-900 group-hover:border-gray-200"
                   }`}>
                      {lang.code.toUpperCase()}
                   </div>
                   <div className="text-left">
                      <p className={`text-[15px] font-bold text-gray-900 ${lang.font}`}>{lang.local}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{lang.name}</p>
                   </div>
                </div>
                
                {language === lang.code ? (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0c831f] text-white">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </div>
                ) : (
                  <div className="h-5 w-5 rounded-full border border-gray-200 group-hover:border-gray-300"></div>
                )}
              </button>
            ))}
          </div>

          {/* Experience Badge */}
          <div className="mt-8 flex items-center justify-center gap-2">
             <div className="h-1 w-1 rounded-full bg-gray-200"></div>
             <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-300">
               Prakrusham Multilingual
             </p>
             <div className="h-1 w-1 rounded-full bg-gray-200"></div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
