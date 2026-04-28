import type { CategoryScores, RiskFlag } from "../types/report.types";

export function buildPrompt(scores: CategoryScores, risks: RiskFlag[]): string {
  return `
You are a professional home inspection expert in India.

Return ONLY valid JSON in this format:

{
  "summary": {
    "en": "short English summary",
    "hi": "short Hindi summary"
  },
  "recommendations": ["point 1", "point 2"]
}

DATA:

Scores:
${JSON.stringify(scores, null, 2)}

Risks:
${JSON.stringify(risks, null, 2)}

RULES:
- Only JSON output
- No markdown
- No extra text
- Each recommendation must be one single action
- Do NOT combine multiple actions in one line
`;
}
