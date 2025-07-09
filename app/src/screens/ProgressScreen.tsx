// app/src/screens/ProgressScreen.tsx

import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { ActiveProfileContext } from '../context/ActiveProfileContext';
import {
  subscribeToProfileSessions,
  isWeekFullyComplete,
} from '../../utils/progress';
import FlinkDinkBackground from '../components/FlinkDinkBackground';
import HamburgerMenu from '../components/HamburgerMenu';
import i18n from '../i18n';

const TERM_COUNT = 4;
const WEEKS_PER_TERM = 10;
const TOTAL_WEEKS = TERM_COUNT * WEEKS_PER_TERM;

export default function ProgressScreen() {
  const navigation = useNavigation();
  const { activeProfile } = useContext(ActiveProfileContext);

  const [sessionsByWeek, setSessionsByWeek] = useState<{ [week: number]: { [date: string]: number } }>({});
  const [loading, setLoading] = useState(true);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [weekData, setWeekData] = useState<Record<string, number>>({});

  // Menu state
  const [menuVisible, setMenuVisible] = useState(false);

  // Tab state
  const [viewingTermIndex, setViewingTermIndex] = useState(0);

  // Get the current week from start date (optional fallback)
  const currentWeek = React.useMemo(() => {
    if (!activeProfile) return 1;
    const now = new Date();
    const start = new Date(activeProfile.startDate ?? now);
    return Math.min(
      Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1,
      TOTAL_WEEKS
    );
  }, [activeProfile]);

  // Set initial tab to current week term
  useEffect(() => {
    setViewingTermIndex(Math.max(0, Math.ceil(currentWeek / WEEKS_PER_TERM) - 1));
  }, [currentWeek]);

  // Real-time sync from Firestore
  useEffect(() => {
    if (!activeProfile) return;
    setLoading(true);
    const unsub = subscribeToProfileSessions(activeProfile.id, sessions => {
      setSessionsByWeek(sessions);
      setLoading(false);
    });
    return unsub;
  }, [activeProfile]);

  // Helper to get completed weeks
  function getCompletedWeeks() {
    const done: number[] = [];
    for (let w = 1; w <= TOTAL_WEEKS; w++) {
      if (isWeekFullyComplete(sessionsByWeek[w] || {})) done.push(w);
    }
    return done;
  }
  const completedWeeks = getCompletedWeeks();

  // Term weeks to display in grid
  const termWeeks = Array.from(
    { length: WEEKS_PER_TERM },
    (_, i) => viewingTermIndex * WEEKS_PER_TERM + i + 1
  );

  // Modal for viewing sessions in a week
  const handleWeekPress = (week: number) => {
    setSelectedWeek(week);
    setWeekData(sessionsByWeek[week] || {});
    setModalVisible(true);
  };

  // Menu
  const onSignOut = async () => {
    await signOut(auth);
    setMenuVisible(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFBF2' }}>
        <ActivityIndicator size="large" color="#4D96FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlinkDinkBackground />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.headerIcon}>
            <Ionicons name="menu" size={28} color="#382E1C" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Home' as never)} style={styles.headerIcon}>
            <Ionicons name="home" size={24} color="#382E1C" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={termWeeks}
          keyExtractor={w => w.toString()}
          numColumns={5}
          contentContainerStyle={styles.listContentContainer}
          ListHeaderComponent={
            <View style={styles.cardHeader}>
              <View style={styles.centeredRow}>
                <Text style={styles.title} numberOfLines={2} ellipsizeMode="tail">
                  {i18n.t('myProgressTitle')}
                </Text>
              </View>
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  {i18n.t('weeksCompleteProgress', { completed: completedWeeks.length, total: TOTAL_WEEKS })}
                </Text>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${(completedWeeks.length / TOTAL_WEEKS) * 100}%` },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.termRow}>
                {Array.from({ length: TERM_COUNT }).map((_, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.termTab,
                      viewingTermIndex === i && styles.termTabActive,
                    ]}
                    onPress={() => setViewingTermIndex(i)}>
                    <Text
                      style={[
                        styles.termText,
                        viewingTermIndex === i && styles.termTextActive,
                      ]}>
                      {i18n.t('termTab', { term: i + 1 })}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
          renderItem={({ item: week }) => {
            const isDone = completedWeeks.includes(week);
            const isCurrent = week === currentWeek;
            return (
              <TouchableOpacity
                onPress={() => handleWeekPress(week)}
                style={[
                  styles.weekBlock,
                  isDone ? styles.weekBlockDone : isCurrent ? styles.weekBlockCurrent : styles.weekBlockTodo,
                ]}>
                <Text style={styles.weekNumber}>{week}</Text>
                {isCurrent && <Ionicons name="star" size={14} color="#FFF" style={styles.starIcon} />}
              </TouchableOpacity>
            );
          }}
        />
      </SafeAreaView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {i18n.t('weekDetailsTitle', { week: selectedWeek })}
            </Text>
            {Object.entries(weekData ?? {}).map((entry) => {
              const [day, count] = entry as [string, number];
              return (
                <Text key={day} style={styles.modalText}>
                  {i18n.t(
                    count === 1 ? 'sessionsCount' : 'sessionsCountPlural',
                    { day, count }
                  )}
                </Text>
              );
            })}
            {Object.keys(weekData ?? {}).length === 0 && (
              <Text style={styles.modalText}>{i18n.t('noSessionsRecorded')}</Text>
            )}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseButtonText}>
                {i18n.t('closeButton')}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <HamburgerMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSwitchProfile={() => {
          setMenuVisible(false);
          navigation.navigate('ProfileSelector' as never);
        }}
        onMyAccount={() => {
          setMenuVisible(false);
          navigation.navigate('MyAccount' as never);
        }}
        onSignOut={onSignOut}
        switchProfileText={i18n.t('switchProfile') as string}
        myAccountText={i18n.t('myAccount') as string}
        signOutText={i18n.t('signOut') as string}
      />
    </View>
  );
}

// ---- Styles remain the same ----

const styles = StyleSheet.create({
  centeredRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFBF2',
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  headerIcon: {
    padding: 5,
  },
  listContentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  cardHeader: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10 },
      android: { elevation: 6 },
    }),
  },
  title: {
    fontSize: 28,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    textAlign: 'center',
    marginBottom: 16,
    maxWidth: '90%',
    alignSelf: 'center',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontFamily: 'ComicSans',
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 8,
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#00C896',
    borderRadius: 6,
  },
  termRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  termTab: {
    minWidth: 72,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginVertical: 4,
    marginHorizontal: 4,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  termTabActive: {
    backgroundColor: '#4D96FF',
    borderColor: '#4D96FF',
  },
  termText: {
    fontFamily: 'ComicSans',
    color: '#382E1C',
    fontSize: 14,
    flexShrink: 1,
  },
  termTextActive: {
    color: '#FFF',
  },
  weekBlock: {
    flex: 1,
    aspectRatio: 1,
    margin: 6,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 3 },
      android: { elevation: 3 },
    }),
  },
  weekBlockDone: { backgroundColor: '#00C896' },
  weekBlockCurrent: { backgroundColor: '#FFA726' },
  weekBlockTodo: { backgroundColor: '#EAEAEA' },
  weekNumber: {
    fontFamily: 'ComicSans',
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  starIcon: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10 },
      android: { elevation: 8 },
    }),
  },
  modalTitle: {
    fontFamily: 'ComicSans',
    fontSize: 22,
    color: '#382E1C',
    marginBottom: 16,
  },
  modalText: {
    fontFamily: 'ComicSans',
    fontSize: 16,
    color: '#555',
    marginVertical: 4,
  },
  modalCloseButton: {
    marginTop: 20,
    backgroundColor: '#4D96FF',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
  },
  modalCloseButtonText: {
    color: '#fff',
    fontFamily: 'ComicSans',
    fontSize: 16,
  },
});