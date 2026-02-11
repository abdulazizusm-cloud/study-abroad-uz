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
import { WizardSummary } from "@/components/wizard-summary";
import { AuthModal } from "@/components/auth-modal";
import { ProfileCompletionModal } from "@/components/profile-completion-modal";
import { UpgradePlanModal } from "@/components/upgrade-plan-modal";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SortAsc, User } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { calculateSimpleChance } from "@/lib/wizard-scoring-simple";
import { supabase } from "@/lib/supabase-client";

type SortOption = "chance" | "budget";

export default function WizardResultsPage() {
  const router = useRouter();
  const { user, loading: authLoading, loadWizardProfile, saveWizardProfile, getProfile, upsertProfile, getTierInfo, trackEvent } = useAuth();
  const [formData, setFormData] = useState<WizardFormData | null>(null);
  const [results, setResults] = useState<WizardScoringResult[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("chance");
  const [isLoading, setIsLoading] = useState(true);
  const [algorithm, setAlgorithm] = useState<ScoringAlgorithm>("simple");
  const [effectiveTier, setEffectiveTier] = useState<"free" | "pro_lite" | "pro" | "pro_plus">("free");
  const [bonusUniversities, setBonusUniversities] = useState(0);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [universities, setUniversities] = useState<ExtendedUniversity[]>([]);
  const [proUnlocked, setProUnlocked] = useState(false);
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

  const openProfileEditor = async () => {
    router.push("/profile");
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
            tuitionUSD: uni.tuition_usd,
            scholarshipAvailable: uni.scholarship_available || false,
          },
        }));

        setUniversities(universitiesData);

        const tierInfo = await getTierInfo();
        setEffectiveTier(tierInfo.effectiveTier);
        setBonusUniversities(tierInfo.bonusUniversities);

        // Determine algorithm based on tier
        const selectedAlgorithm: ScoringAlgorithm =
          tierInfo.effectiveTier === "pro" || tierInfo.effectiveTier === "pro_plus" || tierInfo.effectiveTier === "pro_lite"
            ? "pro"
            : "simple";
        setAlgorithm(selectedAlgorithm);

        // Calculate scores for all universities
        const scoredResults = scoreAllUniversities(parsedData, universitiesData, selectedAlgorithm);

        // Sort by chance initially
        const sortedResults = sortResultsByChance(scoredResults);

        // Apply gating limits
        const baseLimit =
          tierInfo.effectiveTier === "free" ? 3 :
          tierInfo.effectiveTier === "pro_lite" ? 6 :
          null; // pro/pro_plus unlimited
        const limit = baseLimit === null ? null : baseLimit + (tierInfo.bonusUniversities || 0);
        setTotalAvailable(sortedResults.length);
        setCurrentLimit(limit);
        setResults(limit ? sortedResults.slice(0, limit) : sortedResults);
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
          console.error("Error saving wizard profile:", error);
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
        console.error("Error loading profile:", error);
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
        const tierInfo = await getTierInfo();
        setEffectiveTier(tierInfo.effectiveTier);
        setBonusUniversities(tierInfo.bonusUniversities);

        const selectedAlgorithm: ScoringAlgorithm =
          tierInfo.effectiveTier === "pro" || tierInfo.effectiveTier === "pro_plus" || tierInfo.effectiveTier === "pro_lite"
            ? "pro"
            : "simple";
        setAlgorithm(selectedAlgorithm);

        // If user just logged in, unlock Pro permanently (legacy flag)
        if (user && !proUnlocked) {
          setProUnlocked(true);
        }

        const scoredResults = scoreAllUniversities(formData, universities, selectedAlgorithm);
        const sortedResults = sortBy === "chance" 
          ? sortResultsByChance(scoredResults)
          : sortResultsByBudget(scoredResults);

        const baseLimit =
          tierInfo.effectiveTier === "free" ? 3 :
          tierInfo.effectiveTier === "pro_lite" ? 6 :
          null;
        const limit = baseLimit === null ? null : baseLimit + (tierInfo.bonusUniversities || 0);
        setTotalAvailable(sortedResults.length);
        setCurrentLimit(limit);
        setResults(limit ? sortedResults.slice(0, limit) : sortedResults);
      };
      recalc();
    }
  }, [user, authLoading, formData, universities, sortBy, proUnlocked, getTierInfo]);

  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
    if (option === "chance") {
      setResults(sortResultsByChance(results));
    } else if (option === "budget") {
      setResults(sortResultsByBudget(results));
    }
  };

  const handleBack = () => {
    router.push("/");
  };

  if (isLoading || !formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Подбираем университеты...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="hover:bg-blue-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Вернуться на главную
            </Button>
            {user && (
              <Button
                variant="outline"
                className="rounded-full w-11 h-11 p-0 border-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                aria-label="Профиль"
                onClick={openProfileEditor}
              >
                <User className="w-5 h-5" />
              </Button>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 mt-2">
            Ваши шансы поступления
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Найдено {results.length} подходящих университетов
          </p>
        </div>

        {/* User Summary */}
        <WizardSummary formData={formData} />

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
                    onUpgradeClick={() => {
                      trackEvent("upgrade_clicked", { from: "wizard-results", effectiveTier });
                      setAuthModalOpen(true);
                    }}
                    showCTA={effectiveTier === "free" || effectiveTier === "pro_lite"}
                    isPro={algorithm === "pro"}
                    proLabel={effectiveTier === "pro_lite" ? "Pro Lite" : "Pro"}
                    showInsights={effectiveTier === "pro" || effectiveTier === "pro_plus"}
                    formData={formData || undefined}
                    simplePercentage={simplePercentage}
                    saved={isSaved}
                    planned={isPlanned}
                    onToggleSaved={async () => {
                      if (!user) return;
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
                      if (!user || isPlanned) return;
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

              {effectiveTier === "pro_lite" &&
                currentLimit !== null &&
                totalAvailable > currentLimit && (
                  <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
                    <div className="text-xl font-bold text-gray-900 mb-2">
                      🔒 Вы открыли {currentLimit} из {totalAvailable} университетов
                    </div>
                    <div className="text-sm text-gray-600 mb-4">
                      Откройте полный список, экспертный breakdown и сценарии улучшения.
                    </div>
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 h-11"
                      onClick={() => {
                        trackEvent("upgrade_modal_opened", { from: "paywall_card" });
                        setUpgradeModalOpen(true);
                      }}
                    >
                      Улучшить план
                    </Button>
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

        {/* Auth Modal */}
        <ProfileCompletionModal
          open={profileModalOpen}
          initialFirstName={profileInitial.firstName}
          initialLastName={profileInitial.lastName}
          initialPhone={profileInitial.phone}
          onSubmit={async (profile) => {
            await upsertProfile(profile);
            setProfileModalOpen(false);
          }}
        />
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
            // trigger recalc by toggling auth state effect (user unchanged) via manual tier refresh
            const tierInfo = await getTierInfo();
            setEffectiveTier(tierInfo.effectiveTier);
            setBonusUniversities(tierInfo.bonusUniversities);
          }}
        />
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      </div>
    </div>
  );
}
