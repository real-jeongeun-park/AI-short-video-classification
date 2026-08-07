import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';

const FILTERS = ['전체', 'AI', 'Real'];

const formatDate = (dateString) => {
  if (!dateString) return '';
  if (typeof dateString === 'string' && dateString.includes('.')) return dateString;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export default function RankingScreen({ navigation }) {
  const [filter, setFilter] = useState('전체');
  const [keyword, setKeyword] = useState('');

  const [data, setData] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loadUserInfo = async () => {
      const savedUserId = await SecureStore.getItemAsync("userId");
      if (savedUserId) setUserId(savedUserId);
    };

    loadUserInfo();
  }, []);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const apiFilter = filter === '전체' ? 'ALL' : filter.toUpperCase();
        
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/ranking`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filter: apiFilter,
            keyword: keyword.trim(),
          }),
        });

        const json = await response.json();
        
        if (json.isSuccess) {
          setData(json.result.rankings);
        }
      } catch (error) {
        console.error("랭킹 데이터 불러오기 실패:", error);
      }
    };

    fetchRankings(); // 필터나 검색어가 바뀔 때마다 서버에 다시 요청함
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
        keyExtractor={(item) => item.log_id.toString()}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const isAI = item.result_type === 'AI';
          const accent = isAI ? colors.danger : colors.primary;
          const displayCount = item.analysis_count || 1;

          return (
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.row}
              onPress={() => {
                const formattedResult = {
                  ...item,
                  is_ai_generated: item.result_type === 'AI',
                  thumbnail: item.thumbnail_url,

                  keywords: Array.isArray(item.keywords) ? item.keywords.join(',') : item.keywords,
                  
                  ai_probability: item.ai_probability,
                  date: item.date 
                };
                navigation.navigate('Result', { result: formattedResult });
              }}
            >
              <Text style={styles.rank}>{index + 1}</Text>
              <Image source={{ uri: item.thumbnail_url }} style={styles.thumb} />
              <View style={styles.rowInfo}>
                <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
                <Text style={styles.count}>{displayCount.toLocaleString()}회 판별</Text>
                <View style={styles.tagRow}>
                  {/* item.tags -> item.keywords로 수정 */}
                  {(item.keywords || []).map((k) => (
                    <Text key={k} style={styles.tag}>#{k}</Text>
                  ))}
                </View>
              </View>
              <View style={styles.badgeWrap}>
                <View style={[styles.verdictPill, { backgroundColor: accent + '22', borderColor: accent }]}>
                  <Text style={[styles.verdictPillText, { color: accent }]}>{item.result_type}</Text>
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