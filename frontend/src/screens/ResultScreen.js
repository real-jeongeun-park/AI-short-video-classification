import React from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme/colors';
import LabelBadge from '../components/LabelBadge';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
};

export default function ResultScreen({ navigation, route }) {
  const result = route?.params?.result;

  if (!result) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.textPrimary }}>결과 정보를 불러올 수 없습니다.</Text>
      </View>
    );
  }

  const label = result.is_ai_generated;
  const accent = label ? colors.danger : colors.primary;
  const aiScore = Math.round((result.ai_probability || 0) * 100);
  const keywords = result.keywords || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>분석 결과</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.urlBox}>
        <Feather name="link" size={16} color={colors.textSecondary} />
        <Text style={styles.urlText} numberOfLines={1}>{result.url}</Text>
      </View>

      <View style={styles.resultCard}>
        <View>
          {result.thumbnail ? (
            <Image source={{ uri: result.thumbnail }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbPlaceholder]}>
              <Feather name="video" size={24} color={colors.textPlaceholder} />
            </View>
          )}
          <LabelBadge label={label} style={styles.badge} />
        </View>
        <View style={styles.resultInfo}>
          <Text style={styles.caption}>AI 생성 확률</Text>
          <Text style={[styles.scoreText, { color: accent }]}>{aiScore}%</Text>
          <Text style={styles.description}>
            {label ? '이 숏폼은 AI가\n생성했을확률이 높아요.' : '이 숏폼은 AI가\n생성했을 확률이 낮아요.'}
          </Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={[styles.infoRow, styles.infoRowBorder]}>
          <Text style={styles.infoLabel}>판정 결과</Text>
          <View style={[styles.verdictPill, { backgroundColor: accent + '22', borderColor: accent }]}>
            <Text style={[styles.verdictPillText, { color: accent }]}>{label ? "AI" : "Real"}</Text>
          </View>
        </View>

        <View style={[styles.infoRow, styles.infoRowBorder]}>
          <Text style={styles.infoLabel}>Title</Text>
          <Text style={styles.infoValue} numberOfLines={1}>{result.title || '-'}</Text>
        </View>

        <View style={[styles.infoRow, styles.infoRowBorder]}>
          <Text style={styles.infoLabel}>Keyword</Text>
          <View style={styles.keywordRow}>
            {keywords.length > 0 ? (
              keywords.map((kw) => (
                <View key={kw} style={styles.keywordChip}>
                  <Text style={styles.keywordChipText}>#{kw}</Text>
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

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.saveBtn}>
          <Feather name="bookmark" size={16} color={accent} />
          <Text style={[styles.saveBtnText, { color: accent }]}>결과 저장</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.shareBtn, { backgroundColor: accent }]}>
          <Text style={styles.shareBtnText}>공유하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' },
  urlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    height: 52,
    marginTop: 30,
  },
  urlText: { color: colors.textSecondary, marginLeft: spacing.sm, flex: 1 },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  thumb: { width: 100, height: 130, borderRadius: radius.md },
  thumbPlaceholder: {
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: { position: 'absolute', top: 7, left: 7 },
  resultInfo: { flex: 1, marginLeft: spacing.md, justifyContent: 'center', alignItems: 'center' },
  caption: { fontSize: 15, color: colors.textPrimary },
  scoreText: { fontSize: 34, fontWeight: '800', marginTop: 4 },
  description: { fontSize: 16, color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' },

  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
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
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'left',
  },
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
  verdictPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
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
  keywordChipText: {
    fontSize: 12.5,
    color: colors.textPrimary,
    fontWeight: '600',
  },

  actionRow: { flexDirection: 'row', marginTop: spacing.lg },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    marginRight: spacing.md,
  },
  saveBtnText: { marginLeft: spacing.sm, fontWeight: '700' },
  shareBtn: { flex: 1.5, height: 56, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  shareBtnText: { color: '#0A0A0F', fontWeight: '700' },
});