//app/src/screens/ProfileSelector.tsx

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Vibration,
  ActivityIndicator,
  Platform,
  RefreshControl,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInYears } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChildProfile } from '../../src/models/types';
import { RootStackParamList } from '../navigation/types';
import { getProfiles, saveProfiles } from '../../utils/storage';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { fetchAllChildProfiles } from '../../utils/firebaseSync';
import * as Animatable from 'react-native-animatable';
import { useActiveProfile } from '../../src/context/ActiveProfileContext';
import FlinkDinkBackground from '../components/FlinkDinkBackground';
import i18n from '../i18n'; // ✅ 1. IMPORT i18n

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProfileSelector'>;

export default function ProfileSelectorScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { activeProfile, setActiveProfile } = useActiveProfile();
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [syncing, setSyncing] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState<ChildProfile | null>(null);

  const loadProfiles = async (showLoader = true) => {
    if (showLoader) setSyncing(true);
    const local = await getProfiles();
    setProfiles(local);

    const user = auth.currentUser;
    if (!user) {
      if (showLoader) setSyncing(false);
      return;
    }

    try {
      const cloud = await fetchAllChildProfiles(user.uid);
      const patched = cloud.map(p => ({
        ...p,
        startDate: p.startDate || new Date(p.createdAt ?? Date.now()).toISOString(),
      }));
      setProfiles(patched);
      await saveProfiles(patched);
    } catch {
      Toast.show({ type: 'info', text1: 'Offline mode', text2: 'Using saved profiles.' });
    } finally {
      if (showLoader) setSyncing(false);
    }
  };

  useFocusEffect(useCallback(() => { loadProfiles(true); }, []));

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfiles(false);
    setRefreshing(false);
  };

  const handleSelect = async (profile: ChildProfile) => {
    await AsyncStorage.setItem('activeProfileId', profile.id);
    setActiveProfile(profile);
    navigation.navigate('Home');
  };

  const handleAdd = () => navigation.navigate('AddChild', {});

  const handleDelete = (profile: ChildProfile) => {
    if (Platform.OS !== 'web') Vibration.vibrate(50);
    setDeleting(profile);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const profileToDelete = deleting;
    setDeleting(null);

    try {
      const updated = profiles.filter(p => p.id !== profileToDelete.id);
      setProfiles(updated);
      await saveProfiles(updated);

      if (activeProfile?.id === profileToDelete.id) {
        await AsyncStorage.removeItem('activeProfileId');
        setActiveProfile(null);
      }

      await deleteDoc(doc(db, 'users', auth.currentUser!.uid, 'children', profileToDelete.id));
      Toast.show({ type: 'success', text1: 'Profile deleted' });
    } catch (e) {
      Toast.show({ type: 'error', text1: 'Delete failed', text2: 'Local cache updated.' });
    }
  };

  const cancelDelete = () => setDeleting(null);

  const getAge = (b: string) => {
    try { return differenceInYears(new Date(), new Date(b)); }
    catch { return '?'; }
  };

  const pastel = ['#FFC2B2', '#DBEAFE', '#FFF6A5', '#C3EDC0'];
  const renderItem = ({ item, index }: { item: ChildProfile; index: number }) => {
    const isActive = item.id === activeProfile?.id;
    return (
      <Animatable.View
        animation="fadeInUp"
        duration={500}
        delay={index * 100}
        style={[
          styles.card,
          { borderTopColor: pastel[index % pastel.length] },
          isActive && styles.activeCard,
        ]}
      >
        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={22} color="#EF4444" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleSelect(item)} style={styles.content}>
          <Text style={styles.avatar}>{item.avatar}</Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.age}>{`${getAge(item.birthday)} ${i18n.t('yearsOld')}`}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('AddChild', { profileToEdit: item })}
        >
          <Ionicons name="create-outline" size={22} color="#0F766E" />
        </TouchableOpacity>
      </Animatable.View>
    );
  };

  return (
    <View style={styles.container}>
      <FlinkDinkBackground />
      <SafeAreaView style={styles.safeArea}>
        <Text style={styles.title}>{i18n.t('whosLearningToday')}</Text>

        {syncing && !refreshing && (
          <View style={styles.syncing}>
            <ActivityIndicator size="small" color="#382E1C" />
            <Text style={styles.syncText}>{i18n.t('syncingProfiles')}</Text>
          </View>
        )}

        <FlatList
          data={profiles}
          keyExtractor={p => p.id}
          renderItem={renderItem}
          numColumns={2}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#382E1C" />
          }
          contentContainerStyle={[styles.grid, profiles.length === 0 && styles.emptyContainer]}
          ListEmptyComponent={
            !syncing ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>{i18n.t('noProfilesFound')}</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={handleAdd}>
                  <Text style={styles.emptyBtnText}>{i18n.t('addFirstChild')}</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />

        {profiles.length > 0 && (
          <TouchableOpacity style={styles.fab} onPress={handleAdd}>
            <Ionicons name="add" size={32} color="#fff" />
          </TouchableOpacity>
        )}
      </SafeAreaView>

      <Modal
        visible={!!deleting}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{i18n.t('deleteProfileTitle')}</Text>
            <Text style={styles.modalText}>
              {i18n.t('deleteProfileConfirmation', { profileName: deleting?.name })}
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={cancelDelete} style={[styles.btn, styles.btnCancel]}>
                <Text style={styles.btnText}>{i18n.t('cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDelete} style={[styles.btn, styles.btnDelete]}>
                <Text style={[styles.btnText, styles.btnTextDelete]}>{i18n.t('delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  title: {
    fontSize: 32,
    fontFamily: 'ComicSans',
    textAlign: 'center',
    color: '#382E1C',
    marginVertical: 20,
  },
  syncing: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  syncText: {
    fontFamily: 'ComicSans',
    color: '#382E1C',
    marginLeft: 8,
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Make space for FAB
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'ComicSans',
    color: '#555',
    marginBottom: 24,
  },
  emptyBtn: {
    backgroundColor: '#FF9B1C',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  emptyBtnText: {
    fontSize: 16,
    fontFamily: 'ComicSans',
    color: '#FFF',
    fontWeight: 'bold',
  },
  card: {
    flex: 1,
    margin: 8,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderTopWidth: 8,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10 },
      android: { elevation: 6 },
    }),
  },
  deleteButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 8,
    zIndex: 1,
  },
  editButton: {
    position: 'absolute',
    top: 4,
    left: 4,
    padding: 8,
    zIndex: 1,
  },
  content: {
    alignItems: 'center',
    padding: 16,
    paddingTop: 8,
  },
  avatar: {
    fontSize: 72,
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontFamily: 'ComicSans',
    fontWeight: 'bold',
    color: '#382E1C',
    textAlign: 'center',
  },
  age: {
    fontSize: 14,
    fontFamily: 'ComicSans',
    color: '#666',
    marginTop: 4,
  },
  activeCard: {
    borderWidth: 3,
    borderColor: '#38B000',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4D96FF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 5 },
      android: { elevation: 8 },
    }),
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    backgroundColor: '#FFF',
    padding: 24,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'ComicSans',
    fontWeight: 'bold',
    color: '#382E1C',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif'}),
    color: '#555',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalBtns: {
    flexDirection: 'row',
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    marginHorizontal: 8,
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: '#F3F4F6',
  },
  btnText: {
    fontSize: 16,
    fontFamily: 'ComicSans',
    fontWeight: 'bold',
    color: '#382E1C',
  },
  btnDelete: {
    backgroundColor: '#EF4444',
  },
  btnTextDelete: {
    color: '#FFF',
  },
});