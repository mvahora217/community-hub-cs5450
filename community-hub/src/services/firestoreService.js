// src/services/firestoreService.js
// All Firestore reads / writes for the Community Portal

import {
  collection, doc,
  addDoc, setDoc, updateDoc, deleteDoc,
  getDoc, getDocs, query, where, orderBy, limit,
  onSnapshot, arrayUnion, arrayRemove,
  serverTimestamp, increment,
} from 'firebase/firestore';
import { db } from './firebase';

// ═══════════════════════════════════════════════════════════════════════════════
// USERS
// ═══════════════════════════════════════════════════════════════════════════════

export async function getAllUsers() {
  const snap = await getDocs(collection(db, 'users'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateUserProfile(uid, data) {
  await updateDoc(doc(db, 'users', uid), data);
}

// ═══════════════════════════════════════════════════════════════════════════════
// FORUM POSTS
// ═══════════════════════════════════════════════════════════════════════════════

/** Real-time listener for all forum posts (newest first) */
export function subscribeToForums(callback) {
  const q = query(
    collection(db, 'forums'),
    orderBy('createdAt', 'desc')
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function createPost({ title, category, authorId, authorName, authorAvatar }) {
  const ref = await addDoc(collection(db, 'forums'), {
    title,
    category,
    authorId,
    authorName,
    authorAvatar,
    likes:     0,
    likedBy:   [],
    replyCount:0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function likePost(postId, userId, isLiked) {
  const ref = doc(db, 'forums', postId);
  await updateDoc(ref, {
    likes:   increment(isLiked ? -1 : 1),
    likedBy: isLiked ? arrayRemove(userId) : arrayUnion(userId),
  });
}

export async function deletePost(postId) {
  await deleteDoc(doc(db, 'forums', postId));
}

// ── Replies (sub-collection) ──────────────────────────────────────────────────

export function subscribeToReplies(postId, callback) {
  const q = query(
    collection(db, 'forums', postId, 'replies'),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function addReply(postId, { text, authorId, authorName, authorAvatar }) {
  await addDoc(collection(db, 'forums', postId, 'replies'), {
    text,
    authorId,
    authorName,
    authorAvatar,
    likes:     0,
    createdAt: serverTimestamp(),
  });
  // Increment reply counter on parent
  await updateDoc(doc(db, 'forums', postId), { replyCount: increment(1) });
}

// ═══════════════════════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════════════════════

export function subscribeToEvents(callback) {
  const q = query(
    collection(db, 'events'),
    orderBy('date', 'asc')
  );
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function createEvent({
  title, category, date, time, location, desc,
  organizerId, organizerName, maxAttendees,
}) {
  const ref = await addDoc(collection(db, 'events'), {
    title, category, date, time, location, desc,
    organizerId, organizerName,
    maxAttendees: maxAttendees || 30,
    attendees:    [organizerId],
    createdAt:    serverTimestamp(),
  });
  return ref.id;
}

export async function joinEvent(eventId, userId) {
  await updateDoc(doc(db, 'events', eventId), {
    attendees: arrayUnion(userId),
  });
}

export async function leaveEvent(eventId, userId) {
  await updateDoc(doc(db, 'events', eventId), {
    attendees: arrayRemove(userId),
  });
}

export async function deleteEvent(eventId) {
  await deleteDoc(doc(db, 'events', eventId));
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUPS
// ═══════════════════════════════════════════════════════════════════════════════

export function subscribeToGroups(callback) {
  const q = query(collection(db, 'groups'), orderBy('name', 'asc'));
  return onSnapshot(q, snap => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

export async function joinGroup(groupId, userId) {
  await updateDoc(doc(db, 'groups', groupId), {
    members: arrayUnion(userId),
  });
}

export async function leaveGroup(groupId, userId) {
  await updateDoc(doc(db, 'groups', groupId), {
    members: arrayRemove(userId),
  });
}

// ── Seed default groups (run once after Firebase project creation) ─────────────
export async function seedGroups() {
  const snap = await getDocs(collection(db, 'groups'));
  if (!snap.empty) return; // already seeded

  const defaults = [
    { name:'Tech Builders',  category:'Tech',        icon:'💻', members:[], desc:'Developers, makers, and tech enthusiasts sharing projects and ideas.' },
    { name:'Trail Seekers',  category:'Outdoors',    icon:'🏔️', members:[], desc:'Outdoor adventures, hiking, camping and connecting with nature.' },
    { name:'Canvas & Code',  category:'Art',         icon:'🎨', members:[], desc:'Artists across all mediums — digital, traditional, mixed.' },
    { name:'Beat Makers',    category:'Music',       icon:'🎵', members:[], desc:'Musicians and producers sharing sounds and gear talk.' },
    { name:'Pixel Hunters',  category:'Gaming',      icon:'🎮', members:[], desc:'Gamers of all genres. No gatekeeping, all welcome.' },
    { name:'Active Crew',    category:'Fitness',     icon:'🚴', members:[], desc:'Cyclists, runners, and fitness folks keeping each other accountable.' },
  ];

  for (const g of defaults) {
    await addDoc(collection(db, 'groups'), { ...g, createdAt: serverTimestamp() });
  }
}
