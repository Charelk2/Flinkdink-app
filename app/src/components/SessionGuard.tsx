// app/src/components/SessionGuard.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getCustomerInfo, isPremium } from '../../utils/subscription';
import { isWeekFree } from '../../utils/freeContent';


type Props = {
  term: number;
  week: number;
  children: React.ReactNode;
};

export default function SessionGuard({ term, week, children }: Props) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    async function checkAccess() {
      if (isWeekFree(term, week)) {
        setAllowed(true);
      } else {
        try {
          const info = await getCustomerInfo();
          if (isPremium(info)) {
            setAllowed(true);
          } else {
            navigation.replace('Paywall', { term, week });
            return; // bail out so `setLoading(false)` runs only once
          }
        } catch (e) {
          console.error('Subscription check failed', e);
          // you could show a retry UI or a toast here
        }
      }
      setLoading(false);
    }
    checkAccess();
  }, [term, week, navigation]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <>{allowed && children}</>;
}
