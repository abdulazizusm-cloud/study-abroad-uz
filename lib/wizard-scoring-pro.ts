import {
  WizardFormData,
  ExtendedUniversity,
  WizardScoringResult,
  WizardChanceLevel,
  WIZARD_BUDGET_MAX,
} from "./wizard-types";

import {
  convertToGPA4Scale,
  checkEnglishRequirement,
  checkStandardizedTest,
} from "./wizard-scoring-simple";

/**
 * Calculate admission chance percentage - PRO algorithm
 * Features: diminishing returns on high scores, reduced budget weight
 */
export function calculateProChance(
  formData: WizardFormData,
  university: ExtendedUniversity
): WizardScoringResult {
  let positiveBonuses = 0;
  let negativePenalties = 0;

  // Check basic filters first
  const levelMatch = university.level === formData.level;
  const disciplineMatch = university.disciplines.includes(formData.discipline);

  if (!levelMatch || !disciplineMatch) {
    // If basic filters don't match, return very low score
    return {
      university,
      percentage: 5,
      chanceLevel: "Low",
      explanation: "Университет не соответствует выбранному уровню или направлению обучения.",
      matchDetails: {
        gpaMatch: false,
        englishMatch: false,
        budgetMatch: false,
        disciplineMatch,
        standardizedTestMatch: false,
      },
    };
  }

  // 1. GPA Matching (graduated: -20 to +20 points)
  const userGPA = convertToGPA4Scale(formData.gradingAverage, formData.gradingScheme);
  const minGPA = university.requirements.minGPA;
  let gpaMatch = false;
  let gpaScore = 0;

  if (minGPA === null) {
    // No GPA requirement → 0 points (neutral)
    gpaScore = 0;
    gpaMatch = true;
  } else {
    const gpaDifference = userGPA - minGPA;
    gpaMatch = userGPA >= minGPA;

    if (gpaDifference >= 0.3) {
      gpaScore = 20;
    } else if (gpaDifference >= 0.1) {
      gpaScore = 10;
    } else if (gpaDifference >= -0.09) {
      gpaScore = 0;
    } else if (gpaDifference >= -0.3) {
      gpaScore = -10;
    } else {
      gpaScore = -20;
    }
  }

  // Separate positive and negative
  if (gpaScore > 0) {
    positiveBonuses += gpaScore;
  } else {
    negativePenalties += gpaScore;
  }

  // 2. English Test Matching (graduated: -20 to +20 points)
  const englishCheck = checkEnglishRequirement(formData, university);
  let englishScore = 0;
  
  if (englishCheck.status === "above") {
    englishScore = 20;
  } else if (englishCheck.status === "equal") {
    englishScore = 10;
  } else if (englishCheck.status === "below") {
    englishScore = -15;
  } else if (englishCheck.status === "missing") {
    englishScore = -20;
  }
  // "not_required" = 0

  if (englishScore > 0) {
    positiveBonuses += englishScore;
  } else {
    negativePenalties += englishScore;
  }

  // 3. Standardized Tests (+/- 15 points)
  const standardizedCheck = checkStandardizedTest(formData, university);
  let standardizedScore = 0;
  
  if (standardizedCheck.required) {
    if (standardizedCheck.meets) {
      standardizedScore = 15;
    } else {
      standardizedScore = -15;
    }
  }

  if (standardizedScore > 0) {
    positiveBonuses += standardizedScore;
  } else {
    negativePenalties += standardizedScore;
  }

  // 4. Budget Matching - PRO version (reduced weight: +5/-20)
  const userBudgetMax = WIZARD_BUDGET_MAX[formData.budget] || 0;
  const tuition = university.requirements.tuitionUSD;
  const budgetMatch = tuition <= userBudgetMax;
  let budgetScore = 0;

  if (budgetMatch) {
    budgetScore = 5; // Reduced from +15 in Simple
  } else {
    budgetScore = -20; // Increased penalty from -15 in Simple
  }

  if (budgetScore > 0) {
    positiveBonuses += budgetScore;
  } else {
    negativePenalties += budgetScore;
  }

  // 5. Discipline Matching (+/- 10 points)
  let disciplineScore = disciplineMatch ? 10 : -10;
  
  if (disciplineScore > 0) {
    positiveBonuses += disciplineScore;
  } else {
    negativePenalties += disciplineScore;
  }

  // 6. Scholarship bonus (+5 points)
  if (
    university.requirements.scholarshipAvailable &&
    (formData.financeSource === "Scholarship" || formData.financeSource === "Mixed")
  ) {
    positiveBonuses += 5;
  }

  // PRO FEATURE: Apply diminishing returns to positive bonuses
  const scoreBeforeClamp = 50 + positiveBonuses + negativePenalties;
  let adjustedPositiveBonuses = positiveBonuses;

  if (scoreBeforeClamp >= 90) {
    // Very high score: apply 0.25 multiplier to bonuses
    adjustedPositiveBonuses = positiveBonuses * 0.25;
  } else if (scoreBeforeClamp >= 80) {
    // High score: apply 0.50 multiplier to bonuses
    adjustedPositiveBonuses = positiveBonuses * 0.50;
  }
  // < 80 → no reduction

  // Final score calculation
  const finalScore = 50 + adjustedPositiveBonuses + negativePenalties;
  
  // Clamp score between 5 and 95
  const finalPercentage = Math.max(5, Math.min(95, finalScore));

  // Determine chance level
  let chanceLevel: WizardChanceLevel;
  if (finalPercentage >= 70) {
    chanceLevel = "High";
  } else if (finalPercentage >= 40) {
    chanceLevel = "Medium";
  } else {
    chanceLevel = "Low";
  }

  // Generate explanation
  const explanation = generateDetailedExplanation(
    gpaMatch,
    englishCheck.meets,
    budgetMatch,
    standardizedCheck,
    userGPA,
    minGPA,
    scoreBeforeClamp >= 80 // Indicate if diminishing returns applied
  );

  return {
    university,
    percentage: finalPercentage,
    chanceLevel,
    explanation,
    matchDetails: {
      gpaMatch,
      englishMatch: englishCheck.meets,
      budgetMatch,
      disciplineMatch,
      standardizedTestMatch: standardizedCheck.required ? standardizedCheck.meets : true,
    },
  };
}

/**
 * Generate detailed explanation in Russian (PRO version)
 */
function generateDetailedExplanation(
  gpaMatch: boolean,
  englishMatch: boolean,
  budgetMatch: boolean,
  standardizedCheck: { meets: boolean; required: boolean },
  userGPA: number,
  minGPA: number | null,
  diminishingApplied: boolean
): string {
  const parts: string[] = [];

  // GPA (more detailed)
  if (minGPA === null) {
    parts.push("GPA не требуется");
  } else {
    const gpaDifference = userGPA - minGPA;
    
    if (gpaDifference >= 0.3) {
      parts.push(`Ваш GPA (${userGPA.toFixed(2)}) значительно выше требований (${minGPA.toFixed(2)})`);
    } else if (gpaDifference >= 0.1) {
      parts.push(`Ваш GPA (${userGPA.toFixed(2)}) выше минимального (${minGPA.toFixed(2)})`);
    } else if (gpaDifference >= -0.09) {
      parts.push(`Ваш GPA (${userGPA.toFixed(2)}) на минимальном уровне (${minGPA.toFixed(2)})`);
    } else if (gpaDifference >= -0.3) {
      parts.push(`Ваш GPA (${userGPA.toFixed(2)}) немного ниже требований (${minGPA.toFixed(2)})`);
    } else {
      parts.push(`Ваш GPA (${userGPA.toFixed(2)}) значительно ниже требований (${minGPA.toFixed(2)})`);
    }
  }

  // English
  if (englishMatch) {
    parts.push("английский на требуемом уровне");
  } else {
    parts.push("английский не соответствует требованиям");
  }

  // Budget (PRO explanation - different weight)
  if (budgetMatch) {
    parts.push("стоимость в рамках бюджета");
  } else {
    parts.push("стоимость значительно превышает бюджет");
  }

  // Standardized tests
  if (standardizedCheck.required) {
    if (standardizedCheck.meets) {
      parts.push("результаты GRE/GMAT соответствуют требованиям");
    } else {
      parts.push("требуются более высокие баллы GRE/GMAT");
    }
  }

  let explanation = parts.join(", ") + ".";

  // Add note about Pro algorithm if diminishing returns applied
  if (diminishingApplied) {
    explanation += " (Pro расчет: учтены конкурентность и реалистичность)";
  }

  return explanation;
}
