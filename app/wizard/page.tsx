import type { Metadata } from "next";
import { WizardForm } from "@/components/wizard-form";

export const metadata: Metadata = {
  title: "Калькулятор шансов поступления",
  description:
    "Введи свои оценки, результаты экзаменов и бюджет — получи персональный список зарубежных университетов с точной вероятностью поступления за 1 минуту.",
  alternates: {
    canonical: "https://applysmart.uz/wizard",
  },
  openGraph: {
    title: "Калькулятор шансов поступления — ApplySmart",
    description:
      "Бесплатный инструмент для оценки шансов поступления в зарубежные университеты. Результат за 1 минуту.",
    url: "https://applysmart.uz/wizard",
  },
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "Как проверить шансы поступления в зарубежный университет",
  description:
    "Пошаговое руководство по использованию калькулятора шансов поступления ApplySmart",
  inLanguage: "ru",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Укажи страну и уровень образования",
      text: "Выбери страну, куда хочешь поступить, и уровень программы: бакалавриат или среднее образование.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Введи академические данные",
      text: "Укажи среднюю оценку (GPA), систему оценивания и результаты языкового экзамена (IELTS, TOEFL, Duolingo).",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Выбери направление и бюджет",
      text: "Укажи желаемый факультет, наличие стипендии и максимальный годовой бюджет.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Получи результат",
      text: "Система рассчитает шансы поступления в каждый подходящий университет с учётом конкуренции.",
    },
  ],
};

export default function WizardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <WizardForm />
    </div>
  );
}
