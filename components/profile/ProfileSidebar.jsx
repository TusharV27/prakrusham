"use client";

import { User, Package, MapPin, Settings, Heart } from "lucide-react";

export default function ProfileSidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: User },
    { id: "orders", label: "My Orders", icon: Package },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col gap-2 rounded-[32px] bg-white p-4 shadow-sm border border-[#14532d]/5">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center gap-4 rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              isActive
                ? "bg-[#14532d] text-white shadow-lg shadow-[#14532d]/20 scale-[1.02]"
                : "text-[#14532d]/60 hover:bg-[#14532d]/5 hover:text-[#14532d]"
            }`}
          >
            <Icon className={`h-4.5 w-4.5 ${isActive ? "text-white" : "text-[#14532d]/40"}`} />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
