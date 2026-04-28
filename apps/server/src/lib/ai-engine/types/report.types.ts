export type ServiceType = "plumbing" | "electrical" | "pest";

export type InspectionLog = {
  service_type: ServiceType;
  date: string;

  leak_detected?: boolean;
  pipe_condition?: "good" | "moderate" | "bad";

  voltage_issue?: boolean;
  wiring_condition?: "good" | "bad";

  pest_level?: "none" | "low" | "high";
};

export type CategoryScores = {
  plumbing: number;
  electrical: number;
  pest: number;
};

export type RiskFlag = {
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description?: string;
};

export type Recommendation = {
  priority: "low" | "medium" | "high";
  title: string;
  estimated_cost?: string;
};

export type HealthReport = {
  overall_score: number;
  category_scores: CategoryScores;
  risk_flags: RiskFlag[];
  recommendations: Recommendation[];
  summary: string;
};
