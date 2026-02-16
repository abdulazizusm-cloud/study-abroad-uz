// Wizard form data interface
export interface WizardFormData {
  // Step 1 - Basic Information
  nationality: string;
  specifyNationality?: string;
  countryOfStudy: string;
  level: string;
  gradingScheme: string;
  gradingAverage: string;
  financeSource: string;
  budget: string;
  
  // Step 2 - Exams
  englishExamType: string;
  englishScore?: string;
  standardizedExamType: string;
  greVerbal?: string;
  greQuant?: string;
  greWriting?: string;
  gmatTotal?: string;
  
  // Step 3 - Field of Study
  programGoal: string;
  faculty: string[];
  /** Whether the student is looking for a scholarship (Yes/No) */
  scholarship?: string;
  /** @deprecated Legacy: used when reading old saved form data */
  discipline?: string;
}

// Extended university requirements
export interface ExtendedUniversityRequirements {
  // Academic
  minGPA: number | null; // in 4.0 scale, null if no GPA requirement
  acceptsGradingSchemes: string[]; // ["4-point", "5-point", "Percentage"]
  
  // English tests
  englishRequired: boolean;
  acceptedEnglishTests: string[]; // ["IELTS", "TOEFL", "Duolingo"]
  minIELTS?: number;
  minTOEFL?: number;
  minDuolingo?: number;
  
  // Standardized tests (optional)
  greRequired?: boolean;
  minGREVerbal?: number;
  minGREQuant?: number;
  minGREWriting?: number;
  
  gmatRequired?: boolean;
  minGMAT?: number;
  
  // Financial
  tuitionUSD: number;
  scholarshipAvailable: boolean;
}

export interface ExtendedUniversity {
  id: string;
  name: string;
  country: string;
  city: string;
  level: string; // "Bachelor", "Master", "Foundation"
  disciplines: string[]; // ["Business", "Engineering", etc.]
  qsRanking?: number; // QS World University Ranking
  requirements: ExtendedUniversityRequirements;
}

// Scoring algorithm type
export type ScoringAlgorithm = "simple" | "pro";

// Scoring result
export type WizardChanceLevel = "High" | "Medium" | "Low";

export interface WizardScoringResult {
  university: ExtendedUniversity;
  percentage: number;
  chanceLevel: WizardChanceLevel;
  explanation: string;
  matchDetails: {
    gpaMatch: boolean;
    englishMatch: boolean;
    budgetMatch: boolean;
    disciplineMatch: boolean;
    standardizedTestMatch: boolean;
  };
}

// Budget mapping constants
export const WIZARD_BUDGET_MAX: Record<string, number> = {
  "Up to $5,000": 5000,
  "$5,000–$10,000": 10000,
  "$10,000–$20,000": 20000,
  "$20,000+": 100000,
};

// Level mapping
export const LEVEL_MAPPING: Record<string, string> = {
  "Bachelor": "Бакалавриат",
  "Master": "Магистратура",
  "Foundation": "Foundation",
};
