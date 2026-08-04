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

      <FlatList
        data={tab === 'AI' ? trueResults : falseResults}
        keyExtractor={(item) => String(item.video_id)}
        contentContainerStyle={{ paddingTop: spacing.md, paddingBottom: spacing.xl }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
            <View style={styles.info}>
              <Text style={styles.caption}>AI 생성 확률</Text>
              <Text style={[styles.score, { color: accent }]}>{(item.ai_probability * 100).toFixed(1)}%</Text>
              <Text style={styles.url}>{item.url}</Text>
              <Text style={styles.date}>{formatDate(item.date)}</Text>
            </View>
            <View style={[styles.bookmark, { backgroundColor: accent }]}>
              <Feather name="bookmark" size={16} color="#0A0A0F" />
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg,paddingTop: spacing.xl },
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
  date: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  bookmark: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
