import { generateAIText } from "./ai/llm.service";
import { buildPrompt } from "./ai/prompt";
import { calculateOverallScore } from "./core/aggregator";
import { generateRecommendations } from "./core/recommendation.engine";
import { generateRisks } from "./core/risk.engine";
import { calculateScores } from "./core/scoring.engine";
import type { HealthReport, InspectionLog } from "./types/report.types";
import { getLast3Months } from "./utils/helpers";

// 🔥 Health Status
function getHealthStatus(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Moderate";
  return "Critical";
}

// 🔥 Health Message
function getHealthMessage(status: string): string {
  switch (status) {
    case "Excellent":
      return "Your home is in excellent condition.";
    case "Good":
      return "Your home is in good condition but needs minor attention.";
    case "Moderate":
      return "Your home requires maintenance.";
    case "Critical":
      return "Immediate attention required!";
    default:
      return "";
  }
}

// 🔥 FINAL MERGE ENGINE (WITH SMART NORMALIZATION)
function mergeRecommendations(ruleRecs: any[], aiRecs: string[]): string[] {
  const cleanedAI = aiRecs.flatMap((rec) =>
    rec
      .split(/,|\n/)
      .map((r) => r.trim())
      .filter((r) => r.length > 15),
  );

  const combined = [...ruleRecs.map((r) => r.title), ...cleanedAI];

  // 🔥 SMART NORMALIZE (FINAL FIX)
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .replace(/(fix|repair|improve|check)/g, "");

  const uniqueMap = new Map<string, string>();

  combined.forEach((item) => {
    const key = normalize(item);
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, item);
    }
  });

  return Array.from(uniqueMap.values()).slice(0, 5);
}

export async function generateHealthReport(logs: InspectionLog[]): Promise<
  HealthReport & {
    health_status: string;
    health_message: string;
    ai_recommendations: string[];
    final_recommendations: string[];
    issue_count: number;
  }
> {
  // 🔹 Step 1
  const filteredLogs = getLast3Months(logs);

  if (filteredLogs.length === 0) {
    throw new Error("Insufficient data");
  }

  // 🔹 Step 2
  const scores = calculateScores(filteredLogs);
  const risks = generateRisks(filteredLogs);
  const overall = calculateOverallScore(scores);

  // 🔹 Step 3
  const recommendations = generateRecommendations(filteredLogs);

  const priorityOrder = { high: 3, medium: 2, low: 1 };

  const finalRecommendations = recommendations
    .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
    .slice(0, 3);

  // 🔹 Step 4 (AI)
  const prompt = buildPrompt(scores, risks);
  const aiResponse = await generateAIText(prompt);

  let parsedAI: any = {
    summary: { en: "", hi: "" },
    recommendations: [],
  };

  try {
    const match = aiResponse.match(/\{[\s\S]*\}/);

    if (match) {
      parsedAI = JSON.parse(match[0]);
    }
  } catch {
    console.error("AI parse failed");
  }

  // 🔥 SUMMARY HANDLE (object + string safe)
  let finalSummary = "";

  if (typeof parsedAI.summary === "string") {
    finalSummary = parsedAI.summary;
  } else {
    finalSummary = `${parsedAI.summary?.en || ""} ${
      parsedAI.summary?.hi || ""
    }`;
  }

  // 🔹 Step 5
  const merged = mergeRecommendations(
    finalRecommendations,
    parsedAI.recommendations || [],
  );

  // 🔹 Step 6
  const healthStatus = getHealthStatus(overall);
  const healthMessage = getHealthMessage(healthStatus);

  return {
    overall_score: overall,
    category_scores: scores,
    risk_flags: risks,

    recommendations: finalRecommendations,

    summary: finalSummary,
    ai_recommendations: parsedAI.recommendations || [],
    final_recommendations: merged,

    health_status: healthStatus,
    health_message: healthMessage,

    issue_count: risks.length,
  };
}
