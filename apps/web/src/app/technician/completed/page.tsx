"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// Types (aligned with bookings schema)
interface CompletedJob {
  id: string;
  booking_id: string;
  service_name: string;
  service_category: string;
  customer_name: string;
  customer_phone: string;
  property_address: string;
  property_city: string;
  scheduled_date: string;
  scheduled_slot: string;
  completed_at: string;
  total_price: number;
  notes?: string;
  issues_found?: string[];
  photos?: string[];
}

// Sample data (TODO: Replace with API)
const COMPLETED_JOBS: CompletedJob[] = [
  {
    id: "job_1",
    booking_id: "booking_101",
    service_name: "Monthly Plumbing Inspection",
    service_category: "Plumbing",
    customer_name: "Amit Kumar",
    customer_phone: "+91 98111 22333",
    property_address: "Flat 501, Cyber Hub Residency",
    property_city: "Gurgaon, Haryana - 122002",
    scheduled_date: "2026-03-28",
    scheduled_slot: "10:00-12:00",
    completed_at: "2026-03-28T11:45:00Z",
    total_price: 599,
    notes:
      "All pipelines checked. Kitchen tap washer replaced. Bathroom drainage cleaned. No major issues found.",
    issues_found: ["Minor tap leak in kitchen", "Slow bathroom drainage"],
    photos: [
      "https://via.placeholder.com/300x200/3B82F6/FFFFFF?text=Kitchen+Tap",
      "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Bathroom+Drain",
    ],
  },
  {
    id: "job_2",
    booking_id: "booking_102",
    service_name: "Electrical Safety Check",
    service_category: "Electrical",
    customer_name: "Priya Singh",
    customer_phone: "+91 97777 88888",
    property_address: "B-204, Golf Course Road",
    property_city: "Gurgaon, Haryana - 122001",
    scheduled_date: "2026-03-27",
    scheduled_slot: "14:00-16:00",
    completed_at: "2026-03-27T15:30:00Z",
    total_price: 699,
    notes:
      "All electrical points tested. 2 old switches replaced. Circuit breaker functioning normally.",
    issues_found: ["2 switches needed replacement", "Living room socket loose"],
  },
  {
    id: "job_3",
    booking_id: "booking_103",
    service_name: "Monthly Plumbing Inspection",
    service_category: "Plumbing",
    customer_name: "Rahul Verma",
    customer_phone: "+91 99999 11111",
    property_address: "Villa 12, DLF Phase 4",
    property_city: "Gurgaon, Haryana - 122009",
    scheduled_date: "2026-03-26",
    scheduled_slot: "09:00-11:00",
    completed_at: "2026-03-26T10:50:00Z",
    total_price: 599,
    notes:
      "Complete inspection done. All systems working fine. Recommended annual tank cleaning.",
    issues_found: [],
  },
  {
    id: "job_4",
    booking_id: "booking_104",
    service_name: "Tank Cleaning",
    service_category: "Plumbing",
    customer_name: "Neha Gupta",
    customer_phone: "+91 98888 77777",
    property_address: "A-101, Sector 43",
    property_city: "Gurgaon, Haryana - 122003",
    scheduled_date: "2026-03-25",
    scheduled_slot: "16:00-18:00",
    completed_at: "2026-03-25T17:45:00Z",
    total_price: 899,
    notes:
      "Underground and overhead tanks cleaned thoroughly. Removed sediment and debris. Applied anti-algae treatment.",
    issues_found: ["Heavy sediment buildup in underground tank"],
    photos: [
      "https://via.placeholder.com/300x200/F59E0B/FFFFFF?text=Before+Cleaning",
      "https://via.placeholder.com/300x200/10B981/FFFFFF?text=After+Cleaning",
    ],
  },
];

function CompletedJobCard({ job }: { job: CompletedJob }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getServiceIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "plumbing":
        return "🔧";
      case "electrical":
        return "⚡";
      case "pest control":
        return "🐛";
      default:
        return "🔨";
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6 transition-all hover:border-green-500/20"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 text-2xl">
            {getServiceIcon(job.service_category)}
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-lg text-white">
              {job.service_name}
            </h3>
            <div className="flex items-center gap-3">
              <p className="text-sm text-white/40">{job.service_category}</p>
              <span className="text-white/30 text-xs">•</span>
              <p className="text-green-400 text-xs">
                ✓ Completed {timeAgo(job.completed_at)}
              </p>
            </div>
          </div>
        </div>
        <span className="font-bold text-green-400 text-lg">
          ₹{job.total_price}
        </span>
      </div>

      {/* Customer Info */}
      <div className="mb-4 space-y-3">
        <div className="flex items-center gap-2 text-sm text-white/70">
          <svg
            className="h-4 w-4 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="font-medium">{job.customer_name}</span>
          <span className="text-white/40">• {job.customer_phone}</span>
        </div>

        <div className="flex items-start gap-2 text-sm text-white/70">
          <svg
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <div>
            <p>{job.property_address}</p>
            <p className="text-white/40 text-xs">{job.property_city}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{formatDate(job.scheduled_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg
              className="h-4 w-4 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{job.scheduled_slot}</span>
          </div>
        </div>
      </div>

      {/* Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 font-semibold text-sm text-white transition-all hover:bg-white/[0.08]"
      >
        {isExpanded ? "Hide Details" : "View Details"}
        <svg
          className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 space-y-4 border-white/[0.06] border-t pt-4"
          >
            {/* Inspection Notes */}
            {job.notes && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-4">
                <h4 className="mb-2 flex items-center gap-2 font-semibold text-blue-400 text-sm">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Inspection Notes
                </h4>
                <p className="text-sm text-white/70 leading-relaxed">
                  {job.notes}
                </p>
              </div>
            )}

            {/* Issues Found */}
            {job.issues_found && job.issues_found.length > 0 && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                <h4 className="mb-3 flex items-center gap-2 font-semibold text-amber-400 text-sm">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Issues Found ({job.issues_found.length})
                </h4>
                <ul className="space-y-2">
                  {job.issues_found.map((issue, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-white/70"
                    >
                      <span className="mt-1 text-amber-400">•</span>
                      <span>{issue}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {job.issues_found && job.issues_found.length === 0 && (
              <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                <p className="flex items-center gap-2 text-green-400 text-sm">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  No issues found - All systems working perfectly!
                </p>
              </div>
            )}

            {/* Photos */}
            {job.photos && job.photos.length > 0 && (
              <div>
                <h4 className="mb-3 flex items-center gap-2 font-semibold text-sm text-white">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Photos ({job.photos.length})
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {job.photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`Job photo ${idx + 1}`}
                      className="h-32 w-full rounded-xl border border-white/[0.06] object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function CompletedJobsPage() {
  const [jobs] = useState(COMPLETED_JOBS);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<"all" | "week" | "month">(
    "all",
  );

  // Filter jobs by time period
  const getFilteredJobs = () => {
    const now = new Date();
    let filtered = jobs;

    if (filterPeriod === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = jobs.filter((j) => new Date(j.completed_at) >= weekAgo);
    } else if (filterPeriod === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = jobs.filter((j) => new Date(j.completed_at) >= monthAgo);
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(
        (j) =>
          j.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.property_address
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          j.service_name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    return filtered;
  };

  const filteredJobs = getFilteredJobs();

  // Stats
  const totalEarnings = filteredJobs.reduce((sum, j) => sum + j.total_price, 0);
  const avgRating = 4.8; // TODO: Fetch from API
  const totalJobs = filteredJobs.length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-2 font-bold text-3xl text-white tracking-tight">
          Completed Jobs
        </h1>
        <p className="text-white/40">Your job history and performance</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-600/5 p-6"
        >
          <p className="mb-2 text-green-400 text-sm">Total Jobs</p>
          <p className="font-bold text-4xl text-white">{totalJobs}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-6"
        >
          <p className="mb-2 text-amber-400 text-sm">Total Earnings</p>
          <p className="font-bold text-4xl text-white">
            ₹{totalEarnings.toLocaleString()}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-600/5 p-6"
        >
          <p className="mb-2 text-blue-400 text-sm">Average Rating</p>
          <p className="flex items-center gap-2 font-bold text-4xl text-white">
            {avgRating} <span className="text-2xl">⭐</span>
          </p>
        </motion.div>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="space-y-4"
      >
        {/* Search Bar */}
        <div className="relative">
          <svg
            className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-white/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by customer, address, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] py-3 pr-4 pl-12 text-white transition-all placeholder:text-white/40 focus:border-green-500/50 focus:outline-none"
          />
        </div>

        {/* Time Period Filter */}
        <div className="flex items-center gap-2">
          {(["all", "week", "month"] as const).map((period) => (
            <button
              key={period}
              onClick={() => setFilterPeriod(period)}
              className={`rounded-xl px-4 py-2 font-medium text-sm transition-all ${
                filterPeriod === period
                  ? "border border-green-500/30 bg-green-500/20 text-green-400"
                  : "border border-white/[0.06] bg-white/[0.04] text-white/60 hover:text-white"
              }`}
            >
              {period === "all"
                ? "All Time"
                : period === "week"
                  ? "Past Week"
                  : "Past Month"}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Jobs List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="space-y-4"
      >
        {filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-12 text-center">
            <div className="mb-4 text-6xl">📋</div>
            <h3 className="mb-2 font-semibold text-white text-xl">
              No completed jobs found
            </h3>
            <p className="text-white/40">
              {searchQuery
                ? "Try adjusting your search"
                : "Complete your first job to see it here"}
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => <CompletedJobCard key={job.id} job={job} />)
        )}
      </motion.div>
    </div>
  );
}
