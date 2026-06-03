// src/hooks/useAuth.js
// React context + hook for auth state across the whole app

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthChange, fetchUserProfile } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,        setUser]    = useState(null);   // Firebase Auth user
  const [profile,     setProfile] = useState(null);   // Firestore profile doc
  const [loading,     setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const p = await fetchUserProfile(firebaseUser.uid);
        setProfile(p);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, setProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
