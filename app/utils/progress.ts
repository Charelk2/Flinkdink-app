// app/utils/progress.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const getKey = (profileId: string) => `progress-${profileId}`;
const sessionKey = (profileId: string) => `sessions-${profileId}`;

export async function markWeekCompleted(profileId: string, week: number) {
  const key = getKey(profileId);
  const raw = await AsyncStorage.getItem(key);
  const data = raw ? JSON.parse(raw) : { completed: [] };

  if (!data.completed.includes(week)) {
    data.completed.push(week);
    await AsyncStorage.setItem(key, JSON.stringify(data));
  }
}

export async function getCompletedWeeks(profileId: string): Promise<number[]> {
  const raw = await AsyncStorage.getItem(getKey(profileId));
  return raw ? JSON.parse(raw).completed : [];
}

export async function isWeekCompleted(profileId: string, week: number): Promise<boolean> {
  const completed = await getCompletedWeeks(profileId);
  return completed.includes(week);
}

export async function getTodaySessionCount(profileId: string): Promise<number> {
  const raw = await AsyncStorage.getItem(sessionKey(profileId));
  const data = raw ? JSON.parse(raw) : {};
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return data[today] || 0;
}

export async function incrementTodaySessionCount(profileId: string): Promise<void> {
  const raw = await AsyncStorage.getItem(sessionKey(profileId));
  const data = raw ? JSON.parse(raw) : {};
  const today = new Date().toISOString().slice(0, 10);
  data[today] = (data[today] || 0) + 1;
  await AsyncStorage.setItem(sessionKey(profileId), JSON.stringify(data));
}
