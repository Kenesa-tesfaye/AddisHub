/**
 * authSlice.js — CRH authentication Redux slice
 *
 * State shape:
 *   auth.user  : { id, name, email, role, image, bio, ... } | null
 *   auth.token : string | null
 *
 * Actions:
 *   login({ token, user })   — called after successful login (email or Google)
 *   logout()                 — clears everything
 *   setUser(partialUser)     — patch user fields after profile update
 */

import { createSlice } from "@reduxjs/toolkit";

/* ── helpers ───────────────────────────────────────────────── */
const TOKEN_KEY = "crh_token";
const USER_KEY  = "crh_user";

const loadFromStorage = () => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    const raw   = localStorage.getItem(USER_KEY);
    const user  = raw ? JSON.parse(raw) : null;
    return { token, user };
  } catch {
    return { token:null, user:null };
  }
};

const saveToStorage = (token, user) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else       localStorage.removeItem(TOKEN_KEY);
    if (user)  localStorage.setItem(USER_KEY, JSON.stringify(user));
    else       localStorage.removeItem(USER_KEY);
  } catch {}
};

/* ── initial state (hydrated from localStorage) ─────────────── */
const { token: storedToken, user: storedUser } = loadFromStorage();

const initialState = {
  token : storedToken || null,
  user  : storedUser  || null,
};

/* ── slice ──────────────────────────────────────────────────── */
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * login({ token, user })
     * Called after /auth/login or /auth/google resolves.
     */
    login(state, { payload }) {
      const token = payload.token || payload.access_token || null;
      const user  = payload.user  || null;
      state.token = token;
      state.user  = user;
      saveToStorage(token, user);
    },

    /**
     * logout()
     * Clears state and removes from localStorage.
     */
    logout(state) {
      state.token = null;
      state.user  = null;
      saveToStorage(null, null);
    },

    /**
     * setUser(partialUser)
     * Patches individual user fields (e.g. after profile update).
     */
    setUser(state, { payload }) {
      if (state.user) {
        state.user = { ...state.user, ...payload };
        saveToStorage(state.token, state.user);
      }
    },
  },
});

export const { login, logout, setUser } = authSlice.actions;
export default authSlice.reducer;