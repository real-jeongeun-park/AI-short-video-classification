import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/colors';

export default function LabelBadge({ label, style }) {
  const isAI = label === 'AI';
  const accent = isAI ? colors.danger : colors.primary;

  return (
    <View style={[styles.pill, { backgroundColor: accent + '50', borderColor: accent }, style]}>
      <Text style={[styles.text, { color: accent }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 0.5,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
  },
});