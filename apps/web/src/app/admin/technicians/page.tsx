"use client";

import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

interface Technician {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  city: string;
  approvalStatus: string;
  isVerified: boolean;
  createdAt: string;
}

export default function TechniciansListPage() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/technicians`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load technicians");
        const data: Technician[] = await res.json();
        setTechnicians(data);
      } catch {
        // silently fail for now
      } finally {
        setIsLoading(false);
      }
    };
    fetchTechnicians();
  }, []);

  const filtered = technicians.filter(
    (t) =>
      t.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.city.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const statusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-amber-400" />;
    }
  };

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
    <div className="min-h-screen bg-[#0a0a0a] p-8 text-white lg:p-12">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Link
              href="/admin/dashboard"
              className="mb-4 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2 font-bold text-amber-500 text-xs uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4" />
              Technician Management
            </div>
            <h1 className="font-bold text-4xl tracking-tight">
              All Technicians
            </h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by name, email, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-zinc-900 py-3 pr-4 pl-11 text-sm text-white placeholder:text-zinc-600 focus:border-amber-500/50 focus:outline-none md:w-80"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/40 backdrop-blur-xl">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-white/5 border-b text-xs text-zinc-500 uppercase tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-zinc-600"
                  >
                    No technicians found.
                  </td>
                </tr>
              ) : (
                filtered.map((tech) => (
                  <tr
                    key={tech.id}
                    className="border-white/5 border-b transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      {tech.fullName}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">{tech.email}</td>
                    <td className="px-6 py-4 text-zinc-400">{tech.city}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-amber-500/10 px-3 py-1 text-amber-400 text-xs">
                        {tech.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 capitalize">
                        {statusIcon(tech.approvalStatus)}
                        {tech.approvalStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
