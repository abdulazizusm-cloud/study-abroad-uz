// Form data types
export interface FormData {
  citizenship: string;
  country: string;
  level: string;
  gpa: number;
  english: string;
  englishScore?: number;
  budget: string;
}

// University data types
export interface UniversityRequirements {
  minGPA: number;
  english: "IELTS" | "TOEFL" | "None";
  minEnglishScore?: number;
  tuitionUSD: number;
}

export interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  level: string;
  requirements: UniversityRequirements;
}

// Scoring result types
export type ChanceLevel = "High" | "Medium" | "Low";

export interface ScoringResult {
  university: University;
  percentage: number;
  chanceLevel: ChanceLevel;
  explanation: string;
}

// Budget mapping for calculations
export const BUDGET_MAX: Record<string, number> = {
  "до $5k": 5000,
  "$5–10k": 10000,
  "$10–20k": 20000,
  "$20k+": 100000,
};
