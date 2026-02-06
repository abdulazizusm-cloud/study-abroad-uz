"use client";

import { Button } from "@/components/ui/button";
import { Lock, Sparkles, TrendingUp, Target } from "lucide-react";

interface UnlockProCTAProps {
  onUnlock: () => void;
}

export function UnlockProCTA({ onUnlock }: UnlockProCTAProps) {
  return (
    <div className="my-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-2xl">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-8 h-8" />
          <h3 className="text-2xl md:text-3xl font-bold">
            Получить реальную оценку шансов
          </h3>
        </div>

        <p className="text-lg mb-6 text-blue-50">
          Строгая экспертная оценка учитывает конкуренцию, скрытые факторы и
          реальную логику приёмных комиссий
        </p>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <TrendingUp className="w-6 h-6 mb-2" />
            <h4 className="font-semibold mb-1">Учёт конкуренции</h4>
            <p className="text-sm text-blue-100">
              Реалистичная оценка с учётом soft-cap для высоких баллов
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <Sparkles className="w-6 h-6 mb-2" />
            <h4 className="font-semibold mb-1">Экспертный анализ</h4>
            <p className="text-sm text-blue-100">
              Детальное объяснение почему шансы выше или ниже
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <Target className="w-6 h-6 mb-2" />
            <h4 className="font-semibold mb-1">Конкретные рекомендации</h4>
            <p className="text-sm text-blue-100">
              Персональные советы по улучшению профиля
            </p>
          </div>
        </div>

        <Button
          onClick={onUnlock}
          size="lg"
          className="w-full md:w-auto bg-white text-blue-600 hover:bg-blue-50 font-bold text-lg px-8 py-6"
        >
          Узнать реальные шансы
        </Button>

        <p className="text-sm text-blue-100 mt-4">
          Бесплатно • Без обязательств • Займёт 30 секунд
        </p>
      </div>
    </div>
  );
}
