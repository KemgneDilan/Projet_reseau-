"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/translations';

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('fr'); // Default language

  useEffect(() => {
    // Load language from localStorage on mount
    const savedLang = localStorage.getItem('hrs_lang');
    if (savedLang && ['fr', 'en'].includes(savedLang)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLang(savedLang);
    }
  }, []);

  const changeLanguage = (newLang) => {
    if (['fr', 'en'].includes(newLang)) {
      setLang(newLang);
      localStorage.setItem('hrs_lang', newLang);
    }
  };

  const t = (key, params = {}) => {
    let str = translations[lang]?.[key] || translations['fr']?.[key] || key;
    
    // Replace parameters e.g., {name}
    Object.keys(params).forEach(paramKey => {
      str = str.replace(new RegExp(`{${paramKey}}`, 'g'), params[paramKey]);
    });
    
    return str;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
