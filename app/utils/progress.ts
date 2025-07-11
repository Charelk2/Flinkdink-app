// app/utils/progress.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../config/firebase';
import {
  collection,
  doc,
  setDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { auth } from '../config/firebase';

// Keys for AsyncStorage
const sessionKey = (profileId: string) => `sessions-${profileId}`;
const pendingKey = (profileId: string) => `pending-sessions-${profileId}`;

// --- 1. Increment today's session count (local-first, queue if offline) ---
export async function incrementTodaySessionCount(profileId: string, week: number) {
  const today = new Date().toISOString().slice(0, 10);

  // 1a. Read local sessions
  const raw = await AsyncStorage.getItem(sessionKey(profileId));
  const data: Record<string, Record<number, number>> = raw ? JSON.parse(raw) : {};

  // 1b. Bump count for today/week
  data[today] = data[today] ?? {};
  data[today][week] = (data[today][week] || 0) + 1;

  // 2. Save locally
  await AsyncStorage.setItem(sessionKey(profileId), JSON.stringify(data));

  // 3. If online, upload immediately; otherwise queue
  if (await isOnline()) {
    await uploadSessionToFirestore(profileId, week, today, data[today][week]);
  } else {
    await queuePendingSession(profileId, week, today, data[today][week]);
  }
}

// --- 2. Firestore write (set count) ---
async function uploadSessionToFirestore(
  profileId: string,
  week: number,
  date: string,
  count: number
) {
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

// --- 3. Queue offline changes ---
async function queuePendingSession(
  profileId: string,
  week: number,
  date: string,
  count: number
) {
  const raw = await AsyncStorage.getItem(pendingKey(profileId));
  const pending: Array<{ week: number; date: string; count: number }> =
    raw ? JSON.parse(raw) : [];

  // Remove any old entry for this week+date, then push latest
  const filtered = pending.filter(p => !(p.week === week && p.date === date));
  filtered.push({ week, date, count });
  await AsyncStorage.setItem(pendingKey(profileId), JSON.stringify(filtered));
}

// --- 4. Sync all queued changes to Firestore ---
export async function syncPendingProgress(profileId: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;

  const raw = await AsyncStorage.getItem(pendingKey(profileId));
  const pending: Array<{ week: number; date: string; count: number }> =
    raw ? JSON.parse(raw) : [];

  for (const p of pending) {
    await uploadSessionToFirestore(profileId, p.week, p.date, p.count);
  }
  await AsyncStorage.removeItem(pendingKey(profileId));
}

// --- 5. Real-time listener merging Firestore + local ---
export function subscribeToProfileSessions(
  profileId: string,
  onUpdate: (sessions: Record<number, Record<string, number>>) => void
): () => void {
  const uid = auth.currentUser?.uid;
  if (!uid || !profileId) return () => {};

  const q = query(
    collection(db, 'users', uid, 'sessions'),
    where('profileId', '==', profileId)
  );

  const unsub = onSnapshot(q, async snapshot => {
    // Build remote map: week → { date: count }
    const remote: Record<number, Record<string, number>> = {};
    snapshot.forEach(doc => {
      const { week, date, count } = doc.data();
      if (typeof week === 'number' && typeof date === 'string' && typeof count === 'number') {
        remote[week] = remote[week] || {};
        remote[week][date] = count;
      }
    });

    // Merge with local (use the higher of local vs remote)
    const raw = await AsyncStorage.getItem(sessionKey(profileId));
    const local: Record<string, Record<number, number>> = raw ? JSON.parse(raw) : {};

    const merged: Record<number, Record<string, number>> = { ...remote };
    for (const date in local) {
      for (const wStr in local[date]) {
        const w = Number(wStr);
        const c = local[date][w];
        merged[w] = merged[w] || {};
        merged[w][date] = Math.max(merged[w][date] || 0, c);
      }
    }

    onUpdate(merged);
  });

  return unsub;
}

// --- 6. Completion rule: 5 days × 3 sessions = week done ---
const REQUIRED_DAYS = 5;
const SESSIONS_PER_DAY = 3;

export function isWeekFullyComplete(weekData: Record<string, number>): boolean {
  const daysWithEnough = Object.values(weekData).filter(c => c >= SESSIONS_PER_DAY).length;
  return daysWithEnough >= REQUIRED_DAYS;
}

// --- 7. Basic network check ---
export async function isOnline(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine;
  }
  return true; // assume online on native
}

// --- 8. Read today's count (offline-first) ---
export async function getTodaySessionCount(
  profileId: string,
  week: number
): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const raw = await AsyncStorage.getItem(sessionKey(profileId));
  const data: Record<string, Record<number, number>> = raw ? JSON.parse(raw) : {};
  return data[today]?.[week] || 0;
}

// --- 9. (Optional) Mark week completed in storage for legacy UIs ---
export async function markWeekCompleted(profileId: string, week: number) {
  const key = `progress-${profileId}`;
  const raw = await AsyncStorage.getItem(key);
  const info: { completed: number[] } = raw ? JSON.parse(raw) : { completed: [] };
  if (!info.completed.includes(week)) {
    info.completed.push(week);
    await AsyncStorage.setItem(key, JSON.stringify(info));
  }
}

// --- 10. (Optional) Persist last-viewed week ---
export async function setLastViewedWeek(profileId: string, week: number) {
  await AsyncStorage.setItem(`current-week-${profileId}`, `${week}`);
}
