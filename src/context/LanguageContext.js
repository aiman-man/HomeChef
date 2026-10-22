import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../locales/en.json';
import ms from '../locales/ms.json';

const translations = { en, ms };
const LANG_KEY = '@app_language';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState('en');

  useEffect(() => {
    const loadLang = async () => {
      try {
        const savedLang = await AsyncStorage.getItem(LANG_KEY);
        if (savedLang && (savedLang === 'en' || savedLang === 'ms')) {
          setLangState(savedLang);
        }
      } catch (error) {
        console.error('Gagal memuatkan bahasa daripada storage:', error);
      }
    };
    loadLang();
  }, []);

  const setLang = async (newLang) => {
    try {
      setLangState(newLang);
      await AsyncStorage.setItem(LANG_KEY, newLang);
    } catch (error) {
      console.error('Gagal menyimpan bahasa ke storage:', error);
    }
  };

  const t = (key) => {
    if (translations[lang] && translations[lang][key]) {
      return translations[lang][key];
    }
    if (translations['en'] && translations['en'][key]) {
      return translations['en'][key];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);