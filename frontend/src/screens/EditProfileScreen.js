import React, { useState } from 'react';
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
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius } from '../theme/colors';
import { mockUser } from '../data/mockData';

export default function EditProfileScreen({ navigation }) {
  const [username, setUsername] = useState(mockUser.username);
  const [email, setEmail] = useState(mockUser.email);

  // 각 필드별로 "지금 수정 중인지" 상태를 따로 관리
  const [editingField, setEditingField] = useState(null); // null | 'username' | 'email' | 'password'

  const toggleEdit = (field) => {
    setEditingField((prev) => (prev === field ? null : field));
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
          {mockUser.avatarUrl ? (
            <Image source={{ uri: mockUser.avatarUrl }} style={styles.avatar} />
          ) : (
            <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.avatar}>
              <Feather name="user" size={40} color="#fff" />
            </LinearGradient>
          )}
          <TouchableOpacity style={styles.cameraBtn}>
            <Feather name="camera" size={16} color="#0A0A0F" />
          </TouchableOpacity>
        </View>

        {/* 아이디 */}
        <Text style={styles.label}>아이디</Text>
        <EditableRow
          value={username}
          onChangeText={setUsername}
          editing={editingField === 'username'}
          onToggle={() => toggleEdit('username')}
        />

        {/* 이메일 */}
        <Text style={styles.label}>이메일</Text>
        <EditableRow
          value={email}
          onChangeText={setEmail}
          editing={editingField === 'email'}
          onToggle={() => toggleEdit('email')}
          keyboardType="email-address"
        />

        {/* 비밀번호 */}
        <Text style={styles.label}>비밀번호</Text>
        <PasswordRow
          editing={editingField === 'password'}
          onToggle={() => toggleEdit('password')}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// 아이디/이메일 공용: 평소엔 텍스트만 보여주고 "변경" 누르면 입력 가능 + "변경완료"로 전환
function EditableRow({ value, onChangeText, editing, onToggle, keyboardType }) {
  return (
    <View style={[styles.fieldRow, editing && styles.fieldRowEditing]}>
      <TextInput
        style={styles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        editable={editing}
        keyboardType={keyboardType}
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

// 비밀번호: 평소엔 안내 문구만 보여주고, "변경" 누르면 새 비밀번호 입력창 + "변경완료"
function PasswordRow({ editing, onToggle }) {
  const [newPassword, setNewPassword] = useState('');

  return (
    <View style={[styles.fieldRow, editing && styles.fieldRowEditing]}>
      {editing ? (
        <TextInput
          style={styles.fieldInput}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="새 비밀번호 입력"
          placeholderTextColor={colors.textPlaceholder}
          secureTextEntry
          autoFocus
        />
      ) : (
        <Text style={styles.passwordPlaceholder}>비밀번호 변경</Text>
      )}
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
  cameraBtn: {
    position: 'absolute', bottom: 0, right: '38%',
    width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.background,
  },
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
});