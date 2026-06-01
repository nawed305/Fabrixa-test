// Supabase auth hook — Firebase-compatible user shape for existing UI.
import { useCallback, useSyncExternalStore } from "react";
import { getSupabase } from "./supabase";
import { authCallbackUrl, resetPasswordUrl } from "./appOrigin";
import {
  getAuthState,
  subscribeAuth,
  setAdminBypassState,
  type FabrixaUser,
} from "./authStore";

export type { FabrixaUser };

export interface AuthState {
  user: FabrixaUser | null;
  loading: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// CACHED SNAPSHOT REFERENCE: Stabilizes object identity to eliminate runtime layout crashes
const STABLE_SERVER_SNAPSHOT = { user: null, loading: true };
const getServerSnapshot = () => STABLE_SERVER_SNAPSHOT;

export function useAuth(): AuthState {
  const state = useSyncExternalStore(
    subscribeAuth,
    getAuthState,
    getServerSnapshot,
  );

  const signInEmail = useCallback(async (email: string, password: string) => {
    const cleanEmail = email.trim();
    
    // OFF-NETWORK ADMINISTRATOR BYPASS
    if (cleanEmail === "Axiom_Admin" && password === "Axiom_Admin") {
      const { useSubscriptionStore } = await import("./subscriptionStore");
      useSubscriptionStore.getState().setAdminMode(true);
      setAdminBypassState({
        uid: "axiom_admin_bypass_local_uid",
        email: "Axiom_Admin",
        displayName: "Axiom Executive Admin",
        photoURL: null,
      });
      return;
    }

    const { error } = await getSupabase().auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    if (error) throw error;
  }, []);

  const signUpEmail = useCallback(async (email: string, password: string) => {
    const redirectTo = authCallbackUrl();
    const { data, error } = await getSupabase().auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: redirectTo },
    });
    if (error) throw error;
    if (data.user) {
      const { ensureUserProfile } = await import("./userProfile");
      await ensureUserProfile(data.user.id, data.user.email ?? email.trim());
    }
  }, []);

  const signInGoogle = useCallback(async () => {
    const redirectTo = authCallbackUrl();
    const { error } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: false,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    if (state.user?.email === "Axiom_Admin") {
      const { useSubscriptionStore } = await import("./subscriptionStore");
      useSubscriptionStore.getState().setAdminMode(false);
      setAdminBypassState(null);
      return;
    }
    await getSupabase().auth.signOut();
  }, [state.user]);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await getSupabase().auth.resetPasswordForEmail(
      email.trim(),
      { redirectTo: resetPasswordUrl() },
    );
    if (error) throw error;
  }, []);

  return {
    user: state.user,
    loading: state.loading,
    signInEmail,
    signUpEmail,
    signInGoogle,
    signOut,
    resetPassword,
  };
}