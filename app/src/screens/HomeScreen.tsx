import React, { useState, useContext, useCallback, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { ActiveProfileContext } from '../context/ActiveProfileContext';
import HamburgerMenu from '../components/HamburgerMenu';
import ConfirmModal from '../components/ConfirmModal';
import FlinkDinkBackground from '../components/FlinkDinkBackground';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import {
  getTodaySessionCount,
  isWeekFullyComplete,
  subscribeToProfileSessions,
} from '../../utils/progress';
import { useTranslation } from 'react-i18next';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const TERM_WEEKS = 40;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { activeProfile } = useContext(ActiveProfileContext);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { t } = useTranslation();

  // Responsive logo sizes
  const titleFontSize = width > 1000 ? 64 : width > 600 ? 48 : 18;
  const logoThreshold = 350;
  const isNarrow = width < logoThreshold;
  const flink = 'FLINK'.split('');
  const dink = 'DINK'.split('');
  const colors = ['#FF6B6B', '#FF9B1C', '#4D96FF', '#38B000', '#6A4C93', '#FF6B6B', '#FF9B1C', '#4D96FF', '#38B000'];

  // State
  const [menuVisible, setMenuVisible] = useState(false);
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);
  const [todayCount, setTodayCount] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [completedDays, setCompletedDays] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingWeek, setPendingWeek] = useState<number | null>(null);

  // Real-time sessions data by week
  const [sessionsByWeek, setSessionsByWeek] = useState<{ [week: number]: { [date: string]: number } }>({});

  // Subscribe to real-time progress
  useEffect(() => {
    if (!activeProfile) return;
    setLoading(true);
    const unsub = subscribeToProfileSessions(activeProfile.id, (sessions) => {
      setSessionsByWeek(sessions);
      setLoading(false);
    });
    return unsub;
  }, [activeProfile]);

  // Derive completedWeeks/currentWeek/todayCount from sessionsByWeek
  useEffect(() => {
    if (!activeProfile) return;
    // Calculate completed weeks
    const done: number[] = [];
    for (let w = 1; w <= TERM_WEEKS; w++) {
      if (isWeekFullyComplete(sessionsByWeek[w] || {})) done.push(w);
    }
    setCompletedWeeks(done);

    // Calculate current week (from startDate)
    const now = new Date();
    const start = new Date(activeProfile.startDate ?? now);
    const defaultWeek = Math.min(
      Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1,
      TERM_WEEKS
    );
    setCurrentWeek(defaultWeek);

    // Today count for current week
    const today = new Date().toISOString().slice(0, 10);
    setTodayCount(sessionsByWeek[currentWeek]?.[today] ?? 0);

    // Completed days for current week (days with 3+ sessions)
    const weekSessions = sessionsByWeek[currentWeek] || {};
    setCompletedDays(Object.values(weekSessions).filter((c) => c >= 3).length);
  }, [sessionsByWeek, activeProfile, currentWeek]);

  const handleSessionStart = async () => {
    if (activeProfile) {
      navigation.navigate('Session', { overrideWeek: currentWeek });
    }
  };

  const handleSkipToWeek = (week: number) => {
    setPendingWeek(week);
    setShowConfirm(true);
  };

  const confirmSkip = async () => {
    if (pendingWeek !== null && activeProfile) {
      // Go to the chosen week
      navigation.navigate('Session', { overrideWeek: pendingWeek });
    }
    setShowConfirm(false);
    setPendingWeek(null);
  };

  if (loading || !activeProfile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFBF2' }}>
        <ActivityIndicator size="large" color="#4D96FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlinkDinkBackground />

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
            paddingTop: Platform.select({
              ios: insets.top + 50,
              android: 60,
              web: 100,
            }),
          },
        ]}
      >
        {/* FLINK DINK LOGO */}
        <View style={styles.logoWrapper}>
          {isNarrow ? (
            <>
              <View style={styles.titleContainer}>
                {flink.map((char, i) => (
                  <View key={i} style={[styles.letterBox, { backgroundColor: colors[i % colors.length] }]}>
                    <Text style={[styles.char, { fontSize: titleFontSize, color: '#fff' }]}>{char}</Text>
                  </View>
                ))}
              </View>
              <View style={[styles.titleContainer, styles.dinkRow]}>
                <View style={{ width: titleFontSize * 0.75 }} />
                {dink.map((char, i) => (
                  <View key={i} style={[styles.letterBox, { backgroundColor: colors[(i + flink.length) % colors.length] }]}>
                    <Text style={[styles.char, { fontSize: titleFontSize, color: '#fff' }]}>{char}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.titleContainer}>
              {[...flink, ...dink].map((char, i) => (
                <View key={i} style={[styles.letterBox, { backgroundColor: colors[i % colors.length] }]}>
                  <Text style={[styles.char, { fontSize: titleFontSize, color: '#fff' }]}>{char}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <Text style={[styles.childName, { fontSize: titleFontSize * 1.5 }]}>
          {activeProfile.name}
        </Text>

        <View style={styles.actionGrid}>
          <TouchableOpacity style={[styles.actionBlock, styles.yellow]} onPress={handleSessionStart}>
            <Ionicons name="play-circle" size={48} color="#fff" />
            <Text style={styles.actionText}>{t('startSession')}</Text>
            <Text style={styles.subActionText}>{t('sessionsToday', { count: todayCount ?? 0 })}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBlock, styles.purple]} onPress={() => navigation.navigate('Curriculum')}>
            <Ionicons name="book" size={48} color="#fff" />
            <Text style={styles.actionText}>{t('outline')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBlock, styles.teal]} onPress={() => navigation.navigate('Progress')}>
            <Ionicons name="calendar" size={48} color="#fff" />
            <Text style={styles.actionText}>{t('progress')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBlock, styles.green]} onPress={() => navigation.navigate('Instructions')}>
            <Ionicons name="information-circle-outline" size={48} color="#fff" />
            <Text style={styles.actionText}>{t('instructions')}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>
          {t('weeksCompleted', { completed: completedWeeks.length })}
        </Text>
        <View style={styles.grid}>
          {Array.from({ length: TERM_WEEKS }).map((_, idx) => {
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

      <HamburgerMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSwitchProfile={() => navigation.navigate('ProfileSelector')}
        onMyAccount={() => navigation.navigate('MyAccount')}
        onSignOut={async () => {
          await signOut(auth);
          setMenuVisible(false);
        }}
        switchProfileText={t('switchProfile')}
        myAccountText={t('myAccount')}
        signOutText={t('signOut')}
      />
      <ConfirmModal
        visible={showConfirm}
        week={pendingWeek ?? 1}
        onCancel={() => setShowConfirm(false)}
        onConfirm={confirmSkip}
      />
    </View>
  );
}

// ---- STYLES ----

const styles = StyleSheet.create({
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
  logoWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    marginBottom: 0,
  },
  dinkRow: {
    marginTop: 4,
    // Spacer handled in JSX for indentation
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