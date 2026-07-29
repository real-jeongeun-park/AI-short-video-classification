import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import { colors, typography, spacing, radius } from '../theme/colors';
import { mockAnalysisResult } from '../data/mockData';

export default function AnalyzingScreen({ navigation, route }) {
  const url = route?.params?.url || 'instagram.com/reel/abc123xyz';
  const [progress, setProgress] = useState(0.65);

  useEffect(() => {
    // TODO: 실제 분석 API 연동 시 polling/websocket 등으로 진행률을 갱신하세요.
    const timer = setTimeout(() => {
      navigation.replace('Result', { result: { ...mockAnalysisResult, url } });
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>분석 중</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.urlBox}>
        <Feather name="link" size={16} color={colors.textSecondary} />
        <Text style={styles.urlText}>{url}</Text>
      </View>

      <View style={styles.center}>
        <Progress.Circle
          size={140}
          progress={progress}
          color={colors.danger}
          unfilledColor={colors.surfaceAlt}
          borderWidth={0}
          thickness={8}
          showsText={false}
        />
        <Text style={styles.statusTitle}>AI 패턴 분석 중...</Text>
        <Text style={styles.statusSub}>영상 프레임을 심층 분석하고 있어요</Text>

        <View style={styles.progressBarWrap}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      <View style={styles.stepList}>
        <StepRow label="영상 다운로드 완료" done />
        <StepRow label="데이터 분석" done />
        <StepRow label="AI 패턴 분석 중..." done={false} />
      </View>
    </View>
  );
}

function StepRow({ label, done }) {
  return (
    <View style={styles.stepRow}>
      {done ? (
        <Feather name="check" size={18} color={colors.primary} />
      ) : (
        <View style={styles.stepCircle} />
      )}
      <Text style={[styles.stepLabel, { color: done ? colors.textPrimary : colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg,paddingTop: spacing.xl },
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
    marginTop: spacing.lg,
  },
  urlText: { color: colors.textSecondary, marginLeft: spacing.sm },
  center: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xl },
  statusTitle: { ...typography.h2, color: colors.textPrimary, marginTop: spacing.lg },
  statusSub: { color: colors.textSecondary, marginTop: spacing.sm },
  progressBarWrap: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.surfaceAlt,
    marginTop: spacing.lg,
    overflow: 'hidden',
  },
  progressBarFill: { height: '100%', backgroundColor: colors.primary },
  stepList: { marginTop: spacing.md },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  stepCircle: {
    width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: colors.border,
  },
  stepLabel: { marginLeft: spacing.sm, fontSize: 15 },
});