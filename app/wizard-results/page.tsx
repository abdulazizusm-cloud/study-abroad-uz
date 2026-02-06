"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { WizardFormData, ExtendedUniversity, WizardScoringResult, ScoringAlgorithm } from "@/lib/wizard-types";
import {
  scoreAllUniversities,
  sortResultsByChance,
  sortResultsByBudget,
} from "@/lib/wizard-scoring";
import { WizardResultCard } from "@/components/wizard-result-card";
import { WizardSummary } from "@/components/wizard-summary";
import { UnlockProCTA } from "@/components/unlock-pro-cta";
import { AuthModal } from "@/components/auth-modal";
import { ProBreakdown } from "@/components/pro-breakdown";
import { ImprovementSuggestions } from "@/components/improvement-suggestions";
import { ConsultationCTA } from "@/components/consultation-cta";
import { Button } from "@/components/ui/button";
import { ArrowLeft, SortAsc, Calculator, Zap } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { calculateSimpleChance } from "@/lib/wizard-scoring-simple";

type SortOption = "chance" | "budget";

export default function WizardResultsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState<WizardFormData | null>(null);
  const [results, setResults] = useState<WizardScoringResult[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("chance");
  const [isLoading, setIsLoading] = useState(true);
  const [algorithm, setAlgorithm] = useState<ScoringAlgorithm>("simple");
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [universities, setUniversities] = useState<ExtendedUniversity[]>([]);

  useEffect(() => {
    const loadResults = async () => {
      // Load form data from localStorage
      const savedData = localStorage.getItem("wizardFormData");
      
      if (!savedData) {
        // No data, redirect to home
        router.push("/");
        return;
      }

      try {
        const parsedData: WizardFormData = JSON.parse(savedData);
        setFormData(parsedData);

        // Load universities from local JSON file
        const wizardUniversitiesModule = await import("@/lib/wizard-universities.json");
        const universitiesData = wizardUniversitiesModule.default as ExtendedUniversity[];
        
        setUniversities(universitiesData);

        // Start with simple algorithm by default
        const selectedAlgorithm: ScoringAlgorithm = "simple";
        setAlgorithm(selectedAlgorithm);

        // Calculate scores for all universities
        const scoredResults = scoreAllUniversities(parsedData, universitiesData, selectedAlgorithm);
        
        // Sort by chance initially
        const sortedResults = sortResultsByChance(scoredResults);
        setResults(sortedResults);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading results:", error);
        setIsLoading(false);
        router.push("/");
      }
    };

    loadResults();
  }, [router, user]);

  // Handle algorithm change
  const handleAlgorithmChange = (newAlgorithm: ScoringAlgorithm) => {
    if (formData && universities.length > 0) {
      setAlgorithm(newAlgorithm);
      const scoredResults = scoreAllUniversities(formData, universities, newAlgorithm);
      const sortedResults = sortBy === "chance" 
        ? sortResultsByChance(scoredResults)
        : sortResultsByBudget(scoredResults);
      setResults(sortedResults);
    }
  };

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
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Ваши шансы поступления
          </h1>
          <p className="text-gray-600">
            Найдено {results.length} подходящих университетов
          </p>
        </div>

        {/* User Summary */}
        <WizardSummary formData={formData} />

        {/* Sorting Controls */}
        <div className="mb-6 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <SortAsc className="w-4 h-4" />
            <span className="font-medium">Сортировать:</span>
          </div>
          <Button
            variant={sortBy === "chance" ? "default" : "outline"}
            onClick={() => handleSortChange("chance")}
            className="text-sm"
          >
            По шансам
          </Button>
          <Button
            variant={sortBy === "budget" ? "default" : "outline"}
            onClick={() => handleSortChange("budget")}
            className="text-sm"
          >
            По стоимости
          </Button>
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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {results.map((result) => (
                <WizardResultCard key={result.university.id} result={result} />
              ))}
            </div>

            {/* Algorithm Toggle - Simple/Pro Switcher - Moved after universities */}
            <div className="mt-8 mb-6 p-6 bg-white rounded-3xl shadow-lg border-2 border-gray-200">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Получить реальную оценку шансов
                  </h3>
                  <p className="text-sm text-gray-600">
                    {algorithm === "simple" 
                      ? "Сейчас: Базовый расчёт — переключитесь на Pro для реалистичной оценки"
                      : "Сейчас: Pro расчёт — реалистичная оценка с учётом конкуренции"}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button
                    variant={algorithm === "simple" ? "default" : "outline"}
                    onClick={() => handleAlgorithmChange("simple")}
                    className={`flex items-center gap-2 px-6 py-3 ${
                      algorithm === "simple" 
                        ? "bg-blue-600 hover:bg-blue-700" 
                        : "hover:bg-blue-50"
                    }`}
                  >
                    <Calculator className="w-4 h-4" />
                    Simple
                  </Button>
                  <Button
                    variant={algorithm === "pro" ? "default" : "outline"}
                    onClick={() => handleAlgorithmChange("pro")}
                    className={`flex items-center gap-2 px-6 py-3 ${
                      algorithm === "pro" 
                        ? "bg-purple-600 hover:bg-purple-700" 
                        : "hover:bg-purple-50"
                    }`}
                  >
                    <Zap className="w-4 h-4" />
                    Pro
                  </Button>
                </div>
              </div>
            </div>

            {/* Pro Features for authenticated users */}
            {user && formData && results.length > 0 && (
              <div className="mt-8 space-y-6">
                {/* Show breakdown for first (best) university */}
                {(() => {
                  const bestProResult = results[0];
                  const simpleResult = calculateSimpleChance(formData, bestProResult.university);
                  return (
                    <>
                      <ProBreakdown
                        proResult={bestProResult}
                        simplePercentage={simpleResult.percentage}
                      />
                      <ImprovementSuggestions
                        formData={formData}
                        result={bestProResult}
                      />
                    </>
                  );
                })()}

                {/* Consultation CTA */}
                <ConsultationCTA />
              </div>
            )}
          </>
        )}

        {/* Footer Note */}
        {results.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-gray-700">
            <p className="font-medium mb-1">📌 Важная информация:</p>
            <p>
              Процент шанса поступления рассчитан на основе ваших академических показателей 
              и требований университетов. {user ? "Используется экспертный алгоритм Pro." : "Это базовая оценка."} Для точной информации 
              свяжитесь с приёмной комиссией выбранного университета.
            </p>
          </div>
        )}

        {/* Auth Modal */}
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      </div>
    </div>
  );
}
