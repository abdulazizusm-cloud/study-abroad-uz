"use client";

import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { WizardForm } from "@/components/wizard-form";
import { GraduationCap, Mail, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
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
      <footer className="bg-gray-900 text-white py-8 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold">Study Abroad UZ</h3>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Помогаем студентам из Узбекистана<br />
                поступить в зарубежные университеты
              </p>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-base font-bold mb-3 text-white">Контакты</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <Mail className="w-4 h-4 text-blue-400" />
                  <span>info@studyabroad.uz</span>
                </li>
                <li className="flex items-center gap-2 text-gray-400 text-sm">
                  <MessageCircle className="w-4 h-4 text-blue-400" />
                  <span>+998 90 123 45 67</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 border-t border-gray-700 text-center">
            <p className="text-gray-500 text-xs">
              © 2026 Study Abroad UZ. Все права защищены
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
