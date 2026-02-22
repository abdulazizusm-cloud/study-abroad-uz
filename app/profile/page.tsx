"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { WizardFormData } from "@/lib/wizard-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, DollarSign, FileText, Globe, GraduationCap, Crown, User, Heart, ClipboardList, LogOut } from "lucide-react";
import { UpgradePlanModal, UpgradePlanType } from "@/components/upgrade-plan-modal";
import { supabase } from "@/lib/supabase-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Navbar } from "@/components/navbar";

type ProfileData = {
  first_name: string;
  last_name: string;
  phone: string;
};

type UniversityMini = {
  id: string;
  name: string;
  country: string;
  city: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, getProfile, upsertProfile, loadWizardProfile, trackEvent, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [wizardData, setWizardData] = useState<WizardFormData | null>(null);
  const [loadError, setLoadError] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradePlanType, setUpgradePlanType] = useState<UpgradePlanType>("pro");
  const [expandedPlanKey, setExpandedPlanKey] = useState<string | null>(null);

  const formatPhone = (value: string) => {
    if (!value) return "не указано";
    const digits = value.replace(/\D/g, "");
    if (digits.startsWith("998") && digits.length >= 12) {
      const code = digits.slice(3, 5);
      const part1 = digits.slice(5, 8);
      const part2 = digits.slice(8, 10);
      const part3 = digits.slice(10, 12);
      return `+998 (${code}) ${part1}-${part2}-${part3}`;
    }
    return value;
  };

  const PROGRAM_GOAL_LABELS: Record<string, string> = {
    Bachelor: "Бакалавриат",
    Master: "Магистратура",
    MBA: "MBA / Бизнес-школа",
    PhD: "Аспирантура (PhD)",
    Language: "Языковые курсы",
    Foundation: "Foundation / Pathway",
  };

  const FACULTY_LABELS: Record<string, string> = {
    "Finance": "Финансы",
    "Accounting": "Бухгалтерский учёт",
    "Economics": "Экономика",
    "Banking": "Банковское дело",
    "Investment / Asset Management": "Инвестиции / Управление активами",
    "FinTech": "Финтех",
    "Risk Management": "Управление рисками",
    "Quantitative Finance": "Квантитативные финансы",
    "Master in Finance / MSc Finance": "Master in Finance / MSc Finance",
  };

  const FINANCE_SOURCE_LABELS: Record<string, string> = {
    Self: "Самостоятельно (личные средства)",
    Parents: "Родители / семья",
    Employer: "Работодатель",
    Government: "Государственная поддержка",
    Scholarship: "Фонды",
    Sponsor: "Спонсор (частное лицо / организация)",
    Loan: "Кредит / образовательный заём",
  };

  const renderValue = (value?: string) => (value && value.trim() ? value : "не указано");
  const [isLoading, setIsLoading] = useState(true);
  const [favoriteUniversities, setFavoriteUniversities] = useState<UniversityMini[]>([]);
  const [plannedUniversities, setPlannedUniversities] = useState<UniversityMini[]>([]);

  const getErrorMessage = (err: unknown) => {
    if (err instanceof Error) return err.message || String(err);
    if (typeof err === "string") return err;
    if (err && typeof err === "object") {
      const anyErr = err as any;
      if (typeof anyErr.message === "string") return anyErr.message;
      if (typeof anyErr.details === "string") return anyErr.details;
      if (typeof anyErr.hint === "string") return anyErr.hint;
      if (typeof anyErr.code === "string") return anyErr.code;
      try {
        const json = JSON.stringify(err);
        if (json && json !== "{}") return json;
      } catch {
        // ignore
      }
    }
    return String(err);
  };

  useEffect(() => {
    const loadProfileData = async () => {
      if (authLoading) return;
      if (!user) {
        router.push("/");
        return;
      }
      try {
        setLoadError("");
        const data = await getProfile();
        setProfile(data);
        try {
          const { data: adminRows, error: adminErr } = await supabase
            .from("profiles")
            .select("is_admin")
            .eq("user_id", user.id)
            .limit(1);
          if (!adminErr) setIsAdmin(!!adminRows?.[0]?.is_admin);
        } catch {
          setIsAdmin(false);
        }
        setEditForm({
          firstName: data?.first_name ?? "",
          lastName: data?.last_name ?? "",
          phone: data?.phone ?? "",
        });
        const savedWizard = await loadWizardProfile();
        setWizardData(savedWizard);

        const [{ data: fav }, { data: plan }] = await Promise.all([
          supabase
            .from("saved_universities")
            .select("university_id, universities ( id, name, country, city )")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
            .limit(12),
          supabase
            .from("admission_applications")
            .select("university_id, universities ( id, name, country, city )")
            .eq("user_id", user.id)
            .order("updated_at", { ascending: false })
            .limit(12),
        ]);

        setFavoriteUniversities(
          ((fav as any[]) ?? [])
            .map((r) => r.universities)
            .filter(Boolean)
        );
        setPlannedUniversities(
          ((plan as any[]) ?? [])
            .map((r) => r.universities)
            .filter(Boolean)
        );
      } catch (e: any) {
        const msg = getErrorMessage(e) || "Не удалось загрузить профиль (проверьте Supabase/RLS).";
        setLoadError(msg);
        // Keep page usable even if some data failed to load.
        console.error("Profile load error:", msg, e);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfileData();
  }, [authLoading, user, getProfile, loadWizardProfile, router]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="w-full max-w-5xl px-4">
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 animate-pulse">
            <div className="h-6 w-40 bg-gray-200 rounded mb-6" />
            <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
              <div className="space-y-4">
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-11 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-11 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-11 bg-gray-200 rounded" />
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-11 bg-gray-200 rounded" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="h-40 bg-gray-200 rounded-2xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-20 sm:pt-24 md:pt-28 pb-6 sm:pb-8">

        <Tabs defaultValue="profile" className="w-full">
            <div className="grid gap-4 sm:gap-6 lg:grid-cols-[280px_1fr] items-start">
              <div className="lg:sticky lg:top-6">
                <div className="rounded-xl sm:rounded-2xl bg-white/70 backdrop-blur-md shadow-sm overflow-hidden divide-y divide-gray-200/60">
                  <div className="p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <UserAvatar
                        firstName={profile?.first_name}
                        lastName={profile?.last_name}
                        email={user.email}
                        size="md"
                        className="shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                          {[profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || "Пользователь"}
                        </div>
                        <div className="text-xs text-gray-600 truncate">{user.email}</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-1.5 sm:p-2">
                    <TabsList className="flex lg:flex-col h-auto w-full p-1 bg-transparent gap-1 overflow-x-auto lg:overflow-visible justify-start">
                      <TabsTrigger
                        value="profile"
                        className="justify-start px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl w-full gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 hover:bg-white/70 data-[state=active]:bg-blue-50/80 data-[state=active]:shadow-none data-[state=active]:text-blue-700 whitespace-nowrap"
                      >
                        <User className="w-3 h-3 sm:w-4 sm:h-4" />
                        Личные данные
                      </TabsTrigger>
                      <TabsTrigger
                        value="plan"
                        className="justify-start px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl w-full gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 hover:bg-white/70 data-[state=active]:bg-blue-50/80 data-[state=active]:shadow-none data-[state=active]:text-blue-700 whitespace-nowrap"
                      >
                        <Crown className="w-3 h-3 sm:w-4 sm:h-4" />
                        Мой план
                      </TabsTrigger>
                      <TabsTrigger
                        value="questionnaire"
                        className="justify-start px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl w-full gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 hover:bg-white/70 data-[state=active]:bg-blue-50/80 data-[state=active]:shadow-none data-[state=active]:text-blue-700 whitespace-nowrap"
                      >
                        <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                        Анкета
                      </TabsTrigger>
                      <TabsTrigger
                        value="favorites"
                        className="justify-start px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl w-full gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 hover:bg-white/70 data-[state=active]:bg-blue-50/80 data-[state=active]:shadow-none data-[state=active]:text-blue-700 whitespace-nowrap"
                      >
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4" />
                        Избранные
                      </TabsTrigger>
                      <TabsTrigger
                        value="planned"
                        className="justify-start px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl w-full gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-700 hover:bg-white/70 data-[state=active]:bg-blue-50/80 data-[state=active]:shadow-none data-[state=active]:text-blue-700 whitespace-nowrap"
                      >
                        <ClipboardList className="w-3 h-3 sm:w-4 sm:h-4" />
                        В плане
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-1.5 sm:p-2 border-t border-gray-200/60">
                    <Button
                      variant="ghost"
                      onClick={async () => {
                        await signOut();
                        router.push("/");
                      }}
                      className="w-full justify-start gap-1.5 sm:gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl"
                    >
                      <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                      Выйти из аккаунта
                    </Button>
                  </div>
                </div>
              </div>

              <div className="min-w-0">
                {loadError && (
                  <div className="mb-4 rounded-2xl bg-amber-50 text-amber-900 shadow-sm p-4">
                    <div className="font-semibold">Не удалось загрузить часть данных</div>
                    <div className="text-sm mt-1">{loadError}</div>
                  </div>
                )}
                <TabsContent value="plan" className="m-0">
                  <div className="space-y-8 bg-gray-50/50 rounded-2xl p-6 sm:p-8">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Мой план</h2>
                      <p className="text-sm text-gray-500 mt-1.5">
                        Текущий доступ, лимиты и управление подпиской.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 sm:gap-6">
                      {[
                        { key: "free", title: "Бесплатно", subtitle: "Проверка шансов", price: "0 сум", priceNote: "", recommended: false, bullets: ["До 3 вузов", "Базовый расчёт шанса", "Уровень High / Medium / Low"] },
                        { key: "pro", title: "PRO", subtitle: "Расширенный анализ поступления", price: "59 000 сум", priceNote: "/ месяц", recommended: true, bullets: ["Без лимита вузов", "Расчёт с учётом конкуренции", "Разбор сильных и слабых сторон", "Рекомендации по улучшению"] },
                        { key: "profile_review", title: "Разбор профиля", subtitle: "Персональный план поступления", price: "299 000 сум", priceNote: "разовая оплата", recommended: false, bullets: ["Консультация 30–40 мин", "Список 5–10 вузов", "Стратегия подачи документов", "Рекомендации по профилю"] },
                        { key: "mentorship", title: "Менторство (1 университет)", subtitle: "Полное сопровождение до оффера", price: "1 500 000 сум", priceNote: "разовая оплата", recommended: false, bullets: ["Один вуз под ключ", "SOP и пакет документов", "Подача и дедлайны", "Поддержка до оффера", "Персональный куратор"] },
                      ].map((p) => {
                        const planType = p.key === "pro" ? "pro" : p.key === "profile_review" ? "profile_review" : p.key === "mentorship" ? "mentorship" : null;
                        const isPro = p.key === "pro";
                        const isExpanded = expandedPlanKey === p.key;
                        return (
                          <div key={p.key} className={`rounded-2xl bg-white border border-gray-200 shadow-sm transition-all overflow-hidden ${isPro && isExpanded ? "shadow-md ring-2 ring-blue-500/20" : ""}`}>
                            <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                              <div className="min-w-0">
                                {p.recommended && <span className="inline-flex text-xs font-medium text-white bg-blue-600 px-2 py-0.5 rounded-full mb-2">Рекомендуемый</span>}
                                <h3 className="text-lg font-bold text-gray-900">{p.title}</h3>
                              </div>
                              <Button type="button" variant="outline" size="sm" className="rounded-xl border-gray-300 text-gray-700 shrink-0 w-full sm:w-auto" onClick={() => setExpandedPlanKey(isExpanded ? null : p.key)}>
                                {isExpanded ? "Свернуть" : "Подробнее"}
                              </Button>
                            </div>
                            {isExpanded && (
                              <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0 border-t border-gray-100 animate-in slide-in-from-top-2 duration-200">
                                <p className="text-sm text-gray-500 mt-3 mb-4">{p.subtitle}</p>
                                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                                  {p.bullets.map((b) => (
                                    <li key={b} className="flex gap-2.5">
                                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                                      <span>{b}</span>
                                    </li>
                                  ))}
                                </ul>
                                <div className="flex flex-col gap-3">
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-xl font-bold text-gray-900">{p.price}</span>
                                    {p.priceNote && <span className="text-sm text-gray-500">{p.priceNote}</span>}
                                  </div>
                                  {planType && (
                                    <Button type="button" className={`w-full rounded-xl h-10 text-sm font-semibold transition-colors ${isPro ? "bg-blue-600 hover:bg-blue-700 text-white" : "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"}`} onClick={() => { setUpgradePlanType(planType); setUpgradeModalOpen(true); }}>
                                      Оформить подписку
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="profile" className="m-0">
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Личные данные</h2>
                      <p className="text-sm text-gray-600 mt-2">
                        Редактируйте имя, фамилию и номер телефона.
                      </p>
                    </div>

                    <div className={`rounded-2xl bg-white shadow-sm p-6 transition-colors ${isEditing ? "bg-gray-50" : ""}`}>
                      <div className="grid gap-4">
                          <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">Имя</p>
                          {isEditing ? (
                            <Input
                              value={editForm.firstName}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, firstName: e.target.value }))}
                              placeholder="Введите имя"
                              className="h-11 bg-white"
                            />
                          ) : (
                            <div className="h-11 flex items-center px-3 rounded-md border border-gray-200 bg-gray-50 text-gray-900">
                              {renderValue(profile?.first_name)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">Фамилия</p>
                          {isEditing ? (
                            <Input
                              value={editForm.lastName}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, lastName: e.target.value }))}
                              placeholder="Введите фамилию"
                              className="h-11 bg-white"
                            />
                          ) : (
                            <div className="h-11 flex items-center px-3 rounded-md border border-gray-200 bg-gray-50 text-gray-900">
                              {renderValue(profile?.last_name)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">Телефон</p>
                          {isEditing ? (
                            <Input
                              value={editForm.phone}
                              onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                              placeholder="+998 90 123 45 67"
                              className="h-11 bg-white"
                            />
                          ) : (
                            <div className="h-11 flex items-center px-3 rounded-md border border-gray-200 bg-gray-50 text-gray-900">
                              {formatPhone(profile?.phone ?? "")}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 mb-2">Email</p>
                          <div className="h-11 flex items-center px-3 rounded-md border border-gray-200 bg-gray-100 text-gray-600">
                            {renderValue(user.email || "")}
                          </div>
                        </div>
                        {saveError && <p className="text-sm text-red-600 mt-2">{saveError}</p>}
                        <div className="flex gap-3 pt-2">
                        {isEditing ? (
                          <>
                            <Button
                              onClick={async () => {
                                if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.phone.trim()) {
                                  setSaveError("Заполните имя, фамилию и телефон.");
                                  return;
                                }
                                setSaveError("");
                                setSaving(true);
                                try {
                                  await upsertProfile({
                                    firstName: editForm.firstName.trim(),
                                    lastName: editForm.lastName.trim(),
                                    phone: editForm.phone.trim(),
                                  });
                                  setProfile({
                                    first_name: editForm.firstName.trim(),
                                    last_name: editForm.lastName.trim(),
                                    phone: editForm.phone.trim(),
                                  });
                                  setIsEditing(false);
                                } finally {
                                  setSaving(false);
                                }
                              }}
                              className="bg-blue-600 hover:bg-blue-700 h-10"
                              disabled={saving}
                            >
                              {saving ? "Сохраняем..." : "Сохранить"}
                            </Button>
                            <Button
                              variant="outline"
                              className="h-10"
                              onClick={() => {
                                setEditForm({
                                  firstName: profile?.first_name ?? "",
                                  lastName: profile?.last_name ?? "",
                                  phone: profile?.phone ?? "",
                                });
                                setSaveError("");
                                setIsEditing(false);
                              }}
                            >
                              Отменить
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            className="h-10"
                            onClick={() => {
                              setEditForm({
                                firstName: profile?.first_name ?? "",
                                lastName: profile?.last_name ?? "",
                                phone: profile?.phone ?? "",
                              });
                              setSaveError("");
                              setIsEditing(true);
                            }}
                          >
                            Редактировать
                          </Button>
                        )}
                      </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="favorites" className="m-0">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Избранные</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Университеты, которые вы лайкнули.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white shadow-sm p-4">
                      {favoriteUniversities.length === 0 ? (
                        <div className="text-sm text-gray-600">Пока пусто</div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {favoriteUniversities.map((u) => (
                            <div key={u.id} className="py-3">
                              <div className="font-medium text-gray-900">{u.name}</div>
                              <div className="text-sm text-gray-600">{u.city}, {u.country}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="planned" className="m-0">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">В плане</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Университеты, которые вы добавили в план.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white shadow-sm p-4">
                      {plannedUniversities.length === 0 ? (
                        <div className="text-sm text-gray-600">Пока пусто</div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {plannedUniversities.map((u) => (
                            <div key={u.id} className="py-3">
                              <div className="font-medium text-gray-900">{u.name}</div>
                              <div className="text-sm text-gray-600">{u.city}, {u.country}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="questionnaire" className="m-0">
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Анкета</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        Сводка ваших ответов из анкеты.
                      </p>
                    </div>

                    {wizardData ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          {
                            title: "Академический профиль",
                            icon: GraduationCap,
                            rows: [
                              { label: "Уровень", value: PROGRAM_GOAL_LABELS[wizardData?.programGoal || ""] || renderValue(wizardData?.programGoal) },
                              { label: "Средний балл", value: wizardData?.gradingAverage ? `${wizardData.gradingAverage}${wizardData.gradingScheme === "Percentage" ? "%" : ""}` : "не указано" },
                              { label: "Система", value: renderValue(wizardData?.gradingScheme) },
                              { label: "Гражданство", value: renderValue(wizardData?.nationality) },
                            ],
                          },
                          {
                            title: "Результаты тестов",
                            icon: FileText,
                            rows: [
                              { label: "Английский", value: wizardData?.englishExamType && wizardData.englishExamType !== "None" ? `${wizardData.englishExamType}: ${wizardData.englishScore || "не указано"}` : "не указано" },
                              { label: "GRE/GMAT", value: wizardData?.standardizedExamType && wizardData.standardizedExamType !== "None" ? `${wizardData.standardizedExamType}: ${wizardData.standardizedExamType === "GRE" ? `V:${wizardData.greVerbal || "—"} Q:${wizardData.greQuant || "—"} W:${wizardData.greWriting || "—"}` : wizardData.gmatTotal || "—"}` : "не указано" },
                              { label: "Тест", value: wizardData?.standardizedExamType && wizardData.standardizedExamType !== "None" ? "указан" : "не указан" },
                            ],
                          },
                          {
                            title: "Финансы",
                            icon: DollarSign,
                            rows: [
                              { label: "Источник", value: FINANCE_SOURCE_LABELS[wizardData?.financeSource || ""] || renderValue(wizardData?.financeSource) },
                              { label: "Бюджет", value: renderValue(wizardData?.budget) },
                              { label: "Страна", value: renderValue(wizardData?.countryOfStudy) },
                            ],
                          },
                          {
                            title: "Предпочтения",
                            icon: Globe,
                            rows: [
                              { label: "Страна обучения", value: renderValue(wizardData?.countryOfStudy) },
                              { label: "Направления", value: wizardData?.faculty?.length ? wizardData.faculty.map((f) => FACULTY_LABELS[f] || f).join(", ") : "не указано" },
                              { label: "Цель", value: PROGRAM_GOAL_LABELS[wizardData?.programGoal || ""] || renderValue(wizardData?.programGoal) },
                              { label: "Стипендия", value: wizardData?.scholarship === "Yes" ? "Да" : wizardData?.scholarship === "No" ? "Нет" : "не указано" },
                            ],
                          },
                        ].map((card) => {
                          const Icon = card.icon;
                          return (
                            <div key={card.title} className="h-full rounded-2xl bg-white shadow-sm p-4 flex flex-col gap-3">
                              <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                                  <Icon className="w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900">{card.title}</h3>
                              </div>
                              <div className="space-y-1 text-xs text-gray-700">
                                {card.rows.slice(0, 5).map((row) => (
                                  <div key={row.label} className="flex items-start justify-between gap-2">
                                    <span className="text-gray-500">{row.label}</span>
                                    <span className="text-gray-900 text-right">{row.value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-gray-50 p-6 text-center text-gray-600">
                        Сохранённая анкета не найдена
                        <div className="mt-4">
                          <Button onClick={() => router.push("/wizard")}>Заполнить анкету</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>

        <UpgradePlanModal
          open={upgradeModalOpen}
          onOpenChange={setUpgradeModalOpen}
          planType={upgradePlanType}
          onSelectPlan={async (plan) => {
            if (!user) return;
            trackEvent("upgrade_plan_selected", { plan, mode: "dev_stub" });
            const { data } = await supabase.auth.getSession();
            const token = data.session?.access_token;
            if (!token) return;
            await fetch("/api/dev/upgrade-tier", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ tier_override: plan }),
            });
            trackEvent("dev_tier_override_applied", { plan });
            setUpgradeModalOpen(false);
          }}
        />
      </div>
    </div>
  );
}
