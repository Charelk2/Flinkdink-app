// app/utils/generateSessionSlides.ts
import React from 'react';
import { loadWeekData } from './loadWeekData';
import DotBoard from '../src/components/DotBoard'; // ✅ if you're inside /app/utils/
import { Image, Text, View } from 'react-native';
import { imageMap } from './imageMap';


export async function generateSessionSlides(week: number) {
  const data = await loadWeekData(week);

  const language = data.language.map((word: string, i: number) => ({
    type: 'language',
    id: `lang-${i}`,
    content: (
      <View
        key={`lang-${i}`}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
          backgroundColor: '#FFFBF2',
        }}
      >
        <Text
          style={{
            fontSize: 40,
            fontFamily: 'ComicSans',
            color: '#382E1C',
            textAlign: 'center',
          }}
        >
          {word}
        </Text>
      </View>
    ),
  }));

  const encyclopedia = data.encyclopedia.map((item: any, i: number) => ({
    type: 'encyclopedia',
    id: item.id,
    content: (
      <View
        key={`ency-${i}`}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
          backgroundColor: '#FFFBF2',
        }}
      >
        <Image
          source={imageMap[item.image] || imageMap['dog.svg']}
          style={{
            width: 220,
            height: 220,
            borderRadius: 20,
            marginBottom: 16,
          }}
        />
        <Text
          style={{
            fontSize: 24,
            fontFamily: 'ComicSans',
            color: '#382E1C',
            marginBottom: 8,
            textAlign: 'center',
          }}
        >
          {item.title}
        </Text>
        <Text
          style={{
            fontSize: 16,
            fontFamily: 'ComicSans',
            color: '#555',
            textAlign: 'center',
          }}
        >
          {item.fact}
        </Text>
      </View>
    ),
  }));

  const mathLength = data.mathWindowLength ?? 10;
  const mathStart = data.mathWindowStart ?? 1;

  const math = Array.from({ length: mathLength }, (_, i) => mathStart + i).map((n, i) => ({
    type: 'math',
    id: `math-${n}`,
    content: (
      <View
        key={`math-${n}`}
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
          backgroundColor: '#FFFBF2',
        }}
      >
        <DotBoard count={n} />
        <Text
          style={{
            fontSize: 16,
            marginTop: 10,
            fontFamily: 'ComicSans',
            color: '#999',
          }}
        >
          Count: {n}
        </Text>
      </View>
    ),
  }));

  return [...language, ...encyclopedia, ...math];
}
