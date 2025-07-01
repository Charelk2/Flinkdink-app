import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
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
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import Toast from 'react-native-toast-message';

export default function MyAccountScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
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

  const showToast = (type: 'success' | 'error', message: string) => {
    Toast.show({ type, text1: message, position: 'top', visibilityTime: 3000 });
  };

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

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      return showToast('error', 'Please fill in all fields.');
    }

    if (newPassword.length < 6) {
      return showToast('error', 'Password must be at least 6 characters.');
    }

    if (newPassword !== confirmPassword) {
      return showToast('error', 'New passwords do not match.');
    }

    if (!user?.email) {
      return showToast('error', 'User not found.');
    }

    setChanging(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      showToast('success', 'Password updated!');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.warn('Change password error:', error.code);
      const map: { [key: string]: string } = {
        'auth/wrong-password': 'Incorrect current password.',
        'auth/weak-password': 'Password should be at least 6 characters.',
        'auth/requires-recent-login': 'Please log in again and try.',
      };
      showToast('error', map[error.code] || 'Failed to change password.');
    } finally {
      setChanging(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('Failed to sign out:', e);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteUser(user!);
            } catch (e) {
              console.warn('Delete error:', e);
              Alert.alert('Error', 'You may need to re-authenticate.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Account</Text>

      <Text style={styles.label}>Logged in as:</Text>
      <Text style={styles.email}>{email}</Text>

      <TouchableOpacity style={styles.button} onPress={() => setShowPasswordModal(true)}>
        <Text style={styles.buttonText}>Change Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.danger]} onPress={handleDeleteAccount}>
        <Text style={styles.buttonText}>Delete Account</Text>
      </TouchableOpacity>

      {profiles.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Child Profiles</Text>
          {profiles.map((child) => (
            <Text key={child.id} style={styles.child}>
              {child.name} {child.avatar} (Age {calculateAge(child.birthday)})
            </Text>
          ))}
        </View>
      )}

      <Text style={styles.version}>App Version: {Constants.manifest?.version || '1.0.0'}</Text>

      {showPasswordModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Current Password"
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.toggleButton}>
                <Text style={styles.toggleText}>{showCurrent ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="New Password"
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.toggleButton}>
                <Text style={styles.toggleText}>{showNew ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.passwordContainer}>
              <TextInput
                placeholder="Confirm New Password"
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                style={[styles.input, { flex: 1, marginBottom: 0 }]}
              />
              <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.toggleButton}>
                <Text style={styles.toggleText}>{showConfirm ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handlePasswordChange} disabled={changing}>
              <Text style={styles.buttonText}>{changing ? 'Changing...' : 'Save Password'}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowPasswordModal(false)} style={{ marginTop: 10 }}>
              <Text style={{ fontFamily: 'ComicSans', color: '#382E1C', textAlign: 'center' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF2', padding: 24, justifyContent: 'center' },
  title: { fontSize: 32, fontFamily: 'ComicSans', textAlign: 'center', color: '#382E1C', marginBottom: 30 },
  label: { fontSize: 16, fontFamily: 'ComicSans', color: '#382E1C', marginBottom: 4 },
  email: { fontSize: 20, fontFamily: 'ComicSans', marginBottom: 20, color: '#382E1C' },
  button: {
    backgroundColor: '#00B4D8',
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: { color: '#fff', fontSize: 18, fontFamily: 'ComicSans' },
  danger: { backgroundColor: '#F25C5C' },
  section: { marginTop: 40 },
  sectionTitle: { fontSize: 22, fontFamily: 'ComicSans', color: '#382E1C', marginBottom: 10 },
  child: { fontSize: 18, fontFamily: 'ComicSans', color: '#382E1C', marginBottom: 6 },
  version: { marginTop: 40, fontSize: 14, fontFamily: 'ComicSans', color: '#999', textAlign: 'center' },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: { backgroundColor: '#FFFBF2', padding: 24, borderRadius: 20, width: '85%' },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#FFF8E7',
    borderWidth: 2,
    borderColor: '#D6B98C',
    padding: 12,
    borderRadius: 10,
    fontFamily: 'ComicSans',
    marginBottom: 12,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
    borderRadius: 10,
    paddingRight: 12,
    marginBottom: 12,
  },
  toggleButton: { paddingHorizontal: 10, paddingVertical: 8 },
  toggleText: { fontFamily: 'ComicSans', fontSize: 14, color: '#555' },
});
