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
import { Button } from "@/components/ui/button";
import { ArrowLeft, SortAsc } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { calculateSimpleChance } from "@/lib/wizard-scoring-simple";

type SortOption = "chance" | "budget";

export default function WizardResultsPage() {
  const router = useRouter();
  const { user, loading: authLoading, loadWizardProfile, saveWizardProfile, getProfile, upsertProfile } = useAuth();
  const [formData, setFormData] = useState<WizardFormData | null>(null);
  const [results, setResults] = useState<WizardScoringResult[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("chance");
  const [isLoading, setIsLoading] = useState(true);
  const [algorithm, setAlgorithm] = useState<ScoringAlgorithm>("simple");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [universities, setUniversities] = useState<ExtendedUniversity[]>([]);
  const [proUnlocked, setProUnlocked] = useState(false);
  const lastSavedRef = useRef<string>("");
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
          // No data available, redirect to home
          router.push("/");
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

        // Determine algorithm based on auth status
        const selectedAlgorithm: ScoringAlgorithm = user ? "pro" : "simple";
        setAlgorithm(selectedAlgorithm);

        // Calculate scores for all universities
        const scoredResults = scoreAllUniversities(parsedData, universitiesData, selectedAlgorithm);

        // Sort by chance initially
        const sortedResults = sortResultsByChance(scoredResults);
        setResults(sortedResults);
        setIsLoading(false);
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

  // Recalculate when user auth state changes
  useEffect(() => {
    if (formData && universities.length > 0 && !authLoading) {
      const selectedAlgorithm: ScoringAlgorithm = user ? "pro" : "simple";
      setAlgorithm(selectedAlgorithm);

      // If user just logged in, unlock Pro permanently
      if (user && !proUnlocked) {
        setProUnlocked(true);
      }

      const scoredResults = scoreAllUniversities(formData, universities, selectedAlgorithm);
      const sortedResults = sortBy === "chance" 
        ? sortResultsByChance(scoredResults)
        : sortResultsByBudget(scoredResults);
      setResults(sortedResults);
    }
  }, [user, authLoading, formData, universities, sortBy, proUnlocked]);

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
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4 hover:bg-blue-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться на главную
          </Button>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
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

                return (
                  <WizardResultCard 
                    key={result.university.id} 
                    result={result}
                    onUpgradeClick={() => setAuthModalOpen(true)}
                    showCTA={!user}
                    isPro={!!user}
                    formData={formData || undefined}
                    simplePercentage={simplePercentage}
                  />
                );
              })}
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
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      </div>
    </div>
  );
}
