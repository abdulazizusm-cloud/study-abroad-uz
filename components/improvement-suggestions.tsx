"use client";

import { WizardFormData, WizardScoringResult } from "@/lib/wizard-types";
import { Card } from "@/components/ui/card";
import { BookOpen, MessageCircle, TrendingUp, Award, Calendar, Globe } from "lucide-react";

interface ImprovementSuggestionsProps {
  formData: WizardFormData;
  result: WizardScoringResult;
}

interface ImprovementTip {
  icon: React.ReactNode;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export function ImprovementSuggestions({ formData, result }: ImprovementSuggestionsProps) {
  const { matchDetails } = result;

  // Generate specific tips based on weak areas
  const specificTips: ImprovementTip[] = [];

  // High priority tips (critical issues)
  if (!matchDetails.gpaMatch) {
    specificTips.push({
      icon: <BookOpen className="w-5 h-5" />,
      title: "Усилить академический профиль",
      description: "Пройти подготовительные курсы или получить дополнительные сертификаты для повышения GPA",
      priority: "high",
    });
  }

  if (!matchDetails.englishMatch) {
    specificTips.push({
      icon: <MessageCircle className="w-5 h-5" />,
      title: "Повысить уровень английского",
      description: "Целевая подготовка к IELTS/TOEFL для достижения балла выше минимума (не на границе)",
      priority: "high",
    });
  }

  if (!matchDetails.standardizedTestMatch) {
    specificTips.push({
      icon: <TrendingUp className="w-5 h-5" />,
      title: "Сдать GRE/GMAT",
      description: "Многие программы требуют standardized tests - это обязательное условие для поступления",
      priority: "high",
    });
  }

  // Medium priority tips (general improvement)
  if (!matchDetails.budgetMatch) {
    specificTips.push({
      icon: <Award className="w-5 h-5" />,
      title: "Изучить scholarship opportunities",
      description: "Рассмотреть стипендии и гранты для снижения финансовой нагрузки",
      priority: "medium",
    });
  }

  // Base tips (show to everyone)
  const baseTips: ImprovementTip[] = [
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Рассмотреть альтернативные программы",
      description: "Изучить похожие направления обучения с более мягкими требованиями",
      priority: "low",
    },
    {
      icon: <Calendar className="w-5 h-5" />,
      title: "Проверить сроки подачи",
      description: "Early admission может повысить шансы и дать преимущество",
      priority: "low",
    },
  ];

  // Combine: high priority first, then medium, then base
  const allTips = [
    ...specificTips.filter((t) => t.priority === "high"),
    ...specificTips.filter((t) => t.priority === "medium"),
    ...baseTips,
  ].slice(0, 5); // Show max 5 tips

  return (
    <div className="mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Что можно улучшить
      </h3>

      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {allTips.map((tip, idx) => (
          <Card
            key={idx}
            className={`p-4 ${
              tip.priority === "high"
                ? "border-l-4 border-red-500 bg-red-50"
                : tip.priority === "medium"
                ? "border-l-4 border-yellow-500 bg-yellow-50"
                : "border-l-4 border-blue-500 bg-blue-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`p-2 rounded-lg ${
                  tip.priority === "high"
                    ? "bg-red-100 text-red-600"
                    : tip.priority === "medium"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                {tip.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900 mb-1">{tip.title}</h4>
                <p className="text-sm text-gray-700">{tip.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <p className="text-sm text-gray-600 italic bg-gray-50 p-4 rounded-lg border border-gray-200">
        💡 Эти факторы нельзя точно оценить автоматически. Требуется индивидуальный
        анализ экспертом для разработки персональной стратегии поступления.
      </p>
    </div>
  );
}
