"use client";

import { WizardScoringResult } from "@/lib/wizard-types";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { MapPin, GraduationCap, DollarSign, CheckCircle, XCircle } from "lucide-react";

interface WizardResultCardProps {
  result: WizardScoringResult;
}

export function WizardResultCard({ result }: WizardResultCardProps) {
  const { university, percentage, chanceLevel, explanation, matchDetails } = result;

  const chanceColors = {
    High: "bg-green-500",
    Medium: "bg-yellow-500",
    Low: "bg-red-500",
  };

  const chanceBadgeColors = {
    High: "bg-green-100 text-green-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-red-100 text-red-700",
  };

  const chanceLabels = {
    High: "Высокие шансы",
    Medium: "Средние шансы",
    Low: "Низкие шансы",
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="mb-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900">{university.name}</h3>
          <Badge className={`${chanceBadgeColors[chanceLevel]} px-3 py-1 flex-shrink-0 ml-4`}>
            {chanceLabels[chanceLevel]}
          </Badge>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
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
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-4xl font-bold text-blue-600">{percentage}%</div>
          <div className="text-sm text-gray-600">шанс поступления</div>
        </div>
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full ${chanceColors[chanceLevel]} transition-all`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Explanation */}
      <p className="text-sm text-gray-700 mb-4 leading-relaxed">{explanation}</p>

      {/* Match Details */}
      <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
        <div className="flex items-center gap-2">
          {matchDetails.gpaMatch ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
          <span className={matchDetails.gpaMatch ? "text-green-700" : "text-red-700"}>
            GPA
          </span>
        </div>
        <div className="flex items-center gap-2">
          {matchDetails.englishMatch ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
          <span className={matchDetails.englishMatch ? "text-green-700" : "text-red-700"}>
            Английский
          </span>
        </div>
        <div className="flex items-center gap-2">
          {matchDetails.budgetMatch ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
          <span className={matchDetails.budgetMatch ? "text-green-700" : "text-red-700"}>
            Бюджет
          </span>
        </div>
        <div className="flex items-center gap-2">
          {matchDetails.standardizedTestMatch ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
          <span
            className={
              matchDetails.standardizedTestMatch ? "text-green-700" : "text-red-700"
            }
          >
            Тесты
          </span>
        </div>
      </div>

      {/* Footer with details */}
      <div className="border-t pt-4 flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4" />
          <span>{university.level}</span>
        </div>
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          <span>${university.requirements.tuitionUSD.toLocaleString()}/год</span>
        </div>
      </div>

      {/* Disciplines */}
      <div className="mt-3 flex flex-wrap gap-2">
        {university.disciplines.map((disc) => (
          <Badge key={disc} variant="outline" className="text-xs">
            {disc}
          </Badge>
        ))}
      </div>
    </Card>
  );
}
