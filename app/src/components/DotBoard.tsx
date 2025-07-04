// app/src/components/DotBoard.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { generateDotPositions } from '../../utils/randomDots';

interface DotBoardProps {
  count: number;
}

const DotBoard: React.FC<DotBoardProps> = ({ count }) => {
  // ❗️ Guard against invalid count values
  const numericCount = Number(count);if (!Number.isInteger(numericCount) || numericCount < 0 || numericCount > 1000) {
    console.warn('🚫 Invalid DotBoard count:', count);
    return null;
  }
  if (!Number.isInteger(count) || count < 0 || count > 1000) {
    console.warn('🚫 Invalid DotBoard count:', count);
    return null;
  }

  const dots = generateDotPositions(numericCount);

  return (
    <View style={styles.board}>
      {dots.map((pos, i) => (
        <View
          key={i}
          style={[styles.dot, { top: pos.top as any, left: pos.left as any }]}
        />
      ))}
    </View>
  );
};


const styles = StyleSheet.create({
  board: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 40, // optional
    paddingBottom: 40,
  },
  dot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
  },
  container: {
    maxWidth: 500,
    width: '100%',
  }
});

export default DotBoard;