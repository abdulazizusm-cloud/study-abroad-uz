import { Card } from "@/components/ui/card";
import { ClipboardEdit, Search, TrendingUp } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      icon: ClipboardEdit,
      title: "Заполни короткую анкету",
      description:
        "Укажи свои оценки, уровень английского и бюджет — это займёт всего 1 минуту"
    },
    {
      icon: Search,
      title: "Мы подберём подходящие варианты",
      description:
        "Наш алгоритм проанализирует требования университетов и найдёт те, что подходят именно тебе"
    },
    {
      icon: TrendingUp,
      title: "Ты увидишь шанс поступления в %",
      description:
        "Получишь список университетов с вероятностью поступления и понятными пояснениями"
    },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-2 bg-blue-100 rounded-full mb-4">
            <span className="text-sm font-semibold text-blue-700">3 простых шага</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Как это работает
          </h2>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Простой процесс для проверки твоих шансов на поступление
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card
                key={index}
                className="group p-8 lg:p-10 bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 relative border border-gray-200 hover:border-blue-300"
              >
                {/* Step Number */}
                <div className="absolute -top-6 -left-6 w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="mb-8 mt-6">
                  <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <Icon className="w-10 h-10 text-blue-600" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {step.description}
                </p>

                {/* Connector line (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-10 w-10 h-1 bg-gray-200"></div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
