import React from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme/colors';
import LabelBadge from '../components/LabelBadge';
import { mockAnalysisResult } from '../data/mockData';

export default function ResultScreen({ navigation, route }) {
  const result = route?.params?.result || mockAnalysisResult;
  const isAI = result.label === 'AI';
  const accent = isAI ? colors.danger : colors.primary;

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
        <Text style={styles.urlText}>{result.url}</Text>
      </View>

      <View style={styles.resultCard}>
        <View>
          <Image source={{ uri: result.thumbnail }} style={styles.thumb} />
          <LabelBadge label={result.label} style={styles.badge} />
        </View>
        <View style={styles.resultInfo}>
          <Text style={styles.caption}>AI 생성 확률</Text>
          <Text style={[styles.scoreText, { color: accent }]}>{result.aiScore}%</Text>
          <Text style={styles.description}>
            {result.description ||
              (isAI ? '이 숏폼은 AI가 생성했을 확률이 높아요' : '이 숏폼은 AI가 생성했을 확률이 낮아요')}
          </Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>판정 근거</Text>
      {(result.evidence || []).map((ev) => (
        <View key={ev.key} style={styles.evidenceRow}>
          <View style={styles.evidenceBarBg}>
            <View
              style={[
                styles.evidenceBarFill,
                { width: `${ev.score}%`, backgroundColor: accent },
              ]}
            />
          </View>
          <Text style={[styles.evidenceScore, { color: accent }]}>{ev.score}%</Text>
          <Text style={styles.evidenceLabel}>{ev.key}</Text>
        </View>
      ))}

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.saveBtn}>
          <Feather name="bookmark" size={16} color={colors.primary} />
          <Text style={styles.saveBtnText}>결과 저장</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.shareBtn, { backgroundColor: accent }]}>
          <Text style={styles.shareBtnText}>공유하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg ,paddingTop: spacing.xl},
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
    marginTop: spacing.lg,marginTop: 30
  },
  urlText: { color: colors.textSecondary, marginLeft: spacing.sm },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
  },
  thumb: { width: 100, height: 130, borderRadius: radius.md },
  badge: { position: 'absolute', top: 7, left: 7},
  resultInfo: { flex: 1, marginLeft: spacing.md, justifyContent: 'center' },
  caption: { color: colors.textSecondary },
  scoreText: { fontSize: 34, fontWeight: '800', marginTop: 4 },
  description: { color: colors.textSecondary, marginTop: spacing.sm },
  sectionTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '700', marginTop: 60, marginBottom: spacing.md },
  evidenceRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  evidenceBarBg: { flex: 1, height: 8, borderRadius: 4, backgroundColor: colors.surfaceAlt, overflow: 'hidden', marginRight: spacing.sm },
  evidenceBarFill: { height: '100%', borderRadius: 4 },
  evidenceScore: { width: 44, fontWeight: '700' },
  evidenceLabel: { width: 90, color: colors.textSecondary, textAlign: 'right' },
  actionRow: { flexDirection: 'row', marginTop: spacing.md },
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
  saveBtnText: { color: colors.primary, marginLeft: spacing.sm, fontWeight: '700' },
  shareBtn: { flex: 1.5, height: 56, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  shareBtnText: { color: '#0A0A0F', fontWeight: '700' },
});
