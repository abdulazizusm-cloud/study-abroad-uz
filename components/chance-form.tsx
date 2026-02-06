"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
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
import { FormData } from "@/lib/types";
import { 
  Globe, 
  GraduationCap, 
  Languages, 
  DollarSign, 
  TrendingUp,
  MapPin,
  User
} from "lucide-react";

export function ChanceForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<FormData>>({
    citizenship: "Узбекистан",
    english: "Нет",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.country) {
      newErrors.country = "Выберите страну обучения";
    }
    if (!formData.level) {
      newErrors.level = "Выберите уровень обучения";
    }
    if (!formData.gpa || formData.gpa <= 0) {
      newErrors.gpa = "Введите корректный средний балл";
    }
    if (!formData.english) {
      newErrors.english = "Выберите уровень английского";
    }
    if (
      ["IELTS", "TOEFL", "GRE", "GMAT"].includes(formData.english || "") &&
      !formData.englishScore
    ) {
      newErrors.englishScore = "Введите балл теста";
    }
    if (!formData.budget) {
      newErrors.budget = "Выберите бюджет";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    // Save to localStorage
    localStorage.setItem("formData", JSON.stringify(formData));

    // Navigate to results
    router.push("/results");
  };

  const showEnglishScore =
    formData.english === "IELTS" || 
    formData.english === "TOEFL" || 
    formData.english === "GRE" || 
    formData.english === "GMAT";

  // Calculate progress
  const progress = useMemo(() => {
    const fields = [
      formData.country,
      formData.level,
      formData.gpa,
      formData.english,
      formData.budget,
    ];
    if (showEnglishScore) {
      fields.push(formData.englishScore);
    }
    const filled = fields.filter(Boolean).length;
    return (filled / fields.length) * 100;
  }, [formData, showEnglishScore]);

  return (
    <section id="form-section" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Анкета проверки шансов
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Заполните информацию о себе для получения персонального подбора университетов
          </p>
        </div>

        <Card className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Progress Bar - Top */}
          <div className="bg-gray-50 px-8 py-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-semibold text-gray-700">Прогресс заполнения анкеты</span>
              <span className="text-sm font-bold text-blue-600">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 sm:p-12">
            <div className="space-y-10">
              {/* Section 1: Personal Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b-2 border-blue-100">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Личная информация</h3>
                    <p className="text-sm text-gray-600">Укажите ваше гражданство</p>
                  </div>
                </div>

                {/* Citizenship */}
                <div className="space-y-3">
                  <Label htmlFor="citizenship" className="text-base font-semibold text-gray-700">
                    Гражданство
                  </Label>
                  <Select
                    value={formData.citizenship}
                    onValueChange={(value) => updateField("citizenship", value)}
                  >
                    <SelectTrigger id="citizenship" className="h-12 text-base border-2 hover:border-blue-300 transition-colors">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Узбекистан">Узбекистан</SelectItem>
                      <SelectItem value="Казахстан">Казахстан</SelectItem>
                      <SelectItem value="Кыргызстан">Кыргызстан</SelectItem>
                      <SelectItem value="Другое">Другое</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Section 2: Study Preferences */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b-2 border-blue-100">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Параметры обучения</h3>
                    <p className="text-sm text-gray-600">Выберите страну и уровень образования</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Country */}
                  <div className="space-y-3">
                    <Label htmlFor="country" className="text-base font-semibold text-gray-700">
                      Страна обучения <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => updateField("country", value)}
                    >
                      <SelectTrigger
                        id="country"
                        className={`h-12 text-base border-2 hover:border-blue-300 transition-colors ${
                          errors.country ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Выберите страну" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Турция">Турция</SelectItem>
                        <SelectItem value="Южная Корея">Южная Корея</SelectItem>
                        <SelectItem value="Польша">Польша</SelectItem>
                        <SelectItem value="Чехия">Чехия</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.country && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.country}
                      </p>
                    )}
                  </div>

                  {/* Level */}
                  <div className="space-y-3">
                    <Label htmlFor="level" className="text-base font-semibold text-gray-700">
                      Уровень обучения <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.level}
                      onValueChange={(value) => updateField("level", value)}
                    >
                      <SelectTrigger
                        id="level"
                        className={`h-12 text-base border-2 hover:border-blue-300 transition-colors ${
                          errors.level ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue placeholder="Выберите уровень" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Foundation">Foundation</SelectItem>
                        <SelectItem value="Бакалавриат">Бакалавриат</SelectItem>
                        <SelectItem value="Магистратура">Магистратура</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.level && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.level}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Academic Profile */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b-2 border-blue-100">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Академическая информация</h3>
                    <p className="text-sm text-gray-600">Укажите ваши академические достижения</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* GPA */}
                  <div className="space-y-3">
                    <Label htmlFor="gpa" className="text-base font-semibold text-gray-700">
                      GPA / Средний балл <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="gpa"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      placeholder="Например: 3.5"
                      value={formData.gpa || ""}
                      onChange={(e) =>
                        updateField("gpa", parseFloat(e.target.value) || 0)
                      }
                      className={`h-12 text-base border-2 hover:border-blue-300 transition-colors ${
                        errors.gpa ? "border-red-500" : ""
                      }`}
                    />
                    {errors.gpa && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.gpa}
                      </p>
                    )}
                  </div>

                  {/* English / Test Scores */}
                  <div className="space-y-3">
                    <Label htmlFor="english" className="text-base font-semibold text-gray-700">
                      Языковые/Академические тесты <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.english}
                      onValueChange={(value) => {
                        updateField("english", value);
                        // Clear score if changing away from tests that require scores
                        if (!["IELTS", "TOEFL", "GRE", "GMAT"].includes(value)) {
                          setFormData((prev) => ({ ...prev, englishScore: undefined }));
                        }
                      }}
                    >
                      <SelectTrigger
                        id="english"
                        className={`h-12 text-base border-2 hover:border-blue-300 transition-colors ${
                          errors.english ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Нет">Нет сертификата</SelectItem>
                        <SelectItem value="IELTS">IELTS</SelectItem>
                        <SelectItem value="TOEFL">TOEFL</SelectItem>
                        <SelectItem value="GRE">GRE</SelectItem>
                        <SelectItem value="GMAT">GMAT</SelectItem>
                        <SelectItem value="A2">Уровень A2</SelectItem>
                        <SelectItem value="B1">Уровень B1</SelectItem>
                        <SelectItem value="B2">Уровень B2</SelectItem>
                        <SelectItem value="C1">Уровень C1</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.english && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.english}
                      </p>
                    )}
                  </div>
                </div>

                {/* Test Score (conditional) - full width within section */}
                {showEnglishScore && (
                  <div className="space-y-3 animate-fade-in">
                    <Label htmlFor="englishScore" className="text-base font-semibold text-gray-700">
                      {formData.english === "IELTS" && "IELTS Overall Band"}
                      {formData.english === "TOEFL" && "TOEFL Overall Score"}
                      {formData.english === "GRE" && "GRE Total Score"}
                      {formData.english === "GMAT" && "GMAT Total Score"}
                      {" "}<span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="englishScore"
                      type="number"
                      step={formData.english === "IELTS" ? "0.5" : "1"}
                      min="0"
                      max={
                        formData.english === "IELTS" ? "9" :
                        formData.english === "TOEFL" ? "120" :
                        formData.english === "GRE" ? "340" :
                        formData.english === "GMAT" ? "800" : "120"
                      }
                      placeholder={
                        formData.english === "IELTS" ? "Например: 6.5" :
                        formData.english === "TOEFL" ? "Например: 85" :
                        formData.english === "GRE" ? "Например: 310" :
                        formData.english === "GMAT" ? "Например: 650" : ""
                      }
                      value={formData.englishScore || ""}
                      onChange={(e) =>
                        updateField("englishScore", parseFloat(e.target.value) || 0)
                      }
                      className={`h-12 text-base border-2 hover:border-blue-300 transition-colors ${
                        errors.englishScore ? "border-red-500" : ""
                      }`}
                    />
                    <p className="text-sm text-gray-500">
                      {formData.english === "IELTS" && "Укажите общий балл IELTS (от 0 до 9)"}
                      {formData.english === "TOEFL" && "Укажите общий балл TOEFL (от 0 до 120)"}
                      {formData.english === "GRE" && "Укажите общий балл GRE (от 260 до 340)"}
                      {formData.english === "GMAT" && "Укажите общий балл GMAT (от 200 до 800)"}
                    </p>
                    {errors.englishScore && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.englishScore}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Section 4: Financial Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b-2 border-blue-100">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Финансовая информация</h3>
                    <p className="text-sm text-gray-600">Укажите ваш планируемый бюджет на обучение</p>
                  </div>
                </div>

                {/* Budget */}
                <div className="space-y-3">
                  <Label htmlFor="budget" className="text-base font-semibold text-gray-700">
                    Годовой бюджет на обучение <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.budget}
                    onValueChange={(value) => updateField("budget", value)}
                  >
                    <SelectTrigger
                      id="budget"
                      className={`h-12 text-base border-2 hover:border-blue-300 transition-colors ${
                        errors.budget ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Выберите бюджет" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="до $5k">до $5,000</SelectItem>
                      <SelectItem value="$5–10k">$5,000 – $10,000</SelectItem>
                      <SelectItem value="$10–20k">$10,000 – $20,000</SelectItem>
                      <SelectItem value="$20k+">$20,000+</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.budget && (
                    <p className="text-red-500 text-sm mt-2">
                      {errors.budget}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Укажите максимальную сумму, которую вы можете потратить на обучение в год
                  </p>
                </div>
              </div>

              {/* Submit Section */}
              <div className="pt-6 border-t-2 border-gray-200">
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xl py-7 rounded-xl shadow-lg hover:shadow-xl transition-all font-semibold"
                >
                  Получить результаты проверки
                </Button>
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-center text-sm text-gray-700">
                    <span className="font-semibold">Конфиденциальность:</span> Все данные обрабатываются локально и не отправляются на сервер
                  </p>
                </div>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </section>
  );
}
