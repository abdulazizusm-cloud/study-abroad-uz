"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { WizardFormData, ExtendedUniversity, WizardScoringResult, ScoringAlgorithm } from "@/lib/wizard-types";
import {
  scoreAllUniversities,
  sortResultsByChance,
  sortResultsByBudget,
} from "@/lib/wizard-scoring";
import { WizardResultCard } from "@/components/wizard-result-card";
import { AuthModal } from "@/components/auth-modal";
import { ProfileCompletionModal } from "@/components/profile-completion-modal";
import { UpgradePlanModal, UpgradePlanType } from "@/components/upgrade-plan-modal";
import { Button } from "@/components/ui/button";
import { SortAsc, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { calculateSimpleChance } from "@/lib/wizard-scoring-simple";
import { supabase } from "@/lib/supabase-client";
import { Navbar } from "@/components/navbar";

type SortOption = "chance" | "budget";

// Helper function to calculate tier limit
// anonymous (isLoggedIn=false): 3 unis
// registered free or pro (isLoggedIn=true): 9 unis (pro differs only in algorithm)
function calculateTierLimit(tierInfo: { effectiveTier: string; bonusUniversities: number }, isLoggedIn: boolean): number {
  const base = isLoggedIn ? 9 : 3;
  return base + (tierInfo.bonusUniversities || 0);
}

// Helper function to select algorithm based on tier
function selectAlgorithm(tierInfo: { effectiveTier: string }): ScoringAlgorithm {
  return tierInfo.effectiveTier === "pro"
    ? "pro"
    : "simple";
}

export default function WizardResultsPage() {
  const router = useRouter();
  const { user, loading: authLoading, loadWizardProfile, saveWizardProfile, getProfile, upsertProfile, getTierInfo, trackEvent } = useAuth();
  const [formData, setFormData] = useState<WizardFormData | null>(null);
  const [results, setResults] = useState<WizardScoringResult[]>([]);
  const [limitedPool, setLimitedPool] = useState<WizardScoringResult[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("chance");
  const [isLoading, setIsLoading] = useState(true);
  const [algorithm, setAlgorithm] = useState<ScoringAlgorithm>("simple");
  const [effectiveTier, setEffectiveTier] = useState<"free" | "pro">("free");
  const [bonusUniversities, setBonusUniversities] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradePlanType, setUpgradePlanType] = useState<UpgradePlanType>("pro");
  const [universities, setUniversities] = useState<ExtendedUniversity[]>([]);
  const lastSavedRef = useRef<string>("");
  const hasTrackedViewRef = useRef(false);
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [currentLimit, setCurrentLimit] = useState<number | null>(null);
  const [savedUniversityIds, setSavedUniversityIds] = useState<Set<string>>(new Set());
  const [plannedUniversityIds, setPlannedUniversityIds] = useState<Set<string>>(new Set());
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileInitial, setProfileInitial] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });

  const getErrorMessage = (err: unknown) => {
    if (err instanceof Error) return err.message || String(err);
    if (typeof err === "string") return err;
    if (err && typeof err === "object") {
      const anyErr = err as any;
      if (typeof anyErr.message === "string") return anyErr.message;
      if (typeof anyErr.error_description === "string") return anyErr.error_description;
      if (typeof anyErr.details === "string") return anyErr.details;
      try {
        const json = JSON.stringify(err);
        if (json && json !== "{}") return json;
      } catch {
        // ignore
      }
    }
    return String(err);
  };

  const formatUniversityCountRu = (n: number) => {
    const abs = Math.abs(n);
    const mod100 = abs % 100;
    const mod10 = abs % 10;
    if (mod100 >= 11 && mod100 <= 14) return "университетов";
    if (mod10 === 1) return "университет";
    if (mod10 >= 2 && mod10 <= 4) return "университета";
    return "университетов";
  };

  const deriveNamesFromMetadata = (metadata: Record<string, any>) => {
    const fullName = metadata?.full_name || metadata?.name;
    if (fullName && typeof fullName === "string") {
      const parts = fullName.trim().split(" ");
      return {
        firstName: parts[0] ?? "",
        lastName: parts.slice(1).join(" "),
      };
    }
    return {
      firstName: metadata?.first_name || "",
      lastName: metadata?.last_name || "",
    };
  };

  useEffect(() => {
    const loadResults = async () => {
      if (authLoading) return;

      // Load form data from localStorage or Supabase
      const savedData = localStorage.getItem("wizardFormData");
      let parsedData: WizardFormData | null = null;

      try {
        if (savedData) {
          parsedData = JSON.parse(savedData);
        } else if (user) {
          parsedData = await loadWizardProfile();
          if (parsedData) {
            localStorage.setItem("wizardFormData", JSON.stringify(parsedData));
          }
        }

        if (!parsedData) {
          // No data available, redirect to wizard
          router.push("/wizard");
          return;
        }

        setFormData(parsedData);

        // Fetch universities from Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        const response = await fetch(
          `${supabaseUrl}/rest/v1/universities?select=*`,
          {
            headers: {
              apikey: supabaseKey!,
              Authorization: `Bearer ${supabaseKey}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch universities");
        }

        const data = await response.json();

        // Transform Supabase data to ExtendedUniversity format
        const universitiesData: ExtendedUniversity[] = data.map((uni: any) => ({
          id: uni.id,
          name: uni.name,
          country: uni.country,
          city: uni.city,
          level: uni.level,
          disciplines: uni.disciplines,
          qsRanking: uni.qs_ranking,
          requirements: {
            minGPA: uni.min_gpa !== null ? parseFloat(uni.min_gpa) : null,
            acceptsGradingSchemes: uni.accepts_grading_schemes,
            englishRequired: uni.english_required,
            acceptedEnglishTests: uni.accepted_english_tests || [],
            minIELTS: uni.min_ielts ? parseFloat(uni.min_ielts) : undefined,
            minTOEFL: uni.min_toefl || undefined,
            minDuolingo: uni.min_duolingo || undefined,
            greRequired: uni.gre_required || false,
            minGREVerbal: uni.min_gre_verbal || undefined,
            minGREQuant: uni.min_gre_quant || undefined,
            minGREWriting: uni.min_gre_writing ? parseFloat(uni.min_gre_writing) : undefined,
            gmatRequired: uni.gmat_required || false,
            minGMAT: uni.min_gmat || undefined,
            satRequired: uni.sat_required || false,
            minSAT: uni.min_sat || undefined,
            tuitionUSD: uni.tuition_usd,
            scholarshipAvailable: uni.scholarship_available || false,
          },
        }));

        setUniversities(universitiesData);

        const tierInfo = await getTierInfo();
        setEffectiveTier(tierInfo.effectiveTier);
        setBonusUniversities(tierInfo.bonusUniversities);

        // Determine algorithm based on tier
        const selectedAlgorithm = selectAlgorithm(tierInfo);
        setAlgorithm(selectedAlgorithm);

        // Calculate scores for all universities
        const scoredResults = scoreAllUniversities(parsedData, universitiesData, selectedAlgorithm);

        // Always cut the pool by chance first, then apply current sort within pool
        const byChance = sortResultsByChance(scoredResults);
        const limit = calculateTierLimit(tierInfo, !!user);
        setTotalAvailable(byChance.length);
        setCurrentLimit(limit);
        const pool = byChance.slice(0, limit);
        setLimitedPool(pool);
        const displayed = sortBy === "budget" ? sortResultsByBudget([...pool]) : [...pool];
        setResults(displayed);
        setIsLoading(false);

        if (user && !hasTrackedViewRef.current) {
          hasTrackedViewRef.current = true;
          trackEvent("results_viewed", {
            effectiveTier: tierInfo.effectiveTier,
            limit,
            algorithm: selectedAlgorithm,
          });
        }
      } catch (error) {
        console.error("Error loading results:", error);
        router.push("/");
      }
    };

    loadResults();
  }, [router, user, authLoading, loadWizardProfile]);

  useEffect(() => {
    if (!authLoading && user && formData) {
      const payload = JSON.stringify(formData);
      if (payload !== lastSavedRef.current) {
        lastSavedRef.current = payload;
        saveWizardProfile(formData).catch((error) => {
          console.error("Error saving wizard profile:", getErrorMessage(error), error);
        });
      }
    }
  }, [user, formData, authLoading, saveWizardProfile]);

  useEffect(() => {
    const ensureProfile = async () => {
      if (authLoading || !user) return;
      try {
        const profile = await getProfile();
        const missing = !profile || !profile.first_name || !profile.last_name || !profile.phone;
        if (missing) {
          const metadata = (user.user_metadata ?? {}) as Record<string, any>;
          const derived = deriveNamesFromMetadata(metadata);
          setProfileInitial({
            firstName: profile?.first_name ?? derived.firstName,
            lastName: profile?.last_name ?? derived.lastName,
            phone: profile?.phone ?? (metadata.phone || ""),
          });
          setProfileModalOpen(true);
        }
      } catch (error) {
        console.error("Error loading profile:", getErrorMessage(error), error);
      }
    };

    ensureProfile();
  }, [user, authLoading, getProfile]);

  useEffect(() => {
    const loadUserLists = async () => {
      if (authLoading || !user) {
        setSavedUniversityIds(new Set());
        setPlannedUniversityIds(new Set());
        return;
      }
      try {
        const [{ data: saved }, { data: planned }] = await Promise.all([
          supabase
            .from("saved_universities")
            .select("university_id")
            .eq("user_id", user.id),
          supabase
            .from("admission_applications")
            .select("university_id")
            .eq("user_id", user.id),
        ]);
        setSavedUniversityIds(new Set((saved ?? []).map((r: any) => r.university_id)));
        setPlannedUniversityIds(new Set((planned ?? []).map((r: any) => r.university_id)));
      } catch (e) {
        console.error("Error loading saved/planned universities:", e);
      }
    };
    loadUserLists();
  }, [user, authLoading]);

  // Recalculate when user auth state changes
  useEffect(() => {
    if (formData && universities.length > 0 && !authLoading) {
      const recalc = async () => {
        try {
          const tierInfo = await getTierInfo();
          setEffectiveTier(tierInfo.effectiveTier);
          setBonusUniversities(tierInfo.bonusUniversities);

          const selectedAlgorithm = selectAlgorithm(tierInfo);
          setAlgorithm(selectedAlgorithm);

          const scoredResults = scoreAllUniversities(formData, universities, selectedAlgorithm);

          // Cut pool by chance first, then apply current sort within pool
          const byChance = sortResultsByChance(scoredResults);
          const limit = calculateTierLimit(tierInfo, !!user);
          setTotalAvailable(byChance.length);
          setCurrentLimit(limit);
          const pool = byChance.slice(0, limit);
          setLimitedPool(pool);
          const displayed = sortBy === "budget" ? sortResultsByBudget([...pool]) : [...pool];
          setResults(displayed);
        } catch (error) {
          // Prevent unhandled promise rejections / runtime overlay.
          console.error("Error recalculating results:", getErrorMessage(error), error);
        }
      };
      recalc().catch((error) => {
        console.error("Error recalculating results (unhandled):", getErrorMessage(error), error);
      });
    }
  // sortBy is intentionally excluded: sorting is handled locally in handleSortChange
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, formData, universities, getTierInfo, effectiveTier]);

  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
    // Sort within the already-limited pool, not all universities
    if (limitedPool.length > 0) {
      const sorted = option === "chance"
        ? sortResultsByChance([...limitedPool])
        : sortResultsByBudget([...limitedPool]);
      setResults(sorted);
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  if (isLoading || !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen pt-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Подбираем университеты...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-20 sm:pt-24 pb-6 sm:pb-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Ваши шансы поступления
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">
            Найдено {results.length} подходящих университетов
            {effectiveTier === "pro" && (
              <span className="ml-2 text-blue-600 font-medium">· Pro-расчёт активен</span>
            )}
          </p>
        </div>

        {/* Sorting Controls */}
        <div className="mb-6 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 sm:items-center">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700">
            <SortAsc className="w-4 h-4" />
            <span className="font-medium">Сортировать:</span>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Button
              variant={sortBy === "chance" ? "default" : "outline"}
              onClick={() => handleSortChange("chance")}
              className="text-xs sm:text-sm flex-1 sm:flex-none"
            >
              По шансам
            </Button>
            <Button
              variant={sortBy === "budget" ? "default" : "outline"}
              onClick={() => handleSortChange("budget")}
              className="text-xs sm:text-sm flex-1 sm:flex-none"
            >
              По стоимости
            </Button>
          </div>
        </div>

        {/* Results Grid */}
        {results.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                <span className="text-3xl">🔍</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Университеты не найдены
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              К сожалению, по вашим критериям не найдено подходящих университетов. 
              Попробуйте изменить параметры поиска.
            </p>
            <Button onClick={handleBack} className="bg-blue-600 hover:bg-blue-700">
              Изменить критерии
            </Button>
          </div>
        ) : (
          <>
            <div className="grid gap-6 grid-cols-1">
              {results.map((result) => {
                // Calculate simple percentage for comparison if user is logged in
                const simplePercentage = user && formData 
                  ? calculateSimpleChance(formData, result.university).percentage 
                  : undefined;
                const isSaved = savedUniversityIds.has(result.university.id);
                const isPlanned = plannedUniversityIds.has(result.university.id);

                return (
                  <WizardResultCard 
                    key={result.university.id} 
                    result={result}
                    onUpgradeClick={(plan) => {
                      trackEvent("upgrade_clicked", { from: "wizard-results", effectiveTier, plan });
                      if (!user) {
                        setAuthModalOpen(true);
                      } else {
                        setUpgradePlanType(plan);
                        setUpgradeModalOpen(true);
                      }
                    }}
                    showCTA={effectiveTier !== "pro"}
                    isPro={algorithm === "pro"}
                    proLabel="Pro"
                    showInsights={effectiveTier === "pro"}
                    showLiteAdvice={false}
                    formData={formData || undefined}
                    simplePercentage={simplePercentage ?? undefined}
                    saved={isSaved}
                    planned={isPlanned}
                    onToggleSaved={async () => {
                      if (!user) {
                        setAuthModalOpen(true);
                        return;
                      }
                      try {
                        if (isSaved) {
                          await supabase
                            .from("saved_universities")
                            .delete()
                            .eq("user_id", user.id)
                            .eq("university_id", result.university.id);
                          setSavedUniversityIds((prev) => {
                            const next = new Set(prev);
                            next.delete(result.university.id);
                            return next;
                          });
                          trackEvent("university_unsaved", { university_id: result.university.id });
                        } else {
                          await supabase
                            .from("saved_universities")
                            .insert({ user_id: user.id, university_id: result.university.id });
                          setSavedUniversityIds((prev) => new Set(prev).add(result.university.id));
                          trackEvent("university_saved", { university_id: result.university.id });
                        }
                      } catch (e) {
                        console.error("Error toggling saved university:", e);
                      }
                    }}
                    onAddToPlan={async () => {
                      if (!user) {
                        setAuthModalOpen(true);
                        return;
                      }
                      if (isPlanned) return;
                      try {
                        await supabase.from("admission_applications").insert({
                          user_id: user.id,
                          university_id: result.university.id,
                          status: "interested",
                          progress_percent: 0,
                        });
                        setPlannedUniversityIds((prev) => new Set(prev).add(result.university.id));
                        trackEvent("application_created", { university_id: result.university.id, status: "interested" });
                      } catch (e) {
                        console.error("Error adding university to plan:", e);
                      }
                    }}
                  />
                );
              })}

              {!user &&
                currentLimit !== null &&
                totalAvailable > currentLimit && (
                  <div className="rounded-2xl bg-white shadow-sm p-4 sm:p-5 relative overflow-hidden">
                    <div className="space-y-3 opacity-60 blur-[2px] pointer-events-none select-none">
                      {Array.from({ length: 2 }).map((_, idx) => (
                        <div key={idx} className="rounded-2xl bg-gray-50 p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {idx === 0 ? "University of Example" : "Example Business School"}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {idx === 0 ? "London, United Kingdom" : "Berlin, Germany"}
                              </div>
                            </div>
                            <div className="shrink-0 px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                              Средние шансы
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-3 gap-2">
                            <div className="h-2 rounded bg-gray-200" />
                            <div className="h-2 rounded bg-gray-200" />
                            <div className="h-2 rounded bg-gray-200" />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center p-5 sm:p-6 bg-white/55 backdrop-blur-sm">
                      <div className="max-w-md text-center">
                        {(() => {
                          const hidden = currentLimit !== null ? Math.max(0, totalAvailable - currentLimit) : 0;
                          return (
                            <div className="text-xl sm:text-2xl font-bold text-gray-900">
                              Ещё {hidden} {formatUniversityCountRu(hidden)} скрыты
                            </div>
                          );
                        })()}
                        <div className="text-sm text-gray-600 mt-3">
                          Зарегистрируйтесь, чтобы увидеть 9 университетов бесплатно.
                        </div>
                        <div className="mt-4">
                          <Button
                            className="bg-blue-600 hover:bg-blue-700 h-11 w-full sm:w-auto"
                            onClick={() => {
                              setAuthModalOpen(true);
                            }}
                          >
                            Зарегистрироваться бесплатно
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

            </div>
          </>
        )}

        {/* Footer Note */}
        {results.length > 0 && (
          <div className="mt-6 sm:mt-8 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs sm:text-sm text-gray-700">
            <p>
              Процент шанса рассчитан на основе ваших данных и требований университетов. Для точной информации свяжитесь с приёмной комиссией.
            </p>
          </div>
        )}
      </div>

      {/* Footer — same as main page */}
      <footer className="bg-gray-900 text-white pt-4 pb-6 sm:pt-5 sm:pb-8 px-3 sm:px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          {/* Telegram CTA */}
          <div className="pt-0 pb-4 sm:pb-6 text-center">
            <p className="text-white text-base sm:text-lg font-semibold mb-1">
              Если есть сомнения или что-то непонятно, свяжитесь с нами
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Напишите нам и опытный менеджер поможет вам
            </p>
            <a
              href="https://t.me/applysmartuz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm sm:text-base"
            >
              <MessageCircle className="w-5 h-5" />
              Написать в Telegram
            </a>
          </div>

          {/* Bottom Bar */}
          <div className="pt-4 sm:pt-6 border-t border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-3">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 order-1 sm:order-2 w-full sm:w-auto">
                <span className="hidden sm:block text-gray-500 text-xs font-medium uppercase tracking-wide">Контакты</span>
                <a
                  href="tel:+998905747400"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm sm:text-xs py-2 sm:py-0 w-full sm:w-auto justify-center sm:justify-start"
                >
                  <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +998 90 574 74 00
                </a>
                <a
                  href="mailto:applysmartuz@gmail.com"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm sm:text-xs py-2 sm:py-0 w-full sm:w-auto justify-center sm:justify-start"
                >
                  <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  applysmartuz@gmail.com
                </a>
              </div>
              <p className="text-gray-600 text-xs order-2 sm:order-1">© 2026 Apply Smart. Все права защищены</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      <ProfileCompletionModal
        open={profileModalOpen}
        onSubmit={async (profile) => {
          try {
            await upsertProfile(profile);
            setProfileModalOpen(false);
          } catch (error) {
            console.error("Error saving profile:", getErrorMessage(error), error);
            throw error;
          }
        }}
        initialFirstName={profileInitial.firstName}
        initialLastName={profileInitial.lastName}
        initialPhone={profileInitial.phone}
      />
      <UpgradePlanModal 
        open={upgradeModalOpen}
        onOpenChange={setUpgradeModalOpen}
        planType={upgradePlanType}
        source="Результаты расчёта"
        userProfile={{
          firstName: profileInitial.firstName,
          lastName: profileInitial.lastName,
          phone: profileInitial.phone,
          email: user?.email ?? undefined,
        }}
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
            body: JSON.stringify({}),
          });
          trackEvent("dev_tier_override_applied", { plan });
          setUpgradeModalOpen(false);
          // trigger recalc by toggling auth state effect (user unchanged) via manual tier refresh
          const tierInfo = await getTierInfo();
          setEffectiveTier(tierInfo.effectiveTier);
          setBonusUniversities(tierInfo.bonusUniversities);
        }}
      />
    </div>
  );
}
