import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { WizardForm } from "@/components/wizard-form";
import { GraduationCap, Mail, MessageCircle } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white">
      <Navbar />
      <Hero />
      <HowItWorks />
      <div id="form-section">
        <WizardForm />
      </div>
      
      {/* Footer - Enhanced */}
      <footer className="bg-gray-900 text-white py-16 px-4 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-2xl font-bold">Study Abroad UZ</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Помогаем студентам из Узбекистана поступить в зарубежные университеты и реализовать свои амбиции
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Быстрые ссылки</h4>
              <ul className="space-y-3">
                <li>
                  <a href="#how-it-works" className="text-gray-400 hover:text-blue-400 transition-colors">
                    Как это работает
                  </a>
                </li>
                <li>
                  <a href="#form-section" className="text-gray-400 hover:text-blue-400 transition-colors">
                    Проверить шансы
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                    О нас
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-bold mb-4 text-white">Контакты</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-400">
                  <Mail className="w-5 h-5 text-blue-400" />
                  <span>info@studyabroad.uz</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <MessageCircle className="w-5 h-5 text-blue-400" />
                  <span>+998 90 123 45 67</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-700 text-center">
            <p className="text-gray-500 text-sm">
              © 2026 Study Abroad UZ. Все права защищены. Made with ❤️ for Uzbek students
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
