import type * as React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { loadWeekData } from './loadWeekData';
import DotBoard from '../src/components/DotBoard';
import { imageMap } from './imageMap';
import { ChildProfile } from '../src/models/types';
import { getTodaySessionCount } from './progress';

export interface Slide {
  type: 'language' | 'encyclopedia' | 'math';
  id: string;
  content: React.JSX.Element;
}

interface EncyclopediaItem {
  id?: string;
  image: string;
  title: string;
  fact: string;
}

function FullSlide({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();

  return (
    <SafeAreaView style={[styles.slide, { width, height }]}>      
      <View style={styles.slideInner}>        
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  slideInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24, // consistent top and bottom inset
  },
  languageText: {
    fontSize: 60,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    textAlign: 'center',
    marginBottom: 24,
  },
  image: {
    width: '200%',
    height: '70%',
    borderRadius: 20,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  title: {
    fontSize: 40,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    textAlign: 'center',
    marginBottom: 8,
  },
  fact: {
    fontSize: 12,
    fontFamily: 'ComicSans',
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
  },
  countText: {
    fontSize: 18,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  equationText: {
    fontSize: 20,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
});

export async function generateSessionSlides(
  week: number,
  profile: ChildProfile
): Promise<Slide[]> {
  try {
    const data = await loadWeekData(week);
    if (!data) throw new Error(`No data for week ${week}`);

    const shuffleArray = <T,>(array: T[]): T[] => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    // Language slides
    const languageSlides: Slide[] = shuffleArray(
      (data.language ?? []).map((word: string, i: number) => ({
        type: 'language',
        id: `lang-${i}`,
        content: (
          <FullSlide key={`lang-${i}`}>
            <Text style={styles.languageText}>{word}</Text>
          </FullSlide>
        ),
      }))
    );

    // Encyclopedia slides
    const encyclopediaSlides: Slide[] = shuffleArray(
      (data.encyclopedia ?? [] as EncyclopediaItem[]).map((item: EncyclopediaItem, i: number) => ({
        type: 'encyclopedia',
        id: item.id || `ency-${i}`,
        content: (
          <FullSlide key={`ency-${i}`}>
            <Image
              source={imageMap[item.image] || imageMap['dog.svg']}
              style={styles.image}
            />
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.fact}>{item.fact}</Text>
          </FullSlide>
        ),
      }))
    );

    // Math slides
    const mathSlides: Slide[] = [];
    const isValid = (n: any) => typeof n === 'number' && Number.isInteger(n) && n >= 0;

    if (week <= 10) {
      const length = data.mathWindowLength ?? 10;
      const start = data.mathWindowStart ?? 1;
      for (let i = 0; i < length; i++) {
        const count = start + i;
        if (isValid(count)) {
          mathSlides.push({
            type: 'math',
            id: `count-${count}`,
            content: (
              <FullSlide key={`count-${count}`}>
                <DotBoard count={count} />
                <Text style={styles.countText}>Count: {count}</Text>
              </FullSlide>
            ),
          });
        }
      }
    } else {
      const today = new Date();
      const dayIndex = (today.getDay() + 6) % 7;
      const sessionIndex = await getTodaySessionCount(profile.id, week);

      const sum = data.addition?.[dayIndex]?.[sessionIndex];
      const diff = data.subtraction?.[dayIndex]?.[sessionIndex];
      const prod = data.multiplication?.[dayIndex]?.[sessionIndex];
      const quot = data.division?.[dayIndex]?.[sessionIndex];

      let operands: number[] = [];
      let result: number | undefined;
      let ops: string[] = [];

      if (sum) {
        operands = ['a','b','c'].map(k => sum[k]).filter(isValid);
        result = sum.sum;
        ops = sum.ops || Array(operands.length - 1).fill('+');
      } else if (diff) {
        operands = ['a','b','c'].map(k => diff[k]).filter(isValid);
        result = diff.difference;
        ops = diff.ops || Array(operands.length - 1).fill('-');
      } else if (prod) {
        operands = ['a','b'].map(k => prod[k]).filter(isValid);
        result = prod.product;
        ops = ['×'];
      } else if (quot) {
        operands = ['a','b'].map(k => quot[k]).filter(isValid);
        result = quot.quotient;
        ops = ['÷'];
      }

      if (operands.every(isValid) && isValid(result)) {
        operands.forEach((val, i) => {
          mathSlides.push({
            type: 'math',
            id: `math-op${i}`,
            content: (
              <FullSlide key={`math-op${i}`}>
                <DotBoard count={val} />
                <Text style={styles.countText}>🔵 Operand {i+1}: {val}</Text>
              </FullSlide>
            ),
          });
        });

        mathSlides.push({
          type: 'math',
          id: 'math-res',
          content: (
            <FullSlide key="math-res">
              <DotBoard count={result!} />
              <Text style={styles.countText}>🔵 Result: {result}</Text>
            </FullSlide>
          ),
        });

        const equation = operands
          .map((v,i) => (i===0 ? `${v}` : `${ops[i-1]} ${v}`))
          .join(' ') + ` = ${result}`;

        mathSlides.push({
          type: 'math',
          id: 'math-eq',
          content: (
            <FullSlide key="math-eq">
              <Text style={styles.equationText}>🧮 {equation}</Text>
            </FullSlide>
          ),
        });
      } else {
        mathSlides.push({
          type: 'math',
          id: 'math-fallback',
          content: (
            <FullSlide key="math-fallback">
              <Text style={styles.equationText}>⚠️ No math equation found for today</Text>
            </FullSlide>
          ),
        });
      }
    }

    return [...languageSlides, ...encyclopediaSlides, ...mathSlides];
  } catch (err) {
    console.error('Failed to generate session slides:', err);
    return [];
  }
}
