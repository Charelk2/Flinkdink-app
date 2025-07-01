// app/src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useActiveProfile } from '../context/ActiveProfileContext';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import HamburgerMenu from '../components/HamburgerMenu';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getCompletedWeeks } from '../../utils/progress';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { activeProfile } = useActiveProfile();
  const [menuVisible, setMenuVisible] = useState(false);
  const [completedWeeks, setCompletedWeeks] = useState<number[]>([]);

  const today = format(new Date(), 'EEEE, MMMM d');

  useEffect(() => {
    const loadProgress = async () => {
      if (activeProfile) {
        const weeks = await getCompletedWeeks(activeProfile.id);
        setCompletedWeeks(weeks);
      }
    };
    loadProgress();
  }, [activeProfile]);

  const handleSessionStart = () => navigation.navigate('Session');
  const handleViewProgress = () => navigation.navigate('Progress');
  const handleCurriculum = () => navigation.navigate('Curriculum');

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
        {/* Hamburger */}
        <TouchableOpacity style={styles.menuIcon} onPress={handleMenu}>
          <Ionicons name="menu" size={28} color="#382E1C" />
        </TouchableOpacity>

        {/* Greeting */}
        <Text style={styles.greeting}>
          Hi {activeProfile?.name} {activeProfile?.avatar}
        </Text>
        <Text style={styles.date}>{today}</Text>

        {/* Buttons */}
        <TouchableOpacity style={[styles.button, styles.teal]} onPress={handleSessionStart}>
          <Ionicons name="play" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Start Today’s Session</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.yellow]} onPress={handleViewProgress}>
          <Ionicons name="calendar" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>View Progress</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.red]} onPress={handleCurriculum}>
          <Ionicons name="book" size={24} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Curriculum Outline</Text>
        </TouchableOpacity>

        {/* Progress Grid */}
        <Text style={styles.sectionTitle}>40-Week Progress</Text>
        <View style={styles.grid}>
          {Array.from({ length: 40 }).map((_, i) => {
            const weekNum = i + 1;
            const isDone = completedWeeks.includes(weekNum);
            return (
              <View
                key={weekNum}
                style={[styles.gridBlock, isDone ? styles.done : styles.todo]}
              />
            );
          })}
        </View>
      </ScrollView>

      {/* Hamburger Menu Modal */}
      <HamburgerMenu
        visible={menuVisible}
        onClose={handleCloseMenu}
        onSwitchProfile={handleSwitchProfile}
        onMyAccount={handleMyAccount}
        onSignOut={handleSignOut}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF2' },
  content: { padding: 24, paddingTop: 60 },
  menuIcon: { position: 'absolute', top: 30, left: 20, zIndex: 10 },
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
    marginBottom: 30,
    textAlign: 'center',
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
  todo: { backgroundColor: '#D6D6D6' },
});
