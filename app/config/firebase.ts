import { Platform } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  getAuth,
  initializeAuth
} from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
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

const app = initializeApp(firebaseConfig);

const auth =
  Platform.OS === 'web'
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage),
      });

const db = getFirestore(app);

export { app, auth, db };
