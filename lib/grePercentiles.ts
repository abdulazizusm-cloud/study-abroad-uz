/**
 * GRE and GMAT Score to Percentile Conversion Tables
 * Based on official ETS and GMAC data
 */

export interface PercentileEntry {
  score: number;
  percentile: number;
}

// GRE Verbal Reasoning (130-170)
export const GRE_VERBAL_TABLE: PercentileEntry[] = [
  { score: 170, percentile: 99 },
  { score: 169, percentile: 99 },
  { score: 168, percentile: 98 },
  { score: 167, percentile: 98 },
  { score: 166, percentile: 97 },
  { score: 165, percentile: 96 },
  { score: 164, percentile: 94 },
  { score: 163, percentile: 93 },
  { score: 162, percentile: 91 },
  { score: 161, percentile: 89 },
  { score: 160, percentile: 86 },
  { score: 159, percentile: 84 },
  { score: 158, percentile: 81 },
  { score: 157, percentile: 78 },
  { score: 156, percentile: 75 },
  { score: 155, percentile: 71 },
  { score: 154, percentile: 67 },
  { score: 153, percentile: 63 },
  { score: 152, percentile: 59 },
  { score: 151, percentile: 55 },
  { score: 150, percentile: 50 },
  { score: 149, percentile: 46 },
  { score: 148, percentile: 42 },
  { score: 147, percentile: 38 },
  { score: 146, percentile: 34 },
  { score: 145, percentile: 30 },
  { score: 144, percentile: 27 },
  { score: 143, percentile: 24 },
  { score: 142, percentile: 21 },
  { score: 141, percentile: 18 },
  { score: 140, percentile: 16 },
  { score: 139, percentile: 14 },
  { score: 138, percentile: 12 },
  { score: 137, percentile: 10 },
  { score: 136, percentile: 9 },
  { score: 135, percentile: 7 },
  { score: 134, percentile: 6 },
  { score: 133, percentile: 5 },
  { score: 132, percentile: 4 },
  { score: 131, percentile: 3 },
  { score: 130, percentile: 2 },
];

// GRE Quantitative Reasoning (130-170)
export const GRE_QUANT_TABLE: PercentileEntry[] = [
  { score: 170, percentile: 96 },
  { score: 169, percentile: 93 },
  { score: 168, percentile: 90 },
  { score: 167, percentile: 86 },
  { score: 166, percentile: 82 },
  { score: 165, percentile: 78 },
  { score: 164, percentile: 74 },
  { score: 163, percentile: 70 },
  { score: 162, percentile: 66 },
  { score: 161, percentile: 61 },
  { score: 160, percentile: 57 },
  { score: 159, percentile: 53 },
  { score: 158, percentile: 49 },
  { score: 157, percentile: 45 },
  { score: 156, percentile: 42 },
  { score: 155, percentile: 38 },
  { score: 154, percentile: 35 },
  { score: 153, percentile: 32 },
  { score: 152, percentile: 29 },
  { score: 151, percentile: 26 },
  { score: 150, percentile: 24 },
  { score: 149, percentile: 21 },
  { score: 148, percentile: 19 },
  { score: 147, percentile: 17 },
  { score: 146, percentile: 16 },
  { score: 145, percentile: 14 },
  { score: 144, percentile: 12 },
  { score: 143, percentile: 11 },
  { score: 142, percentile: 10 },
  { score: 141, percentile: 9 },
  { score: 140, percentile: 8 },
  { score: 139, percentile: 7 },
  { score: 138, percentile: 6 },
  { score: 137, percentile: 5 },
  { score: 136, percentile: 5 },
  { score: 135, percentile: 4 },
  { score: 134, percentile: 3 },
  { score: 133, percentile: 3 },
  { score: 132, percentile: 2 },
  { score: 131, percentile: 2 },
  { score: 130, percentile: 1 },
];

// GRE Analytical Writing (0.0-6.0, step 0.5)
export const GRE_AW_TABLE: PercentileEntry[] = [
  { score: 6.0, percentile: 99 },
  { score: 5.5, percentile: 98 },
  { score: 5.0, percentile: 93 },
  { score: 4.5, percentile: 82 },
  { score: 4.0, percentile: 60 },
  { score: 3.5, percentile: 42 },
  { score: 3.0, percentile: 18 },
  { score: 2.5, percentile: 8 },
  { score: 2.0, percentile: 2 },
  { score: 1.5, percentile: 1 },
  { score: 1.0, percentile: 0 },
  { score: 0.5, percentile: 0 },
  { score: 0.0, percentile: 0 },
];

// GMAT Quantitative Reasoning (60-90)
export const GMAT_QUANT_TABLE: PercentileEntry[] = [
  { score: 90, percentile: 97 },
  { score: 89, percentile: 94 },
  { score: 88, percentile: 91 },
  { score: 87, percentile: 88 },
  { score: 86, percentile: 85 },
  { score: 85, percentile: 82 },
  { score: 84, percentile: 78 },
  { score: 83, percentile: 75 },
  { score: 82, percentile: 71 },
  { score: 81, percentile: 67 },
  { score: 80, percentile: 63 },
  { score: 79, percentile: 59 },
  { score: 78, percentile: 55 },
  { score: 77, percentile: 51 },
  { score: 76, percentile: 47 },
  { score: 75, percentile: 43 },
  { score: 74, percentile: 40 },
  { score: 73, percentile: 36 },
  { score: 72, percentile: 33 },
  { score: 71, percentile: 30 },
  { score: 70, percentile: 27 },
  { score: 69, percentile: 24 },
  { score: 68, percentile: 21 },
  { score: 67, percentile: 19 },
  { score: 66, percentile: 17 },
  { score: 65, percentile: 15 },
  { score: 64, percentile: 13 },
  { score: 63, percentile: 11 },
  { score: 62, percentile: 9 },
  { score: 61, percentile: 8 },
  { score: 60, percentile: 6 },
];

// GMAT Verbal Reasoning (60-90)
export const GMAT_VERBAL_TABLE: PercentileEntry[] = [
  { score: 90, percentile: 99 },
  { score: 89, percentile: 99 },
  { score: 88, percentile: 98 },
  { score: 87, percentile: 97 },
  { score: 86, percentile: 96 },
  { score: 85, percentile: 95 },
  { score: 84, percentile: 93 },
  { score: 83, percentile: 91 },
  { score: 82, percentile: 89 },
  { score: 81, percentile: 87 },
  { score: 80, percentile: 84 },
  { score: 79, percentile: 81 },
  { score: 78, percentile: 78 },
  { score: 77, percentile: 75 },
  { score: 76, percentile: 71 },
  { score: 75, percentile: 68 },
  { score: 74, percentile: 64 },
  { score: 73, percentile: 60 },
  { score: 72, percentile: 56 },
  { score: 71, percentile: 52 },
  { score: 70, percentile: 48 },
  { score: 69, percentile: 44 },
  { score: 68, percentile: 40 },
  { score: 67, percentile: 36 },
  { score: 66, percentile: 33 },
  { score: 65, percentile: 29 },
  { score: 64, percentile: 26 },
  { score: 63, percentile: 23 },
  { score: 62, percentile: 20 },
  { score: 61, percentile: 17 },
  { score: 60, percentile: 14 },
];

/**
 * Lookup percentile for a given score
 * - Finds exact match if available
 * - Otherwise returns nearest lower score's percentile
 * @param table - Percentile table to search
 * @param score - Score to lookup
 * @returns Percentile (0-99) or null if score is invalid
 */
export function lookupPercentile(
  table: PercentileEntry[],
  score: number | string | null | undefined
): number | null {
  // Handle empty/invalid input
  if (score === null || score === undefined || score === "") {
    return null;
  }

  const numScore = typeof score === "string" ? parseFloat(score) : score;

  // Validate number
  if (isNaN(numScore)) {
    return null;
  }

  // Find exact match
  const exactMatch = table.find((entry) => entry.score === numScore);
  if (exactMatch) {
    return exactMatch.percentile;
  }

  // Find nearest lower score (interpolate down)
  // Sort table by score descending
  const sortedTable = [...table].sort((a, b) => b.score - a.score);

  // Find the first entry with score <= numScore
  for (const entry of sortedTable) {
    if (entry.score <= numScore) {
      return entry.percentile;
    }
  }

  // If score is below minimum, return the lowest percentile
  if (sortedTable.length > 0) {
    return sortedTable[sortedTable.length - 1].percentile;
  }

  return null;
}
