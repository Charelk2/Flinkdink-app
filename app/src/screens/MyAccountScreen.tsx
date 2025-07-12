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

  const [profiles, setProfiles] = useState<ChildProfile[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changing, setChanging] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const accountIcon = email.charAt(0).toUpperCase() || '👤';

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
      return showToast('error', `${t('alertError')}: ${t('pleaseFillAllFields')}`);
    }
    if (newPassword.length < 6) {
      return showToast('error', `${t('alertError')}: ${t('passwordTooShort')}`);
    }
    if (newPassword !== confirmPassword) {
      return showToast('error', `${t('alertError')}: ${t('passwordsDoNotMatch')}`);
    }
    if (!user?.email) {
      return showToast('error', `${t('alertError')}: ${t('userNotFound')}`);
    }

    setChanging(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      showToast('success', t('passwordUpdated'));
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      const code = error.code as string;
      const map: Record<string, string> = {
        'auth/wrong-password': t('incorrectCurrentPassword'),
        'auth/weak-password': t('passwordTooShort'),
        'auth/requires-recent-login': t('pleaseLoginAgain'),
      };
      showToast('error', map[code] || t('failedToChangePassword'));
    } finally {
      setChanging(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch {
      showToast('error', t('failedToSignOut'));
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
            } catch {
              Alert.alert(t('alertError'), t('alertReAuth'));
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <View style={styles.root}>
      <FlinkDinkBackground />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#382E1C" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.accountCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{accountIcon}</Text>
          </View>
          <Text style={styles.hello}>{t('myAccountTitle')}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('languageSettings')}</Text>
          <View style={styles.languageRow}>
            <TouchableOpacity
              style={[styles.langButton, locale.startsWith('en') && styles.langButtonActive]}
              onPress={() => setLocale('en')}
            >
              <Text style={[styles.langButtonText, locale.startsWith('en') && styles.langButtonTextActive]}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langButton, locale.startsWith('af') && styles.langButtonActive]}
              onPress={() => setLocale('af')}
            >
              <Text style={[styles.langButtonText, locale.startsWith('af') && styles.langButtonTextActive]}>Afrikaans</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionSection}>
          <TouchableOpacity style={styles.actionCard} onPress={() => setShowPasswordModal(true)}>
            <Ionicons name="key" size={28} color="#fff" />
            <Text style={styles.actionText}>{t('changePassword')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionCard} onPress={handleSignOut}>
            <Ionicons name="log-out-outline" size={28} color="#fff" />
            <Text style={styles.actionText}>{t('logOut')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionCard, styles.dangerCard]} onPress={handleDeleteAccount}>
            <Ionicons name="trash-bin-outline" size={28} color="#fff" />
            <Text style={styles.actionText}>{t('deleteAccount')}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('childProfiles')}</Text>
          <View style={styles.profilesRow}>
            {profiles.length === 0 ? (
              <Text style={styles.noProfiles}>{t('noProfilesFound')}</Text>
            ) : (
              profiles.map(child => (
                <View key={child.id} style={styles.childCard}>
                  <Text style={styles.childAvatar}>{child.avatar}</Text>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childAge}>{t('age')} {calculateAge(child.birthday)}</Text>
                </View>
              ))
            )}
          </View>
        </View>

        <Text style={styles.version}>{t('appVersion')}: {appVersion}</Text>
      </ScrollView>

      {showPasswordModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{t('changePassword')}</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={t('currentPassword')}
                  secureTextEntry={!showCurrent}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.toggleButton}>
                  <Text style={styles.toggleText}>{showCurrent ? t('hide') : t('show')}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={t('newPassword')}
                  secureTextEntry={!showNew}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.toggleButton}>
                  <Text style={styles.toggleText}>{showNew ? t('hide') : t('show')}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.input}
                  placeholder={t('confirmNewPassword')}
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.toggleButton}>
                  <Text style={styles.toggleText}>{showConfirm ? t('hide') : t('show')}</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.saveButton} onPress={handlePasswordChange} disabled={changing}>
                <Text style={styles.saveButtonText}>{changing ? t('changing') : t('savePassword')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowPasswordModal(false)} style={styles.cancelButton}>
                <Text style={styles.cancelText}>{t('cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFFBF2' },
  safeArea: { backgroundColor: 'transparent' },
  header: { flexDirection: 'row', alignItems: 'center', height: 56, paddingHorizontal: 16 },
  backButton: { padding: 8 },
  scroll: { padding: 20, paddingTop: 56, paddingBottom: 50 },
  accountCard: { backgroundColor: '#fff', borderRadius: 24, padding: 20, alignItems: 'center', marginBottom: 22, ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.09, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8 }, android: { elevation: 4 } }) },
  avatarCircle: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#FF9B1C', justifyContent: 'center', alignItems: 'center', marginBottom: 8, shadowColor: '#FFD580', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 1 }, shadowRadius: 8 },
  avatarText: { fontSize: 32, fontFamily: 'ComicSans', color: '#fff', fontWeight: 'bold' },
  hello: { fontSize: 26, fontFamily: 'ComicSans', color: '#382E1C', textAlign: 'center' },
  email: { fontSize: 17, fontFamily: 'ComicSans', color: '#6A4C93', textAlign: 'center', marginTop: 4 },
  section: { marginTop: 24, marginBottom: 10 },
  sectionTitle: { fontSize: 19, fontFamily: 'ComicSans', color: '#382E1C', fontWeight: 'bold', textAlign: 'center', marginBottom: 12 },
  languageRow: { flexDirection: 'row', justifyContent: 'center', backgroundColor: '#f0f5f7', borderRadius: 20, padding: 5 },
  langButton: { flex: 1, paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center', borderRadius: 16, marginHorizontal: 3, backgroundColor: 'transparent', minWidth: 80, maxWidth: '48%' },
  langButtonActive: { backgroundColor: '#4D96FF' },
  langButtonText: { fontSize: 15, fontFamily: 'ComicSans', color: '#4D96FF', fontWeight: '700', textAlign: 'center' },
  langButtonTextActive: { color: '#fff' },
  actionSection: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginVertical: 20, gap: 14 },
  actionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#00B4D8', borderRadius: 18, padding: 18, flex: 1, minWidth: 138, marginHorizontal: 4, marginBottom: 8, ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 3 }, shadowRadius: 7 }, android: { elevation: 3 } }) },
  dangerCard: { backgroundColor: '#F25C5C' },
  actionText: { fontSize: 17, fontFamily: 'ComicSans', color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  profilesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, justifyContent: 'flex-start', marginBottom: 2 },
  childCard: { backgroundColor: '#FFFAE6', borderRadius: 16, padding: 14, alignItems: 'center', marginRight: 10, minWidth: 100, marginBottom: 8 },
  childAvatar: { fontSize: 32, marginBottom: 6 },
  childName: { fontSize: 16, fontFamily: 'ComicSans', color: '#382E1C', fontWeight: 'bold', textAlign: 'center' },
  childAge: { fontSize: 13, fontFamily: 'ComicSans', color: '#6A4C93', marginTop: 1 },
  noProfiles: { fontSize: 15, fontFamily: 'ComicSans', color: '#aaa' },
  version: { fontSize: 13, color: '#bbb', textAlign: 'center', marginTop: 30, fontFamily: 'ComicSans' },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.34)', justifyContent: 'center', alignItems: 'center', zIndex: 99 },
  modal: { backgroundColor: '#fff', borderRadius: 22, padding: 22, width: '87%', alignSelf: 'center', ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, shadowRadius: 12 }, android: { elevation: 7 } }) },
  modalContent: { },
  modalTitle: { fontSize: 22, fontFamily: 'ComicSans', color: '#382E1C', fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFF', borderRadius: 10, marginBottom: 9 },
  input: { flex: 1, backgroundColor: '#F8FAFF', borderWidth: 1.7, borderColor: '#D6B98C', borderRadius: 12, padding: 12, fontFamily: 'ComicSans', fontSize: 15, marginLeft: 8 },
  toggleButton: { paddingHorizontal: 9, paddingVertical: 7 },
  toggleText: { fontFamily: 'ComicSans', fontSize: 14, color: '#555' },
  saveButton: { backgroundColor: '#4D96FF', padding: 14, borderRadius: 15, alignItems: 'center', marginTop: 4 },
  saveButtonText: { color: '#fff', fontFamily: 'ComicSans', fontSize: 17, fontWeight: 'bold', textAlign: 'center' },
  cancelButton: { marginTop: 8, alignItems: 'center' },
  cancelText: { fontFamily: 'ComicSans', color: '#382E1C', fontSize: 15, textDecorationLine: 'underline' },
});
