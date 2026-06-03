// App.js  —  Entry point
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Text, ActivityIndicator, View } from 'react-native';

import { AuthProvider, useAuth }   from './src/hooks/useAuth';
import AuthScreen                  from './src/screens/AuthScreen';
import DashboardScreen             from './src/screens/DashboardScreen';
import { ForumsScreen, ThreadDetailScreen } from './src/screens/ForumsScreen';
import EventsScreen                from './src/screens/EventsScreen';
import { MembersScreen, GroupsScreen } from './src/screens/MembersScreen';
import { seedGroups }              from './src/services/firestoreService';

const Tab   = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Tab icons ─────────────────────────────────────────────────────────────────
const TAB_ICONS = {
  Dashboard: '⬡', Forums: '💬', Members: '👥', Events: '📅', Groups: '🔗',
};

// ── Forum stack (list + thread detail) ────────────────────────────────────────
function ForumStack() {
  return (
    <Stack.Navigator screenOptions={stackOpts}>
      <Stack.Screen name="ForumList"    component={ForumsScreen}       options={{ title:'Forums' }} />
      <Stack.Screen name="ThreadDetail" component={ThreadDetailScreen} options={{ title:'Thread' }} />
    </Stack.Navigator>
  );
}

// ── Main tabs ─────────────────────────────────────────────────────────────────
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>
            {TAB_ICONS[route.name]}
          </Text>
        ),
        tabBarLabel:            ({ focused, children }) => (
          <Text style={{ fontSize:10, color: focused ? '#a5b4fc' : 'rgba(255,255,255,0.35)', fontWeight: focused?'700':'400' }}>
            {children}
          </Text>
        ),
        tabBarStyle:            { backgroundColor:'#0d0d1a', borderTopColor:'rgba(255,255,255,0.07)', height:60, paddingBottom:8 },
        tabBarActiveTintColor:  '#a5b4fc',
        tabBarInactiveTintColor:'rgba(255,255,255,0.35)',
        headerShown:            false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Forums"    component={ForumStack} />
      <Tab.Screen name="Members"   component={MembersScreen} />
      <Tab.Screen name="Events"    component={EventsScreen} />
      <Tab.Screen name="Groups"    component={GroupsScreen} />
    </Tab.Navigator>
  );
}

// ── Root (auth gate) ──────────────────────────────────────────────────────────
function Root() {
  const { user, loading } = useAuth();

  React.useEffect(() => { seedGroups(); }, []);   // seed groups once

  if (loading) return (
    <View style={{ flex:1, backgroundColor:'#0d0d1a', alignItems:'center', justifyContent:'center' }}>
      <ActivityIndicator size="large" color="#6366f1" />
    </View>
  );

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {user ? <MainTabs /> : (
        <Stack.Navigator screenOptions={{ headerShown:false }}>
          <Stack.Screen name="Auth" component={AuthScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}

// ── Web entry fix ─────────────────────────────────────────────────────────────
import { registerRootComponent } from 'expo';
registerRootComponent(App);

// ── Shared stack screen options ───────────────────────────────────────────────
const stackOpts = {
  headerStyle:     { backgroundColor:'#0d0d1a' },
  headerTintColor: '#e8e8f0',
  headerTitleStyle:{ fontWeight:'700' },
  contentStyle:    { backgroundColor:'#0d0d1a' },
};
