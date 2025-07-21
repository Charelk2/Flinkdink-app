// app/src/screens/HomeScreen.tsx
globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
import { LogBox } from 'react-native';

import React, { useState, useContext, useEffect, useMemo, useCallback } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  Pressable,
} from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as d3 from 'd3-shape';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { ActiveProfileContext } from '../context/ActiveProfileContext';
import HamburgerMenu from '../components/HamburgerMenu';
import ConfirmModal from '../components/ConfirmModal';
import FlinkDinkBackground from '../components/FlinkDinkBackground';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { isWeekFullyComplete, subscribeToProfileSessions } from '../../utils/progress';
import { useTranslation } from 'react-i18next';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;
const TERM_WEEKS = 40;

// Generate the zig-zag anchor points
const generatePoints = (w: number, h: number): [number, number][] => [
  [w * 0.15, 50],
  [w * 0.85, 100],
  [w * 0.15, 200],
  [w * 0.85, 300],
  [w * 0.15, 400],
  [w * 0.85, 500],
  [w * 0.15, 600],
  [w * 0.85, 700],
  [w * 0.15, 800],
  [w * 0.85, 850],
];

// Sample a point along the line at a given percentage
const getPointAtPercentage = (pts: [number, number][], pct: number) => {
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i - 1], [x2, y2] = pts[i];
    total += Math.hypot(x2 - x1, y2 - y1);
  }
  let travelled = 0, target = pct * total;
  for (let i = 1; i < pts.length; i++) {
    const [x1, y1] = pts[i - 1], [x2, y2] = pts[i];
    const seg = Math.hypot(x2 - x1, y2 - y1);
    if (travelled + seg >= target) {
      const t = (target - travelled) / seg;
      return { x: x1 + (x2 - x1) * t, y: y1 + (y2 - y1) * t };
    }
    travelled += seg;
  }
  const [x, y] = pts[pts.length - 1];
  return { x, y };
};

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { activeProfile } = useContext(ActiveProfileContext);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { t } = useTranslation();

  // Logo letters
  const flink = 'FLINK'.split('');
  const dink = 'DINK'.split('');
  const colors = ['#FF6B6B', '#FF9B1C', '#4D96FF', '#38B000', '#6A4C93'];

  // State
  const [sessionsByWeek, setSessionsByWeek] = useState<Record<number, Record<string, number>>>({});
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingWeek, setPendingWeek] = useState<number | null>(null);

  // Subscribe to Firestore sessions
  useEffect(() => {
    if (!activeProfile) { setLoading(false); return; }
    setLoading(true);
    const unsub = subscribeToProfileSessions(activeProfile.id, merged => {
      setSessionsByWeek(merged);
      setLoading(false);
    });
    return () => unsub();
  }, [activeProfile]);

  // Merge local AsyncStorage on focus
  useFocusEffect(
    useCallback(() => {
      if (!activeProfile) return;
      AsyncStorage.getItem(`sessions-${activeProfile.id}`)
        .then(raw => {
          const local: Record<string, Record<number, number>> = raw ? JSON.parse(raw) : {};
          setSessionsByWeek(prev => {
            const merged = { ...prev };
            Object.entries(local).forEach(([date, weeks]) => {
              Object.entries(weeks).forEach(([ws, cnt]) => {
                const w = Number(ws);
                merged[w] = merged[w] || {};
                merged[w][date] = Math.max(merged[w][date] || 0, cnt);
              });
            });
            return merged;
          });
        });
    }, [activeProfile])
  );

  // Compute completedWeeks & currentWeek
  useEffect(() => {
    if (!activeProfile) return;
    const done: number[] = [];
    for (let w = 1; w <= TERM_WEEKS; w++) {
      if (isWeekFullyComplete(sessionsByWeek[w] || {})) done.push(w);
    }
    setCompletedWeeks(done);
    setCurrentWeek(Math.min(done.length + 1, TERM_WEEKS));
  }, [sessionsByWeek, activeProfile]);

  // Update today's count
  useEffect(() => {
    if (!activeProfile) return;
    const today = new Date().toISOString().slice(0,10);
    setTodayCount(sessionsByWeek[currentWeek]?.[today] || 0);
  }, [sessionsByWeek, currentWeek, activeProfile]);

  // Handlers
  const handleSessionStart = () => {
    if (!activeProfile) return;
    const next = isWeekFullyComplete(sessionsByWeek[currentWeek] || {})
      ? currentWeek + 1
      : currentWeek;
    navigation.navigate('Session', { overrideWeek: Math.min(next, TERM_WEEKS) });
  };
  const handleSkipToWeek = (w: number) => { setPendingWeek(w); setShowConfirm(true); };
  const confirmSkip = () => {
    if (pendingWeek != null) navigation.navigate('Session', { overrideWeek: pendingWeek });
    setShowConfirm(false);
    setPendingWeek(null);
  };

  // Precompute path and dots
  const pathWidth = width * 0.9;
  const pathHeight = 900;
  const anchors = useMemo(() => generatePoints(pathWidth, pathHeight), [pathWidth]);
  const pathData = useMemo(() => {
    const line = d3.line<[number, number]>().curve(d3.curveCatmullRom.alpha(0.5));
    return line(anchors) || '';
  }, [anchors]);
  const dotPoints = useMemo(
    () => Array.from({ length: TERM_WEEKS }, (_, i) => getPointAtPercentage(anchors, i / (TERM_WEEKS - 1))),
    [anchors]
  );
  const avatarPos = dotPoints[currentWeek - 1];

  // Loading guard
  if (loading || !activeProfile) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4D96FF" />
      </View>
    );
  }

  // Term & week-in-term
  const term = Math.ceil(currentWeek / 10);
  const weekInTerm = ((currentWeek - 1) % 10) + 1;

  // Title font size
  const titleFontSize = width > 1000 ? 64 : width > 600 ? 48 : 18;
  const isNarrow = width < 350;

  return (
    <View style={styles.container}>
      <FlinkDinkBackground />

      {/* Hamburger */}
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
          { paddingTop: Platform.select({ ios: insets.top + 50, android: 60, web: 100 }) },
        ]}
      >
        {/* Logo */}
        <View style={styles.logoWrapper}>
          {isNarrow ? (
            <>
              <View style={styles.titleContainer}>
                {flink.map((c, i) => (
                  <View key={i} style={[styles.letterBox, { backgroundColor: colors[i % colors.length] }]}>
                    <Text style={[styles.char, { fontSize: titleFontSize }]}>{c}</Text>
                  </View>
                ))}
              </View>
              <View style={[styles.titleContainer, styles.dinkRow]}>
                <View style={{ width: titleFontSize * 0.75 }} />
                {dink.map((c, i) => (
                  <View
                    key={i}
                    style={[styles.letterBox, { backgroundColor: colors[(i + flink.length) % colors.length] }]}
                  >
                    <Text style={[styles.char, { fontSize: titleFontSize }]}>{c}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.titleContainer}>
              {[...flink, ...dink].map((c, i) => (
                <View key={i} style={[styles.letterBox, { backgroundColor: colors[i % colors.length] }]}>
                  <Text style={[styles.char, { fontSize: titleFontSize }]}>{c}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Child Name */}
        <Text style={[styles.childName, { fontSize: titleFontSize * 1.5 }]}>
          {activeProfile.name}
        </Text>

        {/* Actions */}
        <View style={styles.actionGrid}>
          <TouchableOpacity style={[styles.actionBlock, styles.yellow]} onPress={handleSessionStart}>
            <Ionicons name="play-circle" size={48} color="#FFF" />
            <Text style={styles.actionText}>{t('startSession')}</Text>
            <Text style={styles.subActionText}>{t('sessionsToday', { count: todayCount })}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBlock, styles.purple]} onPress={() => navigation.navigate('Curriculum')}>
            <Ionicons name="book" size={48} color="#FFF" />
            <Text style={styles.actionText}>{t('outline')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBlock, styles.teal]} onPress={() => navigation.navigate('Progress')}>
            <Ionicons name="calendar" size={48} color="#FFF" />
            <Text style={styles.actionText}>{t('progress')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBlock, styles.green]} onPress={() => navigation.navigate('Instructions')}>
            <Ionicons name="information-circle-outline" size={48} color="#FFF" />
            <Text style={styles.actionText}>{t('instructions')}</Text>
          </TouchableOpacity>
        </View>

        {/* Learning Path */}
        <View style={[styles.pathContainer, { width: pathWidth, height: pathHeight }]}>
          <Svg width={pathWidth} height={pathHeight} viewBox={`0 0 ${pathWidth} ${pathHeight}`} style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#38B000" />
                <Stop offset="100%" stopColor="#6A4C93" />
              </LinearGradient>
            </Defs>
            <Path d={pathData} fill="none" stroke="url(#grad)" strokeWidth={15} strokeLinecap="round" />
          </Svg>

          {dotPoints.map(({ x, y }, i) => {
            const wk = i + 1;
            const done = completedWeeks.includes(wk);
            const isCurr = wk === currentWeek;
            const size = isCurr ? 28 : 20;
            const borderCol = ['#38B000', '#4D96FF', '#FF9B1C', '#6A4C93'][Math.ceil(wk / 10) - 1];
            return (
              <Pressable
                key={wk}
                onPress={() => handleSkipToWeek(wk)}
                style={[
                  styles.weekDot,
                  {
                    width: size,
                    height: size,
                    left: x - size / 2,
                    top: y - size / 2,
                    borderRadius: size / 2,
                    backgroundColor: done ? '#00C896' : '#FFF',
                    borderColor: borderCol,
                    borderWidth: isCurr ? 4 : 2,
                  },
                ]}
              >
                {done && !isCurr && <Ionicons name="checkmark" size={12} color="#FFF" />}
              </Pressable>
            );
          })}

          <Text style={[styles.avatar, { left: avatarPos.x - 22, top: avatarPos.y - 22 }]}>
            {activeProfile.avatar}
          </Text>
        </View>
      </ScrollView>

      <HamburgerMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSwitchProfile={() => navigation.navigate('ProfileSelector')}
        onMyAccount={() => navigation.navigate('MyAccount')}
        onSignOut={async () => { await signOut(auth); setMenuVisible(false); }}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFBF2' },
  scrollView: { flex: 1 },
  content: { flexGrow: 1, alignItems: 'center', paddingHorizontal: 24, paddingBottom: 40 },
  menuIcon: { position: 'absolute', left: 20, zIndex: 10 },
  logoWrapper: { alignItems: 'center', marginBottom: 16 },
  titleContainer: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'nowrap' },
  dinkRow: { marginTop: 4 },
  char: {
    fontFamily: 'ComicSans',
    letterSpacing: 2,
    color: '#FFF',
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
  actionText: { color: '#FFF', fontSize: 18, fontFamily: 'ComicSans', marginTop: 8, textAlign: 'center' },
  subActionText: { color: '#FFFA', fontSize: 10, fontFamily: 'ComicSans' },
  teal: { backgroundColor: '#4D96FF' },
  yellow: { backgroundColor: '#FF9B1C' },
  purple: { backgroundColor: '#6A4C93' },
  green: { backgroundColor: '#38B000' },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  progressSubtitle: {
    fontSize: 16,
    fontFamily: 'ComicSans',
    color: '#555',
    marginBottom: 12,
    textAlign: 'center',
  },
  pathContainer: { position: 'relative', alignItems: 'center', marginTop: 20 },
  weekDot: { position: 'absolute', justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  avatar: { position: 'absolute', fontSize: 36, zIndex: 5 },
});
