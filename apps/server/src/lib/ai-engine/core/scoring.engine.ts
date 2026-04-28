import type { CategoryScores, InspectionLog } from "../types/report.types.ts";

export function calculateScores(logs: InspectionLog[]): CategoryScores {
  let plumbing = 100;
  let electrical = 100;
  let pest = 100;

  logs.forEach((log) => {
    if (log.service_type === "plumbing") {
      if (log.leak_detected) plumbing -= 10;
      if (log.pipe_condition === "moderate") plumbing -= 5;
      if (log.pipe_condition === "bad") plumbing -= 20;
    }

    if (log.service_type === "electrical") {
      if (log.voltage_issue) electrical -= 15;
      if (log.wiring_condition === "bad") electrical -= 25;
    }

    if (log.service_type === "pest") {
      if (log.pest_level === "low") pest -= 10;
      if (log.pest_level === "high") pest -= 30;
    }
  });

  return {
    plumbing: Math.max(plumbing, 0),
    electrical: Math.max(electrical, 0),
    pest: Math.max(pest, 0),
  };
}
