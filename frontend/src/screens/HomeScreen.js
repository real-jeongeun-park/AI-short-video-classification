import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme/colors';
import RecentResultCard from '../components/RecentResultCard';

export default function HomeScreen({ navigation }) {
  const [userId, setUserId] = useState(null);
  const [link, setLink] = useState('');
  const [recentResults, setRecentResults] = useState([]);

  useEffect(() => {
    const loadUserInfo = async () => {
      const savedUserId = await SecureStore.getItemAsync("userId");
      if (savedUserId) setUserId(savedUserId);
    };

    loadUserInfo();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchRecentResults = async () => {
        try {
          const response = await fetch(
            `${process.env.EXPO_PUBLIC_API_URL}/users/detection-results`,
            { method: "GET" }
          );

          const data = await response.json();

          if (!response.ok) {
            console.error("fetchRecentResults error:", data.detail);
            return;
          }

          setRecentResults(data.results);

        } catch (error) {
          console.error("fetchRecentResults error:", error);
        }
      };

      fetchRecentResults();
    }, [])
  );

  const handleAnalyze = () => {
    navigation.navigate('Analyzing', { url: link });
  };

  return (
    <View style={styles.container}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <Text style={[typography.h1, { color: colors.textPrimary }]}>AI's on</Text>
        <Text style={styles.subtitle}>숏폼 콘텐츠의 AI 생성 확률을 분석합니다</Text>

        <View style={styles.inputRow}>
          <Feather name="link" size={18} color={colors.primary} style={{ marginRight: spacing.sm }} />
          <TextInput
            style={styles.input}
            placeholder="링크를 붙여넣어 분석하세요"
            placeholderTextColor={colors.textPlaceholder}
            value={link}
            onChangeText={setLink}
          />
          <TouchableOpacity style={styles.analyzeBtn} onPress={handleAnalyze}>
            <Text style={styles.analyzeBtnText}>분석</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>최근 판정 결과</Text>
        </View>
      </View>

      <FlatList
        data={recentResults}
        keyExtractor={(item) => String(item.log_id)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: spacing.lg }}
        renderItem={({ item }) => (
          <RecentResultCard
            item={item}
            onPress={() => navigation.navigate('Result', { result: item })}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.xl },
  subtitle: { color: colors.textSecondary, marginTop: spacing.sm },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
    height: 56,
  },
  input: { flex: 1, color: colors.textPrimary },
  analyzeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  analyzeBtnText: { color: '#0A0A0F', fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '700' },
  seeAll: { color: colors.textSecondary, fontSize: 13 },
});