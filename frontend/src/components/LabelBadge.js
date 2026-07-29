import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/colors';

// label: 'AI' | 'Real'
export default function LabelBadge({ label, style }) {
  const isAI = label === 'AI';
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: isAI ? colors.danger : colors.primary },
        style,
      ]}
    >
      <Text style={[styles.text, { color: isAI ? '#fff' : '#0A0A0F' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 15,
    fontWeight: '700',
  },
});
