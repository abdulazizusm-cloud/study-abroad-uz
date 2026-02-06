import { Card } from "@/components/ui/card";
import { FormData } from "@/lib/types";
import { 
  Globe, 
  GraduationCap, 
  Languages, 
  DollarSign, 
  TrendingUp,
  CheckCircle2
} from "lucide-react";

interface ResultsSummaryProps {
  formData: FormData;
}

export function ResultsSummary({ formData }: ResultsSummaryProps) {
  return (
    <Card className="p-8 bg-blue-50 rounded-3xl shadow-lg mb-10 border border-blue-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">
            Ваши параметры поиска
          </h3>
          <p className="text-sm text-gray-600">Результаты подобраны на основе этих данных</p>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <p className="text-xs font-semibold text-gray-600">Страна</p>
          </div>
          <p className="font-bold text-gray-900 text-lg">{formData.country}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <GraduationCap className="w-4 h-4 text-purple-600" />
            <p className="text-xs font-semibold text-gray-600">Уровень</p>
          </div>
          <p className="font-bold text-gray-900 text-lg">{formData.level}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <p className="text-xs font-semibold text-gray-600">GPA</p>
          </div>
          <p className="font-bold text-gray-900 text-lg">{formData.gpa}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Languages className="w-4 h-4 text-orange-600" />
            <p className="text-xs font-semibold text-gray-600">Английский</p>
          </div>
          <p className="font-bold text-gray-900 text-lg">
            {formData.english}
            {formData.englishScore && ` (${formData.englishScore})`}
          </p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-pink-600" />
            <p className="text-xs font-semibold text-gray-600">Бюджет</p>
          </div>
          <p className="font-bold text-gray-900 text-lg">{formData.budget}</p>
        </div>
      </div>
    </Card>
  );
}
