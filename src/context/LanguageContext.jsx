// src/context/LanguageContext.jsx
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';

// Create and export the context
export const LanguageContext = createContext({}); // ADDED export

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(
    localStorage.getItem('language') || 'en'
  );
  const [direction, setDirection] = useState('ltr');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
      setLanguage(savedLanguage);
      setDirection(savedLanguage === 'ar' ? 'rtl' : 'ltr');
    }
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [language, direction, i18n]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    i18n.changeLanguage(lang);
    setDirection(lang === 'ar' ? 'rtl' : 'ltr');
  };

  const value = {
    language,
    direction,
    changeLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};