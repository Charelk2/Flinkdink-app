// app/src/screens/CurriculumScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signOut as firebaseSignOut } from 'firebase/auth'; // Renamed to avoid conflict
import { auth } from '../../config/firebase';

import { RootStackParamList } from '../navigation/types';
import FlinkDinkBackground from '../components/FlinkDinkBackground';
import HamburgerMenu from '../components/HamburgerMenu';

// --- DATA AND CONFIGURATION ---

const NUM_COLUMNS = 2;
const categories = ['Encyclopedia', 'Math', 'Language'] as const;
type Category = (typeof categories)[number];
const terms = [1, 2, 3, 4] as const;

const categoryColors: Record<Category, string> = {
  Encyclopedia: '#F4C542',
  Math: '#4D96FF',
  Language: '#FF6B6B',
};

const weeksData: Record<Category, Record<number, { id: number; subtitle: string }[]>> = {
  Encyclopedia: {
    1: [
      { id: 1, subtitle: 'Honde' }, { id: 2, subtitle: 'Instrumente' }, { id: 3, subtitle: 'Voëls' },
      { id: 4, subtitle: 'Bou-Implemente' }, { id: 5, subtitle: 'Insekte' }, { id: 6, subtitle: 'Blomme' },
      { id: 7, subtitle: 'Kontinente' }, { id: 8, subtitle: 'Anatomie' }, { id: 9, subtitle: 'Tegnologie' },
      { id: 10, subtitle: 'Dinosourusse' },
    ],
    2: [
      { id: 1, subtitle: 'Honde - feit 1' }, { id: 2, subtitle: 'Instrumente - feit 1' }, { id: 3, subtitle: 'Voëls - feit 1' },
      { id: 4, subtitle: 'Bou-Implemente - feit 1' }, { id: 5, subtitle: 'Insekte - feit 1' }, { id: 6, subtitle: 'Blomme - feit 1' },
      { id: 7, subtitle: 'Kontinente - feit 1' }, { id: 8, subtitle: 'Anatomie - feit 1' }, { id: 9, subtitle: 'Tegnologie - feit 1' },
      { id: 10, subtitle: 'Dinosourusse - feit 1' },
    ],
    3: [
      { id: 1, subtitle: 'Honde - feit 2' }, { id: 2, subtitle: 'Instrumente - feit 2' }, { id: 3, subtitle: 'Voëls - feit 2' },
      { id: 4, subtitle: 'Bou-Implemente - feit 2' }, { id: 5, subtitle: 'Insekte - feit 2' }, { id: 6, subtitle: 'Blomme - feit 2' },
      { id: 7, subtitle: 'Kontinente - feit 2' }, { id: 8, subtitle: 'Anatomie - feit 2' }, { id: 9, subtitle: 'Tegnologie - feit 2' },
      { id: 10, subtitle: 'Dinosourusse - feit 2' },
    ],
    4: [
      { id: 1, subtitle: 'Honde - feit 3' }, { id: 2, subtitle: 'Instrumente - feit 3' }, { id: 3, subtitle: 'Voëls - feit 3' },
      { id: 4, subtitle: 'Bou-Implemente - feit 3' }, { id: 5, subtitle: 'Insekte - feit 3' }, { id: 6, subtitle: 'Blomme - feit 3' },
      { id: 7, subtitle: 'Kontinente - feit 3' }, { id: 8, subtitle: 'Anatomie - feit 3' }, { id: 9, subtitle: 'Tegnologie - feit 3' },
      { id: 10, subtitle: 'Dinosourusse - feit 3' },
    ],
  },
  Math: {
    1: [
      { id: 1, subtitle: 'Counting 1–5' }, { id: 2, subtitle: 'Counting 1–10' }, { id: 3, subtitle: 'Counting 5–15' },
      { id: 4, subtitle: 'Counting 10–20' }, { id: 5, subtitle: 'Counting 15–25' }, { id: 6, subtitle: 'Counting 20–30' },
      { id: 7, subtitle: 'Counting 25–35' }, { id: 8, subtitle: 'Counting 30–40' }, { id: 9, subtitle: 'Counting 35–45' },
      { id: 10, subtitle: 'Counting 40–50' },
    ],
    2: Array.from({ length: 10 }, (_, i) => ({ id: i + 1, subtitle: i < 6 ? 'Optel' : 'Aftrek' })),
    3: [
      { id: 1, subtitle: 'Optel & Aftrek' }, { id: 2, subtitle: 'Optel & Aftrek' }, { id: 3, subtitle: 'Maaltafels' },
      { id: 4, subtitle: 'Maaltafels' }, { id: 5, subtitle: 'Maaltafels' }, { id: 6, subtitle: 'Deeltafels' },
      { id: 7, subtitle: 'Deeltafels' }, { id: 8, subtitle: 'Deeltafels' }, { id: 9, subtitle: 'Deeltafels' },
      { id: 10, subtitle: 'Tel Oefeninge' },
    ],
    4: [
      { id: 1, subtitle: 'Tel Oefeninge' }, { id: 2, subtitle: 'Optel & Aftrek' }, { id: 3, subtitle: 'Tel Oefeninge' },
      { id: 4, subtitle: 'Tel Oefeninge' }, { id: 5, subtitle: 'Tel Oefeninge' }, { id: 6, subtitle: 'Tel Oefeninge' },
      { id: 7, subtitle: 'Optel en Aftrek' }, { id: 8, subtitle: 'Maal & Deel' }, { id: 9, subtitle: 'Maal & Deel' },
      { id: 10, subtitle: 'Maal & Deel' },
    ],
  },
  Language: Array.from({ length: 4 }, () =>
    Array.from({ length: 10 }, (_, i) => ({ id: i + 1, subtitle: 'Taal Ontwikkeling' }))
  ).reduce((acc, arr, idx) => ({ ...acc, [idx + 1]: arr }), {} as Record<number, { id: number; subtitle: string }[]>),
};


export default function CurriculumScreen() {
  const { width } = useWindowDimensions();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [menuVisible, setMenuVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>('Encyclopedia');
  const [activeTerm, setActiveTerm] = useState<number>(1);

  const weeks = weeksData[activeCategory][activeTerm] || [];
  
  // Dummy completion logic for visual checkmarks
  const completedWeeks = weeks.filter(w => w.id < 3).map(w => w.id);

  const onSignOut = async () => {
    await firebaseSignOut(auth);
    setMenuVisible(false);
  };

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
          data={weeks}
          keyExtractor={w => `${activeCategory}-${activeTerm}-${w.id}`}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.card}>
              <Text style={styles.title}>Curriculum Outline</Text>

              {/* Category Filter */}
              <View style={styles.filterGroup}>
                {categories.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryTab,
                      activeCategory === cat && { backgroundColor: categoryColors[cat] },
                    ]}
                    onPress={() => setActiveCategory(cat)}>
                    <Text style={[ styles.categoryText, activeCategory === cat && styles.categoryTextActive ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Term Filter */}
              <View style={styles.filterGroup}>
                {terms.map(t => (
                  <TouchableOpacity
                    key={t}
                    style={[ styles.termTab, activeTerm === t && { backgroundColor: '#777' } ]}
                    onPress={() => setActiveTerm(t)}>
                    <Text style={[ styles.termText, activeTerm === t && styles.termTextActive ]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* ADDED: Dynamic Term Title */}
              <Text style={styles.termTitle}>Term {activeTerm}</Text>

            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.weekCard}>
              <View style={[ styles.weekCardHeader, { backgroundColor: categoryColors[activeCategory] } ]}>
                <Text style={styles.weekCardHeaderText}>Week {item.id}</Text>
              </View>
              <View style={styles.weekCardBody}>
                <Text style={styles.weekCardSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No curriculum defined for this section.</Text>
            </View>
          }
        />
      </SafeAreaView>

      <HamburgerMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onSwitchProfile={() => { setMenuVisible(false); navigation.navigate('ProfileSelector'); }}
        onMyAccount={() => { setMenuVisible(false); navigation.navigate('MyAccount'); }}
        onSignOut={onSignOut}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  // Main Card Styles
  card: {
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
  // Filter Styles
  filterGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 16,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 2 },
      android: { elevation: 3 },
    }),
  },
  categoryText: {
    textAlign: 'center',
    fontFamily: 'ComicSans',
    fontSize: 14,
    color: '#382E1C',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#fff',
  },
  termTab: {
    width: 50,
    height: 30,
    marginHorizontal: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  termText: {
    fontFamily: 'ComicSans',
    color: '#555',
    fontWeight: '600',
  },
  termTextActive: {
    color: '#fff',
  },
  // ADDED: Style for the new term title
  termTitle: {
    fontSize: 22,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    fontWeight: 'normal',
    textAlign: 'center',
    marginTop: 1,
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
    paddingTop: 1,
  },
  // Week Card Styles
  weekCard: {
    flex: 1 / NUM_COLUMNS,
    margin: 6,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden', // Ensures header corners are rounded
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  weekCardHeader: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weekCardHeaderText: {
    color: '#fff',
    fontFamily: 'ComicSans',
    fontSize: 16,
    fontWeight: 'bold',
  },
  weekCardBody: {
    padding: 12,
    minHeight: 60, // Ensures cards have a consistent height
  },
  weekCardSubtitle: {
    fontFamily: 'ComicSans',
    color: '#444',
    fontSize: 14,
  },
  // Empty State Styles
  emptyState: {
      padding: 24,
      alignItems: 'center',
  },
  emptyText: {
      fontSize: 16,
      fontFamily: 'ComicSans',
      color: '#666',
  },
});