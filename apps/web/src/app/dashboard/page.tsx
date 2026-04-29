"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

// ─── TYPES MATCHING NESTJS BACKEND ──────────────────────────────────────
interface DashboardOverview {
  totalProperties: number;
  servicesUsedThisMonth: number;
  activeSubscription: {
    planName: string;
    status: string;
    servicesPerMonth: number;
  } | null;
  upcomingBookings: Array<{
    id: string;
    scheduledDate: string;
    scheduledSlot: string;
    status: string;
    serviceName: string;
    propertyName: string;
  }>;
  recentBookings: Array<{
    id: string;
    scheduledDate: string;
    status: string;
    serviceName: string;
    propertyName: string;
  }>;
  serviceDueAlerts: Array<{
    id: string;
    nextDueDate: string;
    isOverdue: boolean;
    serviceName: string;
    propertyName: string;
  }>;
  latestHealthReport: {
    id: string;
    score: number | null;
    status: string;
    generatedAt: string;
  } | null;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "https://server-production-c3c4.up.railway.app";

// ─── STATIC DATA (Fallback / Unmapped backend fields) ───────────────────
const CATEGORY_SCORES = [
  { name: "Plumbing", score: 85, color: "#3B8BD4" },
  { name: "Electrical", score: 72, color: "#E8A741" },
  { name: "Pest Control", score: 90, color: "#1D9E75" },
  { name: "Paint & Sealant", score: 65, color: "#D85A30" },
  { name: "Tank", score: 80, color: "#534AB7" },
  { name: "Structure", score: 75, color: "#D4537E" },
];

const QUICK_SERVICES = [
  {
    name: "Plumbing",
    icon: "🔧",
    href: "/dashboard/services",
    color: "#3B8BD4",
  },
  {
    name: "Electrical",
    icon: "⚡",
    href: "/dashboard/services",
    color: "#E8A741",
  },
  {
    name: "Pest Control",
    icon: "🐛",
    href: "/dashboard/services",
    color: "#1D9E75",
  },
  { name: "Paint", icon: "🎨", href: "/dashboard/services", color: "#D85A30" },
  {
    name: "Doorbell",
    icon: "🔔",
    href: "/dashboard/doorbell",
    color: "#534AB7",
  },
  { name: "CCTV", icon: "📹", href: "/dashboard/cctv", color: "#D4537E" },
  {
    name: "Tank Clean",
    icon: "💧",
    href: "/dashboard/services",
    color: "#0F6E56",
  },
  {
    name: "AI Interior",
    icon: "✨",
    href: "/dashboard/interior",
    color: "#993556",
  },
];

// ─── HELPERS ────────────────────────────────────────────────────────────
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getDaysLeft(dateString: string) {
  const diff = new Date(dateString).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function getTimeAgo(dateString: string) {
  const days = Math.floor(
    (Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24),
  );
  return days === 0 ? "Today" : days === 1 ? "Yesterday" : `${days} days ago`;
}

// ─── UI COMPONENTS ──────────────────────────────────────────────────────
function ScoreRing({ score, size = 160 }: { score: number; size?: number }) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const scoreColor =
    score >= 80 ? "#1D9E75" : score >= 60 ? "#E8A741" : "#E24B4A";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={scoreColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-extrabold text-4xl text-white"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {score}
        </motion.span>
        <span className="font-medium text-white/40 text-xs">out of 100</span>
      </div>
    </div>
  );
}

function CategoryBar({
  name,
  score,
  color,
  delay,
}: {
  name: string;
  score: number;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <span className="w-20 truncate text-white/50 text-xs">{name}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/6">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{
            delay: delay + 0.2,
            duration: 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
      </div>
      <span className="w-8 text-right font-semibold text-white/70 text-xs">
        {score}
      </span>
    </motion.div>
  );
}

function Card({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      className={`rounded-2xl p-5 ${className}`}
      style={{
        background:
          "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ─── MAIN DASHBOARD ─────────────────────────────────────────────────────
export default function DashboardPage() {
  const { data: session } = authClient.useSession();
  const userName = session?.user?.name?.split(" ")[0] ?? "there";
  const [sosActive, setSosActive] = useState(false);
  const [sosTimer, setSosTimer] = useState<NodeJS.Timeout | null>(null);

  // API State
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/customer/dashboard`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (res.ok) setData(await res.json());
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  function handleSosDown() {
    const timer = setTimeout(() => setSosActive(true), 3000);
    setSosTimer(timer);
  }

  function handleSosUp() {
    if (sosTimer) {
      clearTimeout(sosTimer);
      setSosTimer(null);
    }
  }

  if (isLoading || !data) {
    return (
      <div className="py-12 text-center text-white/40">
        Loading your dashboard...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="font-bold text-2xl text-white tracking-tight">
          Good{" "}
          {new Date().getHours() < 12
            ? "morning"
            : new Date().getHours() < 17
              ? "afternoon"
              : "evening"}
          , {userName}
        </h1>
        <p className="mt-1 text-sm text-white/40">
          Here&apos;s your home health overview
        </p>
      </motion.div>

      {/* Top row: Health Score + SOS */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2" delay={0.1}>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex flex-col items-center">
              <ScoreRing score={data.latestHealthReport?.score ?? 0} />
              <p className="mt-2 font-medium text-white/40 text-xs">
                Home health score
              </p>
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="font-semibold text-sm text-white/60 uppercase tracking-wider">
                Category breakdown
              </h3>
              {CATEGORY_SCORES.map((cat, i) => (
                <CategoryBar key={cat.name} {...cat} delay={0.2 + i * 0.08} />
              ))}
            </div>
          </div>
        </Card>

        {/* SOS Button Card */}
        <Card delay={0.2}>
          <div className="flex h-full flex-col items-center justify-center gap-4 py-4">
            <h3 className="font-semibold text-sm text-white/40 uppercase tracking-wider">
              Emergency
            </h3>
            <motion.button
              className="relative flex h-28 w-28 items-center justify-center rounded-full text-white"
              style={{
                background: sosActive
                  ? "linear-gradient(135deg, #E24B4A, #A32D2D)"
                  : "linear-gradient(135deg, #E24B4A80, #A32D2D80)",
                boxShadow: sosActive
                  ? "0 0 40px rgba(226,75,74,0.5), 0 0 80px rgba(226,75,74,0.2)"
                  : "0 0 20px rgba(226,75,74,0.15)",
              }}
              onPointerDown={handleSosDown}
              onPointerUp={handleSosUp}
              onPointerLeave={handleSosUp}
              whileTap={{ scale: 0.95 }}
              animate={sosActive ? { scale: [1, 1.05, 1] } : {}}
              transition={
                sosActive
                  ? { repeat: Number.POSITIVE_INFINITY, duration: 0.8 }
                  : {}
              }
            >
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-red-500/30"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
              />
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-red-500/20"
                animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                transition={{
                  duration: 1.5,
                  delay: 0.3,
                  repeat: Number.POSITIVE_INFINITY,
                }}
              />
              <div className="text-center">
                <span className="font-extrabold text-2xl">SOS</span>
                <p className="mt-0.5 text-[10px] text-white/60">Hold 3 sec</p>
              </div>
            </motion.button>
            <p className="text-center text-white/30 text-xs">
              {sosActive
                ? "Emergency triggered! Help is on the way."
                : "Press and hold for 3 seconds"}
            </p>
          </div>
        </Card>
      </div>

      {/* Quick Services */}
      <Card delay={0.3}>
        <h3 className="mb-4 font-semibold text-sm text-white/40 uppercase tracking-wider">
          Quick services
        </h3>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {QUICK_SERVICES.map((svc, i) => (
            <Link
              key={svc.name}
              href={svc.href as never}
              className="no-underline"
            >
              <motion.div
                className="flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-white/4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-lg"
                  style={{
                    background: `${svc.color}15`,
                    border: `1px solid ${svc.color}25`,
                  }}
                >
                  {svc.icon}
                </div>
                <span className="text-center font-medium text-[11px] text-white/50 leading-tight">
                  {svc.name}
                </span>
              </motion.div>
            </Link>
          ))}
        </div>
      </Card>

      {/* Middle row: Upcoming Bookings + Service Dues */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Card delay={0.4}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-white/40 uppercase tracking-wider">
              Upcoming bookings
            </h3>
            <Link
              href={"/dashboard/bookings" as never}
              className="font-medium text-amber-400/70 text-xs no-underline hover:text-amber-300"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {data.upcomingBookings.slice(0, 3).map((booking, i) => (
              <motion.div
                key={booking.id}
                className="flex items-center justify-between rounded-xl p-3"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.04)",
                }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.4 }}
              >
                <div>
                  <p className="font-medium text-sm text-white">
                    {booking.serviceName}
                  </p>
                  <p className="text-white/35 text-xs">
                    {formatDate(booking.scheduledDate)} ·{" "}
                    {booking.scheduledSlot}
                  </p>
                </div>
                <span
                  className={`rounded-lg px-2.5 py-1 font-semibold text-[11px] ${booking.status === "confirmed" ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"}`}
                >
                  {booking.status}
                </span>
              </motion.div>
            ))}
            {data.upcomingBookings.length === 0 && (
              <p className="py-6 text-center text-sm text-white/25">
                No upcoming bookings
              </p>
            )}
          </div>
        </Card>

        <Card delay={0.5}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-white/40 uppercase tracking-wider">
              Service dues
            </h3>
            <Link
              href={"/dashboard/services" as never}
              className="font-medium text-amber-400/70 text-xs no-underline hover:text-amber-300"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {data.serviceDueAlerts.map((due, i) => {
              const daysLeft = getDaysLeft(due.nextDueDate);
              return (
                <motion.div
                  key={due.id}
                  className="flex items-center justify-between rounded-xl p-3"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.04)",
                  }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                >
                  <div>
                    <p className="font-medium text-sm text-white">
                      {due.serviceName}
                    </p>
                    <p className="text-white/35 text-xs">
                      Due: {formatDate(due.nextDueDate)}
                    </p>
                  </div>
                  <span
                    className={`rounded-lg px-2.5 py-1 font-semibold text-[11px] ${due.isOverdue || daysLeft <= 7 ? "bg-red-500/15 text-red-400" : daysLeft <= 14 ? "bg-amber-500/15 text-amber-400" : "bg-white/6 text-white/40"}`}
                  >
                    {due.isOverdue ? "Overdue" : `${daysLeft}d left`}
                  </span>
                </motion.div>
              );
            })}
            {data.serviceDueAlerts.length === 0 && (
              <p className="py-6 text-center text-sm text-white/25">
                All caught up!
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom row: Recent Activity + Subscription */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2" delay={0.6}>
          <h3 className="mb-4 font-semibold text-sm text-white/40 uppercase tracking-wider">
            Recent activity
          </h3>
          <div className="space-y-3">
            {data.recentBookings.slice(0, 4).map((activity, i) => (
              <motion.div
                key={activity.id}
                className="flex items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.08, duration: 0.4 }}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${activity.status === "completed" ? "bg-emerald-500/15" : "bg-blue-500/15"}`}
                >
                  {activity.status === "completed" ? (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  ) : (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#60a5fa"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white/70">
                    {activity.serviceName} was {activity.status}
                  </p>
                </div>
                <span className="text-white/25 text-xs">
                  {getTimeAgo(activity.scheduledDate)}
                </span>
              </motion.div>
            ))}
            {data.recentBookings.length === 0 && (
              <p className="py-2 text-sm text-white/25">No recent activity</p>
            )}
          </div>
        </Card>

        {/* Subscription Card */}
        <Card delay={0.7}>
          <h3 className="mb-4 font-semibold text-sm text-white/40 uppercase tracking-wider">
            Your plan
          </h3>
          <div className="flex flex-col items-center gap-3 py-2">
            <div
              className="rounded-xl px-4 py-1.5 font-bold text-xs uppercase tracking-wider"
              style={{
                background:
                  "linear-gradient(135deg, rgba(232,167,65,0.2), rgba(232,167,65,0.08))",
                color: "#E8A741",
              }}
            >
              {data.activeSubscription?.planName || "Free Plan"}
            </div>
            <div className="text-center">
              <span className="font-extrabold text-3xl text-white">
                ₹{data.activeSubscription ? "999" : "0"}
              </span>
              <span className="text-sm text-white/30">/mo</span>
            </div>
            <div className="mt-2 w-full space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Services used</span>
                <span className="text-white/70">
                  {data.servicesUsedThisMonth} /{" "}
                  {data.activeSubscription?.servicesPerMonth || 0}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/6">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #E8A741, #D4872D)",
                  }}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(100, (data.servicesUsedThisMonth / (data.activeSubscription?.servicesPerMonth || 1)) * 100)}%`,
                  }}
                  transition={{ delay: 0.9, duration: 0.8 }}
                />
              </div>
            </div>
            <Link
              href={"/dashboard/settings" as never}
              className="mt-4 w-full rounded-xl py-2.5 text-center font-semibold text-amber-400/80 text-xs no-underline transition-colors hover:bg-amber-500/10"
              style={{ border: "1px solid rgba(232,167,65,0.2)" }}
            >
              Manage subscription
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
