// app/src/utils/subscription.ts
import Purchases, { CustomerInfo } from 'react-native-purchases';

export async function getCustomerInfo(): Promise<CustomerInfo> {
  return await Purchases.getCustomerInfo();
}

export function isPremium(info?: CustomerInfo): boolean {
  // Look under `entitlements.active` for your entitlement ID
  return !!info?.entitlements?.active?.['FlinkDinkPlus']?.isActive;
}
