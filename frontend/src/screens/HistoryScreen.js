import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';
import * as SecureStore from 'expo-secure-store';

const SORTS = ['최신순', 'AI 생성 확률순'];

export default function HistoryScreen({ navigation }) {
  const [tab, setTab] = useState('AI'); // 'AI' | 'Real'
  const [sort, setSort] = useState('최신순');
  const [sortOpen, setSortOpen] = useState(false);

  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({ ai_count: 0, real_count: 0 });

  const [nickname, setNickname] = useState(null);

  const accent = tab === 'AI' ? colors.danger : colors.primary;

  useEffect(() => {
    const loadNickname = async () => {
      try {
        const storedNickname = await SecureStore.getItemAsync('nickname');
        if (storedNickname) {
          setNickname(storedNickname);
        } else {
          console.log("저장된 닉네임이 없습니다. 로그인이 필요합니다.");
          // 필요하다면 여기서 navigation.replace('Login') 등으로 보낼 수 있습니다.
        }
      } catch (error) {
        console.error("닉네임 불러오기 실패:", error);
      }
    };

    loadNickname();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!nickname) return;

      try {
        const apiType = tab === 'AI' ? 'AI' : 'REAL';
        const apiSort = sort === '최신순' ? 'LATEST' : 'PROBABILITY';

        const url = `https://grope-onboard-lure.ngrok-free.dev/api/v1/users/history?nickname=${nickname}&type=${apiType}&sort=${apiSort}`;
        
        const response = await fetch(url);
        const json = await response.json();
        
        if (json.isSuccess) {
          setData(json.result.history);
          setSummary(json.result.summary); // 서버에서 준 개수 정보 업데이트
        }
      } catch (error) {
        console.error("히스토리 데이터 불러오기 실패:", error);
      }
    };

    fetchHistory();
  }, [tab, sort, nickname]);

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
        keyExtractor={(item) => item.log_id.toString()}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.card}
            onPress={() => navigation.navigate('Result', { result: item })}
          >
            <Image source={{ uri: item.thumbnail_url }} style={styles.thumb} />
            <View style={styles.info}>
              <Text numberOfLines={1} style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.caption}>
                AI 생성확률 <Text style={[styles.scoreInline, { color: accent }]}>{item.ai_probability}%</Text>
              </Text>
              <Text style={styles.date}>{item.created_at ? item.created_at.slice(0, 10) : ''}</Text>
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