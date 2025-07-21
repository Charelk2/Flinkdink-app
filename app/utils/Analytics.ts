// app/src/utils/Analytics.ts
import { getApp } from '@react-native-firebase/app';
import { getAnalytics, isSupported } from '@react-native-firebase/analytics';

let analyticsInstance: ReturnType<typeof getAnalytics> | null = null;

/** Initialize modular Firebase Analytics once */
export async function initAnalytics() {
  if (analyticsInstance) return;
  try {
    const supported = await isSupported();
    if (!supported) return;
    const app = getApp();
    analyticsInstance = getAnalytics(app);
    console.log('✅ Firebase Analytics initialized');
  } catch (err) {
    console.warn('⚠️ initAnalytics error:', err);
  }
}

/** Log Analytics event */
export function logEvent(name: string, params?: Record<string, any>) {
  if (!analyticsInstance) {
    console.warn(`Event logged before init: ${name}`);
    return;
  }
  analyticsInstance.logEvent(name, params);
}