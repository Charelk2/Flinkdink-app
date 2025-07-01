import AsyncStorage from '@react-native-async-storage/async-storage'; // for fallback, optional
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

const getUserId = () => auth.currentUser?.uid;
const today = () => new Date().toISOString().slice(0, 10); // YYYY-MM-DD
const completedWeeksCache = new Map<string, number[]>();

export async function markWeekCompleted(profileId: string, week: number) {
  const userId = getUserId();
  if (!userId) return;

  const ref = doc(db, 'progress', userId, 'children', profileId, 'weeks', String(week));
  await setDoc(ref, {
    completed: true,
    week,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function getCompletedWeeks(profileId: string): Promise<number[]> {
    const cached = completedWeeksCache.get(profileId);
    if (cached) return cached;
  
    const userId = getUserId();
    if (!userId) return [];
  
    const weeks: number[] = [];
    for (let i = 1; i <= 40; i++) {
      const ref = doc(db, 'progress', userId, 'children', profileId, 'weeks', String(i));
      const snap = await getDoc(ref);
      if (snap.exists() && snap.data().completed) {
        weeks.push(i);
      }
    }
  
    completedWeeksCache.set(profileId, weeks);
    return weeks;
  }
  

export async function isWeekCompleted(profileId: string, week: number): Promise<boolean> {
  const userId = getUserId();
  if (!userId) return false;

  const ref = doc(db, 'progress', userId, 'children', profileId, 'weeks', String(week));
  const snap = await getDoc(ref);
  return snap.exists() && snap.data().completed === true;
}

export async function getTodaySessionCount(profileId: string): Promise<number> {
  const userId = getUserId();
  if (!userId) return 0;

  const ref = doc(db, 'progress', userId, 'children', profileId, 'days', today());
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().count || 0 : 0;
}

export async function incrementTodaySessionCount(profileId: string): Promise<void> {
  const userId = getUserId();
  if (!userId) return;

  const ref = doc(db, 'progress', userId, 'children', profileId, 'days', today());
  const snap = await getDoc(ref);
  const currentCount = snap.exists() ? snap.data().count || 0 : 0;

  await setDoc(ref, {
    count: currentCount + 1,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
