import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import { mockHistoryAI, mockHistoryReal } from '../data/mockData';

const SORTS = ['최신순', 'AI 생성 확률순'];

export default function HistoryScreen() {
  const [tab, setTab] = useState('AI'); // 'AI' | 'Real'
  const [sort, setSort] = useState('최신순');
  const [sortOpen, setSortOpen] = useState(false);

  const data = tab === 'AI' ? mockHistoryAI : mockHistoryReal;
  const accent = tab === 'AI' ? colors.danger : colors.primary;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>나의 활동 모아보기</Text>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tab, tab === 'AI' && { backgroundColor: colors.danger }]}
          onPress={() => setTab('AI')}
        >
          <Text style={[styles.tabText, tab === 'AI' && styles.tabTextActive]}>
            AI 생성 {mockHistoryAI.length}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'Real' && { backgroundColor: colors.primary }]}
          onPress={() => setTab('Real')}
        >
          <Text style={[styles.tabText, tab === 'Real' && { color: '#0A0A0F' }]}>
            Real 콘텐츠 {mockHistoryReal.length}
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
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
            <View style={styles.info}>
              <Text style={styles.caption}>AI 생성 확률</Text>
              <Text style={[styles.score, { color: accent }]}>{item.aiScore}%</Text>
              <Text style={styles.url}>{item.url}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
            <View style={[styles.bookmark, { backgroundColor: item.saved ? accent : colors.surfaceAlt }]}>
              <Feather name="bookmark" size={16} color={item.saved ? '#0A0A0F' : colors.textSecondary} />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg ,paddingTop: spacing.xl},
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: '800', marginTop: spacing.md, marginBottom: spacing.lg },
  tabRow: { flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, padding: 4, marginBottom: spacing.md },
  tab: { flex: 1, paddingVertical: 10, borderRadius: radius.pill, alignItems: 'center' },
  tabText: { color: colors.textSecondary, fontWeight: '700' },
  tabTextActive: { color: '#fff' },
  sortWrap: { alignItems: 'flex-end', marginBottom: spacing.md },
  sortBtn: { flexDirection: 'row', alignItems: 'center' },
  sortText: { color: colors.textSecondary, marginRight: 4 },
  sortMenu: {
    position: 'absolute', top: 24, right: 0, backgroundColor: colors.surface,
    borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, zIndex: 10,
  },
  sortOption: { color: colors.textSecondary, paddingVertical: 6, paddingHorizontal: spacing.sm },
  card: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, alignItems: 'center' },
  thumb: { width: 64, height: 64, borderRadius: radius.sm },
  info: { flex: 1, marginLeft: spacing.md },
  caption: { color: colors.textSecondary, fontSize: 12 },
  score: { fontSize: 22, fontWeight: '800', marginTop: 2 },
  url: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  date: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  bookmark: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
