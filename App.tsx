import React, { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';

// Screens
import OnboardingScreen from './app/src/screens/OnboardingScreen';
import LoginScreen from './app/src/screens/LoginScreen';
import SignUpScreen from './app/src/screens/SignUpScreen';
import ForgotPasswordScreen from './app/src/screens/ForgotPasswordScreen';
import HomeScreen from './app/src/screens/HomeScreen';
import AddChildScreen from './app/src/screens/AddChildScreen';
import ProfileSelectorScreen from './app/src/screens/ProfileSelector';
import { RootStackParamList } from './app/src/navigation/types';

// Context
import { AuthProvider, useAuth } from './app/src/context/AuthContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AppNavigator() {
  const { user, loading } = useAuth();

  // Avoid rendering anything until Firebase Auth state is ready
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
        <>
          <Stack.Screen name="AddChild" component={AddChildScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ProfileSelector" component={ProfileSelectorScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        </>
      )}
    </Stack.Navigator>
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
      <NavigationContainer onReady={onLayoutRootView}>
        <AppNavigator />
        <Toast />
      </NavigationContainer>
    </AuthProvider>
  );
}
