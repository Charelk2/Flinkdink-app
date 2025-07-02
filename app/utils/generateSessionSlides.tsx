import type * as React from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions } from 'react-native';
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
    fontSize: 18,
    marginTop: 10,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    textAlign: 'center',
  },
  equationText: {
    fontSize: 20,
    fontFamily: 'ComicSans',
    color: '#382E1C',
    textAlign: 'center',
    marginTop: 12,
  },
});

export async function generateSessionSlides(
  week: number,
  profile: ChildProfile
): Promise<Slide[]> {
  try {
    const data = await loadWeekData(week);
    if (!data) throw new Error(`No data found for week ${week}`);

    const shuffleArray = <T,>(array: T[]): T[] => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

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

    const encyclopediaSlides: Slide[] = shuffleArray(
      (data.encyclopedia ?? []).map((item: any, i: number) => ({
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
      }))
    );

    const mathSlides: Slide[] = [];

    if (week <= 10) {
      const length = data.mathWindowLength ?? 10;
      const start = data.mathWindowStart ?? 1;
      for (let i = 0; i < length; i++) {
        const count = start + i;
        mathSlides.push({
          type: 'math',
          id: `count-${count}`,
          content: (
            <FullSlide key={`count-${count}`}>
              <DotBoard count={count} />
              <Text style={styles.countText}>🔢 Count: {count}</Text>
            </FullSlide>
          ),
        });
      }
    } else {
      const today = new Date();
      const dayIndex = (today.getDay() + 6) % 7; // Monday = 0
      const sessionIndex = await getTodaySessionCount(profile.id, week); // 0–2

      const sum = data.addition?.[dayIndex]?.[sessionIndex];
      const difference = data.subtraction?.[dayIndex]?.[sessionIndex];
      const product = data.multiplication?.[dayIndex]?.[sessionIndex];
      const quotient = data.division?.[dayIndex]?.[sessionIndex];

      let operands: number[] = [];
      let result: number | undefined;
      let ops: string[] = [];
      let label = '';
      let equation = '';

      if (sum) {
        operands = ['a', 'b', 'c'].map((k) => sum[k]).filter((n) => typeof n === 'number');
        result = sum.sum;
        ops = sum.ops || Array(operands.length - 1).fill('+');
        label = 'Addition';
      } else if (difference) {
        operands = ['a', 'b', 'c'].map((k) => difference[k]).filter((n) => typeof n === 'number');
        result = difference.difference;
        ops = difference.ops || Array(operands.length - 1).fill('-');
        label = 'Subtraction';
      } else if (product) {
        operands = ['a', 'b'].map((k) => product[k]).filter((n) => typeof n === 'number');
        result = product.product;
        ops = ['×'];
        label = 'Multiplication';
      } else if (quotient) {
        operands = ['a', 'b'].map((k) => quotient[k]).filter((n) => typeof n === 'number');
        result = quotient.quotient;
        ops = ['÷'];
        label = 'Division';
      }
      const isValid = (n: any) => typeof n === 'number' && Number.isInteger(n) && n >= 0;

      if (operands.every(isValid) && isValid(result)) {
        operands.forEach((value, i) => {
          mathSlides.push({
            type: 'math',
            id: `math-op${i}`,
            content: (
              <FullSlide key={`math-op${i}`}>
                <DotBoard count={value} />
                <Text style={styles.countText}>🔵 Operand {i + 1}: {value}</Text>
              </FullSlide>
            ),
          });
        });

        mathSlides.push({
          type: 'math',
          id: `math-res`,
          content: (
            <FullSlide key={`math-res`}>
              {typeof result === 'number' && <DotBoard count={result} />}
              <Text style={styles.countText}>🔵 Result: {result}</Text>
            </FullSlide>
          ),
        });

        equation = operands.map((val, i) =>
          i === 0 ? `${val}` : `${ops[i - 1]} ${val}`
        ).join(' ') + ` = ${result}`;

        mathSlides.push({
          type: 'math',
          id: `math-eq`,
          content: (
            <FullSlide key={`math-eq`}>
              <Text style={styles.equationText}>🧮 {equation}</Text>
            </FullSlide>
          ),
        });

        console.log(`🧠 ${label}: Day ${dayIndex + 1}, Session ${sessionIndex + 1}: ${equation}`);
      } else {
        console.warn(`⚠️ No math found for week ${week}, day ${dayIndex + 1}, session ${sessionIndex + 1}`);
      }
    }

    return [...languageSlides, ...encyclopediaSlides, ...mathSlides];
  } catch (err) {
    console.error('🔥 Failed to generate session slides:', err);
    return [];
  }
}
