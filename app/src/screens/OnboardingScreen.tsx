// app/src/screens/OnboardingScreen.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import FlinkDinkBackground from '../components/FlinkDinkBackground';

type OnboardingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

export default function OnboardingScreen() {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();

  // For the FlinkDink title
  const colors = ['#FF6B6B', '#FF9B1C', '#4D96FF', '#38B000', '#6A4C93', '#FF6B6B', '#FF9B1C', '#4D96FF', '#38B000'];
  const titleChars = 'FLINKDINK'.split('');

  return (
    <View style={styles.container}>
      <FlinkDinkBackground />
      <SafeAreaView style={styles.safeArea}>
        <View /> 

        <View style={styles.content}>
          {/* FlinkDink Title */}
          <View style={styles.titleContainer}>
            {titleChars.map((char, i) => (
              <View key={i} style={[styles.letterBox, { backgroundColor: colors[i % colors.length] }]}>
                <Text style={styles.char}>{char}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.tagline}>A Fun Start to a Smart Future</Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('SignUp')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-around', // Distributes content vertically
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  char: {
    fontSize: 48,
    fontFamily: 'ComicSans',
    color: '#fff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
  },
  letterBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    marginBottom: 10, // For wrapping
    borderRadius: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
      android: { elevation: 5 },
    }),
  },
  tagline: {
    fontSize: 20,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 28,
  },
  button: {
    backgroundColor: '#4D96FF',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8 },
      android: { elevation: 8 },
    }),
  },
  buttonText: {
    fontSize: 22,
    fontFamily: 'ComicSans',
    color: '#fff',
    fontWeight: 'bold',
  },
});