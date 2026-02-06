"use client";

import { WizardFormData } from "@/lib/wizard-types";
import { Card } from "./ui/card";
import { User, GraduationCap, FileText, DollarSign, Globe } from "lucide-react";

interface WizardSummaryProps {
  formData: WizardFormData;
}

export function WizardSummary({ formData }: WizardSummaryProps) {
  const displayNationality = 
    formData.nationality === "Other" && formData.specifyNationality
      ? formData.specifyNationality
      : formData.nationality;

  const gradingDisplay = () => {
    if (formData.gradingScheme === "Percentage") {
      return `${formData.gradingAverage}%`;
    }
    return `${formData.gradingAverage} (${formData.gradingScheme})`;
  };

  return (
    <Card className="p-6 bg-blue-50 border-blue-200 mb-6">
      <h2 className="text-xl font-bold mb-4 text-gray-900">Ваш профиль</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Academic Profile */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Академический профиль</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Гражданство:</span>{" "}
              <span className="font-medium">{displayNationality}</span>
            </div>
            <div>
              <span className="text-gray-600">Уровень:</span>{" "}
              <span className="font-medium">{formData.level}</span>
            </div>
            <div>
              <span className="text-gray-600">Средний балл:</span>{" "}
              <span className="font-medium">{gradingDisplay()}</span>
            </div>
          </div>
        </div>

        {/* Test Scores */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Результаты тестов</h3>
          </div>
          <div className="space-y-2 text-sm">
            {formData.englishExamType && formData.englishExamType !== "None" ? (
              <div>
                <span className="text-gray-600">{formData.englishExamType}:</span>{" "}
                <span className="font-medium">{formData.englishScore}</span>
              </div>
            ) : (
              <div className="text-gray-500">Нет результатов английского</div>
            )}
            {formData.standardizedExamType && formData.standardizedExamType !== "None" ? (
              <div>
                <span className="text-gray-600">{formData.standardizedExamType}:</span>{" "}
                {formData.standardizedExamType === "GRE" ? (
                  <span className="font-medium">
                    V:{formData.greVerbal} Q:{formData.greQuant} W:{formData.greWriting}
                  </span>
                ) : (
                  <span className="font-medium">{formData.gmatTotal}</span>
                )}
              </div>
            ) : (
              <div className="text-gray-500">Нет стандартизированных тестов</div>
            )}
          </div>
        </div>

        {/* Financial Profile */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Финансовый профиль</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Источник финансирования:</span>{" "}
              <span className="font-medium">{formData.financeSource}</span>
            </div>
            <div>
              <span className="text-gray-600">Бюджет:</span>{" "}
              <span className="font-medium">{formData.budget}</span>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Globe className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Предпочтения</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Страна:</span>{" "}
              <span className="font-medium">
                {formData.countryOfStudy === "Any" ? "Любая" : formData.countryOfStudy}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Направление:</span>{" "}
              <span className="font-medium">{formData.discipline}</span>
            </div>
            {formData.course && (
              <div>
                <span className="text-gray-600">Курс:</span>{" "}
                <span className="font-medium">{formData.course}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
