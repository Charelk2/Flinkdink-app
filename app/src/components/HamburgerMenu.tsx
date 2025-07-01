// app/src/components/HamburgerMenu.tsx
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSwitchProfile: () => void;
  onMyAccount: () => void;
  onSignOut: () => void;
}

export default function HamburgerMenu({ visible, onClose, onSwitchProfile, onMyAccount, onSignOut }: Props) {
  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.menu}>
          <Text style={styles.title}>Menu</Text>

          <TouchableOpacity style={styles.item} onPress={onSwitchProfile}>
            <Text style={styles.text}>Switch Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={onMyAccount}>
            <Text style={styles.text}>My Account</Text>
          </TouchableOpacity>


          <TouchableOpacity style={[styles.item, styles.signOut]} onPress={onSignOut}>
            <Text style={styles.text}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: '#FFFBF2',
    padding: 24,
    borderRadius: 20,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    marginBottom: 20,
    textAlign: 'center',
  },
  item: {
    paddingVertical: 12,
    borderBottomColor: '#DDD',
    borderBottomWidth: 1,
  },
  text: {
    fontSize: 18,
    fontFamily: 'ComicSans',
    color: '#382E1C',
  },
  signOut: {
    borderBottomWidth: 0,
    marginTop: 10,
  },
});
