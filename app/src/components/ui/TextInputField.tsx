import { TextInput, StyleSheet, View, Text } from 'react-native';
import { colors, spacing, fonts, fontSizes } from '../../theme';

export default function TextInputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  style,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        secureTextEntry={secureTextEntry}
        style={[styles.input, style]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: {
    fontSize: fontSizes.md,
    fontFamily: fonts.main,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 2,
    borderColor: colors.inputBorder,
    padding: spacing.sm,
    borderRadius: 10,
    fontFamily: fonts.main,
  },
});
