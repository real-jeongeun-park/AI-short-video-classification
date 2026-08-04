import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import { mockRanking } from '../data/mockData';

const FILTERS = ['전체', 'AI', 'Real'];

export default function RankingScreen({ navigation }) {
  const [filter, setFilter] = useState('전체');
  const [keyword, setKeyword] = useState('');

  const data = useMemo(() => {
    let list = mockRanking;
    if (filter !== '전체') list = list.filter((item) => item.label === filter);
    if (keyword.trim()) {
      list = list.filter(
        (item) =>
          item.title?.toLowerCase().includes(keyword.toLowerCase()) ||
          item.keywords?.some((k) => k.includes(keyword)) // item.tags -> item.keywords로 수정 및 옵셔널 체이닝 추가
      );
    }
    // 항상 판별 횟수(count) 기준 내림차순 정렬
    return [...list].sort((a, b) => b.count - a.count);
  }, [filter, keyword]);

  return (
    <View style={styles.container}>
      <Text style={styles.headertitle}>실시간 랭킹</Text>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="키워드 검색"
          placeholderTextColor={colors.textPlaceholder}
          value={keyword}
          onChangeText={setKeyword}
        />
        <Feather name="search" size={18} color={colors.textSecondary} />
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const isAI = item.label === 'AI';
          const accent = isAI ? colors.danger : colors.primary;
          return (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.row}
              onPress={() => navigation.navigate('Result', { result: item })}
            >
              <Text style={styles.rank}>{index + 1}</Text>
              <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
              <View style={styles.rowInfo}>
                <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
                <Text style={styles.count}>{item.count ? item.count.toLocaleString() : 0}회 판별</Text>
                <View style={styles.tagRow}>
                  {/* item.tags -> item.keywords로 수정 */}
                  {(item.keywords || []).map((k) => (
                    <Text key={k} style={styles.tag}>#{k}</Text>
                  ))}
                </View>
              </View>
              <View style={styles.badgeWrap}>
                <View style={[styles.verdictPill, { backgroundColor: accent + '22', borderColor: accent }]}>
                  <Text style={[styles.verdictPillText, { color: accent }]}>{item.label}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  headertitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginTop: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    height: 52,
    marginTop: spacing.lg,
  },
  searchInput: {
    flex: 1,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: colors.surface,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  rank: {
    width: 24,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    marginRight: spacing.md,
  },
  rowInfo: {
    flex: 1,
    marginRight: spacing.sm,
    justifyContent: 'center',
  },
  count: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
  },
  tag: {
    color: colors.textSecondary,
    fontSize: 11,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: spacing.xs,
  },
  badgeWrap: {
    alignSelf: 'center',
    justifyContent: 'center',
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
});