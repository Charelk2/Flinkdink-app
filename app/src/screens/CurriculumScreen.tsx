import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '../../config/firebase';

import { RootStackParamList } from '../navigation/types';
import FlinkDinkBackground from '../components/FlinkDinkBackground';
import HamburgerMenu from '../components/HamburgerMenu';
import i18n from '../i18n';

// --- CONFIGURATION ---
const NUM_COLUMNS = 2;
const categories = ['Encyclopedia', 'Math', 'Language'] as const;
type Category = (typeof categories)[number];
const terms = [1, 2, 3, 4] as const;

const categoryColors: Record<Category, string> = {
  Encyclopedia: '#F4C542',
  Math: '#4D96FF',
  Language: '#FF6B6B',
};

export default function CurriculumScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>('Encyclopedia');
  const [activeTerm, setActiveTerm] = useState<number>(1);

  // -- i18n ONLY! No static fallback
  const getWeeksData = () => {
    const weekSubtitles = i18n.t(`curriculumData.${activeCategory}.${activeTerm}`, { returnObjects: true });
    console.log('[i18n]', weekSubtitles);
    if (Array.isArray(weekSubtitles) && weekSubtitles.length === 10) {
      return weekSubtitles.map((subtitle, index) => ({
        id: index + 1,
        subtitle: subtitle,
      }));
    }
    return [];
  };

  const weeks = getWeeksData();

  const onSignOut = async () => {
    await firebaseSignOut(auth);
    setMenuVisible(false);
  };

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
          data={weeks}
          keyExtractor={w => `${activeCategory}-${activeTerm}-${w.id}`}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.listContentContainer}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.card}>
              <Text style={styles.title}>{i18n.t('curriculumOutlineTitle')}</Text>
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
                      {i18n.t(cat.toLowerCase() as any)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
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
              <Text style={styles.termTitle}>{i18n.t('termTitle', { term: activeTerm })}</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.weekCard}>
              <View style={[ styles.weekCardHeader, { backgroundColor: categoryColors[activeCategory] } ]}>
                <Text style={styles.weekCardHeaderText}>{i18n.t('weekTitle', { week: item.id })}</Text>
              </View>
              <View style={styles.weekCardBody}>
                <Text style={styles.weekCardSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{i18n.t('noCurriculum')}</Text>
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
        switchProfileText={i18n.t('switchProfile')}
        myAccountText={i18n.t('myAccount')}
        signOutText={i18n.t('signOut')}
      />
    </View>
  );
}

// ...styles stay the same as before!


// Styles...
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