"use client";

import React from "react";
import { ShoppingBasket, Leaf, Truck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const getSteps = (t) => [
  {
    icon: <ShoppingBasket size={24} />,
    title: t('step_1_title'),
    desc: t('step_1_desc'),
  },
  {
    icon: <Leaf size={24} />,
    title: t('step_2_title'),
    desc: t('step_2_desc'),
  },
  {
    icon: <Truck size={24} />,
    title: t('step_3_title'),
    desc: t('step_3_desc'),
  },
];

export default function HowItWorks() {
  const { t } = useLanguage();
  const steps = getSteps(t);
  return (
    // REDUCED: Tightened py-8 to py-6 on mobile and py-10 on desktop
    <section className="py-6 sm:py-8 md:py-10 lg:py-10 xl:py-14 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">

        {/* Header - Tightened mb-6 to mb-8 */}
        <div className="mb-6 md:mb-8 text-left">
          {/* <span className="text-xs font-black uppercase tracking-[0.2em] text-[#16a34a] block mb-1">
            {t('farm_to_home')}
          </span> */}

          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-[#14532d] leading-tight">
            {t('how_it_works')}
          </h2>

          <p className="text-gray-500 text-xs md:text-sm mt-1.5 max-w-xl">
            {t('how_it_works_desc')}
          </p>
        </div>

        {/* Steps Grid - Fully Responsive */}
        {/* Mobile: 1 col | Tablet: 2 cols | Desktop: 3 cols */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-300 group"
            >
              
              <div className="flex items-start justify-between mb-4">
                {/* Icon - Scaled for better proportion */}
                <div className="w-12 h-12 rounded-xl bg-green-50 text-[#14532d] flex items-center justify-center group-hover:bg-[#14532d] group-hover:text-white transition-colors duration-300">
                  {step.icon}
                </div>

                {/* Step Number Badge */}
                <span className="h-6 px-3 rounded-full bg-green-100/50 text-[#16a34a] text-sm font-bold flex items-center tracking-normal">
                  {t('step_label')} 0{index + 1}
                </span>
              </div>

              {/* Text Content */}
              <div>
                <h3 className="text-base md:text-lg font-bold text-[#14532d] mb-1.5">
                  {step.title}
                </h3>
                <p className="text-gray-600 text-[13px] md:text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}