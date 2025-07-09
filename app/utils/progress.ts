// app/utils/progress.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { auth } from '../config/firebase';

// Keys
const sessionKey = (profileId: string) => `sessions-${profileId}`; // full dict { [date]: { [week]: count } }
const pendingKey = (profileId: string) => `pending-sessions-${profileId}`;

// --- 1. Increment today's session count, always local-first, queue if offline ---
export async function incrementTodaySessionCount(profileId: string, week: number) {
  const today = new Date().toISOString().slice(0, 10);

  // 1. Read local sessions object
  const raw = await AsyncStorage.getItem(sessionKey(profileId));
  let data = raw ? JSON.parse(raw) : {};
  if (!data[today]) data[today] = {};
  data[today][week] = (data[today][week] || 0) + 1;

  // 2. Save locally
  await AsyncStorage.setItem(sessionKey(profileId), JSON.stringify(data));

  // 3. If online, upload now
  if (await isOnline()) {
    await uploadSessionToFirestore(profileId, week, today, data[today][week]);
  } else {
    // 4. If offline, queue for later sync
    await queuePendingSession(profileId, week, today, data[today][week]);
  }
}

// --- 2. Upload a session to Firestore (write count, not increment) ---
async function uploadSessionToFirestore(profileId: string, week: number, date: string, count: number) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const docId = `${profileId}_${week}_${date}`;
  const ref = doc(db, `users/${uid}/sessions`, docId);
  await setDoc(ref, {
    profileId,
    week,
    date,
    count,
    updatedAt: Timestamp.now(),
  });
}

// --- 3. Queue a pending session increment (for offline sync) ---
async function queuePendingSession(profileId: string, week: number, date: string, count: number) {
  const raw = await AsyncStorage.getItem(pendingKey(profileId));
  let pending: Array<{ week: number; date: string; count: number }> = raw ? JSON.parse(raw) : [];
  // Remove existing for same week+date to avoid duplicates, keep only the latest
  pending = pending.filter((p) => !(p.week === week && p.date === date));
  pending.push({ week, date, count });
  await AsyncStorage.setItem(pendingKey(profileId), JSON.stringify(pending));
}

// --- 4. Sync all pending session increments to Firestore ---
export async function syncPendingProgress(profileId: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const raw = await AsyncStorage.getItem(pendingKey(profileId));
  const pending: Array<{ week: number; date: string; count: number }> = raw ? JSON.parse(raw) : [];

  for (const p of pending) {
    await uploadSessionToFirestore(profileId, p.week, p.date, p.count);
  }
  await AsyncStorage.removeItem(pendingKey(profileId));
}

// --- 5. Listen for all sessions (server), merge with local for display ---
export function subscribeToProfileSessions(
  profileId: string,
  onUpdate: (sessions: { [week: number]: { [date: string]: number } }) => void
) {
  const uid = auth.currentUser?.uid;
  if (!uid || !profileId) return () => {};

  const q = query(
    collection(db, 'users', uid, 'sessions'),
    where('profileId', '==', profileId)
  );

  const unsub = onSnapshot(q, async (snapshot) => {
    const remote: { [week: number]: { [date: string]: number } } = {};
    snapshot.forEach(doc => {
      const { week, date, count } = doc.data();
      if (typeof week === 'number' && typeof date === 'string' && typeof count === 'number') {
        if (!remote[week]) remote[week] = {};
        remote[week][date] = count;
      }
    });

    // Merge local sessions (take max count per day/week)
    const raw = await AsyncStorage.getItem(sessionKey(profileId));
    const local: { [date: string]: { [week: number]: number } } = raw ? JSON.parse(raw) : {};

    const merged: { [week: number]: { [date: string]: number } } = { ...remote };
    for (const date in local) {
      for (const w in local[date]) {
        const week = parseInt(w, 10);
        const count = local[date][week];
        if (!merged[week]) merged[week] = {};
        merged[week][date] = Math.max(count, merged[week][date] || 0);
      }
    }

    onUpdate(merged);
  });

  return unsub;
}

// --- 6. Is week fully complete? ---
export function isWeekFullyComplete(weekData: { [date: string]: number }): boolean {
  const qualifiedDays = Object.values(weekData).filter((count) => count >= 3);
  return qualifiedDays.length >= 7;
} 

/* --- Is week fully complete? (for TESTING: 3 sessions total advances week) ---
export function isWeekFullyComplete(weekData: { [date: string]: number }): boolean {
  // TESTING ONLY: Complete after 3 sessions total
  const totalSessions = Object.values(weekData).reduce((sum, count) => sum + count, 0);
  return totalSessions >= 3;
}*/

// --- 7. Util: Check online status ---
export async function isOnline(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine;
  }
  return true; // native always true
}

// --- Minimal: Get today's session count for a given week (offline-first, uses AsyncStorage) ---
export async function getTodaySessionCount(profileId: string, week: number): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const raw = await AsyncStorage.getItem(`sessions-${profileId}`);
  const data = raw ? JSON.parse(raw) : {};
  return data?.[today]?.[week] || 0;
}

// --- Minimal: Mark week as completed (can be used for legacy logic/UI) ---
export async function markWeekCompleted(profileId: string, week: number) {
  // Example logic: set completed weeks in AsyncStorage; expand as needed for your use case.
  const key = `progress-${profileId}`;
  const raw = await AsyncStorage.getItem(key);
  const data = raw ? JSON.parse(raw) : { completed: [] };
  if (!data.completed.includes(week)) {
    data.completed.push(week);
    await AsyncStorage.setItem(key, JSON.stringify(data));
  }
}

// --- Minimal: Set last viewed week (for UX convenience) ---
export async function setLastViewedWeek(profileId: string, week: number) {
  await AsyncStorage.setItem(`current-week-${profileId}`, String(week));
}
