// firebase.ts
import { initializeApp, FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  getAuth,
  Auth,
} from 'firebase/auth/react-native'; // ✅ Must import from here for getReactNativePersistence
import { getFirestore } from 'firebase/firestore';
import { getReactNativePersistence } from 'firebase/auth/react-native'; // ✅ CORRECT path
import AsyncStorage from '@react-native-async-storage/async-storage';


const firebaseConfig = {
  apiKey: 'AIzaSyA9qMC_ubnC7huub1oCByDXHyjuQEqQWAg',
  authDomain: 'flinkdink-19fb2.firebaseapp.com',
  projectId: 'flinkdink-19fb2',
  storageBucket: 'flinkdink-19fb2.appspot.com',
  messagingSenderId: '164154739308',
  appId: '1:164154739308:web:919b89b16e8dd412246649',
  measurementId: 'G-VL2VZD15ME',
};

const app: FirebaseApp = initializeApp(firebaseConfig);

let auth: Auth;

try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
  console.log('✅ Firebase Auth initialized with AsyncStorage persistence');
} catch (err) {
  auth = getAuth(app); // fallback
  console.log('📦 Falling back to in-memory auth persistence');
}

export { auth };
export const db = getFirestore(app);

