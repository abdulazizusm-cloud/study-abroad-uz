"use client";

import { WizardScoringResult } from "@/lib/wizard-types";
import { AlertTriangle } from "lucide-react";

interface ProBreakdownProps {
  proResult: WizardScoringResult;
  simplePercentage: number;
}

export function ProBreakdown({ proResult, simplePercentage }: ProBreakdownProps) {
  const { percentage: proPercentage, matchDetails } = proResult;
  const difference = simplePercentage - (proPercentage ?? 0);

  // Generate reasons why Pro score is lower
  const reasons: string[] = [];

  if (difference >= 20) {
    reasons.push("Применён soft-cap для высоких базовых показателей - учитывает реальную конкуренцию");
  }

  if (!matchDetails.gpaMatch) {
    reasons.push("GPA на минимуме или ниже требований - приёмная комиссия рассматривает это критически");
  }

  if (!matchDetails.englishMatch) {
    reasons.push("English без запаса - любое снижение балла может быть критичным");
  }

  if (!matchDetails.budgetMatch) {
    reasons.push("Финансы не в рамках бюджета - Pro алгоритм учитывает это строже");
  }

  if (!matchDetails.standardizedTestMatch) {
    reasons.push("Нет требуемых GRE/GMAT баллов - это обязательное условие для многих программ");
  }

  // If Pro is actually higher or equal, don't show this block
  if (difference <= 0 || reasons.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="text-lg font-bold text-gray-900 mb-2">
            Почему реальный шанс ниже первичной оценки
          </h4>
          <p className="text-sm text-gray-700 mb-4">
            Экспертная оценка строже ({proPercentage}% vs {simplePercentage}%), 
            так как учитывает:
          </p>
          <ul className="space-y-2">
            {reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-yellow-600 font-bold flex-shrink-0">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
