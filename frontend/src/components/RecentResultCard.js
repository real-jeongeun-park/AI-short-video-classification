import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';
import LabelBadge from './LabelBadge';

export default function RecentResultCard({ item, onPress }) {
  const accent = item.label === 'AI' ? colors.danger : colors.primary;

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.thumbnail }} style={styles.image} />
        <LabelBadge label={item.label} style={styles.badge} />
      </View>

      <View style={styles.info}>
        <Text numberOfLines={1} style={styles.itemTitle}>
          {item.title}
        </Text>
        <Text style={styles.caption}>
          AI 생성확률 <Text style={[styles.scoreInline, { color: accent }]}>{item.aiScore}%</Text>
        </Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
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
  info: {
    marginTop: spacing.md,
  },
  itemTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  caption: { color: colors.textSecondary, fontSize: 13, marginTop: 10 },
  scoreInline: { fontSize: 13, fontWeight: '600' },
  date: { color: colors.textSecondary, fontSize: 12, marginTop: spacing.xs },
});