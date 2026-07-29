import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import LabelBadge from '../components/LabelBadge';
import { mockRanking } from '../data/mockData';

const FILTERS = ['전체', 'AI', 'Real'];

export default function RankingScreen() {
  const [filter, setFilter] = useState('전체');
  const [keyword, setKeyword] = useState('');

  const data = useMemo(() => {
    let list = mockRanking;
    if (filter !== '전체') list = list.filter((item) => item.label === filter);
    if (keyword.trim()) {
      list = list.filter(
        (item) =>
          item.url.toLowerCase().includes(keyword.toLowerCase()) ||
          item.tags.some((t) => t.includes(keyword))
      );
    }
    return list;
  }, [filter, keyword]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>실시간 랭킹</Text>

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
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.rank}>{item.rank}</Text>
            <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
            <View style={styles.rowInfo}>
              <Text numberOfLines={1} style={styles.url}>{item.url}</Text>
              <Text style={styles.count}>{item.count.toLocaleString()}회 판별</Text>
              <View style={styles.tagRow}>
                {item.tags.map((t) => (
                  <Text key={t} style={styles.tag}>#{t}</Text>
                ))}
              </View>
            </View>
            <LabelBadge label={item.label} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    // 일반 View이므로 패딩 설정이 정상 동작합니다.
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginTop: spacing.md,
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
    color: colors.surface, // 활성화 시 텍스트 컬러
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
  },
  url: {
    color: colors.textPrimary,
    fontWeight: '600',
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
});