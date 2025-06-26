import { browserLocalPersistence, setPersistence } from 'firebase/auth';
import { auth } from './firebase';

if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.warn('[Firebase Persistence] Error setting persistence:', err);
  });
}
