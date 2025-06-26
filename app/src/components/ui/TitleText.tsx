import { Text, StyleSheet } from 'react-native';
import { fonts, colors, fontSizes, spacing } from '../../theme';

export default function TitleText({ children }) {
  return <Text style={styles.title}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    fontSize: fontSizes.xxl,
    fontFamily: fonts.main,
    textAlign: 'center',
    color: colors.text,
    marginBottom: spacing.lg,
  },
});
