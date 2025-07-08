import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Pressable,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Animatable from 'react-native-animatable';
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
import {
  PanGestureHandler,
  GestureHandlerRootView,
  GestureHandlerStateChangeEvent,
  State,
} from 'react-native-gesture-handler';
import i18n from '../i18n'; // ✅ IMPORT i18n

export default function SessionScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Session'>>();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { activeProfile } = useActiveProfile();

  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const BACK_ZONE_WIDTH = 48;

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
      setIndex((i) => i + 1);
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

        setSlides((prev) => [
          ...prev,
          {
            id: 'final',
            type: 'language',
            content: (
              <View style={styles.finalSlide}>
                <Animatable.Text
                  animation="bounceIn"
                  duration={1200}
                  style={styles.finalTitle}
                >
                  {i18n.t('wellDone', { name: activeProfile.name })}
                </Animatable.Text>
                <Animatable.Text
                  animation="fadeInUp"
                  delay={500}
                  duration={1000}
                  style={styles.finalSubtitle}
                >
                  {i18n.t('sessionNumberOfThreeComplete', { count: completedCount })}
                </Animatable.Text>
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

  if (loading || !activeProfile) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#382E1C" />
      </View>
    );
  }

  const onHandlerStateChange = (event: GestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.END) {
        const dx = (event.nativeEvent as any).translationX;
      if (dx > 50 && index > 0) {
        setIndex((i) => i - 1);
      } else if (dx < -50) {
        handleNext();
      }
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler onHandlerStateChange={onHandlerStateChange} enabled={index < slides.length - 1}>
        <Pressable
          style={styles.container}
          onPress={({ nativeEvent }) => {
            const { locationX } = nativeEvent;
            if (locationX <= BACK_ZONE_WIDTH && index > 0) {
              setIndex((i) => i - 1);
            } else {
              handleNext();
            }
          }}
        >
          {slides[index]?.content}

          {showConfetti && (
            <View style={styles.confettiContainer} pointerEvents="none">
              <ConfettiCannon
                count={150}
                origin={{ x: -10, y: 0 }}
                fadeOut
                autoStart
                explosionSpeed={400}
                fallSpeed={3000}
              />
            </View>
          )}
        </Pressable>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF2' },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFBF2',
  },
  finalSlide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#38B000',
    paddingHorizontal: 24,
  },
  finalTitle: {
    fontSize: 34,
    fontFamily: 'ComicSans',
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
      android: { elevation: 5 },
    }),
  },
  finalSubtitle: {
    fontSize: 20,
    fontFamily: 'ComicSans',
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    marginTop: 12,
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
});