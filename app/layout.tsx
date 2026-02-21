import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/auth-context";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const BASE_URL = "https://applysmart.uz";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "ApplySmart — Узнай шансы поступления за рубеж за 1 минуту",
    template: "%s | ApplySmart",
  },
  description:
    "Проверь шансы поступления в зарубежные университеты бесплатно. Введи оценки и уровень английского — получи список подходящих вузов и точную вероятность поступления с учётом конкуренции.",
  keywords: [
    // Russian
    "поступление за рубеж",
    "зарубежные университеты",
    "шансы поступления",
    "учёба за рубежом",
    "поступление в университет",
    "калькулятор шансов",
    "Узбекистан учёба за границей",
    "бакалавриат за рубежом",
    // Uzbek
    "xorij universitetlari",
    "chet elda o'qish",
    "xorijda tahsil",
    "universitetga qabul",
    "o'qish imkoniyati",
    "stipendiya",
    "bakalavr xorij",
    // English
    "study abroad Uzbekistan",
    "university admission calculator",
    "chance of admission",
    "study abroad chances",
    "university acceptance rate",
    "ApplySmart",
  ],
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    type: "website",
    url: BASE_URL,
    siteName: "ApplySmart",
    title: "ApplySmart — Узнай шансы поступления за рубеж за 1 минуту",
    description:
      "Бесплатный калькулятор шансов поступления в зарубежные университеты для студентов из Узбекистана. Введи оценки — получи точный результат.",
    locale: "ru_RU",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ApplySmart — калькулятор шансов поступления за рубеж",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ApplySmart — Узнай шансы поступления за рубеж за 1 минуту",
    description:
      "Бесплатный калькулятор шансов поступления в зарубежные университеты для студентов из Узбекистана.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Replace with actual token from Google Search Console after verifying the site
  // verification: { google: "YOUR_GOOGLE_VERIFICATION_TOKEN" },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "ApplySmart",
  url: BASE_URL,
  logo: `${BASE_URL}/og-image.png`,
  description:
    "Платформа для студентов из Узбекистана, помогающая оценить шансы поступления в зарубежные университеты.",
  foundingCountry: "UZ",
  inLanguage: ["ru", "uz", "en"],
  sameAs: [
    "https://t.me/applysmartuz",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "ApplySmart",
  url: BASE_URL,
  description:
    "Бесплатный калькулятор шансов поступления в зарубежные университеты для студентов из Узбекистана.",
  inLanguage: ["ru", "uz", "en"],
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/results?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased`}
        suppressHydrationWarning
      >
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
