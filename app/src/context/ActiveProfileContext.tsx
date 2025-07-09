import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChildProfile } from '../models/types';
import { getProfiles } from '../../utils/storage';
import { useAuth } from './AuthContext'; // Import your hook

// Define the shape of the context data
type ActiveProfileContextType = {
  activeProfile: ChildProfile | null;
  setActiveProfile: (profile: ChildProfile | null) => void;
  loadingProfile: boolean; // Add a loading state for better UI handling
};

// Create the context with default values
export const ActiveProfileContext = createContext<ActiveProfileContextType>({
  activeProfile: null,
  setActiveProfile: () => {},
  loadingProfile: true,
});

// Custom hook for easy access to the context
export const useActiveProfile = () => useContext(ActiveProfileContext);

// The provider component that will wrap your app
export const ActiveProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth(); // Get the current user from AuthContext
  const [activeProfile, setActiveProfile] = useState<ChildProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // This effect now correctly depends on the 'user' object
  useEffect(() => {
    const loadProfile = async () => {
      // ONLY try to load a profile if a user is logged IN
      if (user) {
        setLoadingProfile(true);
        try {
          const id = await AsyncStorage.getItem('activeProfileId');
          if (id) {
            const allProfiles = await getProfiles();
            const foundProfile = allProfiles.find((p) => p.id === id);
            setActiveProfile(foundProfile || null);
          } else {
            setActiveProfile(null);
          }
        } catch (error) {
          console.error("Failed to load active profile:", error);
          setActiveProfile(null);
        } finally {
          setLoadingProfile(false);
        }
      } else {
        // If there's NO user, clear the profile and stop loading
        setActiveProfile(null);
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user]); // Re-run this logic whenever the user signs in or out

  const value = { activeProfile, setActiveProfile, loadingProfile };

  return (
    <ActiveProfileContext.Provider value={value}>
      {children}
    </ActiveProfileContext.Provider>
  );
};