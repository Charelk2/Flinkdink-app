import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useActiveProfile } from '../context/ActiveProfileContext';
import { generateSessionSlides } from '../../utils/generateSessionSlides';
import {
  markWeekCompleted,
  getTodaySessionCount,
  incrementTodaySessionCount,
} from '../../utils/progress';
import Carousel from '../components/Carousel.tsx';
import Toast from 'react-native-toast-message';
import { useNavigation } from '@react-navigation/native';
import ConfettiCannon from 'react-native-confetti-cannon';

export default function SessionScreen() {
  const { activeProfile } = useActiveProfile();
  const navigation = useNavigation();
  const [slides, setSlides] = useState([]);
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
        const content = await generateSessionSlides(week);
        setSlides(content);
      } catch (e) {
        console.error('Failed to load session:', e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [activeProfile]);

  useEffect(() => {
    if (!slides.length || !activeProfile) return;

    if (index === slides.length - 1 && !completed) {
      const week = getWeekNumber();
      markWeekCompleted(activeProfile.id, week);
      incrementTodaySessionCount(activeProfile.id);
      setCompleted(true);
      setShowConfetti(true);

      Toast.show({
        type: 'success',
        text1: '🎉 Session Complete!',
        text2: `Well done, ${activeProfile.name}!`,
        position: 'top',
      });

      setTimeout(() => {
        navigation.replace('SessionComplete');
      }, 3000);
    }
  }, [index, slides]);

  if (loading || !activeProfile) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#382E1C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {showConfetti && <ConfettiCannon count={80} origin={{ x: 200, y: 0 }} fadeOut />}
      <Carousel items={slides} onIndexChange={setIndex} renderItem={(item) => item.content} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF2', padding: 12 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFBF2' },
});
