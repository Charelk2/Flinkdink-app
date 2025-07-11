import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { getProgress } from '../../utils/storage';
import { syncProgressToCloud } from '../../utils/firebaseSync';
import { useAuth } from '../context/AuthContext'; // ⬅️ use this instead of getAuth()

export const useOnlineSync = (childId: string) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async state => {
      if (state.isConnected && user && !loading) {
        console.log('🟢 Online — syncing progress for', childId);
        const local = await getProgress(childId);
        await syncProgressToCloud(user.uid, childId, local);
      }
    });

    return () => unsubscribe();
  }, [childId, user, loading]);
};
