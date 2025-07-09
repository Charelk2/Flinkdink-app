import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import FlinkDinkBackground from '../components/FlinkDinkBackground';
import i18n from '../i18n';

type OnboardingScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Onboarding'
>;

export default function OnboardingScreen() {
  const navigation = useNavigation<OnboardingScreenNavigationProp>();
  const { width } = useWindowDimensions();

  // FlinkDink logo variables
  const colors = [
    '#FF6B6B',
    '#FF9B1C',
    '#4D96FF',
    '#38B000',
    '#6A4C93',
    '#FF6B6B',
    '#FF9B1C',
    '#4D96FF',
    '#38B000',
  ];
  const flink = 'FLINK'.split('');
  const dink = 'DINK'.split('');
  const all = [...flink, ...dink];

  // Responsive font size for logo
  const titleFontSize =
    width > 900 ? 80 : width > 600 ? 60 : width > 400 ? 48 : 32;
  // Style must match your StyleSheet for letterBox
  const letterBoxPadding = 12 * 2;
  const letterBoxMargin = 4 * 2;
  const minPadding = 32 * 2;
  const blockWidth = titleFontSize + letterBoxPadding + letterBoxMargin;

  // ----
  // SAFE width fallback: always a valid number
  const safeBlockWidth =
    Number.isFinite(blockWidth) && blockWidth > 0 ? blockWidth : 1;
  const logoNeededWidth = safeBlockWidth * all.length;
  const availableWidth = width - minPadding;
  const mustBreak = logoNeededWidth > availableWidth;
  // ----

  return (
    <View style={styles.container}>
      <FlinkDinkBackground />
      <SafeAreaView style={styles.safeArea}>
        <View />
        <View style={styles.content}>
          {/* FlinkDink Logo */}
          <View style={styles.logoWrapper}>
            {mustBreak ? (
              <>
                <View style={styles.titleContainer}>
                  {flink.map((char, i) => (
                    <View
                      key={i}
                      style={[
                        styles.letterBox,
                        { backgroundColor: colors[i % colors.length] },
                      ]}
                    >
                      <Text style={[styles.char, { fontSize: titleFontSize }]}>
                        {char}
                      </Text>
                    </View>
                  ))}
                </View>
                <View style={[styles.titleContainer, styles.dinkRow]}>
                  {/* SAFE SPACER: always 0 or positive */}
                  <View
                    style={{
                      width: safeBlockWidth > 0 ? safeBlockWidth / 2 : 0,
                    }}
                  />
                  {dink.map((char, i) => (
                    <View
                      key={i}
                      style={[
                        styles.letterBox,
                        {
                          backgroundColor:
                            colors[(i + flink.length) % colors.length],
                        },
                      ]}
                    >
                      <Text style={[styles.char, { fontSize: titleFontSize }]}>
                        {char}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <View style={styles.titleContainer}>
                {all.map((char, i) => (
                  <View
                    key={i}
                    style={[
                      styles.letterBox,
                      { backgroundColor: colors[i % colors.length] },
                    ]}
                  >
                    <Text style={[styles.char, { fontSize: titleFontSize }]}>
                      {char}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
          {/* Tagline */}
          <Text style={styles.tagline}>
            {i18n.t('onboardingTagline') || 'A Fun Start to a Smart Future'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('SignUp')}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {i18n.t('getStarted') || 'Get Started'}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    alignItems: 'center',
    width: '100%',
  },
  logoWrapper: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 0,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'nowrap',
    marginBottom: 0,
    width: '100%',
  },
  dinkRow: {
    marginTop: 4,
    width: '100%',
  },
  char: {
    fontFamily: 'ComicSans',
    color: '#fff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 6,
  },
  letterBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    marginBottom: 10,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
      },
      android: { elevation: 5 },
    }),
  },
  tagline: {
    fontSize: 20,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    textAlign: 'center',
    marginTop: 24,
    lineHeight: 28,
  },
  button: {
    backgroundColor: '#4D96FF',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  buttonText: {
    fontSize: 22,
    fontFamily: 'ComicSans',
    color: '#fff',
    fontWeight: 'bold',
  },
});
