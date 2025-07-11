import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Platform,
  useWindowDimensions, // Import useWindowDimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import Toast from 'react-native-toast-message';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import FlinkDinkBackground from '../components/FlinkDinkBackground';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../i18n';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

export default function SignUpScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions(); // Get screen width

  // --- START: Responsive Logo Logic ---
  const titleFontSize = width > 1000 ? 64 : width > 600 ? 48 : 18;
  const logoThreshold = 350;
  const isNarrow = width < logoThreshold;
  const flink = 'FLINK'.split('');
  const dink = 'DINK'.split('');
  const colors = ['#FF6B6B', '#FF9B1C', '#4D96FF', '#38B000', '#6A4C93', '#FF6B6B', '#FF9B1C', '#4D96FF', '#38B000'];
  // --- END: Responsive Logo Logic ---

  const showToast = (type: 'success' | 'error', message: string) => {
    Toast.show({ type, text1: message, position: 'top', visibilityTime: 3000 });
  };

  const handleSignUp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return showToast('error', 'Please enter both email and password.');
    }
    if (cleanPassword.length < 6) {
      return showToast('error', 'Password must be at least 6 characters.');
    }

    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      showToast('success', 'Account created! Please add your first child.');
      navigation.reset({
        index: 0,
        routes: [{ name: 'AddChild', params: {} }],
      });
    } catch (error: any) {
      const getMessage = (code: string) => {
        switch (code) {
          case 'auth/email-already-in-use':
            return 'An account already exists with this email.';
          case 'auth/invalid-email':
            return 'Please enter a valid email address.';
          case 'auth/weak-password':
            return 'Password must be at least 6 characters.';
          default:
            return 'Sign-up failed. Please try again.';
        }
      };
      const message = getMessage(error.code);
      showToast('error', message);
      if (error.code === 'auth/email-already-in-use') {
        setTimeout(() => navigation.navigate('Login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.rootContainer}>
      <FlinkDinkBackground />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* --- START: FlinkDink Title Implementation --- */}
          <View style={styles.logoWrapper}>
            {isNarrow ? (
              <>
                <View style={styles.titleContainer}>
                  {flink.map((char, i) => (
                    <View key={i} style={[styles.letterBox, { backgroundColor: colors[i % colors.length] }]}>
                      <Text style={[styles.char, { fontSize: titleFontSize, color: '#fff' }]}>{char}</Text>
                    </View>
                  ))}
                </View>
                <View style={[styles.titleContainer, styles.dinkRow]}>
                  <View style={{ width: titleFontSize * 0.75 }} />
                  {dink.map((char, i) => (
                    <View key={i} style={[styles.letterBox, { backgroundColor: colors[(i + flink.length) % colors.length] }]}>
                      <Text style={[styles.char, { fontSize: titleFontSize, color: '#fff' }]}>{char}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.titleContainer}>
                {[...flink, ...dink].map((char, i) => (
                  <View key={i} style={[styles.letterBox, { backgroundColor: colors[i % colors.length] }]}>
                    <Text style={[styles.char, { fontSize: titleFontSize, color: '#fff' }]}>{char}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          {/* --- END: FlinkDink Title Implementation --- */}

          <View style={styles.card}>
            <Text style={styles.title}>{i18n.t('signUpTitle')}</Text>

            <Text style={styles.label}>{i18n.t('emailLabel')}</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder={i18n.t('emailPlaceholder')}
              placeholderTextColor="#A1A1AA"
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />

            <Text style={styles.label}>{i18n.t('passwordLabel')}</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder={i18n.t('passwordPlaceholderSignUp')}
                placeholderTextColor="#A1A1AA"
                secureTextEntry={!showPassword}
                style={styles.passwordInput}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.toggleButton}
              >
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#FFFFFF" />
                : <Text style={styles.buttonText}>{i18n.t('createAccountButton')}</Text>
              }
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{i18n.t('dividerOr')}</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
            >
              <Text style={styles.secondaryButtonText}>{i18n.t('alreadyHaveAccountButton')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'center',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 24,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    marginBottom: 0,
  },
  dinkRow: {
    marginTop: 4,
  },
  char: {
    fontFamily: 'ComicSans',
    color: '#fff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  letterBox: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10 },
      android: { elevation: 6 },
    }),
  },
  title: {
    fontSize: 28,
    fontFamily: 'ComicSans',
    textAlign: 'center',
    color: '#382E1C',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 24,
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 16,
    color: '#1F2937',
  },
  toggleButton: {
    padding: 10,
  },
  button: {
    backgroundColor: '#38B000',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'ComicSans',
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    marginHorizontal: 16,
    fontFamily: 'ComicSans',
    color: '#9CA3AF',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4D96FF',
  },
  secondaryButtonText: {
    fontSize: 18,
    color: '#4D96FF',
    fontFamily: 'ComicSans',
    fontWeight: 'bold',
  },
});