import { Injectable, Logger } from "@nestjs/common";
import { generateAIText } from "../../lib/ai-engine/ai/llm.service";
import { buildPrompt } from "../../lib/ai-engine/ai/prompt";
import { calculateOverallScore } from "../../lib/ai-engine/core/aggregator";
import { generateRecommendations } from "../../lib/ai-engine/core/recommendation.engine";
import { generateRisks } from "../../lib/ai-engine/core/risk.engine";
// ─── Engine imports (from src/lib/ai-engine/) ────────────────────────────────
import { calculateScores } from "../../lib/ai-engine/core/scoring.engine";
import type {
  HealthReport,
  InspectionLog,
  Recommendation,
} from "../../lib/ai-engine/types/report.types";
import { getLast3Months } from "../../lib/ai-engine/utils/helpers";

// ─── Return type ──────────────────────────────────────────────────────────────
export type AiReportResult = HealthReport & {
  health_status: string;
  health_message: string;
  ai_recommendations: string[];
  final_recommendations: string[];
  issue_count: number;
};

export type AiReportResponse =
  | { success: true; data: AiReportResult }
  | { success: false; message: string; error?: string };

// ─── Pure helpers (no deps) ───────────────────────────────────────────────────
function getHealthStatus(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Moderate";
  return "Critical";
}

function getHealthMessage(status: string): string {
  const map: Record<string, string> = {
    Excellent: "Your home is in excellent condition.",
    Good: "Your home is in good condition but needs minor attention.",
    Moderate: "Your home requires maintenance.",
    Critical: "Immediate attention required!",
  };
  return map[status] ?? "";
}

function mergeRecommendations(
  ruleRecs: Recommendation[],
  aiRecs: string[],
): string[] {
  const cleanedAI = aiRecs.flatMap((rec) =>
    rec
      .split(/,|\n/)
      .map((r) => r.trim())
      .filter((r) => r.length > 15),
  );

  const combined = [...ruleRecs.map((r) => r.title), ...cleanedAI];

  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z]/g, "")
      .replace(/(fix|repair|improve|check)/g, "");

  const uniqueMap = new Map<string, string>();
  combined.forEach((item) => {
    const key = normalize(item);
    if (!uniqueMap.has(key)) uniqueMap.set(key, item);
  });

  return Array.from(uniqueMap.values()).slice(0, 5);
}

// ─── Service ──────────────────────────────────────────────────────────────────
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  private readonly priorityOrder: Record<Recommendation["priority"], number> = {
    high: 3,
    medium: 2,
    low: 1,
  };

  async generateReport(logs: InspectionLog[]): Promise<AiReportResponse> {
    try {
      this.logger.log(`Generating AI report for ${logs.length} log(s)...`);

      // Step 1 — filter last 3 months
      const filteredLogs = getLast3Months(logs);

      if (filteredLogs.length === 0) {
        return {
          success: false,
          message: "No inspection logs found in the last 3 months.",
        };
      }

      // Step 2 — scores & risks
      const scores = calculateScores(filteredLogs);
      const risks = generateRisks(filteredLogs);
      const overall = calculateOverallScore(scores);

      // Step 3 — rule-based recommendations (top 3 by priority)
      const recommendations = generateRecommendations(filteredLogs)
        .sort(
          (a, b) =>
            this.priorityOrder[b.priority] - this.priorityOrder[a.priority],
        )
        .slice(0, 3);

      // Step 4 — Groq AI call
      const prompt = buildPrompt(scores, risks);
      const aiResponse = await generateAIText(prompt);

      let parsedAI: {
        summary: { en: string; hi: string } | string;
        recommendations: string[];
      } = {
        summary: { en: "", hi: "" },
        recommendations: [],
      };

      try {
        const match = aiResponse.match(/\{[\s\S]*\}/);
        if (match) parsedAI = JSON.parse(match[0]);
      } catch {
        this.logger.warn("AI JSON parse failed — using fallback values");
      }

      // Step 5 — normalize summary
      let finalSummary = "";
      if (typeof parsedAI.summary === "string") {
        finalSummary = parsedAI.summary;
      } else {
        finalSummary =
          `${parsedAI.summary?.en ?? ""} ${parsedAI.summary?.hi ?? ""}`.trim();
      }

      // Step 6 — merge rule + AI recommendations
      const finalRecommendations = mergeRecommendations(
        recommendations,
        parsedAI.recommendations ?? [],
      );

      // Step 7 — health label
      const healthStatus = getHealthStatus(overall);
      const healthMessage = getHealthMessage(healthStatus);

      this.logger.log(
        `Report done — status: ${healthStatus}, score: ${overall}, risks: ${risks.length}`,
      );

      return {
        success: true,
        data: {
          overall_score: overall,
          category_scores: scores,
          risk_flags: risks,
          recommendations,
          summary: finalSummary,
          ai_recommendations: parsedAI.recommendations ?? [],
          final_recommendations: finalRecommendations,
          health_status: healthStatus,
          health_message: healthMessage,
          issue_count: risks.length,
        },
      };
    } catch (error: any) {
      this.logger.error("AI report generation failed", error?.stack ?? error);
      return {
        success: false,
        message: "AI processing failed",
        error: error?.message ?? "Unknown error",
      };
    }
  }
}
