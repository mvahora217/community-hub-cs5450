// src/screens/AuthScreen.js
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import { registerUser, loginUser } from '../services/authService';

export default function AuthScreen() {
  const [mode,    setMode]    = useState('login');
  const [name,    setName]    = useState('');
  const [email,   setEmail]   = useState('');
  const [password,setPassword]= useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return Alert.alert('Error', 'Email and password are required.');
    if (mode === 'register' && !name) return Alert.alert('Error', 'Name is required.');

    setLoading(true);
    try {
      if (mode === 'login') {
        await loginUser({ email, password });
      } else {
        await registerUser({ name, email, password });
      }
      // onAuthChange in useAuth.js will update state automatically
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        {/* Logo */}
        <Text style={styles.logo}>🌐</Text>
        <Text style={styles.title}>CommunityHub</Text>
        <Text style={styles.subtitle}>Where shared interests connect people</Text>

        {/* Card */}
        <View style={styles.card}>
          {/* Tabs */}
          <View style={styles.tabs}>
            {['login','register'].map(m => (
              <TouchableOpacity
                key={m}
                style={[styles.tab, mode===m && styles.tabActive]}
                onPress={() => { setMode(m); }}
              >
                <Text style={[styles.tabText, mode===m && styles.tabTextActive]}>
                  {m === 'login' ? 'Sign In' : 'Register'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {mode === 'register' && (
            <TextInput
              style={styles.input}
              placeholder="Full name"
              placeholderTextColor="rgba(255,255,255,0.35)"
              value={name}
              onChangeText={setName}
            />
          )}
          <TextInput
            style={styles.input}
            placeholder="Email address"
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="rgba(255,255,255,0.35)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.btn}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>{mode === 'login' ? 'Sign In' : 'Create Account'}</Text>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:'#0d0d1a' },
  inner:     { flexGrow:1, alignItems:'center', justifyContent:'center', padding:24 },
  logo:      { fontSize:52, marginBottom:8 },
  title:     { fontSize:28, fontWeight:'800', color:'#fff', marginBottom:6 },
  subtitle:  { fontSize:14, color:'rgba(255,255,255,0.4)', marginBottom:36, textAlign:'center' },
  card:      { width:'100%', maxWidth:380, backgroundColor:'rgba(255,255,255,0.05)',
               borderWidth:1, borderColor:'rgba(255,255,255,0.1)', borderRadius:22, padding:24 },
  tabs:      { flexDirection:'row', backgroundColor:'rgba(255,255,255,0.06)',
               borderRadius:10, padding:3, marginBottom:22 },
  tab:       { flex:1, paddingVertical:9, borderRadius:8, alignItems:'center' },
  tabActive: { backgroundColor:'rgba(99,102,241,0.7)' },
  tabText:   { fontSize:14, fontWeight:'600', color:'rgba(255,255,255,0.4)' },
  tabTextActive: { color:'#fff' },
  input:     { backgroundColor:'rgba(255,255,255,0.07)', borderWidth:1,
               borderColor:'rgba(255,255,255,0.12)', borderRadius:10,
               padding:13, color:'#e8e8f0', fontSize:14, marginBottom:12 },
  btn:       { backgroundColor:'#6366f1', borderRadius:12,
               paddingVertical:14, alignItems:'center', marginTop:4 },
  btnText:   { color:'#fff', fontWeight:'700', fontSize:15 },
});
