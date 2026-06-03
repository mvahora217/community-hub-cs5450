// src/screens/ForumsScreen.js
import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, StyleSheet, Modal, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import {
  subscribeToForums, createPost, likePost,
  subscribeToReplies, addReply, deletePost,
} from '../services/firestoreService';
import { CAT_COLORS } from '../utils/helpers';

const CATEGORIES = Object.keys(CAT_COLORS);

// ── Forums List ───────────────────────────────────────────────────────────────
export function ForumsScreen({ navigation }) {
  const { profile } = useAuth();
  const [forums,   setForums]   = useState([]);
  const [filter,   setFilter]   = useState('All');
  const [search,   setSearch]   = useState('');
  const [showNew,  setShowNew]  = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCat,   setNewCat]   = useState('Tech');

  useEffect(() => subscribeToForums(setForums), []);

  const filtered = forums.filter(f =>
    (filter === 'All' || f.category === filter) &&
    (!search || f.title.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    await createPost({
      title: newTitle, category: newCat,
      authorId: profile.uid, authorName: profile.name, authorAvatar: profile.avatar,
    });
    setNewTitle(''); setShowNew(false);
  };

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <TextInput style={styles.search} placeholder="Search posts…"
        placeholderTextColor="rgba(255,255,255,0.3)" value={search}
        onChangeText={setSearch} />

      {/* Category chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        {['All', ...CATEGORIES].map(c => (
          <TouchableOpacity key={c} style={[styles.chip, filter===c && { backgroundColor: CAT_COLORS[c]||'#6366f1' }]}
            onPress={() => setFilter(c)}>
            <Text style={[styles.chipText, filter===c && { color:'#fff', fontWeight:'700' }]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Post list */}
      <ScrollView style={{ flex:1 }}>
        {filtered.map(p => (
          <TouchableOpacity key={p.id} style={styles.card}
            onPress={() => navigation.navigate('ThreadDetail', { postId: p.id })}>
            <View style={styles.row}>
              <View style={[styles.badge, { backgroundColor:(CAT_COLORS[p.category]||'#6366f1')+'22' }]}>
                <Text style={[styles.badgeText, { color:CAT_COLORS[p.category]||'#6366f1' }]}>{p.category}</Text>
              </View>
              {p.authorId === profile.uid &&
                <View style={[styles.badge, { backgroundColor:'#6366f122' }]}>
                  <Text style={[styles.badgeText, { color:'#a5b4fc' }]}>Your post</Text>
                </View>
              }
            </View>
            <Text style={styles.cardTitle}>{p.title}</Text>
            <View style={styles.row}>
              <Text style={styles.meta}>by {p.authorName}</Text>
              <Text style={styles.meta}>❤️ {p.likes}</Text>
              <Text style={styles.meta}>💬 {p.replyCount||0}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height:80 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowNew(true)}>
        <Text style={styles.fabText}>＋ New Post</Text>
      </TouchableOpacity>

      {/* New post modal */}
      <Modal visible={showNew} transparent animationType="slide">
        <KeyboardAvoidingView style={styles.modalBg} behavior={Platform.OS==='ios'?'padding':'height'}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create a Post</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:12 }}>
              {CATEGORIES.map(c => (
                <TouchableOpacity key={c} style={[styles.chip, newCat===c && { backgroundColor:CAT_COLORS[c] }]}
                  onPress={() => setNewCat(c)}>
                  <Text style={[styles.chipText, newCat===c && { color:'#fff', fontWeight:'700' }]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput style={styles.input} placeholder="What's on your mind?"
              placeholderTextColor="rgba(255,255,255,0.3)" value={newTitle}
              onChangeText={setNewTitle} multiline />
            <View style={styles.row}>
              <TouchableOpacity style={[styles.btn, { flex:1 }]} onPress={handleCreate}>
                <Text style={styles.btnText}>Post</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { flex:1, backgroundColor:'rgba(255,255,255,0.08)' }]}
                onPress={() => setShowNew(false)}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// ── Thread Detail ─────────────────────────────────────────────────────────────
export function ThreadDetailScreen({ route }) {
  const { postId } = route.params;
  const { profile } = useAuth();
  const [post,    setPost]    = useState(null);
  const [replies, setReplies] = useState([]);
  const [reply,   setReply]   = useState('');
  const [liked,   setLiked]   = useState(false);

  useEffect(() => {
    const u1 = subscribeToForums(posts => {
      const p = posts.find(x => x.id === postId);
      if (p) { setPost(p); setLiked(p.likedBy?.includes(profile.uid)); }
    });
    const u2 = subscribeToReplies(postId, setReplies);
    return () => { u1(); u2(); };
  }, [postId]);

  const handleLike = async () => {
    await likePost(postId, profile.uid, liked);
    setLiked(!liked);
  };

  const handleReply = async () => {
    if (!reply.trim()) return;
    await addReply(postId, { text:reply, authorId:profile.uid, authorName:profile.name, authorAvatar:profile.avatar });
    setReply('');
  };

  if (!post) return <View style={styles.container}><Text style={{ color:'#fff' }}>Loading…</Text></View>;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS==='ios'?'padding':'height'}>
      <ScrollView style={{ flex:1 }}>
        <View style={[styles.badge, { backgroundColor:(CAT_COLORS[post.category]||'#6366f1')+'22', alignSelf:'flex-start', marginBottom:10 }]}>
          <Text style={[styles.badgeText, { color:CAT_COLORS[post.category]||'#6366f1' }]}>{post.category}</Text>
        </View>
        <Text style={[styles.cardTitle, { fontSize:18, marginBottom:8 }]}>{post.title}</Text>
        <Text style={styles.meta}>by {post.authorName}</Text>

        <TouchableOpacity style={[styles.btn, { alignSelf:'flex-start', marginVertical:14,
          backgroundColor: liked ? 'rgba(99,102,241,0.3)':'rgba(255,255,255,0.08)' }]}
          onPress={handleLike}>
          <Text style={[styles.btnText, { color: liked ? '#a5b4fc':'rgba(255,255,255,0.7)' }]}>
            {liked?'❤️':'🤍'} {post.likes} Likes
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>{replies.length} REPLIES</Text>
        {replies.map(r => (
          <View key={r.id} style={styles.replyCard}>
            <View style={styles.row}>
              <Text style={styles.replyAuthor}>{r.authorName}</Text>
              <Text style={styles.meta}>{r.createdAt?.toDate?.().toLocaleTimeString('en',{hour:'2-digit',minute:'2-digit'}) || 'just now'}</Text>
            </View>
            <Text style={styles.replyText}>{r.text}</Text>
          </View>
        ))}
        {replies.length === 0 &&
          <Text style={[styles.meta, { textAlign:'center', marginVertical:20 }]}>Be the first to reply!</Text>}
        <View style={{ height:80 }} />
      </ScrollView>

      {/* Reply input */}
      <View style={styles.replyBar}>
        <TextInput style={[styles.input, { flex:1, marginBottom:0 }]}
          placeholder="Write a reply…" placeholderTextColor="rgba(255,255,255,0.3)"
          value={reply} onChangeText={setReply} />
        <TouchableOpacity style={styles.sendBtn} onPress={handleReply}>
          <Text style={{ color:'#fff', fontWeight:'700' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flex:1, backgroundColor:'#0d0d1a', padding:16 },
  search:      { backgroundColor:'rgba(255,255,255,0.07)', borderWidth:1,
                 borderColor:'rgba(255,255,255,0.1)', borderRadius:10,
                 padding:11, color:'#e8e8f0', fontSize:13, marginBottom:10 },
  chips:       { marginBottom:14 },
  chip:        { paddingHorizontal:13, paddingVertical:6, borderRadius:20, marginRight:7,
                 backgroundColor:'rgba(255,255,255,0.08)' },
  chipText:    { fontSize:12, color:'rgba(255,255,255,0.5)' },
  card:        { backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1,
                 borderColor:'rgba(255,255,255,0.09)', borderRadius:14, padding:14, marginBottom:10 },
  row:         { flexDirection:'row', alignItems:'center', gap:8, flexWrap:'wrap' },
  badge:       { borderRadius:6, paddingHorizontal:9, paddingVertical:2 },
  badgeText:   { fontSize:11, fontWeight:'600' },
  cardTitle:   { color:'#e8e8f0', fontSize:14, fontWeight:'600', marginVertical:6, lineHeight:20 },
  meta:        { color:'rgba(255,255,255,0.35)', fontSize:11 },
  fab:         { position:'absolute', bottom:24, right:16, backgroundColor:'#6366f1',
                 borderRadius:24, paddingVertical:12, paddingHorizontal:22,
                 shadowColor:'#6366f1', shadowOpacity:0.5, shadowRadius:12, shadowOffset:{width:0,height:4} },
  fabText:     { color:'#fff', fontWeight:'700', fontSize:14 },
  modalBg:     { flex:1, backgroundColor:'rgba(0,0,0,0.7)', justifyContent:'flex-end' },
  modalCard:   { backgroundColor:'#1a1a32', borderTopLeftRadius:20, borderTopRightRadius:20, padding:24 },
  modalTitle:  { color:'#fff', fontSize:16, fontWeight:'700', marginBottom:14 },
  input:       { backgroundColor:'rgba(255,255,255,0.07)', borderWidth:1,
                 borderColor:'rgba(255,255,255,0.1)', borderRadius:10,
                 padding:12, color:'#e8e8f0', fontSize:13, marginBottom:10 },
  btn:         { backgroundColor:'#6366f1', borderRadius:10, padding:12,
                 alignItems:'center', marginRight:8 },
  btnText:     { color:'#fff', fontWeight:'700', fontSize:13 },
  sectionLabel:{ color:'rgba(255,255,255,0.3)', fontSize:11, fontWeight:'700',
                 letterSpacing:1.5, marginBottom:12 },
  replyCard:   { backgroundColor:'rgba(255,255,255,0.05)', borderRadius:12, padding:12, marginBottom:10 },
  replyAuthor: { color:'#e8e8f0', fontWeight:'600', fontSize:13 },
  replyText:   { color:'rgba(255,255,255,0.65)', fontSize:13, marginTop:6, lineHeight:19 },
  replyBar:    { flexDirection:'row', gap:8, padding:12,
                 borderTopWidth:1, borderColor:'rgba(255,255,255,0.07)' },
  sendBtn:     { backgroundColor:'#6366f1', borderRadius:10, paddingHorizontal:16, justifyContent:'center' },
});
