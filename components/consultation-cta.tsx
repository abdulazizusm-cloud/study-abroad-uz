"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GraduationCap, CheckCircle, Clock, Sparkles } from "lucide-react";

export function ConsultationCTA() {
  const handleBookConsultation = () => {
    // TODO: Add booking logic (Calendly, form, etc.)
    alert("Функция записи на консультацию будет добавлена позже");
  };

  return (
    <Card className="mt-8 bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 overflow-hidden">
      <div className="p-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-9 h-9 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
                Экспертная поддержка
              </span>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Разобрать ваш профиль с экспертом
            </h3>

            <p className="text-gray-700 mb-4">
              Получите персональную стратегию поступления и конкретные шаги для
              максимизации ваших шансов
            </p>

            {/* Benefits */}
            <div className="grid md:grid-cols-2 gap-3 mb-6">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    45 минут индивидуального разбора
                  </p>
                  <p className="text-xs text-gray-600">
                    Детальный анализ вашего профиля
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Конкретный план действий
                  </p>
                  <p className="text-xs text-gray-600">
                    Пошаговая стратегия поступления
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Без обязательств
                  </p>
                  <p className="text-xs text-gray-600">
                    Свободная консультация
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Гибкое расписание
                  </p>
                  <p className="text-xs text-gray-600">
                    Выберите удобное время
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Button
              onClick={handleBookConsultation}
              size="lg"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-6 text-lg"
            >
              Записаться на консультацию
            </Button>

            <p className="text-xs text-gray-500 mt-3">
              Первая консультация бесплатна • Ответ в течение 24 часов
            </p>
          </div>
        </div>
      </div>

      {/* Bottom highlight bar */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-3 text-white text-sm font-medium">
        🎯 Помогли 500+ студентам поступить в топовые университеты
      </div>
    </Card>
  );
}
