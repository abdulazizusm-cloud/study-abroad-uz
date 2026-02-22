"use client";

import { useState } from "react";
import { WizardScoringResult, WizardFormData } from "@/lib/wizard-types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UpgradePlanType } from "@/components/upgrade-plan-modal";
import { 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle, 
  BookOpen, 
  MessageCircle, 
  TrendingUp, 
  Calendar, 
  Globe,
  GraduationCap,
  CheckCircle
} from "lucide-react";

interface ChanceInsightsProps {
  result: WizardScoringResult;
  formData: WizardFormData;
  simplePercentage?: number;
  onUpgradeClick?: (plan: UpgradePlanType) => void;
  chanceLevel?: "High" | "Medium" | "Low" | "NotEligible";
}

interface ImprovementTip {
  icon: React.ReactNode;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export function ChanceInsights({ result, formData, simplePercentage, onUpgradeClick, chanceLevel }: ChanceInsightsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { percentage: proPercentage, matchDetails } = result;
  const difference = simplePercentage ? simplePercentage - (proPercentage ?? 0) : 0;

  // Generate reasons why Pro score is lower
  const reasons: string[] = [];

  if (difference >= 20) {
    reasons.push("Даже с сильными показателями шанс поступления ограничен из-за большого количества кандидатов и ограниченных мест");
  }

  if (!matchDetails.gpaMatch) {
    reasons.push("GPA ниже среднего по программе");
  }

  if (!matchDetails.englishMatch) {
    reasons.push("Английский на минимуме требований");
  }

  if (!matchDetails.standardizedTestMatch) {
    reasons.push("Отсутствуют баллы GRE/GMAT");
  }

  // Generate improvement tips
  const specificTips: ImprovementTip[] = [];

  if (!matchDetails.gpaMatch) {
    specificTips.push({
      icon: <BookOpen className="w-4 h-4" />,
      title: "Усилить академический профиль",
      description: "Пройти подготовительные курсы или получить дополнительные сертификаты",
      priority: "high",
    });
  }

  if (!matchDetails.englishMatch) {
    specificTips.push({
      icon: <MessageCircle className="w-4 h-4" />,
      title: "Повысить уровень английского",
      description: "Целевая подготовка к IELTS/TOEFL для достижения балла выше минимума",
      priority: "high",
    });
  }

  if (!matchDetails.standardizedTestMatch) {
    specificTips.push({
      icon: <TrendingUp className="w-4 h-4" />,
      title: "Сдать GRE/GMAT",
      description: "Это обязательное условие для поступления на многие программы",
      priority: "high",
    });
  }

  const baseTips: ImprovementTip[] = [
    {
      icon: <Globe className="w-4 h-4" />,
      title: "Рассмотреть альтернативные программы",
      description: "Изучить похожие направления с более мягкими требованиями",
      priority: "low",
    },
    {
      icon: <Calendar className="w-4 h-4" />,
      title: "Проверить сроки подачи",
      description: "Early admission может повысить шансы",
      priority: "low",
    },
  ];

  const allTips = [
    ...specificTips.filter((t) => t.priority === "high"),
    ...specificTips.filter((t) => t.priority === "medium"),
    ...baseTips,
  ].slice(0, 4);

  const handleUpgrade = (plan: UpgradePlanType) => {
    if (onUpgradeClick) return onUpgradeClick(plan);
  };

  // High chance — mentor CTA
  if (chanceLevel === "High") {
    return (
      <div className="mt-3 border-t border-gray-200 pt-3">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm sm:text-base font-semibold text-[#374151]">
                  Следующий шаг — грамотно выстроить стратегию подачи документов.
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleUpgrade("mentorship")}
              className="bg-green-600 hover:bg-green-700 text-white font-medium w-full sm:w-auto flex-shrink-0"
            >
              Начать поступление с ментором
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Low chance — consultation CTA
  if (chanceLevel === "Low") {
    return (
      <div className="mt-3 border-t border-gray-200 pt-3">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200 rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm sm:text-base font-semibold text-[#374151]">
                  Хотите, чтобы мы лично просмотрели ваш кейс?
                </p>
                <p className="text-xs sm:text-sm text-[#6B7280] mt-0.5">
                  Эксперт разберёт ваш профиль и предложит реальный путь к поступлению
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleUpgrade("profile_review")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-medium w-full sm:w-auto flex-shrink-0"
            >
              Записаться на консультацию
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Medium (or default) — existing expandable toggle
  return (
    <div className="mt-3 border-t border-gray-200 pt-3">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left p-2 sm:p-3 hover:bg-gray-50 rounded-lg transition-colors"
      >
        <span className="text-xs sm:text-sm font-medium text-[#4F46E5]">
          {isOpen ? "Скрыть детали" : "Как повысить шанс?"}
        </span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-[#4F46E5]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#4F46E5]" />
        )}
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="mt-3 space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
          {/* Reasons Section (if applicable) */}
          {reasons.length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 rounded">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h5 className="text-xs sm:text-sm font-semibold text-[#374151] mb-2">
                    Факторы, снижающие шанс
                  </h5>
                  <ul className="space-y-1.5">
                    {reasons.map((reason, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[#374151]">
                        <span className="text-yellow-600 font-bold flex-shrink-0">•</span>
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Improvement Tips */}
          <div>
            <h5 className="text-xs sm:text-sm font-semibold text-[#374151] mb-2 sm:mb-3">
              Что можно улучшить
            </h5>
            <div className="grid gap-2 sm:gap-3">
              {allTips.map((tip, idx) => (
                <div
                  key={idx}
                  className={`p-2 sm:p-3 rounded-lg ${
                    tip.priority === "high"
                      ? "bg-red-50 border border-red-200"
                      : tip.priority === "medium"
                      ? "bg-yellow-50 border border-yellow-200"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={`p-1.5 rounded ${
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
                      <h6 className="text-xs sm:text-sm font-semibold text-[#374151] mb-0.5">{tip.title}</h6>
                      <p className="text-xs text-[#6B7280]">{tip.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PRO Upgrade CTA */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h6 className="text-sm font-bold text-[#374151] mb-1">
                    Получить точный расчет с учетом конкуренции
                  </h6>
                  <p className="text-xs text-[#6B7280]">
                    PRO-алгоритм учитывает реальную статистику и вашу конкурентоспособность
                  </p>
                </div>
              </div>
              <Button
                onClick={() => handleUpgrade("pro")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium w-full sm:w-auto flex-shrink-0"
              >
                Улучшить расчет
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
