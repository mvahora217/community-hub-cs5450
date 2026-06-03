// src/services/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            "AIzaSyCrs02TnvxsjGFzf2NFHKMFVhpRKrt7L6o",
  authDomain:        "community-hub-7a150.firebaseapp.com",
  projectId:         "community-hub-7a150",
  storageBucket:     "community-hub-7a150.firebasestorage.app",
  messagingSenderId: "635344875368",
  appId:             "1:635344875368:web:0abb522a44691288d6f0dd",
};

const app  = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);
export default app;
