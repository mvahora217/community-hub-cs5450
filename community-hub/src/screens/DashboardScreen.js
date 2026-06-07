// src/screens/DashboardScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, RefreshControl,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { logoutUser } from '../services/authService';
import { subscribeToForums } from '../services/firestoreService';
import { subscribeToEvents } from '../services/firestoreService';
import { subscribeToGroups } from '../services/firestoreService';
import { CAT_COLORS, avatarBg } from '../utils/helpers';

export default function DashboardScreen({ navigation }) {
  const { profile } = useAuth();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.log('Logout error:', error);
    }
  };
  const [forums,  setForums]  = useState([]);
  const [events,  setEvents]  = useState([]);
  const [groups,  setGroups]  = useState([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const u1 = subscribeToForums(setForums);
    const u2 = subscribeToEvents(setEvents);
    const u3 = subscribeToGroups(setGroups);
    return () => { u1(); u2(); u3(); };
  }, []);

  if (!profile) return null;

  const myGroups   = groups.filter(g => g.members?.includes(profile.uid));
  const myEvents   = events.filter(e => e.attendees?.includes(profile.uid)).slice(0, 2);
  const recentPosts = forums.slice(0, 4);

  const stats = [
    { label:'Posts',  value: profile.posts  || 0, color:'#6366f1' },
    { label:'Events', value: myEvents.length,      color:'#10b981' },
    { label:'Groups', value: myGroups.length,       color:'#f59e0b' },
    { label:'Members',value: 0,                     color:'#ec4899' }, // filled by members count
  ];

  return (
    <ScrollView style={styles.container}
      refreshControl={<RefreshControl refreshing={refresh} tintColor="#6366f1" />}
    >
      {/* Welcome banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerDate}>
          {new Date().toLocaleDateString('en-CA', { weekday:'long', month:'long', day:'numeric' })}
        </Text>
        <Text style={styles.bannerTitle}>Welcome back, {profile.name?.split(' ')[0]} 👋</Text>
        <Text style={styles.bannerSub}>
          {profile.role === 'admin' ? '👑 Admin' : 'Member'} · Joined{' '}
          {profile.joinedAt?.toDate?.().toLocaleDateString('en-CA',{month:'short',year:'numeric'}) || '—'}
        </Text>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {stats.map(s => (
          <View key={s.label} style={styles.statCard}>
            <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Recent discussions */}
      <SectionHeader title="Recent Discussions" onAction={() => navigation.navigate('Forums')} />
      {recentPosts.map(p => (
        <TouchableOpacity key={p.id} style={styles.card}
          onPress={() =>
            alert(`${p.title}\n\nCategory: ${p.category}\nAuthor: ${p.authorName}\nLikes: ${p.likes || 0}\nReplies: ${p.replyCount || 0}`)
          }>
          <View style={styles.cardRow}>
            <View style={[styles.badge, { backgroundColor: (CAT_COLORS[p.category]||'#6366f1')+'22' }]}>
              <Text style={[styles.badgeText, { color: CAT_COLORS[p.category]||'#6366f1' }]}>{p.category}</Text>
            </View>
          </View>
          <Text style={styles.cardTitle} numberOfLines={2}>{p.title}</Text>
          <Text style={styles.cardMeta}>{p.authorName} · ❤️ {p.likes}  💬 {p.replyCount||0}</Text>
        </TouchableOpacity>
      ))}

      {/* Upcoming events */}
      <SectionHeader title="My Upcoming Events" onAction={() => navigation.navigate('Events')} />
      {myEvents.length === 0
        ? <View style={styles.emptyCard}><Text style={styles.emptyText}>No events yet — join one!</Text></View>
        : myEvents.map(e => (
          <TouchableOpacity key={e.id} style={styles.card}
            onPress={() =>
              alert(`${e.title}\n\n${e.desc || 'No description available'}\n\nDate: ${e.date}\nLocation: ${e.location || 'N/A'}`)
            }>
            <View style={styles.cardRow}>
              <View style={[styles.dateBadge, { borderColor: (CAT_COLORS[e.category]||'#6366f1')+'44' }]}>
                <Text style={[styles.dateMonth, { color: CAT_COLORS[e.category]||'#6366f1' }]}>
                  {new Date(e.date).toLocaleString('en',{month:'short'}).toUpperCase()}
                </Text>
                <Text style={[styles.dateDay, { color: CAT_COLORS[e.category]||'#6366f1' }]}>
                  {new Date(e.date).getDate()}
                </Text>
              </View>
              <View style={{ flex:1 }}>
                <Text style={styles.cardTitle} numberOfLines={1}>{e.title}</Text>
                <Text style={styles.cardMeta}>📍 {e.location}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))
      }

      {/* My groups */}
      <SectionHeader title="My Groups" onAction={() => navigation.navigate('Groups')} />
      {myGroups.slice(0,2).map(g => (
        <View key={g.id} style={[styles.card, styles.cardRow]}>
          <Text style={{ fontSize:24, marginRight:12 }}>{g.icon}</Text>
          <View>
            <Text style={styles.cardTitle}>{g.name}</Text>
            <Text style={styles.cardMeta}>{g.members?.length||0} members</Text>
          </View>
        </View>
      ))}
      {myGroups.length === 0 &&
        <View style={styles.emptyCard}><Text style={styles.emptyText}>Join a group to get started!</Text></View>
      }
      <View style={{ height:32 }} />
    </ScrollView>
  );
}

function SectionHeader({ title, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onAction}>
        <Text style={styles.sectionAction}>See all →</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex:1, backgroundColor:'#0d0d1a', padding:16 },
  banner:       { backgroundColor:'rgba(99,102,241,0.15)', borderWidth:1,
                  borderColor:'rgba(99,102,241,0.3)', borderRadius:16, padding:20, marginBottom:18 },
  bannerDate:   { color:'rgba(255,255,255,0.45)', fontSize:12, marginBottom:4 },
  bannerTitle:  { color:'#fff', fontSize:22, fontWeight:'800', marginBottom:4 },
  bannerSub:    { color:'rgba(255,255,255,0.45)', fontSize:13 },
  statsRow:     { flexDirection:'row', gap:10, marginBottom:22 },
  statCard:     { flex:1, backgroundColor:'rgba(255,255,255,0.05)', borderRadius:12,
                  padding:14, alignItems:'center' },
  statNum:      { fontSize:22, fontWeight:'800' },
  statLabel:    { fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:2 },
  sectionHeader:{ flexDirection:'row', justifyContent:'space-between', alignItems:'center',
                  marginBottom:10, marginTop:4 },
  sectionTitle: { fontSize:15, fontWeight:'700', color:'#e8e8f0' },
  sectionAction:{ fontSize:12, color:'#6366f1', fontWeight:'600' },
  card:         { backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1,
                  borderColor:'rgba(255,255,255,0.09)', borderRadius:14, padding:14, marginBottom:10 },
  cardRow:      { flexDirection:'row', alignItems:'center', gap:12 },
  cardTitle:    { color:'#e8e8f0', fontSize:13, fontWeight:'600', marginTop:6, marginBottom:3 },
  cardMeta:     { color:'rgba(255,255,255,0.38)', fontSize:11 },
  badge:        { borderRadius:6, paddingHorizontal:9, paddingVertical:2, alignSelf:'flex-start' },
  badgeText:    { fontSize:11, fontWeight:'600' },
  dateBadge:    { width:40, height:40, borderRadius:8, borderWidth:1,
                  alignItems:'center', justifyContent:'center' },
  dateMonth:    { fontSize:8, fontWeight:'700' },
  dateDay:      { fontSize:16, fontWeight:'800', lineHeight:18 },
  emptyCard:    { backgroundColor:'rgba(255,255,255,0.04)', borderRadius:14, padding:20,
                  alignItems:'center', marginBottom:10 },
  emptyText:    { color:'rgba(255,255,255,0.3)', fontSize:13 },
  logoutButton: {
    marginTop: 14,
    backgroundColor: 'rgba(239,68,68,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  logoutText: {
    color: '#f87171',
    fontSize: 13,
    fontWeight: '700',
  },
});
