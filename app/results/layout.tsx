import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Результаты подбора университетов",
  description:
    "Персональный список зарубежных университетов, подходящих по твоим оценкам, уровню английского и бюджету. Узнай вероятность поступления в каждый вуз.",
  alternates: {
    canonical: "https://applysmart.uz/results",
  },
  openGraph: {
    title: "Результаты подбора университетов — ApplySmart",
    description:
      "Список зарубежных университетов с вероятностью поступления, рассчитанной по твоим данным.",
    url: "https://applysmart.uz/results",
  },
};

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Результаты подбора университетов — ApplySmart",
  description:
    "Персональный список зарубежных университетов с рассчитанной вероятностью поступления.",
  url: "https://applysmart.uz/results",
  inLanguage: "ru",
  isPartOf: {
    "@type": "WebSite",
    name: "ApplySmart",
    url: "https://applysmart.uz",
  },
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      {children}
    </>
  );
}
