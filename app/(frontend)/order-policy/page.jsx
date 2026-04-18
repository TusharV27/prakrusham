"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function OrderPolicyPage() {
  const { t, language } = useLanguage();

  const getSections = (lang) => {
    const data = {
      en: [
        {
          title: '1. Placing an Order',
          content: (
            <div className="space-y-4">
              <p>
                1.1 Orders can be placed on Prakrusham only through the official
                website Prakrusham.in
              </p>
              <p>
                1.2 Once an order is successfully placed, you will receive an order
                confirmation via email and/or SMS.
              </p>
            </div>
          ),
        },
        {
          title: '2. Order Confirmation',
          content: (
            <div className="space-y-4">
              <p>2.1 Order confirmation does not guarantee shipment.</p>
              <p>2.2 We reserve the right to cancel orders due to stock unavailability or payment issues.</p>
            </div>
          )
        },
        {
          title: '3. Pricing & Payment',
          content: (
            <div className="space-y-4">
              <p>3.1 All prices are inclusive of taxes unless stated otherwise.</p>
              <p>3.2 Payments must be made using the available online options or COD.</p>
            </div>
          )
        },
        {
          title: '4. Cancellations',
          content: (
            <p>4.1 Orders can only be cancelled before they are dispatched.</p>
          )
        }
      ],
      hi: [
        {
          title: '1. ऑर्डर देना',
          content: (
            <div className="space-y-4">
              <p>1.1 प्रकृषि पर ऑर्डर केवल आधिकारिक वेबसाइट Prakrusham.in के माध्यम से दिए जा सकते हैं।</p>
              <p>1.2 ऑर्डर सफलतापूर्वक दिए जाने के बाद, आपको पुष्टिकरण प्राप्त होगा।</p>
            </div>
          )
        },
        {
          title: '2. आदेश पुष्टिकरण',
          content: (
            <p>2.1 ऑर्डर की पुष्टि शिपमेंट की गारंटी नहीं देती है।</p>
          )
        },
        {
          title: '3. मूल्य निर्धारण और भुगतान',
          content: (
            <p>3.1 सभी कीमतें करों सहित हैं।</p>
          )
        },
        {
          title: '4. रद्दीकरण',
          content: (
            <p>4.1 ऑर्डर भेजने से पहले ही रद्द किए जा सकते हैं।</p>
          )
        }
      ],
      gu: [
        {
          title: '1. ઓર્ડર આપવો',
          content: (
            <div className="space-y-4">
              <p>1.1 ઓર્ડર ફક્ત અમારી સત્તાવાર વેબસાઇટ Prakrusham.in દ્વારા જ આપી શકાય છે.</p>
            </div>
          )
        },
        {
          title: '2. ઓર્ડર કન્ફર્મેશન',
          content: (
            <p>2.1 ઓર્ડર કન્ફર્મ થવો એ ડિલિવરીની ખાતરી આપતું નથી.</p>
          )
        },
        {
          title: '3. કિંમત અને ચુકવણી',
          content: (
            <p>3.1 બધી કિંમતો ટેક્સ સાથે છે.</p>
          )
        },
        {
            title: '4. ઓર્ડર રદ કરવો',
            content: (
              <p>4.1 ઓર્ડર મોકલ્યા પહેલા જ રદ કરી શકાય છે.</p>
            )
          }
      ]
    };
    return data[lang] || data.en;
  };

  const sections = getSections(language);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 pb-16 sm:pb-20 lg:pb-24 
pt-20 sm:pt-24 lg:pt-28 text-[#14532d]">
      <div className=" max-w-[1440px] mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-8 sm:mb-10 lg:mb-14 text-left"
        >
          <span className="mb-3 sm:mb-4 inline-flex rounded-full border border-[#14532d]/10 bg-green-50 px-4 py-2 text-sm font-black uppercase tracking-[0.3em] text-[#14532d]">
            {t('legal_document')}
          </span>

          <h1 className="mb-5 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#14532d] uppercase">
            {t('order_policy')}
          </h1>

          <p className="text-sm leading-relaxed text-gray-600 md:text-base">
            {t('order_intro')}
          </p>

        </motion.div>

        {/* Sections */}
        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
          {sections.map((section, idx) => (
            <motion.section
              key={idx}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="mb-2 sm:mb-3 text-lg sm:text-xl font-semibold text-[#14532d]">
                {section.title}
              </h2>

              <div className="rounded-2xl border border-[#14532d]/10 bg-white p-4 sm:p-5 lg:p-6 
text-[14px] sm:text-[15px] 
leading-6 sm:leading-7 text-gray-600 shadow-sm">
                {section.content}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="mt-8 sm:mt-10 lg:mt-14">
          <Link
            href="/"
            className="inline-flex items-center gap-4 rounded-lg bg-[#14532d] px-8 py-4 text-sm font-semibold text-white transition hover:bg-[#166534] uppercase tracking-widest"
          >
            {t('return_to_home')}
          </Link>
        </div>

      </div>
    </div>
  );
}