"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function ReturnPolicyPage() {
  const { t, language } = useLanguage();

  const getReturnSections = (lang) => {
    const data = {
      en: [
        {
          title: "1. Eligibility for Returns",
          content: (
            <div className="space-y-4">
              <p>
                1.1 Returns are accepted only for products that are damaged,
                defective, or incorrect at the time of delivery.
              </p>
              <p>
                1.2 Perishable items (e.g., fresh vegetables, fruits, dairy, bakery
                products) are generally not eligible for return unless they are
                damaged or spoiled upon arrival.
              </p>
              <p>
                1.3 To be eligible for a return, the item must be unused, in its
                original packaging, and accompanied by the original receipt or proof
                of purchase.
              </p>
              <p>
                1.4 Any return request must be raised within 24 hours of delivery due
                to the nature of our products.
              </p>
            </div>
          ),
        },
        {
          title: "2. Non-Returnable Items",
          content: (
            <div className="space-y-4">
              <p>We do not accept returns for:</p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>Items that have been opened or used</li>
                <li>Products with a broken seal</li>
                <li>Items purchased during clearance or flash sales</li>
                <li>Freebies or promotional items</li>
              </ul>
            </div>
          ),
        },
        {
          title: "3. Refund Process",
          content: (
            <div className="space-y-4">
              <p>
                3.1 Once your return is received and inspected, we will notify you
                via email or SMS regarding the approval or rejection of your refund.
              </p>
              <p>
                3.2 Approved refunds will be processed via the original payment
                method or as Prakrusham store credits, as per your preference.
              </p>
              <p>
                3.3 Refund timelines:
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Store Credits: Instant</li>
                  <li>Online Payments: 5–7 business days</li>
                </ul>
              </p>
            </div>
          ),
        },
        {
          title: "4. Exchange Policy",
          content: (
            <p>
              We only replace items if they are defective or damaged. If you need to
              exchange it for the same item, please contact our support team.
            </p>
          ),
        },
        {
          title: "5. Order Cancellations",
          content: (
            <p>
              Orders can only be cancelled before they are dispatched. Once an order
              is out for delivery or shipped, it cannot be cancelled.
            </p>
          ),
        },
        {
          title: "6. Contact US",
          content: (
            <div className="rounded-2xl border border-[#14532d]/10 bg-green-50 p-6 shadow-sm">
              <p className="mb-2 text-xl font-semibold text-[#14532d]">
                Support & Inquiries
              </p>
              <p className="text-gray-600">
                Email:
                <a
                  href="mailto:Sales.Prakrusham@gmail.com"
                  className="ml-1 text-[#14532d] font-medium underline"
                >
                  Sales.Prakrusham@gmail.com
                </a>
              </p>
            </div>
          ),
        },
      ],
      hi: [
        {
          title: "1. वापसी के लिए पात्रता",
          content: (
            <div className="space-y-4">
              <p>1.1 रिटर्न केवल उन उत्पादों के लिए स्वीकार किया जाता है जो डिलीवरी के समय क्षतिग्रस्त या गलत होते हैं।</p>
              <p>1.2 जल्दी खराब होने वाली वस्तुएं (जैसे ताजी सब्जियां, फल) आम तौर पर वापसी के पात्र नहीं हैं जब तक कि वे पहुंचने पर खराब न हों।</p>
              <p>1.3 रिटर्न के लिए पात्र होने के लिए, आइटम अप्रयुक्त और मूल पैकेजिंग में होना चाहिए।</p>
              <p>1.4 हमारे उत्पादों की प्रकृति के कारण कोई भी वापसी अनुरोध डिलीवरी के 24 घंटों के भीतर उठाया जाना चाहिए।</p>
            </div>
          ),
        },
        {
          title: "2. गैर-वापसी योग्य वस्तुएं",
          content: (
            <div className="space-y-4">
              <p>हम इनके लिए रिटर्न स्वीकार नहीं करते हैं:</p>
              <ul className="list-disc pl-5 space-y-2 text-gray-600">
                <li>वे वस्तुएं जिन्हें खोला या उपयोग किया गया है</li>
                <li>टूटी हुई सील वाले उत्पाद</li>
                <li>निकासी (Clearance) सेल के दौरान खरीदी गई वस्तुएं</li>
              </ul>
            </div>
          ),
        },
        {
          title: "3. धनवापसी प्रक्रिया",
          content: (
            <div className="space-y-4">
              <p>3.1 आपके रिटर्न की जांच के बाद, हम आपको आपकी धनवापसी की स्वीकृति या अस्वीकृति के बारे में सूचित करेंगे।</p>
              <p>3.2 स्वीकृत धनवापसी मूल भुगतान विधि या प्रकृषि स्टोर क्रेडिट के माध्यम से संसाधित की जाएगी।</p>
            </div>
          ),
        },
        {
          title: "4. विनिमय नीति",
          content: (
            <p>हम वस्तुओं को केवल तभी बदलते हैं जब वे दोषपूर्ण या क्षतिग्रस्त हों।</p>
          ),
        },
        {
          title: "5. आदेश रद्दीकरण",
          content: (
            <p>ऑर्डर भेजने से पहले ही रद्द किए जा सकते हैं। एक बार शिप किए जाने के बाद, उन्हें रद्द नहीं किया जा सकता।</p>
          ),
        },
        {
          title: "6. हमसे संपर्क करें",
          content: (
            <div className="rounded-2xl border border-[#14532d]/10 bg-green-50 p-6 shadow-sm">
              <p className="mb-2 text-xl font-semibold text-[#14532d]">सहायता</p>
              <p className="text-gray-600">ईमेल: Sales.Prakrusham@gmail.com</p>
            </div>
          ),
        },
      ],
      gu: [
        {
          title: "1. વળતર માટેની પાત્રતા",
          content: (
            <div className="space-y-4">
              <p>1.1 વળતર ફક્ત તે જ ઉત્પાદનો માટે સ્વીકારવામાં આવે છે જે ડિલિવરી સમયે ક્ષતિગ્રસ્ત હોય.</p>
              <p>1.2 જલ્દી બગડી જાય તેવી વસ્તુઓ (શાકભાજી, ફળો) સામાન્ય રીતે વળતર માટે પાત્ર નથી.</p>
            </div>
          ),
        },
        {
          title: "2. રિફંડ પ્રક્રિયા",
          content: (
            <p>2.1 એકવાર તમારું વળતર પ્રાપ્ત થઈ જાય, અમે તમને જાણ કરીશું.</p>
          ),
        },
        {
          title: "3. ઓર્ડર રદ કરવો",
          content: (
            <p>3.1 ઓર્ડર મોકલ્યા પહેલા જ રદ કરી શકાય છે.</p>
          ),
        },
        {
          title: "4. અમારો સંપર્ક કરો",
          content: (
            <div className="rounded-2xl border border-[#14532d]/10 bg-green-50 p-6 shadow-sm">
              <p className="mb-2 text-xl font-semibold text-[#14532d]">સપોર્ટ</p>
              <p className="text-gray-600">ઇમેઇલ: Sales.Prakrusham@gmail.com</p>
            </div>
          ),
        },
      ],
    };
    return data[lang] || data.en;
  };

  const getRefundSections = (lang) => {
    const data = {
      en: [
        {
          title: "1. Refund Eligibility",
          content: (
            <p>
              Refunds are applicable only for approved returns that meet Prakrusham’s
              Return Policy criteria and pass quality inspection.
            </p>
          ),
        },
        {
          title: "2. Modes of Refund",
          content: (
            <ul className="list-disc pl-5 space-y-1">
              <li>Original payment method</li>
              <li>Prakrusham Store Credits</li>
            </ul>
          ),
        },
      ],
      hi: [
        {
          title: "1. धनवापसी पात्रता",
          content: (
            <p>धनवापसी केवल उन्हीं स्वीकृत रिटर्न के लिए लागू है जो मानदंडों को पूरा करते हैं।</p>
          ),
        },
        {
          title: "2. धनवापसी के तरीके",
          content: (
            <ul className="list-disc pl-5 space-y-1">
              <li>मूल भुगतान विधि</li>
              <li>प्रकृषि स्टोर क्रेडिट</li>
            </ul>
          ),
        },
      ],
      gu: [
        {
          title: "1. રિફંડ પાત્રતા",
          content: (
            <p>રિફંડ ફક્ત મંજૂર વળતર માટે જ લાગુ છે.</p>
          ),
        },
      ],
    };
    return data[lang] || data.en;
  };

  const returnSections = getReturnSections(language);
  const refundSections = getRefundSections(language);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 pb-32 pt-28 text-[#14532d]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-left"
        >
          <span className="mb-6 inline-flex rounded-full border border-[#14532d]/10 bg-green-50 px-4 py-2 text-sm font-black uppercase tracking-[0.3em] text-[#14532d]">
            {t("legal_document")}
          </span>

          <h1 className="mb-5 text-2xl sm:text-3xl md:text-4xl font-bold uppercase">
            {t("return_policy")}
          </h1>

          <p className="max-w-3xl text-sm text-gray-600">
            At Prakrusham, customer satisfaction is important to us. This policy
            explains the conditions under which products purchased from
            www.Prakrusham.in may be returned, exchanged, or refunded.
          </p>
        </motion.div>

        {/* RETURNS */}
        <div className="space-y-12">
          {returnSections.map((section, idx) => (
            <motion.section
              key={idx}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <h2 className="mb-4 text-xl font-semibold text-[#14532d]">
                {section.title}
              </h2>

              <div className="rounded-2xl border border-[#14532d]/10 bg-white p-6 text-[15px] leading-7 text-gray-600 shadow-sm">
                {section.content}
              </div>
            </motion.section>
          ))}
        </div>

        {/* REFUND HEADER */}
        <div className="mt-20 mb-10">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold uppercase">
            {t("return_policy")}
          </h2>
        </div>

        {/* REFUNDS */}
        <div className="space-y-12">
          {refundSections.map((section, idx) => (
            <motion.section key={idx}>
              <h2 className="mb-4 text-xl font-semibold text-[#14532d]">
                {section.title}
              </h2>

              <div className="rounded-2xl border border-[#14532d]/10 bg-white p-6 text-[15px] leading-7 text-gray-600 shadow-sm">
                {section.content}
              </div>
            </motion.section>
          ))}
        </div>

        {/* CONTACT */}
        <div className="mt-16 border-t border-[#14532d]/10 pt-8">
          <p className="mb-6 text-gray-600">Email: Sales.Prakrusham@gmail.com</p>

          <Link
            href="/"
            className="inline-flex items-center gap-4 rounded-lg bg-[#14532d] px-8 py-4 text-sm font-semibold text-white hover:bg-[#166534] uppercase tracking-widest"
          >
            {t("return_to_home")}
          </Link>
        </div>
      </div>
    </div>
  );
}