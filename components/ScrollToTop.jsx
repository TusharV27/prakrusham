"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Using window.scrollY as pageYOffset is deprecated in some browsers
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          /* CHANGES MADE HERE:
             - bottom-32: Moves it significantly higher on Mobile/Tablet
             - md:bottom-10: Keeps it at your original position for Laptop/Desktop
          */
          className="fixed bottom-25 right-5 z-[50] flex h-12 w-12 items-center justify-center rounded-full bg-[#14532d] text-white shadow-2xl md:bottom-10 md:right-10 md:h-12 md:w-12 border border-white/10"
          aria-label="Back to top"
        >
          <ChevronUp className="h-6 w-6 stroke-[3px]" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}