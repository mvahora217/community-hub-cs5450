// src/screens/MembersScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Modal,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { getAllUsers } from '../services/firestoreService';
import { CAT_COLORS, avatarBg } from '../utils/helpers';

export function MembersScreen() {
  const { profile } = useAuth();
  const [members,  setMembers]  = useState([]);
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getAllUsers().then(setMembers);
  }, []);

  const filtered = members.filter(m =>
    !search ||
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.interests?.some(i => i.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      <TextInput style={styles.search} placeholder="Search members or interests…"
        placeholderTextColor="rgba(255,255,255,0.3)"
        value={search} onChangeText={setSearch} />

      <ScrollView>
        <View style={styles.grid}>
          {filtered.map(m => (
            <TouchableOpacity key={m.id} style={styles.card} onPress={() => setSelected(m)}>
              <View style={[styles.avatar, { backgroundColor: avatarBg(m.avatar||'??') }]}>
                <Text style={styles.avatarText}>{m.avatar}</Text>
              </View>
              <Text style={styles.name}>{m.name}</Text>
              <View style={[styles.badge, { backgroundColor:(m.role==='admin'?'#f59e0b':'#6366f1')+'22', alignSelf:'center', marginBottom:6 }]}>
                <Text style={[styles.badgeText, { color: m.role==='admin'?'#f59e0b':'#a5b4fc' }]}>{m.role}</Text>
              </View>
              <Text style={styles.bio} numberOfLines={2}>{m.bio}</Text>
              <View style={styles.interests}>
                {(m.interests||[]).slice(0,3).map(i => (
                  <View key={i} style={[styles.tag, { backgroundColor:(CAT_COLORS[i]||'#6366f1')+'22' }]}>
                    <Text style={[styles.tagText, { color:CAT_COLORS[i]||'#a5b4fc' }]}>{i}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.stats}>
                <View style={styles.statItem}><Text style={styles.statNum}>{m.posts||0}</Text><Text style={styles.statLabel}>Posts</Text></View>
                <View style={styles.statItem}><Text style={styles.statNum}>{m.events||0}</Text><Text style={styles.statLabel}>Events</Text></View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height:32 }} />
      </ScrollView>

      {/* Profile modal */}
      <Modal visible={!!selected} transparent animationType="fade">
        <TouchableOpacity style={styles.modalBg} activeOpacity={1} onPress={() => setSelected(null)}>
          <View style={styles.modalCard}>
            <View style={[styles.avatarLg, { backgroundColor: avatarBg(selected?.avatar||'??') }]}>
              <Text style={styles.avatarLgText}>{selected?.avatar}</Text>
            </View>
            <Text style={styles.modalName}>{selected?.name}</Text>
            <View style={styles.row}>
              <View style={[styles.badge, { backgroundColor:(selected?.role==='admin'?'#f59e0b':'#6366f1')+'22' }]}>
                <Text style={[styles.badgeText, { color:selected?.role==='admin'?'#f59e0b':'#a5b4fc' }]}>{selected?.role}</Text>
              </View>
              {selected?.id === profile?.uid &&
                <View style={[styles.badge, { backgroundColor:'#10b98122' }]}>
                  <Text style={[styles.badgeText, { color:'#10b981' }]}>You</Text>
                </View>
              }
            </View>
            <Text style={styles.bioFull}>{selected?.bio}</Text>
            <Text style={styles.email}>{selected?.email}</Text>
            <Text style={styles.modalSectionLabel}>INTERESTS</Text>
            <View style={[styles.interests, { justifyContent:'center' }]}>
              {(selected?.interests||[]).map(i => (
                <View key={i} style={[styles.tag, { backgroundColor:(CAT_COLORS[i]||'#6366f1')+'22' }]}>
                  <Text style={[styles.tagText, { color:CAT_COLORS[i]||'#a5b4fc' }]}>{i}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUPS SCREEN
// ═══════════════════════════════════════════════════════════════════════════════
import { subscribeToGroups, joinGroup, leaveGroup } from '../services/firestoreService';

export function GroupsScreen() {
  const { profile } = useAuth();
  const [groups, setGroups] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => subscribeToGroups(setGroups), []);

  const filtered = groups.filter(g =>
    !search ||
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = async (g) => {
    const joined = g.members?.includes(profile.uid);
    if (joined) await leaveGroup(g.id, profile.uid);
    else        await joinGroup(g.id, profile.uid);
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.search} placeholder="Search groups…"
        placeholderTextColor="rgba(255,255,255,0.3)"
        value={search} onChangeText={setSearch} />
      <ScrollView>
        {filtered.map(g => {
          const color  = CAT_COLORS[g.category] || '#6366f1';
          const joined = g.members?.includes(profile.uid);
          return (
            <View key={g.id} style={styles.groupCard}>
              <View style={styles.groupHeader}>
                <View style={[styles.groupIcon, { backgroundColor: color+'22', borderColor: color+'44' }]}>
                  <Text style={{ fontSize:24 }}>{g.icon}</Text>
                </View>
                <View style={{ flex:1 }}>
                  <Text style={styles.groupName}>{g.name}</Text>
                  <View style={[styles.badge, { backgroundColor:color+'22', alignSelf:'flex-start' }]}>
                    <Text style={[styles.badgeText, { color }]}>{g.category}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.joinBtn, { backgroundColor: joined ? 'rgba(239,68,68,0.2)':color }]}
                  onPress={() => handleToggle(g)}>
                  <Text style={[styles.joinBtnText, { color: joined?'#f87171':'#fff' }]}>
                    {joined ? 'Leave' : 'Join'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.groupDesc}>{g.desc}</Text>
              <Text style={styles.meta}>{g.members?.length||0} member{(g.members?.length||0)!==1?'s':''}</Text>
            </View>
          );
        })}
        <View style={{ height:32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex:1, backgroundColor:'#0d0d1a', padding:16 },
  search:         { backgroundColor:'rgba(255,255,255,0.07)', borderWidth:1,
                    borderColor:'rgba(255,255,255,0.1)', borderRadius:10,
                    padding:11, color:'#e8e8f0', fontSize:13, marginBottom:14 },
  grid:           { flexDirection:'row', flexWrap:'wrap', gap:12 },
  card:           { width:'47%', backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1,
                    borderColor:'rgba(255,255,255,0.09)', borderRadius:14, padding:14, alignItems:'center' },
  avatar:         { width:48, height:48, borderRadius:24, alignItems:'center',
                    justifyContent:'center', marginBottom:8 },
  avatarText:     { color:'#fff', fontWeight:'700', fontSize:14 },
  name:           { color:'#e8e8f0', fontWeight:'700', fontSize:13, marginBottom:6, textAlign:'center' },
  badge:          { borderRadius:6, paddingHorizontal:8, paddingVertical:2, marginBottom:6 },
  badgeText:      { fontSize:10, fontWeight:'600' },
  bio:            { color:'rgba(255,255,255,0.4)', fontSize:11, textAlign:'center', lineHeight:16, marginBottom:8 },
  interests:      { flexDirection:'row', flexWrap:'wrap', gap:5, justifyContent:'center', marginBottom:8 },
  tag:            { borderRadius:10, paddingHorizontal:7, paddingVertical:2 },
  tagText:        { fontSize:10 },
  stats:          { flexDirection:'row', gap:14 },
  statItem:       { alignItems:'center' },
  statNum:        { color:'#a5b4fc', fontWeight:'700', fontSize:15 },
  statLabel:      { color:'rgba(255,255,255,0.3)', fontSize:10 },
  row:            { flexDirection:'row', gap:8, marginBottom:8 },
  modalBg:        { flex:1, backgroundColor:'rgba(0,0,0,0.7)', justifyContent:'center',
                    alignItems:'center', padding:24 },
  modalCard:      { backgroundColor:'#1a1a32', borderRadius:20, padding:24,
                    width:'100%', maxWidth:360, alignItems:'center' },
  avatarLg:       { width:68, height:68, borderRadius:34, alignItems:'center',
                    justifyContent:'center', marginBottom:12 },
  avatarLgText:   { color:'#fff', fontWeight:'700', fontSize:22 },
  modalName:      { color:'#fff', fontSize:20, fontWeight:'800', marginBottom:10 },
  bioFull:        { color:'rgba(255,255,255,0.55)', fontSize:13, textAlign:'center',
                    lineHeight:19, marginVertical:10 },
  email:          { color:'rgba(255,255,255,0.35)', fontSize:12, marginBottom:12 },
  modalSectionLabel:{ color:'rgba(255,255,255,0.3)', fontSize:11, fontWeight:'700',
                    letterSpacing:1.5, marginBottom:8 },
  closeBtn:       { backgroundColor:'rgba(255,255,255,0.1)', borderRadius:10,
                    paddingVertical:12, paddingHorizontal:28, marginTop:16 },
  closeBtnText:   { color:'#fff', fontWeight:'600', fontSize:14 },
  groupCard:      { backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1,
                    borderColor:'rgba(255,255,255,0.09)', borderRadius:14, padding:16, marginBottom:12 },
  groupHeader:    { flexDirection:'row', alignItems:'center', gap:12, marginBottom:10 },
  groupIcon:      { width:50, height:50, borderRadius:12, borderWidth:1,
                    alignItems:'center', justifyContent:'center' },
  groupName:      { color:'#e8e8f0', fontWeight:'700', fontSize:15, marginBottom:4 },
  groupDesc:      { color:'rgba(255,255,255,0.45)', fontSize:12, lineHeight:18, marginBottom:6 },
  meta:           { color:'rgba(255,255,255,0.3)', fontSize:11 },
  joinBtn:        { borderRadius:8, paddingVertical:8, paddingHorizontal:16 },
  joinBtnText:    { fontWeight:'700', fontSize:12 },
});
