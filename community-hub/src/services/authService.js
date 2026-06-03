// src/services/authService.js
// Wraps Firebase Auth + writes user profile to Firestore on register

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import {
  doc, setDoc, getDoc, serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';

// ── Register ─────────────────────────────────────────────────────────────────
export async function registerUser({ name, email, password }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });

  // Write profile document to Firestore
  const avatar = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid:       cred.user.uid,
    name,
    email,
    avatar,
    role:      'member',
    bio:       'New community member',
    interests: [],
    posts:     0,
    events:    0,
    joinedAt:  serverTimestamp(),
  });

  return cred.user;
}

// ── Login ────────────────────────────────────────────────────────────────────
export async function loginUser({ email, password }) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

// ── Logout ───────────────────────────────────────────────────────────────────
export async function logoutUser() {
  await signOut(auth);
}

// ── Fetch user profile from Firestore ────────────────────────────────────────
export async function fetchUserProfile(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ── Auth state listener ───────────────────────────────────────────────────────
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}
