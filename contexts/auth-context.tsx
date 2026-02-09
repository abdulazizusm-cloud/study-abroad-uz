"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-client";
import { WizardFormData } from "@/lib/wizard-types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    profile: { firstName: string; lastName: string; phone: string }
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  saveWizardProfile: (wizardData: WizardFormData) => Promise<void>;
  loadWizardProfile: () => Promise<WizardFormData | null>;
  getProfile: () => Promise<{ first_name: string; last_name: string; phone: string } | null>;
  upsertProfile: (profile: { firstName: string; lastName: string; phone: string }) => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
      throw error;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    profile: { firstName: string; lastName: string; phone: string }
  ) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: profile.firstName,
            last_name: profile.lastName,
            phone: profile.phone,
          },
        },
      });
      if (error) throw error;

      if (data.user?.id) {
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert(
            {
              user_id: data.user.id,
              first_name: profile.firstName,
              last_name: profile.lastName,
              phone: profile.phone,
            },
            { onConflict: "user_id" }
          );
        if (profileError) throw profileError;
      }
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/wizard-results`,
        },
      });
      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
      throw error;
    }
  };

  const saveWizardProfile = async (wizardData: WizardFormData) => {
    if (!user) return;
    try {
      setError(null);
      const { error } = await supabase
        .from("wizard_profiles")
        .upsert(
          {
            user_id: user.id,
            wizard_data: wizardData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
      throw error;
    }
  };

  const loadWizardProfile = async (): Promise<WizardFormData | null> => {
    if (!user) return null;
    try {
      setError(null);
      const { data, error } = await supabase
        .from("wizard_profiles")
        .select("wizard_data")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return (data?.wizard_data as WizardFormData) ?? null;
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
      throw error;
    }
  };

  const getProfile = async () => {
    if (!user) return null;
    try {
      setError(null);
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name,last_name,phone")
        .eq("user_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data ?? null;
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
      throw error;
    }
  };

  const upsertProfile = async (profile: { firstName: string; lastName: string; phone: string }) => {
    if (!user) return;
    try {
      setError(null);
      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            user_id: user.id,
            first_name: profile.firstName,
            last_name: profile.lastName,
            phone: profile.phone,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    saveWizardProfile,
    loadWizardProfile,
    getProfile,
    upsertProfile,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
