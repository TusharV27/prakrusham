"use client";

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// ─── Location via our own server-side proxy (avoids CORS) ───────────────────
async function getIPLocation() {
  try {
    const res = await fetch("/api/location", {
      signal: AbortSignal.timeout(6000),
    });
    const json = await res.json();
    if (json.success && json.data) {
      const data = json.data;
      // Detect private/local IP ranges
      const ip = data.ip || "";
      const isLocal = ip.startsWith("10.") || ip.startsWith("192.168.") || ip.startsWith("172.") || ip === "::1" || ip === "127.0.0.1";
      return { ...data, isLocal };
    }
    return null;
  } catch (err) {
    console.warn("Location detection error:", err.message);
    return { isLocal: true, city: "Surat", postal: "394107" }; // Safe default for dev
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const [isLoginOpen, setIsLoginOpen]     = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [locationAnchorRect, setLocationAnchorRect] = useState(null); // { top, left, width, height }
  const [user, setUser]                   = useState(null);
  const [selectedArea, setSelectedArea]   = useState(null);
  const [locationInfo, setLocationInfo]   = useState(null); // { city, region, country, postal, ... }

  useEffect(() => {
    // 1. Restore user and area from local storage
    const savedUser = localStorage.getItem("user");
    const savedArea = localStorage.getItem("selectedArea");
    
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); }
      catch (e) { localStorage.removeItem("user"); }
    }

    if (savedArea) {
      try { setSelectedArea(JSON.parse(savedArea)); }
      catch (e) { localStorage.removeItem("selectedArea"); }
    }

    // 2. Restore previously detected city from sessionStorage (avoids repeat API call)
    const cachedLocation = sessionStorage.getItem("ipLocation");
    if (cachedLocation) {
      try { setLocationInfo(JSON.parse(cachedLocation)); return; }
      catch (e) { sessionStorage.removeItem("ipLocation"); }
    }

    // 3. Fresh detection via ipbot proxy
    getIPLocation().then((info) => {
      // Ignore invalid results like "-" (from local networks)
      if (info && info.city && info.city !== "-") {
        setLocationInfo(info);
        sessionStorage.setItem("ipLocation", JSON.stringify(info));
      }
    });
  }, []);

  // 4. Auto-open selector only if no area saved AND not already dismissed
  useEffect(() => {
    const popupSeen = localStorage.getItem("locationPopupSeen");
    
    if (!selectedArea && !popupSeen) {
      const timer = setTimeout(() => {
        setIsLocationOpen(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [selectedArea]);

  const openLogin  = () => setIsLoginOpen(true);
  const closeLogin = () => setIsLoginOpen(false);

  const openLocation = (rect = null) => {
    if (rect) setLocationAnchorRect(rect);
    setIsLocationOpen(true);
  };
  const closeLocation = () => {
    setIsLocationOpen(false);
    setLocationAnchorRect(null);
    localStorage.setItem("locationPopupSeen", "true");
  };

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setIsLoginOpen(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const selectArea = (area) => {
    setSelectedArea(area);
    localStorage.setItem("selectedArea", JSON.stringify(area));
    setIsLocationOpen(false);
  };

  const saveAddress = async (enrichData) => {
    if (!user) {
      // For guest users, just select it locally
      selectArea(enrichData);
      return { success: true };
    }

    const isEditing = !!enrichData.id;
    const url = isEditing ? `/api/customers/addresses/${enrichData.id}` : "/api/customers/addresses";
    
    try {
      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          ...enrichData
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (!isEditing) selectArea(data.address);
        return { success: true, address: data.address };
      }
      throw new Error(data.message || data.error || "Failed to save address");
    } catch (error) {
      console.error("Save Address Error:", error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{
      isLoginOpen, openLogin, closeLogin,
      isLocationOpen, openLocation, closeLocation, locationAnchorRect,
      user, login, logout,
      selectedArea, selectArea, saveAddress,
      locationInfo, // { city, region, country, postal, ip, country_code }
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
