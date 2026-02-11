"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Shield } from "lucide-react";

type EntitlementsRow = {
  user_id: string;
  tier: string;
  bonus_universities: number;
  tier_override: string | null;
  override_ends_at: string | null;
  pro_trial_ends_at: string | null;
  updated_at: string;
};

type ProfileRow = {
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_admin: boolean;
};

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [targetUserId, setTargetUserId] = useState("");
  const [targetProfile, setTargetProfile] = useState<ProfileRow | null>(null);
  const [entitlements, setEntitlements] = useState<EntitlementsRow | null>(null);
  const [bonusUniversities, setBonusUniversities] = useState<string>("0");
  const [tierOverride, setTierOverride] = useState<string>("");
  const [overrideEndsAt, setOverrideEndsAt] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const effectiveTier = useMemo(() => {
    if (!entitlements) return "—";
    const now = Date.now();
    const overrideActive =
      !!entitlements.tier_override &&
      (!entitlements.override_ends_at || new Date(entitlements.override_ends_at).getTime() > now);
    const trialActive =
      entitlements.pro_trial_ends_at &&
      new Date(entitlements.pro_trial_ends_at).getTime() > now;
    if (overrideActive) return entitlements.tier_override!;
    if (trialActive) return "pro";
    return entitlements.tier;
  }, [entitlements]);

  useEffect(() => {
    const checkAdmin = async () => {
      if (authLoading) return;
      if (!user) {
        router.push("/");
        return;
      }
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("user_id", user.id)
          .maybeSingle();
        if (error) throw error;
        setIsAdmin(!!data?.is_admin);
      } catch {
        setIsAdmin(false);
      }
    };
    checkAdmin();
  }, [user, authLoading, router]);

  const loadUser = async () => {
    setError("");
    setInfo("");
    setTargetProfile(null);
    setEntitlements(null);
    if (!targetUserId.trim()) {
      setError("Введите user_id");
      return;
    }
    try {
      const [{ data: profileData, error: pErr }, { data: entData, error: eErr }] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("user_id,first_name,last_name,phone,is_admin")
            .eq("user_id", targetUserId.trim())
            .maybeSingle(),
          supabase
            .from("entitlements")
            .select("user_id,tier,bonus_universities,tier_override,override_ends_at,pro_trial_ends_at,updated_at")
            .eq("user_id", targetUserId.trim())
            .maybeSingle(),
        ]);
      if (pErr) throw pErr;
      if (eErr) throw eErr;
      setTargetProfile(profileData ?? null);
      setEntitlements(entData ?? null);
      setBonusUniversities(String(entData?.bonus_universities ?? 0));
      setTierOverride(entData?.tier_override ?? "");
      setOverrideEndsAt(entData?.override_ends_at ? entData.override_ends_at.slice(0, 16) : "");
      setInfo("Данные загружены");
    } catch (e: any) {
      setError(e?.message ?? "Не удалось загрузить данные");
    }
  };

  const saveEntitlements = async () => {
    if (!entitlements) {
      setError("Сначала загрузите пользователя");
      return;
    }
    setSaving(true);
    setError("");
    setInfo("");
    try {
      const bonus = Number(bonusUniversities || "0");
      const payload = {
        user_id: entitlements.user_id,
        bonus_universities: Number.isFinite(bonus) ? bonus : 0,
        tier_override: tierOverride.trim() ? tierOverride.trim() : null,
        override_ends_at: overrideEndsAt ? new Date(overrideEndsAt).toISOString() : null,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("entitlements").upsert(payload, { onConflict: "user_id" });
      if (error) throw error;
      setInfo("Сохранено");
      await loadUser();
    } catch (e: any) {
      setError(e?.message ?? "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-gray-600">Загрузка...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center max-w-md w-full">
          <div className="mx-auto w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3">
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Доступ запрещён</h1>
          <p className="text-sm text-gray-600 mb-4">У вас нет прав администратора.</p>
          <Button variant="outline" onClick={() => router.push("/")}>
            На главную
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" onClick={() => router.push("/wizard-results")} className="hover:bg-blue-100 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад
        </Button>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Админка</h1>
              <p className="text-sm text-gray-600">Entitlements / bonus / override</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-end mb-6">
            <div>
              <p className="text-xs text-gray-500 mb-1">User ID</p>
              <Input value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} placeholder="uuid пользователя" className="h-11" />
            </div>
            <Button onClick={loadUser} className="bg-blue-600 hover:bg-blue-700 h-11">
              Загрузить
            </Button>
          </div>

          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          {info && <p className="text-sm text-green-700 mb-4">{info}</p>}

          {targetProfile && (
            <div className="border border-gray-200 rounded-2xl p-4 mb-6">
              <p className="text-sm font-semibold text-gray-900 mb-2">Пользователь</p>
              <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-700">
                <div><span className="text-gray-500">Имя:</span> {targetProfile.first_name}</div>
                <div><span className="text-gray-500">Фамилия:</span> {targetProfile.last_name}</div>
                <div><span className="text-gray-500">Телефон:</span> {targetProfile.phone}</div>
                <div><span className="text-gray-500">Admin:</span> {targetProfile.is_admin ? "да" : "нет"}</div>
              </div>
            </div>
          )}

          {entitlements && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="border border-gray-200 rounded-2xl p-4">
                <p className="text-sm font-semibold text-gray-900 mb-2">Текущий tier</p>
                <div className="text-sm text-gray-700 space-y-1">
                  <div><span className="text-gray-500">tier:</span> {entitlements.tier}</div>
                  <div><span className="text-gray-500">effective:</span> {effectiveTier}</div>
                  <div><span className="text-gray-500">override:</span> {entitlements.tier_override ?? "—"}</div>
                  <div><span className="text-gray-500">override_ends_at:</span> {entitlements.override_ends_at ?? "—"}</div>
                  <div><span className="text-gray-500">bonus_universities:</span> {entitlements.bonus_universities}</div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-2xl p-4">
                <p className="text-sm font-semibold text-gray-900 mb-3">Редактирование</p>
                <div className="grid gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">bonus_universities</p>
                    <Input value={bonusUniversities} onChange={(e) => setBonusUniversities(e.target.value)} className="h-11" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">tier_override (например: pro, pro_plus)</p>
                    <Input value={tierOverride} onChange={(e) => setTierOverride(e.target.value)} className="h-11" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">override_ends_at</p>
                    <Input type="datetime-local" value={overrideEndsAt} onChange={(e) => setOverrideEndsAt(e.target.value)} className="h-11" />
                  </div>
                  <div className="flex gap-3">
                    <Button onClick={saveEntitlements} disabled={saving} className="bg-blue-600 hover:bg-blue-700 h-11">
                      {saving ? "Сохраняем..." : "Сохранить"}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-11"
                      onClick={() => {
                        setBonusUniversities(String(entitlements.bonus_universities ?? 0));
                        setTierOverride(entitlements.tier_override ?? "");
                        setOverrideEndsAt(entitlements.override_ends_at ? entitlements.override_ends_at.slice(0, 16) : "");
                        setInfo("");
                        setError("");
                      }}
                    >
                      Отменить
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

