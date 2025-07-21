// app/utils/generateSessionSlides.tsx
import React, { JSX } from 'react';
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
import i18n from '../src/i18n';

export interface Slide {
  type: 'language' | 'encyclopedia' | 'math';
  id: string;
  content: JSX.Element;
}

interface LanguageWord {
  id: string;
  title_en: string;
  title_af: string;
}

interface EncyclopediaItem {
  id?: string;
  image: string;
  title_en: string;
  title_af: string;
  fact_en: string;
  fact_af: string;
}

function FullSlide({ children }: { children: React.ReactNode }) {
  const { width, height } = useWindowDimensions();
  return (
    <SafeAreaView style={[styles.slide, { width, height }]}> 
      <View style={styles.slideInner}>{children}</View>
    </SafeAreaView>
  );
}

export async function generateSessionSlides(
  week: number,
  profile: ChildProfile
): Promise<Slide[]> {
  try {
    const data = await loadWeekData(week);
    if (!data) throw new Error(`No data for week ${week}`);

    const shuffle = <T,>(arr: T[]): T[] => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const languageSlides: Slide[] = shuffle(
      (data.language ?? []).map((w: LanguageWord, i) => ({
        type: 'language',
        id: `lang-${i}`,
        content: (
          <FullSlide key={`lang-${i}`}>
            <Text style={styles.languageText}>
              {i18n.language === 'af' ? w.title_af : w.title_en}
            </Text>
          </FullSlide>
        ),
      }))
    );

    const encyclopediaSlides: Slide[] = shuffle(
      (data.encyclopedia ?? [] as EncyclopediaItem[]).map((item, i) => ({
        type: 'encyclopedia',
        id: item.id || `ency-${i}`,
        content: (
          <FullSlide key={`ency-${i}`}>
            <Image source={imageMap[item.image] || imageMap['dog.svg']} style={styles.image} />
            <Text style={styles.title}>
              {i18n.language === 'af' ? item.title_af : item.title_en}
            </Text>
            <Text style={styles.fact}>
              {i18n.language === 'af' ? item.fact_af : item.fact_en}
            </Text>
          </FullSlide>
        ),
      }))
    );

    const mathSlides: Slide[] = [];
    const isNum = (n: any): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 0;

    if (week <= 10) {
      const len = data.mathWindowLength ?? 10;
      const start = data.mathWindowStart ?? 1;
      for (let i = 0; i < len; i++) {
        const count = start + i;
        if (isNum(count)) {
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

      if (sum?.sum) {
        operands = ['a','b','c'].map(k => sum[k]).filter(isNum);
        result = sum.sum;
        ops = sum.ops || Array(operands.length-1).fill('+');
      } else if (diff?.difference) {
        operands = ['a','b','c'].map(k => diff[k]).filter(isNum);
        result = diff.difference;
        ops = diff.ops || Array(operands.length-1).fill('-');
      } else if (prod?.product) {
        operands = ['a','b'].map(k => prod[k]).filter(isNum);
        result = prod.product;
        ops = ['×'];
      } else if (quot?.quotient) {
        operands = ['a','b'].map(k => quot[k]).filter(isNum);
        result = quot.quotient;
        ops = ['÷'];
      }

      if (operands.every(isNum) && isNum(result)) {
        operands.forEach((val,i) => mathSlides.push({
          type:'math', id:`math-op${i}`, content:(
            <FullSlide key={`math-op${i}`}>
              <DotBoard count={val}/>
              <Text style={styles.countText}>🔵 Operand {i+1}: {val}</Text>
            </FullSlide>
          )
        }));

        mathSlides.push({
          type:'math', id:'math-res', content:(
            <FullSlide key="math-res">
              <DotBoard count={result}/>
              <Text style={styles.countText}>🔵 Result: {result}</Text>
            </FullSlide>
          )
        });

        const equation = operands.map((v,i)=> i===0?`${v}`:`${ops[i-1]} ${v}`).join(' ') + ` = ${result}`;
        mathSlides.push({
          type:'math', id:'math-eq', content:(
            <FullSlide key="math-eq">
              <Text style={styles.equationText}>🧮 {equation}</Text>
            </FullSlide>
          )
        });
      } else {
        mathSlides.push({
          type:'math', id:'math-fallback', content:(
            <FullSlide key="math-fallback">
              <Text style={styles.equationText}>⚠️ No math equation found for today</Text>
            </FullSlide>
          )
        });
      }
    }

    return [...languageSlides, ...encyclopediaSlides, ...mathSlides];
  } catch (err) {
    console.error('Failed to generate session slides:', err);
    return [];
  }
}

const styles = StyleSheet.create({
  slide: { flex:1, backgroundColor:'#FFF', paddingHorizontal:24 },
  slideInner: { flex:1, alignItems:'center', justifyContent:'center', paddingVertical:24 },
  languageText: { fontSize:60, fontFamily:'ComicSans', color:'#382E1C', textAlign:'center', marginBottom:24 },
  image: { width:'250%', height:'70%', borderRadius:20, resizeMode:'contain', marginBottom:16 },
  title: { fontSize:40, fontFamily:'ComicSans', color:'#382E1C', textAlign:'center', marginBottom:8 },
  fact: { fontSize:12, fontFamily:'ComicSans', color:'#555', textAlign:'center', marginBottom:24 },
  countText: { fontSize:18, fontFamily:'ComicSans', color:'#382E1C', textAlign:'center', marginTop:12, marginBottom:24 },
  equationText: { fontSize:20, fontFamily:'ComicSans', color:'#382E1C', textAlign:'center', marginTop:12, marginBottom:24 },
});