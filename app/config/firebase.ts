// app/src/config/firebase.ts

import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  type Auth,
} from 'firebase/auth/react-native';
import { getFirestore } from 'firebase/firestore';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: 'AIzaSyA9qMC_ubnC7huub1oCByDXHyjuQEqQWAg',
  authDomain: 'flinkdink-19fb2.firebaseapp.com',
  projectId: 'flinkdink-19fb2',
  storageBucket: 'flinkdink-19fb2.appspot.com',
  messagingSenderId: '164154739308',
  appId: '1:164154739308:web:919b89b16e8dd412246649',
  measurementId: 'G-VL2VZD15ME',
};

// Initialize the Firebase App
export const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Auth with persistent storage
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  console.log('✅ Firebase Auth initialized with AsyncStorage persistence');
} catch {
  auth = getAuth(app);
  console.log('📦 Falling back to in-memory auth persistence');
}

// Initialize Firestore
export const db = getFirestore(app);

// Export Auth instance
export { auth };
