// app/src/components/SessionGuard.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { getCustomerInfo, isPremium } from '../../utils/subscription';
import { isWeekFree } from '../../utils/freeContent';

interface Props {
  term: number;
  week: number;
  children: React.ReactNode;
}

export default function SessionGuard({ term, week, children }: Props) {
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  // typed navigation prop
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  useEffect(() => {
    async function checkAccess() {
      if (isWeekFree(term, week)) {
        setAllowed(true);
      } else {
        const info = await getCustomerInfo();
        if (isPremium(info)) {
          setAllowed(true);
        } else {
          navigation.navigate('Paywall', { term, week });
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
