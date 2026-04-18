"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/constants/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  // Load language from localStorage if available
  useEffect(() => {
    const savedLanguage = localStorage.getItem('prakrushi-lang');
    if (savedLanguage && ['en', 'hi', 'gu'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('prakrushi-lang', lang);
  };

  const openLanguage = () => setIsLanguageOpen(true);
  const closeLanguage = () => setIsLanguageOpen(false);

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      changeLanguage, 
      t,
      isLanguageOpen,
      openLanguage,
      closeLanguage
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
