// src/screens/EventsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  StyleSheet, Modal, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { subscribeToEvents, createEvent, joinEvent, leaveEvent } from '../services/firestoreService';
import { CAT_COLORS } from '../utils/helpers';

const CATEGORIES = Object.keys(CAT_COLORS);

export default function EventsScreen({ navigation }) {
  const { profile } = useAuth();
  const [events,  setEvents]  = useState([]);
  const [filter,  setFilter]  = useState('All');
  const [search,  setSearch]  = useState('');
  const [showNew, setShowNew] = useState(false);
  const [form,    setForm]    = useState({ title:'', category:'Tech', date:'', time:'', location:'', desc:'' });

  useEffect(() => subscribeToEvents(setEvents), []);

  const filtered = events.filter(e =>
    (filter === 'All' || e.category === filter) &&
    (!search || e.title.toLowerCase().includes(search.toLowerCase()))
  );

  const handleToggle = async (ev) => {
    const joined = ev.attendees?.includes(profile.uid);
    if (joined) {
      await leaveEvent(ev.id, profile.uid);
    } else {
      if (ev.attendees?.length >= ev.maxAttendees) {
        Alert.alert('Event Full', 'This event has reached its maximum capacity.');
        return;
      }
      await joinEvent(ev.id, profile.uid);
    }
  };

  const handleCreate = async () => {
    if (!form.title || !form.date) {
      Alert.alert('Required', 'Title and date are required.'); return;
    }
    await createEvent({
      ...form,
      organizerId:   profile.uid,
      organizerName: profile.name,
      maxAttendees:  30,
    });
    setForm({ title:'', category:'Tech', date:'', time:'', location:'', desc:'' });
    setShowNew(false);
  };

  const allCats = ['All', ...new Set(events.map(e => e.category))];

  return (
    <View style={styles.container}>
      <TextInput style={styles.search} placeholder="Search events…"
        placeholderTextColor="rgba(255,255,255,0.3)"
        value={search} onChangeText={setSearch} />

      {/* Category filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {allCats.map(c => (
          <TouchableOpacity key={c} style={[styles.chip, filter===c && { backgroundColor:CAT_COLORS[c]||'#10b981' }]}
            onPress={() => setFilter(c)}>
            <Text style={[styles.chipText, filter===c && { color:'#fff', fontWeight:'700' }]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={{ flex:1 }}>
        {filtered.map(ev => {
          const color  = CAT_COLORS[ev.category] || '#10b981';
          const joined = ev.attendees?.includes(profile.uid);
          return (
            <TouchableOpacity key={ev.id} style={styles.card}
              onPress={() => navigation.navigate('EventDetail', { eventId: ev.id })}>
              {/* Color stripe */}
              <View style={[styles.stripe, { backgroundColor: color }]} />
              <View style={styles.cardBody}>
                <View style={styles.row}>
                  <View style={[styles.badge, { backgroundColor: color+'22' }]}>
                    <Text style={[styles.badgeText, { color }]}>{ev.category}</Text>
                  </View>
                  <View style={styles.dateBubble}>
                    <Text style={[styles.dateMonth, { color }]}>
                      {new Date(ev.date).toLocaleString('en',{month:'short'}).toUpperCase()}
                    </Text>
                    <Text style={[styles.dateDay, { color }]}>{new Date(ev.date).getDate()}</Text>
                  </View>
                </View>
                <Text style={styles.cardTitle}>{ev.title}</Text>
                <Text style={styles.meta}>🕐 {ev.time}  ·  📍 {ev.location}</Text>
                <Text style={styles.desc} numberOfLines={2}>{ev.desc}</Text>
                <View style={[styles.row, { justifyContent:'space-between', marginTop:10 }]}>
                  <Text style={styles.meta}>👥 {ev.attendees?.length||0}/{ev.maxAttendees}</Text>
                  <TouchableOpacity
                    style={[styles.joinBtn, { backgroundColor: joined ? 'rgba(239,68,68,0.2)' : color }]}
                    onPress={() => handleToggle(ev)}>
                    <Text style={[styles.joinBtnText, { color: joined ? '#f87171':'#fff' }]}>
                      {joined ? 'Leave' : 'Join'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
        <View style={{ height:80 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowNew(true)}>
        <Text style={styles.fabText}>＋ New Event</Text>
      </TouchableOpacity>

      {/* New event modal */}
      <Modal visible={showNew} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalBg} behavior={Platform.OS==='ios'?'padding':'height'}>
          <ScrollView style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create Event</Text>

            <TextInput style={styles.input} placeholder="Event title"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={form.title} onChangeText={v => setForm({...form,title:v})} />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:10 }}>
              {CATEGORIES.map(c => (
                <TouchableOpacity key={c}
                  style={[styles.chip, form.category===c && { backgroundColor:CAT_COLORS[c] }]}
                  onPress={() => setForm({...form,category:c})}>
                  <Text style={[styles.chipText, form.category===c && { color:'#fff', fontWeight:'700' }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={form.date} onChangeText={v => setForm({...form,date:v})} />
            <TextInput style={styles.input} placeholder="Time (e.g. 7:00 PM)"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={form.time} onChangeText={v => setForm({...form,time:v})} />
            <TextInput style={styles.input} placeholder="Location"
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={form.location} onChangeText={v => setForm({...form,location:v})} />
            <TextInput style={[styles.input, { height:80, textAlignVertical:'top' }]}
              placeholder="Description" multiline
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={form.desc} onChangeText={v => setForm({...form,desc:v})} />

            <View style={styles.row}>
              <TouchableOpacity style={[styles.btn, { flex:1 }]} onPress={handleCreate}>
                <Text style={styles.btnText}>Create Event</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { flex:1, backgroundColor:'rgba(255,255,255,0.08)' }]}
                onPress={() => setShowNew(false)}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
            <View style={{ height:24 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0d0d1a', padding:16 },
  search:    { backgroundColor:'rgba(255,255,255,0.07)', borderWidth:1,
               borderColor:'rgba(255,255,255,0.1)', borderRadius:10,
               padding:11, color:'#e8e8f0', fontSize:13, marginBottom:10 },
  chips:     { marginBottom:14 },
  chip:      { paddingHorizontal:13, paddingVertical:6, borderRadius:20, marginRight:7,
               backgroundColor:'rgba(255,255,255,0.08)' },
  chipText:  { fontSize:12, color:'rgba(255,255,255,0.5)' },
  card:      { backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1,
               borderColor:'rgba(255,255,255,0.09)', borderRadius:14,
               marginBottom:12, overflow:'hidden' },
  stripe:    { height:4, width:'100%' },
  cardBody:  { padding:14 },
  row:       { flexDirection:'row', alignItems:'center', gap:8, flexWrap:'wrap' },
  badge:     { borderRadius:6, paddingHorizontal:9, paddingVertical:2 },
  badgeText: { fontSize:11, fontWeight:'600' },
  dateBubble:{ width:34, height:34, borderRadius:8, backgroundColor:'rgba(255,255,255,0.08)',
               alignItems:'center', justifyContent:'center' },
  dateMonth: { fontSize:7, fontWeight:'700', textTransform:'uppercase' },
  dateDay:   { fontSize:14, fontWeight:'800', lineHeight:16 },
  cardTitle: { color:'#e8e8f0', fontSize:14, fontWeight:'700', marginVertical:6 },
  meta:      { color:'rgba(255,255,255,0.38)', fontSize:11 },
  desc:      { color:'rgba(255,255,255,0.5)', fontSize:12, lineHeight:18, marginTop:4 },
  joinBtn:   { borderRadius:8, paddingVertical:7, paddingHorizontal:16 },
  joinBtnText:{ fontWeight:'700', fontSize:12 },
  fab:       { position:'absolute', bottom:24, right:16, backgroundColor:'#10b981',
               borderRadius:24, paddingVertical:12, paddingHorizontal:22,
               shadowColor:'#10b981', shadowOpacity:0.5, shadowRadius:12, shadowOffset:{width:0,height:4} },
  fabText:   { color:'#fff', fontWeight:'700', fontSize:14 },
  modalBg:   { flex:1, backgroundColor:'rgba(0,0,0,0.7)', justifyContent:'flex-end' },
  modalCard: { backgroundColor:'#1a1a32', borderTopLeftRadius:20, borderTopRightRadius:20, padding:24, maxHeight:'90%' },
  modalTitle:{ color:'#fff', fontSize:16, fontWeight:'700', marginBottom:14 },
  input:     { backgroundColor:'rgba(255,255,255,0.07)', borderWidth:1,
               borderColor:'rgba(255,255,255,0.1)', borderRadius:10,
               padding:12, color:'#e8e8f0', fontSize:13, marginBottom:10 },
  btn:       { backgroundColor:'#10b981', borderRadius:10, padding:12, alignItems:'center', marginRight:8 },
  btnText:   { color:'#fff', fontWeight:'700', fontSize:13 },
});
