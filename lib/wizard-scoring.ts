import {
  WizardFormData,
  ExtendedUniversity,
  WizardScoringResult,
  ScoringAlgorithm,
} from "./wizard-types";

import { calculateSimpleChance } from "./wizard-scoring-simple";
import { calculateProChance } from "./wizard-scoring-pro";

/**
 * Calculate admission chance percentage for a single university
 * Unified interface - delegates to Simple or Pro algorithm
 */
export function calculateWizardChance(
  formData: WizardFormData,
  university: ExtendedUniversity,
  algorithm: ScoringAlgorithm = "simple"
): WizardScoringResult {
  if (algorithm === "pro") {
    return calculateProChance(formData, university);
  }
  return calculateSimpleChance(formData, university);
}

/**
 * Score all universities and filter by basic criteria
 */
export function scoreAllUniversities(
  formData: WizardFormData,
  universities: ExtendedUniversity[],
  algorithm: ScoringAlgorithm = "simple"
): WizardScoringResult[] {
  const results = universities
    .map((uni) => calculateWizardChance(formData, uni, algorithm))
    .filter((result) => {
      // Filter by country if selected
      if (formData.countryOfStudy && formData.countryOfStudy !== "Any") {
        return result.university.country === formData.countryOfStudy;
      }
      return true;
    });

  return results;
}

/**
 * Sort results by percentage (descending)
 */
export function sortResultsByChance(
  results: WizardScoringResult[]
): WizardScoringResult[] {
  return [...results].sort((a, b) => b.percentage - a.percentage);
}

/**
 * Sort results by tuition (ascending)
 */
export function sortResultsByBudget(
  results: WizardScoringResult[]
): WizardScoringResult[] {
  return [...results].sort(
    (a, b) => a.university.requirements.tuitionUSD - b.university.requirements.tuitionUSD
  );
}
