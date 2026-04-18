"use client";

import { 
  FaCheckCircle, 
  FaShieldAlt, 
  FaMoneyBillWave, 
  FaTruck 
} from "react-icons/fa";

export default function TrustBadges() {
  const badges = [
    {
      icon: <FaCheckCircle className="text-emerald-600" />,
      label: "GENUINE",
      subLabel: "PRICE"
    },
    {
      icon: <FaShieldAlt className="text-emerald-600" />,
      label: "7-STEP",
      subLabel: "QUALITY"
    },
    {
      icon: <FaMoneyBillWave className="text-emerald-600" />,
      label: "COD",
      subLabel: "AVAILABLE"
    },
    {
      icon: <FaTruck className="text-emerald-600" />,
      label: "FREE",
      subLabel: "SHIPPING"
    }
  ];

  return (
    <div className="w-full py-2">
      <div className="max-w-7xl mx-auto bg-white border border-slate-100 rounded-2xl md:rounded-[2rem] p-3 md:p-6 shadow-sm">
        {/* - Single line across all sizes.
            - Justified between to use full width without scrolling.
        */}
        <div className="flex flex-row items-center justify-between w-full">
          {badges.map((badge, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col items-center text-center flex-1 px-1
                ${idx !== badges.length - 1 ? "border-r border-slate-100" : ""}`}
            >
              {/* Icon Container - Scaled for mobile */}
              <div className="w-7 h-7 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg md:rounded-2xl bg-emerald-50 flex items-center justify-center mb-1.5 md:mb-3 shrink-0">
                <div className="text-sm sm:text-lg md:text-xl">
                  {badge.icon}
                </div>
              </div>

              {/* Text Labels - Smaller on mobile to prevent wrapping */}
              <div className="flex flex-col">
                <p className="text-[7px] sm:text-[9px] md:text-[11px] font-black text-slate-900 tracking-tight sm:tracking-[0.1em] uppercase leading-tight">
                  {badge.label}
                </p>
                <p className="text-[6px] sm:text-[8px] md:text-[10px] font-bold text-slate-400 uppercase leading-tight">
                  {badge.subLabel}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}