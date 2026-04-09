import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { useGameStore } from "./useGameStore";
import type { AuthState } from "./types";

interface AuthStore extends AuthState {
  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// 리스너 중복 등록 방지
let authSubscription: { unsubscribe: () => void } | null = null;

export const useAuthStore = create<AuthStore>((set) => ({
  userId: null,
  loading: true,

  initialize: async () => {
    const { data } = await supabase.auth.getSession();
    set({
      userId: data.session?.user.id ?? null,
      loading: false,
    });

    // 기존 리스너 정리 후 새로 등록
    authSubscription?.unsubscribe();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ userId: session?.user.id ?? null });
    });
    authSubscription = listener.subscription;
  },

  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    // 게임 상태도 초기화
    useGameStore.getState().reset();
    set({ userId: null });
  },
}));
