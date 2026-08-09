import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import * as SecureStore from "expo-secure-store";

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

export default function RankingScreen({ navigation, route }) {
  const [filter, setFilter] = useState('전체');
  const [searchText, setSearchText] = useState('');

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
    const keyword = route?.params?.keyword;
    if (!keyword) return;
    setSearchText(keyword);
  }, [route?.params?.keyword]);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const apiFilter = filter === '전체' ? 'ALL' : filter.toUpperCase();
        
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/ranking`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filter: apiFilter,
            search_text: searchText.trim(),
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
  }, [filter, searchText]);

  return (
    <View style={styles.container}>
      <Text style={styles.headertitle}>실시간 랭킹</Text>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="타이틀, 키워드, 또는 동영상 URL 입력"
          placeholderTextColor={colors.textPlaceholder}
          value={searchText}
          onChangeText={setSearchText}
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
      keyExtractor={(item) => String(item.video_id)}
      contentContainerStyle={{ paddingBottom: spacing.xl }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => {
        const isAI = item.result_type === 'AI';
        const accent = isAI ? colors.danger : colors.primary;
        const displayCount = item.analysis_count || 1;

        return (
          <View style={styles.row}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.touchableArea}
              onPress={() => {
                const formattedResult = {
                  ...item,
                  is_ai_generated: item.result_type === 'AI',
                  thumbnail: item.thumbnail_url,
                  keywords: Array.isArray(item.keywords) ? item.keywords.join(',') : item.keywords,
                  ai_probability: item.ai_probability,
                  date: item.date,
                };
                navigation.navigate('Result', { result: formattedResult });
              }}
            >
              <Text style={styles.rank}>{index + 1}</Text>

              <View style={styles.imageWrap}>
                <Image source={{ uri: item.thumbnail_url }} style={styles.thumb} />
              </View>

              <View style={styles.rowInfo}>
                <Text numberOfLines={1} style={styles.title}>{item.title}</Text>
                <Text style={styles.count}>{displayCount.toLocaleString()}회 판별</Text>
              </View>

              <View style={styles.badgeWrap}>
                <View style={[styles.verdictPill, { backgroundColor: accent + '22', borderColor: accent }]}>
                  <Text style={[styles.verdictPillText, { color: accent }]}>{item.result_type}</Text>
                </View>
              </View>
            </TouchableOpacity>

            {item.keywords && item.keywords.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.tagRow}
                contentContainerStyle={styles.tagRowContent}
              >
                {item.keywords.map((k) => (
                  <Text key={k} style={styles.tag}>#{k}</Text>
                ))}
              </ScrollView>
            ): (
              <View style={{ marginBottom: 5, }}/>
            )}
          </View>
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
    marginBottom: spacing.lg,
    width: '100%',
  },
  touchableArea: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  rank: {
    width: 24,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },

  imageWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    marginLeft: spacing.sm,
    marginRight: spacing.md,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  thumb: {
    width: '100%',
    height: '100%',
    transform: [{ scale: 1.75, }]
  },
  rowInfo: {
    flex: 1,
    alignSelf: 'flex-start',
    marginTop: 7,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  count: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  badgeWrap: {
    marginLeft: spacing.sm,
    alignSelf: 'flex-start',
    marginTop: 7,
  },
  verdictPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  verdictPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tagRow: {
    marginTop: spacing.xs,
    marginLeft: 24 + spacing.sm + 56 + spacing.md, // rank + thumb 너비만큼 밀어서 title/count와 좌측 정렬
  },
  tagRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
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