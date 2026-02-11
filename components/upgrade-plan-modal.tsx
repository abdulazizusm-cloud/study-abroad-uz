"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Sparkles } from "lucide-react";

type Plan = "pro" | "pro_plus";

export function UpgradePlanModal({
  open,
  onOpenChange,
  onSelectPlan,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPlan: (plan: Plan) => Promise<void> | void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Улучшить план</DialogTitle>
          <DialogDescription>
            Выберите уровень доступа, чтобы открыть больше возможностей.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-bold text-gray-900">Pro</div>
                <div className="text-sm text-gray-600">
                  Полный доступ к результатам и экспертной оценке.
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            <ul className="space-y-2 text-sm text-gray-700">
              {[
                "Полный список университетов",
                "Экспертный расчёт (Pro)",
                "Breakdown факторов",
                "Сценарии улучшения (что‑если)",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            <Button
              className="bg-blue-600 hover:bg-blue-700 h-11"
              onClick={() => onSelectPlan("pro")}
            >
              Перейти на Pro
            </Button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-lg font-bold text-gray-900">Pro+</div>
                <div className="text-sm text-gray-600">
                  Study Abroad OS: планирование поступления под дедлайны.
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            <ul className="space-y-2 text-sm text-gray-700">
              {[
                "Roadmap поступления",
                "Дедлайны и напоминания",
                "Document tracker",
                "Шаблоны SOP + AI review",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>

            <Button
              className="bg-purple-600 hover:bg-purple-700 h-11"
              onClick={() => onSelectPlan("pro_plus")}
            >
              Перейти на Pro+
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

