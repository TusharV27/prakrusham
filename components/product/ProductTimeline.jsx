"use client";

import { FaShoppingBag, FaTruck, FaBox } from "react-icons/fa";

export default function ProductTimeline() {
  const today = new Date();
  const formatDate = (date) => {
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  const orderDate = formatDate(today);
  const dispatchDateStart = formatDate(
    new Date(today.getTime() + 1 * 24 * 60 * 60 * 1000)
  );
  const dispatchDateEnd = formatDate(
    new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
  );
  const deliveryDateStart = formatDate(
    new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000)
  );
  const deliveryDateEnd = formatDate(
    new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
  );

  const items = [
    {
      icon: <FaShoppingBag size={16} />,
      label: "ORDER",
      date: orderDate,
    },
    {
      icon: <FaTruck size={16} />,
      label: "ORDER DISPATCH",
      date: `${dispatchDateStart} - ${dispatchDateEnd}`,
    },
    {
      icon: <FaBox size={16} />,
      label: "DELIVERY",
      date: `${deliveryDateStart} - ${deliveryDateEnd}`,
    },
  ];

  return (
    <div className="bg-green-50 border border-green-100 rounded-2xl p-5 md:p-6 mb-6">

      <div className="relative flex justify-between items-start">

        <div className="absolute top-[20px] left-0 right-0 h-[2px] bg-green-200 z-0 mx-6" />

        {items.map((item, idx) => (
          <div
            key={idx}
            className="relative z-10 flex flex-col items-center text-center w-1/3"
          >
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white border border-green-200 text-[#14532d] flex items-center justify-center mb-2 shadow-sm">
              {item.icon}
            </div>

            <span className="text-sm md:text-xs font-semibold text-black mb-1 uppercase">
              {item.date}
            </span>

            <span className="text-sm md:text-xs font-medium text-gray-600 uppercase">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-2">

        <div className="flex items-center gap-2 text-[11px] md:text-sm font-medium text-black">
          <span>🚚</span>
          <span>Free Shipping In India (On Order Above ₹999)</span>
        </div>

        <div className="flex items-start gap-2 text-[11px] md:text-sm font-medium text-black leading-relaxed">
          <span>⏱️</span>
          <p>
            Order within the next{" "}
            <span className="font-semibold text-black">
              3h 56m 37s
            </span>{" "}
            for dispatch today, and you'll receive your package between{" "}
            <span className="underline decoration-dotted">
              {deliveryDateStart}
            </span>{" "}
            and{" "}
            <span className="underline decoration-dotted">
              {deliveryDateEnd}
            </span>
            .
          </p>
        </div>

      </div>
    </div>
  );
}