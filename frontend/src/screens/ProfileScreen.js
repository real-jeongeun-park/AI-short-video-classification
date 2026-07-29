import React from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, typography } from '../theme/colors';
import { mockUser } from '../data/mockData';

const MENU = [
  { key: 'edit', label: '프로필 수정', icon: 'user' },
  { key: 'saved', label: '저장된 결과', icon: 'bookmark' },
  { key: 'about', label: '앱 정보', icon: 'info' },
  { key: 'logout', label: '로그아웃', icon: 'log-out' },
];

export default function ProfileScreen({ navigation }) {
  const { username, email, stats } = mockUser;

  const handleMenuPress = (key) => {
    if (key === 'edit') navigation.navigate('EditProfile');
    if (key === 'saved') navigation.navigate('SavedResults');
    if (key === 'logout') navigation.getParent()?.replace?.('Splash');
    // 'about'은 임시로 동작 없음
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrap}>
        {mockUser.avatarUrl ? (
          <Image source={{ uri: mockUser.avatarUrl }} style={styles.avatar} />
        ) : (
          <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.avatar}>
            <Feather name="user" size={40} color="#fff" />
          </LinearGradient>
        )}
      </View>
      <Text style={styles.username}>{username}</Text>
      <Text style={styles.email}>{email}</Text>

      <View style={styles.statRow}>
        <Stat label="총 판정 수" value={stats.totalJudgements} color={colors.textPrimary} />
        <Stat label="AI 탐지" value={stats.aiDetected} color={colors.danger} />
        <Stat label="Real 확인" value={stats.realConfirmed} color={colors.primary} />
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

function Stat({ label, value, color }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, alignItems: 'center',paddingTop: 40 },
  avatarWrap: { marginTop: spacing.xl },
  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  username: { ...typography.h2, color: colors.textPrimary, marginTop: spacing.md },
  email: { color: colors.textSecondary, marginTop: 4 },
  statRow: { flexDirection: 'row', width: '100%', marginTop: spacing.xl },
  statBox: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, alignItems: 'center', paddingVertical: spacing.md, marginHorizontal: 4 },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  menuCard: { width: '100%', backgroundColor: colors.surface, borderRadius: radius.md, marginTop: spacing.lg },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.md },
  menuRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLabel: { color: colors.textPrimary, marginLeft: spacing.md, fontSize: 15 },
});
