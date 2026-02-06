"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FormDataType {
  // Step 1
  nationality: string;
  specifyNationality?: string;
  countryOfStudy: string;
  level: string;
  gradingScheme: string;
  gradingAverage: string;
  financeSource: string;
  budget: string;
  // Step 2 - English Tests
  englishExamType: string;
  // IELTS
  ieltsOverall?: string;
  ieltsListening?: string;
  ieltsReading?: string;
  ieltsWriting?: string;
  ieltsSpeaking?: string;
  // Duolingo
  duolingoOverall?: string;
  duolingoLiteracy?: string;
  duolingoComprehension?: string;
  duolingoConversation?: string;
  duolingoProduction?: string;
  // TOEFL
  toeflTotal?: string;
  toeflReading?: string;
  toeflListening?: string;
  toeflSpeaking?: string;
  toeflWriting?: string;
  // Standardized Tests
  standardizedExamType: string;
  // GRE
  greVerbal?: string;
  greQuant?: string;
  greWriting?: string;
  greTotal?: string;
  // GMAT
  gmatTotal?: string;
  gmatVerbal?: string;
  gmatQuant?: string;
  // Step 3
  discipline: string;
  course?: string;
}

export function WizardForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormDataType>({
    nationality: "",
    countryOfStudy: "",
    level: "",
    gradingScheme: "",
    gradingAverage: "",
    financeSource: "",
    budget: "",
    englishExamType: "None",
    standardizedExamType: "None",
    discipline: "",
  });

  const updateField = (field: keyof FormDataType, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Step 1 validation
  const isStep1Valid = () => {
    const required = [
      formData.nationality,
      formData.countryOfStudy,
      formData.level,
      formData.gradingScheme,
      formData.gradingAverage,
      formData.financeSource,
      formData.budget,
    ];

    // Check if "Other" nationality requires specification
    if (formData.nationality === "Other" && !formData.specifyNationality) {
      return false;
    }

    return required.every((field) => field !== "");
  };

  // Step 2 validation
  const isStep2Valid = () => {
    // IELTS validation
    if (formData.englishExamType === "IELTS") {
      const required = [
        formData.ieltsOverall,
        formData.ieltsListening,
        formData.ieltsReading,
        formData.ieltsWriting,
        formData.ieltsSpeaking,
      ];
      if (required.some((field) => !field)) return false;
    }
    
    // Duolingo validation
    if (formData.englishExamType === "Duolingo") {
      if (!formData.duolingoOverall) return false;
    }
    
    // TOEFL validation
    if (formData.englishExamType === "TOEFL") {
      const required = [
        formData.toeflTotal,
        formData.toeflReading,
        formData.toeflListening,
        formData.toeflSpeaking,
        formData.toeflWriting,
      ];
      if (required.some((field) => !field)) return false;
    }
    
    // GRE validation
    if (formData.standardizedExamType === "GRE") {
      const required = [
        formData.greVerbal,
        formData.greQuant,
        formData.greWriting,
      ];
      if (required.some((field) => !field)) return false;
    }
    
    // GMAT validation
    if (formData.standardizedExamType === "GMAT") {
      if (!formData.gmatTotal) return false;
    }
    
    return true;
  };

  // Step 3 validation
  const isStep3Valid = () => {
    return formData.discipline !== "";
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!isStep3Valid()) {
      alert("Пожалуйста, выберите направление обучения");
      return;
    }

    // Convert form data to WizardFormData format
    const wizardData = {
      // Step 1
      nationality: formData.nationality,
      specifyNationality: formData.specifyNationality,
      countryOfStudy: formData.countryOfStudy,
      level: formData.level,
      gradingScheme: formData.gradingScheme,
      gradingAverage: formData.gradingAverage,
      financeSource: formData.financeSource,
      budget: formData.budget,
      
      // Step 2 - English
      englishExamType: formData.englishExamType,
      englishScore: 
        formData.englishExamType === "IELTS" ? formData.ieltsOverall :
        formData.englishExamType === "TOEFL" ? formData.toeflTotal :
        formData.englishExamType === "Duolingo" ? formData.duolingoOverall :
        undefined,
      
      // Step 2 - Standardized tests
      standardizedExamType: formData.standardizedExamType,
      greVerbal: formData.greVerbal,
      greQuant: formData.greQuant,
      greWriting: formData.greWriting,
      gmatTotal: formData.gmatTotal,
      
      // Step 3
      discipline: formData.discipline,
      course: formData.course,
    };

    console.log("Submitting wizard data:", wizardData);
    
    // Save to localStorage
    localStorage.setItem("wizardFormData", JSON.stringify(wizardData));
    
    // Navigate to results page
    router.push("/wizard-results");
  };

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-2 bg-blue-100 rounded-full mb-4">
            <span className="text-sm font-semibold text-blue-700">
              Шаг {currentStep} из 3
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Анкета проверки шансов
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Заполните информацию о себе для получения персонального подбора университетов
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 sm:p-12">

          {/* STEP 1 - BASIC INFORMATION */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-blue-100">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">1</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Основная информация</h3>
                  <p className="text-sm text-gray-600">Базовые данные о вас и ваших планах</p>
                </div>
              </div>

          {/* Nationality */}
          <div>
            <Label htmlFor="nationality" className="text-base font-semibold text-gray-700">
              Гражданство <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.nationality}
              onValueChange={(value) => {
                updateField("nationality", value);
                // Clear specify nationality if not "Other"
                if (value !== "Other") {
                  updateField("specifyNationality", "");
                }
              }}
            >
            <SelectTrigger id="nationality" className="h-12 text-base border-2">
              <SelectValue placeholder="Выберите гражданство" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Uzbekistan">Узбекистан</SelectItem>
                <SelectItem value="Kazakhstan">Казахстан</SelectItem>
                <SelectItem value="Tajikistan">Таджикистан</SelectItem>
                <SelectItem value="Kyrgyzstan">Кыргызстан</SelectItem>
                <SelectItem value="Turkmenistan">Туркменистан</SelectItem>
                <SelectItem value="Other">Другое</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Specify Nationality (conditional) */}
          {formData.nationality === "Other" && (
            <div className="animate-fade-in">
              <Label htmlFor="specifyNationality" className="text-base font-semibold text-gray-700">
                Укажите гражданство <span className="text-red-500">*</span>
              </Label>
              <Input
                id="specifyNationality"
                value={formData.specifyNationality || ""}
                onChange={(e) =>
                  updateField("specifyNationality", e.target.value)
                }
                placeholder="Введите ваше гражданство"
                className="h-12 text-base border-2 mt-2"
              />
            </div>
          )}

          {/* Country of Study */}
          <div>
            <Label htmlFor="countryOfStudy" className="text-base font-semibold text-gray-700">
              Страна обучения <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.countryOfStudy}
              onValueChange={(value) => updateField("countryOfStudy", value)}
            >
              <SelectTrigger id="countryOfStudy" className="h-12 text-base border-2 mt-2">
                <SelectValue placeholder="Выберите страну" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USA">США</SelectItem>
                <SelectItem value="UK">Великобритания</SelectItem>
                <SelectItem value="Canada">Канада</SelectItem>
                <SelectItem value="Australia">Австралия</SelectItem>
                <SelectItem value="Germany">Германия</SelectItem>
                <SelectItem value="Turkey">Турция</SelectItem>
                <SelectItem value="Korea">Южная Корея</SelectItem>
                <SelectItem value="Poland">Польша</SelectItem>
                <SelectItem value="Czech">Чехия</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Level Searching For */}
          <div>
            <Label htmlFor="level" className="text-base font-semibold text-gray-700">
              Уровень обучения <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.level}
              onValueChange={(value) => updateField("level", value)}
            >
              <SelectTrigger id="level" className="h-12 text-base border-2 mt-2">
                <SelectValue placeholder="Выберите уровень" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bachelor">Бакалавриат</SelectItem>
                <SelectItem value="Master">Магистратура</SelectItem>
                <SelectItem value="Foundation">Foundation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grading Scheme */}
          <div>
            <Label htmlFor="gradingScheme" className="text-base font-semibold text-gray-700">
              Система оценивания <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.gradingScheme}
              onValueChange={(value) => updateField("gradingScheme", value)}
            >
              <SelectTrigger id="gradingScheme" className="h-12 text-base border-2 mt-2">
                <SelectValue placeholder="Выберите систему" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5-point">5-балльная</SelectItem>
                <SelectItem value="4-point">4-балльная (GPA)</SelectItem>
                <SelectItem value="Percentage">Процентная (0–100)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Grading Average */}
          <div>
            <Label htmlFor="gradingAverage" className="text-base font-semibold text-gray-700">
              Средний балл <span className="text-red-500">*</span>
            </Label>
            <Input
              id="gradingAverage"
              type="number"
              step={formData.gradingScheme === "Percentage" ? "1" : "0.1"}
              min="0"
              max={
                formData.gradingScheme === "5-point" ? "5" :
                formData.gradingScheme === "4-point" ? "4" :
                formData.gradingScheme === "Percentage" ? "100" : "5"
              }
              value={formData.gradingAverage}
              onChange={(e) => updateField("gradingAverage", e.target.value)}
              placeholder={
                formData.gradingScheme === "5-point" ? "Например: 4.5" :
                formData.gradingScheme === "4-point" ? "Например: 3.5" :
                formData.gradingScheme === "Percentage" ? "Например: 85" :
                "Выберите систему оценивания"
              }
              className="h-12 text-base border-2 mt-2"
            />
            <p className="text-sm text-gray-500 mt-2">
              {formData.gradingScheme === "5-point" && "Диапазон: 0.0 - 5.0"}
              {formData.gradingScheme === "4-point" && "Диапазон: 0.0 - 4.0"}
              {formData.gradingScheme === "Percentage" && "Диапазон: 0 - 100"}
            </p>
          </div>

          {/* Finance Source */}
          <div>
            <Label htmlFor="financeSource" className="text-base font-semibold text-gray-700">
              Источник финансирования <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.financeSource}
              onValueChange={(value) => updateField("financeSource", value)}
            >
              <SelectTrigger id="financeSource" className="h-12 text-base border-2 mt-2">
                <SelectValue placeholder="Выберите источник" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Self">Самостоятельно</SelectItem>
                <SelectItem value="Parents">Родители</SelectItem>
                <SelectItem value="Scholarship">Стипендия</SelectItem>
                <SelectItem value="Sponsor">Спонсор</SelectItem>
                <SelectItem value="Loan">Кредит</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Budget */}
          <div>
            <Label htmlFor="budget" className="text-base font-semibold text-gray-700">
              Годовой бюджет <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.budget}
              onValueChange={(value) => updateField("budget", value)}
            >
              <SelectTrigger id="budget" className="h-12 text-base border-2 mt-2">
                <SelectValue placeholder="Выберите диапазон" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Up to $5,000">до $5,000</SelectItem>
                <SelectItem value="$5,000–$10,000">$5,000–$10,000</SelectItem>
                <SelectItem value="$10,000–$20,000">$10,000–$20,000</SelectItem>
                <SelectItem value="$20,000+">$20,000+</SelectItem>
              </SelectContent>
            </Select>
          </div>

              <div className="pt-6 border-t border-gray-200">
                <Button 
                  onClick={handleNext} 
                  disabled={!isStep1Valid()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl font-semibold"
                >
                  Продолжить →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2 - EXAMS */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-blue-100">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">2</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Тесты и экзамены</h3>
                  <p className="text-sm text-gray-600">Информация о языковых и академических тестах</p>
                </div>
              </div>

          {/* English Exam Type */}
          <div>
            <Label htmlFor="englishExamType" className="text-base font-semibold text-gray-700">
              Тест по английскому языку
            </Label>
            <Select
              value={formData.englishExamType}
              onValueChange={(value) => {
                updateField("englishExamType", value);
              }}
            >
              <SelectTrigger id="englishExamType" className="h-12 text-base border-2 mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">Нет</SelectItem>
                <SelectItem value="IELTS">IELTS</SelectItem>
                <SelectItem value="TOEFL">TOEFL iBT</SelectItem>
                <SelectItem value="Duolingo">Duolingo English Test</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* IELTS Scores */}
          {formData.englishExamType === "IELTS" && (
            <div className="animate-fade-in space-y-6 p-6 bg-white rounded-xl border-2 border-gray-200">
              <h4 className="font-bold text-lg text-gray-900">IELTS баллы</h4>
              
              <div>
                <Label htmlFor="ieltsOverall" className="text-base font-semibold text-gray-700">
                  Overall Band Score <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ieltsOverall"
                  type="number"
                  step="0.5"
                  min="0"
                  max="9"
                  value={formData.ieltsOverall || ""}
                  onChange={(e) => updateField("ieltsOverall", e.target.value)}
                  placeholder="0.0 - 9.0"
                  className="h-12 text-base border-2 mt-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ieltsListening" className="text-base font-semibold text-gray-700">
                    Listening <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ieltsListening"
                    type="number"
                    step="0.5"
                    min="0"
                    max="9"
                    value={formData.ieltsListening || ""}
                    onChange={(e) => updateField("ieltsListening", e.target.value)}
                    placeholder="0.0 - 9.0"
                    className="h-12 text-base border-2 mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="ieltsReading" className="text-base font-semibold text-gray-700">
                    Reading <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ieltsReading"
                    type="number"
                    step="0.5"
                    min="0"
                    max="9"
                    value={formData.ieltsReading || ""}
                    onChange={(e) => updateField("ieltsReading", e.target.value)}
                    placeholder="0.0 - 9.0"
                    className="h-12 text-base border-2 mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="ieltsWriting" className="text-base font-semibold text-gray-700">
                    Writing <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ieltsWriting"
                    type="number"
                    step="0.5"
                    min="0"
                    max="9"
                    value={formData.ieltsWriting || ""}
                    onChange={(e) => updateField("ieltsWriting", e.target.value)}
                    placeholder="0.0 - 9.0"
                    className="h-12 text-base border-2 mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="ieltsSpeaking" className="text-base font-semibold text-gray-700">
                    Speaking <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="ieltsSpeaking"
                    type="number"
                    step="0.5"
                    min="0"
                    max="9"
                    value={formData.ieltsSpeaking || ""}
                    onChange={(e) => updateField("ieltsSpeaking", e.target.value)}
                    placeholder="0.0 - 9.0"
                    className="h-12 text-base border-2 mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Duolingo Scores */}
          {formData.englishExamType === "Duolingo" && (
            <div className="animate-fade-in space-y-6 p-6 bg-white rounded-xl border-2 border-gray-200">
              <h4 className="font-bold text-lg text-gray-900">Duolingo English Test баллы</h4>
              
              <div>
                <Label htmlFor="duolingoOverall" className="text-base font-semibold text-gray-700">
                  Overall Score <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="duolingoOverall"
                  type="number"
                  min="10"
                  max="160"
                  value={formData.duolingoOverall || ""}
                  onChange={(e) => updateField("duolingoOverall", e.target.value)}
                  placeholder="10 - 160"
                  className="h-12 text-base border-2 mt-2"
                />
              </div>

              <p className="text-sm text-gray-600 font-semibold">Опционально (но рекомендуется):</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duolingoLiteracy" className="text-base font-semibold text-gray-700">
                    Literacy
                  </Label>
                  <Input
                    id="duolingoLiteracy"
                    type="number"
                    min="10"
                    max="160"
                    value={formData.duolingoLiteracy || ""}
                    onChange={(e) => updateField("duolingoLiteracy", e.target.value)}
                    placeholder="10 - 160"
                    className="h-12 text-base border-2 mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="duolingoComprehension" className="text-base font-semibold text-gray-700">
                    Comprehension
                  </Label>
                  <Input
                    id="duolingoComprehension"
                    type="number"
                    min="10"
                    max="160"
                    value={formData.duolingoComprehension || ""}
                    onChange={(e) => updateField("duolingoComprehension", e.target.value)}
                    placeholder="10 - 160"
                    className="h-12 text-base border-2 mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="duolingoConversation" className="text-base font-semibold text-gray-700">
                    Conversation
                  </Label>
                  <Input
                    id="duolingoConversation"
                    type="number"
                    min="10"
                    max="160"
                    value={formData.duolingoConversation || ""}
                    onChange={(e) => updateField("duolingoConversation", e.target.value)}
                    placeholder="10 - 160"
                    className="h-12 text-base border-2 mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="duolingoProduction" className="text-base font-semibold text-gray-700">
                    Production
                  </Label>
                  <Input
                    id="duolingoProduction"
                    type="number"
                    min="10"
                    max="160"
                    value={formData.duolingoProduction || ""}
                    onChange={(e) => updateField("duolingoProduction", e.target.value)}
                    placeholder="10 - 160"
                    className="h-12 text-base border-2 mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TOEFL Scores */}
          {formData.englishExamType === "TOEFL" && (
            <div className="animate-fade-in space-y-6 p-6 bg-white rounded-xl border-2 border-gray-200">
              <h4 className="font-bold text-lg text-gray-900">TOEFL iBT баллы</h4>
              
              <div>
                <Label htmlFor="toeflTotal" className="text-base font-semibold text-gray-700">
                  Total Score <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="toeflTotal"
                  type="number"
                  min="0"
                  max="120"
                  value={formData.toeflTotal || ""}
                  onChange={(e) => updateField("toeflTotal", e.target.value)}
                  placeholder="0 - 120"
                  className="h-12 text-base border-2 mt-2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="toeflReading" className="text-base font-semibold text-gray-700">
                    Reading <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="toeflReading"
                    type="number"
                    min="0"
                    max="30"
                    value={formData.toeflReading || ""}
                    onChange={(e) => updateField("toeflReading", e.target.value)}
                    placeholder="0 - 30"
                    className="h-12 text-base border-2 mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="toeflListening" className="text-base font-semibold text-gray-700">
                    Listening <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="toeflListening"
                    type="number"
                    min="0"
                    max="30"
                    value={formData.toeflListening || ""}
                    onChange={(e) => updateField("toeflListening", e.target.value)}
                    placeholder="0 - 30"
                    className="h-12 text-base border-2 mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="toeflSpeaking" className="text-base font-semibold text-gray-700">
                    Speaking <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="toeflSpeaking"
                    type="number"
                    min="0"
                    max="30"
                    value={formData.toeflSpeaking || ""}
                    onChange={(e) => updateField("toeflSpeaking", e.target.value)}
                    placeholder="0 - 30"
                    className="h-12 text-base border-2 mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="toeflWriting" className="text-base font-semibold text-gray-700">
                    Writing <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="toeflWriting"
                    type="number"
                    min="0"
                    max="30"
                    value={formData.toeflWriting || ""}
                    onChange={(e) => updateField("toeflWriting", e.target.value)}
                    placeholder="0 - 30"
                    className="h-12 text-base border-2 mt-2"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Standardized Exam */}
          <div className="mt-8">
            <Label htmlFor="standardizedExamType" className="text-base font-semibold text-gray-700">
              Академический тест (GRE/GMAT)
            </Label>
            <Select
              value={formData.standardizedExamType}
              onValueChange={(value) => {
                updateField("standardizedExamType", value);
              }}
            >
              <SelectTrigger id="standardizedExamType" className="h-12 text-base border-2 mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="None">Нет</SelectItem>
                <SelectItem value="GRE">GRE</SelectItem>
                <SelectItem value="GMAT">GMAT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* GRE Scores */}
          {formData.standardizedExamType === "GRE" && (
            <div className="animate-fade-in space-y-6 p-6 bg-white rounded-xl border-2 border-gray-200">
              <h4 className="font-bold text-lg text-gray-900">GRE баллы</h4>

              <div>
                <Label htmlFor="greTotal" className="text-base font-semibold text-gray-700">
                  Total Score (опционально)
                </Label>
                <Input
                  id="greTotal"
                  type="number"
                  min="260"
                  max="340"
                  value={formData.greTotal || ""}
                  onChange={(e) => updateField("greTotal", e.target.value)}
                  placeholder="260 - 340"
                  className="h-12 text-base border-2 mt-2"
                />
                <p className="text-sm text-gray-500 mt-1">Можно рассчитать автоматически из Verbal + Quantitative</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="greVerbal" className="text-base font-semibold text-gray-700">
                    Verbal Reasoning <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="greVerbal"
                    type="number"
                    min="130"
                    max="170"
                    value={formData.greVerbal || ""}
                    onChange={(e) => updateField("greVerbal", e.target.value)}
                    placeholder="130 - 170"
                    className="h-12 text-base border-2 mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="greQuant" className="text-base font-semibold text-gray-700">
                    Quantitative Reasoning <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="greQuant"
                    type="number"
                    min="130"
                    max="170"
                    value={formData.greQuant || ""}
                    onChange={(e) => updateField("greQuant", e.target.value)}
                    placeholder="130 - 170"
                    className="h-12 text-base border-2 mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="greWriting" className="text-base font-semibold text-gray-700">
                  Analytical Writing <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="greWriting"
                  type="number"
                  step="0.5"
                  min="0"
                  max="6"
                  value={formData.greWriting || ""}
                  onChange={(e) => updateField("greWriting", e.target.value)}
                  placeholder="0.0 - 6.0"
                  className="h-12 text-base border-2 mt-2"
                />
              </div>
            </div>
          )}

          {/* GMAT Scores */}
          {formData.standardizedExamType === "GMAT" && (
            <div className="animate-fade-in space-y-6 p-6 bg-white rounded-xl border-2 border-gray-200">
              <h4 className="font-bold text-lg text-gray-900">GMAT баллы</h4>

              <div>
                <Label htmlFor="gmatTotal" className="text-base font-semibold text-gray-700">
                  Total Score <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="gmatTotal"
                  type="number"
                  min="200"
                  max="800"
                  value={formData.gmatTotal || ""}
                  onChange={(e) => updateField("gmatTotal", e.target.value)}
                  placeholder="200 - 800"
                  className="h-12 text-base border-2 mt-2"
                />
              </div>
            </div>
          )}

              <div className="pt-6 border-t border-gray-200 flex gap-4">
                <Button 
                  onClick={handleBack} 
                  variant="outline"
                  className="flex-1 py-6 rounded-xl font-semibold"
                >
                  ← Назад
                </Button>
                <Button 
                  onClick={handleNext} 
                  disabled={!isStep2Valid()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl font-semibold"
                >
                  Продолжить →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 - FIELD OF STUDY */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b-2 border-blue-100">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">3</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Направление обучения</h3>
                  <p className="text-sm text-gray-600">Выберите область и программу</p>
                </div>
              </div>

          {/* Discipline */}
          <div>
            <Label className="text-base font-semibold text-gray-700 mb-4 block">
              Направление <span className="text-red-500">*</span>
            </Label>
            <p className="text-sm text-gray-500 mb-2">Выбрано: {formData.discipline || "Ничего не выбрано"}</p>
            <RadioGroup
              value={formData.discipline}
              onValueChange={(value) => {
                console.log("Selected discipline:", value);
                updateField("discipline", value);
              }}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <RadioGroupItem value="Business" id="business" />
                <Label htmlFor="business" className="cursor-pointer flex-1">Бизнес</Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <RadioGroupItem value="Education" id="education" />
                <Label htmlFor="education" className="cursor-pointer flex-1">Образование</Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <RadioGroupItem value="Engineering" id="engineering" />
                <Label htmlFor="engineering" className="cursor-pointer flex-1">Инженерия</Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <RadioGroupItem value="Nursing" id="nursing" />
                <Label htmlFor="nursing" className="cursor-pointer flex-1">Медицина/Уход</Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <RadioGroupItem value="Science" id="science" />
                <Label htmlFor="science" className="cursor-pointer flex-1">Естественные науки</Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                <RadioGroupItem value="Social Science" id="social-science" />
                <Label htmlFor="social-science" className="cursor-pointer flex-1">Социальные науки</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Course */}
          <div>
            <Label htmlFor="course" className="text-base font-semibold text-gray-700">
              Программа/Курс (необязательно)
            </Label>
            <Input
              id="course"
              value={formData.course || ""}
              onChange={(e) => updateField("course", e.target.value)}
              placeholder="Например: Computer Science, MBA"
              className="h-12 text-base border-2 mt-2"
            />
          </div>

              <div className="pt-6 border-t border-gray-200 flex gap-4">
                <Button 
                  onClick={handleBack} 
                  variant="outline"
                  className="flex-1 py-6 rounded-xl font-semibold"
                >
                  ← Назад
                </Button>
                <Button 
                  onClick={(e) => {
                    e.preventDefault();
                    console.log("Submit clicked, discipline:", formData.discipline);
                    handleSubmit();
                  }} 
                  disabled={!isStep3Valid()}
                  type="button"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Получить результаты
                  {!isStep3Valid() && " (выберите направление)"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
