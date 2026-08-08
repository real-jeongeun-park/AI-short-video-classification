import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import * as SecureStore from 'expo-secure-store';
import { colors, typography, spacing, radius } from '../theme/colors';

export default function AnalyzingScreen({ navigation, route }) {
  const url = route?.params?.url
  const cleaned_url = url.split("?")[0]
  
  const [userId, setUserId] = useState(null);
  const [progress, setProgress] = useState(0.1);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
      const loadUserInfo = async () => {
        const savedUserId = await SecureStore.getItemAsync("userId");
        if (savedUserId) setUserId(savedUserId);
      };
  
      loadUserInfo();
  }, []);

  useEffect(() => {
    let isMounted = true;
    let progressInterval;

    if (!userId){
      return;
    }

    const analyze = async () => {
      try {
        // 실제 진행률을 알 수 없으니, 백엔드 응답 오기 전까지 가짜로 서서히 채워줌
        progressInterval = setInterval(() => {
          setProgress((prev) => (prev < 0.9 ? prev + 0.05 : prev));
        }, 500);


        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/model/detect/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: cleaned_url,
            user_id: Number(userId),
          }),
        });

        const data = await response.json();

        if (!isMounted) return;

        clearInterval(progressInterval);

        if (!response.ok) {
          setErrorMsg(data.detail || "분석에 실패했습니다.");
          return;
        }

        setProgress(1);
        navigation.replace('Result', { result: data });

      } catch (error) {
        console.error("analyze error:", error);
        if (isMounted) setErrorMsg("분석 중 오류가 발생했습니다.");
      }
    };

    analyze();

    return () => {
      isMounted = false;
      clearInterval(progressInterval);
    };
  }, [userId]);

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
        <Text style={styles.urlText}>{cleaned_url}</Text>
      </View>

      {errorMsg ? (
        <View style={styles.center}>
          <Text style={[styles.statusTitle, { color: colors.danger }]}>분석 실패</Text>
          <Text style={styles.statusSub}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.retryBtnText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      ) : (
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
      )}

      <View style={styles.stepList}>
        <StepRow label="영상 다운로드 완료" done={progress > 0.3} />
        <StepRow label="데이터 분석" done={progress > 0.6} />
        <StepRow label="AI 패턴 분석 중..." done={progress >= 1} />
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
  retryBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  retryBtnText: { color: colors.textPrimary, fontWeight: '600' },
});