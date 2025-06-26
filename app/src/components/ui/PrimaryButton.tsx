import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, fonts, fontSizes } from '../../theme';

export default function PrimaryButton({ title, onPress, disabled = false }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.button, disabled && { opacity: 0.6 }]}
      disabled={disabled}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  text: {
    fontSize: fontSizes.lg,
    color: colors.text,
    fontFamily: fonts.main,
  },
});
