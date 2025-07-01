// ActiveProfileContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChildProfile } from '../models/types';
import { getProfiles } from '../../utils/storage';

type ActiveProfileContextType = {
  activeProfile: ChildProfile | null;
  setActiveProfile: (profile: ChildProfile | null) => void;
};

const ActiveProfileContext = createContext<ActiveProfileContextType>({
  activeProfile: null,
  setActiveProfile: () => {},
});

export const useActiveProfile = () => useContext(ActiveProfileContext);

export const ActiveProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeProfile, setActiveProfile] = useState<ChildProfile | null>(null);

  useEffect(() => {
    const load = async () => {
      const id = await AsyncStorage.getItem('activeProfileId');
      if (id) {
        const all = await getProfiles();
        const found = all.find((p) => p.id === id);
        if (found) {
          setActiveProfile(found);
        }
      }
    };
    load();
  }, []);

  return (
    <ActiveProfileContext.Provider value={{ activeProfile, setActiveProfile }}>
      {children}
    </ActiveProfileContext.Provider>
  );
};
