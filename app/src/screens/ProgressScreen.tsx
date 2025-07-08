// app/src/screens/ProgressScreen.tsx

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  Dimensions,
  Modal,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useActiveProfile } from '../context/ActiveProfileContext';
import { RootStackParamList } from '../navigation/types';
import {
  getLastViewedWeek,
  getWeekSessionData,
  isWeekFullyComplete,
} from '../../utils/progress';

import FlinkDinkBackground from '../components/FlinkDinkBackground';
import HamburgerMenu from '../components/HamburgerMenu';

const TERM_COUNT = 4;
const WEEKS_PER_TERM = 10;
const TOTAL_WEEKS = TERM_COUNT * WEEKS_PER_TERM;

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProgressScreen() {
  const navigation = useNavigation<NavProp>();
  const isFocused = useIsFocused();
  const { activeProfile } = useActiveProfile();
  const { width } = Dimensions.get('window');

  const [menuVisible, setMenuVisible] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);
  
  // State for the details modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [weekData, setWeekData] = useState<Record<string, number>>({});

  const progressAnim = useRef(new Animated.Value(0)).current;
  
  // Determine which term is active based on the current week
  const activeTermIndex = Math.max(0, Math.ceil(currentWeek / WEEKS_PER_TERM) - 1);
  const [viewingTermIndex, setViewingTermIndex] = useState(activeTermIndex);

  async function loadProgress() {
    if (!activeProfile) return;
    const now = new Date();
    const start = new Date(activeProfile.startDate ?? now);
    const defaultWeek = Math.min(
      Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1,
      TOTAL_WEEKS,
    );
    const stored = await getLastViewedWeek(activeProfile.id);
    const initialWeek = stored ?? defaultWeek;
    setCurrentWeek(initialWeek);

    // Set the initial term view based on the current week
    const initialTermIndex = Math.max(0, Math.ceil(initialWeek / WEEKS_PER_TERM) - 1);
    setViewingTermIndex(initialTermIndex);

    const done: number[] = [];
    for (let w = 1; w <= TOTAL_WEEKS; w++) {
      const data = await getWeekSessionData(activeProfile.id, w);
      if (isWeekFullyComplete(data)) done.push(w);
    }
    setCompletedWeeks(done);

    // Animate the progress bar
    Animated.timing(progressAnim, {
      toValue: done.length / TOTAL_WEEKS,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }

  useEffect(() => {
    if (isFocused && activeProfile) {
      loadProgress();
    }
  }, [isFocused, activeProfile]);

  // Handler to open the details modal
  const handleWeekPress = async (week: number) => {
    if (!activeProfile) return;
    const data = await getWeekSessionData(activeProfile.id, week);
    setSelectedWeek(week);
    setWeekData(data);
    setModalVisible(true);
  };

  // Menu navigation actions
  const onSignOut = async () => {
    await signOut(auth);
    setMenuVisible(false);
  };
  
  const termWeeks = Array.from(
    { length: WEEKS_PER_TERM },
    (_, i) => viewingTermIndex * WEEKS_PER_TERM + i + 1,
  );

  return (
    <View style={styles.container}>
      <FlinkDinkBackground />
      <SafeAreaView style={styles.safeArea}>
        {/* Header Icons */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setMenuVisible(true)} style={styles.headerIcon}>
            <Ionicons name="menu" size={28} color="#382E1C" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.headerIcon}>
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
              <Text style={styles.title}>My Progress</Text>
              
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  {completedWeeks.length} / {TOTAL_WEEKS} Weeks Complete
                </Text>
                <View style={styles.progressBarBackground}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Term Tabs */}
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
                      Term {i + 1}
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

      {/* Details Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Week {selectedWeek} Details</Text>
            {Object.entries(weekData).map(([day, count]) => (
              <Text key={day} style={styles.modalText}>
                {day}: {count} session{count === 1 ? '' : 's'}
              </Text>
            ))}
            {Object.keys(weekData).length === 0 && (
              <Text style={styles.modalText}>No sessions recorded for this week.</Text>
            )}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Hamburger Menu */}
      <HamburgerMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSwitchProfile={() => {
          setMenuVisible(false);
          navigation.navigate('ProfileSelector');
        }}
        onMyAccount={() => {
          setMenuVisible(false);
          navigation.navigate('MyAccount');
        }}
        onSignOut={onSignOut}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  // Card Styles
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
  },
  // Progress Bar Styles
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
  // Term Tabs Styles
  termRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  termTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginHorizontal: 4,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  termTabActive: {
    backgroundColor: '#4D96FF',
    borderColor: '#4D96FF',
  },
  termText: {
    fontFamily: 'ComicSans',
    color: '#382E1C',
    fontSize: 14,
  },
  termTextActive: {
    color: '#FFF',
  },
  // Week Grid Styles
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
  // Modal Styles
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