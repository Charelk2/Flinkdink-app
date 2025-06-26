import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { auth } from '../../config/firebase';
import { uploadChildProfile } from '../../utils/firebaseSync';
import { getProfiles, saveProfiles } from '../../utils/storage';
import uuid from 'react-native-uuid';

import { RootStackParamList } from '../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddChild'>;

const avatarOptions = ['🧒', '👧', '🐸', '🐵', '😍'];

export default function AddChildScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [avatarIndex, setAvatarIndex] = useState(0);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const newChild = {
      id: uuid.v4() as string,
      name: trimmed,
      birthday: birthday.toISOString(),
      avatar: avatarOptions[avatarIndex],
      createdAt: Date.now(),
    };

    const existing = await getProfiles();
    await saveProfiles([...existing, newChild]);

    const user = auth.currentUser;
    if (user) {
      try {
        await uploadChildProfile(user.uid, newChild);
      } catch (e) {
        console.warn('Failed to sync profile to cloud:', e);
      }
    }

    navigation.navigate('ProfileSelector');
  };

  const handleAvatarChange = (dir: 'left' | 'right') => {
    setAvatarIndex((prev) =>
      dir === 'left'
        ? (prev - 1 + avatarOptions.length) % avatarOptions.length
        : (prev + 1) % avatarOptions.length
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate('ProfileSelector');
          }
        }}
      >
        <Ionicons name="arrow-back" size={28} color="#382E1C" />
      </TouchableOpacity>

      <Text style={styles.title}>Add Child</Text>

      <Text style={styles.label}>Child’s name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter name"
        placeholderTextColor="#999"
        style={styles.input}
      />

      <Text style={styles.label}>Birthday</Text>
      {Platform.OS === 'web' ? (
        <View style={[styles.input, { padding: 0 }]}>
          <input
            type="date"
            value={birthday.toISOString().split('T')[0]}
            onChange={(e) => {
              const parsed = new Date(e.target.value);
              if (!isNaN(parsed.getTime())) setBirthday(parsed);
            }}
            style={{
              fontSize: 16,
              fontFamily: 'ComicSans',
              color: '#382E1C',
              padding: 12,
              border: 'none',
              backgroundColor: 'transparent',
              borderRadius: 10,
            }}
          />
        </View>
      ) : (
        <>
          <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
            <Text style={styles.dateText}>{birthday.toDateString()}</Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              mode="date"
              value={birthday}
              display="spinner"
              maximumDate={new Date()}
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) {
                  setBirthday(selectedDate);
                }
              }}
            />
          )}
        </>
      )}

      <Text style={styles.label}>Emoji avatar</Text>
      <View style={styles.avatarRow}>
        <TouchableOpacity onPress={() => handleAvatarChange('left')}>
          <Text style={styles.navArrow}>←</Text>
        </TouchableOpacity>

        <Text style={styles.avatar}>{avatarOptions[avatarIndex]}</Text>

        <TouchableOpacity onPress={() => handleAvatarChange('right')}>
          <Text style={styles.navArrow}>→</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF2', padding: 24, justifyContent: 'center' },
  title: {
    fontSize: 36,
    fontFamily: 'ComicSans',
    textAlign: 'center',
    color: '#382E1C',
    marginBottom: 30,
  },
  label: {
    fontSize: 18,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFF8E7',
    borderWidth: 2,
    borderColor: '#D6B98C',
    padding: 12,
    borderRadius: 10,
    fontFamily: 'ComicSans',
    marginBottom: 20,
  },
  dateText: {
    fontFamily: 'ComicSans',
    fontSize: 16,
    color: '#382E1C',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  avatar: {
    fontSize: 64,
    marginHorizontal: 20,
  },
  navArrow: {
    fontSize: 32,
    color: '#382E1C',
    fontFamily: 'ComicSans',
  },
  button: {
    backgroundColor: '#FBD278',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    fontSize: 20,
    color: '#382E1C',
    fontFamily: 'ComicSans',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
});
