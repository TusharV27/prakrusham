"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchWishlist = useCallback(async (userId = null) => {
    try {
      const url = userId ? `/api/wishlist?userId=${userId}` : "/api/wishlist";
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data?.items) {
        setWishlistItems(data.data.items.map(item => item.productId));
      } else {
        if (!userId) {
          const saved = localStorage.getItem("prakrushi-wishlist");
          if (saved) {
            try { setWishlistItems(JSON.parse(saved)); }
            catch (e) { console.error("Failed to parse wishlist", e); }
          }
        }
      }
    } catch (error) {
      console.error("Wishlist hydration failed:", error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Sync on mount or user change
  useEffect(() => {
    if (user?.id) {
      const syncWithServer = async () => {
        try {
          // Merge guest wishlist into user account
          await fetch("/api/wishlist", {
            method: "POST",
            body: JSON.stringify({ action: "MERGE", userId: user.id })
          });
          fetchWishlist(user.id);
        } catch (e) { console.error("Wishlist sync error:", e); fetchWishlist(user.id); }
      };
      syncWithServer();
    } else {
      fetchWishlist();
    }
  }, [user?.id, fetchWishlist]);

  // Persist to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("prakrushi-wishlist", JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isInitialized]);

  const toggleWishlist = async (productId) => {
    if (!productId) return;
    
    const isInWishlist = wishlistItems.includes(productId);
    
    // Optimistic UI update
    setWishlistItems(prev => 
      isInWishlist 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );

    // Backend sync
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        body: JSON.stringify({ productId, userId: user?.id })
      });
      const data = await res.json();
      
      // Update with server state to be sure
      if (data.success && data.data?.items) {
        setWishlistItems(data.data.items.map(item => item.productId));
      } else if (data.success && Array.isArray(data.data)) {
        // Fallback for any other endpoints returning simple arrays
        setWishlistItems(data.data);
      }
    } catch (e) {
      console.error("Failed to sync wishlist", e);
    }
  };

  const isFavorited = (productId) => wishlistItems.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isFavorited }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
