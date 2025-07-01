import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useActiveProfile } from '../context/ActiveProfileContext';
import { generateSessionSlides, Slide } from '../../utils/generateSessionSlides';
import {
  markWeekCompleted,
  getTodaySessionCount,
  incrementTodaySessionCount,
} from '../../utils/progress';
import Toast from 'react-native-toast-message';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

export default function SessionScreen() {
  const { activeProfile } = useActiveProfile();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const getWeekNumber = () => {
    const start = new Date(activeProfile?.startDate ?? new Date());
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(Math.floor(diff / 7) + 1, 40);
  };

  useEffect(() => {
    const load = async () => {
      if (!activeProfile) return;

      const count = await getTodaySessionCount(activeProfile.id);
      if (count >= 3) {
        Toast.show({
          type: 'info',
          text1: '✅ Daily Limit Reached',
          text2: 'You’ve already completed 3 sessions today.',
          position: 'top',
        });
        navigation.goBack();
        return;
      }

      try {
        const week = getWeekNumber();
        const content = await generateSessionSlides(week, activeProfile);
        setSlides(content);
      } catch (e) {
        console.error('Failed to load session:', e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [activeProfile]);

  const handleNext = async () => {
    if (index < slides.length - 1) {
      setIndex(index + 1);
    } else if (!completed && activeProfile) {
      const week = getWeekNumber();
      await markWeekCompleted(activeProfile.id, week);
      await incrementTodaySessionCount(activeProfile.id);
      const completedCount = (await getTodaySessionCount(activeProfile.id));

      setCompleted(true);
      setShowConfetti(true);

      Toast.show({
        type: 'success',
        text1: '🎉 Session Complete!',
        text2: `Well done, ${activeProfile.name}!`,
        position: 'top',
      });

      // Add final slide with celebration
      setSlides([
        ...slides,
        {
          id: 'final',
          type: 'language',
          content: (
            <View style={styles.finalSlide}>
              <Text style={styles.finalText}>🎉 Well done, {activeProfile.name}!</Text>
              <Text style={styles.subText}>Session {completedCount} of 3 completed</Text>
            </View>
          ),
        },
      ]);
      setIndex(slides.length); // Move to final slide

      setTimeout(() => {
        navigation.replace('SessionComplete');
      }, 3000);
    }
  };

  if (loading || !activeProfile) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#382E1C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {slides[index]?.content}

      {!completed && (
        <TouchableOpacity onPress={handleNext} style={styles.button}>
          <Text style={styles.buttonText}>Next</Text>
        </TouchableOpacity>
      )}

      {showConfetti && (
        <View style={styles.confettiContainer} pointerEvents="none">
          <ConfettiCannon
            count={100}
            origin={{ x: 200, y: 0 }}
            fadeOut
            autoStart
            explosionSpeed={400}
            fallSpeed={2800}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF2',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFBF2',
  },
  button: {
    backgroundColor: '#FBD278',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignSelf: 'center',
    marginBottom: 50,
    position: 'absolute',
    bottom: 40,
  },
  buttonText: {
    fontSize: 20,
    fontFamily: 'ComicSans',
    color: '#382E1C',
  },
  finalSlide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFBF2',
    paddingHorizontal: 24,
  },
  finalText: {
    fontSize: 32,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    textAlign: 'center',
  },
  subText: {
    fontSize: 20,
    fontFamily: 'ComicSans',
    color: '#555',
    textAlign: 'center',
    marginTop: 10,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    pointerEvents: 'none',
  },
});
