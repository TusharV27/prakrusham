"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from '@/context/LanguageContext';


export default function TermsPage() {
  const { t, language } = useLanguage();

  const getSections = (lang) => {
    const data = {
      en: [
        {
          title: "1. Use of Website",
          content: (
            <div className="space-y-4">
              <p>
                1.1 The website is intended for users who can form legally binding
                contracts under Indian law.
              </p>
              <p>
                1.2 You agree to use the website only for lawful purposes and in a
                manner that does not violate any applicable laws or regulations.
              </p>
              <p>
                1.3 Misuse of the website, including but not limited to hacking,
                data scraping, or unauthorised access, is strictly prohibited.
              </p>
            </div>
          ),
        },
    
        {
          title: "2. Account Registration",
          content: (
            <div className="space-y-4">
              <p>2.1 To place an order, you may be required to create an account.</p>
              <p>
                2.2 You are responsible for maintaining the confidentiality of your
                account details and for all activities carried out under your
                account.
              </p>
              <p>
                2.3 Prakrusham reserves the right to suspend or terminate accounts
                found to be in violation of these Terms.
              </p>
            </div>
          ),
        },
    
        {
          title: "3. Product Information",
          content: (
            <div className="space-y-4">
              <p>
                3.1 We make every effort to display accurate product descriptions,
                images, colours, and prices.
              </p>
              <p>
                3.2 However, slight variations in colour or appearance may occur due
                to screen settings, lighting, or photography.
              </p>
              <p>
                3.3 Prakrusham does not guarantee that all product descriptions or
                content are error-free.
              </p>
            </div>
          ),
        },
    
        {
          title: "4. Pricing & Payments",
          content: (
            <div className="space-y-4">
              <p>
                4.1 All prices displayed on the website are in Indian Rupees (INR)
                and inclusive of applicable taxes unless stated otherwise.
              </p>
              <p>
                4.2 Prakrusham reserves the right to change prices, offers, or
                discounts at any time without prior notice.
              </p>
              <p>
                4.3 Payments can be made using the payment methods available at
                checkout.
              </p>
            </div>
          ),
        },
    
        {
          title: "5. Orders & Acceptance",
          content: (
            <div className="space-y-4">
              <p>5.1 Placing an order does not guarantee acceptance.</p>
    
              <p>5.2 Prakrusham reserves the right to cancel or refuse any order due to:</p>
    
              <ul className="list-disc pl-5 space-y-1 text-gray-600">
                <li>Product unavailability</li>
                <li>Pricing or listing errors</li>
                <li>Payment issues</li>
                <li>Suspected fraudulent activity</li>
                <li>Operational limitations</li>
              </ul>
            </div>
          ),
        },
    
        {
          title: "6. Shipping & Delivery",
          content: (
            <div className="space-y-4">
              <p>
                6.1 Delivery timelines provided are estimates and may vary due to
                external factors.
              </p>
              <p>
                6.2 Prakrusham is not liable for delays caused by courier partners,
                natural events, or circumstances beyond our control.
              </p>
            </div>
          ),
        },
    
        {
          title: "7. Returns, Exchanges & Refunds",
          content: (
            <div className="space-y-4">
              <p>
                7.1 Returns, exchanges, and refunds are governed by Prakrusham’s
                Refund & Return Policy.
              </p>
              <p>
                7.2 Customers are advised to review the policy before making a
                purchase.
              </p>
            </div>
          ),
        },
    
        {
          title: "8. Cancellations",
          content: (
            <div className="space-y-4">
              <p>8.1 Orders can be cancelled only before shipment.</p>
              <p>
                8.2 Once shipped, orders cannot be cancelled and must follow the
                return process.
              </p>
            </div>
          ),
        },
    
        {
          title: "9. Intellectual Property",
          content: (
            <div className="space-y-4">
              <p>
                9.1 All content on this website, including text, images, logos,
                designs, graphics, and trademarks, is the property of Prakrusham.
              </p>
              <p>
                9.2 Any unauthorised use, reproduction, or distribution of website
                content is strictly prohibited.
              </p>
            </div>
          ),
        },
    
        {
          title: "10. User Content & Reviews",
          content: (
            <div className="space-y-4">
              <p>
                10.1 By submitting reviews, feedback, or content on the website, you
                grant Prakrusham the right to use such content.
              </p>
              <p>
                10.2 Content that is offensive, misleading, or unlawful may be
                removed.
              </p>
            </div>
          ),
        },
    
        {
          title: "11. Limitation of Liability",
          content: (
            <div className="space-y-4">
              <p>
                11.1 Prakrusham shall not be liable for any indirect damages.
              </p>
              <p>
                11.2 Maximum liability shall not exceed purchase amount.
              </p>
            </div>
          ),
        },
    
        {
          title: "12. Indemnification",
          content: (
            <p>
              You agree to indemnify and hold harmless Prakrusham from any claims.
            </p>
          ),
        },
    
        {
          title: "13. Privacy",
          content: (
            <div className="space-y-4">
              <p>
                13.1 Personal information governed by Privacy Policy.
              </p>
              <p>
                13.2 Using website means consent to privacy policy.
              </p>
            </div>
          ),
        },
    
        {
          title: "14. Governing Law & Jurisdiction",
          content: (
            <div className="space-y-4">
              <p>
                14.1 Governed by laws of India.
              </p>
              <p>
                14.2 Jurisdiction India courts.
              </p>
            </div>
          ),
        },
    
        {
          title: "15. Changes to Terms",
          content: (
            <p>
              Prakrusham reserves right to update terms anytime.
            </p>
          ),
        },
    
        {
          title: "16. Contact Information",
          content: (
            <div className="rounded-2xl border border-[#14532d]/10 bg-green-50 p-8 shadow-sm">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#14532d]/60">
                Customer Support
              </p>
    
              <p className="mb-2 text-xl md:text-2xl font-semibold text-[#14532d]">
                Contact Us
              </p>
    
              <p className="text-gray-600">
                Email:
                <a
                  href="mailto:Sales.Prakrusham@gmail.com"
                  className="ml-1 text-[#14532d] underline"
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
          title: "1. वेबसाइट का उपयोग",
          content: (
            <div className="space-y-4">
              <p>1.1 वेबसाइट उन उपयोगकर्ताओं के लिए है जो भारतीय कानून के तहत कानूनी रूप से बाध्यकारी अनुबंध बना सकते हैं।</p>
              <p>1.2 आप वेबसाइट का उपयोग केवल वैध उद्देश्यों के लिए और लागू कानूनों के उल्लंघन के बिना करने के लिए सहमत हैं।</p>
              <p>1.3 वेबसाइट का दुरुपयोग, जिसमें हैकिंग, डेटा स्क्रैपिंग या अनधिकृत पहुंच शामिल है, सख्त वर्जित है।</p>
            </div>
          )
        },
        {
          title: "2. खाता पंजीकरण",
          content: (
            <div className="space-y-4">
              <p>2.1 ऑर्डर देने के लिए, आपको एक खाता बनाने की आवश्यकता हो सकती है।</p>
              <p>2.2 आप अपने खाते के विवरण की गोपनीयता बनाए रखने और अपने खाते के तहत की जाने वाली सभी गतिविधियों के लिए जिम्मेदार हैं।</p>
              <p>2.3 प्रकृषि इन शर्तों के उल्लंघन में पाए गए खातों को निलंबित या समाप्त करने का अधिकार सुरक्षित रखती है।</p>
            </div>
          )
        },
        {
          title: "3. उत्पाद जानकारी",
          content: (
            <div className="space-y-4">
              <p>3.1 हम सटीक उत्पाद विवरण, चित्र, रंग और कीमतें प्रदर्शित करने का हर संभव प्रयास करते हैं।</p>
              <p>3.2 हालांकि, स्क्रीन सेटिंग्स या फोटोग्राफी के कारण रंग या उपस्थिति में मामूली बदलाव हो सकते हैं।</p>
              <p>3.3 प्रकृषि गारंटी नहीं देती है कि सभी उत्पाद विवरण त्रुटि मुक्त हैं।</p>
            </div>
          )
        },
        {
          title: "4. मूल्य निर्धारण और भुगतान",
          content: (
            <div className="space-y-4">
              <p>4.1 वेबसाइट पर प्रदर्शित सभी कीमतें भारतीय रुपये (INR) में हैं और लागू करों सहित हैं।</p>
              <p>4.2 प्रकृषि बिना किसी पूर्व सूचना के किसी भी समय कीमतों या छूट को बदलने का अधिकार सुरक्षित रखती है।</p>
              <p>4.3 भुगतान चेकआउट के समय उपलब्ध भुगतान विधियों का उपयोग करके किया जा सकता है।</p>
            </div>
          )
        },
        {
          title: "5. आदेश और स्वीकृति",
          content: (
            <div className="space-y-4">
              <p>5.1 ऑर्डर देने से स्वीकृति की गारंटी नहीं मिलती है।</p>
              <p>5.2 प्रकृषि अनुपलब्धता या त्रुटियों के कारण किसी भी ऑर्डर को रद्द करने का अधिकार सुरक्षित रखती है।</p>
            </div>
          )
        },
        {
          title: "6. शिपिंग और वितरण",
          content: (
            <p>6.1 प्रदान की गई डिलीवरी समयसीमा अनुमानित है और बाहरी कारकों के कारण भिन्न हो सकती है।</p>
          )
        },
        {
          title: "7. रिटर्न और रिफंड",
          content: (
            <p>7.1 रिटर्न और रिफंड प्रकृषि की रिफंड और रिटर्न पॉलिसी द्वारा शासित होते हैं।</p>
          )
        },
        {
          title: "8. रद्दीकरण (Cancellations)",
          content: (
            <p>8.1 ऑर्डर केवल शिपमेंट से पहले रद्द किए जा सकते हैं।</p>
          )
        },
        {
          title: "9. बौद्धिक संपदा",
          content: (
            <p>9.1 इस वेबसाइट की सभी सामग्री प्रकृषि की संपत्ति है। अनधिकृत उपयोग वर्जित है।</p>
          )
        },
        {
          title: "10. उपयोगकर्ता समीक्षाएँ",
          content: (
            <p>10.1 समीक्षाएँ प्रस्तुत करके, आप प्रकृषि को ऐसी सामग्री का उपयोग करने का अधिकार देते हैं।</p>
          )
        },
        {
          title: "11. दायित्व की सीमा",
          content: (
            <p>11.1 प्रकृषि किसी भी अप्रत्यक्ष नुकसान के लिए उत्तरदायी नहीं होगी।</p>
          )
        },
        {
          title: "12. हर्जाना",
          content: (
            <p>आप प्रकृषि को किसी भी दावे से हानिरहित रखने के लिए सहमत हैं।</p>
          )
        },
        {
          title: "13. गोपनीयता",
          content: (
            <p>13.1 व्यक्तिगत जानकारी गोपनीयता नीति द्वारा शासित होती है।</p>
          )
        },
        {
          title: "14. शासी कानून",
          content: (
            <p>14.1 भारत के कानूनों द्वारा शासित। क्षेत्राधिकार भारतीय न्यायालय।</p>
          )
        },
        {
          title: "15. शर्तों में परिवर्तन",
          content: (
            <p>प्रकृषि किसी भी समय शर्तों को अपडेट करने का अधिकार सुरक्षित रखती है।</p>
          )
        },
        {
          title: "16. संपर्क जानकारी",
          content: (
            <div className="rounded-2xl border border-[#14532d]/10 bg-green-50 p-8 shadow-sm">
              <p className="mb-2 text-xl font-semibold text-[#14532d]">संपर्क करें</p>
              <p className="text-gray-600">ईमेल: Sales.Prakrusham@gmail.com</p>
            </div>
          )
        }
      ],
      gu: [
        {
          title: "1. વેબસાઇટનો ઉપયોગ",
          content: (
            <div className="space-y-4">
              <p>1.1 વેબસાઇટ તે વપરાશકર્તાઓ માટે છે જેઓ ભારતીય કાયદા હેઠળ કાયદેસર રીતે બંધનકર્તા કરાર કરી શકે છે.</p>
              <p>1.2 તમે વેબસાઇટનો ઉપયોગ માત્ર કાયદેસરના હેતુઓ માટે કરવા માટે સંમત થાઓ છો.</p>
              <p>1.3 વેબસાઇટનો દુરુપયોગ સખત રીતે પ્રતિબંધિત છે.</p>
            </div>
          )
        },
        {
          title: "2. ખાતાની નોંધણી",
          content: (
            <div className="space-y-4">
              <p>2.1 ઓર્ડર આપવા માટે, તમારે એકાઉન્ટ બનાવવાની જરૂર પડી શકે છે.</p>
              <p>2.2 તમે તમારા એકાઉન્ટની વિગતોની ગુપ્તતા જાળવવા માટે જવાબદાર છો.</p>
            </div>
          )
        },
        {
          title: "3. ઉત્પાદન માહિતી",
          content: (
            <p>3.1 અમે સચોટ ઉત્પાદન વર્ણન અને કિંમતો પ્રદર્શિત કરવાનો પ્રયાસ કરીએ છીએ.</p>
          )
        },
        {
          title: "4. કિંમત અને ચુકવણી",
          content: (
            <p>4.1 બધી કિંમતો ભારતીય રૂપિયા (INR) માં છે.</p>
          )
        },
        {
          title: "5. ઓર્ડર અને સ્વીકૃતિ",
          content: (
            <p>5.1 ઓર્ડર આપવો એ સ્વીકૃતિની ખાતરી આપતું નથી.</p>
          )
        },
        {
          title: "6. શિપિંગ અને ડિલિવરી",
          content: (
            <p>6.1 ડિલિવરીનો સમય અંદાજિત છે.</p>
          )
        },
        {
          title: "7. વળતર અને રિફંડ",
          content: (
            <p>7.1 વળતર અને રિફંડ અમારી રિફંડ પોલિસી દ્વારા સંચાલિત થાય છે.</p>
          )
        },
        {
          title: "8. રદ કરવું (Cancellations)",
          content: (
            <p>8.1 ઓર્ડર ફક્ત શિપમેન્ટ પહેલાં જ રદ કરી શકાય છે.</p>
          )
        },
        {
          title: "9. બૌદ્ધિક સંપત્તિ",
          content: (
            <p>9.1 આ વેબસાઇટની બધી સામગ્રી પ્રકૃષિની મિલકત છે.</p>
          )
        },
        {
          title: "10. વપરાશકર્તાની સમીક્ષાઓ",
          content: (
            <p>10.1 સમીક્ષાઓ સબમિટ કરીને, તમે પ્રકૃષિને તે સામગ્રીનો ઉપયોગ કરવાનો અધિકાર આપો છો.</p>
          )
        },
        {
          title: "11. જવાબદારીની મર્યાદા",
          content: (
            <p>11.1 પ્રકૃષિ કોઈપણ પરોક્ષ નુકસાન માટે જવાબદાર રહેશે નહીં.</p>
          )
        },
        {
          title: "12. વળતર",
          content: (
            <p>તમે પ્રકૃષિને કોઈપણ દાવાઓથી સુરક્ષિત રાખવા માટે સંમત થાઓ છો.</p>
          )
        },
        {
          title: "13. ગુપ્તતા (Privacy)",
          content: (
            <p>13.1 વ્યક્તિગત માહિતી પ્રાયવસી પોલિસી દ્વારા સંચાલિત થાય છે.</p>
          )
        },
        {
          title: "14. સંચાલિત કાયદો",
          content: (
            <p>14.1 ભારતના કાયદા દ્વારા સંચાલિત.</p>
          )
        },
        {
          title: "15. શરતોમાં ફેરફાર",
          content: (
            <p>પ્રકૃષિ કોઈપણ સમયે શરતો બદલવાનો અધિકાર અનામત રાખે છે.</p>
          )
        },
        {
          title: "16. સંપર્ક માહિતી",
          content: (
            <div className="rounded-2xl border border-[#14532d]/10 bg-green-50 p-8 shadow-sm">
              <p className="mb-2 text-xl font-semibold text-[#14532d]">સંપર્ક કરો</p>
              <p className="text-gray-600">ઇમેઇલ: Sales.Prakrusham@gmail.com</p>
            </div>
          )
        }
      ]
    };
    return data[lang] || data.en;
  };

  const sections = getSections(language);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-green-50 pb-16 sm:pb-20 lg:pb-24 pt-20 sm:pt-24 lg:pt-28 text-[#14532d]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-10 lg:mb-14 text-left"
        >
          <span className="mb-3 inline-flex rounded-full border border-[#14532d]/10 bg-green-50 px-4 py-2 text-sm font-black uppercase tracking-[0.3em] text-[#14532d]">
            {t('legal_document')}
          </span>

          <h1 className="mb-5 text-2xl sm:text-3xl md:text-4xl font-bold text-[#14532d] uppercase">
            {t('terms_conditions')}
          </h1>

          <p className="text-sm text-gray-600 md:text-base">
            {t('terms_intro')}
          </p>
        </motion.div>

        <div className="space-y-6 sm:space-y-8 lg:space-y-10">
          {sections.map((section, idx) => (
            <motion.section key={idx}>
              <h2 className="mb-2 sm:mb-3 text-lg sm:text-xl font-semibold text-[#14532d]">
                {section.title}
              </h2>

              <div className="rounded-2xl border border-[#14532d]/10 bg-white p-4 sm:p-5 lg:p-6 text-[14px] sm:text-[15px] leading-6 sm:leading-7 text-gray-600 shadow-sm">
                {section.content}
              </div>
            </motion.section>
          ))}
        </div>

        <div className="mt-8 sm:mt-10 lg:mt-14">
          <Link
            href="/"
            className="inline-flex items-center gap-4 rounded-lg bg-[#14532d] px-8 py-4 text-sm font-semibold text-white hover:bg-[#166534] uppercase tracking-widest"
          >
            {t('return_to_home')}
          </Link>
        </div>

      </div>
    </div>
  );
}