// app/src/screens/PaywallScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { RouteProp, useRoute, useNavigation, NavigationProp } from '@react-navigation/native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { RootStackParamList } from '../navigation/types';

export default function PaywallScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Paywall'>>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { term, week } = route.params;

  const [pkg, setPkg] = useState<PurchasesPackage | null>(null);

  useEffect(() => {
    async function loadOfferings() {
      const offerings = await Purchases.getOfferings();
      const defaultOffering = offerings.current;
      if (defaultOffering?.monthly) {
        setPkg(defaultOffering.monthly as PurchasesPackage);
      }
    }
    loadOfferings();
  }, []);

  async function purchase() {
    if (!pkg) return;
    try {
      await Purchases.purchasePackage(pkg);
    } catch (e) {
      // handle cancel vs error
    }
  }

  async function restore() {
    await Purchases.restorePurchases();
    navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unlock the full curriculum</Text>
      <Text style={styles.bullet}>• All 40 weeks of Language, Math & Encyclopedia</Text>
      <Text style={styles.bullet}>• Unlimited child profiles</Text>
      <Text style={styles.bullet}>• 100% ad-free</Text>

      <Button
        title={pkg ? `Start 14-Day Free Trial (${pkg.product.priceString})` : 'Loading...'}
        onPress={purchase}
        disabled={!pkg}
      />

      <TouchableOpacity onPress={restore} style={styles.restoreContainer}>
        <Text style={styles.restore}>Restore Purchases</Text>
      </TouchableOpacity>

      <Button title="Maybe Later" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 16 },
  bullet: { fontSize: 16, marginVertical: 4 },
  restoreContainer: { marginTop: 12, alignItems: 'center' },
  restore: { color: '#007AFF' },
});
