"use client";

import { WizardScoringResult, WizardFormData } from "@/lib/wizard-types";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ChanceInsights } from "./chance-insights";
import { MapPin, GraduationCap, DollarSign, XCircle, CheckCircle } from "lucide-react";

interface WizardResultCardProps {
  result: WizardScoringResult;
  onUpgradeClick?: () => void;
  showCTA?: boolean;
  isPro?: boolean;
  formData?: WizardFormData;
  simplePercentage?: number;
}

export function WizardResultCard({ result, onUpgradeClick, showCTA = true, isPro = false, formData, simplePercentage }: WizardResultCardProps) {
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

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow" style={{ fontFamily: 'var(--font-inter)' }}>
      {/* Header */}
      <div className="mb-2">
        <div className="flex justify-between items-start mb-1">
          <h3 className="text-2xl font-bold text-[#374151]">{university.name}</h3>
          <Badge className={`${chanceBadgeColors[chanceLevel]} ${chanceLevel === 'High' || chanceLevel === 'Low' ? 'px-4 py-2 text-base font-bold' : 'px-3 py-1'} flex-shrink-0 ml-4`}>
            {chanceLabels[chanceLevel]}
          </Badge>
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
        <div className="flex items-start gap-3 mb-2">
          <div className="text-4xl font-bold text-blue-600">{percentage}%</div>
          <div className="flex flex-col justify-center">
            <div className="text-base font-semibold text-[#374151]">
              {isPro ? "Реальная оценка шансов (Pro)" : "Примерный шанс поступления (Simple)"}
            </div>
            <div className="text-sm text-[#6B7280]">
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
          <h4 className="text-base font-semibold text-[#059669] mb-2.5">Ваши преимущества</h4>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-base text-[#374151]">
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
          <h4 className="text-base font-semibold text-[#DC2626] mb-2.5">Причины низкого шанса</h4>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-3 text-base text-[#374151]">
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
      <div className="mb-0 text-base text-[#374151] flex items-center gap-2">
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
          <div className="flex items-center justify-between gap-4">
            <p className="text-base text-[#6B7280]">
              Рассчитать реальный шанс по полной модели (Pro).
            </p>
            <Button
              onClick={onUpgradeClick}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium flex-shrink-0"
            >
              Узнать реальные шансы
            </Button>
          </div>
        </div>
      )}

      {/* Chance Insights - Only show for Pro users */}
      {isPro && formData && (
        <ChanceInsights 
          result={result} 
          formData={formData}
          simplePercentage={simplePercentage}
        />
      )}
    </Card>
  );
}
