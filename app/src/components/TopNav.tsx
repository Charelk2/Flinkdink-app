// app/src/components/TopNav.tsx
import React from 'react'
import {
  View,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

export interface TopNavProps {
  onHomePress(): void
  onMenuPress(): void
}

export default function TopNav({ onHomePress, onMenuPress }: TopNavProps) {
  const insets = useSafeAreaInsets()
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity onPress={onHomePress} style={styles.button}>
        <Ionicons name="home-outline" size={24} color="#382E1C" />
      </TouchableOpacity>
      <TouchableOpacity onPress={onMenuPress} style={styles.button}>
        <Ionicons name="menu" size={24} color="#382E1C" />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,                // nav‐bar height
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#FFFBF2',
    zIndex: 10,
  },
  button: {
    padding: 8,
  },
})
