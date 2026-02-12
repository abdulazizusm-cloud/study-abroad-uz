"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, UserCheck } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export function Hero() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [hasResults, setHasResults] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem("wizardFormData");
    setHasResults(!!savedData);
  }, []);

  const scrollToForm = () => {
    const formSection = document.getElementById("form-section");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleButtonClick = () => {
    if (user && hasResults) {
      router.push("/wizard-results");
    } else {
      scrollToForm();
    }
  };

  return (
    <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient blobs - enhanced */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-300 to-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-purple-300 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-[500px] h-[500px] bg-gradient-to-br from-pink-300 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-200 mb-8 animate-fade-in">
          <span className="text-sm font-semibold text-blue-700">
            Бесплатная проверка шансов
          </span>
        </div>

        {/* Headline - improved hierarchy */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-gray-900 mb-8 leading-[1.1] tracking-tight">
          Узнай свои шансы<br className="hidden sm:block" /> поступления{" "}
          <span className="text-blue-600">
            за 1 минуту
          </span>
        </h1>

        {/* Subheadline - improved spacing */}
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
          Введи оценки и уровень английского — получи список подходящих
          университетов и вероятность поступления
        </p>

        <p className="text-sm sm:text-base text-slate-600 max-w-md mx-auto text-center border-t border-slate-200 pt-6 mt-8 mb-8">
          <span className="text-slate-800 font-medium">1,248+</span> профилей уже проанализировано
        </p>

        {/* CTA Button - enhanced */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button
            onClick={handleButtonClick}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-10 py-7 rounded-2xl shadow-lg hover:shadow-xl transition-all font-semibold"
          >
            {user && hasResults ? "Вернуться к результатам" : "Проверить шансы бесплатно"}
          </Button>
        </div>

        {/* Trust Bullets - improved design */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-12">
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-gray-700 font-semibold text-lg">Без регистрации</span>
          </div>
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-gray-700 font-semibold text-lg">Результат сразу</span>
          </div>
          <div className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-gray-700 font-semibold text-lg">Просто и понятно</span>
          </div>
        </div>
      </div>
    </section>
  );
}
