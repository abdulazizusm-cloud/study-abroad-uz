import {
  WizardFormData,
  ExtendedUniversity,
  WizardScoringResult,
  WizardChanceLevel,
  WIZARD_BUDGET_MAX,
} from "./wizard-types";

/**
 * Convert user's grade to 4.0 GPA scale
 */
export function convertToGPA4Scale(
  grade: string,
  gradingScheme: string
): number {
  const numGrade = parseFloat(grade);
  if (isNaN(numGrade)) return 0;

  switch (gradingScheme) {
    case "5-point":
      return (numGrade / 5) * 4.0;
    case "4-point":
      return numGrade;
    case "Percentage":
      return (numGrade / 100) * 4.0;
    default:
      return 0;
  }
}

/**
 * Check if English test requirement is met (SIMPLE version)
 */
export function checkEnglishRequirement(
  formData: WizardFormData,
  university: ExtendedUniversity
): { meets: boolean; score: number | null; status: "above" | "equal" | "below" | "missing" | "not_required" } {
  if (!university.requirements.englishRequired) {
    return { meets: true, score: null, status: "not_required" };
  }

  const examType = formData.englishExamType;
  
  // No English test provided
  if (!examType || examType === "None") {
    return { meets: false, score: null, status: "missing" };
  }

  // Check if university accepts this test type
  // SIMPLE: если тип теста не подходит, считаем как missing
  if (!university.requirements.acceptedEnglishTests?.includes(examType)) {
    return { meets: false, score: null, status: "missing" };
  }

  const userScore = parseFloat(formData.englishScore || "0");
  let minScore = 0;
  
  switch (examType) {
    case "IELTS":
      minScore = university.requirements.minIELTS || 0;
      break;
    case "TOEFL":
      minScore = university.requirements.minTOEFL || 0;
      break;
    case "Duolingo":
      minScore = university.requirements.minDuolingo || 0;
      break;
    default:
      return { meets: false, score: null, status: "missing" };
  }

  if (userScore > minScore) {
    return { meets: true, score: userScore, status: "above" };
  } else if (userScore === minScore) {
    return { meets: true, score: userScore, status: "equal" };
  } else {
    return { meets: false, score: userScore, status: "below" };
  }
}

/**
 * Check if standardized test requirement is met (SIMPLE version)
 * Supports both GRE and GMAT requirements simultaneously
 */
export function checkStandardizedTest(
  formData: WizardFormData,
  university: ExtendedUniversity
): { meets: boolean; required: boolean; greResult?: boolean; gmatResult?: boolean } {
  const { greRequired, gmatRequired } = university.requirements;

  // If no standardized test is required
  if (!greRequired && !gmatRequired) {
    return { meets: true, required: false };
  }

  const userExamType = formData.standardizedExamType;
  let greResult: boolean | undefined;
  let gmatResult: boolean | undefined;

  // Check GRE if required
  if (greRequired) {
    if (userExamType === "GRE") {
      const verbal = parseFloat(formData.greVerbal || "0");
      const quant = parseFloat(formData.greQuant || "0");
      const writing = parseFloat(formData.greWriting || "0");

      const meetsVerbal = verbal >= (university.requirements.minGREVerbal || 0);
      const meetsQuant = quant >= (university.requirements.minGREQuant || 0);
      const meetsWriting = writing >= (university.requirements.minGREWriting || 0);

      greResult = meetsVerbal && meetsQuant && meetsWriting;
    } else {
      greResult = false; // GRE required but not provided
    }
  }

  // Check GMAT if required
  if (gmatRequired) {
    if (userExamType === "GMAT") {
      const total = parseFloat(formData.gmatTotal || "0");
      gmatResult = total >= (university.requirements.minGMAT || 0);
    } else {
      gmatResult = false; // GMAT required but not provided
    }
  }

  // Determine final result
  // If both are required, both must meet
  // If only one is required, that one must meet
  let finalMeets = true;
  if (greRequired && gmatRequired) {
    // Both required: both must pass
    finalMeets = (greResult === true) && (gmatResult === true);
  } else if (greRequired) {
    finalMeets = greResult === true;
  } else if (gmatRequired) {
    finalMeets = gmatResult === true;
  }

  return { 
    meets: finalMeets, 
    required: true,
    greResult,
    gmatResult
  };
}

/**
 * Calculate admission chance percentage - SIMPLE algorithm
 */
export function calculateSimpleChance(
  formData: WizardFormData,
  university: ExtendedUniversity
): WizardScoringResult {
  let score = 50; // Base score

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

  if (minGPA === null) {
    // No GPA requirement → 0 points (neutral)
    score += 0;
    gpaMatch = true; // Consider it a match for display purposes
  } else {
    const gpaDifference = userGPA - minGPA;
    gpaMatch = userGPA >= minGPA;

    if (gpaDifference >= 0.3) {
      score += 20;
    } else if (gpaDifference >= 0.1) {
      score += 10;
    } else if (gpaDifference >= -0.09) {
      score += 0;
    } else if (gpaDifference >= -0.3) {
      score -= 10;
    } else {
      score -= 20;
    }
  }

  // 2. English Test Matching (graduated: -20 to +20 points)
  const englishCheck = checkEnglishRequirement(formData, university);
  
  if (englishCheck.status === "above") {
    score += 20; // Score > minimum
  } else if (englishCheck.status === "equal") {
    score += 10; // Score == minimum
  } else if (englishCheck.status === "below") {
    score -= 15; // Score < minimum
  } else if (englishCheck.status === "missing") {
    score -= 20; // Test required but missing
  }
  // "not_required" = 0 (no change)

  // 3. Standardized Tests (+/- 15 points)
  const standardizedCheck = checkStandardizedTest(formData, university);
  
  if (standardizedCheck.required) {
    if (standardizedCheck.meets) {
      score += 15;
    } else {
      score -= 15;
    }
  }

  // 4. Budget Matching (+/- 15 points) - SIMPLE version
  const userBudgetMax = WIZARD_BUDGET_MAX[formData.budget] || 0;
  const tuition = university.requirements.tuitionUSD;
  const budgetMatch = tuition <= userBudgetMax;

  if (budgetMatch) {
    score += 15;
  } else {
    score -= 15;
  }

  // 5. Discipline Matching (+/- 10 points)
  if (disciplineMatch) {
    score += 10;
  } else {
    score -= 10;
  }

  // 6. Scholarship bonus (+5 points)
  if (
    university.requirements.scholarshipAvailable &&
    (formData.financeSource === "Scholarship" || formData.financeSource === "Mixed")
  ) {
    score += 5;
  }

  // Clamp score between 5 and 95
  const finalPercentage = Math.max(5, Math.min(95, score));

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
    minGPA
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
 * Generate detailed explanation in Russian
 */
function generateDetailedExplanation(
  gpaMatch: boolean,
  englishMatch: boolean,
  budgetMatch: boolean,
  standardizedCheck: { meets: boolean; required: boolean },
  userGPA: number,
  minGPA: number | null
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

  // Budget
  if (budgetMatch) {
    parts.push("стоимость в рамках бюджета");
  } else {
    parts.push("стоимость превышает бюджет");
  }

  // Standardized tests
  if (standardizedCheck.required) {
    if (standardizedCheck.meets) {
      parts.push("результаты GRE/GMAT соответствуют требованиям");
    } else {
      parts.push("требуются более высокие баллы GRE/GMAT");
    }
  }

  return parts.join(", ") + ".";
}
