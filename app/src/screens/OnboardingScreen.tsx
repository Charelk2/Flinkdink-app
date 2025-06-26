import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types'; // Adjust path if needed

type OnboardingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

export default function OnboardingScreen() {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();

  return (
    <View style={styles.container}>
      <View style={styles.dotsContainer}>
        <View style={[styles.dot, { top: 40, left: 40, backgroundColor: '#F4A9A8' }]} />
        <View style={[styles.dot, { top: 100, right: 80, backgroundColor: '#F9DD6D' }]} />
        <View style={[styles.dot, { bottom: 120, left: 60, backgroundColor: '#C4A7E7' }]} />
        <View style={[styles.dot, { bottom: 200, right: 50, backgroundColor: '#97D8E2' }]} />
        <View style={[styles.dot, { bottom: 40, right: 20, backgroundColor: '#A2B8F2' }]} />
      </View>

      <Text style={styles.title}>FlinkDink</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Login')}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotsContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  dot: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 48,
    fontFamily: 'ComicSans',
    color: '#333',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#FBD278',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 50,
    elevation: 3,
  },
  buttonText: {
    fontSize: 24,
    fontFamily: 'ComicSans',
    color: '#333',
  },
});
