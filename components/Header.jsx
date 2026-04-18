"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useWishlist } from "@/context/WishlistContext";
import { FiGlobe } from "react-icons/fi";
import { LocateFixed } from "lucide-react";
import { getTranslated } from "@/utils/translation";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { openDrawer, cartItems } = useCart();
  const { wishlistItems } = useWishlist();
  const { openLogin, user, logout, selectedArea, openLocation } = useAuth();
  const [megaOpen, setMegaOpen] = useState(false);
  const [activeMegaItem, setActiveMegaItem] = useState("");
  const [mobileCategoryOpen, setMobileCategoryOpen] = useState(false);
  const { language, t, openLanguage } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const locationRef = useRef(null);
  const searchRef = useRef(null);

  // Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Helper for localized strings from DB
  const gt = (field) => getTranslated(field, language);

  const getInitials = (name) => {
    const rawName = gt(name);
    if (!rawName) return "U";
    return rawName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Debounced Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery)}&limit=6`);
          const data = await res.json();
          if (data.success) {
            setSearchResults(data.data);
            setShowResults(true);
          }
        } catch (error) {
          console.error("Search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handle Search Result Selection
  const handleResultClick = () => {
    setSearchQuery("");
    setShowResults(false);
    setMenuOpen(false);
  };

  // Handle Click Outside Search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.success) {
          setCategories(data.data);
          if (data.data.length > 0) {
            setActiveMegaItem(data.data[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const navLinks = [
    // { name: t("home"), href: "/" },
    { name: t("categories") || "Categories", href: "/categories" },
    // { name: t("blogs"), href: "/blog" },
    // { name: t("about_us"), href: "/about" },
    { name: t("contact_us"), href: "/contact" },
  ];

  const activeMegaLink = categories.find((item) => item.id === activeMegaItem) || categories[0];

  return (
    <>
      <header className="fixed top-0 left-0 z-50 w-full border-b border-[#14532d]/10 bg-white/85 backdrop-blur-xl ">
        <nav className="mx-auto flex h-[72px] max-w-[1440px] items-center px-4 sm:px-6">
          {/* ================= MOBILE HEADER ================= */}
          <div className="flex w-full items-center justify-between lg:hidden">
            {/* Left - Hamburger */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#14532d]/10 bg-white/70 text-[#14532d] transition-all duration-300"
              aria-label="Toggle Menu"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            {/* Center - Logo */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2 z-50">
              <Link href="/">
                <img
                  src="/Logo1.webp"
                  alt="Prakrusham Logo"
                  className="h-25 w-auto object-contain drop-shadow-sm"
                />
              </Link>
            </div>
            {/* Right - Mobile Search Toggle */}
            <button
              onClick={() => setMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[#14532d]/10 bg-white/70 text-[#14532d] transition-all duration-300"
              aria-label="Search"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>

          {/* ================= DESKTOP HEADER ================= */}
          <div className="hidden lg:flex w-full items-center justify-between relative h-full">
            {/* Left Section: Location & Navigation */}
            <div className="flex items-center gap-6 xl:gap-8 h-full">
              <button
                ref={locationRef}
                onClick={() => {
                  const rect = locationRef.current?.getBoundingClientRect();
                  openLocation(rect ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height } : null);
                }}
                className="flex items-center gap-2 rounded-full border border-[#14532d]/10 bg-[#fdfaf5] px-3 py-1.5 transition-all hover:border-[#14532d]/30"
              >
                <svg className="h-3.5 w-3.5 text-[#16a34a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#14532d]">
                  {selectedArea ? gt(selectedArea.areaName) : t("detect_location")}
                </span>
              </button>

              <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-[0.22em] text-[#14532d]/70">
                {navLinks.map((link) => (
                  <div key={link.name} className="flex items-center h-[72px]">
                    {link.href === "/categories" ? (
                      <div
                        className="h-full flex items-center"
                        onMouseEnter={() => setMegaOpen(true)}
                        onMouseLeave={() => setMegaOpen(false)}
                      >
                        <span className="relative cursor-pointer transition-colors duration-300 hover:text-black">
                          {link.name}
                        </span>

                        {megaOpen && (
                          <div className="absolute left-1/2 top-[72px] -z-10 -translate-x-1/2 w-[96vw] max-w-[1120px] border-x border-b border-[#14532d]/15 bg-white/95 p-5 pt-10 shadow-2xl backdrop-blur-md">
                            <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
                              <div className="space-y-4 border border-[#e6f5ec] bg-[#f8fbf8] p-4 shadow-sm rounded-xl">
                                <div className="text-[10px] font-bold uppercase tracking-[0.28em] text-[#14532d]/60">
                                  {t("all_collections")}
                                </div>
                                <div className="grid gap-2">
                                  {categories.map((item) => (
                                    <Link
                                      key={item.id}
                                      href={`/category/${item.slug}`}
                                      onMouseEnter={() => setActiveMegaItem(item.id)}
                                      className={`group block rounded-2xl px-4 py-3 transition duration-300 ${activeMegaItem === item.id
                                        ? "bg-[#14532d] text-white"
                                        : "text-[#14532d]/75 hover:bg-[#eef7ed] hover:text-[#14532d]"
                                        }`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <img
                                          src={item.icon || item.image || "/placeholder.png"}
                                          alt={gt(item.name)}
                                          className="w-8 h-8 object-cover rounded-full bg-white p-0.5"
                                        />
                                        <span className="text-[11px] font-bold uppercase tracking-[0.24em]">
                                          {gt(item.name)}
                                        </span>
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                              <div className="overflow-hidden bg-[#fafafa] rounded-xl flex flex-col">
                                <div className="relative flex-1 overflow-hidden group/img">
                                  <img
                                    src={activeMegaLink?.image || "/placeholder-wide.png"}
                                    alt={gt(activeMegaLink?.name)}
                                    className="h-full w-full object-cover transition duration-700 ease-out group-hover/img:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
                                    <h4 className="text-[18px] font-bold uppercase tracking-[0.2em] text-white mb-2">
                                      {gt(activeMegaLink?.name)}
                                    </h4>
                                    <p className="text-white/70 text-[10px] uppercase tracking-widest font-medium">
                                      {t("tap_to_explore")}
                                    </p>
                                  </div>
                                </div>
                                <div className="p-4 bg-white border-t border-[#f0f0f0] flex justify-between items-center">
                                  <div className="flex gap-4">
                                    <div className="flex flex-col">
                                      <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold">{t("categories")}</span>
                                      <span className="text-[11px] font-bold text-[#14532d]">{gt(activeMegaLink?.name)}</span>
                                    </div>
                                  </div>
                                  <Link href={`/category/${activeMegaLink?.slug}`} className="bg-[#14532d] text-white text-[10px] font-bold px-6 py-2 rounded-full uppercase tracking-widest hover:bg-[#166534] transition-colors">
                                    {t("view_label")}
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link href={link.href} className="relative transition-colors duration-300 hover:text-black after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-black after:transition-all after:duration-300 hover:after:w-full">
                        {link.name}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Center Section: Logo (Hanging Style) */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2 z-50">
              <Link href="/">
                <img
                  src="/Logo1.webp"
                  alt="Prakrusham Logo"
                  className="h-32 w-auto object-contain drop-shadow-sm"
                />
              </Link>
            </div>

            {/* Right Section: Utilities & SEARCH */}
            <div className="flex items-center justify-end gap-2 sm:gap-3 flex-shrink-0">
              
              {/* Desktop Search Bar */}
              <div ref={searchRef} className="relative hidden xl:block">
                 <div className="relative group">
                    <input 
                      type="text"
                      placeholder={t("search_placeholder") || "Search products..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => setShowResults(searchQuery.length >= 2)}
                      className="w-48 xl:w-64 h-10 pl-10 pr-4 rounded-full border border-[#14532d]/10 bg-white/70 text-[11px] font-bold outline-none transition-all focus:w-80 focus:border-[#14532d]/30 focus:bg-white shadow-sm"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#14532d]/40 group-focus-within:text-[#14532d]">
                       {isSearching ? (
                         <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#14532d]/20 border-t-[#14532d]" />
                       ) : (
                         <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
                         </svg>
                       )}
                    </div>
                 </div>

                 {/* Desktop Results Dropdown */}
                 {showResults && searchResults.length > 0 && (
                   <div className="absolute right-0 top-12 w-96 max-h-[480px] overflow-y-auto rounded-3xl border border-[#14532d]/10 bg-white/95 p-3 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-300 z-[100]">
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-[#14532d]/40 px-3 py-2 border-b border-[#14532d]/5 mb-2 flex justify-between items-center">
                         <span>{t("search_results") || "Found Products"}</span>
                         <span className="text-[#14532d]/20">{searchResults.length} {t("items") || "items"}</span>
                      </div>
                      {searchResults.map((product) => (
                        <Link 
                          key={product.id} 
                          href={`/products/${product.slug}`}
                          onClick={handleResultClick}
                          className="flex items-center gap-4 p-2.5 rounded-2xl hover:bg-[#f0f9f4] transition-all group"
                        >
                           <div className="h-14 w-14 rounded-xl overflow-hidden bg-white border border-[#14532d]/5 shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                              <img src={product.image || "/placeholder.png"} className="h-full w-full object-cover" alt={gt(product.name)} />
                           </div>
                           <div className="flex-1 min-w-0">
                              <h5 className="text-[11px] font-black uppercase tracking-tight text-slate-900 truncate">{gt(product.name)}</h5>
                              <p className="text-[9px] font-black text-[#14532d]/60 mt-0.5 tracking-widest uppercase">{product.categoryName || "Fresh Produce"}</p>
                              <div className="flex items-center gap-2 mt-1">
                                 <span className="text-xs font-black text-[#14532d]">₹{product.price}</span>
                                 {product.inventory <= 0 && <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">{t("sold_out") || "SOLD OUT"}</span>}
                              </div>
                           </div>
                           <div className="text-[#14532d]/20 group-hover:text-[#14532d] transition-colors">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                           </div>
                        </Link>
                      ))}
                      <Link 
                        href={`/search?q=${encodeURIComponent(searchQuery)}`}
                        onClick={handleResultClick}
                        className="block w-full mt-2 p-3 text-center text-[10px] font-black uppercase tracking-[0.3em] text-[#14532d] bg-[#f0f9f4] rounded-2xl hover:bg-[#14532d] hover:text-white transition-all"
                      >
                         {t("view_all_results") || "View all results"}
                      </Link>
                   </div>
                 )}
                 {showResults && searchResults.length === 0 && !isSearching && (
                    <div className="absolute right-0 top-12 w-80 rounded-3xl border border-[#14532d]/10 bg-white/95 p-6 shadow-2xl backdrop-blur-xl text-center">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">No matches for</p>
                       <p className="text-[12px] font-black text-[#14532d] truncate">"{searchQuery}"</p>
                    </div>
                 )}
              </div>

              <div className="relative">
                <button onClick={openLanguage} className="flex items-center gap-2 rounded-full border border-[#14532d]/10 bg-white/70 px-3 py-2 text-[10px] font-bold text-[#14532d] transition-all duration-300 hover:border-[#14532d]/20">
                  <FiGlobe className="text-[16px]" /> {language.toUpperCase()}
                  <svg className="h-3 w-3 text-[#14532d]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 8l4 4 4-4"></path></svg>
                </button>
              </div>
              <Link href="/wishlist" className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#14532d]/10 bg-white/70 text-[#14532d] transition-all duration-300 hover:bg-[#14532d] hover:text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 20.364 4.318 12.682a4.5 4.5 0 010-6.364z" /></svg>
                {wishlistItems.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#14532d] px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              {user ? (
                <div className="flex items-center gap-3">
                  <Link href="/profile" className="hidden lg:flex items-center justify-center transition-all duration-300 group" title={gt(user.name)}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#14532d] to-[#166534] text-[12px] font-bold text-white shadow-md ring-2 ring-white transition-all group-hover:scale-110 group-hover:shadow-lg group-hover:ring-[#14532d]/20">
                      {getInitials(user.name)}
                    </div>
                  </Link>
                  <button onClick={logout} className="text-[#14532d]/60 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                  </button>
                </div>
              ) : (
                <button onClick={openLogin} className="hidden lg:inline-flex items-center justify-center rounded-full bg-[#14532d] px-6 py-2.5 text-[11px] font-black uppercase tracking-[0.18em] text-white transition-all duration-300 hover:bg-[#166534] hover:shadow-lg hover:shadow-[#14532d]/20">{t("login_btn")}</button>
              )}
              <button onClick={openDrawer} className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#14532d]/10 bg-white/70 text-[#14532d] transition-all duration-300 hover:bg-[#14532d] hover:text-white">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1 5h12M10 21a1 1 0 100-2 1 1 0 000 2zm8 0a1 1 0 100-2 1 1 0 000 2z" /></svg>
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#14532d] px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)}
                </span>
              </button>
            </div>
          </div>
        </nav>

        {/* ================= MOBILE MENU DRAWER ================= */}
        <div
          className={`lg:hidden overflow-hidden border-t border-[#14532d]/10 bg-white/95 backdrop-blur-xl transition-all duration-300 ${menuOpen ? "max-h-[90vh] opacity-100 overflow-y-auto" : "max-h-0 opacity-0"
            }`}
        >
          <div className="px-4 py-5 pb-24">
            
            {/* Mobile Search Bar In Drawer */}
            <div className="mb-8 relative group">
                <input 
                  type="text"
                  placeholder={t("search_placeholder") || "Search products..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-14 pl-12 pr-4 rounded-2xl border border-[#14532d]/10 bg-[#f8fbf8] text-[12px] font-bold outline-none transition-all focus:border-[#14532d]/30 focus:bg-white shadow-sm"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#14532d]/40">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                {isSearching && (
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin rounded-full border-2 border-[#14532d]/20 border-t-[#14532d]" />
                )}

                {/* Mobile Results Dropdown */}
                {searchQuery.length >= 2 && searchResults.length > 0 && (
                   <div className="mt-3 overflow-hidden rounded-2xl border border-[#14532d]/10 bg-white shadow-xl">
                      <div className="text-[10px] font-black uppercase tracking-widest text-[#14532d]/40 px-5 py-3 border-b border-[#14532d]/5">
                         {t("top_matches") || "Top Matches"}
                      </div>
                      <div className="divide-y divide-[#14532d]/5">
                        {searchResults.map((product) => (
                           <Link 
                             key={product.id} 
                             href={`/products/${product.slug}`}
                             onClick={handleResultClick}
                             className="flex items-center gap-4 p-4 hover:bg-[#f0f9f4] active:bg-[#e8f5ed] transition-colors"
                           >
                              <div className="h-12 w-12 rounded-xl overflow-hidden bg-gray-50 border border-[#14532d]/5 shrink-0">
                                 <img src={product.image || "/placeholder.png"} className="h-full w-full object-cover" alt={gt(product.name)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <h5 className="text-[12px] font-black uppercase tracking-tight text-slate-900 truncate">{gt(product.name)}</h5>
                                 <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs font-black text-[#14532d]">₹{product.price}</span>
                                 </div>
                              </div>
                           </Link>
                        ))}
                      </div>
                      <Link 
                        href={`/search?q=${encodeURIComponent(searchQuery)}`}
                        onClick={handleResultClick}
                        className="block w-full p-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white bg-[#14532d]"
                      >
                         {t("view_all_results") || "View all results"}
                      </Link>
                   </div>
                )}
            </div>

            <div className="flex flex-col gap-3 text-[11px] font-black uppercase tracking-[0.18em] text-[#14532d]/80">
              <button
                onClick={() => { setMenuOpen(false); openLocation(); }}
                className="flex items-center gap-3 rounded-xl bg-[#14532d]/5 px-4 py-4 text-[#14532d] border border-[#14532d]/5"
              >
                <LocateFixed className="h-5 w-5 text-[#16a34a]" />
                <div className="flex flex-col items-start">
                  <span className="text-[9px] uppercase tracking-widest text-[#14532d]/50 font-bold mb-0.5">Delivery Location</span>
                  <span className="text-[12px] font-bold">{selectedArea ? gt(selectedArea.areaName) : t("detect_location")}</span>
                </div>
              </button>

              <div className="rounded-3xl border border-[#d4e9d6] bg-[#f7fbf7] p-3 shadow-sm">
                <button onClick={openLanguage} className="flex w-full items-center justify-between gap-3 rounded-3xl bg-white px-4 py-3 text-[#14532d]">
                  <div className="text-left">
                    <div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#14532d]/50 mb-1">
                      Language
                    </div>
                    <p className="text-[12px] text-[#14532d] uppercase font-bold">
                      {language === "en" ? "English" : language === "hi" ? "Hindi" : "Gujarati"}
                    </p>
                  </div>
                  <div className="bg-[#14532d] text-white p-2.5 rounded-full shadow-lg shadow-[#14532d]/20">
                    <FiGlobe className="text-lg" />
                  </div>
                </button>
              </div>

              {navLinks.map((link) => {
                if (link.href === "/categories") {
                  return (
                    <div key={link.name} className="border-b border-[#14532d]/10 py-3 px-3">
                      <button
                        onClick={() => setMobileCategoryOpen(!mobileCategoryOpen)}
                        className="flex w-full items-center justify-between text-left text-[#14532d] font-bold uppercase tracking-[0.18em]"
                      >
                        <span>{link.name}</span>
                        <span className="text-lg">{mobileCategoryOpen ? "−" : "+"}</span>
                      </button>

                      {mobileCategoryOpen && (
                        <div className="mt-4 pl-2 space-y-3">
                          {categories.map((item) => (
                            <Link
                              key={item.id}
                              href={`/category/${item.slug}`}
                              onClick={() => { setMenuOpen(false); setMobileCategoryOpen(false); }}
                              className="block rounded-2xl border border-[#e3f2e7] bg-[#f8fbf8] px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.24em] text-[#14532d] transition hover:bg-[#eef8ef]"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                  <img src={item.icon || item.image || "/placeholder.png"} alt={gt(item.name)} className="w-8 h-8 object-cover rounded-full bg-white p-0.5 shadow-sm" />
                                  <span>{gt(item.name)}</span>
                                </div>
                                <span className="text-[10px] text-[#14532d]/60 font-black">{t("view_label")}</span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <Link key={link.name} href={link.href} onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-4 transition hover:bg-[#14532d]/5 hover:text-black border-b border-[#14532d]/5 last:border-0">
                    {link.name}
                  </Link>
                );
              })}
            </div>
            <div className="my-8 h-px w-full bg-gradient-to-r from-transparent via-[#14532d]/10 to-transparent" />
          </div>
        </div>
      </header>

      {/* ================= MOBILE + TABLET BOTTOM NAV ================= */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="relative border-t border-[#14532d]/10 bg-white/95 py-3 shadow-[0_-10px_35px_rgba(0,0,0,0.05)] backdrop-blur-xl overflow-hidden">
          <div className="grid grid-cols-5 items-center w-full">
            <Link href="/" className="flex flex-col items-center justify-center gap-1 text-[#14532d]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
              <span className="text-[10px] font-bold uppercase tracking-wider">{t("home")}</span>
            </Link>
            <Link href="/new-arrivals" className="flex flex-col items-center justify-center gap-1 text-[#14532d]">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <span className="text-[10px] font-bold uppercase tracking-wider">{t("new_arrivals")}</span>
            </Link>
            <button onClick={openDrawer} className="flex flex-col items-center justify-center gap-1 text-[#14532d]">
              <div className="relative">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                {cartItems.length > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#16a34a] px-1 text-[9px] font-bold text-white shadow-sm ring-1 ring-white">{cartItems.length}</span>}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">{t("cart")}</span>
            </button>
            <Link href="/wishlist" className="flex flex-col items-center justify-center gap-1 text-[#14532d]">
              <div className="relative">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                {wishlistItems.length > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#16a34a] px-1 text-[9px] font-bold text-white shadow-sm ring-1 ring-white">{wishlistItems.length}</span>}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">{t("wishlist_label")}</span>
            </Link>
            <button onClick={user ? () => { } : openLogin} className="flex flex-col items-center justify-center gap-1 text-[#14532d]">
              {user ? (
                <Link href="/profile" className="flex flex-col items-center justify-center gap-1">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#14532d] text-[9px] font-bold text-white uppercase">{getInitials(user.name)}</div>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{t("profile")}</span>
                </Link>
              ) : (
                <>
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{t("login")}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
