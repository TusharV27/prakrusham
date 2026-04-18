"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Settings,
  Percent,
  Truck,
  CreditCard,
  Users,
  ShieldCheck,
  Bell,
  Languages,
  Globe,
  Tag,
  ArrowRight,
  Store,
  Database,
  Search,
  X,
} from "lucide-react";
import { motion } from "framer-motion";

const settingsGroups = [
  {
    title: "Store Configuration",
    items: [
      {
        icon: Store,
        color: "text-blue-600",
        bg: "bg-blue-50",
        label: "General",
        description:
          "View and update your store details and contact information.",
        href: "/admin/settings/general",
      },
      {
        icon: Percent,
        color: "text-green-600",
        bg: "bg-green-50",
        label: "Taxes and duties",
        description: "Manage how your store charges taxes and duties.",
        href: "/admin/settings/taxes",
      },
      {
        icon: Truck,
        color: "text-purple-600",
        bg: "bg-purple-50",
        label: "Shipping and delivery",
        description: "Choose where you ship and how much you charge.",
        href: "/admin/settings/shipping",
      },
      {
        icon: Tag, // ya Discount icon (lucide-react ma Tag / BadgePercent best lage)
        color: "text-green-600",
        bg: "bg-green-50",
        label: "Offers & Promotions",
        description: "Create and manage discount codes, offers, and promotions.",
        href: "/admin/settings/discounts",
      },
      { 
        icon: Database,
        color: "text-blue-600",
        bg: "bg-blue-50",
        label: "Metafields & Metaobjects",
        description:
          "Add custom fields to store additional product or store data.",
        href: "/admin/settings/metafields",
      },
    ],
  },
  {
    title: "Payments & Access",
    items: [
      {
        icon: CreditCard,
        color: "text-orange-600",
        bg: "bg-orange-50",
        label: "Payments",
        description: "Choose providers and payment methods for your store.",
        href: "/admin/settings/payments",
      },
      {
        icon: Users,
        color: "text-cyan-600",
        bg: "bg-cyan-50",
        label: "Users and permissions",
        description: "Manage what users can see and do in your store.",
        href: "/admin/settings/users",
      },
    ],
  },
  {
    title: "Store Experience",
    items: [
      {
        icon: Bell,
        color: "text-rose-600",
        bg: "bg-rose-50",
        label: "Notifications",
        description: "Manage the emails sent to you and your customers.",
        href: "/admin/settings/notifications",
      },
      {
        icon: Languages,
        color: "text-indigo-600",
        bg: "bg-indigo-50",
        label: "Languages",
        description:
          "Manage the languages your customers can see on your store.",
        href: "/admin/settings/languages",
      },
    ],
  },
];

export default function AdminSettingsPortal() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSettingsGroups = useMemo(() => {
    if (!searchTerm.trim()) return settingsGroups;

    return settingsGroups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase())
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [searchTerm]);

  return (
    <div className="w-full min-h-screen bg-[#f4f6f8] font-sans pb-20">
      <div className="max-w-[900px] mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-[#202223]">Settings</h1>
              <p className="text-sm text-[#6d7175]">
                Manage your store's configurations and preferences.
              </p>
            </div>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg border border-[#c9cccf] bg-white text-sm font-semibold text-[#202223] hover:bg-[#fafbfb] transition-colors"
            >
              Exit settings
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-[#6d7175]" />
            </div>
            <input
              type="text"
              placeholder="Search settings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-3 bg-white border border-[#c9cccf] rounded-lg text-sm placeholder:text-[#6d7175] focus:outline-none focus:ring-2 focus:ring-[#202223] focus:border-transparent transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X size={16} className="text-[#6d7175] hover:text-[#202223] transition-colors" />
              </button>
            )}
          </div>
        </div>

        {/* Settings Grid */}
        <div className="space-y-10">
          {filteredSettingsGroups.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#f4f6f8] rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={24} className="text-[#c9cccf]" />
              </div>
              <h3 className="text-lg font-semibold text-[#202223] mb-2">
                No settings found
              </h3>
              <p className="text-sm text-[#6d7175]">
                Try adjusting your search terms or browse all settings below.
              </p>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="mt-4 px-4 py-2 bg-[#202223] text-white text-sm font-medium rounded-lg hover:bg-[#323232] transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          ) : (
            filteredSettingsGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-4">
                <h2 className="text-sm font-semibold text-[#6d7175] uppercase tracking-wider px-1">
                  {group.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.items.map((item, itemIdx) => (
                    <Link key={itemIdx} href={item.href}>
                      <motion.div
                        whileHover={{ y: -2 }}
                        className="bg-white p-5 rounded-xl border border-[#c9cccf] shadow-sm hover:shadow-md transition-all group cursor-pointer h-full flex items-start gap-4"
                      >
                        <div
                          className={`${item.bg} ${item.color} p-3 rounded-lg flex items-center justify-center shrink-0`}
                        >
                          <item.icon size={22} />
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-[#202223] group-hover:text-[#008060] transition-colors">
                              {item.label}
                            </h3>
                            <ArrowRight
                              size={14}
                              className="text-[#c9cccf] group-hover:text-[#008060] group-hover:translate-x-1 transition-all"
                            />
                          </div>
                          <p className="text-sm text-[#6d7175] leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Info */}
        <div className="pt-10 border-t border-[#c9cccf] text-center">
          <p className="text-[13px] text-[#6d7175]">
            Need help with your settings?{" "}
            <Link
              href="/admin/help"
              className="text-[#006fbb] hover:underline font-medium"
            >
              Visit our help center
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

