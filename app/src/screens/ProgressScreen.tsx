import React, { useState, useEffect, useRef, useCallback, useContext } from 'react'; // Added useCallback, useContext
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
  ActivityIndicator, // Added ActivityIndicator for loading state
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native'; // Changed useIsFocused to useFocusEffect
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { ActiveProfileContext } from '../context/ActiveProfileContext'; // Use ActiveProfileContext
import { RootStackParamList } from '../navigation/types';
import {
  getLastViewedWeek,
  getWeekSessionData,
  isWeekFullyComplete,
} from '../../utils/progress';

import FlinkDinkBackground from '../components/FlinkDinkBackground';
import HamburgerMenu from '../components/HamburgerMenu';
import i18n from '../i18n';
const { width } = Dimensions.get('window');

const TERM_COUNT = 4;
const WEEKS_PER_TERM = 10;
const TOTAL_WEEKS = TERM_COUNT * WEEKS_PER_TERM;

type NavProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProgressScreen() {
  const navigation = useNavigation<NavProp>();
  const { activeProfile } = useContext(ActiveProfileContext); // Use useContext to get activeProfile
  const { width } = Dimensions.get('window');

  const [menuVisible, setMenuVisible] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);
  const [loading, setLoading] = useState(true); // Added loading state
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [weekData, setWeekData] = useState<Record<string, number>>({});

  const progressAnim = useRef(new Animated.Value(0)).current;
  
  const activeTermIndex = Math.max(0, Math.ceil(currentWeek / WEEKS_PER_TERM) - 1);
  const [viewingTermIndex, setViewingTermIndex] = useState(activeTermIndex);

  // Memoize loadProgress to prevent unnecessary re-creations
  const loadProgress = useCallback(async () => {
    if (!activeProfile) {
      setLoading(false); // Stop loading if no profile
      return;
    }
    setLoading(true); // Start loading
    const now = new Date();
    const start = new Date(activeProfile.startDate ?? now);
    const defaultWeek = Math.min(
      Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 7)) + 1,
      TOTAL_WEEKS,
    );
    const stored = await getLastViewedWeek(activeProfile.id);
    const initialWeek = stored ?? defaultWeek;
    setCurrentWeek(initialWeek);

    const initialTermIndex = Math.max(0, Math.ceil(initialWeek / WEEKS_PER_TERM) - 1);
    setViewingTermIndex(initialTermIndex);

    const done: number[] = [];
    for (let w = 1; w <= TOTAL_WEEKS; w++) {
      const data = await getWeekSessionData(activeProfile.id, w);
      if (isWeekFullyComplete(data)) {
        done.push(w);
      }
    }
    setCompletedWeeks(done);

    Animated.timing(progressAnim, {
      toValue: done.length / TOTAL_WEEKS,
      duration: 500,
      useNativeDriver: false,
    }).start();
    setLoading(false); // End loading
  }, [activeProfile, progressAnim]); // Depend on activeProfile and progressAnim

  // Use useFocusEffect to ensure data is fresh when the screen is focused
  useFocusEffect(
    useCallback(() => {
      loadProgress();
      // Optional: Clean up function if you had event listeners
      return () => {};
    }, [loadProgress]) // Depend on loadProgress (which depends on activeProfile)
  );

  const handleWeekPress = async (week: number) => {
    if (!activeProfile) return;
    const data = await getWeekSessionData(activeProfile.id, week);
    setSelectedWeek(week);
    setWeekData(data);
    setModalVisible(true);
  };

  const onSignOut = async () => {
    await signOut(auth);
    setMenuVisible(false);
  };
  
  const termWeeks = Array.from(
    { length: WEEKS_PER_TERM },
    (_, i) => viewingTermIndex * WEEKS_PER_TERM + i + 1,
  );

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
              <View style={styles.centeredRow}>
                <Text
                  style={styles.title}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {i18n.t('myProgressTitle')}
                </Text>
              </View>
              
              <View style={styles.progressContainer}>
                <Text style={styles.progressText}>
                  {i18n.t('weeksCompleteProgress', { completed: completedWeeks.length, total: TOTAL_WEEKS })}
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
        onRequestClose={() => setModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{i18n.t('weekDetailsTitle', { week: selectedWeek })}</Text>
            {Object.entries(weekData).map(([day, count]) => (
              <Text key={day} style={styles.modalText}>
                {i18n.t(count === 1 ? 'sessionsCount' : 'sessionsCountPlural', { day: day, count: count })}
              </Text>
            ))}
            {Object.keys(weekData).length === 0 && (
              <Text style={styles.modalText}>{i18n.t('noSessionsRecorded')}</Text>
            )}
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCloseButtonText}>{i18n.t('closeButton')}</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

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
        switchProfileText={i18n.t('switchProfile')}
        myAccountText={i18n.t('myAccount')}
        signOutText={i18n.t('signOut')}
      />
    </View>
  );
}

// Styles remain the same
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
    fontSize: width < 350 ? 12 : 14,
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