"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function PrivacyPage() {
  const { t, language } = useLanguage();

  const getSections = (lang) => {
    const data = {
      en: [
        {
          title: "1. Information We Collect",
          content: (
            <div className="space-y-4">
              <p>We may collect the following types of information:</p>
    
              <div className="rounded-2xl border border-[#14532d]/10 bg-green-50 p-5">
                <h3 className="mb-3 text-lg font-semibold text-[#14532d]">
                  1.1 Personal Information
                </h3>
                <ul className="list-disc space-y-2 pl-5 text-gray-600">
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Mobile number</li>
                  <li>Shipping and billing address</li>
                  <li>
                    Payment details (processed securely via third-party gateways; we
                    do not store card details)
                  </li>
                </ul>
              </div>
    
              <div className="rounded-2xl border border-[#14532d]/10 bg-white p-5">
                <h3 className="mb-3 text-lg font-semibold text-[#14532d]">
                  1.2 Non-Personal Information
                </h3>
                <ul className="list-disc space-y-2 pl-5 text-gray-600">
                  <li>Browser type and device information</li>
                  <li>IP address</li>
                  <li>Pages visited, time spent, and browsing behaviour</li>
                  <li>Cookies and tracking data</li>
                </ul>
              </div>
            </div>
          ),
        },
        {
          title: "2. How We Use Your Information",
          content: (
            <div className="space-y-4">
              <p>We use your information to:</p>
              <ul className="list-disc space-y-2 pl-5 text-gray-600">
                <li>Process and deliver your orders</li>
                <li>
                  Communicate order updates, confirmations, and support responses
                </li>
                <li>Improve our website, products, and customer experience</li>
                <li>
                  Send promotional offers, newsletters, or updates (only if you opt
                  in)
                </li>
                <li>Detect and prevent fraud or unauthorised activities</li>
                <li>Comply with legal and regulatory requirements</li>
              </ul>
            </div>
          ),
        },
        {
          title: "3. Cookies & Tracking Technologies",
          content: (
            <div className="space-y-4">
              <p>3.1 We use cookies and similar technologies to:</p>
    
              <ul className="list-disc space-y-2 pl-5 text-gray-600">
                <li>Remember your preferences</li>
                <li>Improve website performance</li>
                <li>Analyse traffic and usage patterns</li>
              </ul>
    
              <p>
                3.2 You can choose to disable cookies through your browser settings;
                however, some features of the website may not function properly.
              </p>
            </div>
          ),
        },
        {
          title: "4. Sharing of Information",
          content: (
            <div className="space-y-4">
              <p>
                4.1 We do not sell or rent your personal information to third
                parties.
              </p>
    
              <p>4.2 Your information may be shared only with:</p>
    
              <ul className="list-disc space-y-2 pl-5 text-gray-600">
                <li>Payment gateway partners for secure transactions</li>
                <li>Courier and logistics partners for order delivery</li>
                <li>
                  Service providers assisting with website operations, analytics, or
                  customer support
                </li>
                <li>Legal or regulatory authorities when required by law</li>
              </ul>
    
              <div className="rounded-2xl border border-[#14532d]/10 bg-green-50 p-4">
                <p className="text-gray-600">
                  All such parties are obligated to keep your information
                  confidential.
                </p>
              </div>
            </div>
          ),
        },
        {
          title: "5. Data Security",
          content: (
            <div className="space-y-4">
              <p>
                5.1 We implement reasonable security measures to protect your
                personal data against unauthorised access, alteration, disclosure,
                or destruction.
              </p>
    
              <p>
                5.2 While we strive to protect your information, no method of
                transmission over the internet is 100% secure. Prakrusham cannot
                guarantee absolute security.
              </p>
            </div>
          ),
        },
        {
          title: "6. Data Retention",
          content: (
            <div className="space-y-4">
              <p>
                We retain your personal information only for as long as necessary to:
              </p>
    
              <ul className="list-disc space-y-2 pl-5 text-gray-600">
                <li>Fulfil the purposes outlined in this policy</li>
                <li>
                  Comply with legal, accounting, or regulatory obligations
                </li>
              </ul>
            </div>
          ),
        },
        {
          title: "7. Your Rights",
          content: (
            <div className="space-y-4">
              <p>You have the right to:</p>
    
              <ul className="list-disc space-y-2 pl-5 text-gray-600">
                <li>Access the personal information we hold about you</li>
                <li>Request correction or update of inaccurate information</li>
                <li>
                  Request deletion of your personal data (subject to legal
                  obligations)
                </li>
                <li>Opt out of marketing communications at any time</li>
              </ul>
    
              <div className="rounded-2xl border border-[#14532d]/10 bg-white p-5 shadow-sm">
                <p className="text-gray-600">
                  Requests can be sent to{" "}
                  <a
                    href="mailto:Sales.Prakrusham@gmail.com"
                    className="font-semibold text-[#14532d] underline"
                  >
                    Sales.Prakrusham@gmail.com
                  </a>
                </p>
              </div>
            </div>
          ),
        },
        {
          title: "8. Third-Party Links",
          content: (
            <p>
              Our website may contain links to third-party websites. Prakrusham is not
              responsible for the privacy practices or content of such external
              websites. We encourage users to review their privacy policies
              separately.
            </p>
          ),
        },
        {
          title: "9. Children’s Privacy",
          content: (
            <p>
              Prakrusham does not knowingly collect personal information from
              individuals under the age of 18. If such data is identified, it will
              be deleted promptly.
            </p>
          ),
        },
        {
          title: "10. Changes to This Privacy Policy",
          content: (
            <div className="space-y-4">
              <p>
                Prakrusham reserves the right to update or modify this Privacy Policy
                at any time.
              </p>
    
              <p>
                Continued use of the website after changes indicates acceptance of
                the updated policy.
              </p>
            </div>
          ),
        },
        {
          title: "11. Contact Us",
          content: (
            <div className="rounded-2xl border border-[#14532d]/10 bg-green-50 p-8 shadow-sm">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#14532d]/60">
                Privacy Support
              </p>
    
              <p className="mb-2 text-xl md:text-2xl font-semibold text-[#14532d]">
                We respect your privacy
              </p>
    
              <p className="text-gray-600">
                Email:{" "}
                <a
                  href="mailto:Sales.Prakrusham@gmail.com"
                  className="font-medium text-[#14532d] underline"
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
          title: "1. जानकारी जो हम एकत्र करते हैं",
          content: (
            <div className="space-y-4">
              <p>हम निम्नलिखित प्रकार की जानकारी एकत्र कर सकते हैं:</p>
              <div className="rounded-2xl border border-[#14532d]/10 bg-green-50 p-5">
                <h3 className="mb-3 text-lg font-semibold text-[#14532d]">
                  1.1 व्यक्तिगत जानकारी
                </h3>
                <ul className="list-disc space-y-2 pl-5 text-gray-600">
                  <li>नाम</li>
                  <li>ईमेल पता</li>
                  <li>मोबाइल नंबर</li>
                  <li>शिपिंग और बिलिंग पता</li>
                  <li>भुगतान विवरण (सुरक्षित रूप से तीसरे पक्ष के गेटवे के माध्यम से संसाधित; हम कार्ड विवरण संग्रहीत नहीं करते हैं)</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-[#14532d]/10 bg-white p-5">
                <h3 className="mb-3 text-lg font-semibold text-[#14532d]">
                  1.2 गैर-व्यक्तिगत जानकारी
                </h3>
                <ul className="list-disc space-y-2 pl-5 text-gray-600">
                  <li>ब्राउज़र प्रकार और डिवाइस की जानकारी</li>
                  <li>आईपी पता</li>
                  <li>विज़िट किए गए पृष्ठ, बिताया गया समय और ब्राउज़िंग व्यवहार</li>
                  <li>कुकीज़ और ट्रैकिंग डेटा</li>
                </ul>
              </div>
            </div>
          )
        },
        {
          title: "2. हम आपकी जानकारी का उपयोग कैसे करते हैं",
          content: (
            <div className="space-y-4">
              <p>हम आपकी जानकारी का उपयोग निम्न के लिए करते हैं:</p>
              <ul className="list-disc space-y-2 pl-5 text-gray-600">
                <li>आपके ऑर्डर को संसाधित करना और वितरित करना</li>
                <li>ऑर्डर अपडेट, पुष्टिकरण और सहायता प्रतिक्रियाएं साझा करना</li>
                <li>हमारी वेबसाइट, उत्पादों और ग्राहक अनुभव में सुधार करना</li>
                <li>प्रचार प्रस्ताव, समाचार पत्र या अपडेट भेजना (केवल यदि आप अनुमति देते हैं)</li>
                <li>धोखाधड़ी या अनधिकृत गतिविधियों का पता लगाना और उन्हें रोकना</li>
                <li>कानूनी और नियामक आवश्यकताओं का पालन करना</li>
              </ul>
            </div>
          )
        },
        {
          title: "3. कुकीज़ और ट्रैकिंग तकनीक",
          content: (
            <div className="space-y-4">
              <p>3.1 हम कुकीज़ और इसी तरह की तकनीकों का उपयोग इसके लिए करते हैं:</p>
              <ul className="list-disc space-y-2 pl-5 text-gray-600">
                <li>आपकी प्राथमिकताओं को याद रखना</li>
                <li>वेबसाइट के प्रदर्शन में सुधार करना</li>
                <li>यातायात और उपयोग के पैटर्न का विश्लेषण करना</li>
              </ul>
              <p>3.2 आप अपने ब्राउज़र सेटिंग्स के माध्यम से कुकीज़ को अक्षम करना चुन सकते हैं; हालाँकि, वेबसाइट की कुछ विशेषताएं ठीक से काम नहीं कर सकती हैं।</p>
            </div>
          )
        },
        {
          title: "4. जानकारी साझा करना",
          content: (
            <div className="space-y-4">
              <p>4.1 हम आपकी व्यक्तिगत जानकारी तीसरे पक्षों को बेचते या किराए पर नहीं देते हैं।</p>
              <p>4.2 आपकी जानकारी केवल इनके साथ साझा की जा सकती है:</p>
              <ul className="list-disc space-y-2 pl-5 text-gray-600">
                <li>सुरक्षित लेनदेन के लिए भुगतान गेटवे भागीदार</li>
                <li>ऑर्डर डिलीवरी के लिए कूरियर और लॉजिस्टिक्स भागीदार</li>
                <li>वेबसाइट संचालन, विश्लेषण या ग्राहक सहायता में सहायता करने वाले सेवा प्रदाता</li>
                <li>कानून द्वारा आवश्यक होने पर कानूनी या नियामक अधिकारी</li>
              </ul>
            </div>
          )
        },
        {
          title: "5. डेटा सुरक्षा",
          content: (
            <div className="space-y-4">
              <p>5.1 हम आपके व्यक्तिगत डेटा को अनधिकृत पहुंच, परिवर्तन, प्रकटीकरण या विनाश से बचाने के लिए उचित सुरक्षा उपाय लागू करते हैं।</p>
              <p>5.2 प्रकृषि पूर्ण सुरक्षा की गारंटी नहीं दे सकती। इंटरनेट पर प्रसारण का कोई भी तरीका 100% सुरक्षित नहीं है।</p>
            </div>
          )
        },
        {
          title: "6. डेटा प्रतिधारण (Data Retention)",
          content: (
            <div className="space-y-4">
              <p>हम आपकी व्यक्तिगत जानकारी केवल तब तक रखते हैं जब तक आवश्यक हो:</p>
              <ul className="list-disc space-y-2 pl-5 text-gray-600">
                <li>इस नीति में बताए गए उद्देश्यों को पूरा करना</li>
                <li>कानूनी, लेखांकन या नियामक दायित्वों का पालन करना</li>
              </ul>
            </div>
          )
        },
        {
          title: "7. आपके अधिकार",
          content: (
            <div className="space-y-4">
              <p>आपको अधिकार है:</p>
              <ul className="list-disc space-y-2 pl-5 text-gray-600">
                <li>अपने बारे में हमारे पास मौजूद व्यक्तिगत जानकारी तक पहुंच</li>
                <li>गलत जानकारी को सुधारने या अपडेट करने का अनुरोध</li>
                <li>अपने व्यक्तिगत डेटा को हटाने का अनुरोध (कानूनी दायित्वों के अधीन)</li>
                <li>किसी भी समय मार्केटिंग संचार से बाहर निकलने का विकल्प</li>
              </ul>
              <div className="rounded-2xl border border-[#14532d]/10 bg-white p-5 shadow-sm">
                <p className="text-gray-600">अनुरोध ईमेल द्वारा भेजे जा सकते हैं: <a href="mailto:Sales.Prakrusham@gmail.com" className="font-semibold text-[#14532d] underline">Sales.Prakrusham@gmail.com</a></p>
              </div>
            </div>
          )
        },
        {
          title: "8. तीसरे पक्ष के लिंक",
          content: (
            <p>हमारी वेबसाइट में तीसरे पक्ष की वेबसाइटों के लिंक हो सकते हैं। प्रकृषि ऐसी बाहरी वेबसाइटों की गोपनीयता प्रथाओं या सामग्री के लिए ज़िम्मेदार नहीं है।</p>
          )
        },
        {
          title: "9. बच्चों की गोपनीयता",
          content: (
            <p>प्रकृषि जानबूझकर 18 वर्ष से कम उम्र के व्यक्तियों से व्यक्तिगत जानकारी एकत्र नहीं करती है। यदि ऐसे डेटा की पहचान की जाती है, तो इसे तुरंत हटा दिया जाएगा।</p>
          )
        },
        {
          title: "10. इस गोपनीयता नीति में परिवर्तन",
          content: (
            <div className="space-y-4">
              <p>प्रकृषि किसी भी समय इस गोपनीयता नीति को अपडेट या संशोधित करने का अधिकार सुरक्षित रखती है।</p>
              <p>परिवर्तनों के बाद वेबसाइट का निरंतर उपयोग अद्यतन नीति की स्वीकृति को इंगित करता है।</p>
            </div>
          )
        },
        {
          title: "11. हमसे संपर्क करें",
          content: (
            <div className="rounded-2xl border border-[#14532d]/10 bg-green-50 p-8 shadow-sm">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#14532d]/60">प्राइवेसी सपोर्ट</p>
              <p className="mb-2 text-xl md:text-2xl font-semibold text-[#14532d]">हम आपकी गोपनीयता का सम्मान करते हैं</p>
              <p className="text-gray-600">ईमेल: <a href="mailto:Sales.Prakrusham@gmail.com" className="font-medium text-[#14532d] underline">Sales.Prakrusham@gmail.com</a></p>
            </div>
          )
        }
      ],
      gu: [
        {
          title: "1. અમે એકત્રિત કરીએ છીએ તે માહિતી",
          content: (
            <div className="space-y-4">
              <p>અમે નીચેના પ્રકારની માહિતી એકત્રિત કરી શકીએ છીએ:</p>
              <div className="rounded-2xl border border-[#14532d]/10 bg-green-50 p-5">
                <h3 className="mb-3 text-lg font-semibold text-[#14532d]">
                  1.1 વ્યક્તિગત માહિતી
                </h3>
                <ul className="list-disc space-y-2 pl-5 text-gray-600">
                  <li>નામ</li>
                  <li>ઇમેઇલ સરનામું</li>
                  <li>મોબાઇલ નંબર</li>
                  <li>શિપિંગ અને બિલિંગ સરનામું</li>
                  <li>ચુકવણીની વિગતો (તૃતીય-પક્ષ ગેટવે દ્વારા સુરક્ષિત રીતે પ્રક્રિયા કરવામાં આવે છે; અમે કાર્ડની વિગતો સંગ્રહિત કરતા નથી)</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-[#14532d]/10 bg-white p-5">
                <h3 className="mb-3 text-lg font-semibold text-[#14532d]">
                  1.2 બિન-વ્યક્તિગત માહિતી
                </h3>
                <ul className="list-disc space-y-2 pl-5 text-gray-600">
                  <li>બ્રાઉઝરનો પ્રકાર અને ઉપકરણની માહિતી</li>
                  <li>આઈપી સરનામું</li>
                  <li>મુલાકાત લીધેલ પૃષ્ઠો, વિતાવેલો સમય અને બ્રાઉઝિંગ વર્તન</li>
                  <li>કૂકીઝ અને ટ્રેકિંગ ડેટા</li>
                </ul>
              </div>
            </div>
          )
        },
        {
          title: "2. અમે તમારી માહિતીનો ઉપયોગ કેવી રીતે કરીએ છીએ",
          content: (
            <div className="space-y-4">
              <p>અમે તમારી માહિતીનો ઉપયોગ આ માટે કરીએ છીએ:</p>
              <ul className="list-disc space-y-2 pl-5 text-gray-600">
                <li>તમારા ઓર્ડર પર પ્રક્રિયા કરવા અને પહોંચાડવા માટે</li>
                <li>ઓર્ડર અપડેટ્સ, પુષ્ટિકરણો અને સપોર્ટ પ્રતિસાદો શેર કરવા</li>
                <li>અમારી વેબસાઇટ, ઉત્પાદનો અને ગ્રાહક અનુભવમાં સુધારો કરવા</li>
                <li>પ્રમોશનલ ઑફર્સ, ન્યૂઝલેટર્સ અથવા અપડેટ્સ મોકલવા (માત્ર જો તમે સંમતિ આપો તો)</li>
                <li>છેતરપિંડી અથવા અનધિકૃત પ્રવૃત્તિઓ શોધવા અને અટકાવવા</li>
                <li>કાનૂની અને નિયમનકારી આવશ્યકતાઓનું પાલન કરવું</li>
              </ul>
            </div>
          )
        },
        {
          title: "3. કૂકીઝ અને ટ્રેકિંગ ટેકનોલોજી",
          content: (
            <div className="space-y-4">
              <p>3.1 અમે કૂકીઝ અને સમાન તકનીકોનો ઉપયોગ આ માટે કરીએ છીએ:</p>
              <ul className="list-disc space-y-2 pl-5 text-gray-600">
                <li>તમારી પસંદગીઓને યાદ રાખવા</li>
                <li>વેબસાઇટ પ્રદર્શન સુધારવા</li>
                <li>ટ્રાફિક અને વપરાશની પદ્ધતિઓનું વિશ્લેષણ કરવા</li>
              </ul>
              <p>3.2 તમે તમારા બ્રાઉઝર સેટિંગ્સ દ્વારા કૂકીઝને અક્ષમ કરવાનું પસંદ કરી શકો છો; જો કે, વેબસાઇટની કેટલીક વિશેષતાઓ યોગ્ય રીતે કાર્ય કરી શકશે નહીં.</p>
            </div>
          )
        },
        {
          title: "4. માહિતીની વહેંચણી",
          content: (
            <div className="space-y-4">
              <p>4.1 અમે તમારી વ્યક્તિગત માહિતી તૃતીય પક્ષોને વેચતા કે ભાડે આપતા નથી.</p>
              <p>4.2 તમારી માહિતી ફક્ત આની સાથે શેર કરી શકાય છે:</p>
              <ul className="list-disc space-y-2 pl-5 text-gray-600">
                <li>સુરક્ષિત વ્યવહારો માટે પેમેન્ટ ગેટવે ભાગીદારો</li>
                <li>ઓર્ડર ડિલિવરી માટે કુરિયર અને લોજિસ્ટિક્સ ભાગીદારો</li>
                <li>વેબસાઇટ સંચાલન, વિશ્લેષણ અથવા ગ્રાહક સપોર્ટમાં મદદ કરતા સેવા પ્રદાતાઓ</li>
                <li>કાયદા દ્વારા જરૂરી હોય ત્યારે કાનૂની અથવા નિયમનકારી સત્તાધિકારીઓ</li>
              </ul>
            </div>
          )
        },
        {
          title: "5. ડેટા સુરક્ષા",
          content: (
            <div className="space-y-4">
              <p>5.1 અમે તમારા વ્યક્તિગત ડેટાને અનધિકૃત ઍક્સેસ, ફેરફાર, જાહેરાત અથવા વિનાશ સામે રક્ષણ આપવા માટે વાજબી સુરક્ષા પગલાં અમલમાં મૂકીએ છીએ.</p>
              <p>5.2 પ્રકૃષિ સંપૂર્ણ સુરક્ષાની ખાતરી આપી શકતું નથી. ઇન્ટરનેટ પર ટ્રાન્સમિશનની કોઈપણ પદ્ધતિ 100% સુરક્ષિત નથી.</p>
            </div>
          )
        },
        {
          title: "6. ડેટા રીટેન્શન",
          content: (
            <div className="space-y-4">
              <p>અમે તમારી વ્યક્તિગત માહિતી ફક્ત ત્યાં સુધી જ રાખીએ છીએ જ્યાં સુધી તે જરૂરી હોય:</p>
              <ul className="list-disc space-y-2 pl-5 text-gray-600">
                <li>આ નીતિમાં દર્શાવેલ હેતુઓને પૂર્ણ કરવા</li>
                <li>કાનૂની, હિસાબી અથવા નિયમનકારી જવાબદારીઓનું પાલન કરવા</li>
              </ul>
            </div>
          )
        },
        {
          title: "7. તમારા અધિકારો",
          content: (
            <div className="space-y-4">
              <p>તમારી પાસે અધિકાર છે:</p>
              <ul className="list-disc space-y-2 pl-5 text-gray-600">
                <li>તમારા વિશે અમારી પાસે રહેલી વ્યક્તિગત માહિતીની ઍક્સેસ</li>
                <li>ખોટી માહિતીના સુધારા અથવા અપડેટ માટેની વિનંતી</li>
                <li>તમારા વ્યક્તિગત ડેટાને કાઢી નાખવાની વિનંતી (કાનૂની જવાબદારીઓને આધીન)</li>
                <li>કોઈપણ સમયે માર્કેટિંગ સંચારમાંથી બહાર નીકળવાનો વિકલ્પ</li>
              </ul>
              <div className="rounded-2xl border border-[#14532d]/10 bg-white p-5 shadow-sm">
                <p className="text-gray-600">વિનંતીઓ ઇમેઇલ દ્વારા મોકલી શકાય છે: <a href="mailto:Sales.Prakrusham@gmail.com" className="font-semibold text-[#14532d] underline">Sales.Prakrusham@gmail.com</a></p>
              </div>
            </div>
          )
        },
        {
          title: "8. તૃતીય-પક્ષ લિંક્સ",
          content: (
            <p>અમારી વેબસાઇટમાં તૃતીય-પક્ષ વેબસાઇટ્સની લિંક્સ હોઈ શકે છે. પ્રકૃષિ આવી બાહ્ય વેબસાઇટ્સની ગોપનીયતા પદ્ધતિઓ અથવા સામગ્રી માટે જવાબદાર નથી.</p>
          )
        },
        {
          title: "9. બાળકોની ગુપ્તતા",
          content: (
            <p>પ્રકૃષિ જાણીજોઈને 18 વર્ષથી ઓછી ઉંમરના વ્યક્તિઓ પાસેથી વ્યક્તિગત માહિતી એકત્રિત કરતું નથી. જો આવા ડેટાની ઓળખ કરવામાં આવે, તો તેને તાત્કાલિક કાઢી નાખવામાં આવશે.</p>
          )
        },
        {
          title: "10. આ ગોપનીયતા નીતિમાં ફેરફારો",
          content: (
            <div className="space-y-4">
              <p>પ્રકૃષિ કોઈપણ સમયે આ ગોપનીયતા નીતિને અપડેટ અથવા સંશોધિત કરવાનો અધિકાર અનામત રાખે છે.</p>
              <p>ફેરફારો પછી વેબસાઇટનો સતત ઉપયોગ અપડેટ કરેલી નીતિની સ્વીકૃતિ દર્શાવે છે.</p>
            </div>
          )
        },
        {
          title: "11. અમારો સંપર્ક કરો",
          content: (
            <div className="rounded-2xl border border-[#14532d]/10 bg-green-50 p-8 shadow-sm">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#14532d]/60">પ્રાયવસી સપોર્ટ</p>
              <p className="mb-2 text-xl md:text-2xl font-semibold text-[#14532d]">અમે તમારી ગોપનીયતાનું સન્માન કરીએ છીએ</p>
              <p className="text-gray-600">ઇમેઇલ: <a href="mailto:Sales.Prakrusham@gmail.com" className="font-medium text-[#14532d] underline">Sales.Prakrusham@gmail.com</a></p>
            </div>
          )
        }
      ]
    };
    return data[lang] || data.en;
  };

  const sections = getSections(language);

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-white to-green-50 
pb-16 sm:pb-20 lg:pb-24 
pt-20 sm:pt-24 lg:pt-28 
text-[#14532d]"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6">

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-8 sm:mb-10 lg:mb-14 text-left"
        >
          <span className="mb-3 inline-flex rounded-full border border-[#14532d]/10 bg-green-50 px-4 py-2 text-sm font-black uppercase tracking-[0.3em] text-[#14532d]">
            {t('legal_document')}
          </span>

          <h1 className="mb-5 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#14532d] uppercase">
            {t('privacy_policy')}
          </h1>

          <p className="text-sm leading-relaxed text-gray-600 md:text-base">
            {t('privacy_intro')}
          </p>
        </motion.div>

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

              <div
                className="rounded-2xl border border-[#14532d]/10 bg-white 
p-4 sm:p-5 lg:p-6 
text-[14px] sm:text-[15px] 
leading-6 sm:leading-7 
text-gray-600 shadow-sm"
              >
                {section.content}
              </div>
            </motion.section>
          ))}
        </div>

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
