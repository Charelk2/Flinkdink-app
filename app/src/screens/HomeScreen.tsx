// app/src/screens/HomeScreen.tsx

import React, { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useActiveProfile } from '../context/ActiveProfileContext';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import HamburgerMenu from '../components/HamburgerMenu';
import ConfirmModal from '../components/ConfirmModal';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import {
  getCompletedDaysThisWeek,
  getTodaySessionCount,
  getWeekSessionData,
  isWeekFullyComplete,
  resetTodaySessionCount,
  setLastViewedWeek,
  getLastViewedWeek,
} from '../../utils/progress';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { activeProfile } = useActiveProfile();
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  const [menuVisible, setMenuVisible] = useState(false);
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingWeek, setPendingWeek] = useState<number | null>(null);
  const [completedDays, setCompletedDays] = useState(0);

  const today = format(new Date(), 'EEEE, MMMM d');

  const loadWeekData = async (weekOverride?: number) => {
    if (!activeProfile) return;

    const now = new Date();
    const start = new Date(activeProfile.startDate ?? now);
    const defaultWeek = Math.min(
      Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24) / 7) + 1,
      40
    );
    const stored = await getLastViewedWeek(activeProfile.id);
    const week = weekOverride ?? stored ?? defaultWeek;

    const todayCount = await getTodaySessionCount(activeProfile.id, week);
    const completedDays = await getCompletedDaysThisWeek(activeProfile.id, week);

    const completed: number[] = [];
    for (let w = 1; w <= 40; w++) {
      const data = await getWeekSessionData(activeProfile.id, w);
      if (isWeekFullyComplete(data)) completed.push(w);
    }

    setCurrentWeek(week);
    setTodayCount(todayCount);
    setCompletedDays(completedDays);
    setCompletedWeeks(completed);
  };

  useEffect(() => {
    if (isFocused && activeProfile) {
      loadWeekData();
    }
  }, [isFocused, activeProfile]);

  const handleSessionStart = async () => {
    if (activeProfile) {
      await setLastViewedWeek(activeProfile.id, currentWeek);
    }
    navigation.navigate('Session', { overrideWeek: currentWeek });
  };

  const handleSkipToWeek = (week: number) => {
    setPendingWeek(week);
    setShowConfirm(true);
  };

  const confirmSkip = async () => {
    if (pendingWeek !== null && activeProfile) {
      await resetTodaySessionCount(activeProfile.id, pendingWeek);
      await setLastViewedWeek(activeProfile.id, pendingWeek);
      setCurrentWeek(pendingWeek);
      navigation.navigate('Session', { overrideWeek: pendingWeek });
    }
    setShowConfirm(false);
    setPendingWeek(null);
  };

  const cancelSkip = () => {
    setShowConfirm(false);
    setPendingWeek(null);
  };

  const handleMenu = () => setMenuVisible(true);
  const handleCloseMenu = () => setMenuVisible(false);
  const handleMyAccount = () => {
    handleCloseMenu();
    navigation.navigate('MyAccount');
  };
  const handleSwitchProfile = () => {
    handleCloseMenu();
    navigation.navigate('ProfileSelector');
  };
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Sign out failed:', e);
    } finally {
      handleCloseMenu();
    }
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity
          style={[styles.menuIcon, { top: insets.top + 10 }]}
          onPress={handleMenu}
        >
          <Ionicons name="menu" size={28} color="#382E1C" />
        </TouchableOpacity>

        <Text style={styles.greeting}>
          Hi {activeProfile?.name} {activeProfile?.avatar}
        </Text>
        <Text style={styles.date}>{today}</Text>
        <Text style={styles.weekStatus}>
          📆 Week {currentWeek} – Day {Math.min(completedDays + 1, 7)} of 7
        </Text>

        <TouchableOpacity style={[styles.button, styles.teal]} onPress={handleSessionStart}>
          <Ionicons name="play" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>
            Start Today’s Session ({Math.min(todayCount + 1, 3)}/3)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.yellow]}
          onPress={() => navigation.navigate('Progress')}
        >
          <Ionicons name="calendar" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>View Progress</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.red]}
          onPress={() => navigation.navigate('Curriculum')}
        >
          <Ionicons name="book" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Curriculum Outline</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Weeks Completed: {completedWeeks.length}/40</Text>

        <View style={styles.grid}>
          {Array.from({ length: 40 }).map((_, i) => {
            const weekNum = i + 1;
            const isDone = completedWeeks.includes(weekNum);
            const isCurrent = weekNum === currentWeek;

            return (
              <TouchableOpacity
                key={weekNum}
                onPress={() => handleSkipToWeek(weekNum)}
                style={[
                  styles.gridBlock,
                  isDone ? styles.done : isCurrent ? styles.current : styles.todo,
                ]}
              />
            );
          })}
        </View>
      </ScrollView>

      <HamburgerMenu
        visible={menuVisible}
        onClose={handleCloseMenu}
        onSwitchProfile={handleSwitchProfile}
        onMyAccount={handleMyAccount}
        onSignOut={handleSignOut}
      />

      <ConfirmModal
        visible={showConfirm}
        week={pendingWeek ?? 1}
        onCancel={cancelSkip}
        onConfirm={confirmSkip}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF2' },
  content: { padding: 24, paddingTop: 60 },
  menuIcon: { position: 'absolute', left: 20, zIndex: 10 },
  greeting: {
    fontSize: 32,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    marginBottom: 6,
    textAlign: 'center',
  },
  date: {
    fontSize: 18,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    marginBottom: 10,
    textAlign: 'center',
  },
  weekStatus: {
    fontSize: 16,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    marginBottom: 20,
  },
  icon: { marginRight: 10 },
  teal: { backgroundColor: '#00B4D8' },
  yellow: { backgroundColor: '#F4C542' },
  red: { backgroundColor: '#F25C5C' },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'ComicSans',
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    marginBottom: 12,
    marginTop: 10,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  gridBlock: {
    width: 20,
    height: 20,
    borderRadius: 4,
    margin: 3,
  },
  done: { backgroundColor: '#00C896' },
  current: { backgroundColor: '#FFA726' },
  todo: { backgroundColor: '#D6D6D6' },
});
