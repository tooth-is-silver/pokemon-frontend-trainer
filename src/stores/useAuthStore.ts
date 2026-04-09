import { create } from "zustand";
import { supabase } from "../lib/supabase";
import type { AuthState } from "./types";

interface AuthStore extends AuthState {
  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  userId: null,
  loading: true,

  initialize: async () => {
    const { data } = await supabase.auth.getSession();
    set({
      userId: data.session?.user.id ?? null,
      loading: false,
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      set({ userId: session?.user.id ?? null });
    });
  },

  signInWithGoogle: async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ userId: null });
  },
}));
