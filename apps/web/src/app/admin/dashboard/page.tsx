"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  PlusCircle,
  ShieldCheck,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

interface AdminStats {
  users: { role: string; count: number }[];
  bookings: { status: string; count: number }[];
  pendingKyc: number;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: number;
  icon: any;
  color: string;
  trend?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group relative overflow-hidden rounded-[2rem] border border-white/5 bg-zinc-900/40 p-7 shadow-2xl backdrop-blur-xl"
    >
      <div
        className={`absolute top-0 right-0 h-32 w-32 bg-${color}-500/5 -mt-16 -mr-16 rounded-full blur-[50px] group-hover:bg-${color}-500/10 transition-colors duration-500`}
      />

      <div className="mb-6 flex items-start justify-between">
        <div className={`p-4 bg-${color}-500/10 rounded-2xl`}>
          <Icon className={`h-7 w-7 text-${color}-400`} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 rounded-full bg-emerald-400/10 px-2.5 py-1 font-bold text-emerald-400 text-xs">
            <TrendingUp className="h-3 w-3" />
            {trend}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="font-bold text-4xl text-white tracking-tight">
          {value}
        </h3>
        <p className="font-semibold text-sm text-zinc-500 uppercase tracking-wider">
          {title}
        </p>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [_error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/stats`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load platform analytics");
        const data: AdminStats = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getRoleCount = (roleName: string) =>
    stats?.users?.find((u) => u.role === roleName)?.count || 0;

  const getBookingCount = (statusName: string) =>
    stats?.bookings?.find((b) => b.status === statusName)?.count || 0;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="h-12 w-12 rounded-full border-amber-500 border-t-2 border-b-2"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8 text-white selection:bg-amber-500/30 lg:p-12">
      <div className="mx-auto max-w-7xl space-y-12">
        {/* Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 font-bold text-amber-500 text-xs uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" />
              Admin Command Centre
            </div>
            <h1 className="font-bold text-5xl text-white tracking-tight">
              Platform Overview
            </h1>
            <p className="text-lg text-zinc-500">
              Real-time performance metrics and account management.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="mr-4 flex flex-col items-end">
              <span className="font-bold text-amber-500 text-xs">
                ADMIN SESSION
              </span>
              <span className="text-xs text-zinc-500">
                63sharadpandey@gmail.com
              </span>
            </div>

            <button
              onClick={async () => {
                await authClient.signOut();
                window.location.href = "/login";
              }}
              className="rounded-xl border border-white/10 bg-zinc-900 px-5 py-2.5 font-bold text-sm text-white transition-all hover:bg-white/5"
            >
              Sign Out
            </button>

            <Link
              href="/admin/technicians/create"
              className="flex items-center gap-2 rounded-2xl bg-amber-500 px-6 py-4 font-bold text-black shadow-[0_10px_30_rgba(232,167,65,0.2)] transition-all hover:scale-[1.02] hover:bg-amber-400 active:scale-[0.98]"
            >
              <PlusCircle className="h-5 w-5" />
              New Technician
            </Link>
          </motion.div>
        </div>

        {/* System Health / Alerts */}
        <AnimatePresence>
          {stats?.pendingKyc ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative overflow-hidden rounded-[2.5rem] border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-orange-500/5 p-8 shadow-2xl"
            >
              <div className="absolute top-0 right-0 p-12 opacity-5">
                <FileText className="h-40 w-40 text-amber-500" />
              </div>
              <div className="relative z-10 flex flex-col items-center justify-between gap-8 md:flex-row">
                <div className="flex items-center gap-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/20 shadow-inner">
                    <AlertCircle className="h-10 w-10 animate-pulse text-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="font-bold text-2xl text-white">
                      Pending Verifications
                    </h2>
                    <p className="text-lg text-zinc-400">
                      <span className="font-bold text-amber-500">
                        {stats.pendingKyc} technicians
                      </span>{" "}
                      are waiting for document review.
                    </p>
                  </div>
                </div>
                <Link
                  href="/admin/technicians"
                  className="group flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 font-bold transition-all hover:bg-white/10"
                >
                  Start Review
                  <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex w-fit items-center gap-3 rounded-full border border-emerald-400/10 bg-emerald-400/5 px-6 py-3 text-emerald-400"
            >
              <Activity className="h-4 w-4" />
              <span className="font-bold text-sm uppercase tracking-widest">
                All Systems Optimal
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Customers"
            value={getRoleCount("customer")}
            icon={Users}
            color="blue"
            trend="+12%"
          />
          <StatCard
            title="Registered Techs"
            value={getRoleCount("technician")}
            icon={Wrench}
            color="amber"
            trend="+5%"
          />
          <StatCard
            title="Pending Jobs"
            value={getBookingCount("pending") || getRoleCount("pending")}
            icon={Clock}
            color="orange"
          />
          <StatCard
            title="Completed Services"
            value={getBookingCount("completed")}
            icon={CheckCircle2}
            color="emerald"
            trend="+24%"
          />
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-white/5 border-t pt-12 font-medium text-xs text-zinc-600 uppercase tracking-widest">
          <span>Homebuddy Admin Engine v4.2.0</span>
          <span>Last Updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
}
