// app/src/context/LanguageContext.tsx

import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

interface LanguageContextType {
  locale: string;
  setLocale: (locale: string) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'af', // Default
  setLocale: () => console.log('Language provider is not ready'),
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [locale, setLocaleState] = useState('af');
  const [loading, setLoading] = useState(true); // <--- ADDED

  useEffect(() => {
    const loadLocale = async () => {
      try {
        const savedLocale = await AsyncStorage.getItem('user-language');
        if (savedLocale) {
          await i18n.changeLanguage(savedLocale);
          setLocaleState(savedLocale);
        } else {
          setLocaleState(i18n.language); // fallback
        }
      } catch (error) {
        console.error('Failed to load language from storage', error);
      } finally {
        setLoading(false); // <--- FINISH LOADING
      }
    };

    loadLocale();
  }, []);

  const setLocale = async (newLocale: string) => {
    try {
      await i18n.changeLanguage(newLocale);
      await AsyncStorage.setItem('user-language', newLocale);
      setLocaleState(newLocale);
    } catch (error) {
      console.error('Failed to save language to storage', error);
    }
  };

  if (loading) {
    // You can use ActivityIndicator if you prefer
    return null;
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
