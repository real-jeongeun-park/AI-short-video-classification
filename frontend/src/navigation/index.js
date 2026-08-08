import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

import HomeScreen from '../screens/HomeScreen';
import AnalyzingScreen from '../screens/AnalyzingScreen';
import ResultScreen from '../screens/ResultScreen';

import RankingScreen from '../screens/RankingScreen';
import HistoryScreen from '../screens/HistoryScreen';

import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import SavedResultsScreen from '../screens/SavedResultsScreen';

const RootStack = createNativeStackNavigator();
const HomeStackNav = createNativeStackNavigator();
const RankingStackNav = createNativeStackNavigator();
const ProfileStackNav = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <HomeStackNav.Navigator screenOptions={{ headerShown: false }}>
      <HomeStackNav.Screen name="HomeMain" component={HomeScreen} />
      <HomeStackNav.Screen name="Analyzing" component={AnalyzingScreen} />
      <HomeStackNav.Screen name="Result" component={ResultScreen} />
    </HomeStackNav.Navigator>
  );
}

function RankingStack() {
  return (
    <RankingStackNav.Navigator screenOptions={{ headerShown: false }}>
      <RankingStackNav.Screen name="RankingMain" component={RankingScreen} />
      <RankingStackNav.Screen name="Result" component={ResultScreen} />
    </RankingStackNav.Navigator>
  );
}

function ProfileStack() {
  return (
    <ProfileStackNav.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStackNav.Screen name="ProfileMain" component={ProfileScreen} />
      <ProfileStackNav.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStackNav.Screen name="SavedResults" component={SavedResultsScreen} />
    </ProfileStackNav.Navigator>
  );
}

const TAB_ICON = {
  Home: 'home',
  Ranking: 'bar-chart-2',
  History: 'clock',
  Profile: 'user',
};

const TAB_LABEL = {
  Home: '홈',
  Ranking: '랭킹',
  History: '기록',
  Profile: '프로필',
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarIcon: ({ color, size }) => (
          <Feather name={TAB_ICON[route.name]} color={color} size={size ?? 22} />
        ),
        tabBarLabel: TAB_LABEL[route.name],
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Ranking" component={RankingStack} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
        <RootStack.Screen name="Splash" component={SplashScreen} />
        <RootStack.Screen name="Login" component={LoginScreen} />
        <RootStack.Screen name="Signup" component={SignupScreen} />
        <RootStack.Screen name="Main" component={MainTabs} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
