import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import * as SecureStore from "expo-secure-store";

import { mockSavedAI, mockSavedReal } from '../data/mockData';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export default function SavedResultsScreen({ navigation }) {
  const [userId, setUserId] = useState(null);
  const [tab, setTab] = useState('AI');
  const [trueCount, setTrueCount] = useState(0); // AI Count
  const [trueResults, setTrueResults] = useState([]); // AI Results
  const [falseCount, setFalseCount] = useState(0); // Real Counnt
  const [falseResults, setFalseResults] = useState([]) // Real Results

  useEffect(() => {
    const loadUserInfo = async () => {
      const savedUserId = await SecureStore.getItemAsync("userId");
      if (savedUserId) setUserId(savedUserId);
    };

    loadUserInfo();
  }, []);

  useEffect(() => {
    const handleSavedResults = async () => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/users/saved-results`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user_id: Number(userId),
            }),
          }
        );
      
        const data = await response.json();
        
        if (!response.ok){
          alert(data.detail);
          return;
        }

        setTrueCount(data.true_count);
        setTrueResults(data.true_results);
        setFalseCount(data.false_count);
        setFalseResults(data.false_results);

      } catch (error){
        console.error("handleSavedResults error:", error);
      }
    };

    handleSavedResults();
  }, [userId, tab]);

  const accent = tab === 'AI' ? colors.danger : colors.primary;

  const data = useMemo(() => {
    const list = [...rawData];
    if (sort === 'AI 생성 확률순') {
      // AI 탭: 내림차순 / Real 탭: 오름차순
      return tab === 'AI'
        ? list.sort((a, b) => b.aiScore - a.aiScore)
        : list.sort((a, b) => a.aiScore - b.aiScore);
    }
    // 최신순: date 문자열 기준 내림차순 (예: '2026.06.25')
    return list.sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [rawData, sort, tab]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>저장된 결과</Text>
        <View style={{ width: 24 }} />
      </View>

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
          <Text style={[styles.tabText, tab === 'AI' && styles.tabTextActive]}>
            AI 생성 {trueCount}
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
          <Text style={[styles.tabText, tab === 'Real' && { color: '#0A0A0F' }]}>
            Real 콘텐츠 {falseCount}
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
        data={tab === 'AI' ? trueResults : falseResults}
        keyExtractor={(item) => String(item.video_id)}
        contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() => navigation.navigate('Result', { result: item })}
          >
            <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
            <View style={styles.info}>
              <Text style={styles.caption}>AI 생성 확률</Text>
              <Text style={[styles.score, { color: accent }]}>{(item.ai_probability * 100).toFixed(1)}%</Text>
              <Text style={styles.url}>{item.url}</Text>
              <Text style={styles.date}>{formatDate(item.date)}</Text>
            </View>
            <View style={[styles.bookmark, { backgroundColor: accent + '22', borderWidth: 0.5, borderColor: accent }]}>
              <Feather name="bookmark" size={16} color={accent} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' },
  tabRow: { flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, padding: 4, marginTop: 50 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.pill,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: 'transparent',
  },
  tabText: { color: colors.textSecondary, fontWeight: '700' },
  sortWrap: { alignItems: 'flex-end', marginTop: spacing.md, marginBottom: spacing.md },
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