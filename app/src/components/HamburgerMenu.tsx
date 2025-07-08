import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../i18n';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSwitchProfile: () => void;
  onMyAccount: () => void;
  onSignOut: () => void;
  onResetProgress?: () => void;
  switchProfileText: string;
  myAccountText: string;
  signOutText: string;
}

export default function HamburgerMenu({
  visible,
  onClose,
  onSwitchProfile,
  onMyAccount,
  onSignOut,
  onResetProgress,
  switchProfileText,
  myAccountText,
  signOutText,
}: Props) {
  // Helper for safe-close-then-action
  const handleAndClose = (action: () => void) => () => {
    onClose();
    setTimeout(action, 120); // Small delay to allow modal to animate out
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.menu}>
          <Text style={styles.title}>{i18n.t('menuTitle')}</Text>
          <MenuButton
            icon="people-outline"
            label={switchProfileText}
            onPress={handleAndClose(onSwitchProfile)}
            first
          />
          <MenuButton
            icon="person-circle-outline"
            label={myAccountText}
            onPress={handleAndClose(onMyAccount)}
          />
          {onResetProgress && (
            <MenuButton
              icon="refresh-outline"
              label={i18n.t('resetProgress')}
              onPress={handleAndClose(onResetProgress)}
              destructive
            />
          )}
          <MenuButton
            icon="log-out-outline"
            label={signOutText}
            onPress={handleAndClose(onSignOut)}
            destructive
            last
          />
        </View>
      </Pressable>
    </Modal>
  );
}

type MenuButtonProps = {
  icon: any;
  label: string;
  onPress: () => void;
  destructive?: boolean;
  first?: boolean;
  last?: boolean;
};
const MenuButton = ({
  icon,
  label,
  onPress,
  destructive,
  first,
  last,
}: MenuButtonProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.68}
    style={[
      styles.menuItem,
      first && { borderTopLeftRadius: 14, borderTopRightRadius: 14 },
      last && { borderBottomWidth: 0, marginTop: 8 },
      destructive && { backgroundColor: '#ffe8e6' },
    ]}
  >
    <Ionicons
      name={icon}
      size={22}
      color={destructive ? '#F25C5C' : '#382E1C'}
      style={{ marginRight: 13 }}
    />
    <Text style={[
      styles.menuItemText,
      destructive && { color: '#F25C5C' }
    ]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.36)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: '#FFFBF2',
    paddingTop: 12,
    paddingBottom: 10,
    borderRadius: 20,
    width: 305,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 10,
    ...Platform.select({
      android: { elevation: 9 },
    }),
  },
  title: {
    fontSize: 23,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    marginBottom: 8,
    marginTop: 4,
    textAlign: 'center',
    letterSpacing: 0.1,
    fontWeight: '700',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomColor: '#EDE7DC',
    borderBottomWidth: 1,
    backgroundColor: 'transparent',
    marginHorizontal: 2,
  },
  menuItemText: {
    fontSize: 18,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    fontWeight: '600',
    letterSpacing: 0.02,
  },
});

