"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase-client";
import { WizardFormData } from "@/lib/wizard-types";

export type Tier = "free" | "pro_lite" | "pro" | "pro_plus";

export type TierInfo = {
  tier: Tier;
  effectiveTier: Tier;
  bonusUniversities: number;
  tierOverride?: Tier | null;
  overrideEndsAt?: string | null;
  proTrialEndsAt?: string | null;
};

type EventSource = {
  utm_source?: string;
  utm_campaign?: string;
  utm_medium?: string;
  utm_content?: string;
  utm_term?: string;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    profile: { firstName: string; lastName: string; phone: string }
  ) => Promise<{ hasSession: boolean }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  saveWizardProfile: (wizardData: WizardFormData) => Promise<void>;
  loadWizardProfile: () => Promise<WizardFormData | null>;
  getProfile: () => Promise<{ first_name: string; last_name: string; phone: string } | null>;
  upsertProfile: (profile: { firstName: string; lastName: string; phone: string }) => Promise<void>;
  getTierInfo: () => Promise<TierInfo>;
  trackEvent: (eventType: string, metadata?: Record<string, unknown>, page?: string) => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const ensureBaselineEntitlements = async (userId: string) => {
    // Create a baseline entitlements row for logged-in users (Pro Lite), if missing.
    try {
      const { data, error } = await supabase
        .from("entitlements")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();
      if (error) throw error;
      if (!data) {
        const { error: insertError } = await supabase.from("entitlements").insert({
          user_id: userId,
          tier: "pro_lite",
        });
        if (insertError) throw insertError;
      }
    } catch (e) {
      // Do not hard-fail auth; surface for debugging
      const authError = e as AuthError;
      setError(authError.message);
    }
  };

  const getSessionId = () => {
    const key = "saas_session_id";
    let sessionId = localStorage.getItem(key);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem(key, sessionId);
    }
    return sessionId;
  };

  const getSource = (): EventSource => {
    const key = "saas_utm_source";
    const fromStorage = localStorage.getItem(key);
    if (fromStorage) {
      try {
        return JSON.parse(fromStorage) as EventSource;
      } catch {
        // fallthrough
      }
    }
    const params = new URLSearchParams(window.location.search);
    const source: EventSource = {
      utm_source: params.get("utm_source") ?? undefined,
      utm_campaign: params.get("utm_campaign") ?? undefined,
      utm_medium: params.get("utm_medium") ?? undefined,
      utm_content: params.get("utm_content") ?? undefined,
      utm_term: params.get("utm_term") ?? undefined,
    };
    localStorage.setItem(key, JSON.stringify(source));
    return source;
  };

  const persistWizardDataForUser = async (userId: string) => {
    try {
      const savedData = localStorage.getItem("wizardFormData");
      if (!savedData) return;
      const wizardData = JSON.parse(savedData) as WizardFormData;
      const { error } = await supabase
        .from("wizard_profiles")
        .upsert(
          {
            user_id: userId,
            wizard_data: wizardData,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
      if (error) throw error;
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user?.id) {
        ensureBaselineEntitlements(session.user.id);
        persistWizardDataForUser(session.user.id);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user?.id) {
        ensureBaselineEntitlements(session.user.id);
        persistWizardDataForUser(session.user.id);
      }
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
      return { hasSession: !!data.session };
    } catch (error) {
      const authError = error as AuthError;
      setError(authError.message);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setError(null);
      // Use production URL if available, otherwise use current origin
      const redirectOrigin = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${redirectOrigin}/wizard-results`,
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
      // Avoid crashing if duplicate rows accidentally exist for the same user_id.
      const { data, error } = await supabase
        .from("profiles")
        .select("first_name,last_name,phone")
        .eq("user_id", user.id)
        .limit(1);
      if (error) throw error;
      return (data?.[0] as any) ?? null;
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

  const getTierInfo = async (): Promise<TierInfo> => {
    if (!user) {
      return { tier: "free", effectiveTier: "free", bonusUniversities: 0 };
    }

    // Baseline tier for any logged-in user is Pro Lite unless subscription/override says otherwise.
    let tier: Tier = "pro_lite";
    let effectiveTier: Tier = "pro_lite";
    let bonusUniversities = 0;

    try {
      setError(null);

      // Load entitlements (bonus + overrides + trial)
      const { data: ent, error: entError } = await supabase
        .from("entitlements")
        .select("tier, bonus_universities, tier_override, override_ends_at, pro_trial_ends_at")
        .eq("user_id", user.id)
        .maybeSingle();
      if (entError) throw entError;

      if (ent?.tier === "pro" || ent?.tier === "pro_plus" || ent?.tier === "pro_lite") {
        tier = ent.tier as Tier;
      }
      bonusUniversities = ent?.bonus_universities ?? 0;

      const now = Date.now();
      const overrideActive =
        !!ent?.tier_override &&
        (!ent?.override_ends_at || new Date(ent.override_ends_at).getTime() > now);

      const trialActive =
        ent?.pro_trial_ends_at && new Date(ent.pro_trial_ends_at).getTime() > now;

      if (overrideActive) {
        effectiveTier = (ent!.tier_override as Tier) ?? tier;
      } else if (trialActive) {
        effectiveTier = "pro";
      } else {
        effectiveTier = tier;
      }

      // If we have an active Stripe subscription, treat as paid Pro for now.
      // (Later we'll map price_id -> pro/pro_plus.)
      const { data: subs, error: subError } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1);
      if (subError) throw subError;
      const status = subs?.[0]?.status;
      if (status === "active" || status === "trialing") {
        effectiveTier = "pro";
      }

      return {
        tier,
        effectiveTier,
        bonusUniversities,
        tierOverride: (ent?.tier_override as Tier) ?? null,
        overrideEndsAt: ent?.override_ends_at ?? null,
        proTrialEndsAt: ent?.pro_trial_ends_at ?? null,
      };
    } catch (e) {
      const authError = e as AuthError;
      setError(authError.message);
      return { tier, effectiveTier, bonusUniversities };
    }
  };

  const trackEvent = async (
    eventType: string,
    metadata: Record<string, unknown> = {},
    page?: string
  ) => {
    if (!user) return;
    try {
      setError(null);
      const { error } = await supabase.from("user_events").insert({
        user_id: user.id,
        event_type: eventType,
        metadata,
        session_id: getSessionId(),
        source: getSource(),
        page: page ?? window.location.pathname,
      });
      if (error) throw error;
    } catch (e) {
      const authError = e as AuthError;
      setError(authError.message);
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
    getTierInfo,
    trackEvent,
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
