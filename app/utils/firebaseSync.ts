// utils/firebaseSync.ts
import {
    doc,
    setDoc,
    getDocs,
    collection,
    CollectionReference,
  } from '@firebase/firestore';
  import { db } from '../config/firebase';
  import { ChildProfile } from '../src/models/types';
  
  export const uploadChildProfile = async (userId: string, profile: ChildProfile) => {
    const profileRef = doc(db, 'users', userId, 'children', profile.id);
    await setDoc(profileRef, profile);
  };
  
  export const fetchAllChildProfiles = async (userId: string): Promise<ChildProfile[]> => {
    const childrenRef = collection(db, 'users', userId, 'children') as CollectionReference;
    const snapshot = await getDocs(childrenRef);
    return snapshot.docs.map((doc) => doc.data() as ChildProfile);
  };
  