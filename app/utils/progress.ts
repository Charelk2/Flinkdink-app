// app/utils/progress.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { auth } from '../config/firebase'; // ✅ use your exported instance

const getKey = (profileId: string) => `progress-${profileId}`;
const sessionKey = (profileId: string) => `sessions-${profileId}`;
const pendingKey = (profileId: string) => `pending-${profileId}`;
const CURRENT_WEEK_KEY = (profileId: string) => `current-week-${profileId}`;

export async function setLastViewedWeek(profileId: string, week: number) {
  console.log('[progress] setLastViewedWeek', { profileId, week });
  await AsyncStorage.setItem(CURRENT_WEEK_KEY(profileId), String(week));
}

export async function getLastViewedWeek(profileId: string): Promise<number> {
  const raw = await AsyncStorage.getItem(CURRENT_WEEK_KEY(profileId));
  const parsed = raw ? parseInt(raw, 10) : null;
  const week = parsed && !isNaN(parsed) ? parsed : 1;
  console.log('[progress] getLastViewedWeek', { profileId, week });
  return week;
}


// Check if online for Firestore sync
export async function isOnline(): Promise<boolean> {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return navigator.onLine;
    }
    return true; // fallback for native
  }  

// Mark a week as completed (offline + Firestore)
export async function markWeekCompleted(profileId: string, week: number) {
  const key = getKey(profileId);
  const raw = await AsyncStorage.getItem(key);
  const data = raw ? JSON.parse(raw) : { completed: [] };

  if (!data.completed.includes(week)) {
    data.completed.push(week);
    await AsyncStorage.setItem(key, JSON.stringify(data));
  }

  const online = await isOnline();
  if (online) {
    await uploadWeek(profileId, week);
  } else {
    await addPending(profileId, week);
  }
}

// Upload completed week to Firestore
async function uploadWeek(profileId: string, week: number) {
    const uid = auth.currentUser?.uid;
  if (!uid) return;

  const ref = doc(db, `users/${uid}/progress`, `${profileId}_${week}`);
  await setDoc(ref, {
    profileId,
    week,
    completed: true,
    updatedAt: Timestamp.now(),
  });
}

// Add week to offline pending list
async function addPending(profileId: string, week: number) {
  const raw = await AsyncStorage.getItem(pendingKey(profileId));
  const pending: number[] = raw ? JSON.parse(raw) : [];
  if (!pending.includes(week)) {
    pending.push(week);
    await AsyncStorage.setItem(pendingKey(profileId), JSON.stringify(pending));
  }
}

// Sync any pending offline completions
export async function syncPendingProgress(profileId: string) {
    const uid = auth.currentUser?.uid;
  if (!uid) return;

  const raw = await AsyncStorage.getItem(pendingKey(profileId));
  const pending: number[] = raw ? JSON.parse(raw) : [];

  for (const week of pending) {
    await uploadWeek(profileId, week);
  }

  await AsyncStorage.removeItem(pendingKey(profileId));
}

// Fetch completed weeks from Firestore and cache locally
export async function getCompletedWeeks(profileId: string): Promise<number[]> {
    const uid = auth.currentUser?.uid;
  if (!uid) return [];

  const snapshot = await getDocs(
    query(collection(db, `users/${uid}/progress`), where('profileId', '==', profileId))
  );

  const weeks: number[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.completed && typeof data.week === 'number') {
      weeks.push(data.week);
    }
  });

  await AsyncStorage.setItem(getKey(profileId), JSON.stringify({ completed: weeks }));
  return weeks;
}

// Check if a week is marked completed
export async function isWeekCompleted(profileId: string, week: number): Promise<boolean> {
  const completed = await getCompletedWeeks(profileId);
  return completed.includes(week);
}

// Get today's session count for a given week
export async function getTodaySessionCount(profileId: string, week: number): Promise<number> {
  const raw = await AsyncStorage.getItem(sessionKey(profileId));
  const data = raw ? JSON.parse(raw) : {};
  const today = new Date().toISOString().slice(0, 10);

  if (typeof data[today] === 'number') {
    // Legacy format fallback
    return data[today];
  }

  return data?.[today]?.[week] || 0;
}

// Increment today's session count for a given week
export async function incrementTodaySessionCount(profileId: string, week: number): Promise<void> {
  const raw = await AsyncStorage.getItem(sessionKey(profileId));
  const data = raw ? JSON.parse(raw) : {};
  const today = new Date().toISOString().slice(0, 10);
  console.log('[🧠] UID:', auth.currentUser?.uid);
  console.log('[🧠] Profile ID:', profileId);


  // Legacy fix
  if (typeof data[today] === 'number') {
    const oldCount = data[today];
    data[today] = { 0: oldCount }; // migrate to week 0
  }

  if (!data[today]) data[today] = {};
  data[today][week] = (data[today][week] || 0) + 1;

  await AsyncStorage.setItem(sessionKey(profileId), JSON.stringify(data));

  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const ref = doc(db, `users/${uid}/sessions`, `${profileId}_${today}`);
  await setDoc(ref, {
    profileId,
    date: today,
    week,
    count: data[today][week],
    updatedAt: Timestamp.now(),
  });
}

// Reset today’s session count for a given week
export async function resetTodaySessionCount(profileId: string, week: number): Promise<void> {
  const raw = await AsyncStorage.getItem(sessionKey(profileId));
  const data = raw ? JSON.parse(raw) : {};
  const today = new Date().toISOString().slice(0, 10);

  if (typeof data[today] === 'number') {
    delete data[today]; // legacy clear
  } else if (data[today]?.[week]) {
    delete data[today][week];
    if (Object.keys(data[today]).length === 0) {
      delete data[today];
    }
  }

  await AsyncStorage.setItem(sessionKey(profileId), JSON.stringify(data));
}

// Get all daily session counts for a given week
export async function getWeekSessionData(
  profileId: string,
  week: number
): Promise<{ [date: string]: number }> {
  const raw = await AsyncStorage.getItem(sessionKey(profileId));
  const data = raw ? JSON.parse(raw) : {};
  const result: { [date: string]: number } = {};

  for (const date in data) {
    const entry = data[date];
    if (typeof entry === 'object' && week in entry) {
      result[date] = entry[week];
    }
  }

  return result;
}

// Determine if a week is fully complete (3 sessions × 7 days)
export function isWeekFullyComplete(weekData: { [date: string]: number }): boolean {
  const qualifiedDays = Object.values(weekData).filter((count) => count >= 3);
  return qualifiedDays.length >= 7;
}

// Count how many days have 3+ sessions in this week
export async function getCompletedDaysThisWeek(profileId: string, week: number): Promise<number> {
  const localData = await getWeekSessionData(profileId, week);
  const mergedData: Record<string, number> = { ...localData };
  console.log('[📊] Fetching completed days for week', week, 'for profile:', profileId);


  // Firestore merge
  try {
    const uid = auth.currentUser?.uid;
    if (uid) {
      const q = query(
        collection(db, 'users', uid, 'sessions'),
        where('profileId', '==', profileId),
        where('week', '==', week)
      );
      const snapshot = await getDocs(q);
      snapshot.forEach((doc) => {
        const { date, count } = doc.data();
        if (typeof date === 'string' && typeof count === 'number') {
          mergedData[date] = Math.max(mergedData[date] || 0, count);
        }
      });
    }
  } catch (e) {
    console.warn('⚠️ Failed to sync session data from Firestore:', e);
  }

  return Object.values(mergedData).filter((c) => c >= 3).length;
}
