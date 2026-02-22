"use client";

import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { WizardForm } from "@/components/wizard-form";
import { GraduationCap, Mail, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ApplySmart",
  url: "https://applysmart.uz",
  applicationCategory: "EducationApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description:
    "Бесплатный калькулятор шансов поступления в зарубежные университеты для студентов из Узбекистана. Введи оценки и уровень английского — получи список подходящих вузов с вероятностью поступления.",
  inLanguage: ["ru", "uz", "en"],
  audience: {
    "@type": "Audience",
    audienceType: "Students from Uzbekistan seeking to study abroad",
    geographicArea: {
      "@type": "Country",
      name: "Uzbekistan",
    },
  },
};

export default function Home() {
  const { user, loading } = useAuth();

  // Wait for auth to load to prevent hydration mismatch
  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
        <Navbar />
        <Hero />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <Navbar />
      <Hero />
      
      {!user && (
        <>
          <HowItWorks />
          <div id="form-section">
            <WizardForm />
          </div>
        </>
      )}
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6 sm:py-8 px-3 sm:px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-4 sm:mb-6">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-2 sm:mb-3">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h3 className="text-base sm:text-lg font-bold">Study Abroad UZ</h3>
              </div>
              <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">
                Помогаем студентам из Узбекистана<br />
                поступить в зарубежные университеты
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm sm:text-base font-bold mb-2 sm:mb-3 text-white">Контакты</h4>
              <ul className="space-y-1.5 sm:space-y-2">
                <li className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm">
                  <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                  <span>info@studyabroad.uz</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400 text-xs sm:text-sm">
                  <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 flex-shrink-0" />
                  <span>+998 90 123 45 67</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Telegram CTA */}
          <div className="py-6 sm:py-8 border-t border-gray-700 text-center">
            <p className="text-white text-base sm:text-lg font-semibold mb-1">
              Если есть сомнения или что-то непонятно, свяжитесь с нами
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Напишите нам и опытный менеджер поможет вам сделать правильный выбор
            </p>
            <a
              href="https://t.me/PLACEHOLDER"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm sm:text-base"
            >
              <MessageCircle className="w-5 h-5" />
              Написать в Telegram
            </a>
          </div>

          {/* Bottom Bar */}
          <div className="pt-4 sm:pt-6 border-t border-gray-700 text-center">
            <p className="text-gray-500 text-xs">
              © 2026 Study Abroad UZ. Все права защищены
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
