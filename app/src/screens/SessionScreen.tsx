//app/src/screens/SessionScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useActiveProfile } from '../context/ActiveProfileContext';
import { generateSessionSlides, Slide } from '../../utils/generateSessionSlides';
import {
  markWeekCompleted,
  getTodaySessionCount,
  incrementTodaySessionCount,
  setLastViewedWeek,
} from '../../utils/progress';
import { RootStackParamList } from '../navigation/types';
import ConfettiCannon from 'react-native-confetti-cannon';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';

export default function SessionScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Session'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { activeProfile } = useActiveProfile();

  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const overrideWeek = route.params?.overrideWeek;

  const getDefaultWeek = () => {
    const start = new Date(activeProfile?.startDate ?? new Date());
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.min(Math.floor(diff / 7) + 1, 40);
  };

  useEffect(() => {
    const load = async () => {
      if (!activeProfile) return;

      const week = overrideWeek ?? getDefaultWeek();
      const count = await getTodaySessionCount(activeProfile.id, week);
      if (count >= 3) {
        navigation.goBack();
        return;
      }

      try {
        const content = await generateSessionSlides(week, activeProfile);
        console.log('✅ Slides generated:', content.map((s) => s.id));
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
      return;
    }

    if (!completed && activeProfile) {
      const week = overrideWeek ?? getDefaultWeek();
      setCompleted(true);
      setShowConfetti(true);

      setTimeout(async () => {
        await markWeekCompleted(activeProfile.id, week);
        await incrementTodaySessionCount(activeProfile.id, week);
        await setLastViewedWeek(activeProfile.id, week);

        const completedCount = await getTodaySessionCount(activeProfile.id, week);

        setSlides(prev => [
          ...prev,
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
        setIndex(slides.length);

        setTimeout(() => {
          navigation.replace(completedCount === 3 ? 'SessionComplete' : 'Home');
        }, 3000);
      }, 300);
    }
  };

  const handleSwipe = (event: any) => {
    const { translationX } = event.nativeEvent;
    if (translationX > 50 && index > 0) {
      setIndex(index - 1); // swipe right
    } else if (translationX < -50 && index < slides.length - 1) {
      setIndex(index + 1); // swipe left
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
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler onGestureEvent={handleSwipe}>
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
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF2' },
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
