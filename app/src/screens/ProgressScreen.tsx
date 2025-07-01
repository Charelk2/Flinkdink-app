// app/src/screens/ProgressScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useActiveProfile } from '../context/ActiveProfileContext';

const ProgressScreen = () => {
  const { activeProfile } = useActiveProfile();

  // For now we mock 5 completed weeks
  const completedWeeks = 5;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Your Progress</Text>
      <Text style={styles.subtitle}>
        {activeProfile?.name}'s 40-Week Learning Journey
      </Text>

      <View style={styles.grid}>
        {Array.from({ length: 40 }).map((_, i) => (
          <View
            key={i}
            style={[styles.box, i < completedWeeks ? styles.done : styles.todo]}
          />
        ))}
      </View>

      <Text style={styles.footer}>Weeks Completed: {completedWeeks} / 40</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBF2' },
  content: { padding: 24 },
  title: {
    fontSize: 32,
    fontFamily: 'ComicSans',
    textAlign: 'center',
    color: '#382E1C',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'ComicSans',
    textAlign: 'center',
    color: '#555',
    marginBottom: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 4,
    margin: 6,
  },
  done: { backgroundColor: '#00C896' },
  todo: { backgroundColor: '#D6D6D6' },
  footer: {
    fontSize: 16,
    fontFamily: 'ComicSans',
    textAlign: 'center',
    color: '#382E1C',
    marginTop: 24,
  },
});

export default ProgressScreen;
