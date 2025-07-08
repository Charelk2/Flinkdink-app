// app/src/screens/AddChildScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Animatable from 'react-native-animatable';

import { auth } from '../../config/firebase';
import { uploadChildProfile } from '../../utils/firebaseSync';
import { getProfiles, saveProfiles } from '../../utils/storage';
import uuid from 'react-native-uuid';

import { RootStackParamList } from '../navigation/types';
import { ChildProfile } from '../../src/models/types';
import FlinkDinkBackground from '../components/FlinkDinkBackground';
import i18n from '../i18n'; // ✅ 1. IMPORT i18n

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddChild'>;
type RouteProps = RouteProp<RootStackParamList, 'AddChild'>;

const avatarOptions = ['🧒', '👧', '🐸', '🐵', '😍', '🤖', '🦄', '🦁'];

// Define a separate style object for the web input
const webDatePickerStyle: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E5E7EB',
  padding: '14px',
  borderRadius: '12px',
  fontSize: '16px',
  marginBottom: '24px',
  width: 'calc(100% - 30px)', // Adjust for padding
  fontFamily: 'ComicSans', // Ensure font consistency
  color: '#1F2937',
};

export default function AddChildScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const profileToEdit = route.params?.profileToEdit;

  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [avatarIndex, setAvatarIndex] = useState(0);

  const avatarRef = useRef<Animatable.View & View>(null);

  useEffect(() => {
    if (profileToEdit) {
      setName(profileToEdit.name);
      setBirthday(new Date(profileToEdit.birthday));
      const index = avatarOptions.findIndex(a => a === profileToEdit.avatar);
      if (index !== -1) setAvatarIndex(index);
    }
  }, [profileToEdit]);

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    const now = new Date();
    const updatedChild: ChildProfile = {
      id: profileToEdit?.id ?? (uuid.v4() as string),
      name: trimmed,
      birthday: birthday.toISOString(),
      avatar: avatarOptions[avatarIndex],
      createdAt: profileToEdit?.createdAt ?? Date.now(),
      startDate: profileToEdit?.startDate ?? now.toISOString(),
    };

    const existing = await getProfiles();
    const updatedList = profileToEdit
      ? existing.map(p => (p.id === updatedChild.id ? updatedChild : p))
      : [...existing, updatedChild];

    await saveProfiles(updatedList);

    const user = auth.currentUser;
    if (user) {
      try {
        await uploadChildProfile(user.uid, updatedChild);
      } catch (e) {
        console.warn('Failed to sync profile to cloud:', e);
      }
    }

    navigation.navigate('ProfileSelector');
  };

  const handleAvatarChange = (dir: 'left' | 'right') => {
    setAvatarIndex(prev =>
      dir === 'left'
        ? (prev - 1 + avatarOptions.length) % avatarOptions.length
        : (prev + 1) % avatarOptions.length,
    );
    // This is a bulletproof check that satisfies TypeScript
    if (avatarRef.current && typeof (avatarRef.current as any).pulse === 'function') {
      (avatarRef.current as any).pulse(800);
    }
  };

  return (
    <View style={styles.rootContainer}>
      <FlinkDinkBackground />
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('ProfileSelector')}
        >
          <Ionicons name="arrow-back" size={28} color="#382E1C" />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <Animatable.View animation="fadeInUp" duration={600} style={styles.card}>
              <Text style={styles.title}>
                {profileToEdit ? i18n.t('editProfileTitle') : i18n.t('newProfileTitle')}
              </Text>

              <Text style={styles.label}>{i18n.t('childsNameLabel')}</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={i18n.t('enterNamePlaceholder')}
                placeholderTextColor="#A1A1AA"
                style={styles.input}
              />

              <Text style={styles.label}>{i18n.t('birthdayLabel')}</Text>
              {Platform.OS === 'web' ? (
                 <input
                    type="date"
                    value={birthday.toISOString().split('T')[0]}
                    onChange={e => {
                      const d = new Date(e.target.value);
                      if (!isNaN(d.getTime())) setBirthday(d);
                    }}
                    style={webDatePickerStyle}
                  />
              ) : (
                <>
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.dateText}>{birthday.toDateString()}</Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      mode="date"
                      value={birthday}
                      display="spinner"
                      maximumDate={new Date()}
                      onChange={(_, d) => {
                        setShowDatePicker(false);
                        if (d) setBirthday(d);
                      }}
                    />
                  )}
                </>
              )}

              <Text style={styles.label}>{i18n.t('chooseAvatarLabel')}</Text>
              <View style={styles.avatarRow}>
                <TouchableOpacity onPress={() => handleAvatarChange('left')}>
                  <Ionicons name="chevron-back-circle-sharp" size={48} color="#4D96FF" />
                </TouchableOpacity>
                <Animatable.View ref={avatarRef}>
                  <Text style={styles.avatar}>{avatarOptions[avatarIndex]}</Text>
                </Animatable.View>
                <TouchableOpacity onPress={() => handleAvatarChange('right')}>
                  <Ionicons name="chevron-forward-circle-sharp" size={48} color="#4D96FF" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.button} onPress={handleSave}>
                <Text style={styles.buttonText}>
                  {profileToEdit ? i18n.t('updateProfileButton') : i18n.t('saveProfileButton')}
                </Text>
              </TouchableOpacity>
            </Animatable.View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    padding: 24,
    paddingTop: 32,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10 },
      android: { elevation: 6 },
    }),
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 20,
    zIndex: 10,
    padding: 8,
  },
  title: {
    fontSize: 32,
    fontFamily: 'ComicSans',
    textAlign: 'center',
    color: '#382E1C',
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 24,
    color: '#1F2937', // Make sure text color is set for native input
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  dateText: {
    fontSize: 16,
    color: '#1F2937',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  avatar: {
    fontSize: 80,
    marginHorizontal: 16,
  },
  button: {
    backgroundColor: '#4D96FF',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 24,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  buttonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'ComicSans',
    fontWeight: 'bold',
  },
});