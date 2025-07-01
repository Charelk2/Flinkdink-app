// app/src/screens/SessionCompleteScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SessionCompleteScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 You Did It!</Text>
      <Text style={styles.subtitle}>All 3 modules complete!</Text>
      <Text style={styles.stars}>⭐ ⭐ ⭐</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFBF2', padding: 24 },
  title: { fontSize: 36, fontFamily: 'ComicSans', marginBottom: 16, color: '#382E1C' },
  subtitle: { fontSize: 20, fontFamily: 'ComicSans', marginBottom: 20, color: '#382E1C' },
  stars: { fontSize: 40, marginBottom: 40 },
  button: { backgroundColor: '#FFC8A2', padding: 16, borderRadius: 30 },
  buttonText: { fontSize: 18, fontFamily: 'ComicSans', color: '#382E1C' },
});
