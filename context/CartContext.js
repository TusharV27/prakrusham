"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const [shippingInfo, setShippingInfo] = useState({
    pincode: "",
    selectedOption: null,
    availableOptions: []
  });

  const fetchCart = useCallback(async (userId = null) => {
    try {
      const url = userId ? `/api/cart?userId=${userId}` : "/api/cart";
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success && data.data?.items?.length > 0) {
          const formatted = data.data.items.map(item => ({
            ...item.product,
            id: item.id,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            image: item.product.images?.[0]?.url || "/placeholder.png",
            name: item.product.name 
          }));
          setCartItems(formatted);
      } else {
          // If logged in but empty on server, we don't fall back to local (to avoid ghost items)
          if (!userId) {
            const savedCart = localStorage.getItem("prakrushi-cart");
            if (savedCart) {
              const parsed = JSON.parse(savedCart);
              const normalized = Array.isArray(parsed)
                ? parsed
                    .map((item) => {
                      if (item == null || typeof item !== "object") return null;
                      const productId =
                        // Prefer slug for guest carts so it survives DB restores/reseeds
                        item.slug ||
                        item.productId ||
                        item.product?.slug ||
                        item.product?.id ||
                        item.id;
                      if (!productId) return null;
                      return { ...item, productId };
                    })
                    .filter(Boolean)
                : [];
              setCartItems(normalized);
            }
          } else {
            setCartItems([]);
          }
      }
    } catch (error) {
      console.error("Cart hydration failed:", error);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Initial load or user change
  useEffect(() => {
    // Re-load shipping from localStorage
    const savedShipping = localStorage.getItem("prakrushi-shipping");
    if (savedShipping) setShippingInfo(JSON.parse(savedShipping));

    if (user?.id) {
      // If user just logged in, trigger merge
      const syncWithServer = async () => {
        try {
          // Send merge request to combine guest session with account
          await fetch("/api/cart", {
            method: "POST",
            body: JSON.stringify({ action: "MERGE", userId: user.id })
          });
          fetchCart(user.id);
        } catch (e) { console.error("Sync error:", e); fetchCart(user.id); }
      };
      syncWithServer();
    } else {
      fetchCart();
    }
  }, [user?.id, fetchCart]);

  // Persist cart and shipping to localStorage
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("prakrushi-cart", JSON.stringify(cartItems));
      localStorage.setItem("prakrushi-shipping", JSON.stringify(shippingInfo));
    }
  }, [cartItems, shippingInfo, isInitialized]);

  const addToCart = async (product) => {
    // ... same as before
    setCartItems((prevItems) => {
      const incomingSlug = product?.slug;
      const incomingProductRef = product.productId || product.id;
      const existingItem = prevItems.find((item) => 
        item.variantId === product.variantId &&
        (
          (incomingSlug && item.slug === incomingSlug) ||
          item.productId === incomingProductRef
        )
      );
      const addQuanity = product.quantity || 1;
      if (existingItem) {
        return prevItems.map((item) =>
          item.id === existingItem.id ? { ...item, quantity: item.quantity + addQuanity } : item
        );
      }
      const tempId = `temp-${Date.now()}`;
      return [
        ...prevItems,
        {
          ...product,
          id: tempId,
          productId: incomingSlug || incomingProductRef,
          quantity: addQuanity
        }
      ];
    });

    openDrawer();

    try {
       await fetch("/api/cart", {
         method: "POST",
         body: JSON.stringify({
           productId: product.productId || product.id,
           variantId: product.variantId,
           quantity: product.quantity || 1,
           action: "ADD",
           userId: user?.id
         })
       });
    } catch (e) {
      console.error("Failed to sync cart to backend", e);
    }
  };

  const removeFromCart = async (cartItemId) => {
    const itemToRemove = cartItems.find(item => item.id === cartItemId);
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== cartItemId));

    if (itemToRemove) {
       try {
         await fetch("/api/cart", {
           method: "POST",
           body: JSON.stringify({
             productId: itemToRemove.productId || itemToRemove.id,
             variantId: itemToRemove.variantId,
             action: "REMOVE",
             userId: user?.id
           })
         });
       } catch (e) {
          console.error("Failed to sync removal", e);
       }
    }
  };

  const updateQuantity = async (cartItemId, delta) => {
    let newQty = 1;
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === cartItemId) {
          newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );

    const item = cartItems.find(i => i.id === cartItemId);
    if (item) {
      try {
        await fetch("/api/cart", {
          method: "POST",
          body: JSON.stringify({
            productId: item.productId || item.id,
            variantId: item.variantId,
            quantity: newQty,
            action: "SET",
            userId: user?.id
          })
        });
      } catch (e) {
        console.error("Failed to sync quantity", e);
      }
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    setShippingInfo({ pincode: "", selectedOption: null, availableOptions: [] });
    try {
      const url = user?.id ? `/api/cart?userId=${user.id}` : "/api/cart";
      await fetch(url, { method: "DELETE" });
    } catch (e) {
      console.error("Failed to clear backend cart", e);
    }
  };

  return (
    <CartContext.Provider
      value={{
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        shippingInfo,
        setShippingInfo
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
