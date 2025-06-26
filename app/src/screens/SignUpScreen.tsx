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
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import Toast from 'react-native-toast-message';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../src/navigation/types'; // adjust path

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

export default function SignUpScreen() {
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

  const handleSignUp = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      showToast('error', 'Please enter both email and password.');
      return;
    }

    if (cleanPassword.length < 6) {
      showToast('error', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
        await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
        showToast('success', 'Account created!');
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'AddChild' }],
          });
        }, 1500);
        
    } catch (error: any) {
      console.log('SIGN-UP ERROR:', error.code);
      const getSignupErrorMessage = (code: string): string => {
        switch (code) {
          case 'auth/email-already-in-use':
            return 'Account already exists. Redirecting to login...';
          case 'auth/invalid-email':
            return 'Invalid email address.';
          case 'auth/weak-password':
            return 'Password must be at least 6 characters.';
          default:
            return 'Sign-up failed. Please try again.';
        }
      };
      
      const message = getSignupErrorMessage(error.code);
      showToast('error', message);
      
      if (error.code === 'auth/email-already-in-use') {
        setTimeout(() => navigation.navigate('Login'), 2000);
      }      
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

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
          placeholder="Create a password"
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

      <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#382E1C" />
        ) : (
          <Text style={styles.buttonText}>Create Account</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.footerText}>Already have an account? Log in</Text>
      </TouchableOpacity>
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
    borderColor: '#D6B98C',
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
    backgroundColor: '#FBD278',
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
  footerText: {
    marginTop: 65,
    fontSize: 16,
    fontFamily: 'ComicSans',
    textAlign: 'center',
    color: '#555',
    textDecorationLine: 'underline',
  },
});
