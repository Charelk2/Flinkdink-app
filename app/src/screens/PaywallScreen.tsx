// app/src/screens/PaywallScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import Purchases, { PurchasesPackage } from 'react-native-purchases';
import { logEvent } from '../../utils/Analytics';

export default function PaywallScreen() {
  const [pkg, setPkg] = useState<PurchasesPackage | null>(null);

  // fire when screen mounts
  useEffect(() => {
    logEvent('paywall_shown');
  }, []);

  useEffect(() => {
    Purchases.getOfferings().then((offerings) => {
      setPkg(offerings.current?.monthly ?? null);
    });
  }, []);

  const purchase = async () => {
    if (!pkg) return;
    try {
      await Purchases.purchasePackage(pkg);
      // downstream listener fires trial_started or subscription_activated
    } catch {
      // user cancelled or error
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Unlock the full curriculum</Text>
      <Text style={styles.bullet}>• 40 weeks of content</Text>
      <Text style={styles.bullet}>• Unlimited profiles</Text>
      <Text style={styles.bullet}>• Ad-free experience</Text>

      <Button
        title={pkg ? `Start 14-day Trial (${pkg.product.priceString})` : 'Loading...'}
        onPress={purchase}
        disabled={!pkg}
      />

      <TouchableOpacity onPress={() => Purchases.restorePurchases()} style={styles.restore}>
        <Text>Restore Purchases</Text>
      </TouchableOpacity>

      <Button title="Maybe Later" onPress={() => {/* navigate back */}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 16, textAlign: 'center' },
  bullet: { fontSize: 16, marginVertical: 4 },
  restore: { marginTop: 12, alignItems: 'center' },
});
