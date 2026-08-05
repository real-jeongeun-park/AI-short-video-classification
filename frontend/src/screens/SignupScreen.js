import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../theme/colors';
import PrimaryButton from '../components/PrimaryButton';

import axios from 'axios';
import { Alert } from 'react-native';

export default function SignupScreen({ navigation }) {
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSignup = async () => {
    if (!username || !email || !password || !passwordConfirm) {
      Alert.alert("알림", "모든 칸을 입력해주세요.");
      return;
    }
    if (!agreed) {
      Alert.alert("알림", "이용약관에 동의해주세요.");
      return;
    }
 

    try {
      const response = await axios.post(`${process.env.EXPO_PUBLIC_API_URL}/auth/signup`, {
        email: email,
        nickname: username,       
        password: password,
        password_confirm: passwordConfirm
      });

      console.log("회원가입 성공:", response.data);
      Alert.alert("가입 성공!", "회원가입이 완료되었습니다. 로그인해주세요.");
      
      navigation.navigate('Login'); 

    } catch (error) {
      if (error.response) {
        Alert.alert("회원가입 실패", error.response.data.detail);
      } else {
        Alert.alert("서버 오류", "서버와 연결할 수 없습니다. ngrok 주소를 확인해주세요.");
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginBottom: 40 }}>
          <Feather name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={[typography.h1, { color: colors.textPrimary }]}>회원가입</Text>
        <Text style={styles.subtitle}>AI 숏폼 콘텐츠 판별을 시작해보세요.</Text>

        <Text style={styles.label}>닉네임</Text>
        <TextInput
          style={[styles.input, styles.inputFocused]}
          placeholder="닉네임을 입력하세요."
          placeholderTextColor={colors.textPlaceholder}
          value={nickname}
          onChangeText={setNickname}
        />

        <Text style={styles.label}>이메일</Text>
        <TextInput
          style={styles.input}
          placeholder="이메일을 입력하세요."
          placeholderTextColor={colors.textPlaceholder}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <Text style={styles.label}>비밀번호</Text>
        <TextInput
          style={styles.input}
          placeholder="8자 이상 입력하세요."
          placeholderTextColor={colors.textPlaceholder}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Text style={styles.label}>비밀번호 확인</Text>
        <TextInput
          style={styles.input}
          placeholder="비밀번호를 다시 입력하세요."
          placeholderTextColor={colors.textPlaceholder}
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.checkboxRow}
          onPress={() => setAgreed(!agreed)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, agreed && { backgroundColor: colors.primary }]}>
            {agreed && <Feather name="check" size={14} color="#0A0A0F" />}
          </View>
          <Text style={styles.checkboxLabel}>이용약관 및 개인정보처리 방침에 동의합니다.</Text>
        </TouchableOpacity>

        <PrimaryButton title="회원가입" onPress={handleSignup} style={{ marginTop: spacing.lg }} />

        <Text style={styles.footerText}>
          이미 계정이 있어요{' '}
          <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
            로그인
          </Text>
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg,paddingTop: spacing.xl },
  subtitle: { color: colors.textSecondary, marginTop: spacing.sm, marginBottom: 40 },
  label: { color: colors.primary, marginBottom: spacing.sm, fontSize: 13 },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    height: 56,
    paddingHorizontal: spacing.md,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  inputFocused: { borderColor: colors.primary },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 40 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.primary,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: { color: colors.textSecondary, fontSize: 13 },
  footerText: { textAlign: 'center', color: colors.textSecondary, marginTop: spacing.md },
  link: { color: colors.primary, fontWeight: '700' },
});
