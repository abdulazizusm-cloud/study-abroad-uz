"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UniversityCard } from "@/components/university-card";
import { ResultsSummary } from "@/components/results-summary";
import { FormData, University, ScoringResult } from "@/lib/types";
import { scoreAllUniversities, sortResults } from "@/lib/scoring";
import { scoreAllUniversitiesPro } from "@/lib/scoring-pro";
import universitiesData from "@/lib/universities.json";
import { ArrowLeft } from "lucide-react";

type SortOption = "chance" | "budget" | "deadline";

export default function ResultsPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData | null>(null);
  const [results, setResults] = useState<ScoringResult[]>([]);
  const [proResults, setProResults] = useState<ScoringResult[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>("chance");

  useEffect(() => {
    // Load form data from localStorage
    const savedData = localStorage.getItem("formData");
    if (!savedData) {
      // Redirect back if no data
      router.push("/");
      return;
    }

    const data: FormData = JSON.parse(savedData);
    setFormData(data);

    // Calculate results with BOTH algorithms
    const universities = universitiesData as University[];
    const scoredResults = scoreAllUniversities(data, universities);
    const scoredPro = scoreAllUniversitiesPro(data, universities);
    
    setResults(scoredResults);
    setProResults(scoredPro);
  }, [router]);

  const handleSort = (option: SortOption) => {
    setSortBy(option);
    const sorted = sortResults(results, option);
    const sortedPro = sortResults(proResults, option);
    setResults(sorted);
    setProResults(sortedPro);
  };

  if (!formData || results.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка результатов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      {/* Header - Enhanced */}
      <div className="bg-white border-b-2 border-gray-100 sticky top-0 z-10 shadow-sm backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => router.push("/")}
            className="mb-4 hover:bg-blue-50 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Вернуться назад
          </Button>
          <div>
            <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-2">
              Ваши шансы поступления
            </h1>
            <p className="text-lg text-gray-600">Персональный подбор университетов</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Summary */}
        <ResultsSummary formData={formData} />

        {/* Results count */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              Найдено {results.length} подходящих программ
            </h2>
            <p className="text-gray-600">
              Отсортировано по вероятности поступления
            </p>
          </div>
        </div>

        {/* Sorting Controls - Enhanced */}
        <div className="flex flex-wrap gap-3 mb-10">
          <span className="text-sm font-semibold text-gray-700 flex items-center mr-2">
            Сортировать:
          </span>
          <Button
            variant={sortBy === "chance" ? "default" : "outline"}
            onClick={() => handleSort("chance")}
            className={sortBy === "chance" ? "bg-blue-600" : ""}
          >
            По шансу
          </Button>
          <Button
            variant={sortBy === "budget" ? "default" : "outline"}
            onClick={() => handleSort("budget")}
            className={sortBy === "budget" ? "bg-blue-600" : ""}
          >
            По бюджету
          </Button>
          <Button
            variant={sortBy === "deadline" ? "default" : "outline"}
            onClick={() => handleSort("deadline")}
            className={sortBy === "deadline" ? "bg-blue-600" : ""}
          >
            По дедлайну
          </Button>
        </div>

        {/* Results Grid */}
        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((result) => {
              // Find matching pro result
              const proResult = proResults.find(
                (pr) => pr.university.id === result.university.id
              );
              return (
                <UniversityCard 
                  key={result.university.id} 
                  result={result} 
                  proResult={proResult}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-gray-600 mb-4">
              К сожалению, подходящих программ не найдено
            </p>
            <p className="text-gray-500 mb-6">
              Попробуйте изменить параметры поиска
            </p>
            <Button onClick={() => router.push("/")} className="bg-blue-600">
              Изменить параметры
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
