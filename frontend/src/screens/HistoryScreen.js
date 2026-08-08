import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import * as SecureStore from 'expo-secure-store';

const SORTS = ['최신순', 'AI 생성 확률순'];

const formatDate = (dateString) => {
  if (!dateString) return '';
  return typeof dateString === 'string' ? dateString.split('T')[0].replace(/-/g, '.') : '';
};

export default function HistoryScreen({ navigation }) {
  const [tab, setTab] = useState('AI'); // 'AI' | 'Real'
  const [sort, setSort] = useState('최신순');
  const [sortOpen, setSortOpen] = useState(false);

  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({ ai_count: 0, real_count: 0 });

  const [userId, setUserId] = useState(null);

  const accent = tab === 'AI' ? colors.danger : colors.primary;

  useEffect(() => {
    const loadUserInfo = async () => {
      const savedUserId = await SecureStore.getItemAsync("userId");
      if (savedUserId) setUserId(savedUserId);
    };

    loadUserInfo();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) return;

      const apiType = tab === 'AI' ? 'AI' : 'REAL';
      const apiSort = sort === '최신순' ? 'LATEST' : 'PROBABILITY';

      try {
        const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/v1/users/history`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: Number(userId),
            api_type: apiType,
            api_sort: apiSort,
          }),
        });
                
        const json = await response.json();
        
        if (json.isSuccess) {
          setData(json.result.history);
          setSummary(json.result.summary);
        }
      } catch (error) {
        console.error("히스토리 데이터 불러오기 실패:", error);
      }
    };

    fetchHistory();
  }, [tab, sort, userId]);

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>나의 활동 모아보기</Text>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[
            styles.tab,
            tab === 'AI' && {
              backgroundColor: colors.danger + '22',
              borderColor: colors.danger,
            },
          ]}
          onPress={() => setTab('AI')}
        >
          <Text style={[styles.tabText, tab === 'AI' && { color: colors.danger, fontWeight: '700' }]}>
            AI 생성 {summary.ai_count}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            tab === 'Real' && {
              backgroundColor: colors.primary + '22',
              borderColor: colors.primary,
            },
          ]}
          onPress={() => setTab('Real')}
        >
          <Text style={[styles.tabText, tab === 'Real' && { color: colors.primary, fontWeight: '700' }]}>
            Real 콘텐츠 {summary.real_count}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sortWrap}>
        <TouchableOpacity onPress={() => setSortOpen(!sortOpen)} style={styles.sortBtn}>
          <Text style={styles.sortText}>{sort}</Text>
          <Feather name="chevron-down" size={16} color={colors.textSecondary} />
        </TouchableOpacity>
        {sortOpen && (
          <View style={styles.sortMenu}>
            {SORTS.map((s) => (
              <TouchableOpacity key={s} onPress={() => { setSort(s); setSortOpen(false); }}>
                <Text style={[styles.sortOption, s === sort && { color: colors.primary }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => String(item.video_id)}
        contentContainerStyle={{ paddingBottom: spacing.xl }}

        initialNumToRender={20}      
        maxToRenderPerBatch={20}    
        windowSize={10}             
        removeClippedSubviews={true}
        
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() => {
              const formattedResult = {
                ...item,
                is_ai_generated: item.result_type === 'AI',
                thumbnail: item.thumbnail_url,
                keywords: Array.isArray(item.keywords) ? item.keywords.join(',') : item.keywords,
                ai_probability: item.ai_probability * 0.01,
                date: item.date
              };
              navigation.navigate('Result', { result: formattedResult });
            }}
          >
            {/* [수정] 썸네일 이미지가 없으면 뼈대만 보여주도록 개선 */}
            {item.thumbnail_url ? (
              <Image source={{ uri: item.thumbnail_url }} style={styles.thumb} resizeMode="cover" />
            ) : (
              <View style={[styles.thumb, { backgroundColor: colors.surfaceAlt }]} />
            )}
            <View style={styles.info}>
              <Text numberOfLines={1} style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.caption}>
                AI 생성확률 <Text style={[styles.scoreInline, { color: accent }]}>{item.ai_probability}%</Text>
              </Text>
              {/* [수정] 날짜 포맷 함수 적용 */}
              <Text style={styles.date}>최근 분석일: {formatDate(item.user_date)}</Text>
            </View>
            <View
              style={[
                styles.bookmark,
                item.is_saved
                  ? { backgroundColor: accent + '22', borderWidth: 0.5, borderColor: accent }
                  : { backgroundColor: colors.surfaceAlt },
              ]}
            >
              <Feather name="bookmark" size={16} color={item.is_saved ? accent : colors.textSecondary} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: spacing.xl },
  headerTitle: { color: colors.textPrimary, fontSize: 22, fontWeight: '800', marginTop: spacing.md, marginBottom: spacing.lg },
  tabRow: { flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, padding: 4, marginBottom: spacing.md },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.pill,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'transparent',
  },
  tabText: { color: colors.textSecondary, fontWeight: '700' },
  sortWrap: { alignItems: 'flex-end', marginBottom: spacing.md },
  sortBtn: { flexDirection: 'row', alignItems: 'center' },
  sortText: { color: colors.textSecondary, marginRight: 4 },
  sortMenu: {
    position: 'absolute', top: 24, right: 0, backgroundColor: colors.surface,
    borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, zIndex: 10,
  },
  sortOption: { color: colors.textSecondary, paddingVertical: 6, paddingHorizontal: spacing.sm },
  card: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, alignItems: 'center' },
  thumb: { width: 84, height: 84, borderRadius: radius.md },
  info: { flex: 1, marginLeft: spacing.md, justifyContent: 'center' },
  itemTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '700' },
  caption: { color: colors.textSecondary, fontSize: 13, marginTop: 10 },
  scoreInline: { fontSize: 13, fontWeight: '600' },
  date: { color: colors.textSecondary, fontSize: 12, marginTop: spacing.xs },
  bookmark: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});