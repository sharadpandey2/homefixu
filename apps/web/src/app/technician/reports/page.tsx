"use client";

import { motion } from "motion/react";
import { useState } from "react";

// Types
interface ReportData {
  property_id: string;
  customer_name: string;
  visit_date: string;

  // Category scores (0-100)
  plumbing_score: number;
  electrical_score: number;
  structural_score: number;
  pest_control_score: number;
  paint_sealant_score: number;

  // Issues found per category
  plumbing_issues: string[];
  electrical_issues: string[];
  structural_issues: string[];
  pest_issues: string[];
  paint_issues: string[];

  // Photos
  photos: File[];

  // General notes
  notes: string;
}

const CATEGORIES = [
  { id: "plumbing", name: "Plumbing", icon: "🔧", color: "blue" },
  { id: "electrical", name: "Electrical", icon: "⚡", color: "amber" },
  { id: "structural", name: "Structural", icon: "🏗️", color: "gray" },
  { id: "pest_control", name: "Pest Control", icon: "🐛", color: "green" },
  { id: "paint_sealant", name: "Paint & Sealant", icon: "🎨", color: "purple" },
];

export default function GenerateReportPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [reportData, setReportData] = useState({
    plumbing_score: 80,
    electrical_score: 75,
    structural_score: 90,
    pest_control_score: 70,
    paint_sealant_score: 65,

    plumbing_issues: [] as string[],
    electrical_issues: [] as string[],
    structural_issues: [] as string[],
    pest_issues: [] as string[],
    paint_issues: [] as string[],

    notes: "",
  });

  const [currentIssue, setCurrentIssue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("plumbing");

  // Mock properties list (TODO: Fetch from API based on today's jobs)
  const properties = [
    { id: "prop_1", name: "Flat 301, Green Valley", customer: "Sharad Pandey" },
    { id: "prop_2", name: "Villa 12, DLF Phase 4", customer: "Amit Kumar" },
    { id: "prop_3", name: "B-204, Golf Course Road", customer: "Priya Singh" },
  ];

  const handleAddIssue = (category: string) => {
    if (!currentIssue.trim()) return;

    const issueKey = `${category}_issues` as keyof typeof reportData;
    setReportData({
      ...reportData,
      [issueKey]: [...(reportData[issueKey] as string[]), currentIssue],
    });
    setCurrentIssue("");
  };

  const handleRemoveIssue = (category: string, index: number) => {
    const issueKey = `${category}_issues` as keyof typeof reportData;
    const issues = reportData[issueKey] as string[];
    setReportData({
      ...reportData,
      [issueKey]: issues.filter((_, i) => i !== index),
    });
  };

  const calculateOverallScore = () => {
    const scores = [
      reportData.plumbing_score,
      reportData.electrical_score,
      reportData.structural_score,
      reportData.pest_control_score,
      reportData.paint_sealant_score,
    ];
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const handleSubmitReport = async () => {
    if (!selectedProperty) {
      alert("Please select a property");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call your custom ML model API to generate report
      // const response = await fetch('/api/technician/generate-report', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     property_id: selectedProperty,
      //     scores: reportData,
      //     overall_score: calculateOverallScore(),
      //   }),
      // });

      console.log("TODO: Send data to custom ML model");
      console.log("Property:", selectedProperty);
      console.log("Scores:", reportData);
      console.log("Overall Score:", calculateOverallScore());

      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert("Report generated successfully! Customer will be notified.");
      // Reset form or redirect
    } catch (error) {
      console.error("Failed to generate report:", error);
      alert("Failed to generate report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-amber-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-2 font-bold text-3xl text-white tracking-tight">
          Generate Health Report
        </h1>
        <p className="text-white/40">
          Fill in inspection details to generate AI-powered home health report
        </p>
      </motion.div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all ${
                currentStep === step
                  ? "bg-amber-500 text-white"
                  : currentStep > step
                    ? "bg-green-500 text-white"
                    : "bg-white/10 text-white/40"
              }`}
            >
              {currentStep > step ? "✓" : step}
            </div>
            {step < 3 && (
              <div
                className={`h-1 w-16 rounded-full ${
                  currentStep > step ? "bg-green-500" : "bg-white/10"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select Property */}
      {currentStep === 1 && (
        <motion.div
          key="step1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6"
        >
          <h2 className="mb-6 font-bold text-white text-xl">
            Select Property (From Today's Jobs)
          </h2>

          <div className="space-y-3">
            {properties.map((property) => (
              <label
                key={property.id}
                className={`block cursor-pointer rounded-xl p-4 transition-all ${
                  selectedProperty === property.id
                    ? "border-2 border-amber-500/50 bg-amber-500/20"
                    : "border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="property"
                    value={property.id}
                    checked={selectedProperty === property.id}
                    onChange={(e) => setSelectedProperty(e.target.value)}
                    className="h-5 w-5"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-white">{property.name}</p>
                    <p className="text-sm text-white/40">{property.customer}</p>
                  </div>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={() => setCurrentStep(2)}
            disabled={!selectedProperty}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-white transition-all hover:from-amber-600 hover:to-amber-700 disabled:opacity-50"
          >
            Continue to Inspection
          </button>
        </motion.div>
      )}

      {/* Step 2: Inspection Scores */}
      {currentStep === 2 && (
        <motion.div
          key="step2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Overall Score Preview */}
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-amber-400 text-sm">
                  Overall Health Score
                </p>
                <p
                  className={`font-bold text-4xl ${getScoreColor(calculateOverallScore())}`}
                >
                  {calculateOverallScore()}/100
                </p>
              </div>
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20">
                <span className="text-3xl">📊</span>
              </div>
            </div>
          </div>

          {/* Category Scores */}
          <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6">
            <h2 className="mb-6 font-bold text-white text-xl">
              Category Scores
            </h2>

            <div className="space-y-6">
              {CATEGORIES.map((category) => {
                const scoreKey =
                  `${category.id}_score` as keyof typeof reportData;
                const score = reportData[scoreKey] as number;

                return (
                  <div key={category.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{category.icon}</span>
                        <span className="font-medium text-white">
                          {category.name}
                        </span>
                      </div>
                      <span
                        className={`font-bold text-2xl ${getScoreColor(score)}`}
                      >
                        {score}
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={score}
                      onChange={(e) =>
                        setReportData({
                          ...reportData,
                          [scoreKey]: Number.parseInt(e.target.value, 10),
                        })
                      }
                      className="h-2 w-full cursor-pointer appearance-none rounded-full"
                      style={{
                        background: `linear-gradient(to right, rgb(251 146 60) 0%, rgb(251 146 60) ${score}%, rgb(39 39 42) ${score}%, rgb(39 39 42) 100%)`,
                      }}
                    />

                    <div className="flex justify-between text-white/40 text-xs">
                      <span>Poor (0)</span>
                      <span>Fair (50)</span>
                      <span>Excellent (100)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep(1)}
              className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.04] px-6 py-3 font-semibold text-white transition-all hover:bg-white/[0.08]"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-white transition-all hover:from-amber-600 hover:to-amber-700"
            >
              Continue to Issues
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 3: Issues & Notes */}
      {currentStep === 3 && (
        <motion.div
          key="step3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Issues Section */}
          <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6">
            <h2 className="mb-6 font-bold text-white text-xl">Issues Found</h2>

            {/* Category Tabs */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2 font-medium text-sm transition-all ${
                    selectedCategory === category.id
                      ? "border border-amber-500/30 bg-amber-500/20 text-amber-400"
                      : "border border-white/[0.06] bg-white/[0.04] text-white/60 hover:text-white"
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>

            {/* Add Issue */}
            <div className="mb-4 flex gap-3">
              <input
                type="text"
                value={currentIssue}
                onChange={(e) => setCurrentIssue(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && handleAddIssue(selectedCategory)
                }
                placeholder="Describe the issue found..."
                className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-white transition-all placeholder:text-white/40 focus:border-amber-500/50 focus:outline-none"
              />
              <button
                onClick={() => handleAddIssue(selectedCategory)}
                className="rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white transition-all hover:bg-amber-600"
              >
                Add
              </button>
            </div>

            {/* Issues List */}
            <div className="space-y-2">
              {(
                reportData[
                  `${selectedCategory}_issues` as keyof typeof reportData
                ] as string[]
              ).map((issue, idx) => (
                <div
                  key={idx}
                  className="flex items-start justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                >
                  <p className="text-sm text-white/70">• {issue}</p>
                  <button
                    onClick={() => handleRemoveIssue(selectedCategory, idx)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ✕
                  </button>
                </div>
              ))}

              {(
                reportData[
                  `${selectedCategory}_issues` as keyof typeof reportData
                ] as string[]
              ).length === 0 && (
                <p className="py-4 text-center text-white/40">
                  No issues reported for this category
                </p>
              )}
            </div>
          </div>

          {/* General Notes */}
          <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6">
            <h2 className="mb-4 font-bold text-white text-xl">General Notes</h2>
            <textarea
              value={reportData.notes}
              onChange={(e) =>
                setReportData({ ...reportData, notes: e.target.value })
              }
              placeholder="Add any additional observations or recommendations..."
              rows={6}
              className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-white transition-all placeholder:text-white/40 focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.04] px-6 py-3 font-semibold text-white transition-all hover:bg-white/[0.08]"
            >
              Back
            </button>
            <button
              onClick={handleSubmitReport}
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 font-semibold text-white transition-all hover:from-green-600 hover:to-green-700 disabled:opacity-50"
            >
              {isSubmitting ? "Generating Report..." : "Generate Report"}
            </button>
          </div>
        </motion.div>
      )}

      {/* Info Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-6"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/20">
            <svg
              className="h-5 w-5 text-blue-400"
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
            <h3 className="mb-2 font-semibold text-blue-400 text-sm">
              How Report Generation Works
            </h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Your inspection data will be sent to our custom AI model which
              analyzes the scores and issues to generate a comprehensive home
              health report. The customer will receive the report in their
              dashboard with recommendations and risk assessments.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
