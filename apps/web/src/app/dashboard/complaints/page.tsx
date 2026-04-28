"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// Types
type ComplaintStatus = "open" | "in_progress" | "resolved";
type ComplaintPriority = "low" | "medium" | "high";

interface Complaint {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  createdAt: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

const COMPLAINT_CATEGORIES = [
  "Service Quality",
  "Technician Behavior",
  "Billing & Payments",
  "App/Website Issue",
  "Rescheduling Issue",
  "Other",
];

type ComplaintTab = "active" | "resolved" | "all";

// Helper Functions
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusColor(status: ComplaintStatus) {
  switch (status) {
    case "open":
      return "bg-red-500/15 text-red-400 border-red-500/30";
    case "in_progress":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "resolved":
      return "bg-green-500/15 text-green-400 border-green-500/30";
    default:
      return "bg-white/10 text-white/40 border-white/20";
  }
}

function getPriorityColor(priority: ComplaintPriority) {
  switch (priority) {
    case "high":
      return "text-red-400";
    case "medium":
      return "text-amber-400";
    case "low":
      return "text-blue-400";
    default:
      return "text-white/60";
  }
}

// Complaint Card Component
function ComplaintCard({
  complaint,
  onViewDetails,
}: {
  complaint: Complaint;
  onViewDetails: (complaint: Complaint) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="cursor-pointer rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-5 transition-all hover:border-amber-500/20"
      onClick={() => onViewDetails(complaint)}
    >
      <div className="mb-3 flex items-start justify-between">
        <div className="flex flex-col">
          <span className="mb-1 font-mono text-white/40 text-xs">
            #{complaint.ticketNumber}
          </span>
          <h3 className="mb-1 font-semibold text-lg text-white">
            {complaint.title}
          </h3>
          <p className="line-clamp-1 max-w-md text-sm text-white/60">
            {complaint.description}
          </p>
        </div>
        <span
          className={`rounded-full border px-3 py-1 font-semibold text-xs ${getStatusColor(
            complaint.status,
          )}`}
        >
          {complaint.status.replace("_", " ")}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4 border-white/[0.06] border-t pt-4">
        <div className="flex items-center gap-2 text-white/40 text-xs">
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
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
          <span>{complaint.category}</span>
        </div>
        <div className="flex items-center gap-2 text-white/40 text-xs">
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{formatDate(complaint.createdAt)}</span>
        </div>
        <div
          className={`ml-auto flex items-center gap-1.5 font-medium text-xs ${getPriorityColor(complaint.priority)}`}
        >
          <div className="h-1.5 w-1.5 rounded-full bg-current" />
          <span className="capitalize">{complaint.priority} Priority</span>
        </div>
      </div>
    </motion.div>
  );
}

// New Complaint Modal
function NewComplaintModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (complaint: Partial<Complaint>) => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: COMPLAINT_CATEGORIES[0],
    description: "",
    priority: "medium" as ComplaintPriority,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    onSubmit(formData);
    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/[0.06] bg-gradient-to-br from-zinc-900 to-zinc-950 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-bold text-2xl text-white">Raise a Complaint</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-white/[0.04]"
          >
            <svg
              className="h-5 w-5 text-white/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block font-medium text-sm text-white/60">
              Subject
            </label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Briefly describe the issue"
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-white transition-colors placeholder:text-white/30 focus:border-amber-500/30 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block font-medium text-sm text-white/60">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full appearance-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-white transition-colors focus:border-amber-500/30 focus:outline-none"
              >
                {COMPLAINT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-zinc-900">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block font-medium text-sm text-white/60">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as ComplaintPriority,
                  })
                }
                className="w-full appearance-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-white transition-colors focus:border-amber-500/30 focus:outline-none"
              >
                <option value="low" className="bg-zinc-900">
                  Low
                </option>
                <option value="medium" className="bg-zinc-900">
                  Medium
                </option>
                <option value="high" className="bg-zinc-900">
                  High
                </option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block font-medium text-sm text-white/60">
              Detailed Description
            </label>
            <textarea
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Provide as much detail as possible..."
              rows={4}
              className="w-full resize-none rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-white transition-colors placeholder:text-white/30 focus:border-amber-500/30 focus:outline-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl px-4 py-3 font-semibold text-sm text-white/70 transition-all hover:bg-white/[0.04]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 font-semibold text-sm text-white transition-all hover:from-amber-600 hover:to-amber-700 disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Complaint"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

// Complaint Details Modal
function ComplaintDetailsModal({
  complaint,
  onClose,
}: {
  complaint: Complaint;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/[0.06] bg-gradient-to-br from-zinc-900 to-zinc-950 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <span className="mb-1 block font-mono text-sm text-white/40">
              Ticket #{complaint.ticketNumber}
            </span>
            <h2 className="font-bold text-2xl text-white">{complaint.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-white/[0.04]"
          >
            <svg
              className="h-5 w-5 text-white/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
              <p className="mb-1 text-white/40 text-xs">Status</p>
              <span
                className={`inline-block rounded-full border px-2 py-1 font-semibold text-xs ${getStatusColor(complaint.status)}`}
              >
                {complaint.status.replace("_", " ")}
              </span>
            </div>
            <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
              <p className="mb-1 text-white/40 text-xs">Priority</p>
              <div
                className={`flex items-center gap-1.5 font-medium text-sm ${getPriorityColor(complaint.priority)}`}
              >
                <div className="h-2 w-2 rounded-full bg-current" />
                <span className="capitalize">{complaint.priority}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
            <p className="mb-2 text-white/40 text-xs">Category & Date</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-white/80">
                <span className="w-20 text-white/40">Category:</span>
                {complaint.category}
              </div>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <span className="w-20 text-white/40">Raised On:</span>
                {formatDate(complaint.createdAt)}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-4">
            <p className="mb-2 text-white/40 text-xs">Description</p>
            <p className="whitespace-pre-wrap text-sm text-white/80 leading-relaxed">
              {complaint.description}
            </p>
          </div>

          {complaint.resolutionNotes && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
              <p className="mb-2 flex items-center gap-2 text-green-400 text-xs">
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
                Resolution Notes
              </p>
              <p className="whitespace-pre-wrap text-sm text-white/80 leading-relaxed">
                {complaint.resolutionNotes}
              </p>
              {complaint.resolvedAt && (
                <p className="mt-3 border-green-500/20 border-t pt-2 text-white/40 text-xs">
                  Resolved on {formatDate(complaint.resolvedAt)}
                </p>
              )}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-white/[0.04] px-4 py-3 font-semibold text-sm text-white transition-all hover:bg-white/[0.08]"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}

// Main Complaints Page
export default function ComplaintsPage() {
  const [activeTab, setActiveTab] = useState<ComplaintTab>("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [detailsComplaint, setDetailsComplaint] = useState<Complaint | null>(
    null,
  );

  // Initial Mock Data
  const [complaints, setComplaints] = useState<Complaint[]>([
    {
      id: "1",
      ticketNumber: "TK-84920",
      title: "Technician arrived 2 hours late",
      description:
        "The plumbing technician for my scheduled service today arrived much later than the booked time slot without any prior notification. This delayed my entire schedule.",
      category: "Service Quality",
      priority: "medium",
      status: "in_progress",
      createdAt: "2026-04-20T10:30:00Z",
    },
    {
      id: "2",
      ticketNumber: "TK-84921",
      title: "Charged extra for material that was supposed to be included",
      description:
        "My Paint & Sealant package clearly states all inclusive, but the provider asked me to pay ₹500 extra for some minor sealant paste. Please look into this.",
      category: "Billing & Payments",
      priority: "high",
      status: "open",
      createdAt: "2026-04-22T14:15:00Z",
    },
    {
      id: "3",
      ticketNumber: "TK-84805",
      title: "Doorbell camera offline constantly",
      description:
        "The smart doorbell keeps disconnecting from the WiFi every 2 hours. I have to manually restart it.",
      category: "App/Website Issue",
      priority: "low",
      status: "resolved",
      createdAt: "2026-04-01T09:00:00Z",
      resolvedAt: "2026-04-03T16:20:00Z",
      resolutionNotes:
        "Pushed an over-the-air firmware update to the device to patch the WiFi stability issue. Device has been monitored and is stable.",
    },
  ]);

  // Filter complaints
  const filteredComplaints = complaints.filter((complaint) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" &&
        (complaint.status === "open" || complaint.status === "in_progress")) ||
      (activeTab === "resolved" && complaint.status === "resolved");

    const matchesSearch =
      searchQuery === "" ||
      complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const handleCreateComplaint = (newComplaint: Partial<Complaint>) => {
    const complaint: Complaint = {
      ...newComplaint,
      id: Math.random().toString(36).substr(2, 9),
      ticketNumber: `TK-${Math.floor(10000 + Math.random() * 90000)}`,
      status: "open",
      createdAt: new Date().toISOString(),
    } as Complaint;

    setComplaints([complaint, ...complaints]);
    setIsNewModalOpen(false);
  };

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
              Help & Support
            </h1>
            <p className="text-white/40">
              Manage your support tickets and complaints
            </p>
          </div>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-white shadow-amber-500/20 shadow-lg transition-all hover:from-amber-600 hover:to-amber-700"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Raise Complaint
          </button>
        </div>
      </motion.div>

      {/* Tabs and Filters */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex w-fit items-center gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-1"
        >
          {(["active", "resolved", "all"] as ComplaintTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative rounded-xl px-6 py-2.5 font-medium text-sm transition-all ${
                activeTab === tab
                  ? "text-white"
                  : "text-white/50 hover:text-white/70"
              }`}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="activeComplaintTab"
                  className="absolute inset-0 rounded-xl border border-amber-500/30 bg-amber-500/20"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10 capitalize">{tab}</span>
            </button>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative w-full sm:w-72"
        >
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
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-3 pr-4 pl-12 text-white transition-colors placeholder:text-white/30 focus:border-amber-500/30 focus:outline-none"
          />
        </motion.div>
      </div>

      {/* Complaints List */}
      <motion.div layout className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredComplaints.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-16 text-center"
            >
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/[0.04]">
                <svg
                  className="h-10 w-10 text-white/20"
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
              <h3 className="mb-2 font-semibold text-white text-xl">
                No tickets found
              </h3>
              <p className="mx-auto mb-6 max-w-sm text-white/40">
                {searchQuery
                  ? "We couldn't find any tickets matching your search."
                  : "You don't have any complaints in this category right now."}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => setIsNewModalOpen(true)}
                  className="rounded-xl bg-amber-500/10 px-6 py-3 font-semibold text-amber-400 transition-all hover:bg-amber-500/20"
                >
                  Raise an Issue
                </button>
              )}
            </motion.div>
          ) : (
            filteredComplaints.map((complaint) => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onViewDetails={setDetailsComplaint}
              />
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {isNewModalOpen && (
          <NewComplaintModal
            onClose={() => setIsNewModalOpen(false)}
            onSubmit={handleCreateComplaint}
          />
        )}

        {detailsComplaint && (
          <ComplaintDetailsModal
            complaint={detailsComplaint}
            onClose={() => setDetailsComplaint(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
