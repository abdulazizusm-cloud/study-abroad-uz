"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ArrowLeft, Send, PartyPopper } from "lucide-react";

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

type Step = "plan" | "contact" | "success";

export function UpgradePlanModal({
  open,
  onOpenChange,
  onSelectPlan,
  planType = "pro",
  source,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectPlan: (plan: UpgradePlanType) => Promise<void> | void;
  planType?: UpgradePlanType;
  source?: string;
}) {
  const plan = PLANS[planType];

  const [step, setStep] = useState<Step>("plan");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [contactError, setContactError] = useState("");
  const [loading, setLoading] = useState(false);

  const resetAndClose = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setStep("plan");
        setName("");
        setContact("");
        setContactError("");
      }, 300);
    }
    onOpenChange(open);
  };

  const handleSendLead = async () => {
    const trimmed = contact.trim();
    if (!trimmed) {
      setContactError("Укажите Telegram username или номер телефона");
      return;
    }
    setContactError("");
    setLoading(true);
    try {
      await fetch("/api/send-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: planType,
          name: name.trim() || undefined,
          contact: trimmed,
          source: source ?? "Не указан",
        }),
      });
    } catch {
      // fail silently — still show success to user
    } finally {
      setLoading(false);
      setStep("success");
    }
  };

  const handleClose = async () => {
    await onSelectPlan(planType);
    resetAndClose(false);
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="sm:max-w-[480px]">

        {/* STEP: plan */}
        {step === "plan" && (
          <>
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
                onClick={() => setStep("contact")}
              >
                {plan.buttonLabel}
              </Button>
            </div>
          </>
        )}

        {/* STEP: contact */}
        {step === "contact" && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setStep("plan")}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Назад"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <DialogTitle className="text-xl font-bold">Оставить контакт</DialogTitle>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Укажите, как с вами связаться — мы напишем в Telegram и согласуем время
              </p>
            </DialogHeader>

            <div className="flex flex-col gap-4 pt-1">
              <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-2.5 flex items-center justify-between">
                <span className="text-sm text-gray-600">Выбранный тариф</span>
                <span className="text-sm font-semibold text-gray-900">{plan.title} — {plan.price}</span>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lead-name" className="text-sm font-medium text-gray-700">
                  Ваше имя <span className="text-gray-400 font-normal">(необязательно)</span>
                </Label>
                <Input
                  id="lead-name"
                  placeholder="Например: Алишер"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lead-contact" className="text-sm font-medium text-gray-700">
                  Telegram username или номер телефона <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lead-contact"
                  placeholder="@username или +998 90 123 45 67"
                  value={contact}
                  onChange={(e) => { setContact(e.target.value); setContactError(""); }}
                  className={`h-11 ${contactError ? "border-red-500" : ""}`}
                />
                {contactError && (
                  <p className="text-red-500 text-sm">{contactError}</p>
                )}
              </div>

              <Button
                className={`${plan.buttonColor} text-white h-11 w-full flex items-center gap-2`}
                onClick={handleSendLead}
                disabled={loading}
              >
                <Send className="w-4 h-4" />
                {loading ? "Отправляем..." : "Отправить заявку"}
              </Button>
            </div>
          </>
        )}

        {/* STEP: success */}
        {step === "success" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold sr-only">Заявка принята</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <PartyPopper className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Заявка принята!</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
                  Мы свяжемся с вами в Telegram в ближайшее время и согласуем удобное время.
                </p>
              </div>
              <Button
                className="w-full h-11 bg-gray-900 hover:bg-gray-800 text-white rounded-xl"
                onClick={handleClose}
              >
                Закрыть
              </Button>
            </div>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}
