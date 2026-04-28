import type { InspectionLog, RiskFlag } from "../types/report.types.ts";

export function generateRisks(logs: InspectionLog[]): RiskFlag[] {
  const risks: RiskFlag[] = [];

  logs.forEach((log) => {
    if (log.leak_detected && log.wiring_condition === "bad") {
      risks.push({
        severity: "critical",
        title: "Water leakage near electrical wiring",
        description: "High risk of short circuit or fire hazard",
      });
    }

    if (log.pest_level === "high") {
      risks.push({
        severity: "high",
        title: "Severe pest infestation",
        description: "Immediate pest control required",
      });
    }

    if (log.pipe_condition === "bad") {
      risks.push({
        severity: "medium",
        title: "Pipe deterioration",
      });
    }
  });

  return risks;
}
