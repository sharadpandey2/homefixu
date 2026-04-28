export function mergeRecommendations(ruleRecs: any[], aiRecs: string[]) {
  const combined = [...ruleRecs.map((r) => r.title), ...aiRecs];

  const unique = Array.from(new Set(combined));

  return unique.slice(0, 5);
}
