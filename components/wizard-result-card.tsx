"use client";

import { WizardScoringResult, WizardFormData } from "@/lib/wizard-types";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ChanceInsights } from "./chance-insights";
import { MapPin, GraduationCap, DollarSign, XCircle, CheckCircle, Heart, Plus, Check } from "lucide-react";

interface WizardResultCardProps {
  result: WizardScoringResult;
  onUpgradeClick?: () => void;
  showCTA?: boolean;
  isPro?: boolean;
  proLabel?: string;
  showInsights?: boolean;
  showLiteAdvice?: boolean;
  ctaText?: string;
  ctaButtonText?: string;
  formData?: WizardFormData;
  simplePercentage?: number;
  saved?: boolean;
  planned?: boolean;
  onToggleSaved?: () => void;
  onAddToPlan?: () => void;
}

export function WizardResultCard({
  result,
  onUpgradeClick,
  showCTA = true,
  isPro = false,
  proLabel = "Pro",
  showInsights,
  showLiteAdvice = false,
  ctaText,
  ctaButtonText,
  formData,
  simplePercentage,
  saved = false,
  planned = false,
  onToggleSaved,
  onAddToPlan,
}: WizardResultCardProps) {
  const { university, percentage, chanceLevel, explanation, matchDetails } = result;

  const chanceColors = {
    High: "bg-[#10B981]",
    Medium: "bg-[#F59E0B]",
    Low: "bg-[#F87171]",
  };

  const chanceBadgeColors = {
    High: "bg-[#ECFDF5] text-[#059669]",
    Medium: "bg-[#FFFBEB] text-[#D97706]",
    Low: "bg-[#FEF2F2] text-[#DC2626]",
  };

  const chanceLabels = {
    High: "Высокие шансы",
    Medium: "Средние шансы",
    Low: "Низкие шансы",
  };

  const liteAdvice = (() => {
    const tips: string[] = [];
    if (!matchDetails.standardizedTestMatch) tips.push("Сдать GRE/GMAT (если требуется) — это часто даёт сильный прирост");
    if (!matchDetails.englishMatch) tips.push("Поднять английский выше минимума (лучше иметь запас, не “на границе”)");
    if (!matchDetails.gpaMatch) tips.push("Усилить академический профиль: GPA/сертификаты/курсы");
    if (!matchDetails.budgetMatch) tips.push("Рассмотреть гранты/стипендии или программы с меньшей стоимостью");
    const unique = Array.from(new Set(tips));
    return unique.slice(0, 2);
  })();

  return (
    <Card className="p-3 md:p-4 hover:shadow-lg transition-shadow" style={{ fontFamily: 'var(--font-inter)' }}>
      {/* Header */}
      <div className="mb-2">
        <div className="flex flex-col sm:flex-row sm:items-start gap-2 mb-1">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-[#374151] flex-1">
            {university.name}
          </h3>
          <div className="flex items-center gap-2 self-start">
            <Badge className={`${chanceBadgeColors[chanceLevel]} ${chanceLevel === 'High' || chanceLevel === 'Low' ? 'px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-bold' : 'px-2.5 py-1 sm:px-3 text-xs sm:text-sm'} flex-shrink-0`}>
              {chanceLabels[chanceLevel]}
            </Badge>

            {(onToggleSaved || onAddToPlan) && (
              <div className="flex items-center gap-2">
                {onToggleSaved && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onToggleSaved}
                    className={`h-10 w-10 p-0 rounded-xl ${
                      saved
                        ? "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100"
                        : "hover:bg-gray-50"
                    }`}
                    aria-label={saved ? "Убрать лайк" : "Поставить лайк"}
                    title={saved ? "Лайк поставлен" : "Лайк"}
                  >
                    <Heart className="w-5 h-5" fill={saved ? "currentColor" : "none"} />
                  </Button>
                )}
                {onAddToPlan && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onAddToPlan}
                    className={`h-10 w-10 p-0 rounded-xl ${
                      planned
                        ? "border-blue-300 bg-blue-50 text-blue-700 cursor-default"
                        : "hover:bg-gray-50"
                    }`}
                    aria-label={planned ? "Уже в плане" : "Добавить в план"}
                    title={planned ? "В плане" : "Добавить в план"}
                    aria-disabled={planned}
                  >
                    {planned ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm text-[#6B7280]">
            <MapPin className="w-4 h-4" />
            <span>{university.city}, {university.country}</span>
          </div>
          {university.qsRanking && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-300 text-yellow-800 text-xs font-semibold">
              QS Ranking #{university.qsRanking}
            </span>
          )}
        </div>
      </div>

      {/* Percentage */}
      <div className="mb-2">
        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-3 mb-2">
          <div className="text-3xl sm:text-4xl font-bold text-blue-600">{percentage}%</div>
          <div className="flex flex-col justify-center">
            <div className="text-sm sm:text-base font-semibold text-[#374151]">
              {isPro ? `Реальная оценка шансов (${proLabel})` : "Примерный шанс поступления (Simple)"}
            </div>
            <div className="text-xs sm:text-sm text-[#6B7280]">
              {isPro ? "По полной экспертной модели" : "По базовым требованиям"}
            </div>
          </div>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full ${chanceColors[chanceLevel]} transition-all`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Positive factors for High/Medium chance */}
      {chanceLevel !== "Low" && (
        <div className="mb-0 pb-0">
          <h4 className="text-sm sm:text-base font-semibold text-[#059669] mb-2.5">Ваши преимущества</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm sm:text-base text-[#374151]">
            {matchDetails.gpaMatch && (
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                <span className="flex-1">GPA соответствует требованиям</span>
              </li>
            )}
            {matchDetails.englishMatch && (
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                <span className="flex-1">Английский на требуемом уровне</span>
              </li>
            )}
            {matchDetails.budgetMatch && (
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                <span className="flex-1">Стоимость в рамках бюджета</span>
              </li>
            )}
            {matchDetails.standardizedTestMatch && (
              <li className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                <span className="flex-1">Тесты соответствуют требованиям</span>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Reasons for low chance */}
      {chanceLevel === "Low" && (
        <div className="mb-0 pb-0">
          <h4 className="text-sm sm:text-base font-semibold text-[#DC2626] mb-2.5">Причины низкого шанса</h4>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm sm:text-base text-[#374151]">
            {!matchDetails.gpaMatch && (
              <li className="flex items-center gap-3">
                <XCircle className="w-4 h-4 text-[#F87171] flex-shrink-0" />
                <span className="flex-1">GPA ниже среднего по программе</span>
              </li>
            )}
            {!matchDetails.budgetMatch && (
              <li className="flex items-center gap-3">
                <XCircle className="w-4 h-4 text-[#F87171] flex-shrink-0" />
                <span className="flex-1">Бюджет не покрывает tuition</span>
              </li>
            )}
            {!matchDetails.englishMatch && (
              <li className="flex items-center gap-3">
                <XCircle className="w-4 h-4 text-[#F87171] flex-shrink-0" />
                <span className="flex-1">Уровень английского ниже требований</span>
              </li>
            )}
            {!matchDetails.standardizedTestMatch && (
              <li className="flex items-center gap-3">
                <XCircle className="w-4 h-4 text-[#F87171] flex-shrink-0" />
                <span className="flex-1">Тесты не соответствуют требованиям</span>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Footer with details */}
      <div className="mb-0 text-sm sm:text-base text-[#374151] flex items-center gap-2">
        <GraduationCap className="w-4 h-4" />
        <span className="font-medium">{university.level}</span>
        <span className="text-gray-400">·</span>
        <span className="font-semibold">$ {university.requirements.tuitionUSD.toLocaleString()}/год</span>
      </div>

      {/* Disciplines */}
      <div className="mb-0 flex flex-wrap gap-2">
        {university.disciplines.map((disc) => (
          <Badge key={disc} variant="outline" className="text-xs">
            {disc}
          </Badge>
        ))}
      </div>

      {/* CTA Block */}
      {showCTA && onUpgradeClick && (
        <div className="pt-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <p className="text-sm sm:text-base text-[#6B7280]">
              {ctaText ?? "Рассчитать реальный шанс по полной модели (Pro)."}
            </p>
            <Button
              onClick={onUpgradeClick}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium w-full sm:w-auto flex-shrink-0"
            >
              {ctaButtonText ?? "Узнать реальные шансы"}
            </Button>
          </div>
        </div>
      )}

      {/* Pro Lite short advice (no breakdown) */}
      {showLiteAdvice && liteAdvice.length > 0 && (
        <div className="mt-3 border-t border-gray-200 pt-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs sm:text-sm font-semibold text-[#374151] mb-1">
                Как улучшить шанс (Pro Lite)
              </div>
              <ul className="space-y-1 text-xs sm:text-sm text-[#374151]">
                {liteAdvice.map((t) => (
                  <li key={t} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            {onUpgradeClick && (
              <Button
                type="button"
                variant="outline"
                className="flex-shrink-0"
                onClick={onUpgradeClick}
              >
                Улучшить план
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Chance Insights - Only show for Pro users */}
      {(showInsights ?? isPro) && formData && (
        <ChanceInsights 
          result={result} 
          formData={formData}
          simplePercentage={simplePercentage}
          onUpgradeClick={onUpgradeClick}
        />
      )}
    </Card>
  );
}
