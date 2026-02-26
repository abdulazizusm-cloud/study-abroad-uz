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
              href="https://t.me/applysmartuz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm sm:text-base"
            >
              <MessageCircle className="w-5 h-5" />
              Написать в Telegram
            </a>
          </div>

          {/* Bottom Bar */}
          <div className="pt-4 sm:pt-6 border-t border-gray-700">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-3">
              {/* Contacts */}
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 order-1 sm:order-2 w-full sm:w-auto">
                <span className="hidden sm:block text-gray-500 text-xs font-medium uppercase tracking-wide">Контакты</span>
                <a
                  href="tel:+998905747400"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm sm:text-xs py-2 sm:py-0 w-full sm:w-auto justify-center sm:justify-start"
                >
                  <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +998 90 574 74 00
                </a>
                <a
                  href="mailto:applysmartuz@gmail.com"
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm sm:text-xs py-2 sm:py-0 w-full sm:w-auto justify-center sm:justify-start"
                >
                  <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  applysmartuz@gmail.com
                </a>
              </div>
              {/* Copyright */}
              <p className="text-gray-600 text-xs order-2 sm:order-1">© 2026 Apply Smart. Все права защищены</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
