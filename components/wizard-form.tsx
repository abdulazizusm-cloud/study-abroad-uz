"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
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
import { ChevronDown, Check } from "lucide-react";
import { lookupPercentile, GRE_VERBAL_TABLE, GRE_QUANT_TABLE, GRE_AW_TABLE, GMAT_QUANT_TABLE, GMAT_VERBAL_TABLE } from "@/lib/grePercentiles";

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
  greVerbalPercentile?: string;
  greQuant?: string;
  greQuantPercentile?: string;
  greWriting?: string;
  greWritingPercentile?: string;
  // GMAT Focus Edition
  gmatTotal?: string;
  gmatTotalPercentile?: string;
  gmatQuant?: string;
  gmatQuantPercentile?: string;
  gmatVerbal?: string;
  gmatVerbalPercentile?: string;
  gmatDataInsights?: string;
  gmatDataInsightsPercentile?: string;
  // Step 3 - Направление обучения
  programGoal: string; // Куда хотите поступить?
  faculty: string[];   // Факультет / направление, max 2
  scholarship: string; // Стипендия: Да / Нет
}

export function WizardForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const analyzingTimeoutRef = useRef<number | null>(null);
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
    programGoal: "",
    faculty: [],
    scholarship: "",
  });
  const [showErrors, setShowErrors] = useState({ 1: false, 2: false, 3: false });
  const [facultyDropdownOpen, setFacultyDropdownOpen] = useState(false);
  const facultyDropdownRef = useRef<HTMLDivElement>(null);
  const WIZARD_SUBMIT_KEY = "wizard_form_submit_count";
  const CAPTCHA_THRESHOLD = 3;
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaRequired, setCaptchaRequired] = useState(() => {
    if (typeof window === "undefined") return false;
    const count = parseInt(localStorage.getItem("wizard_form_submit_count") || "0");
    return count >= 3;
  });
  const turnstileRef = useRef<TurnstileInstance>(undefined);
  const [captchaError, setCaptchaError] = useState("");

  const FACULTY_OPTIONS = [
    { value: "Finance", label: "Финансы" },
    { value: "Business", label: "Бизнес" },
    { value: "IT", label: "ИТ / Информационные технологии" },
  ];

  useEffect(() => {
    return () => {
      if (analyzingTimeoutRef.current !== null) {
        window.clearTimeout(analyzingTimeoutRef.current);
        analyzingTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (facultyDropdownRef.current && !facultyDropdownRef.current.contains(e.target as Node)) {
        setFacultyDropdownOpen(false);
      }
    };
    if (facultyDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [facultyDropdownOpen]);

  const updateField = (field: keyof FormDataType, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFaculty = (value: string) => {
    setFormData((prev) => {
      const current = prev.faculty || [];
      const exists = current.includes(value);
      if (exists) return { ...prev, faculty: current.filter((v) => v !== value) };
      if (current.length >= 2) return prev;
      return { ...prev, faculty: [...current, value] };
    });
  };

  // Calculate progress for each step based on filled fields
  const calculateStepProgress = (step: number): number => {
    if (step === 1) {
      const fields = [
        formData.nationality,
        formData.countryOfStudy,
        formData.level,
        formData.gradingScheme,
        formData.gradingAverage,
        formData.financeSource,
        formData.budget,
      ];
      const filled = fields.filter(f => f && f !== "").length;
      return (filled / fields.length) * 100;
    }
    
    if (step === 2) {
      let totalFields = 0;
      let filledFields = 0;

      // English exam fields
      if (formData.englishExamType === "IELTS") {
        const ieltsFields = [
          formData.ieltsOverall,
          formData.ieltsListening,
          formData.ieltsReading,
          formData.ieltsWriting,
          formData.ieltsSpeaking,
        ];
        totalFields += ieltsFields.length;
        filledFields += ieltsFields.filter(f => f && f !== "").length;
      } else if (formData.englishExamType === "TOEFL") {
        const toeflFields = [
          formData.toeflTotal,
          formData.toeflReading,
          formData.toeflListening,
          formData.toeflSpeaking,
          formData.toeflWriting,
        ];
        totalFields += toeflFields.length;
        filledFields += toeflFields.filter(f => f && f !== "").length;
      } else if (formData.englishExamType === "Duolingo") {
        totalFields += 1;
        if (formData.duolingoOverall) filledFields += 1;
      }

      // Standardized exam fields
      if (formData.standardizedExamType === "GRE") {
        const greFields = [
          formData.greVerbal,
          formData.greVerbalPercentile,
          formData.greQuant,
          formData.greQuantPercentile,
          formData.greWriting,
          formData.greWritingPercentile,
        ];
        totalFields += greFields.length;
        filledFields += greFields.filter(f => f && f !== "").length;
      } else if (formData.standardizedExamType === "GMAT") {
        const gmatFields = [
          formData.gmatTotal,
          formData.gmatTotalPercentile,
          formData.gmatQuant,
          formData.gmatQuantPercentile,
          formData.gmatVerbal,
          formData.gmatVerbalPercentile,
          formData.gmatDataInsights,
          formData.gmatDataInsightsPercentile,
        ];
        totalFields += gmatFields.length;
        filledFields += gmatFields.filter(f => f && f !== "").length;
      }

      return totalFields > 0 ? (filledFields / totalFields) * 100 : 0;
    }
    
    if (step === 3) {
      let filled = 0;
      let total = 3; // programGoal + faculty + scholarship
      
      if (formData.programGoal) filled++;
      if (formData.faculty && formData.faculty.length > 0) filled++;
      if (formData.scholarship) filled++;
      
      return (filled / total) * 100;
    }
    
    return 0;
  };

  // Calculate overall progress
  const calculateOverallProgress = (): number => {
    const step1Progress = calculateStepProgress(1);
    const step2Progress = calculateStepProgress(2);
    const step3Progress = calculateStepProgress(3);
    
    // Current step gets its actual progress
    // Previous steps are 100%
    // Future steps are 0%
    if (currentStep === 1) {
      return step1Progress / 3;
    } else if (currentStep === 2) {
      return (100 + step2Progress) / 3;
    } else if (currentStep === 3) {
      return (200 + step3Progress) / 3;
    }
    
    return 0;
  };

  const getStep1Errors = () => {
    const errors: string[] = [];
    if (!formData.nationality) errors.push("Гражданство: выберите значение");
    if (!formData.countryOfStudy) errors.push("Страна обучения: выберите значение");
    if (!formData.level) errors.push("Уровень обучения: выберите значение");
    if (!formData.gradingScheme) errors.push("Система оценивания: выберите значение");
    if (!formData.gradingAverage) errors.push("Средний балл: укажите значение");
    if (!formData.financeSource) errors.push("Источник финансирования: выберите значение");
    if (!formData.budget) errors.push("Годовой бюджет: выберите значение");
    return errors;
  };

  const getStep2Errors = () => {
    const errors: string[] = [];
    if (formData.englishExamType === "IELTS") {
      if (!formData.ieltsOverall) errors.push("IELTS Overall: укажите значение");
      if (!formData.ieltsListening) errors.push("IELTS Listening: укажите значение");
      if (!formData.ieltsReading) errors.push("IELTS Reading: укажите значение");
      if (!formData.ieltsWriting) errors.push("IELTS Writing: укажите значение");
      if (!formData.ieltsSpeaking) errors.push("IELTS Speaking: укажите значение");
    }
    if (formData.englishExamType === "Duolingo") {
      if (!formData.duolingoOverall) errors.push("Duolingo Overall: укажите значение");
    }
    if (formData.englishExamType === "TOEFL") {
      if (!formData.toeflTotal) errors.push("TOEFL Total: укажите значение");
      if (!formData.toeflReading) errors.push("TOEFL Reading: укажите значение");
      if (!formData.toeflListening) errors.push("TOEFL Listening: укажите значение");
      if (!formData.toeflSpeaking) errors.push("TOEFL Speaking: укажите значение");
      if (!formData.toeflWriting) errors.push("TOEFL Writing: укажите значение");
    }
    if (formData.standardizedExamType === "GRE") {
      const v = Number(formData.greVerbal);
      const q = Number(formData.greQuant);
      const w = Number(formData.greWriting);
      const vp = Number(formData.greVerbalPercentile);
      const qp = Number(formData.greQuantPercentile);
      const wp = Number(formData.greWritingPercentile);
      if (!formData.greVerbal) errors.push("GRE Verbal Score: укажите значение");
      if (!formData.greQuant) errors.push("GRE Quant Score: укажите значение");
      if (!formData.greWriting) errors.push("GRE Analytical Writing: укажите значение");
      if (!formData.greVerbalPercentile) errors.push("GRE Verbal Percentile: укажите значение");
      if (!formData.greQuantPercentile) errors.push("GRE Quant Percentile: укажите значение");
      if (!formData.greWritingPercentile) errors.push("GRE AW Percentile: укажите значение");
      if (formData.greVerbal && (v < 130 || v > 170)) errors.push("GRE Verbal Score: диапазон 130–170");
      if (formData.greQuant && (q < 130 || q > 170)) errors.push("GRE Quant Score: диапазон 130–170");
      if (formData.greWriting && (w < 0 || w > 6)) errors.push("GRE Analytical Writing: диапазон 0.0–6.0");
      if (formData.greVerbalPercentile && (vp < 0 || vp > 99)) errors.push("GRE Verbal Percentile: диапазон 0–99");
      if (formData.greQuantPercentile && (qp < 0 || qp > 99)) errors.push("GRE Quant Percentile: диапазон 0–99");
      if (formData.greWritingPercentile && (wp < 0 || wp > 99)) errors.push("GRE AW Percentile: диапазон 0–99");
    }
    if (formData.standardizedExamType === "GMAT") {
      const total = Number(formData.gmatTotal);
      const totalP = Number(formData.gmatTotalPercentile);
      const quant = Number(formData.gmatQuant);
      const quantP = Number(formData.gmatQuantPercentile);
      const verbal = Number(formData.gmatVerbal);
      const verbalP = Number(formData.gmatVerbalPercentile);
      const di = Number(formData.gmatDataInsights);
      const diP = Number(formData.gmatDataInsightsPercentile);
      if (!formData.gmatTotal) errors.push("GMAT Total Score: укажите значение");
      if (!formData.gmatTotalPercentile) errors.push("GMAT Total Percentile: укажите значение");
      if (!formData.gmatQuant) errors.push("GMAT Quantitative Reasoning: укажите значение");
      if (!formData.gmatQuantPercentile) errors.push("GMAT Quant Percentile: укажите значение");
      if (!formData.gmatVerbal) errors.push("GMAT Verbal Reasoning: укажите значение");
      if (!formData.gmatVerbalPercentile) errors.push("GMAT Verbal Percentile: укажите значение");
      if (!formData.gmatDataInsights) errors.push("GMAT Data Insights: укажите значение");
      if (!formData.gmatDataInsightsPercentile) errors.push("GMAT Data Insights Percentile: укажите значение");
      if (formData.gmatTotal && (total < 205 || total > 805)) errors.push("GMAT Total Score: диапазон 205–805");
      if (formData.gmatTotalPercentile && (totalP < 0 || totalP > 99)) errors.push("GMAT Total Percentile: диапазон 0–99");
      if (formData.gmatQuant && (quant < 60 || quant > 90)) errors.push("GMAT Quantitative Reasoning: диапазон 60–90");
      if (formData.gmatQuantPercentile && (quantP < 0 || quantP > 99)) errors.push("GMAT Quant Percentile: диапазон 0–99");
      if (formData.gmatVerbal && (verbal < 60 || verbal > 90)) errors.push("GMAT Verbal Reasoning: диапазон 60–90");
      if (formData.gmatVerbalPercentile && (verbalP < 0 || verbalP > 99)) errors.push("GMAT Verbal Percentile: диапазон 0–99");
      if (formData.gmatDataInsights && (di < 60 || di > 90)) errors.push("GMAT Data Insights: диапазон 60–90");
      if (formData.gmatDataInsightsPercentile && (diP < 0 || diP > 99)) errors.push("GMAT Data Insights Percentile: диапазон 0–99");
    }
    return errors;
  };

  const getStep3Errors = () => {
    const errors: string[] = [];
    if (!formData.programGoal) errors.push("Куда хотите поступить: выберите значение");
    if ((formData.faculty?.length ?? 0) < 1) errors.push("Факультет / направление: выберите минимум один вариант");
    if (!formData.scholarship) errors.push("Стипендия: выберите Да или Нет");
    return errors;
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
      const v = Number(formData.greVerbal);
      const q = Number(formData.greQuant);
      const w = Number(formData.greWriting);
      const vp = Number(formData.greVerbalPercentile);
      const qp = Number(formData.greQuantPercentile);
      const wp = Number(formData.greWritingPercentile);
      if (
        !formData.greVerbal || !formData.greQuant || !formData.greWriting ||
        !formData.greVerbalPercentile || !formData.greQuantPercentile || !formData.greWritingPercentile
      ) return false;
      if (v < 130 || v > 170 || q < 130 || q > 170 || w < 0 || w > 6) return false;
      if (vp < 0 || vp > 99 || qp < 0 || qp > 99 || wp < 0 || wp > 99) return false;
    }
    
    // GMAT Focus Edition validation
    if (formData.standardizedExamType === "GMAT") {
      const total = Number(formData.gmatTotal);
      const totalP = Number(formData.gmatTotalPercentile);
      const quant = Number(formData.gmatQuant);
      const quantP = Number(formData.gmatQuantPercentile);
      const verbal = Number(formData.gmatVerbal);
      const verbalP = Number(formData.gmatVerbalPercentile);
      const di = Number(formData.gmatDataInsights);
      const diP = Number(formData.gmatDataInsightsPercentile);
      if (
        !formData.gmatTotal || !formData.gmatTotalPercentile ||
        !formData.gmatQuant || !formData.gmatQuantPercentile ||
        !formData.gmatVerbal || !formData.gmatVerbalPercentile ||
        !formData.gmatDataInsights || !formData.gmatDataInsightsPercentile
      ) return false;
      if (total < 205 || total > 805) return false;
      if (totalP < 0 || totalP > 99) return false;
      if (quant < 60 || quant > 90 || verbal < 60 || verbal > 90 || di < 60 || di > 90) return false;
      if (quantP < 0 || quantP > 99 || verbalP < 0 || verbalP > 99 || diP < 0 || diP > 99) return false;
    }
    
    return true;
  };

  // Step 3 validation
  const isStep3Valid = () => {
    return formData.programGoal !== "" && (formData.faculty?.length ?? 0) >= 1 && !!formData.scholarship;
  };

  const handleNext = () => {
    if (isAnalyzing) return;

    if (currentStep === 1 && !isStep1Valid()) {
      setShowErrors((prev) => ({ ...prev, 1: true }));
      return;
    }
    if (currentStep === 2 && !isStep2Valid()) {
      setShowErrors((prev) => ({ ...prev, 2: true }));
      return;
    }

    if (currentStep === 1) {
      setIsAnalyzing(true);
      analyzingTimeoutRef.current = window.setTimeout(() => {
        setIsAnalyzing(false);
        analyzingTimeoutRef.current = null;
        setCurrentStep(2);
      }, 1200);
      return;
    }

    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!isStep3Valid()) {
      setShowErrors((prev) => ({ ...prev, 3: true }));
      return;
    }

    // Track submit attempts for CAPTCHA
    const currentCount = parseInt(localStorage.getItem(WIZARD_SUBMIT_KEY) || "0");
    const newCount = currentCount + 1;
    localStorage.setItem(WIZARD_SUBMIT_KEY, String(newCount));

    if (newCount >= CAPTCHA_THRESHOLD) {
      setCaptchaRequired(true);
      if (!captchaToken) {
        return;
      }
      // Verify CAPTCHA token server-side
      const res = await fetch("/api/verify-captcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: captchaToken }),
      });
      if (!res.ok) {
        setCaptchaError("Пожалуйста, пройдите проверку");
        turnstileRef.current?.reset();
        setCaptchaToken(null);
        return;
      }
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
      
      // Step 2 - English Exams
      englishExamType: formData.englishExamType,
      englishScore: 
        formData.englishExamType === "IELTS" ? formData.ieltsOverall :
        formData.englishExamType === "TOEFL" ? formData.toeflTotal :
        formData.englishExamType === "Duolingo" ? formData.duolingoOverall :
        undefined,
      
      // IELTS detailed scores
      ieltsOverall: formData.ieltsOverall,
      ieltsListening: formData.ieltsListening,
      ieltsReading: formData.ieltsReading,
      ieltsWriting: formData.ieltsWriting,
      ieltsSpeaking: formData.ieltsSpeaking,
      
      // TOEFL detailed scores
      toeflTotal: formData.toeflTotal,
      toeflReading: formData.toeflReading,
      toeflListening: formData.toeflListening,
      toeflSpeaking: formData.toeflSpeaking,
      toeflWriting: formData.toeflWriting,
      
      // Duolingo detailed scores
      duolingoOverall: formData.duolingoOverall,
      duolingoLiteracy: formData.duolingoLiteracy,
      duolingoComprehension: formData.duolingoComprehension,
      duolingoConversation: formData.duolingoConversation,
      duolingoProduction: formData.duolingoProduction,
      
      // Step 2 - Standardized tests
      standardizedExamType: formData.standardizedExamType,
      
      // GRE with percentiles
      greVerbal: formData.greVerbal,
      greVerbalPercentile: formData.greVerbalPercentile,
      greQuant: formData.greQuant,
      greQuantPercentile: formData.greQuantPercentile,
      greWriting: formData.greWriting,
      greWritingPercentile: formData.greWritingPercentile,
      
      // GMAT with percentiles
      gmatTotal: formData.gmatTotal,
      gmatTotalPercentile: formData.gmatTotalPercentile,
      gmatQuant: formData.gmatQuant,
      gmatQuantPercentile: formData.gmatQuantPercentile,
      gmatVerbal: formData.gmatVerbal,
      gmatVerbalPercentile: formData.gmatVerbalPercentile,
      gmatDataInsights: formData.gmatDataInsights,
      gmatDataInsightsPercentile: formData.gmatDataInsightsPercentile,

      // Step 3
      programGoal: formData.programGoal,
      faculty: formData.faculty ?? [],
      scholarship: formData.scholarship ?? "",
    };
    
    // Save to localStorage
    localStorage.setItem("wizardFormData", JSON.stringify(wizardData));
    
    // Navigate to results page
    router.push("/wizard-results");
  };

  return (
    <section className="py-12 sm:py-24 px-3 sm:px-4 md:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            Анкета проверки шансов
          </h2>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto px-2">
            Заполните информацию о себе для получения персонального подбора университетов
          </p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200 p-4 sm:p-8 md:p-12">
          {(() => {
            const overallProgress = calculateOverallProgress();
            const step1Progress = calculateStepProgress(1);
            const step2Progress = calculateStepProgress(2);
            const step3Progress = calculateStepProgress(3);

            return (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold text-slate-700">
                    Шаг {currentStep} из 3
                  </div>
                  <div className="text-sm font-semibold text-violet-600">
                    {Math.round(overallProgress)}%
                  </div>
                </div>
                
                {/* Three-section progress bar */}
                <div className="flex gap-2">
                  {/* Step 1 */}
                  <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        currentStep > 1 ? 'bg-green-500' : 'bg-violet-600'
                      }`}
                      style={{ width: `${currentStep >= 1 ? (currentStep > 1 ? 100 : step1Progress) : 0}%` }}
                    />
                  </div>
                  
                  {/* Step 2 */}
                  <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        currentStep > 2 ? 'bg-green-500' : 'bg-violet-600'
                      }`}
                      style={{ width: `${currentStep >= 2 ? (currentStep > 2 ? 100 : step2Progress) : 0}%` }}
                    />
                  </div>
                  
                  {/* Step 3 */}
                  <div className="flex-1 h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-violet-600 transition-all duration-300"
                      style={{ width: `${currentStep >= 3 ? step3Progress : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* STEP 1 - BASIC INFORMATION */}
          {currentStep === 1 && (
            isAnalyzing ? (
              <div className="py-16 sm:py-20 text-center">
                <div className="mx-auto mb-6 h-10 w-10 rounded-full border-2 border-slate-200 border-t-slate-600 animate-spin" />
                <div className="text-base font-semibold text-slate-900">
                  Анализируем более 3,000 программ...
                </div>
                <div className="text-sm text-slate-600 mt-2">
                  Сравниваем с профилями прошлых студентов...
                </div>
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b-2 border-blue-100">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm sm:text-base">1</span>
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-gray-900">Основная информация</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Базовые данные о вас и ваших планах</p>
                </div>
              </div>
              {showErrors[1] && getStep1Errors().length > 0 && (
                <div className="p-4 rounded-xl border-2 border-red-200 bg-red-50 text-sm text-red-700">
                  <p className="font-semibold mb-2">Исправьте ошибки:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {getStep1Errors().map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

          {/* Nationality */}
          <div>
            <Label htmlFor="nationality" className="text-base font-semibold text-gray-700">
              Гражданство <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.nationality}
              onValueChange={(value) => updateField("nationality", value)}
            >
            <SelectTrigger id="nationality" className="h-12 text-base border-2">
              <SelectValue placeholder="Выберите гражданство" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Uzbekistan">Узбекистан</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
                <SelectItem value="Poland">Польша</SelectItem>
                <SelectItem value="Hungary">Венгрия</SelectItem>
                <SelectItem value="Turkey">Турция</SelectItem>
                <SelectItem value="Korea">Южная Корея</SelectItem>
                <SelectItem value="USA">США</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Level Searching For */}
          <div>
            <Label htmlFor="level" className="text-base font-semibold text-gray-700">
              Уровень образования <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.level}
              onValueChange={(value) => updateField("level", value)}
            >
              <SelectTrigger id="level" className="h-12 text-base border-2 mt-2">
                <SelectValue placeholder="Выберите уровень" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Secondary">Среднее образование (школа / лицей / колледж)</SelectItem>
                <SelectItem value="Bachelor">Бакалавриат</SelectItem>
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
              className="h-9 text-base border-2 mt-2 w-full max-w-[200px]"
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
                <SelectItem value="Self">Самостоятельно (личные средства)</SelectItem>
                <SelectItem value="Parents">Родители / семья</SelectItem>
                <SelectItem value="Employer">Работодатель</SelectItem>
                <SelectItem value="Government">Государственная поддержка</SelectItem>
                <SelectItem value="Scholarship">Фонды</SelectItem>
                <SelectItem value="Sponsor">Спонсор (частное лицо / организация)</SelectItem>
                <SelectItem value="Loan">Кредит / образовательный заём</SelectItem>
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
                  disabled={isAnalyzing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 sm:py-6 rounded-xl font-semibold text-sm sm:text-base"
                >
                  {isAnalyzing ? "Анализируем..." : "Продолжить →"}
                </Button>
              </div>
            </div>
            )
          )}

          {/* STEP 2 - EXAMS */}
          {currentStep === 2 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b-2 border-blue-100">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm sm:text-base">2</span>
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-gray-900">Тесты и экзамены</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Информация о языковых и академических тестах</p>
                </div>
              </div>
              {showErrors[2] && getStep2Errors().length > 0 && (
                <div className="p-4 rounded-xl border-2 border-red-200 bg-red-50 text-sm text-red-700">
                  <p className="font-semibold mb-2">Исправьте ошибки:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {getStep2Errors().map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

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

          {/* GRE Scores — 3x2 grid */}
          {formData.standardizedExamType === "GRE" && (
            <div className="animate-fade-in p-6 bg-white rounded-xl border-2 border-gray-200">
              <h4 className="font-bold text-lg text-gray-900 mb-4">GRE баллы</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Row 1: Verbal Score, Verbal Percentile */}
                <div className="space-y-2">
                  <Label htmlFor="greVerbal" className="text-base font-semibold text-gray-700">
                    Verbal Score (130–170) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="greVerbal"
                    type="number"
                    min={130}
                    max={170}
                    value={formData.greVerbal ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateField("greVerbal", value);
                      // Auto-fill percentile
                      const percentile = lookupPercentile(GRE_VERBAL_TABLE, value);
                      if (percentile !== null) {
                        updateField("greVerbalPercentile", percentile.toString());
                      } else if (value === "") {
                        updateField("greVerbalPercentile", "");
                      }
                    }}
                    placeholder="130 - 170"
                    className="h-12 text-base border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="greVerbalPercentile" className="text-base font-semibold text-gray-700">
                    Verbal Percentile (0–99%) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative flex items-center h-12 rounded-md border-2 border-input bg-background">
                    <Input
                      id="greVerbalPercentile"
                      type="number"
                      min={0}
                      max={99}
                      value={formData.greVerbalPercentile ?? ""}
                      onChange={(e) => updateField("greVerbalPercentile", e.target.value)}
                      placeholder="0 - 99%"
                      className="h-full border-0 bg-transparent pr-8 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 font-medium">%</span>
                  </div>
                </div>
                {/* Row 2: Quant Score, Quant Percentile */}
                <div className="space-y-2">
                  <Label htmlFor="greQuant" className="text-base font-semibold text-gray-700">
                    Quant Score (130–170) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="greQuant"
                    type="number"
                    min={130}
                    max={170}
                    value={formData.greQuant ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateField("greQuant", value);
                      // Auto-fill percentile
                      const percentile = lookupPercentile(GRE_QUANT_TABLE, value);
                      if (percentile !== null) {
                        updateField("greQuantPercentile", percentile.toString());
                      } else if (value === "") {
                        updateField("greQuantPercentile", "");
                      }
                    }}
                    placeholder="130 - 170"
                    className="h-12 text-base border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="greQuantPercentile" className="text-base font-semibold text-gray-700">
                    Quant Percentile (0–99%) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative flex items-center h-12 rounded-md border-2 border-input bg-background">
                    <Input
                      id="greQuantPercentile"
                      type="number"
                      min={0}
                      max={99}
                      value={formData.greQuantPercentile ?? ""}
                      onChange={(e) => updateField("greQuantPercentile", e.target.value)}
                      placeholder="0 - 99%"
                      className="h-full border-0 bg-transparent pr-8 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 font-medium">%</span>
                  </div>
                </div>
                {/* Row 3: AW Score, AW Percentile */}
                <div className="space-y-2">
                  <Label htmlFor="greWriting" className="text-base font-semibold text-gray-700">
                    Analytical Writing (0.0–6.0) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="greWriting"
                    type="number"
                    step={0.5}
                    min={0}
                    max={6}
                    value={formData.greWriting ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      updateField("greWriting", value);
                      // Auto-fill percentile
                      const percentile = lookupPercentile(GRE_AW_TABLE, value);
                      if (percentile !== null) {
                        updateField("greWritingPercentile", percentile.toString());
                      } else if (value === "") {
                        updateField("greWritingPercentile", "");
                      }
                    }}
                    placeholder="0 - 6.0"
                    className="h-12 text-base border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="greWritingPercentile" className="text-base font-semibold text-gray-700">
                    AW Percentile (0–99%) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative flex items-center h-12 rounded-md border-2 border-input bg-background">
                    <Input
                      id="greWritingPercentile"
                      type="number"
                      min={0}
                      max={99}
                      value={formData.greWritingPercentile ?? ""}
                      onChange={(e) => updateField("greWritingPercentile", e.target.value)}
                      placeholder="0 - 99%"
                      className="h-full border-0 bg-transparent pr-8 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 font-medium">%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* GMAT Focus Edition Scores */}
          {formData.standardizedExamType === "GMAT" && (
            <div className="animate-fade-in space-y-6 p-6 bg-white rounded-xl border-2 border-gray-200">
              <h4 className="font-bold text-lg text-gray-900">GMAT Focus Edition</h4>

              {/* Total */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gmatTotal" className="text-base font-semibold text-gray-700">
                    Total Score (205–805) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="gmatTotal"
                    type="number"
                    min={205}
                    max={805}
                    value={formData.gmatTotal ?? ""}
                    onChange={(e) => updateField("gmatTotal", e.target.value)}
                    placeholder="205 - 805"
                    className="h-12 text-base border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gmatTotalPercentile" className="text-base font-semibold text-gray-700">
                    Total Percentile (0–99%) <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative flex items-center h-12 rounded-md border-2 border-input bg-background">
                    <Input
                      id="gmatTotalPercentile"
                      type="number"
                      min={0}
                      max={99}
                      value={formData.gmatTotalPercentile ?? ""}
                      onChange={(e) => updateField("gmatTotalPercentile", e.target.value)}
                      placeholder="0 - 99%"
                      className="h-full border-0 bg-transparent pr-8 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 font-medium">%</span>
                  </div>
                </div>
              </div>

              {/* Quantitative Reasoning */}
              <div>
                <h5 className="text-sm font-semibold text-gray-600 mb-3">Quantitative Reasoning</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gmatQuant" className="text-base font-semibold text-gray-700">
                      Score (60–90) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="gmatQuant"
                      type="number"
                      min={60}
                      max={90}
                      value={formData.gmatQuant ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateField("gmatQuant", value);
                        // Auto-fill percentile
                        const percentile = lookupPercentile(GMAT_QUANT_TABLE, value);
                        if (percentile !== null) {
                          updateField("gmatQuantPercentile", percentile.toString());
                        } else if (value === "") {
                          updateField("gmatQuantPercentile", "");
                        }
                      }}
                      placeholder="0 - 90"
                      className="h-12 text-base border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gmatQuantPercentile" className="text-base font-semibold text-gray-700">
                      Percentile (0–99%) <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative flex items-center h-12 rounded-md border-2 border-input bg-background">
                      <Input
                        id="gmatQuantPercentile"
                        type="number"
                        min={0}
                        max={99}
                        value={formData.gmatQuantPercentile ?? ""}
                        onChange={(e) => updateField("gmatQuantPercentile", e.target.value)}
                        placeholder="0 - 99%"
                        className="h-full border-0 bg-transparent pr-8 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 font-medium">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Verbal Reasoning */}
              <div>
                <h5 className="text-sm font-semibold text-gray-600 mb-3">Verbal Reasoning</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gmatVerbal" className="text-base font-semibold text-gray-700">
                      Score (60–90) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="gmatVerbal"
                      type="number"
                      min={60}
                      max={90}
                      value={formData.gmatVerbal ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        updateField("gmatVerbal", value);
                        // Auto-fill percentile
                        const percentile = lookupPercentile(GMAT_VERBAL_TABLE, value);
                        if (percentile !== null) {
                          updateField("gmatVerbalPercentile", percentile.toString());
                        } else if (value === "") {
                          updateField("gmatVerbalPercentile", "");
                        }
                      }}
                      placeholder="0 - 90"
                      className="h-12 text-base border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gmatVerbalPercentile" className="text-base font-semibold text-gray-700">
                      Percentile (0–99%) <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative flex items-center h-12 rounded-md border-2 border-input bg-background">
                      <Input
                        id="gmatVerbalPercentile"
                        type="number"
                        min={0}
                        max={99}
                        value={formData.gmatVerbalPercentile ?? ""}
                        onChange={(e) => updateField("gmatVerbalPercentile", e.target.value)}
                        placeholder="0 - 99%"
                        className="h-full border-0 bg-transparent pr-8 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 font-medium">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Insights */}
              <div>
                <h5 className="text-sm font-semibold text-gray-600 mb-3">Data Insights</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gmatDataInsights" className="text-base font-semibold text-gray-700">
                      Score (60–90) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="gmatDataInsights"
                      type="number"
                      min={60}
                      max={90}
                      value={formData.gmatDataInsights ?? ""}
                      onChange={(e) => updateField("gmatDataInsights", e.target.value)}
                      placeholder="0 - 90"
                      className="h-12 text-base border-2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gmatDataInsightsPercentile" className="text-base font-semibold text-gray-700">
                      Percentile (0–99%) <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative flex items-center h-12 rounded-md border-2 border-input bg-background">
                      <Input
                        id="gmatDataInsightsPercentile"
                        type="number"
                        min={0}
                        max={99}
                        value={formData.gmatDataInsightsPercentile ?? ""}
                        onChange={(e) => updateField("gmatDataInsightsPercentile", e.target.value)}
                        placeholder="0 - 99%"
                        className="h-full border-0 bg-transparent pr-8 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 font-medium">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

              <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button 
                  onClick={handleBack} 
                  variant="outline"
                  className="flex-1 py-5 sm:py-6 rounded-xl font-semibold text-sm sm:text-base order-2 sm:order-1"
                >
                  ← Назад
                </Button>
                <Button 
                  onClick={handleNext} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-5 sm:py-6 rounded-xl font-semibold text-sm sm:text-base order-1 sm:order-2"
                >
                  Продолжить →
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3 - FIELD OF STUDY */}
          {currentStep === 3 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b-2 border-blue-100">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm sm:text-base">3</span>
                </div>
                <div>
                  <h3 className="text-base sm:text-xl font-bold text-gray-900">Направление обучения</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Куда и на какое направление планируете поступить</p>
                </div>
              </div>
              {showErrors[3] && getStep3Errors().length > 0 && (
                <div className="p-4 rounded-xl border-2 border-red-200 bg-red-50 text-sm text-red-700">
                  <p className="font-semibold mb-2">Исправьте ошибки:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {getStep3Errors().map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Куда хотите поступить? */}
              <div className="space-y-2">
                <Label htmlFor="programGoal" className="text-base font-semibold text-gray-700">
                  Куда хотите поступить? <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.programGoal}
                  onValueChange={(value) => updateField("programGoal", value)}
                >
                  <SelectTrigger id="programGoal" className="flex h-12 min-h-12 w-full items-center rounded-md border-2 border-gray-200 bg-white px-4 py-0 text-left text-base hover:border-blue-300 transition-colors">
                    <SelectValue placeholder="Выберите уровень" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bachelor">Бакалавриат</SelectItem>
                    <SelectItem value="Master">Магистратура</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Факультет / Направление — всплывающий список, до 2 вариантов */}
              <div className="space-y-3" ref={facultyDropdownRef}>
                <Label className="text-base font-semibold text-gray-700 block">
                  Факультет / Направление <span className="text-red-500">*</span>
                  <span className="text-gray-500 font-normal text-sm ml-2">(Можно выбрать до 2 вариантов)</span>
                </Label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setFacultyDropdownOpen((v) => !v)}
                    className="flex h-12 min-h-12 w-full items-center justify-between gap-2 rounded-md border-2 border-gray-200 bg-white px-4 py-0 text-left text-base hover:border-blue-300 transition-colors"
                  >
                    <span className={formData.faculty?.length ? "text-gray-900" : "text-gray-500"}>
                      {formData.faculty?.length
                        ? formData.faculty.map((v) => FACULTY_OPTIONS.find((o) => o.value === v)?.label ?? v).join(", ")
                        : "Выберите до 2 направлений"}
                    </span>
                    <ChevronDown className={`h-5 w-5 shrink-0 text-gray-500 transition-transform ${facultyDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  {facultyDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-64 overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg py-1">
                      {FACULTY_OPTIONS.map(({ value, label }) => {
                        const selected = (formData.faculty ?? []).includes(value);
                        const disabled = !selected && (formData.faculty?.length ?? 0) >= 2;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => !disabled && toggleFaculty(value)}
                            disabled={disabled}
                            className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                              selected ? "bg-blue-50 text-blue-900" : disabled ? "cursor-not-allowed text-gray-400" : "hover:bg-gray-50"
                            }`}
                          >
                            <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
                              selected ? "border-blue-600 bg-blue-600" : "border-gray-300"
                            }`}>
                              {selected && <Check className="h-3 w-3 text-white" />}
                            </div>
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Стипендия — Да / Нет */}
              <div className="space-y-2">
                <Label htmlFor="scholarship" className="text-base font-semibold text-gray-700">
                  Стипендия <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.scholarship}
                  onValueChange={(value) => updateField("scholarship", value)}
                >
                  <SelectTrigger id="scholarship" className="flex h-12 min-h-12 w-full items-center rounded-md border-2 border-gray-200 bg-white px-4 py-0 text-left text-base hover:border-blue-300 transition-colors">
                    <SelectValue placeholder="Выберите: Да или Нет" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Да</SelectItem>
                    <SelectItem value="No">Нет</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {captchaRequired && (
                <div className="flex flex-col items-center gap-2 pt-4">
                  <p className="text-sm text-gray-600 text-center">
                    Для продолжения пройдите быструю проверку
                  </p>
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                    onSuccess={(token) => { setCaptchaToken(token); setCaptchaError(""); }}
                    onExpire={() => setCaptchaToken(null)}
                    options={{ theme: "light", language: "ru" }}
                  />
                  {captchaError && <p className="text-red-500 text-sm">{captchaError}</p>}
                </div>
              )}
              <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 py-5 sm:py-6 rounded-xl font-semibold text-sm sm:text-base order-2 sm:order-1"
                >
                  ← Назад
                </Button>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    handleSubmit();
                  }}
                  type="button"
                  disabled={captchaRequired && !captchaToken}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-5 sm:py-6 rounded-xl font-semibold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
                >
                  Получить результаты
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
