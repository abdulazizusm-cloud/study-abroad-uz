import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Политика конфиденциальности",
  description:
    "Политика конфиденциальности ApplySmart — как мы собираем, используем и защищаем ваши персональные данные.",
  alternates: {
    canonical: "https://applysmart.uz/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← Вернуться на главную
          </Link>
        </div>

        {/* ─── RUSSIAN ─────────────────────────────────────────── */}
        <section className="mb-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Политика конфиденциальности
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Последнее обновление: февраль 2026 г.
          </p>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Общие положения</h2>
              <p>
                Настоящая Политика конфиденциальности описывает, как ApplySmart
                («мы», «нас», «наш») собирает, использует и защищает персональные
                данные пользователей сервиса applysmart.uz.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Какие данные мы собираем</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Имя и фамилия</li>
                <li>Адрес электронной почты</li>
                <li>Номер телефона</li>
                <li>Академические данные, введённые в калькулятор (GPA, результаты экзаменов, бюджет)</li>
                <li>Данные, передаваемые при входе через Google OAuth (имя, email, аватар)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Цели обработки данных</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Регистрация и аутентификация пользователей</li>
                <li>Расчёт вероятности поступления и подбор университетов</li>
                <li>Сохранение прогресса и результатов в личном кабинете</li>
                <li>Связь с пользователем по вопросам поступления</li>
                <li>Улучшение сервиса на основе агрегированной статистики</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Третьи стороны</h2>
              <p>
                Для работы сервиса мы используем следующие сторонние платформы:
              </p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li><strong>Supabase</strong> — хранение данных пользователей и аутентификация</li>
                <li><strong>Vercel</strong> — хостинг и аналитика посещений</li>
                <li><strong>Google OAuth</strong> — вход через Google-аккаунт</li>
              </ul>
              <p className="mt-2">
                Данные не передаются третьим лицам в коммерческих целях.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Хранение данных</h2>
              <p>
                Данные хранятся до тех пор, пока существует ваш аккаунт. При удалении
                аккаунта все персональные данные удаляются в течение 30 дней.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Ваши права</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Запросить копию ваших персональных данных</li>
                <li>Исправить неточные данные</li>
                <li>Удалить данные («право на забвение»)</li>
                <li>Отозвать согласие на обработку данных</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Контакты</h2>
              <p>
                По вопросам обработки персональных данных обращайтесь:{" "}
                <a href="https://t.me/applysmartuz" className="text-blue-600 hover:underline">
                  @applysmartuz
                </a>
              </p>
            </div>
          </div>
        </section>

        <hr className="border-gray-200 mb-16" />

        {/* ─── UZBEK ───────────────────────────────────────────── */}
        <section className="mb-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Maxfiylik siyosati
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Oxirgi yangilanish: 2026-yil fevral
          </p>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Umumiy qoidalar</h2>
              <p>
                Ushbu Maxfiylik siyosati ApplySmart ("biz", "bizga", "bizning") applysmart.uz
                xizmati foydalanuvchilarining shaxsiy ma&apos;lumotlarini qanday to&apos;plashi,
                ishlatishi va himoya qilishini tavsiflaydi.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Qanday ma&apos;lumotlar to&apos;planadi</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Ism va familiya</li>
                <li>Elektron pochta manzili</li>
                <li>Telefon raqami</li>
                <li>Kalkulyatorga kiritilgan akademik ma&apos;lumotlar (GPA, imtihon natijalari, byudjet)</li>
                <li>Google OAuth orqali kirishda uzatiladigan ma&apos;lumotlar (ism, email, avatar)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Ma&apos;lumotlarni qayta ishlash maqsadlari</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Foydalanuvchilarni ro&apos;yxatdan o&apos;tkazish va autentifikatsiya qilish</li>
                <li>Qabul ehtimolini hisoblash va universitetlarni tanlash</li>
                <li>Shaxsiy kabinетda natijalarni saqlash</li>
                <li>Qabul masalalari bo&apos;yicha foydalanuvchi bilan muloqot</li>
                <li>Yig&apos;ilgan statistika asosida xizmatni takomillashtirish</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Uchinchi tomonlar</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Supabase</strong> — foydalanuvchi ma&apos;lumotlarini saqlash va autentifikatsiya</li>
                <li><strong>Vercel</strong> — xosting va tashrif analitikasi</li>
                <li><strong>Google OAuth</strong> — Google-akkaunt orqali kirish</li>
              </ul>
              <p className="mt-2">Ma&apos;lumotlar tijorat maqsadida uchinchi shaxslarga uzatilmaydi.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Ma&apos;lumotlarni saqlash</h2>
              <p>
                Ma&apos;lumotlar hisobingiz mavjud bo&apos;lguncha saqlanadi. Hisob o&apos;chirilganda
                barcha shaxsiy ma&apos;lumotlar 30 kun ichida o&apos;chiriladi.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Sizning huquqlaringiz</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Shaxsiy ma&apos;lumotlaringiz nusxasini so&apos;rash</li>
                <li>Noto&apos;g&apos;ri ma&apos;lumotlarni to&apos;g&apos;rilash</li>
                <li>Ma&apos;lumotlarni o&apos;chirish ("unutilish huquqi")</li>
                <li>Ma&apos;lumotlarni qayta ishlashga rozilikni qaytarib olish</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Aloqa</h2>
              <p>
                Shaxsiy ma&apos;lumotlarni qayta ishlash bo&apos;yicha murojaat:{" "}
                <a href="https://t.me/applysmartuz" className="text-blue-600 hover:underline">
                  @applysmartuz
                </a>
              </p>
            </div>
          </div>
        </section>

        <hr className="border-gray-200 mb-16" />

        {/* ─── ENGLISH ─────────────────────────────────────────── */}
        <section className="mb-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            Last updated: February 2026
          </p>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Introduction</h2>
              <p>
                This Privacy Policy explains how ApplySmart ("we", "us", "our") collects,
                uses, and protects the personal data of users of applysmart.uz.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Data We Collect</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>First and last name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Academic data entered into the calculator (GPA, exam scores, budget)</li>
                <li>Data provided via Google OAuth login (name, email, avatar)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Purpose of Processing</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>User registration and authentication</li>
                <li>Calculating admission chances and matching universities</li>
                <li>Saving progress and results in the personal dashboard</li>
                <li>Communicating with users about their application journey</li>
                <li>Improving the service based on aggregated statistics</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Third-Party Services</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Supabase</strong> — user data storage and authentication</li>
                <li><strong>Vercel</strong> — hosting and visit analytics</li>
                <li><strong>Google OAuth</strong> — sign-in via Google account</li>
              </ul>
              <p className="mt-2">Data is never sold or shared with third parties for commercial purposes.</p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">5. Data Retention</h2>
              <p>
                Data is retained as long as your account exists. Upon account deletion,
                all personal data is permanently removed within 30 days.
              </p>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">6. Your Rights</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Request a copy of your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your data (right to be forgotten)</li>
                <li>Withdraw consent to data processing</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">7. Contact</h2>
              <p>
                For data-related requests, please contact:{" "}
                <a href="https://t.me/applysmartuz" className="text-blue-600 hover:underline">
                  @applysmartuz
                </a>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
