// ProfileSelector.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Vibration,
  Alert,
  ActivityIndicator,
  Platform,
  RefreshControl,
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
import { useActiveProfile } from '../context/ActiveProfileContext';
import * as Animatable from 'react-native-animatable';



type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileSelectorScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { activeProfile, setActiveProfile } = useActiveProfile();



  const loadProfiles = async (showLoader = true) => {
    if (showLoader) setSyncing(true);

    const local = await getProfiles();
    console.log(`📦 Loaded ${local.length} profiles from AsyncStorage.`);
    setProfiles(local);

    const user = auth.currentUser;
    if (!user) {
      console.warn('❌ No authenticated user.');
      if (showLoader) setSyncing(false);
      return;
    }

    try {
      const cloudProfiles = await fetchAllChildProfiles(user.uid);
      console.log(`✅ Fetched ${cloudProfiles.length} profiles from Firestore.`);
    
      // 🩹 Patch missing startDate
      const patched = cloudProfiles.map((p) => {
        if (!p.startDate) {
          return {
            ...p,
            startDate: new Date(p.createdAt ?? Date.now()).toISOString(),
          };
        }
        return p;
      });
    
      setProfiles(patched);
      await saveProfiles(patched);
      console.log('💾 Updated AsyncStorage with latest profiles.');
    } catch (err) {
      console.warn('⚠️ Could not fetch from Firestore. Using cached data.');
      Toast.show({ type: 'info', text1: 'Offline mode', text2: 'Using saved profiles.' });
    }
     finally {
      if (showLoader) setSyncing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfiles(true);
    }, [])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfiles(false);
    setRefreshing(false);
  };

  const handleSelect = async (profileId: string) => {
    console.log(`👆 Selected profile: ${profileId}`);
    await AsyncStorage.setItem('activeProfileId', profileId);
    const selected = profiles.find((p) => p.id === profileId);
    if (selected) {
      setActiveProfile(selected);
    }
    navigation.navigate('Home');
  };
  

  const handleAdd = () => {
    //console.log('➕ Navigating to AddChild screen');
    navigation.navigate('AddChild', {});
  };

  const handleDelete = async (profile: ChildProfile) => {
    console.log(`🗑️ Deleting profile ${profile.name} (${profile.id})`);

    const user = auth.currentUser;
    if (!user) {
      Toast.show({ type: 'error', text1: 'Not logged in', text2: 'Please log in again.' });
      return;
    }

    const confirmDelete = async () => {
      try {
        const current = await AsyncStorage.getItem('activeProfileId');
        const updatedLocal = profiles.filter((p) => p.id !== profile.id);
        setProfiles(updatedLocal);
        await saveProfiles(updatedLocal);
        console.log('🧹 Removed from local cache.');

        if (current === profile.id) {
          await AsyncStorage.removeItem('activeProfileId');
          console.log('🧼 Cleared activeProfileId.');
        }

        await deleteDoc(doc(db, 'users', user.uid, 'children', profile.id));
        console.log('✅ Deleted from Firestore.');
        Toast.show({ type: 'success', text1: 'Profile deleted' });
      } catch (err) {
        console.error('❌ Failed to delete from Firestore.', err);
        Toast.show({ type: 'error', text1: 'Could not delete online. Local only.' });
      }
    };

    if (Platform.OS !== 'web') Vibration.vibrate(50);

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete ${profile.name}? This cannot be undone.`)) {
        await confirmDelete();
      }
    } else {
      Alert.alert(
        `Delete ${profile.name}?`,
        'This cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: confirmDelete },
        ]
      );
    }
  };

  const getAge = (birthday: string) => {
    try {
      return differenceInYears(new Date(), new Date(birthday));
    } catch {
      return '?';
    }
  };

  const pastelColors = ['#FFEDD5', '#DBEAFE', '#FEF9C3', '#DCFCE7'];

  const renderItem = ({ item, index }: { item: ChildProfile; index: number }) => {
    const isActive = activeProfile?.id === item.id;
  
    return (
      <Animatable.View
        animation="fadeInUp"
        duration={500}
        delay={index * 100}
        style={[
          styles.profileCard,
          { backgroundColor: pastelColors[index % pastelColors.length] },
          isActive && styles.activeCard,
        ]}
      >
        <TouchableOpacity style={styles.trash} onPress={() => handleDelete(item)}>
          <Ionicons name="trash-outline" size={22} color="#B91C1C" />
        </TouchableOpacity>
  
        <TouchableOpacity onPress={() => handleSelect(item.id)} style={styles.profileContent}>
          <Text style={styles.avatar}>{item.avatar}</Text>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.age}>{getAge(item.birthday)} years</Text>
          {isActive && <Text style={styles.activeLabel}>✓ Active</Text>}
        </TouchableOpacity>
  
        <TouchableOpacity
          style={styles.edit}
          onPress={() => navigation.navigate('AddChild', { profileToEdit: item })}
        >
          <Ionicons name="create-outline" size={22} color="#0F766E" />
        </TouchableOpacity>
      </Animatable.View>
    );
  };
  
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Child Profiles</Text>

      {syncing && (
        <View style={styles.syncingContainer}>
          <ActivityIndicator size="small" color="#382E1C" />
          <Text style={styles.syncingText}>Syncing profiles...</Text>
        </View>
      )}

    <FlatList
      data={profiles}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={[
        styles.grid,
        profiles.length === 0 && { flex: 1, justifyContent: 'center', alignItems: 'center' },
      ]}
      numColumns={2}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={['#382E1C']}
        />
      }
      ListEmptyComponent={
        !syncing ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No child profiles yet.</Text>
            <TouchableOpacity style={styles.emptyAddButton} onPress={handleAdd}>
              <Text style={styles.emptyAddText}>＋ Add your first child</Text>
            </TouchableOpacity>
          </View>
        ) : null
      }
      ListFooterComponent={
        profiles.length > 0 ? (
          <TouchableOpacity style={[styles.profileCard, styles.addCard]} onPress={handleAdd}>
            <Text style={styles.addText}>＋</Text>
            <Text style={styles.addLabel}>Add another child</Text>
          </TouchableOpacity>
        ) : null
      }
    />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF2',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontFamily: 'ComicSans',
    textAlign: 'center',
    color: '#382E1C',
    marginBottom: 10,
  },
  syncingContainer: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncingText: {
    fontFamily: 'ComicSans',
    color: '#382E1C',
    marginTop: 6,
  },
  grid: {
    paddingBottom: 60,
    gap: 20,
  },
  profileCard: {
    flex: 1,
    margin: 10,
    padding: 16,
    borderRadius: 20,
    minWidth: '40%',
    position: 'relative',
    backgroundColor: '#FFF',
  },
  profileContent: {
    alignItems: 'center',
  },
  trash: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  avatar: {
    fontSize: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    textAlign: 'center',
  },
  age: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'ComicSans',
    marginTop: 4,
  },
  addCard: {
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
addText: {
  fontSize: 36,
  color: '#382E1C',
  fontFamily: 'ComicSans',
},
  addLabel: {
    fontSize: 16,
    color: '#382E1C',
    fontFamily: 'ComicSans',
    marginTop: 8,
  },
  edit: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 1,
  },  

  emptyState: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: 'ComicSans',
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyAddButton: {
    backgroundColor: '#FBD278',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  emptyAddText: {
    fontSize: 16,
    fontFamily: 'ComicSans',
    color: '#382E1C',
  },
  activeCard: {
    borderWidth: 0,
    borderColor: '#22C55E',
  },
  
  activeLabel: {
    marginTop: 6,
    fontSize: 12,
    color: '#555',
    fontFamily: 'ComicSans',
  },
  
  
});

