import { create } from "zustand";
import { supabase } from "@/lib/supabase";
import type { AuthState } from "@/core/types";
import { useGameStore } from "./useGameStore";

interface AuthStore {
  userId: AuthState["userId"];
  email: AuthState["email"];
  loading: AuthState["loading"];
  initialize: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// 리스너 중복 등록 방지
let authSubscription: { unsubscribe: () => void } | null = null;

export const useAuthStore = create<AuthStore>((set) => ({
  userId: null,
  email: null,
  loading: true,

  initialize: async () => {
    const { data } = await supabase.auth.getSession();
    set({
      userId: data.session?.user.id ?? null,
      email: data.session?.user.email ?? null,
      loading: false,
    });

    authSubscription?.unsubscribe();
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ userId: session?.user.id ?? null, email: session?.user.email ?? null });
    });
    authSubscription = listener.subscription;
  },

  signInWithEmail: async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) throw error;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    useGameStore.getState().reset();
    set({ userId: null, email: null });
  },
}));
