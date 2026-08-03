import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, typography } from '../theme/colors';
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";

const MENU = [
  { key: 'edit', label: '프로필 수정', icon: 'user' },
  { key: 'saved', label: '저장된 결과', icon: 'bookmark' },
  { key: 'about', label: '앱 정보', icon: 'info' },
  { key: 'logout', label: '로그아웃', icon: 'log-out' },
];

// 총 판정 수 기반 상위 퍼센트 계산 (임시 로직 - 추후 서버 값으로 교체)
function calculatePercentile(totalJudgements) {
  const tiers = [
    { min: 100, percentile: 5 },
    { min: 50, percentile: 10 },
    { min: 30, percentile: 20 },
    { min: 15, percentile: 35 },
    { min: 5, percentile: 60 },
    { min: 0, percentile: 90 },
  ];
  const matched = tiers.find((t) => totalJudgements >= t.min);
  return matched ? matched.percentile : 90;
}

export default function ProfileScreen({ navigation }) {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const loadUserInfo = async () => {
      const savedNickname = await SecureStore.getItemAsync("nickname");
      const savedEmail = await SecureStore.getItemAsync("email");

      if (savedNickname) setNickname(savedNickname);
      if (savedEmail) setEmail(savedEmail);
    };

    loadUserInfo();
  }, []);

  const percentile = calculatePercentile(100);

  const handleMenuPress = (key) => {
    if (key === 'edit') navigation.navigate('EditProfile');
    if (key === 'saved') navigation.navigate('SavedResults');
    if (key === 'logout') navigation.getParent()?.replace?.('Splash');
    // 'about'은 임시로 동작 없음
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        <LinearGradient colors={[colors.primary, colors.danger]} style={styles.avatar}>
          <Feather name="user" size={40} color="#fff" />
        </LinearGradient>
      </View>
      <Text style={styles.nickname}>{nickname}</Text>
      <Text style={styles.email}>{email}</Text>

      <View style={styles.statRow}>
        {/* 좌측: 총 판정 수 */}
        <View style={styles.countCard}>
          <Text style={styles.countValue}>?</Text>
          <Text style={styles.countLabel}>총 판정 수</Text>
        </View>

        {/* 우측: 상위 n% 카드 */}
        <View style={styles.percentileCard}>
          <LinearGradient
            colors={[colors.gradientStart + '22', colors.danger + '22']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <View style={styles.percentileIconWrap}>
            <Feather name="award" size={23} color={colors.danger} />
          </View>
          <Text style={styles.percentileText}>
            <Text style={styles.percentileUsername}>{nickname}</Text>
            <Text style={styles.percentileSub}> 님은</Text>
          </Text>
          <Text style={styles.percentileText}>
            <Text style={styles.percentileValue}>상위 {percentile}%</Text>
            <Text style={styles.percentileSub}> 사용자입니다</Text>
          </Text>
        </View>
      </View>

      <View style={styles.menuCard}>
        {MENU.map((item, idx) => (
          <TouchableOpacity
            key={item.key}
            style={[styles.menuRow, idx < MENU.length - 1 && styles.menuRowBorder]}
            onPress={() => handleMenuPress(item.key)}
          >
            <Feather name={item.icon} size={18} color={colors.primary} />
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, alignItems: 'center', paddingTop: 40 },
  avatarWrap: { marginTop: spacing.xl },
  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  nickname: { ...typography.h2, color: colors.textPrimary, marginTop: spacing.md },
  email: { color: colors.textSecondary, marginTop: 4 },

  statRow: { flexDirection: 'row', width: '100%', marginTop: spacing.xl },

  countCard: {
    width: 96,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    marginRight: spacing.sm,
  },
  countValue: { fontSize: 28, fontWeight: '800', color: colors.textPrimary },
  countLabel: { color: colors.textSecondary, fontSize: 11, marginTop: 4, textAlign: 'center' },

  percentileCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  percentileIconWrap: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  percentileText: { fontSize: 15, lineHeight: 22 },
  percentileUsername: { color: colors.textPrimary, fontWeight: '700' },
  percentileSub: { color: colors.textSecondary },
  percentileValue: { color: colors.primary, fontWeight: '800', fontSize: 17 },

  menuCard: { width: '100%', backgroundColor: colors.surface, borderRadius: radius.md, marginTop: spacing.lg },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLabel: { color: colors.textPrimary, marginLeft: spacing.md, fontSize: 15 },
});