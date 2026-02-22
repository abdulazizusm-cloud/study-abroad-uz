"use client";

import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { WizardForm } from "@/components/wizard-form";
import { MessageCircle } from "lucide-react";
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
      <footer className="bg-gray-900 text-white pt-4 pb-6 sm:pt-5 sm:pb-8 px-3 sm:px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          {/* Telegram CTA */}
          <div className="pt-0 pb-4 sm:pb-6 text-center">
            <p className="text-white text-base sm:text-lg font-semibold mb-1">
              Если есть сомнения или что-то непонятно, свяжитесь с нами
            </p>
            <p className="text-gray-400 text-sm mb-4">
              Напишите нам и опытный менеджер поможет вам
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
