// app/src/components/DotBoard.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { generateDotPositions } from '../../utils/randomDots';

interface DotBoardProps {
  count: number;
}

const DotBoard: React.FC<DotBoardProps> = ({ count }) => {
  const dots = generateDotPositions(count);

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
    width: '100%',
    height: 200,
    position: 'relative',
    backgroundColor: '#FFF8E7',
    borderRadius: 12,
    overflow: 'hidden',
  },
  dot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
  },
});

export default DotBoard;