import React, { forwardRef } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme/colors';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

const ShareResultCard = forwardRef(({ result }, ref) => {
  const label = result.is_ai_generated;
  const accent = label ? colors.danger : colors.primary;
  const aiScore = (result.ai_probability * 100).toFixed(1);

  return (
    <View ref={ref} style={styles.card} collapsable={false}>
      <View style={styles.resultCard}>
        <View>
          {result.thumbnail_url ? (
            <Image source={{ uri: result.thumbnail_url }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbPlaceholder]} />
          )}
          <View style={[styles.badge, { backgroundColor: accent + '22', borderColor: accent }]}>
            <Text style={[styles.badgeText, { color: accent }]}>{label ? 'AI' : 'Real'}</Text>
          </View>
        </View>

        <View style={styles.resultInfo}>
          <Text style={styles.caption}>AI 생성 확률</Text>
          <Text style={[styles.scoreText, { color: accent }]}>{aiScore}%</Text>
          <Text style={styles.description}>
            {label ? '이 숏폼은 AI가\n생성했을 확률이 높아요.' : '이 숏폼은 AI가\n생성했을 확률이 낮아요.'}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={[styles.infoRow, styles.infoRowBorder]}>
          <Text style={styles.infoLabel}>판정 결과</Text>
          <View style={[styles.verdictPill, { backgroundColor: accent + '22', borderColor: accent }]}>
            <Text style={[styles.verdictPillText, { color: accent }]}>{label ? 'AI' : 'Real'}</Text>
          </View>
        </View>

        <View style={[styles.infoRow, styles.infoRowBorder]}>
          <Text style={styles.infoLabel}>Title</Text>
          <Text style={styles.infoValue} numberOfLines={1}>{result.title || '-'}</Text>
        </View>

        <View style={[styles.infoRow, styles.infoRowBorder]}>
          <Text style={styles.infoLabel}>Keyword</Text>
          <View style={styles.keywordRow}>
            {result.keywords && result.keywords.length > 0 ? (
              result.keywords.split(',').map((kw) => (
                <View key={kw} style={styles.keywordChip}>
                  <Text style={styles.keywordChipText}>#{kw.trim()}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.infoValue}>-</Text>
            )}
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>분석일</Text>
          <Text style={styles.infoValue}>{formatDate(result.date)}</Text>
        </View>
      </View>

      <Image
        source={require('../../img/logo_text.png')}
        style={styles.watermarkLogo}
        resizeMode="contain"
      />
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    width: 340,
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    width: '100%',
  },
  thumb: { width: 100, height: 130, borderRadius: radius.md },
  thumbPlaceholder: { backgroundColor: colors.surfaceAlt },
  badge: {
    position: 'absolute',
    top: 7,
    left: 7,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 0.5,
  },
  badgeText: { fontSize: 13, fontWeight: '700' },
  resultInfo: { flex: 1, marginLeft: spacing.md, justifyContent: 'center', alignItems: 'center' },
  caption: { fontSize: 15, color: colors.textPrimary },
  scoreText: { fontSize: 34, fontWeight: '800', marginTop: 4 },
  description: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' },

  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  infoRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: { fontSize: 14, color: colors.textSecondary, fontWeight: '600' },
  infoValue: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
    marginLeft: spacing.md,
  },
  verdictPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    borderWidth: 0.5,
  },
  verdictPillText: { fontSize: 13, fontWeight: '700' },
  keywordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    flex: 1,
    marginLeft: spacing.md,
    gap: 6,
  },
  keywordChip: {
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  keywordChipText: { fontSize: 12.5, color: colors.textPrimary, fontWeight: '600' },

  watermarkLogo: {
    width: 100,
    height: 22,
    marginTop: spacing.lg,
    marginRight: -spacing.sm,
    alignSelf: 'flex-end',
  },
});

export default ShareResultCard;