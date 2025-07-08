// app/src/screens/HomeScreen.tsx

import React, { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useActiveProfile } from '../context/ActiveProfileContext';
import HamburgerMenu from '../components/HamburgerMenu';
import ConfirmModal from '../components/ConfirmModal';
import FlinkDinkBackground from '../components/FlinkDinkBackground';
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
  const { width } = useWindowDimensions();

  // Responsive title size
  const titleFontSize = width > 1000 ? 64 : width > 600 ? 48 : 18;

  const [menuVisible, setMenuVisible] = useState(false);
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingWeek, setPendingWeek] = useState<number | null>(null);
  const [completedDays, setCompletedDays] = useState(0);

  // Color palette for letters
  const colors = ['#FF6B6B', '#FF9B1C', '#4D96FF', '#38B000', '#6A4C93', '#FF6B6B', '#FF9B1C', '#4D96FF', '#38B000'];
  const title = 'FLINKDINK'.split('');

  useEffect(() => {
    if (isFocused && activeProfile) loadWeekData();
  }, [isFocused, activeProfile]);

  const loadWeekData = async (weekOverride?: number) => {
    if (!activeProfile) return;
    const now = new Date();
    const start = new Date(activeProfile.startDate ?? now);
    const defaultWeek = Math.min(
      Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1,
      40
    );
    const stored = await getLastViewedWeek(activeProfile.id);
    const week = weekOverride ?? stored ?? defaultWeek;

    const tCount = await getTodaySessionCount(activeProfile.id, week);
    const cDays = await getCompletedDaysThisWeek(activeProfile.id, week);

    const comp: number[] = [];
    for (let w = 1; w <= 40; w++) {
      const data = await getWeekSessionData(activeProfile.id, w);
      if (isWeekFullyComplete(data)) comp.push(w);
    }

    setCurrentWeek(week);
    setTodayCount(tCount);
    setCompletedDays(cDays);
    setCompletedWeeks(comp);
  };

  const handleSessionStart = async () => {
    if (activeProfile) {
      await setLastViewedWeek(activeProfile.id, currentWeek);
      navigation.navigate('Session', { overrideWeek: currentWeek });
    }
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

  return (
    <View style={styles.container}>
      <FlinkDinkBackground />

      {/* Menu Icon (placed outside ScrollView for fixed positioning) */}
      <TouchableOpacity
        style={[styles.menuIcon, { top: Platform.OS === 'web' ? 20 : insets.top + 10 }]}
        onPress={() => setMenuVisible(true)}
      >
        <Ionicons name="menu" size={28} color="#382E1C" />
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            // This ensures the content is pushed down below the icon on all platforms
            paddingTop: Platform.select({
              ios: insets.top + 50, // Use safe area inset + margin for iOS
              android: 60, // Keep original padding for Android
              web: 100, // Keep original padding for Web
            }),
          },
        ]}
      >
        {/* Title with pill backgrounds */}
        <View style={styles.titleContainer}>
          {title.map((char, i) => (
            <View key={i} style={[styles.letterBox, { backgroundColor: colors[i % colors.length] }]}>
              <Text
                style={[styles.char, { fontSize: titleFontSize, color: '#fff' }]}
              >
                {char}
              </Text>
            </View>
          ))}
        </View>
        <Text style={[styles.childName, { fontSize: titleFontSize * 1.5 }]}>
          {activeProfile?.name}
        </Text>

        {/* Action Grid */}
        <View style={styles.actionGrid}>
          <TouchableOpacity style={[styles.actionBlock, styles.yellow]} onPress={handleSessionStart}>
            <Ionicons name="play-circle" size={48} color="#fff" />
            <Text style={styles.actionText}>Start Session</Text>
            <Text style={styles.subActionText}>{todayCount}/3 sessions today</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBlock, styles.purple]} onPress={() => navigation.navigate('Curriculum')}>
            <Ionicons name="book" size={48} color="#fff" />
            <Text style={styles.actionText}>Outline</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBlock, styles.teal]} onPress={() => navigation.navigate('Progress')}>
            <Ionicons name="calendar" size={48} color="#fff" />
            <Text style={styles.actionText}>Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBlock, styles.green]} onPress={() => navigation.navigate('Instructions')}>
            <Ionicons name="information-circle-outline" size={48} color="#fff" />
            <Text style={styles.actionText}>Instructions</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Grid */}
        <Text style={styles.sectionTitle}>Weeks Completed: {completedWeeks.length}/40</Text>
        <View style={styles.grid}>
          {Array.from({ length: 40 }).map((_, idx) => {
            const n = idx + 1;
            const done = completedWeeks.includes(n);
            const curr = n === currentWeek;
            return (
              <TouchableOpacity
                key={n}
                onPress={() => handleSkipToWeek(n)}
                style={[styles.gridBlock, done ? styles.done : curr ? styles.current : styles.todo]}
              />
            );
          })}
        </View>
      </ScrollView>

      {/* Menus & Modals */}
      <HamburgerMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSwitchProfile={() => navigation.navigate('ProfileSelector')}
        onMyAccount={() => navigation.navigate('MyAccount')}
        onSignOut={async () => {
          await signOut(auth);
          setMenuVisible(false);
        }}
      />
      <ConfirmModal visible={showConfirm} week={pendingWeek ?? 1} onCancel={() => setShowConfirm(false)} onConfirm={confirmSkip} />
    </View>
  );
}

const styles = StyleSheet.create({
  // This clean container style ensures the background component is visible
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  menuIcon: {
    position: 'absolute',
    left: 20,
    zIndex: 10,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  char: {
    fontFamily: 'ComicSans',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
  },
  letterBox: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginHorizontal: 4,
    borderRadius: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  childName: {
    fontFamily: 'ComicSans',
    color: '#38B000',
    marginBottom: 50,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  actionGrid: {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionBlock: {
    width: '48%',
    aspectRatio: 1,
    maxWidth: 280,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  actionText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'ComicSans',
    marginTop: 8,
    textAlign: 'center',
  },
  subActionText: {
    color: '#fffa',
    fontSize: 10,
    fontFamily: 'ComicSans',
    marginTop: 0,
  },
  teal: { backgroundColor: '#4D96FF' },
  yellow: { backgroundColor: '#FF9B1C' },
  purple: { backgroundColor: '#6A4C93' },
  green: { backgroundColor: '#38B000' },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    marginBottom: 12,
    textAlign: 'center',
  },
  grid: {
    width: '70%',
    maxWidth: 600,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  gridBlock: {
    width: 19,
    height: 19,
    borderRadius: 4,
    margin: 3,
  },
  done: { backgroundColor: '#00C896' },
  current: { backgroundColor: '#FFA726' },
  todo: { backgroundColor: '#D6D6D6' },
});