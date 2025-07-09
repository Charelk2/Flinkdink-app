import React, { useCallback, useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import Toast from 'react-native-toast-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// i18n config import
import './app/src/i18n';

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

// Types
import { RootStackParamList } from './app/src/navigation/types';

// Context
import { AuthProvider, useAuth } from './app/src/context/AuthContext';
import { ActiveProfileProvider, useActiveProfile } from './app/src/context/ActiveProfileContext';
import { LanguageProvider } from './app/src/context/LanguageContext';

// Utils
import { syncPendingProgress } from './app/utils/progress';

const Stack = createNativeStackNavigator<RootStackParamList>();

// --- Stacks ---

// Navigator for users who are NOT logged in
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

// Navigator for users who ARE logged in
function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileSelector" component={ProfileSelectorScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Instructions" component={InstructionScreen} />
      <Stack.Screen name="AddChild" component={AddChildScreen} />
      <Stack.Screen name="MyAccount" component={MyAccountScreen} />
      <Stack.Screen name="Session" component={SessionScreen} />
      <Stack.Screen name="Progress" component={ProgressScreen} />
      <Stack.Screen name="Curriculum" component={CurriculumScreen} />
      <Stack.Screen name="SessionComplete" component={SessionCompleteScreen} />
    </Stack.Navigator>
  );
}

// --- Root Navigator ---

function AppNavigator() {
  const { user, loading: authLoading } = useAuth();
  const { loadingProfile } = useActiveProfile();

  // Show a loading indicator while checking auth state or loading profile
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


// --- Main App Component ---

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
        await SplashScreen.hideAsync();
      }
    };

    loadAssets();
  }, []);

  if (!appIsReady) {
    return null; // Render nothing while assets are loading
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
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFFBF2' // Or your app's background color
    }
});