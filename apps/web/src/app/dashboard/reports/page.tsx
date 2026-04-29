"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Types mapping to your Drizzle Schema
interface HealthReport {
  id: string;
  userId: string;
  propertyId: string;
  propertyName?: string;
  status: "generating" | "ready" | "failed";
  overallScore: number; // 0-100
  categoryScores: CategoryScore[];
  riskFlags: RiskFlag[];
  recommendations: Recommendation[];
  summary: string;
  reportPeriodStart: string;
  reportPeriodEnd: string;
  createdAt: string;
  generatedAt: string;
}

interface CategoryScore {
  category: string;
  score: number;
  label: string;
  issues: string[];
}

interface RiskFlag {
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  category: string;
}

interface Recommendation {
  priority: "low" | "medium" | "high" | "urgent";
  title: string;
  description: string;
  estimatedCost: number;
  category: string;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "https://server-production-c3c4.up.railway.app";

// Helper functions
function getScoreColor(score: number) {
  if (score >= 80) return "text-green-400";
  if (score >= 60) return "text-amber-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "critical":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "high":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "medium":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "low":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    default:
      return "bg-white/10 text-white/40 border-white/20";
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case "urgent":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "high":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "medium":
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    case "low":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    default:
      return "bg-white/10 text-white/40 border-white/20";
  }
}

export default function HealthReportsPage() {
  const [selectedTab, setSelectedTab] = useState<
    "overview" | "risks" | "recommendations"
  >("overview");

  const [report, setReport] = useState<HealthReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLatestReport = async () => {
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/customer/health-reports/latest`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          },
        );

        if (res.ok) {
          // TS FIX: Cast response to any, then map to camelCase if needed
          const data = (await res.json()) as any;

          // Map DB response to frontend structure just in case keys differ slightly
          setReport({
            ...data,
            overallScore: data.overallScore || data.overall_score,
            categoryScores: data.categoryScores || data.category_scores || [],
            riskFlags: data.riskFlags || data.risk_flags || [],
            recommendations: data.recommendations || [],
            reportPeriodStart:
              data.reportPeriodStart || data.report_period_start,
            reportPeriodEnd: data.reportPeriodEnd || data.report_period_end,
          });
        } else if (res.status === 404) {
          // Normal: User has no reports yet
          setReport(null);
        }
      } catch (error) {
        console.error("Failed to fetch health report:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestReport();
  }, []);

  const handleDownloadPDF = () => {
    alert(
      "PDF generation will trigger a backend AI queue. This will be wired up soon!",
    );
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center text-white/40">
        Analyzing your home's health data...
      </div>
    );
  }

  // ─── EMPTY STATE (If no report exists yet) ──────────────────────────────
  if (!report) {
    return (
      <div className="mx-auto mt-10 max-w-4xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/6 bg-linear-to-br from-white/4 to-white/2 p-12 text-center"
        >
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-blue-500/10">
            <svg
              className="h-12 w-12 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h2 className="mb-4 font-bold text-2xl text-white">
            No Health Reports Yet
          </h2>
          <p className="mx-auto mb-8 max-w-lg text-white/50 leading-relaxed">
            Your home's health report is generated by our AI engine after
            collecting at least <strong>3 months of inspection data</strong>{" "}
            from our technicians. Book your regular services to start building
            your home's health profile!
          </p>
          <Link href="/dashboard/services" as={"/dashboard/services" as never}>
            <button className="rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-amber-600">
              Book a Service
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  // ─── REPORT UI ──────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 font-bold text-3xl text-white tracking-tight">
              Home Health Report
            </h1>
            <p className="text-white/40">
              {report.propertyName ? `${report.propertyName} • ` : ""}
              Generated{" "}
              {new Date(
                report.createdAt || report.generatedAt,
              ).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-white transition-all hover:from-amber-600 hover:to-amber-700"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Download PDF
          </button>
        </div>
      </motion.div>

      {/* Overall Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="rounded-2xl border border-white/6 bg-linear-to-br from-white/4 to-white/2 p-8"
      >
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Score Ring */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative mb-4 h-48 w-48">
              <svg className="h-full w-full -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-white/10"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - report.overallScore / 100)}`}
                  className={getScoreColor(report.overallScore)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div
                  className={`font-bold text-6xl ${getScoreColor(report.overallScore)}`}
                >
                  {report.overallScore}
                </div>
                <div className="text-sm text-white/40">out of 100</div>
              </div>
            </div>
            <h3 className="mb-1 font-bold text-white text-xl">
              Overall Health Score
            </h3>
            <p className="text-center text-sm text-white/40">
              {report.overallScore >= 80
                ? "Excellent Condition"
                : report.overallScore >= 60
                  ? "Good Condition"
                  : report.overallScore >= 40
                    ? "Needs Attention"
                    : "Poor Condition"}
            </p>
          </div>

          {/* Summary */}
          <div className="md:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-2xl">✨</span>
              <h3 className="font-bold text-white text-xl">
                AI-Generated Summary
              </h3>
            </div>
            <p className="mb-6 text-white/70 leading-relaxed">
              {report.summary}
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/6 bg-white/2 p-4">
                <p className="mb-1 text-sm text-white/40">Risk Flags</p>
                <p className="font-bold text-2xl text-white">
                  {report.riskFlags?.length || 0}
                </p>
              </div>
              <div className="rounded-xl border border-white/6 bg-white/2 p-4">
                <p className="mb-1 text-sm text-white/40">Recommendations</p>
                <p className="font-bold text-2xl text-white">
                  {report.recommendations?.length || 0}
                </p>
              </div>
              <div className="rounded-xl border border-white/6 bg-white/2 p-4">
                <p className="mb-1 text-sm text-white/40">Estimated Cost</p>
                <p className="font-bold text-2xl text-white">
                  ₹
                  {(
                    report.recommendations?.reduce(
                      (sum: number, r: any) =>
                        sum + (r.estimatedCost || r.estimated_cost || 0),
                      0,
                    ) || 0
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex w-fit items-center gap-2 rounded-2xl border border-white/6 bg-white/2 p-1"
      >
        {(["overview", "risks", "recommendations"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab)}
            className={`relative rounded-xl px-6 py-2.5 font-medium text-sm transition-all ${selectedTab === tab ? "text-white" : "text-white/50 hover:text-white/70"}`}
          >
            {selectedTab === tab && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-xl border border-amber-500/30 bg-amber-500/20"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10 capitalize">{tab}</span>
          </button>
        ))}
      </motion.div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {selectedTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-white/6 bg-linear-to-br from-white/4 to-white/2 p-6">
              <h2 className="mb-6 font-bold text-white text-xl">
                Category Breakdown
              </h2>
              <div className="space-y-4">
                {report.categoryScores?.map((category, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-medium text-white">
                          {category.category}
                        </span>
                        <span className="ml-2 text-sm text-white/40">
                          • {category.label}
                        </span>
                      </div>
                      <span
                        className={`font-bold text-lg ${getScoreColor(category.score)}`}
                      >
                        {category.score}/100
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full ${getScoreColor(category.score)} bg-current transition-all`}
                        style={{ width: `${category.score}%` }}
                      />
                    </div>
                    {category.issues && category.issues.length > 0 && (
                      <div className="mt-2 ml-4 space-y-1">
                        {category.issues.map((issue, i) => (
                          <p key={i} className="text-sm text-white/40">
                            • {issue}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {selectedTab === "risks" && (
          <motion.div
            key="risks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-white/6 bg-linear-to-br from-white/4 to-white/2 p-6"
          >
            <h2 className="mb-6 font-bold text-white text-xl">
              Risk Flags & Vulnerabilities
            </h2>
            <div className="space-y-4">
              {report.riskFlags?.length === 0 ? (
                <p className="text-white/40 italic">No major risks detected.</p>
              ) : (
                report.riskFlags?.map((risk, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/6 bg-white/2 p-4"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="font-semibold text-lg text-white">
                        {risk.title}
                      </h3>
                      <span
                        className={`rounded-full border px-3 py-1 font-bold text-xs ${getSeverityColor(risk.severity)}`}
                      >
                        {risk.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="mb-2 text-sm text-white/60">
                      {risk.description}
                    </p>
                    <p className="text-white/40 text-xs">
                      Category: {risk.category}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {selectedTab === "recommendations" && (
          <motion.div
            key="recommendations"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-white/6 bg-linear-to-br from-white/4 to-white/2 p-6"
          >
            <h2 className="mb-6 font-bold text-white text-xl">
              Priority Recommendations
            </h2>
            <div className="space-y-4">
              {report.recommendations?.length === 0 ? (
                <p className="text-white/40 italic">
                  No urgent recommendations at this time.
                </p>
              ) : (
                report.recommendations?.map((rec, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-white/6 bg-white/2 p-4"
                  >
                    <div className="mb-2 flex items-start justify-between">
                      <h3 className="font-semibold text-lg text-white">
                        {rec.title}
                      </h3>
                      <span
                        className={`rounded-full border px-3 py-1 font-bold text-xs ${getPriorityColor(rec.priority)}`}
                      >
                        {rec.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="mb-3 text-sm text-white/60">
                      {rec.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-white/40 text-xs">
                        Category: {rec.category}
                      </p>
                      <p className="font-semibold text-amber-400 text-sm">
                        Est. Cost: ₹
                        {(
                          rec.estimatedCost ||
                          (rec as any).estimated_cost ||
                          0
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-500/20">
            <svg
              className="h-6 w-6 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-blue-400 text-lg">
              How Health Reports Work
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Our technicians conduct thorough inspections during each service
              visit. This report is generated from{" "}
              <strong>3 months of inspection data</strong> collected by
              professionals. The AI analyzes patterns, identifies risks, and
              provides actionable recommendations to keep your home in top
              condition. Reports are generated quarterly.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
