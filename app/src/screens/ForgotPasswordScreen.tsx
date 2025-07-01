
//app/src/screens/ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const navigation = useNavigation();

  const showToast = (type: 'success' | 'error', message: string) => {
    Toast.show({
      type,
      text1: message,
      position: 'top',
      visibilityTime: 3000,
    });
  };

  const handleReset = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      showToast('error', 'Please enter your email.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
      showToast('success', 'Password reset email sent.');
      setTimeout(() => navigation.goBack(), 2000);
    } catch (error: any) {
      console.log('Reset error:', error.code);
      const messageMap: { [key: string]: string } = {
        'auth/invalid-email': 'Invalid email address.',
        'auth/user-not-found': 'No account found with this email.',
      };
      const fallback = 'Failed to send reset email.';
      showToast('error', messageMap[error?.code] || fallback);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reset Password</Text>

      <Text style={styles.label}>Enter your email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="your@email.com"
        placeholderTextColor="#999"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Send Reset Email</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF2',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 30,
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
  button: {
    backgroundColor: '#FFC8A2',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: '#382E1C',
    fontFamily: 'ComicSans',
  },
});
