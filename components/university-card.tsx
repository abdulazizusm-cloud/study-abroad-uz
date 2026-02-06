import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoringResult } from "@/lib/types";
import { MapPin, CheckCircle2, TrendingDown, Calculator } from "lucide-react";

interface UniversityCardProps {
  result: ScoringResult;
  proResult?: ScoringResult;
}

export function UniversityCard({ result, proResult }: UniversityCardProps) {
  const { university, percentage, chanceLevel, explanation } = result;

  const getBadgeConfig = (level: string) => {
    switch (level) {
      case "High":
        return {
          className: "bg-green-100 text-green-800 border border-green-200",
          text: "Высокие шансы"
        };
      case "Medium":
        return {
          className: "bg-yellow-100 text-yellow-800 border border-yellow-200",
          text: "Средние шансы"
        };
      case "Low":
        return {
          className: "bg-orange-100 text-orange-800 border border-orange-200",
          text: "Низкие шансы"
        };
      default:
        return {
          className: "bg-gray-100 text-gray-800 border border-gray-200",
          text: level
        };
    }
  };

  const getProgressColor = (level: string) => {
    switch (level) {
      case "High":
        return "bg-green-500";
      case "Medium":
        return "bg-yellow-500";
      case "Low":
        return "bg-orange-500";
      default:
        return "bg-gray-400";
    }
  };

  const badgeConfig = getBadgeConfig(chanceLevel);

  return (
    <Card className="group p-6 bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-blue-200 hover:transform hover:scale-[1.02]">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
            {university.name}
          </h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">
                {university.city}, {university.country}
              </span>
            </div>
            <div className="inline-flex items-center gap-2 text-sm">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                {university.level}
              </span>
            </div>
          </div>
        </div>
        <Badge className={`${badgeConfig.className} px-4 py-2 text-sm font-semibold`}>
          {badgeConfig.text}
        </Badge>
      </div>

      {/* Percentage - Show both Simple and Pro */}
      <div className="mb-6 space-y-4">
        {/* Simple Result */}
        <div className="bg-blue-50 rounded-2xl p-5 border-2 border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <p className="text-sm font-bold text-blue-900">Simple</p>
            </div>
            <div className="text-4xl font-bold text-blue-600">
              {percentage}%
            </div>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-3 bg-blue-600 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <p className="text-xs text-blue-700 mt-2">
            {explanation}
          </p>
        </div>

        {/* Pro Result */}
        {proResult && (
          <div className="bg-purple-50 rounded-2xl p-5 border-2 border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-purple-600" />
                <p className="text-sm font-bold text-purple-900">Pro (реалистичный)</p>
              </div>
              <div className="text-4xl font-bold text-purple-600">
                {proPercentage}%
              </div>
            </div>
            <div className="w-full bg-purple-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 bg-purple-600 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${proPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-purple-700 mt-2">
              {proResult.explanation}
            </p>
          </div>
        )}
      </div>


      {/* Details - Enhanced */}
      <div className="pt-5 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 mb-1">Стоимость в год</p>
            <p className="text-lg font-bold text-gray-900">
              ${university.requirements.tuitionUSD.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Min GPA</p>
            <p className="text-lg font-bold text-gray-900">
              {university.requirements.minGPA}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}
