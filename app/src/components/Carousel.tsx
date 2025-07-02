import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useActiveProfile } from '../context/ActiveProfileContext';
import { RootStackParamList } from '../navigation/types';
import { generateSessionSlides } from '../../utils/generateSessionSlides';
import { Slide } from '../models/types';

export default function Carousel() {
  const { activeProfile } = useActiveProfile();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!activeProfile) return;
      const week = 1; // TODO: make dynamic
      const content = await generateSessionSlides(week, activeProfile);
      setSlides(content);
      setLoading(false);
    };
    load();
  }, [activeProfile]);

  const goNext = () => {
    if (index < slides.length - 1) {
      setIndex(index + 1);
    } else {
      navigation.replace('SessionComplete');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#382E1C" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {slides[index]?.content}
      <TouchableOpacity onPress={goNext} style={styles.nextButton}>
        <Text style={styles.nextText}>Next</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBF2',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFBF2',
  },
  nextButton: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#00B4D8',
    borderRadius: 12,
  },
  nextText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'ComicSans',
  },
});
