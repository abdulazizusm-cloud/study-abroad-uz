import { FormData, University, ScoringResult, ChanceLevel, BUDGET_MAX } from "./types";

/**
 * Calculate the admission chance for a university based on user data
 */
export function calculateChance(userData: FormData, university: University): ScoringResult {
  let score = 50; // Base score

  // GPA matching
  if (userData.gpa >= university.requirements.minGPA) {
    score += 20;
  } else {
    score -= 20;
  }

  // English matching
  const englishMatch = checkEnglishRequirement(userData, university);
  if (englishMatch) {
    score += 20;
  } else {
    score -= 15;
  }

  // Budget matching
  const budgetMax = BUDGET_MAX[userData.budget];
  if (university.requirements.tuitionUSD <= budgetMax) {
    score += 10;
  } else {
    score -= 20;
  }

  // Clamp score between 5 and 95
  const finalScore = Math.max(5, Math.min(95, score));

  // Determine chance level
  const chanceLevel = getChanceLevel(finalScore);

  // Generate explanation
  const explanation = generateExplanation(userData, university, englishMatch, budgetMax);

  return {
    university,
    percentage: finalScore,
    chanceLevel,
    explanation,
  };
}

/**
 * Check if user's English level meets university requirements
 */
function checkEnglishRequirement(userData: FormData, university: University): boolean {
  // If university doesn't require English certification
  if (university.requirements.english === "None") {
    return true;
  }

  // If user doesn't have English certification
  if (userData.english === "Нет" || !userData.englishScore) {
    return false;
  }

  // Check if the type matches (IELTS vs TOEFL)
  if (userData.english !== university.requirements.english) {
    // Different test type, consider it as not matching for simplicity
    // In real app, you'd convert between IELTS and TOEFL scores
    return false;
  }

  // Check if score meets minimum
  return userData.englishScore >= (university.requirements.minEnglishScore || 0);
}

/**
 * Classify percentage into High/Medium/Low
 */
function getChanceLevel(percentage: number): ChanceLevel {
  if (percentage >= 70) return "High";
  if (percentage >= 40) return "Medium";
  return "Low";
}

/**
 * Generate human-readable explanation
 */
function generateExplanation(
  userData: FormData,
  university: University,
  englishMatch: boolean,
  budgetMax: number
): string {
  const reasons: string[] = [];

  // GPA
  if (userData.gpa >= university.requirements.minGPA) {
    reasons.push("GPA соответствует требованиям");
  } else {
    reasons.push("GPA ниже требований");
  }

  // English
  if (englishMatch) {
    reasons.push("английский на нужном уровне");
  } else if (userData.english === "Нет") {
    reasons.push("требуется сертификат английского");
  } else {
    reasons.push("английский на границе требований");
  }

  // Budget
  if (university.requirements.tuitionUSD <= budgetMax) {
    reasons.push("подходит по бюджету");
  } else {
    reasons.push("стоимость выше бюджета");
  }

  return reasons.join(", ") + ".";
}

/**
 * Score all universities for a user and return sorted results
 */
export function scoreAllUniversities(
  userData: FormData,
  universities: University[]
): ScoringResult[] {
  return universities
    .filter((uni) => uni.level === userData.level && uni.country === userData.country)
    .map((uni) => calculateChance(userData, uni))
    .sort((a, b) => b.percentage - a.percentage);
}

/**
 * Sort results by different criteria
 */
export function sortResults(
  results: ScoringResult[],
  sortBy: "chance" | "budget" | "deadline"
): ScoringResult[] {
  const sorted = [...results];

  switch (sortBy) {
    case "chance":
      return sorted.sort((a, b) => b.percentage - a.percentage);
    case "budget":
      return sorted.sort(
        (a, b) => a.university.requirements.tuitionUSD - b.university.requirements.tuitionUSD
      );
    case "deadline":
      // Mock sorting - in real app, you'd have deadline data
      return sorted;
    default:
      return sorted;
  }
}
