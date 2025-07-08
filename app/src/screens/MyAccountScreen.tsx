// app/src/screens/MyAccountScreen.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import Toast from 'react-native-toast-message';
import {
  signOut,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { getProfiles } from '../../utils/storage';
import { ChildProfile } from '../models/types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';
import FlinkDinkBackground from '../components/FlinkDinkBackground';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyAccountScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const { locale, setLocale } = useLanguage();
  const user = auth.currentUser;
  const email = user?.email ?? 'Unknown';

  // States
  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // For fun avatar
  const accountIcon = email[0]?.toUpperCase() || '👤';

  useEffect(() => {
    (async () => {
      const stored = await getProfiles();
      setProfiles(stored);
    })();
  }, []);

  const calculateAge = (birthday: string) => {
    const birthDate = new Date(birthday);
    const ageDiffMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    Toast.show({ type, text1: message, position: 'top', visibilityTime: 3000 });
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return showToast('error', t('alertError') + ': ' + t('pleaseFillAllFields', { defaultValue: 'Please fill in all fields.' }));
    }
    if (newPassword.length < 6) {
      return showToast('error', t('alertError') + ': ' + t('passwordTooShort', { defaultValue: 'Password must be at least 6 characters.' }));
    }
    if (newPassword !== confirmPassword) {
      return showToast('error', t('alertError') + ': ' + t('passwordsDoNotMatch', { defaultValue: 'New passwords do not match.' }));
    }
    if (!user?.email) {
      return showToast('error', t('alertError') + ': ' + t('userNotFound', { defaultValue: 'User not found.' }));
    }

    setChanging(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      showToast('success', t('passwordUpdated', { defaultValue: 'Password updated!' }));
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.warn('Change password error:', error.code);
      const map: { [key: string]: string } = {
        'auth/wrong-password': t('incorrectCurrentPassword', { defaultValue: 'Incorrect current password.' }),
        'auth/weak-password': t('passwordTooShort', { defaultValue: 'Password should be at least 6 characters.' }),
        'auth/requires-recent-login': t('pleaseLoginAgain', { defaultValue: 'Please log in again and try.' }),
      };
      showToast('error', map[error.code] || t('failedToChangePassword', { defaultValue: 'Failed to change password.' }));
    } finally {
      setChanging(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      showToast('error', t('failedToSignOut', { defaultValue: 'Failed to sign out.' }));
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('alertDeleteAccountTitle'),
      t('alertDeleteAccountMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(user!);
            } catch (e) {
              Alert.alert(t('alertError'), t('alertReAuth'));
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.root}>
      <FlinkDinkBackground />
      {/* --- BACK BUTTON HEADER --- */}
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#382E1C" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Greeting Section */}
        <View style={styles.accountCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{accountIcon}</Text>
          </View>
          <View style={{ alignItems: 'center', marginBottom: 1 }}>
            <Text
              style={styles.hello}
              numberOfLines={2}
              adjustsFontSizeToFit
              ellipsizeMode="tail"
            >
              {t('myAccountTitle')}
            </Text>
            <Text
              style={styles.email}
              numberOfLines={1}
              adjustsFontSizeToFit
              ellipsizeMode="middle"
            >
              {email}
            </Text>
          </View>
        </View>

        {/* Language Switcher */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('languageSettings')}</Text>
          <View style={styles.languageRow}>
            <TouchableOpacity
              style={[styles.langButton, locale.startsWith('en') && styles.langButtonActive]}
              onPress={() => setLocale('en')}
              disabled={locale.startsWith('en')}
            >
              <Text style={[styles.langButtonText, locale.startsWith('en') && styles.langButtonTextActive]}>
                {t('english')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langButton, locale.startsWith('af') && styles.langButtonActive]}
              onPress={() => setLocale('af')}
              disabled={locale.startsWith('af')}
            >
              <Text style={[styles.langButtonText, locale.startsWith('af') && styles.langButtonTextActive]}>
                {t('afrikaans')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.actionCard} onPress={() => setShowPasswordModal(true)}>
            <Ionicons name="key" size={28} color="#fff" style={styles.actionIcon} />
            <Text
              style={styles.actionText}
              numberOfLines={2}
              adjustsFontSizeToFit
              ellipsizeMode="tail"
            >
              {t('changePassword')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={28} color="#fff" style={styles.actionIcon} />
            <Text
              style={styles.actionText}
              numberOfLines={2}
              adjustsFontSizeToFit
              ellipsizeMode="tail"
            >
              {t('logOut')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, styles.dangerCard]} onPress={handleDeleteAccount}>
            <Ionicons name="trash-bin-outline" size={28} color="#fff" style={styles.actionIcon} />
            <Text
              style={styles.actionText}
              numberOfLines={2}
              adjustsFontSizeToFit
              ellipsizeMode="tail"
            >
              {t('deleteAccount')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Child Profiles */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('childProfiles')}</Text>
          <View style={styles.profilesRow}>
            {profiles.length === 0 ? (
              <Text style={styles.noProfiles}>{t('noProfilesFound')}</Text>
            ) : (
              profiles.map((child) => (
                <View key={child.id} style={styles.childCard}>
                  <Text style={styles.childAvatar}>{child.avatar}</Text>
                  <Text
                    style={styles.childName}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    ellipsizeMode="tail"
                  >
                    {child.name}
                  </Text>
                  <Text style={styles.childAge}>{t('age')} {calculateAge(child.birthday)}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        <Text style={styles.version}>{t('appVersion')} {Constants.manifest?.version || '1.0.0'}</Text>
      </ScrollView>

      {/* Password Modal */}
      {showPasswordModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text
              style={styles.modalTitle}
              numberOfLines={2}
              adjustsFontSizeToFit
              ellipsizeMode="tail"
            >
              {t('changePassword')}
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder={t('currentPassword')}
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                style={styles.input}
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.toggleButton}>
                <Text style={styles.toggleText}>{showCurrent ? t('hide') : t('show')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder={t('newPassword')}
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
                style={styles.input}
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.toggleButton}>
                <Text style={styles.toggleText}>{showNew ? t('hide') : t('show')}</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.passwordContainer}>
              <TextInput
                placeholder={t('confirmNewPassword')}
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={styles.input}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.toggleButton}>
                <Text style={styles.toggleText}>{showConfirm ? t('hide') : t('show')}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handlePasswordChange} disabled={changing}>
              <Text
                style={styles.saveButtonText}
                numberOfLines={2}
                adjustsFontSizeToFit
                ellipsizeMode="tail"
              >
                {changing ? t('changing') : t('savePassword')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowPasswordModal(false)} style={{ marginTop: 8 }}>
              <Text
                style={styles.cancelText}
                numberOfLines={1}
                adjustsFontSizeToFit
                ellipsizeMode="tail"
              >
                {t('cancel')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

// ---- STYLES ----
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFBF2' },
  scroll: { padding: 20, paddingTop: 56, paddingBottom: 50 },
  accountCard: {
    backgroundColor: '#fff',
    alignItems: 'center',
    marginBottom: 22,
    borderRadius: 24,
    padding: 20,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.09, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  avatarCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#FF9B1C',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#FFD580',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 8,
  },
  avatarText: {
    color: '#fff',
    fontFamily: 'ComicSans',
    fontSize: 32,
    fontWeight: 'bold',
  },
  hello: {
    fontSize: 26,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    marginBottom: 0,
    textAlign: 'center',
    maxWidth: '96%',
    flexShrink: 1,
  },
  email: {
    fontSize: 17,
    fontFamily: 'ComicSans',
    color: '#6A4C93',
    textAlign: 'center',
    marginBottom: 0,
    maxWidth: '96%',
    flexShrink: 1,
  },
  section: { marginTop: 24, marginBottom: 10 },
  sectionTitle: {
    fontSize: 19,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    marginBottom: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: '98%',
    flexShrink: 1,
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#f0f5f7',
    padding: 5,
    marginBottom: 8,
  },
  langButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8, // allow wider button
    alignItems: 'center',
    borderRadius: 16,
    marginHorizontal: 3,
    backgroundColor: 'transparent',
    minWidth: 80,          // allow more room for long language names
    maxWidth: '48%',
  },
  langButtonActive: {
    backgroundColor: '#4D96FF',
  },
  langButtonText: {
    fontFamily: 'ComicSans',
    fontSize: 15,
    color: '#4D96FF',
    fontWeight: '700',
    textAlign: 'center',
    flexShrink: 1,
  },
  langButtonTextActive: {
    color: '#fff',
  },
  actionSection: {
    marginVertical: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'space-between',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00B4D8',
    borderRadius: 18,
    padding: 18,
    marginBottom: 8,
    flex: 1,
    minWidth: 138,
    marginHorizontal: 4,
    maxWidth: '100%',
    alignSelf: 'stretch',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 3 }, shadowRadius: 7 },
      android: { elevation: 3 },
    }),
  },
  dangerCard: {
    backgroundColor: '#F25C5C',
  },
  actionIcon: { marginRight: 14 },
  actionText: {
    fontFamily: 'ComicSans',
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    flexShrink: 1,
    maxWidth: '96%',
  },
  profilesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    justifyContent: 'flex-start',
    marginBottom: 2,
  },
  childCard: {
    backgroundColor: '#FFFAE6',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    marginRight: 10,
    minWidth: 100,
    marginBottom: 8,
  },
  childAvatar: { fontSize: 32, marginBottom: 6 },
  childName: {
    fontFamily: 'ComicSans',
    color: '#382E1C',
    fontSize: 16,
    fontWeight: 'bold',
    maxWidth: 90,
    textAlign: 'center',
    flexShrink: 1,
  },
  childAge: {
    fontFamily: 'ComicSans',
    color: '#6A4C93',
    fontSize: 13,
    marginTop: 1,
  },
  noProfiles: {
    fontFamily: 'ComicSans',
    color: '#aaa',
    fontSize: 15,
    textAlign: 'center',
  },
  version: {
    marginTop: 30,
    fontSize: 13,
    color: '#bbb',
    textAlign: 'center',
    fontFamily: 'ComicSans',
  },
  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.34)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 99,
  },
  modal: {
    backgroundColor: '#fff',
    padding: 22,
    borderRadius: 22,
    width: '87%',
    alignSelf: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, shadowRadius: 12 },
      android: { elevation: 7 },
    }),
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    flexShrink: 1,
    maxWidth: '96%',
  },
  input: {
    backgroundColor: '#F8FAFF',
    borderWidth: 1.7,
    borderColor: '#D6B98C',
    padding: 12,
    borderRadius: 12,
    fontFamily: 'ComicSans',
    marginBottom: 8,
    fontSize: 15,
    flex: 1,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    borderRadius: 10,
    marginBottom: 9,
  },
  toggleButton: { paddingHorizontal: 9, paddingVertical: 7 },
  toggleText: { fontFamily: 'ComicSans', fontSize: 14, color: '#555' },
  saveButton: {
    backgroundColor: '#4D96FF',
    padding: 14,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 4,
    minWidth: 150,
    alignSelf: 'stretch',
  },
  saveButtonText: {
    color: '#fff',
    fontFamily: 'ComicSans',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',
    flexShrink: 1,
    maxWidth: '96%',
  },
  cancelText: {
    fontFamily: 'ComicSans',
    color: '#382E1C',
    fontSize: 15,
    textAlign: 'center',
    textDecorationLine: 'underline',
    marginTop: 8,
    maxWidth: '96%',
    flexShrink: 1,
  },
  safeArea: {
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  backButton: {
    padding: 8,
  },
});
