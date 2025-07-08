// App.tsx

import React, { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';

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
import SessionCompleteScreen from './app/src/screens/SessionCompleteScreen'; // ✅ NEW
import InstructionScreen   from './app/src/screens/InstructionScreen'

// Types
import { RootStackParamList } from './app/src/navigation/types';

// Context
import { AuthProvider, useAuth } from './app/src/context/AuthContext';
import { ActiveProfileProvider, useActiveProfile } from './app/src/context/ActiveProfileContext';

// Utils
import { syncPendingProgress } from './app/utils/progress';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#382E1C" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <Stack.Screen name="ProfileSelector" component={ProfileSelectorScreen} />
      ) : (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      )}
  
      {!user && (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
  
      {user && (
        <>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Instructions" component={InstructionScreen} />
          <Stack.Screen name="AddChild" component={AddChildScreen} />
          <Stack.Screen name="MyAccount" component={MyAccountScreen} />
          <Stack.Screen name="Session" component={SessionScreen} />
          <Stack.Screen name="Progress" component={ProgressScreen} />
          <Stack.Screen name="Curriculum" component={CurriculumScreen} />
          <Stack.Screen name="SessionComplete" component={SessionCompleteScreen} />
        </>
      )}
    </Stack.Navigator>
  );  
}

function AppWithSync() {
  const { activeProfile } = useActiveProfile();

  useEffect(() => {
    if (activeProfile) {
      syncPendingProgress(activeProfile.id);
    }
  }, [activeProfile]);

  return (
    <>
      <AppNavigator />
      <Toast />
    </>
  );
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    const loadAssets = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();
        await Font.loadAsync({
          ComicSans: require('./app/assets/fonts/ComicSansMS.ttf'),
        });
      } catch (error) {
        console.error('❌ Font or splash screen error:', error);
      } finally {
        setAppIsReady(true);
      }
    };

    loadAssets();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) return null;

  return (
    <AuthProvider>
      <SafeAreaProvider>
      <ActiveProfileProvider>
        <NavigationContainer onReady={onLayoutRootView}>
          <AppWithSync />
        </NavigationContainer>
      </ActiveProfileProvider>
      </SafeAreaProvider>
    </AuthProvider>
  );
}
