import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../theme/colors';
import * as SecureStore from "expo-secure-store";

export default function EditProfileScreen({ navigation }) {
  const [userId, setUserId] = useState(null);
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [editingField, setEditingField] = useState(null); // null | 'nickname' | 'email'

  useEffect(() => {
    const loadUserInfo = async () => {
      const savedUserId = await SecureStore.getItemAsync("userId");
      const savedNickname = await SecureStore.getItemAsync("nickname");
      const savedEmail = await SecureStore.getItemAsync("email");

      if (savedUserId) setUserId(savedUserId);
      if (savedNickname) setNickname(savedNickname);
      if (savedEmail) setEmail(savedEmail);
    };

    loadUserInfo();
  }, []);

  const handleUpdateNickname = async () => {
    try {
      if (!nickname){
        return;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profile/nickname`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(userId),
          nickname: nickname,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail);
      }

      await SecureStore.setItemAsync("nickname", nickname);

    } catch (error) {
      console.error("handleUpdateNickname error:", error);
      Alert.alert(error.message);
    }
  };

  const handleUpdateEmail = async () => {
    try {
      if (!email){
        return;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profile/email`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(userId),
          email: email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail);
      }

      await SecureStore.setItemAsync("email", email);

    } catch (error) {
      console.error("handleUpdateEmail error:", error);
      Alert.alert(error.message);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      if (!password) {
        return;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/profile/password`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(userId),
          password: password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail);
      }

      Alert.alert("비밀번호가 변경되었습니다.");
      
      setPassword("");

    } catch (error) {
      console.error("handleUpdatePassword error:", error);
    }
  };

  const toggleEdit = (field) => {
    const isCurrentlyEditing = editingField === field;
    
    if (isCurrentlyEditing) {
      if (field === 'nickname') handleUpdateNickname();
      if (field === 'email') handleUpdateEmail();
      if (field === 'password') handleUpdatePassword();

      setEditingField(null);
    } else {
      setEditingField(field);
    }
  };

  return (
    // 키보드가 올라올 때 화면(입력창)을 자동으로 밀어올려주는 역할
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>프로필 수정</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.avatarWrap}>
          <LinearGradient colors={[colors.primary, colors.danger]} style={styles.avatar}>
              <Feather name="user" size={40} color="#fff" />
          </LinearGradient>
        </View>

        {/* 아이디 */}
        <Text style={styles.label}>닉네임</Text>
        <EditableRow
          value={nickname}
          onChangeText={setNickname}
          editing={editingField === 'nickname'}
          onToggle={() => toggleEdit('nickname')}
          placeholder="새로운 닉네임을 입력하세요."
        />

        {/* 이메일 */}
        <Text style={styles.label}>이메일</Text>
        <EditableRow
          value={email}
          onChangeText={setEmail}
          editing={editingField === 'email'}
          onToggle={() => toggleEdit('email')}
          keyboardType="email-address"
          placeholder="새로운 이메일을 입력하세요."
        />

        {/* 비밀번호 */}
       <Text style={styles.label}>비밀번호</Text>
        <EditableRow
          onChangeText={setPassword}
          editing={editingField === 'password'}
          onToggle={() => toggleEdit('password')}
          placeholder="새로운 비밀번호를 입력하세요."
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function EditableRow({ value, onChangeText, editing, onToggle, keyboardType, placeholder }) {
  return (
    <View style={[styles.fieldRow, editing && styles.fieldRowEditing]}>
      <TextInput
        style={styles.fieldInput}
        defaultValue={value}
        onChangeText={onChangeText}
        editable={editing}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={colors.textPlaceholder}
      />
      <TouchableOpacity
        style={[styles.changeBtn, editing && styles.changeBtnActive]}
        onPress={onToggle}
      >
        <Text style={[styles.changeBtnText, editing && styles.changeBtnTextActive]}>
          {editing ? '변경완료' : '변경'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.background, padding: spacing.lg, paddingTop: spacing.xl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '700' },
  avatarWrap: { alignItems: 'center', marginTop: spacing.xl, marginBottom: spacing.xl },
  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  label: { color: colors.primary, marginBottom: spacing.sm, fontSize: 13 },

  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    height: 56,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  fieldRowEditing: {
    borderColor: colors.primary,
  },
  fieldInput: {
    flex: 1,
    color: colors.textPrimary,
    height: '100%',
  },
  passwordPlaceholder: { color: colors.textPlaceholder, flex: 1 },

  changeBtn: {
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.sm,
    marginLeft: spacing.sm,
  },
  changeBtnActive: {
    backgroundColor: colors.primary,
  },
  changeBtnText: { color: colors.textPrimary, fontWeight: '600' },
  changeBtnTextActive: { color: '#0A0A0F' },

  cancelBtn: {
    marginLeft: spacing.sm,
    padding: 4,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: -spacing.sm + 4,
    marginBottom: spacing.md,
    marginLeft: 4,
  },
});