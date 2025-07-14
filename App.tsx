// App.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Purchases from 'react-native-purchases';
import Constants from 'expo-constants';

import SessionGuard from './app/src/components/SessionGuard';
import './app/src/i18n'; // i18n config

// Screens
import OnboardingScreen from './app/src/screens/OnboardingScreen';
import LoginScreen from './app/src/screens/LoginScreen';
import SignUpScreen from './app/src/screens/SignUpScreen';
import ForgotPasswordScreen from './app/src/screens/ForgotPasswordScreen';
import HomeScreen from './app/src/screens/HomeScreen';
import AddChildScreen from './app/src/screens/AddChildScreen';
import ProfileSelectorScreen from './app/src/screens/ProfileSelector';
import MyAccountScreen from './app/src/screens/MyAccountScreen';
import SessionScreen from './app/src/screens/SessionScreen';
import ProgressScreen from './app/src/screens/ProgressScreen';
import CurriculumScreen from './app/src/screens/CurriculumScreen';
import SessionCompleteScreen from './app/src/screens/SessionCompleteScreen';
import InstructionScreen from './app/src/screens/InstructionScreen';
import PaywallScreen from './app/src/screens/PaywallScreen';

import { AuthProvider, useAuth } from './app/src/context/AuthContext';
import { ActiveProfileProvider, useActiveProfile } from './app/src/context/ActiveProfileContext';
import { LanguageProvider } from './app/src/context/LanguageContext';
import { RootStackParamList } from './app/src/navigation/types';

type SessionProps = NativeStackScreenProps<RootStackParamList, 'Session'>;
function SessionWrapper({ route, navigation }: SessionProps) {
  const { overrideWeek, term = 1, week = 1 } = route.params ?? {};
  const guardWeek = overrideWeek ?? week;
  return (
    <SessionGuard term={term} week={guardWeek}>
      {/* FIX: Removed the unnecessary route and navigation props */}
      <SessionScreen />
    </SessionGuard>
  );
}

const Stack = createNativeStackNavigator<RootStackParamList>();

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
      {/* Use the wrapper component here */}
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
        <ActivityIndicator size="large" color="#382E1C" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

function RevenueCatInitializer() {
  const { user } = useAuth();
  const rcKey = (Constants.manifest as any)?.extra?.revenueCatKey as string | undefined;

  useEffect(() => {
    if (!user?.uid) return;
    if (!rcKey) {
      console.warn(
        '[RevenueCat] skipping configure: no API key found. ' +
        'Set expo.extra.revenueCatKey in app.json.'
      );
      return;
    }
    Purchases.configure({ apiKey: rcKey, appUserID: user.uid });
  }, [user, rcKey]);

  return null;
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        await Font.loadAsync({
          ComicSans: require('./app/assets/fonts/ComicSansMS.ttf'),
        });
      } catch (e) {
        console.warn('Error loading assets:', e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  if (!appIsReady) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RevenueCatInitializer />
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFBF2',
  },
});