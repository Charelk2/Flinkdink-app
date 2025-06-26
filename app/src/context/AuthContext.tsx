import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../../config/firebase';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let unsubscribe: () => void;

    const init = async () => {
      try {
        console.log('[AuthContext] Waiting for Firebase Auth to initialize...');
        // Wait a tick to ensure auth is ready on native
        await new Promise((resolve) => setTimeout(resolve, 0));

        unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          console.log('[AuthContext] Firebase user:', firebaseUser?.email);
          setUser(firebaseUser);
          setAuthReady(true);
        });
      } catch (err) {
        console.error('[AuthContext] Error initializing Firebase Auth:', err);
      }
    };

    init();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading: !authReady, auth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
