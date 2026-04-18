'use client';

import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Store,
  Package,
  Calendar,
  Settings,
  Bell,
  Search,
  LogOut,
  ChevronRight,
  Menu,
  MapPin,
  Warehouse,
  Percent,
  Star,
  Users as Customers,
  Image,
  Leaf,
  Tag,
  Truck,
  Boxes,
  MessageSquare,
  FileText,
  Activity,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: ShoppingBag, label: 'Orders', href: '/admin/orders' },
  { icon: Package, label: 'Products', href: '/admin/products' },
  { icon: Tag, label: 'Categories', href: '/admin/categories' },
  { icon: Users, label: 'Farmers', href: '/admin/farmers' },
  { icon: Store, label: 'Vendors', href: '/admin/vendors' },
  { icon: Boxes, label: 'Inventory', href: '/admin/inventory' },
  { icon: Activity, label: 'Offers', href: '/admin/offers' },
  
  // New Items
  { icon: MapPin, label: 'Areas', href: '/admin/areas' },
  { icon: Truck, label: 'Shipping', href: '/admin/settings/shipping' },
  { icon: Warehouse, label: 'Warehouses', href: '/admin/warehouses' },
  { icon: Percent, label: 'Discounts', href: '/admin/settings/discounts' },
  { icon: Star, label: 'Recommendations', href: '/admin/recommendations' },
  { icon: MessageSquare, label: 'Reviews', href: '/admin/reviews' },
  { icon: Customers, label: 'Customers', href: '/admin/customers' },
  { icon: Image, label: 'Gallery', href: '/admin/gallery' },

  { icon: Calendar, label: 'Events', href: '/admin/events' },
  { icon: FileText , label: 'Blogs', href: '/admin/blogs' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
];

export default function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return sidebarItems.filter((item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', {
      method: 'POST',
    });
    
    router.push('/admin/login');
    router.refresh();   // middleware ko refresh karne ke liye
  };

  return (
    <div className="flex h-screen bg-[#F4F6F8] font-sans text-gray-900">
      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {!isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(true)}
            className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Admin Sidebar */}
      <motion.aside
        animate={{ width: isSidebarOpen ? 260 : 72 }}
        className="h-full bg-[#EBEBED] text-gray-700 flex flex-col relative z-50 transition-all duration-300 border-r border-[#D1D1D1]"
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center px-6 gap-3 overflow-hidden border-b border-[#D1D1D1]">
          <div className="w-8 h-8 bg-gray-900 rounded-[6px] flex items-center justify-center shrink-0">
            <Leaf className="text-white" size={18} />
          </div>
          <AnimatePresence>
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-lg font-bold text-gray-900 tracking-tight whitespace-nowrap"
              >
                Prakrushi
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-grow p-2 overflow-y-auto overflow-x-hidden scrollbar-hide space-y-0.5">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-1.5 rounded-[6px] transition-colors relative ${
                  isActive
                    ? 'bg-white text-gray-900 shadow-sm border border-[#D1D1D1]'
                    : 'text-gray-700 hover:bg-black/5'
                }`}
              >
                <div className="flex items-center justify-center w-5 h-5">
                  <item.icon
                    size={18}
                    className={`${isActive ? 'text-gray-900' : 'text-gray-600'}`}
                  />
                </div>

                <AnimatePresence>
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`text-[13px] font-medium whitespace-nowrap ${isActive ? 'font-semibold' : ''}`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section */}
        <div className="p-2 border-t border-[#D1D1D1] space-y-1">
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2 text-gray-700 hover:bg-rose-50 hover:text-rose-700 rounded-[6px] transition-colors ${
              !isSidebarOpen ? 'justify-center' : ''
            }`}
          >
            <LogOut size={18} />
            {isSidebarOpen && <span className="text-[13px] font-medium">Logout</span>}
          </button>

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center gap-2 py-2 text-gray-500 hover:text-gray-700 hover:bg-black/5 rounded-[6px] transition-colors"
          >
            {isSidebarOpen ? (
              <>
                <ChevronRight size={16} className="rotate-180" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Collapse</span>
              </>
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-hidden relative">
        <header className="h-14 bg-white border-b border-gray-200 px-6 flex justify-between items-center sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-1.5 hover:bg-gray-100 rounded-md text-gray-600"
            >
              <Menu size={18} />
            </button>
            <div className="relative group hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gray-600" size={14} />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onFocus={() => setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 150)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    if (searchResults.length > 0) {
                      router.push(searchResults[0].href);
                    }
                  }
                }}
                className="pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-black focus:border-black w-64 lg:w-96 transition-all outline-none text-gray-700"
              />
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-40">
                  {searchResults.map((item) => (
                    <button
                      key={item.href}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => router.push(item.href)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-sm text-gray-700"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-1.5 text-gray-500 hover:text-gray-900 transition-colors hover:bg-gray-100 rounded-md">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-600 rounded-full"></span>
            </button>

            <div className="h-6 w-px bg-gray-200"></div>

            <div className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1 rounded-md transition-colors cursor-pointer group">
              <div className="text-right flex flex-col">
                <span className="text-xs font-semibold text-gray-900 leading-tight">Admin User</span>
                <span className="text-sm text-gray-500 font-medium">Super Admin</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center text-white text-xs font-bold shrink-0">
                AU
              </div>
            </div>
          </div>
        </header>

        <div className="flex-grow overflow-auto p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}