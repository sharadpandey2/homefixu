import type { InspectionLog, Recommendation } from "../types/report.types";

export function generateRecommendations(
  logs: InspectionLog[],
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  logs.forEach((log) => {
    // 🔧 PLUMBING
    if (log.service_type === "plumbing") {
      if (log.leak_detected) {
        recommendations.push({
          priority: "high",
          title: "Fix water leakage immediately",
          estimated_cost: "₹1500–₹3000",
        });
      }

      if (log.pipe_condition === "bad") {
        recommendations.push({
          priority: "medium",
          title: "Replace damaged pipes",
          estimated_cost: "₹3000–₹7000",
        });
      }

      if (log.pipe_condition === "moderate") {
        recommendations.push({
          priority: "low",
          title: "Inspect pipe condition in next visit",
          estimated_cost: "₹500–₹1500",
        });
      }
    }

    // ⚡ ELECTRICAL
    if (log.service_type === "electrical") {
      if (log.wiring_condition === "bad") {
        recommendations.push({
          priority: "high",
          title: "Repair or replace faulty wiring",
          estimated_cost: "₹2000–₹5000",
        });
      }

      if (log.voltage_issue) {
        recommendations.push({
          priority: "medium",
          title: "Install voltage stabilizer",
          estimated_cost: "₹1500–₹4000",
        });
      }
    }

    // 🐜 PEST
    if (log.service_type === "pest") {
      if (log.pest_level === "high") {
        recommendations.push({
          priority: "high",
          title: "Immediate pest control treatment required",
          estimated_cost: "₹2000–₹6000",
        });
      }

      if (log.pest_level === "low") {
        recommendations.push({
          priority: "low",
          title: "Schedule preventive pest control",
          estimated_cost: "₹1000–₹2000",
        });
      }
    }
  });

  // 🧠 REMOVE DUPLICATES (VERY IMPORTANT)
  const unique = new Map<string, Recommendation>();

  recommendations.forEach((rec) => {
    unique.set(rec.title, rec);
  });

  return Array.from(unique.values());
}
