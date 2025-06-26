import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChildProfile, ProfileProgress } from '../src/models/types';

export const getProfiles = async (): Promise<ChildProfile[]> => {
  const raw = await AsyncStorage.getItem('profiles');
  return raw ? JSON.parse(raw) : [];
};

export const saveProfiles = async (profiles: ChildProfile[]) => {
  await AsyncStorage.setItem('profiles', JSON.stringify(profiles));
};

export const getProgress = async (childId: string): Promise<ProfileProgress> => {
  const raw = await AsyncStorage.getItem(`progress-${childId}`);
  return raw ? JSON.parse(raw) : {};
};

export const saveProgress = async (childId: string, progress: ProfileProgress) => {
  await AsyncStorage.setItem(`progress-${childId}`, JSON.stringify(progress));
};
