import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import * as SecureStore from "expo-secure-store";

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
  const [trueCount, setTrueCount] = useState(0);
  const [trueResults, setTrueResults] = useState([]);
  const [falseCount, setFalseCount] = useState(0);
  const [falseResults, setFalseResults] = useState([]);

  const [sort, setSort] = useState('최신순');
  const [sortOpen, setSortOpen] = useState(false);

  const SORTS = ['최신순', 'AI 생성 확률순'];
  const accent = tab === 'AI' ? colors.danger : colors.primary;

  useEffect(() => {
    const loadUserInfo = async () => {
      const savedUserId = await SecureStore.getItemAsync("userId");
      if (savedUserId) setUserId(savedUserId);
    };

    loadUserInfo();
  }, []);

  useEffect(() => {
    const handleSavedResults = async () => {
      if (!userId) {
        return;
      }

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

        if (!response.ok) {
          alert(data.detail);
          return;
        }

        setTrueCount(data.true_count);
        setTrueResults(data.true_results);
        setFalseCount(data.false_count);
        setFalseResults(data.false_results);

      } catch (error) {
        console.error("handleSavedResults error:", error);
      }
    };

    handleSavedResults();
  }, [userId, tab]);

  const handleDeleteBookmark = async (item) => {
    const removeFromList = (list) => list.filter((r) => r.log_id !== item.log_id);

    if (tab === 'AI') {
      setTrueResults((prev) => removeFromList(prev));
      setTrueCount((prev) => prev - 1);
    } else {
      setFalseResults((prev) => removeFromList(prev));
      setFalseCount((prev) => prev - 1);
    }

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/bookmark/change`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          log_id: item.log_id,
          is_bookmarked: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail);
      }

    } catch (error) {
      console.error("handleDeleteBookmark error:", error);

      if (tab === 'AI') {
        setTrueResults((prev) => [...prev, item]);
        setTrueCount((prev) => prev + 1);
      } else {
        setFalseResults((prev) => [...prev, item]);
        setFalseCount((prev) => prev + 1);
      }
      alert("북마크 해제에 실패했습니다.");
    }
  };

  const sortedResults = useMemo(() => {
    const list = tab === 'AI' ? trueResults : falseResults;
    const copied = [...list]; // 원본 배열 훼손 방지

    if (sort === 'AI 생성 확률순') {
      return tab === 'AI'
        ? copied.sort((a, b) => b.ai_probability - a.ai_probability)
        : copied.sort((a, b) => a.ai_probability - b.ai_probability);
    }

    return copied.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [trueResults, falseResults, tab, sort]);

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
          style={[styles.tab, tab === 'AI' && { backgroundColor: colors.danger }]}
          onPress={() => setTab('AI')}
        >
          <Text style={[styles.tabText, tab === 'AI' && styles.tabTextActive]}>
            AI 생성 {trueCount}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'Real' && { backgroundColor: colors.primary }]}
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
                <Text style={[styles.sortOption, s === sort && { color: tab == "AI" ? colors.danger : colors.primary }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <FlatList
        data={sortedResults}
        keyExtractor={(item) => String(item.log_id)}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() => navigation.navigate('Result', { result: item })}
          >
            {item.thumbnail ? (
              <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbPlaceholder]} />
            )}
            <View style={styles.info}>
              <Text style={styles.itemTitle} numberOfLines={1}>
                {item.title}
              </Text>
              <Text style={styles.caption}>
                AI 생성확률 <Text style={[styles.scoreInline, { color: accent }]}>
                  {(item.ai_probability * 100).toFixed(1)}%
                </Text>
              </Text>
              <Text style={styles.date}>{formatDate(item.date)}</Text>
            </View>
            <TouchableOpacity
              style={tab === 'AI' ? styles.bookmark_true : styles.bookmark_false}
              onPress={() => handleDeleteBookmark(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <FontAwesome
                name="bookmark"
                size={16}
                color={accent}
              />
            </TouchableOpacity>
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
  tab: { flex: 1, paddingVertical: 10, borderRadius: radius.pill, alignItems: 'center', },
  tabText: { color: colors.textSecondary, fontWeight: '700', },
  tabTextActive: { color: '#fff' },
  card: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, alignItems: 'center' },
  thumb: { width: 64, height: 64, borderRadius: radius.sm },
  info: { flex: 1, marginLeft: spacing.md },
  caption: { color: colors.textSecondary, fontSize: 12 },
  score: { fontSize: 22, fontWeight: '800', marginTop: 2 },
  url: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  date: { color: colors.textSecondary, fontSize: 11, marginTop: 3, },
  bookmark_true: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.danger + '22', borderWidth: 0.5, borderColor: colors.danger },
  bookmark_false: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary + '22', borderWidth: 0.5, borderColor: colors.primary },
  scoreInline: { fontSize: 15, fontWeight: 700 },
  itemTitle: { fontSize: 16, color: "white", fontWeight: 700, marginBottom: 5, },
  sortWrap: { alignItems: 'flex-end', marginVertical: spacing.md },
  sortBtn: { flexDirection: 'row', alignItems: 'center' },
  sortText: { color: colors.textSecondary, marginRight: 4 },
  sortMenu: {
    position: 'absolute', top: 24, right: 0, backgroundColor: colors.surface,
    borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, zIndex: 10,
  },
  sortOption: { color: colors.textSecondary, paddingVertical: 6, paddingHorizontal: spacing.sm },
});