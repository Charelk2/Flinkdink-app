// app/src/screens/HomeScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { signOut } from 'firebase/auth'; // ✅ v9+ modular import
import { auth } from '../../config/firebase'; // ✅ from your new firebase.ts

export default function HomeScreen() {
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to FlinkDink 🎉</Text>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFBF2' },
  title: { fontSize: 28, fontFamily: 'ComicSans', color: '#382E1C', marginBottom: 20 },
  button: { backgroundColor: '#FFC8A2', padding: 12, borderRadius: 30 },
  buttonText: { fontSize: 18, fontFamily: 'ComicSans', color: '#382E1C' },
});
