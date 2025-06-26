import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Vibration,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInYears } from 'date-fns';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChildProfile } from '../../src/models/types';
import { RootStackParamList } from '../navigation/types';
import { getProfiles } from '../../utils/storage';
import { doc, deleteDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

export default function ProfileSelectorScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);

  useEffect(() => {
    const load = async () => {
      const saved = await getProfiles();
      setProfiles(saved);
    };
    load();
  }, []);

  const handleSelect = async (profileId: string) => {
    await AsyncStorage.setItem('activeProfileId', profileId);
    navigation.navigate('Home');
  };

  const handleAdd = () => {
    navigation.navigate('AddChild');
  };

  const handleDelete = async (profile: ChildProfile) => {
    const user = auth.currentUser;
    if (!user) {
      Toast.show({
        type: 'error',
        text1: 'Not logged in',
        text2: 'Please log in again.',
      });
      return;
    }

    const confirmDelete = async () => {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'children', profile.id));
        setProfiles((prev) => prev.filter((p) => p.id !== profile.id));

        const current = await AsyncStorage.getItem('activeProfileId');
        if (current === profile.id) {
          await AsyncStorage.removeItem('activeProfileId');
        }

        Toast.show({
          type: 'success',
          text1: 'Profile deleted',
        });
      } catch (err) {
        console.error('Failed to delete profile:', err);
        Toast.show({
          type: 'error',
          text1: 'Could not delete profile',
        });
      }
    };

    // Trigger vibration
    if (Platform.OS !== 'web') {
      Vibration.vibrate(50);
    }

    // Confirm dialog
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

  const renderItem = ({ item, index }: { item: ChildProfile; index: number }) => (
    <View style={[styles.profileCard, { backgroundColor: pastelColors[index % pastelColors.length] }]}>
      <TouchableOpacity style={styles.trash} onPress={() => handleDelete(item)}>
        <Ionicons name="trash-outline" size={22} color="#B91C1C" />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => handleSelect(item.id)} style={styles.profileContent}>
        <Text style={styles.avatar}>{item.avatar}</Text>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.age}>{getAge(item.birthday)} years</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Child Profiles</Text>

      <FlatList
        data={profiles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.grid}
        numColumns={2}
        ListFooterComponent={
          <TouchableOpacity style={[styles.profileCard, styles.addCard]} onPress={handleAdd}>
            <Text style={styles.addText}>＋</Text>
            <Text style={styles.addLabel}>Add another child</Text>
          </TouchableOpacity>
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
    marginBottom: 20,
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
});
