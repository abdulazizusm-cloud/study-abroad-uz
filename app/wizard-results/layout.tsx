import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Твои шансы поступления",
  description:
    "Подробные результаты анализа твоих шансов поступления в зарубежные университеты с учётом реальной конкуренции, академических показателей и требований вузов.",
  alternates: {
    canonical: "https://applysmart.uz/wizard-results",
  },
  openGraph: {
    title: "Твои шансы поступления — ApplySmart",
    description:
      "Персональный анализ шансов поступления в зарубежные университеты с учётом конкуренции.",
    url: "https://applysmart.uz/wizard-results",
  },
};

const webPageSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Твои шансы поступления — ApplySmart",
  description:
    "Персональный анализ шансов поступления в зарубежные университеты с учётом реальной конкуренции.",
  url: "https://applysmart.uz/wizard-results",
  inLanguage: "ru",
  isPartOf: {
    "@type": "WebSite",
    name: "ApplySmart",
    url: "https://applysmart.uz",
  },
};

export default function WizardResultsLayout({
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
