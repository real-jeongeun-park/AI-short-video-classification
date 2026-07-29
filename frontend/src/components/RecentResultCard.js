import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius, typography, spacing } from '../theme/colors';
import LabelBadge from './LabelBadge';

export default function RecentResultCard({ item, onPress }) {
  const scoreColor = item.label === 'AI' ? colors.danger : colors.primary;
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.thumbnail }} style={styles.image} />
        <LabelBadge label={item.label} style={styles.badge} />
      </View>
      <Text style={styles.caption}>AI 생성 확률</Text>
      <Text style={[typography.h2, { color: scoreColor, marginTop: 2 }]}>
        {item.aiScore}%
      </Text>
      <Text numberOfLines={1} style={styles.url}>{item.url}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { width: 160, marginRight: spacing.md },
  imageWrap: {
    width: 160,
    height: 200,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surface,
  },
  image: { width: '100%', height: '100%' },
  badge: { position: 'absolute', top: 10, right: 10 },
  caption: { color: colors.textSecondary, fontSize: 13, marginTop: spacing.sm },
  url: { color: colors.textSecondary, fontSize: 11, marginTop: 4 },
});
