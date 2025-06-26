import NetInfo from '@react-native-community/netinfo';
import { useEffect } from 'react';
import { getProgress } from '../../utils/storage';
import { syncProgressToCloud } from '../../utils/firebaseSync';
import { getAuth } from 'firebase/auth';

export const useOnlineSync = (childId: string) => {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(async state => {
      if (state.isConnected) {
        const user = getAuth().currentUser;
        if (user) {
          const local = await getProgress(childId);
          await syncProgressToCloud(user.uid, childId, local);
        }
      }
    });

    return () => unsubscribe();
  }, [childId]);
};
