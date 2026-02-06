"use client";

import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";

export function Navbar() {
  const scrollToForm = () => {
    const formSection = document.getElementById("form-section");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b-2 border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-blue-600">
              Study Abroad UZ
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-gray-700 hover:text-blue-600 transition-colors font-semibold text-base"
            >
              Как работает
            </button>
            <button
              onClick={() => scrollToSection("form-section")}
              className="text-gray-700 hover:text-blue-600 transition-colors font-semibold text-base"
            >
              Страны
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-gray-700 hover:text-blue-600 transition-colors font-semibold text-base"
            >
              FAQ
            </button>
          </div>

          {/* CTA Button */}
          <Button 
            onClick={scrollToForm} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all px-6"
          >
            Проверить шансы
          </Button>
        </div>
      </div>
    </nav>
  );
}
