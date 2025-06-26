import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import Toast from 'react-native-toast-message';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types'; // adjust path

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const showToast = (type: 'success' | 'error', message: string) => {
    Toast.show({
      type,
      text1: message,
      position: 'top',
      visibilityTime: 3000,
    });
  };

  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      showToast('error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      showToast('success', 'Welcome back!');
      setTimeout(() => navigation.navigate('ProfileSelector'), 500);
    } catch (error: any) {
        console.log('Login error:', error.code);
      
        const getLoginErrorMessage = (code: string): string => {
          switch (code) {
            case 'auth/invalid-email':
              return 'Invalid email address.';
            case 'auth/user-not-found':
              return 'No account found with this email.';
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
              return 'Incorrect email or password.';
            default:
              return 'Login failed. Please try again.';
          }
        };
      
        const message = getLoginErrorMessage(error.code);
        showToast('error', message);
      } finally {
        setLoading(false);
      }      
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <Text style={styles.label}>Password</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          placeholderTextColor="#999"
          secureTextEntry={!showPassword}
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.toggleButton}
        >
          <Text style={styles.toggleText}>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#382E1C" />
        ) : (
          <Text style={styles.buttonText}>Log In</Text>
        )}
      </TouchableOpacity>

      <View style={{ alignItems: 'flex-end', marginBottom: 16 }}>
        <Text
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgotPasswordText}
        >
          Forgot Password?
        </Text>
      </View>

      <View style={{ alignItems: 'center' }}>
        <Text
          onPress={() => navigation.navigate('SignUp')}
          style={styles.footerText}
        >
          Not a member? Sign up now
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF2', justifyContent: 'center', padding: 24 },
  title: {
    fontSize: 36,
    fontFamily: 'ComicSans',
    textAlign: 'center',
    color: '#382E1C',
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFF8E7',
    borderWidth: 2,
    borderColor: '#D6B98C',
    padding: 12,
    borderRadius: 10,
    fontFamily: 'ComicSans',
    marginBottom: 20,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
    borderRadius: 10,
    paddingRight: 12,
    marginBottom: 20,
  },
  toggleButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  toggleText: {
    fontFamily: 'ComicSans',
    fontSize: 14,
    color: '#555',
  },
  button: {
    backgroundColor: '#FFC8A2',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 20,
    color: '#382E1C',
    fontFamily: 'ComicSans',
  },
  forgotPasswordText: {
    fontSize: 12,
    fontFamily: 'ComicSans',
    color: '#555',
    textAlign: 'right',
  },
  footerText: {
    fontSize: 16,
    marginTop: 50,
    fontFamily: 'ComicSans',
    textAlign: 'center',
    color: '#555',
    textDecorationLine: 'underline',
  },
});
