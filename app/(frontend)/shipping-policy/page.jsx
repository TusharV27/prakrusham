'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

export default function ShippingPolicyPage() {
  const { t, language } = useLanguage();

  const getSections = (lang) => {
    const data = {
      en: [
        {
          title: "1. Shipping Locations",
          content: (
            <div className="space-y-4">
              <p>1.1 Prakrusham currently ships across India.</p>
              <p>1.2 Orders placed for non-serviceable locations may be cancelled and refunded as per our Refund Policy.</p>
            </div>
          )
        },
        {
          title: "2. Order Processing Time",
          content: (
            <div className="space-y-4">
              <p>2.1 Orders are processed within 1–3 business days after confirmation.</p>
              <p>2.2 Orders are not processed on Sundays and public holidays.</p>
              <p>2.3 Processing may take longer during sales or high-volume periods.</p>
            </div>
          )
        },
        {
          title: "3. Delivery Timelines",
          content: (
            <div className="space-y-4">
              <p>Estimated delivery timelines after dispatch:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Metro cities: 3–5 business days</li>
                <li>Non-metro / Tier-2 & Tier-3 cities: 4–7 business days</li>
                <li>Remote locations: 6–9 business days</li>
              </ul>
              <p className="font-normal">Delivery timelines are estimates and may vary due to external factors.</p>
            </div>
          )
        },
        {
          title: "4. Shipping Charges",
          content: (
            <div className="space-y-4">
              <p>4.1 Shipping charges (if applicable) are displayed at checkout.</p>
              <p>4.2 Charges are non-refundable unless the return is due to a Prakrusham error.</p>
            </div>
          )
        },
        {
          title: "5. Cash on Delivery (COD)",
          content: (
            <div className="space-y-4">
              <p>5.1 COD is available for selected pin codes.</p>
              <p>5.2 COD charges, if applicable, are shown at checkout.</p>
              <p>5.3 COD charges are non-refundable once delivered.</p>
            </div>
          )
        },
        {
          title: "6. Order Tracking",
          content: (
            <div className="space-y-4">
              <p>6.1 Shipping confirmation with tracking details will be shared via SMS/email.</p>
              <p>6.2 Tracking updates may take time to reflect.</p>
            </div>
          )
        },
        {
          title: "7. Split Shipments",
          content: (
            <div className="space-y-4">
              <p>7.1 Orders with multiple items may be shipped separately.</p>
              <p>7.2 Customers will be notified in such cases.</p>
            </div>
          )
        },
        {
          title: "8. Delivery Attempts & Undelivered Orders",
          content: (
            <div className="space-y-4">
              <p>8.1 Courier partners usually attempt delivery 2–3 times.</p>
              <p>8.2 Unsuccessful deliveries may be returned to origin.</p>
              <div className="pl-4 border-l-2 border-[#14532d]/20">
                <h3 className="font-serif font-medium text-black mb-2">8.3 In such cases:</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Shipping charges may be deducted from refunds</li>
                  <li>COD orders may not be eligible for re-dispatch</li>
                </ul>
              </div>
            </div>
          )
        },
        {
          title: "9. Address Accuracy",
          content: (
            <div className="space-y-4">
              <p>9.1 Customers must provide accurate shipping details.</p>
              <p>9.2 Prakrusham is not responsible for delays caused by incorrect information.</p>
            </div>
          )
        },
        {
          title: "10. Delays Beyond Our Control",
          content: (
            <div className="space-y-4">
              <p>Prakrusham is not liable for delays caused by:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Natural calamities</li>
                <li>Government restrictions</li>
                <li>Courier partner issues</li>
                <li>Events beyond reasonable control</li>
              </ul>
            </div>
          )
        },
        {
          title: "11. Damaged Packages During Transit",
          content: (
            <div className="space-y-4">
              <p>11.1 Do not accept visibly damaged or tamipered packages.</p>
              <p>11.2 Issues must be reported within 24–48 hours with images or an unboxing video.</p>
            </div>
          )
        },
        {
          title: "12. Contact US",
          content: (
            <div className="space-y-4">
              <p>For shipping-related queries, please contact:</p>
              <div className="pt-2">
                <p className="font-serif font-medium text-black">
                  Email:
                  <a href="mailto:Sales.Prakrusham@gmail.com" className="ml-1 underline">
                    Sales.Prakrusham@gmail.com
                  </a>
                </p>
              </div>
            </div>
          )
        }
      ],
      hi: [
        {
          title: "1. शिपिंग स्थान",
          content: (
            <div className="space-y-4">
              <p>1.1 प्रकृषि वर्तमान में पूरे भारत में शिपिंग करती है।</p>
              <p>1.2 गैर-सेवा योग्य स्थानों के लिए दिए गए ऑर्डर रद्द किए जा सकते हैं और हमारी धनवापसी नीति के अनुसार वापस किए जा सकते हैं।</p>
            </div>
          )
        },
        {
          title: "2. ऑर्डर प्रोसेसिंग समय",
          content: (
            <div className="space-y-4">
              <p>2.1 पुष्टिकरण के बाद 1-3 व्यावसायिक दिनों के भीतर ऑर्डर संसाधित किए जाते हैं।</p>
              <p>2.2 रविवार और सार्वजनिक छुट्टियों पर ऑर्डर संसाधित नहीं किए जाते हैं।</p>
              <p>2.3 सेल या अधिक ऑर्डर के समय प्रोसेसिंग में अधिक समय लग सकता है।</p>
            </div>
          )
        },
        {
          title: "3. डिलीवरी समयसीमा",
          content: (
            <div className="space-y-4">
              <p>डिस्पैच के बाद अनुमानित डिलीवरी समयसीमा:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>मेट्रो शहर: 3–5 व्यावसायिक दिन</li>
                <li>गैर-मेट्रो / टियर-2 और टियर-3 शहर: 4–7 व्यावसायिक दिन</li>
                <li>दूरदराज के स्थान: 6–9 व्यावसायिक दिन</li>
              </ul>
              <p className="font-normal">डिलीवरी की समयसीमा अनुमानित है और बाहरी कारकों के कारण भिन्न हो सकती है।</p>
            </div>
          )
        },
        {
          title: "4. शिपिंग शुल्क",
          content: (
            <div className="space-y-4">
              <p>4.1 शिपिंग शुल्क (यदि लागू हो) चेकआउट पर प्रदर्शित किया जाता है।</p>
              <p>4.2 शुल्क वापस नहीं किए जा सकते जब तक कि रिटर्न प्रकृषि की गलती के कारण न हो।</p>
            </div>
          )
        },
        {
          title: "5. कैश ऑन डिलीवरी (COD)",
          content: (
            <div className="space-y-4">
              <p>5.1 COD चुनिंदा पिन कोड के लिए उपलब्ध है।</p>
              <p>5.2 COD शुल्क, यदि लागू हो, चेकआउट पर दिखाया जाता है।</p>
            </div>
          )
        },
        {
          title: "6. ऑर्डर ट्रैकिंग",
          content: (
            <p>6.1 ट्रैकिंग विवरण के साथ शिपिंग पुष्टिकरण SMS/ईमेल के माध्यम से साझा किया जाएगा।</p>
          )
        },
        {
          title: "7. अलग शिपमेंट",
          content: (
            <p>7.1 कई वस्तुओं वाले ऑर्डर अलग-अलग भेजे जा सकते हैं।</p>
          )
        },
        {
          title: "8. डिलीवरी प्रयास और अनडिलीवर ऑर्डर",
          content: (
            <div className="space-y-4">
              <p>8.1 कूरियर भागीदार आमतौर पर 2-3 बार डिलीवरी का प्रयास करते हैं।</p>
              <p>8.2 असफल डिलीवरी वापस भेजी जा सकती है।</p>
            </div>
          )
        },
        {
          title: "9. पते की सटीकता",
          content: (
            <p>9.1 ग्राहकों को सटीक शिपिंग विवरण प्रदान करना चाहिए।</p>
          )
        },
        {
          title: "10. हमारे नियंत्रण से बाहर देरी",
          content: (
            <p>प्राकृतिक आपदाओं या सरकारी प्रतिबंधों के कारण होने वाली देरी के लिए प्रकृषि उत्तरदायी नहीं है।</p>
          )
        },
        {
          title: "11. पारगमन के दौरान क्षतिग्रस्त पैकेज",
          content: (
            <p>11.1 स्पष्ट रूप से क्षतिग्रस्त या छेड़छाड़ किए गए पैकेज स्वीकार न करें। 24-48 घंटों के भीतर रिपोर्ट करें।</p>
          )
        },
        {
          title: "12. हमसे संपर्क करें",
          content: (
            <p>ईमेल: Sales.Prakrusham@gmail.com</p>
          )
        }
      ],
      gu: [
        {
          title: "1. શિપિંગ સ્થાનો",
          content: (
            <div className="space-y-4">
              <p>1.1 પ્રકૃષિ હાલમાં સમગ્ર ભારતમાં શિપિંગ કરે છે.</p>
              <p>1.2 નોન-સર્વિસેબલ સ્થાનો માટે આપવામાં આવેલા ઓર્ડર અમારી રિફંડ પોલિસી મુજબ રદ થઈ શકે છે.</p>
            </div>
          )
        },
        {
          title: "2. ઓર્ડર પ્રોસેસિંગ સમય",
          content: (
            <div className="space-y-4">
              <p>2.1 કન્ફર્મેશન પછી 1-3 કામકાજના દિવસોમાં ઓર્ડર પ્રોસેસ કરવામાં આવે છે.</p>
              <p>2.2 રવિવાર અને જાહેર રજાઓના દિવસે ઓર્ડર પ્રોસેસ કરવામાં આવતા નથી.</p>
            </div>
          )
        },
        {
          title: "3. ડિલિવરી સમયમર્યાદા",
          content: (
            <div className="space-y-4">
              <p>ડિસ્પેચ પછી અંદાજિત ડિલિવરી સમયમર્યાદા:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>મેટ્રો શહેરો: 3-5 કામકાજના દિવસો</li>
                <li>દૂરના વિસ્તારો: 6-9 કામકાજના દિવસો</li>
              </ul>
            </div>
          )
        },
        {
          title: "4. શિપિંગ ચાર્જ",
          content: (
            <p>4.1 શિપિંગ ચાર્જ ચેકઆઉટ વખતે બતાવવામાં આવશે.</p>
          )
        },
        {
          title: "5. કેશ ઓન ડિલિવરી (COD)",
          content: (
            <p>5.1 પસંદ કરેલા પિન કોડ માટે COD ઉપલબ્ધ છે.</p>
          )
        },
        {
          title: "6. ઓર્ડર ટ્રેકિંગ",
          content: (
            <p>6.1 ટ્રેકિંગ વિગતો SMS/ઇમેઇલ દ્વારા મોકલવામાં આવશે.</p>
          )
        },
        {
          title: "7. અલગ શિપમેન્ટ",
          content: (
            <p>7.1 એકથી વધુ વસ્તુઓવાળા ઓર્ડર અલગથી મોકલી શકાય છે.</p>
          )
        },
        {
          title: "8. ડિલિવરી પ્રયાસો",
          content: (
            <p>8.1 કુરિયર ભાગીદારો સામાન્ય રીતે 2-3 વખત પ્રયાસ કરે છે.</p>
          )
        },
        {
          title: "9. સરનામાની ચોકસાઈ",
          content: (
            <p>9.1 ગ્રાહકોએ સચોટ વિગતો આપવી આવશ્યક છે.</p>
          )
        },
        {
          title: "10. નિયંત્રણ બહારનો વિલંબ",
          content: (
            <p>કુદરતી આપત્તિઓ કે સરકારી નિયંત્રણોના કારણે થતા વિલંબ માટે અમે જવાબદાર નથી.</p>
          )
        },
        {
          title: "11. ક્ષતિગ્રસ્ત પેકેજો",
          content: (
            <p>11.1 ક્ષતિગ્રસ્ત પેકેજો સ્વીકારશો નહીં. 24-48 કલાકમાં જાણ કરો.</p>
          )
        },
        {
          title: "12. અમારો સંપર્ક કરો",
          content: (
            <p>ઇમેઇલ: Sales.Prakrusham@gmail.com</p>
          )
        }
      ]
    };
    return data[lang] || data.en;
  };

  const sections = getSections(language);

  return (
    <div className="min-h-screen bg-[#fdfaf5] pb-32 pt-28 text-[#14532d] selection:bg-[#14532d] selection:text-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20 text-center"
        >
          <span className="mb-6 inline-flex rounded-full border border-[#14532d]/10 bg-[#14532d]/5 px-4 py-2 text-sm font-black uppercase tracking-[0.3em] text-[#14532d]">
            {t('legal_document')}
          </span>

          <h1 className="mb-5 font-serif text-4xl font-medium tracking-tight text-[#14532d] sm:text-6xl md:text-7xl uppercase">
            {t('shipping_policy')}
          </h1>

          <p className="mx-auto max-w-3xl text-sm leading-relaxed text-[#14532d]/65 md:text-base">
            {t('shipping_intro')}
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-16">
          {sections.map((section, idx) => (
            <motion.section
              key={idx}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="mb-6 flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.35em] text-[#14532d]">
                {section.title}
                <span className="h-px flex-grow bg-[#14532d]/10" />
              </h2>

              <div className="rounded-3xl border border-[#14532d]/6 bg-white/70 p-6 text-[15px] leading-8 text-[#14532d]/80 backdrop-blur-sm">
                {section.content}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-24 border-t border-[#14532d]/10 pt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-4 rounded-full bg-[#14532d] px-8 py-4 text-[11px] font-black uppercase tracking-[0.35em] text-white transition-all duration-300 hover:bg-black"
          >
            {t('return_to_home')}
          </Link>
        </div>

      </div>
    </div>
  );
}