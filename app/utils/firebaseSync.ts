import {
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  collection,
  CollectionReference,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ChildProfile } from '../src/models/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfiles, saveProfiles } from './storage'; // You already use these elsewhere

const CHILDREN_KEY = 'childProfiles';

export const uploadChildProfile = async (userId: string, profile: ChildProfile) => {
  const profileRef = doc(db, 'users', userId, 'children', profile.id);
  await setDoc(profileRef, profile);
};

export const fetchAllChildProfiles = async (userId: string): Promise<ChildProfile[]> => {
  const childrenRef = collection(db, 'users', userId, 'children') as CollectionReference;
  const snapshot = await getDocs(childrenRef);
  return snapshot.docs.map((doc) => doc.data() as ChildProfile);
};

export const deleteChildProfile = async (userId: string, profileId: string) => {
  // 1. Delete from Firestore
  const profileRef = doc(db, 'users', userId, 'children', profileId);
  await deleteDoc(profileRef);

  // 2. Delete from AsyncStorage
  const current = await getProfiles();
  const updated = current.filter((p) => p.id !== profileId);
  await saveProfiles(updated);

  // 3. Remove activeProfileId if it matches
  const activeId = await AsyncStorage.getItem('activeProfileId');
  if (activeId === profileId) {
    await AsyncStorage.removeItem('activeProfileId');
  }
};
