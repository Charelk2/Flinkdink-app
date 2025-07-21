// App.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { getApp, getApps } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Purchases, { PurchasesEntitlementInfo } from 'react-native-purchases';
import SessionGuard from './app/src/components/SessionGuard';
import './app/src/i18n';
import OnboardingScreen from './app/src/screens/OnboardingScreen';
import LoginScreen from './app/src/screens/LoginScreen';
import SignUpScreen from './app/src/screens/SignUpScreen';
import ForgotPasswordScreen from './app/src/screens/ForgotPasswordScreen';
import ProfileSelectorScreen from './app/src/screens/ProfileSelector';
import HomeScreen from './app/src/screens/HomeScreen';
import InstructionScreen from './app/src/screens/InstructionScreen';
import AddChildScreen from './app/src/screens/AddChildScreen';
import MyAccountScreen from './app/src/screens/MyAccountScreen';
import PaywallScreen from './app/src/screens/PaywallScreen';
import SessionScreen from './app/src/screens/SessionScreen';
import ProgressScreen from './app/src/screens/ProgressScreen';
import CurriculumScreen from './app/src/screens/CurriculumScreen';
import SessionCompleteScreen from './app/src/screens/SessionCompleteScreen';

import { AuthProvider, useAuth } from './app/src/context/AuthContext';
import { ActiveProfileProvider, useActiveProfile } from './app/src/context/ActiveProfileContext';
import { LanguageProvider } from './app/src/context/LanguageContext';

import { initAnalytics, logEvent } from './app/utils/Analytics';

// Configure RevenueCat before app loads
Purchases.configure({ apiKey: 'goog_KbArquIXpiywIFZzosWvrYeVlFw' });

type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  ProfileSelector: undefined;
  Home: undefined;
  Instructions: undefined;
  AddChild: undefined;
  MyAccount: undefined;
  Paywall: { term: number; week: number };
  Session: { term: number; week: number; overrideWeek?: number };
  Progress: undefined;
  Curriculum: undefined;
  SessionComplete: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type SessionProps = NativeStackScreenProps<RootStackParamList, 'Session'>;
function SessionWrapper({ route }: SessionProps) {
  const { term = 1, week = 1, overrideWeek } = route.params;
  const currentWeek = overrideWeek ?? week;

  useEffect(() => {
    logEvent('first_session_start', { term, week: currentWeek });
  }, [term, currentWeek]);

  return (
    <SessionGuard term={term} week={currentWeek}>
      <SessionScreen />
    </SessionGuard>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileSelector" component={ProfileSelectorScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Instructions" component={InstructionScreen} />
      <Stack.Screen name="AddChild" component={AddChildScreen} />
      <Stack.Screen name="MyAccount" component={MyAccountScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
      <Stack.Screen name="Session" component={SessionWrapper} />
      <Stack.Screen name="Progress" component={ProgressScreen} />
      <Stack.Screen name="Curriculum" component={CurriculumScreen} />
      <Stack.Screen name="SessionComplete" component={SessionCompleteScreen} />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { user, loading: authLoading } = useAuth();
  const { loadingProfile } = useActiveProfile();

  if (authLoading || loadingProfile) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

export default function App() {
  const [resourcesReady, setResourcesReady] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);

  // Load fonts & prevent splash hide
  useEffect(() => {
    (async () => {
      await SplashScreen.preventAutoHideAsync();
      await Font.loadAsync({ ComicSans: require('./app/assets/fonts/ComicSansMS.ttf') });
      setResourcesReady(true);
      await SplashScreen.hideAsync();
    })();
  }, []);

  // Init Firebase app & analytics
  useEffect(() => {
    (async () => {
      if (getApps().length === 0) return;
      getApp();
      await initAnalytics();
      logEvent('install');
      setFirebaseReady(true);
    })();
  }, []);

  if (!resourcesReady || !firebaseReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <LanguageProvider>
          <ActiveProfileProvider>
            <AppNavigator />
            <Toast />
          </ActiveProfileProvider>
        </LanguageProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});