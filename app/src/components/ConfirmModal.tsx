import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import i18n from '../i18n'; // ✅ Import i18n

// ✅ 1. UPDATE THE PROPS INTERFACE
type ConfirmModalProps = {
  visible: boolean;
  week: number;
  onCancel: () => void;
  onConfirm: () => void;
  // We no longer need all the text props from the parent,
  // as the modal can construct its own text using i18n.
};

export default function ConfirmModal({ visible, week, onCancel, onConfirm }: ConfirmModalProps) {
  if (!visible) return null;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* ✅ 2. USE I18N KEYS WITH DYNAMIC VALUES */}
          <Text style={styles.title}>{i18n.t('skipToWeekTitle', { week: week })}</Text>
          <Text style={styles.message}>{i18n.t('skipToWeekMessage', { week: week })}</Text>

          <View style={styles.buttons}>
            <TouchableOpacity onPress={onCancel} style={[styles.button, styles.cancel]}>
              <Text style={styles.buttonText}>{i18n.t('cancel')}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onConfirm} style={[styles.button, styles.confirm]}>
              <Text style={styles.buttonText}>{i18n.t('yes')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// Styles remain the same
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#0006',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#FFFBF2',
    padding: 24,
    borderRadius: 16,
    width: '80%',
    maxWidth: 320,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  cancel: {
    backgroundColor: '#ccc',
  },
  confirm: {
    backgroundColor: '#00B4D8',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'ComicSans',
    color: '#fff',
  },
});