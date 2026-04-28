"use client";

import { motion } from "motion/react";
import { api } from "@/lib/api";

// Types (aligned with backend response)
interface ServiceRequest {
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
  status: string;
  total_price: number;
  special_instructions: string | null;
}

// Updated ServiceRequestCard to handle custom actions
function ServiceRequestCard({
  request,
  onAccept,
  onReject,
  onStart,
  onComplete,
  showActions = true,
  customActionLabel,
  customActionColor,
}: {
  request: ServiceRequest;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onStart?: (id: string) => void;
  onComplete?: (id: string) => void;
  showActions?: boolean;
  customActionLabel?: string;
  customActionColor?: string;
}) {
  const getServiceIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "plumbing":
        return "🔧";
      case "electrical":
        return "⚡";
      case "pest control":
        return "🐛";
      case "sanitation":
        return "💧";
      case "cleaning":
        return "🧹";
      default:
        return "🏠";
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Today";
    return d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] p-6 shadow-xl backdrop-blur-sm transition-all hover:border-white/10"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 text-2xl shadow-amber-500/20 shadow-lg">
            {getServiceIcon(request.service_category)}
          </div>
          <div>
            <h3 className="mb-1 font-bold text-white text-xl">
              {request.service_name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-white/10 px-2 py-0.5 font-bold text-[10px] text-white/60 uppercase tracking-wider">
                {request.service_category}
              </span>
              <span className="text-white/20">•</span>
              <span className="text-white/40 text-xs">
                ID: #{request.booking_id.slice(-6)}
              </span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-black text-2xl text-amber-500">
            ₹{request.total_price}
          </p>
          <p className="font-bold text-[10px] text-white/30 uppercase tracking-tighter">
            Est. Earning
          </p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-lg">👤</span>
            <div>
              <p className="font-bold text-white/30 text-xs uppercase">
                Customer
              </p>
              <p className="font-semibold text-sm text-white/90">
                {request.customer_name}
              </p>
              <p className="text-white/40 text-xs">{request.customer_phone}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">📍</span>
            <div>
              <p className="font-bold text-white/30 text-xs uppercase">
                Location
              </p>
              <p className="line-clamp-1 font-medium text-sm text-white/90">
                {request.property_address}
              </p>
              <p className="text-white/40 text-xs">{request.property_city}</p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-lg">📅</span>
            <div>
              <p className="font-bold text-white/30 text-xs uppercase">
                Schedule
              </p>
              <p className="font-bold text-amber-500 text-sm text-white/90">
                {formatDate(request.scheduled_date)}
              </p>
              <p className="font-medium text-[11px] text-white/60">
                {request.scheduled_slot}
              </p>
            </div>
          </div>
          {request.special_instructions && (
            <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-3">
              <p className="mb-1 font-black text-[10px] text-blue-400 uppercase">
                Note
              </p>
              <p className="line-clamp-2 text-white/70 text-xs italic">
                "{request.special_instructions}"
              </p>
            </div>
          )}
        </div>
      </div>

      {showActions && (
        <div className="flex gap-3">
          {onReject && (
            <button
              onClick={() => onReject(request.id)}
              className="flex-1 rounded-2xl border border-red-500/20 px-6 py-4 font-bold text-red-400 text-sm uppercase tracking-widest transition-all hover:bg-red-500/10"
            >
              Reject
            </button>
          )}
          {onAccept && (
            <button
              onClick={() => onAccept(request.id)}
              className="flex-[2] rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4 font-black text-sm text-white uppercase tracking-widest transition-all hover:shadow-amber-500/30 hover:shadow-lg"
            >
              Accept Job
            </button>
          )}
          {onStart && (
            <button
              onClick={() => onStart(request.id)}
              className={`flex-1 rounded-2xl px-6 py-4 font-black text-sm text-white uppercase tracking-widest shadow-lg transition-all ${customActionColor}`}
            >
              {customActionLabel}
            </button>
          )}
          {onComplete && (
            <button
              onClick={() => onComplete(request.id)}
              className={`flex-1 rounded-2xl px-6 py-4 font-black text-sm text-white uppercase tracking-widest shadow-lg transition-all ${customActionColor}`}
            >
              {customActionLabel}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function TechnicianDashboard() {
  const {
    data: stats,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = api.technician.getDashboard.useQuery(["tech-stats"]);
  const {
    data: pendingRequests,
    isLoading: pendingLoading,
    refetch: refetchPending,
  } = api.technician.getSchedule.useQuery(["tech-pending"], {
    query: { status: "pending" },
  });
  const {
    data: confirmedJobs,
    isLoading: confirmedLoading,
    refetch: refetchConfirmed,
  } = api.technician.getSchedule.useQuery(["tech-confirmed"], {
    query: { status: "confirmed" },
  });
  const {
    data: inProgressJobs,
    isLoading: progressLoading,
    refetch: refetchProgress,
  } = api.technician.getSchedule.useQuery(["tech-progress"], {
    query: { status: "in_progress" },
  });

  const acceptMutation = api.technician.acceptBooking.useMutation();
  const rejectMutation = api.technician.rejectBooking.useMutation();
  const startMutation = api.technician.startBooking.useMutation();
  const completeMutation = api.technician.completeBooking.useMutation();

  const handleAccept = async (id: string) => {
    try {
      await acceptMutation.mutateAsync({ params: { bookingId: id }, body: {} });
      alert("Job accepted!");
      refreshAll();
    } catch (_err) {
      alert("Failed to accept job");
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt("Reason for rejection?");
    if (reason === null) return;
    try {
      await rejectMutation.mutateAsync({
        params: { bookingId: id },
        body: { reason },
      });
      alert("Job rejected.");
      refreshAll();
    } catch (_err) {
      alert("Failed to reject job");
    }
  };

  const handleStart = async (id: string) => {
    try {
      await startMutation.mutateAsync({ params: { bookingId: id }, body: {} });
      alert("Job started! Keep up the good work.");
      refreshAll();
    } catch (_err) {
      alert("Failed to start job");
    }
  };

  const handleComplete = async (id: string) => {
    const notes = window.prompt("Any completion notes for the customer?");
    try {
      await completeMutation.mutateAsync({
        params: { bookingId: id },
        body: { notes: notes || undefined },
      });
      alert("Job completed! Well done.");
      refreshAll();
    } catch (_err) {
      alert("Failed to complete job");
    }
  };

  const refreshAll = () => {
    refetchStats();
    refetchPending();
    refetchConfirmed();
    refetchProgress();
  };

  if (statsLoading || pendingLoading || confirmedLoading || progressLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="animate-pulse font-medium text-amber-500 text-lg">
          Loading your dashboard...
        </div>
      </div>
    );
  }

  const techStatus = stats?.body?.technicianStatus;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      {/* Header & Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="mb-2 font-extrabold text-4xl text-white tracking-tight">
              Welcome back,{" "}
              <span className="text-amber-500">{techStatus?.fullName}</span>
            </h1>
            <p className="text-lg text-white/40">
              Here's what's on your plate for today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 rounded-2xl border px-4 py-2 font-bold text-xs ${
                techStatus?.isVerified
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                  : "border-red-500/20 bg-red-500/10 text-red-400"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              {techStatus?.isVerified ? "KYC VERIFIED" : "KYC PENDING"}
            </div>
            <div
              className={`flex items-center gap-2 rounded-2xl border px-4 py-2 font-bold text-xs ${
                techStatus?.approvalStatus === "approved"
                  ? "border-blue-500/20 bg-blue-500/10 text-blue-400"
                  : "border-amber-500/20 bg-amber-500/10 text-amber-400"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-current" />
              {techStatus?.approvalStatus.toUpperCase()} ACCOUNT
            </div>
          </div>
        </div>

        {/* Urgent Attention: KYC Banner */}
        {!techStatus?.isVerified && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-between gap-4 rounded-3xl border border-red-500/20 bg-gradient-to-r from-red-500/20 to-amber-500/10 p-6 md:flex-row"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/20 text-2xl">
                ⚠️
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">
                  Complete your KYC
                </h3>
                <p className="text-white/60">
                  You need to verify your documents before you can start
                  accepting high-value jobs.
                </p>
              </div>
            </div>
            <button
              onClick={() => (window.location.href = "/technician/ekyc")}
              className="whitespace-nowrap rounded-2xl bg-white px-6 py-3 font-bold text-zinc-950 transition-all hover:bg-zinc-200"
            >
              Verify Now
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          {
            label: "Today's Jobs",
            value: stats?.body?.todayJobs,
            color: "from-blue-500/20 to-blue-600/10",
            textColor: "text-blue-400",
            icon: "📅",
          },
          {
            label: "Pending Requests",
            value: stats?.body?.pendingRequests,
            color: "from-amber-500/20 to-amber-600/10",
            textColor: "text-amber-400",
            icon: "📬",
          },
          {
            label: "Done This Week",
            value: stats?.body?.completedThisWeek,
            color: "from-emerald-500/20 to-emerald-600/10",
            textColor: "text-emerald-400",
            icon: "✅",
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-3xl bg-gradient-to-br p-8 ${stat.color} group relative overflow-hidden border border-white/[0.06] transition-all hover:border-white/10`}
          >
            <div className="relative z-10">
              <p
                className={`font-bold text-sm uppercase tracking-wider ${stat.textColor} mb-2`}
              >
                {stat.label}
              </p>
              <p className="font-black text-5xl text-white">
                {stat.value ?? 0}
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 text-8xl opacity-10 grayscale transition-all duration-500 group-hover:scale-110 group-hover:grayscale-0">
              {stat.icon}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left Column: Active & Confirmed */}
        <div className="space-y-8">
          {/* 1. In Progress Jobs */}
          {inProgressJobs?.body && inProgressJobs.body.length > 0 && (
            <section>
              <div className="mb-6 flex items-center gap-3">
                <div className="h-2 w-2 animate-ping rounded-full bg-amber-500" />
                <h2 className="font-bold text-2xl text-white">
                  Active Jobs (In Progress)
                </h2>
              </div>
              <div className="space-y-4">
                {inProgressJobs.body.map((job) => (
                  <ServiceRequestCard
                    key={job.id}
                    request={job as any}
                    showActions={true}
                    onComplete={handleComplete}
                    customActionLabel="Complete Job"
                    customActionColor="bg-emerald-500 hover:bg-emerald-600"
                  />
                ))}
              </div>
            </section>
          )}

          {/* 2. Confirmed Today */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-bold text-2xl text-white">
                Today's Confirmed Jobs
              </h2>
              <button className="font-bold text-amber-500 text-sm hover:underline">
                View Full Schedule
              </button>
            </div>
            <div className="space-y-4">
              {!confirmedJobs?.body || confirmedJobs.body.length === 0 ? (
                <div className="rounded-3xl border border-white/10 border-dashed bg-white/[0.02] p-12 text-center">
                  <p className="text-white/30 italic">
                    No confirmed jobs for today yet.
                  </p>
                </div>
              ) : (
                confirmedJobs.body.map((job) => (
                  <ServiceRequestCard
                    key={job.id}
                    request={job as any}
                    showActions={true}
                    onStart={handleStart}
                    customActionLabel="Start Job"
                    customActionColor="bg-blue-500 hover:bg-blue-600"
                  />
                ))
              )}
            </div>
          </section>
        </div>

        {/* Right Column: New Requests */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-bold text-2xl text-white">
              New Service Requests
            </h2>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              <span className="font-bold text-red-500 text-xs">LIVE FEED</span>
            </div>
          </div>
          <div className="space-y-4">
            {!pendingRequests?.body || pendingRequests.body.length === 0 ? (
              <div className="rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.03] to-transparent p-20 text-center">
                <div className="mb-4 text-5xl">🎉</div>
                <h3 className="mb-2 font-bold text-white text-xl">
                  All Caught Up!
                </h3>
                <p className="text-white/40">
                  Enjoy your break. New requests will appear here as they come
                  in.
                </p>
              </div>
            ) : (
              pendingRequests.body.map((request) => (
                <ServiceRequestCard
                  key={request.id}
                  request={request as any}
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
