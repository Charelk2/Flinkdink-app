// app/src/screens/InstructionsScreen.tsx
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

const sections = [
  // ... (Your sections data remains exactly the same)
  {
    key: 'why',
    title: 'Why This Matters',
    icon: 'help-buoy-outline' as const,
    content:
      'A consistent and dedicated approach to this program is crucial for cognitive development. Our methodology is designed to create strong neural pathways, enhancing learning capacity, memory, and attention skills from an early age.',
  },
  {
    key: 'how',
    title: 'How to Use the Program',
    icon: 'list-outline' as const,
    content:
      '1.  **Pronounce Clearly:** Speak clearly and enthusiastically.\n' +
      '2.  **Pacing:** Aim to show one card per second. A quick pace keeps the session engaging.\n' +
      '3.  **Frequency:** Conduct three short sessions per day, focusing on different subjects.\n' +
      '4.  **Routine:** Keep sessions positive and end before your child loses interest.',
  },
  {
    key: 'tips',
    title: 'Daily Routine & Tips',
    icon: 'bulb-outline' as const,
    content:
      '•  Keep sessions short and fun, ideally under 5 minutes.\n' +
      '•  Incorporate sessions into your daily routine, like after meals.\n' +
      '•  Praise and encourage your child’s effort, not just their answers.\n' +
      '•  Consistency is more important than intensity. Enjoy the journey!',
  },
  {
    key: 'quotes',
    title: 'Inspiring Quotes',
    icon: 'chatbox-ellipses-outline' as const,
    content:
      '“The mind is not a vessel to be filled, but a fire to be kindled.”\n— Plutarch\n\n' +
      '“A person who never made a mistake never tried anything new.”\n— Albert Einstein',
  },
];

type NavProp = NativeStackNavigationProp<RootStackParamList>;

// --- NEW AccordionItem Component ---
type AccordionItemProps = {
  section: (typeof sections)[0];
  initiallyOpen?: boolean;
};

const AccordionItem = ({ section, initiallyOpen = false }: AccordionItemProps) => {
  const [contentHeight, setContentHeight] = useState(0);
  const isOpen = useSharedValue(initiallyOpen);
  const rotation = useSharedValue(initiallyOpen ? 180 : 0);

  const animatedStyle = useAnimatedStyle(() => {
    // Animate the height from 0 to its measured height
    return {
      height: withTiming(isOpen.value ? contentHeight : 0, { duration: 300 }),
    };
  });
  
  const animatedIconStyle = useAnimatedStyle(() => {
    // Animate the chevron icon rotation
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

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
  // ... (All other styles like container, safeArea, header, titles, button remain the same)
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
  },
  backButton: {
    padding: 8,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 120, // Extra padding to ensure last item is not hidden by sticky button
  },
  mainTitle: {
    fontSize: 32,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
    lineHeight: 24,
  },
  // Accordion Section Styles
  sectionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EAEAEA'
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    marginRight: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#382E1C',
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
  },
  animatedBody: {
    overflow: 'hidden', // This is crucial for height animation
  },
  contentWrapper: {
    // This wrapper is measured for its height
    position: 'absolute', // <<< THE FIX IS HERE
    width: '100%',        // <<< AND HERE
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  sectionContent: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
  },
  // Sticky Button Styles
  stickyButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 30 : 24, // Adjust for home indicator on iOS
    paddingTop: 12,
    backgroundColor: 'rgba(255, 251, 242, 0.8)', // Match background with opacity
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA'
  },
  button: {
    backgroundColor: '#4D96FF',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 5 }, shadowRadius: 10 },
      android: { elevation: 8 },
    }),
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif' }),
  },
});