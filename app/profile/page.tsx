"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { WizardFormData } from "@/lib/wizard-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, DollarSign, FileText, Globe, GraduationCap, Crown, User } from "lucide-react";
import { UpgradePlanModal } from "@/components/upgrade-plan-modal";
import { supabase } from "@/lib/supabase-client";

type ProfileData = {
  first_name: string;
  last_name: string;
  phone: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, getProfile, upsertProfile, loadWizardProfile, getTierInfo, trackEvent } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [wizardData, setWizardData] = useState<WizardFormData | null>(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [planInfo, setPlanInfo] = useState<{
    tier: string;
    effectiveTier: string;
    bonusUniversities: number;
    tierOverride?: string | null;
    overrideEndsAt?: string | null;
    proTrialEndsAt?: string | null;
  } | null>(null);

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

  useEffect(() => {
    const loadProfileData = async () => {
      if (authLoading) return;
      if (!user) {
        router.push("/");
        return;
      }
      try {
        const data = await getProfile();
        setProfile(data);
        setEditForm({
          firstName: data?.first_name ?? "",
          lastName: data?.last_name ?? "",
          phone: data?.phone ?? "",
        });
        const savedWizard = await loadWizardProfile();
        setWizardData(savedWizard);
        const tier = await getTierInfo();
        setPlanInfo(tier);
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
          <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8 animate-pulse">
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
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/wizard-results")} className="hover:bg-blue-100">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к результатам
          </Button>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Профиль</h1>
              <p className="text-sm text-gray-600">Ваши данные и сохранённая анкета</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr] items-start">
            <div className={`p-4 transition-colors ${isEditing ? "bg-gray-100 rounded-xl" : ""}`}>
              <div className="grid gap-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Имя</p>
                  {isEditing ? (
                    <Input
                      value={editForm.firstName}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, firstName: e.target.value }))}
                      placeholder="Введите имя"
                      className="h-11 bg-white"
                    />
                  ) : (
                    <div className="h-11 flex items-center px-3 rounded-md border border-gray-200 bg-white text-gray-900">
                      {renderValue(profile?.first_name)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Фамилия</p>
                  {isEditing ? (
                    <Input
                      value={editForm.lastName}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Введите фамилию"
                      className="h-11 bg-white"
                    />
                  ) : (
                    <div className="h-11 flex items-center px-3 rounded-md border border-gray-200 bg-white text-gray-900">
                      {renderValue(profile?.last_name)}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Телефон</p>
                  {isEditing ? (
                    <Input
                      value={editForm.phone}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                      placeholder="+998 90 123 45 67"
                      className="h-11 bg-white"
                    />
                  ) : (
                    <div className="h-11 flex items-center px-3 rounded-md border border-gray-200 bg-white text-gray-900">
                      {formatPhone(profile?.phone ?? "")}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <div className="h-11 flex items-center px-3 rounded-md border border-gray-200 bg-gray-100 text-gray-600">
                    {renderValue(user.email || "")}
                  </div>
                </div>
                {saveError && <p className="text-sm text-red-600">{saveError}</p>}
                <div className="flex gap-3">
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

            <div>
              {planInfo && (
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-4 mb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                        <Crown className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Мой план</div>
                        <div className="text-lg font-bold text-gray-900">
                          {planInfo.effectiveTier === "free"
                            ? "Free"
                            : planInfo.effectiveTier === "pro_lite"
                              ? "Pro Lite"
                              : planInfo.effectiveTier === "pro"
                                ? "Pro"
                                : "Pro+"}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                          <div>
                            <span className="text-gray-500">Бонусные универы:</span>{" "}
                            <span className="font-medium text-gray-900">{planInfo.bonusUniversities ?? 0}</span>
                          </div>
                          {planInfo.proTrialEndsAt && (
                            <div>
                              <span className="text-gray-500">Trial до:</span>{" "}
                              <span className="font-medium text-gray-900">
                                {new Date(planInfo.proTrialEndsAt).toLocaleDateString("ru-RU")}
                              </span>
                            </div>
                          )}
                          {planInfo.tierOverride && (
                            <div>
                              <span className="text-gray-500">Override:</span>{" "}
                              <span className="font-medium text-gray-900">{planInfo.tierOverride}</span>
                              {planInfo.overrideEndsAt && (
                                <span className="text-gray-500">
                                  {" "}до {new Date(planInfo.overrideEndsAt).toLocaleDateString("ru-RU")}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        className="bg-blue-600 hover:bg-blue-700 h-10"
                        onClick={() => {
                          trackEvent("upgrade_modal_opened", { from: "profile_my_plan" });
                          setUpgradeModalOpen(true);
                        }}
                      >
                        Улучшить план
                      </Button>
                      <Button
                        variant="outline"
                        className="h-10 opacity-60 cursor-not-allowed"
                        disabled
                        title="Будет доступно после подключения Stripe portal"
                      >
                        Управлять подпиской
                      </Button>
                    </div>
                  </div>
                </div>
              )}

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
                    ],
                  },
                ].map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.title} className="h-full rounded-2xl border border-gray-200 bg-white shadow-sm p-4 flex flex-col gap-3">
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
              {!wizardData && (
                <div className="mt-4 border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center text-gray-600">
                  Сохранённая анкета не найдена
                  <div className="mt-4">
                    <Button onClick={() => router.push("/wizard")}>Заполнить анкету</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <UpgradePlanModal
          open={upgradeModalOpen}
          onOpenChange={setUpgradeModalOpen}
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
            const tier = await getTierInfo();
            setPlanInfo(tier);
          }}
        />
      </div>
    </div>
  );
}
