import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import { RootStackParamList } from '../navigation/types';
import FlinkDinkBackground from '../components/FlinkDinkBackground';

const SEEN_KEY = 'seenInstructions';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

// --- Updated Sections for Thorough, Motivational Instructions (no markdown stars) ---
const sections = [
  {
    key: 'why',
    title: 'Why This Matters',
    icon: 'help-buoy-outline' as const,
    content:
      'By age four, up to 50 percent of a child’s brain capacity is already set-so the language experiences they have today shape their lifetime learning.\n\n' +
      'Studies show that nine-year-old Elon Musk credits his success to reading science fiction from age nine, building his confidence and focus. Early reading skills open doors: better grades, higher self-esteem, and a love of learning that lasts a lifetime.',
  },
  {
    key: 'science',
    title: 'The Science Behind It',
    icon: 'flask-outline' as const,
    content:
      'Phonemic Awareness: By 18 months, infants distinguish every sound in their native tongue. Flashcards that pair letters and sounds help wire those pathways correctly.\n\n' +
      'Neural Plasticity: Short, playful sessions under ten minutes repeatedly activate the same circuits, making reading automatic.\n\n' +
      'Evidence: Children exposed to daily flashcards show thirty to forty percent faster gains in vocabulary and decoding skills compared to controls.',
  },
  {
    key: 'how',
    title: 'How To Make It Work',
    icon: 'play-circle-outline' as const,
    content:
      '1. Speak with energy: Use clear, enthusiastic pronunciation-your excitement is contagious.\n' +
      '2. Fast pace: Show each card for one second. Quick turns keep attention high.\n' +
      '3. Three daily sessions: Mix vocabulary, facts, and playful sounds across different subjects.\n' +
      '4. Follow the child’s lead: If they lose interest, switch topics or take a break. It should feel like play, not work.',
  },
  {
    key: 'commit',
    title: 'Making the Commitment',
    icon: 'checkmark-done-outline' as const,
    content:
      'Block it out: Schedule notifications or put cards by the breakfast table-consistency beats intensity.\n\n' +
      'Celebrate progress: Mark completed weeks on a chart or give a high-five. Reinforcement boosts motivation.\n\n' +
      'Get support: Share your child’s wins with friends or on social media for extra accountability.',
  },
  {
    key: 'tips',
    title: 'Daily Routine & Tips',
    icon: 'bulb-outline' as const,
    content:
      'Keep sessions under five minutes-short and sweet.\n' +
      'Tie them to daily habits like after brushing teeth or before dinner.\n' +
      'Praise effort, not perfection: “Wow, you did great keeping up!”\n' +
      'Vary the content: one day vocabulary, next day fun facts or sounds.',
  },
  {
    key: 'quotes',
    title: 'Inspiring Quotes',
    icon: 'chatbox-ellipses-outline' as const,
    content:
      '“The mind is not a vessel to be filled, but a fire to be kindled.” - Plutarch\n\n' +
      '“Reading is to the mind what exercise is to the body.” - Joseph Addison\n\n' +
      '“A child who reads today will lead tomorrow.” - Anonymous',
  },
];

// --- AccordionItem Component ---
type AccordionItemProps = { section: typeof sections[0]; initiallyOpen?: boolean };
const AccordionItem: React.FC<AccordionItemProps> = ({ section, initiallyOpen = false }) => {
  const [contentHeight, setContentHeight] = useState(0);
  const isOpen = useSharedValue(initiallyOpen);
  const rotation = useSharedValue(initiallyOpen ? 180 : 0);

  const animatedStyle = useAnimatedStyle(() => ({
    height: withTiming(isOpen.value ? contentHeight : 0, { duration: 300 }),
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const toggle = () => {
    isOpen.value = !isOpen.value;
    rotation.value = withTiming(isOpen.value ? 180 : 0, { duration: 200 });
  };

  return (
    <View style={styles.sectionContainer}>
      <TouchableOpacity style={styles.sectionHeader} onPress={toggle} activeOpacity={0.8}>
        <Ionicons name={section.icon} size={22} color="#4D96FF" style={styles.icon} />
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <Animated.View style={animatedIconStyle}>
          <Ionicons name="chevron-down" size={22} color="#382E1C" />
        </Animated.View>
      </TouchableOpacity>
      <Animated.View style={[styles.animatedBody, animatedStyle]}>
        <View
          style={styles.contentWrapper}
          onLayout={e => setContentHeight(e.nativeEvent.layout.height)}>
          <Text style={styles.sectionContent}>{section.content}</Text>
        </View>
      </Animated.View>
    </View>
  );
};

// --- Main InstructionsScreen Component ---
export default function InstructionsScreen() {
  const navigation = useNavigation<NavProp>();

  const onGotIt = async () => {
    try {
      await AsyncStorage.setItem(SEEN_KEY, 'true');
    } catch (e) {
      console.error('Failed to save seen status', e);
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('Home');
    }
  };

  return (
    <View style={styles.container}>
      <FlinkDinkBackground />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#382E1C" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.mainTitle}>Welcome to FlinkDink!</Text>
          <Text style={styles.subtitle}>
            Here’s everything you need to know to get started on this exciting learning adventure.
          </Text>

          {sections.map((sec, index) => (
            <AccordionItem key={sec.key} section={sec} initiallyOpen={index === 0} />
          ))}
        </ScrollView>

        <View style={styles.stickyButtonContainer}>
          <TouchableOpacity style={styles.button} onPress={onGotIt}>
            <Text style={styles.buttonText}>Got it! Let’s get started</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: 'transparent' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, height: 56 },
  backButton: { padding: 8 },
  scrollContent: { paddingHorizontal: 24, paddingBottom: 120 },
  mainTitle: { fontSize: 32, fontFamily: 'ComicSans', color: '#382E1C', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 24, fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }), lineHeight: 24 },

  sectionContainer: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#EAEAEA' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  icon: { marginRight: 12 },
  sectionTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: '#382E1C', fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }) },
  animatedBody: { overflow: 'hidden' },
  contentWrapper: { position: 'absolute', width: '100%', paddingHorizontal: 16, paddingBottom: 16 },
  sectionContent: { fontSize: 15, color: '#555', lineHeight: 22, fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }) },

  stickyButtonContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingBottom: Platform.OS === 'ios' ? 30 : 24, paddingTop: 12, backgroundColor: 'rgba(255, 251, 242, 0.8)', borderTopWidth: 1, borderTopColor: '#EAEAEA' },
  button: { backgroundColor: '#4D96FF', paddingVertical: 16, borderRadius: 16, alignItems: 'center', ...Platform.select({ ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 5 }, shadowRadius: 10 }, android: { elevation: 8 } }) },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }) },
});
