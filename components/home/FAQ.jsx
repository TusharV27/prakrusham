"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);
  const { t } = useLanguage();

  const faqs = [
    { question: t("faq_q1"), answer: t("faq_a1") },
    { question: t("faq_q2"), answer: t("faq_a2") },
    { question: t("faq_q3"), answer: t("faq_a3") },
    { question: t("faq_q4"), answer: t("faq_a4") },
    { question: t("faq_q5"), answer: t("faq_a5") },
  ];

  return (
    <section className="w-full py-6 sm:py-8 md:py-10 lg:py-10 xl:py-14 bg-gradient-to-b from-white to-green-50">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">

        {/* Grid Layout */}
        <div className="grid md:grid-cols-2 gap-10 items-center">

          {/* ✅ Left Image */}
          <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden">
            <img
              src="banners/faq.webp"
              alt="Fresh Vegetables"
              className="w-full h-full object-cover"
            />

            {/* soft overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* ✅ Right Content */}
          <div>

            {/* Header */}
            <div className="mb-10">
              <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-semibold text-green-900">
                {t("faq_title")}
              </h2>

              <div className="mt-4 h-1 w-16 bg-green-600 rounded-full" />
            </div>

            {/* FAQ Items */}
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <motion.div
                  layout
                  key={index}
                  className="rounded-2xl border border-green-900/10 bg-white transition hover:shadow-sm"
                >
                  <button
                    onClick={() =>
                      setActiveIndex(activeIndex === index ? null : index)
                    }
                    className="flex w-full items-center justify-between p-4 text-left"
                  >
                    <span className="text-sm sm:text-base font-medium text-green-900">
                      {faq.question}
                    </span>

                    <div
                      className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                        activeIndex === index
                          ? "bg-green-800 text-white"
                          : "bg-green-50 text-green-800"
                      }`}
                    >
                      {activeIndex === index ? (
                        <Minus size={16} />
                      ) : (
                        <Plus size={16} />
                      )}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {activeIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: 0.35,
                          ease: [0.4, 0, 0.2, 1],
                        }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4">
                          <p className="text-sm text-black leading-relaxed">
                            {faq.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

          </div>
        </div>

        {/* CTA */}
        <div className="mt-10 rounded-3xl bg-green-900 p-8 sm:p-10 text-white text-center">
          <h3 className="text-xl mb-3 sm:text-2xl font-semibold">
            {t("faq_still_questions")}
          </h3>

          <p className="mb-6 text-sm text-white/70">
            {t("faq_help_desc")}
          </p>

          <Link 
            href="/contact" 
            className="rounded-full bg-white text-[#14532d] px-4 py-3 text-xs font-semibold uppercase tracking-wider"
          >
            {t("contact_support")}
          </Link>
        </div>

      </div>
    </section>
  );
}