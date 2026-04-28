import type { CategoryScores } from "../types/report.types.ts";
export function calculateOverallScore(scores: CategoryScores): number {
  const total =
    scores.plumbing * 0.4 + scores.electrical * 0.4 + scores.pest * 0.2;

  return Math.round(total);
}
