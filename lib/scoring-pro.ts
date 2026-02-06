import { FormData, University, ScoringResult, ChanceLevel, BUDGET_MAX } from "./types";

/**
 * Calculate the admission chance for a university based on user data - PRO VERSION
 * Features: More realistic scoring with diminishing returns and weight adjustments
 */
export function calculateProChance(userData: FormData, university: University): ScoringResult {
  let positiveBonuses = 0;
  let negativePenalties = 0;

  // 1. GPA matching (graduated: -20 to +20 points)
  let gpaScore = 0;
  if (userData.gpa >= university.requirements.minGPA + 0.3) {
    gpaScore = 20;
  } else if (userData.gpa >= university.requirements.minGPA + 0.1) {
    gpaScore = 10;
  } else if (userData.gpa >= university.requirements.minGPA) {
    gpaScore = 5;
  } else if (userData.gpa >= university.requirements.minGPA - 0.2) {
    gpaScore = -10;
  } else {
    gpaScore = -20;
  }

  if (gpaScore > 0) {
    positiveBonuses += gpaScore;
  } else {
    negativePenalties += gpaScore;
  }

  // 2. English matching
  const englishMatch = checkEnglishRequirement(userData, university);
  let englishScore = 0;
  
  if (englishMatch) {
    englishScore = 20;
  } else if (userData.english === "Нет") {
    englishScore = -25; // Stronger penalty for no English
  } else {
    englishScore = -15; // Below requirements
  }

  if (englishScore > 0) {
    positiveBonuses += englishScore;
  } else {
    negativePenalties += englishScore;
  }

  // 3. Budget matching - PRO version (reduced positive weight, increased penalty)
  const budgetMax = BUDGET_MAX[userData.budget];
  let budgetScore = 0;
  
  if (university.requirements.tuitionUSD <= budgetMax * 0.8) {
    budgetScore = 5; // Well within budget
  } else if (university.requirements.tuitionUSD <= budgetMax) {
    budgetScore = 3; // Barely fits
  } else {
    budgetScore = -25; // Over budget is serious issue
  }

  if (budgetScore > 0) {
    positiveBonuses += budgetScore;
  } else {
    negativePenalties += budgetScore;
  }

  // Calculate score before applying diminishing returns
  const scoreBeforeAdjustment = 50 + positiveBonuses + negativePenalties;
  let adjustedPositiveBonuses = positiveBonuses;

  // PRO FEATURE: Apply diminishing returns to positive bonuses at high scores
  if (scoreBeforeAdjustment >= 85) {
    // Very high score: apply 0.3 multiplier to bonuses (more realistic)
    adjustedPositiveBonuses = positiveBonuses * 0.3;
  } else if (scoreBeforeAdjustment >= 75) {
    // High score: apply 0.5 multiplier to bonuses
    adjustedPositiveBonuses = positiveBonuses * 0.5;
  } else if (scoreBeforeAdjustment >= 65) {
    // Medium-high score: apply 0.7 multiplier
    adjustedPositiveBonuses = positiveBonuses * 0.7;
  }
  // < 65 → no reduction (encouraging for lower scores)

  // Final score calculation
  const finalScore = 50 + adjustedPositiveBonuses + negativePenalties;

  // Clamp score between 5 and 85 (Pro version: max 85% is more realistic)
  const finalPercentage = Math.max(5, Math.min(85, finalScore));

  // Determine chance level (stricter thresholds)
  const chanceLevel = getProChanceLevel(finalPercentage);

  // Generate explanation
  const explanation = generateProExplanation(userData, university, englishMatch, budgetMax);

  return {
    university,
    percentage: Math.round(finalPercentage),
    chanceLevel,
    explanation,
  };
}

/**
 * Check if user's English level meets university requirements
 */
function checkEnglishRequirement(userData: FormData, university: University): boolean {
  if (university.requirements.english === "None") {
    return true;
  }

  if (userData.english === "Нет" || !userData.englishScore) {
    return false;
  }

  if (userData.english !== university.requirements.english) {
    return false;
  }

  return userData.englishScore >= (university.requirements.minEnglishScore || 0);
}

/**
 * Classify percentage into High/Medium/Low with stricter Pro thresholds
 */
function getProChanceLevel(percentage: number): ChanceLevel {
  if (percentage >= 65) return "High";    // Stricter: was 70
  if (percentage >= 35) return "Medium";  // Stricter: was 40
  return "Low";
}

/**
 * Generate human-readable explanation for Pro version
 */
function generateProExplanation(
  userData: FormData,
  university: University,
  englishMatch: boolean,
  budgetMax: number
): string {
  const reasons: string[] = [];

  // GPA with more details
  const gpaDiff = userData.gpa - university.requirements.minGPA;
  if (gpaDiff >= 0.3) {
    reasons.push("GPA значительно выше требований");
  } else if (gpaDiff >= 0.1) {
    reasons.push("GPA выше минимального");
  } else if (gpaDiff >= 0) {
    reasons.push("GPA на минимальном уровне");
  } else {
    reasons.push("GPA ниже требований");
  }

  // English
  if (englishMatch) {
    reasons.push("английский соответствует");
  } else if (userData.english === "Нет") {
    reasons.push("требуется сертификат английского");
  } else {
    reasons.push("английский недостаточен");
  }

  // Budget with context
  const tuition = university.requirements.tuitionUSD;
  if (tuition <= budgetMax * 0.8) {
    reasons.push("хорошо вписывается в бюджет");
  } else if (tuition <= budgetMax) {
    reasons.push("на грани бюджета");
  } else {
    const overPercent = Math.round(((tuition - budgetMax) / budgetMax) * 100);
    reasons.push(`превышает бюджет на ${overPercent}%`);
  }

  return reasons.join(", ") + ".";
}

/**
 * Score all universities for a user and return sorted results (Pro version)
 */
export function scoreAllUniversitiesPro(
  userData: FormData,
  universities: University[]
): ScoringResult[] {
  return universities
    .filter((uni) => uni.level === userData.level && uni.country === userData.country)
    .map((uni) => calculateProChance(userData, uni))
    .sort((a, b) => b.percentage - a.percentage);
}
