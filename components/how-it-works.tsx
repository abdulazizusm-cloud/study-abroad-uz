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
    <section id="how-it-works" className="py-12 sm:py-16 md:py-24 px-3 sm:px-4 md:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-16 md:mb-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-gray-900 mb-4 sm:mb-6">
            Как узнать шансы
          </h2>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
            Простой процесс для проверки твоих шансов на поступление
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card
                key={index}
                className="group p-6 sm:p-8 lg:p-10 bg-white rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 relative border border-gray-200 hover:border-blue-300"
              >
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 sm:-top-6 sm:-left-6 w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className="mb-6 sm:mb-8 mt-4 sm:mt-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <Icon className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm sm:text-base md:text-lg">
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
