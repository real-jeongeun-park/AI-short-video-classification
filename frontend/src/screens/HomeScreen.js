import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme/colors';
import RecentResultCard from '../components/RecentResultCard';
import { mockRecentResults } from '../data/mockData';

export default function HomeScreen({ navigation }) {
  const [link, setLink] = useState('');

  const handleAnalyze = () => {
    // TODO: 실제 모델/백엔드 연동 전, 하드코딩된 URL로 이동
    navigation.navigate('Analyzing', { url: link || 'instagram.com/reel/abc123xyz' });
  };

  return (
    <View style={styles.container}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <Text style={[typography.h1, { color: colors.textPrimary }]}>AI's on</Text>
        <Text style={styles.subtitle}>숏폼 콘텐츠의 AI 생성 확률을 분석합니다</Text>

        <View style={styles.inputRow}>
          <Feather name="link" size={18} color={colors.primary} style={{ marginRight: spacing.sm }} />
          <TextInput
            style={styles.input}
            placeholder="링크를 붙여넣어 분석하세요"
            placeholderTextColor={colors.textPlaceholder}
            value={link}
            onChangeText={setLink}
          />
          <TouchableOpacity style={styles.analyzeBtn} onPress={handleAnalyze}>
            <Text style={styles.analyzeBtnText}>분석</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>최근 판정 결과</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.seeAll}>전체보기</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={mockRecentResults}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg }}
        renderItem={({ item }) => (
          <RecentResultCard
            item={item}
            onPress={() => navigation.navigate('Result', { result: item })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.xl },
  subtitle: { color: colors.textSecondary, marginTop: spacing.sm },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
    height: 56,
  },
  input: { flex: 1, color: colors.textPrimary },
  analyzeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  analyzeBtnText: { color: '#0A0A0F', fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  seeAll: { color: colors.textSecondary, fontSize: 13 },
});
