// app/src/screens/CurriculumScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';

const CurriculumScreen = () => {
  const handleSelectWeek = (week: number) => {
    Alert.alert(
      'Change Week?',
      `Are you sure you want to jump to Week ${week}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Yes', onPress: () => console.log('Jump to week', week) },
      ],
      { cancelable: true }
    );
  };

  const currentWeek = 5;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Curriculum Outline</Text>

      <View style={styles.grid}>
        {Array.from({ length: 40 }).map((_, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.weekButton,
              i === currentWeek - 1 ? styles.currentWeek : null,
            ]}
            onPress={() => handleSelectWeek(i + 1)}
          >
            <Text style={styles.weekText}>Week {i + 1}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  weekButton: {
    backgroundColor: '#F4C542',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    margin: 6,
  },
  currentWeek: {
    backgroundColor: '#00C896',
  },
  weekText: {
    fontSize: 16,
    fontFamily: 'ComicSans',
    color: '#382E1C',
  },
});

export default CurriculumScreen;