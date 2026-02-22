"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

export type UpgradePlanType = "pro" | "profile_review" | "mentorship";

const PLANS: Record<
  UpgradePlanType,
  {
    title: string;
    subtitle: string;
    price: string;
    priceNote: string;
    color: string;
    buttonColor: string;
    buttonLabel: string;
    features: string[];
  }
> = {
  pro: {
    title: "PRO",
    subtitle: "Расширенный анализ поступления",
    price: "59 000 сум",
    priceNote: "/ месяц",
    color: "bg-blue-50 border-blue-200",
    buttonColor: "bg-blue-600 hover:bg-blue-700",
    buttonLabel: "Перейти на PRO",
    features: [
      "Всё, что входит в бесплатную версию",
      "Более точный расчет с учетом конкуренции",
      "Детальный разбор сильных и слабых сторон профиля",
      "Персональные рекомендации по повышению шансов",
    ],
  },
  profile_review: {
    title: "Разбор профиля",
    subtitle: "Персональный план поступления",
    price: "299 000 сум",
    priceNote: "разовая оплата",
    color: "bg-yellow-50 border-yellow-200",
    buttonColor: "bg-yellow-500 hover:bg-yellow-600",
    buttonLabel: "Записаться на разбор профиля",
    features: [
      "Онлайн-консультация 30–40 минут",
      "Персональный список 5–10 университетов",
      "Индивидуальная стратегия подачи документов",
      "Конкретные рекомендации по усилению профиля",
      "Ответы на все ваши вопросы",
    ],
  },
  mentorship: {
    title: "Менторство (1 университет)",
    subtitle: "Полное сопровождение до оффера",
    price: "1 500 000 сум",
    priceNote: "разовая оплата",
    color: "bg-purple-50 border-purple-200",
    buttonColor: "bg-purple-600 hover:bg-purple-700",
    buttonLabel: "Начать поступление с ментором",
    features: [
      "Подбор и финальное подтверждение программы",
      "Проверка и доработка мотивационного письма (SOP)",
      "Проверка и корректировка полного пакета документов",
      "Помощь с подачей заявки",
      "Контроль дедлайнов и статуса заявки",
      "Поддержка до получения оффера",
      "Персональный куратор",
    ],
  },
};

export function UpgradePlanModal({
  open,
  onOpenChange,
  onSelectPlan,
  planType = "pro",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPlan: (plan: UpgradePlanType) => Promise<void> | void;
  planType?: UpgradePlanType;
}) {
  const plan = PLANS[planType];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{plan.title}</DialogTitle>
          <p className="text-sm text-gray-500 mt-1">{plan.subtitle}</p>
        </DialogHeader>

        <div className={`rounded-2xl border ${plan.color} p-5 flex flex-col gap-4`}>
          <ul className="space-y-2 text-sm text-gray-700">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
            <span className="text-sm text-gray-500">{plan.priceNote}</span>
          </div>

          <Button
            className={`${plan.buttonColor} text-white h-11 w-full`}
            onClick={() => onSelectPlan(planType)}
          >
            {plan.buttonLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
