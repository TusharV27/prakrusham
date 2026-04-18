"use client";

import { useState } from "react";
import { FaPlus, FaMinus, FaLeaf, FaVectorSquare, FaSeedling, FaUserCircle } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { getTranslated } from "@/utils/translation";

export function AccordionItem({ title, children, defaultOpen = false, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-green-100 rounded-2xl mb-3 overflow-hidden bg-white shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-green-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`w-8 h-8 rounded-lg ${Icon === FaLeaf ? 'bg-emerald-100 text-emerald-700' : 'bg-green-100 text-[#14532d]'} flex items-center justify-center`}>
              <Icon size={14} />
            </div>
          )}
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-800">
            {title}
          </span>
        </div>

        <div className="text-gray-400">
          {isOpen ? <FaMinus size={10} /> : <FaPlus size={10} />}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed font-normal border-t border-green-50 pt-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductAccordions({ product }) {
  const { language, t } = useLanguage();

  const gt = (field) => getTranslated(field, language);

  const farmer = product?.farmer;
  const farmerName = farmer?.user?.name ? gt(farmer.user.name) : t("farmers_label");
  const farmerBio = farmer?.farmDetails ? gt(farmer.farmDetails) : null;
  const landSize = farmer?.landSize;
  const metafields = farmer?.metafields || [];

  const practiceKeys = ["specialization", "practices", "farming_focus", "methods", "expertise", "work"];
  const practicesMeta = metafields.find(m => 
    practiceKeys.includes(m.key.toLowerCase())
  );
  const farmingPractices = practicesMeta ? practicesMeta.value : (landSize > 0 ? t('natural_farming_default') : null);

  return (
    <div className="space-y-4 mt-8">
      {/* Producer Story Accordion - Added by request to match Shipping Policy style */}
      {farmer && (
        <AccordionItem title={t("farmer_story")} icon={FaLeaf} defaultOpen={false}>
          <div className="space-y-5 py-2">
            
            {/* Farmer Header Info */}
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-xl border-2 border-emerald-50 overflow-hidden shrink-0">
                  {farmer.user?.profileImage ? (
                    <img src={farmer.user.profileImage} alt={farmerName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <FaUserCircle size={24} />
                    </div>
                  )}
               </div>
               <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{farmerName}</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Verified Producer</span>
                  </div>
               </div>
            </div>

            {/* Farmer Bio */}
            {farmerBio && (
              <p className="text-[12px] italic text-slate-600 leading-relaxed font-medium bg-emerald-50/30 p-4 rounded-2xl border border-emerald-50">
                "{farmerBio}"
              </p>
            )}

            {/* Technical Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
               {landSize > 0 && (
                 <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-emerald-50 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                       <FaVectorSquare size={14} />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                          {t('land_size')}
                       </span>
                       <span className="text-[11px] font-black text-slate-800">
                          {landSize} {t('acres')}
                       </span>
                    </div>
                 </div>
               )}

               {farmingPractices && (
                 <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-amber-50 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                       <FaSeedling size={14} />
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                          {t('farming_practices')}
                       </span>
                       <span className="text-[11px] font-black text-slate-800 leading-tight">
                          {farmingPractices}
                       </span>
                    </div>
                 </div>
               )}
            </div>
          </div>
        </AccordionItem>
      )}

      <AccordionItem title={t("shipping_policy") || "SHIPPING POLICY"}>
        <p className="text-xs">
          {t("shipping_intro") || "Standard delivery takes 3-7 business days. We offer free shipping on all orders above ₹999."}
        </p>
      </AccordionItem>

      <AccordionItem title={t("specifications") || "COMBO CONSTITUENTS"}>
        <ul className="list-disc pl-5 space-y-2 text-xs">
          <li>{t("direct_from_farms") || "Farm-to-home High quality produce"}</li>
          <li>{t("natural_100") || "Organic sources only"}</li>
          <li>{t("feature_quality_title") || "Eco-friendly Premium packaging"}</li>
        </ul>
      </AccordionItem>
    </div>
  );
}