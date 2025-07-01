import type * as React from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
import { loadWeekData } from './loadWeekData';
import DotBoard from '../src/components/DotBoard';
import { imageMap } from './imageMap';
import { ChildProfile } from '../src/models/types';

export interface Slide {
  type: 'language' | 'encyclopedia' | 'math';
  id: string;
  content: JSX.Element;
}

export async function generateSessionSlides(
  week: number,
  profile: ChildProfile
): Promise<Slide[]> {
  const data = await loadWeekData(week);
  if (!data) throw new Error(`No data found for week ${week}`);

  const languageSlides: Slide[] = (data.language ?? []).map((word: string, i: number) => ({
    type: 'language',
    id: `lang-${i}`,
    content: (
      <FullSlide key={`lang-${i}`}>
        <Text style={styles.languageText}>{word}</Text>
      </FullSlide>
    ),
  }));

  const encyclopediaSlides: Slide[] = (data.encyclopedia ?? []).map((item: any, i: number) => ({
    type: 'encyclopedia',
    id: item.id || `ency-${i}`,
    content: (
      <FullSlide key={`ency-${i}`}>
        <Image
          source={imageMap[item.image] || imageMap['dog.svg']}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.fact}>{item.fact}</Text>
      </FullSlide>
    ),
  }));

  const mathLength = data.mathWindowLength ?? 10;
  const mathStart = data.mathWindowStart ?? 1;

  const mathSlides: Slide[] = Array.from({ length: mathLength }, (_, i) => {
    const count = mathStart + i;
    return {
      type: 'math',
      id: `math-${count}`,
      content: (
        <FullSlide key={`math-${count}`}>
          <DotBoard count={count} />
          <Text style={styles.countText}>Count: {count}</Text>
        </FullSlide>
      ),
    };
  });

  return [...languageSlides, ...encyclopediaSlides, ...mathSlides];
}

function FullSlide({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  return (
    <View style={[styles.slide, { width, height }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFBF2',
    paddingHorizontal: 24,
  },
  languageText: {
    fontSize: 40,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    textAlign: 'center',
  },
  image: {
    width: 220,
    height: 220,
    borderRadius: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    marginBottom: 8,
    textAlign: 'center',
  },
  fact: {
    fontSize: 16,
    fontFamily: 'ComicSans',
    color: '#555',
    textAlign: 'center',
  },
  countText: {
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'ComicSans',
    color: '#999',
  },
});
