// app/src/screens/SessionCompleteScreen.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Animatable from 'react-native-animatable';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Ionicons } from '@expo/vector-icons';

import { RootStackParamList } from '../navigation/types';
import FlinkDinkBackground from '../components/FlinkDinkBackground';

export default function SessionCompleteScreen() {
  const navigation = useNavigation<
    NativeStackNavigationProp<RootStackParamList, 'SessionComplete'>
  >();

  return (
    <View style={styles.container}>
      <FlinkDinkBackground />
      {/* A burst of confetti on screen load! */}
      <ConfettiCannon
        count={200}
        origin={{ x: -10, y: 0 }}
        autoStart={true}
        autoStartDelay={100}
        fadeOut={true}
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View /> 

        <View style={styles.content}>
          <Animatable.Text
            animation="bounceIn"
            duration={1200}
            style={styles.title}
          >
            🎉 You Did It!
          </Animatable.Text>

          <Animatable.Text
            animation="fadeInUp"
            duration={1000}
            delay={300}
            style={styles.subtitle}
          >
            Today's Sessions is Complete!
          </Animatable.Text>

          <View style={styles.starsContainer}>
            {[...Array(3)].map((_, index) => (
              <Animatable.View
                key={index}
                animation="tada"
                duration={1500}
                delay={600 + index * 200}
              >
                <Ionicons name="star" style={styles.starIcon} />
              </Animatable.View>
            ))}
          </View>
        </View>

        <Animatable.View animation="fadeInUp" duration={1000} delay={1200}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.buttonText}>Back to Home</Text>
          </TouchableOpacity>
        </Animatable.View>
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
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    fontSize: 42,
    fontFamily: 'ComicSans',
    marginBottom: 16,
    color: '#382E1C',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 22,
    fontFamily: 'ComicSans',
    marginBottom: 32,
    color: '#555',
    textAlign: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  starIcon: {
    fontSize: 56,
    color: '#FFD700', // Gold color
    marginHorizontal: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 3,
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
    fontSize: 20,
    fontFamily: 'ComicSans',
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});