// app/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA9qMC_ubnC7huub1oCByDXHyjuQEqQWAg',
  authDomain: 'flinkdink-19fb2.firebaseapp.com',
  projectId: 'flinkdink-19fb2',
  storageBucket: 'flinkdink-19fb2.appspot.com',
  messagingSenderId: '164154739308',
  appId: '1:164154739308:web:919b89b16e8dd412246649',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app); // ✅ MEMORY persistence only
export const db = getFirestore(app);
