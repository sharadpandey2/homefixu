"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Briefcase,
  Building,
  CheckCircle2,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldPlus,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:3000";

export default function CreateTechnicianPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "plumbing",
    experienceYears: "",
    city: "",
    pincode: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch(`${API_URL}/api/admin/technicians`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(errorData?.message || "Failed to create technician");
      }

      setSuccess(true);
      setFormData({
        fullName: "",
        email: "",
        password: "",
        phone: "",
        role: "plumbing",
        experienceYears: "",
        city: "",
        pincode: "",
      });

      // Auto redirect after success
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6 text-white selection:bg-amber-500/30 lg:p-12">
      <div className="mx-auto max-w-4xl space-y-10">
        {/* Header */}
        <div className="flex items-center gap-6">
          <Link
            href="/admin/dashboard"
            className="group rounded-2xl border border-white/5 bg-zinc-900/50 p-4 transition-all hover:bg-amber-500/10"
          >
            <ArrowLeft className="h-5 w-5 text-zinc-500 transition-colors group-hover:text-amber-500" />
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-[10px] text-amber-500 uppercase tracking-widest">
              <ShieldPlus className="h-3.5 w-3.5" />
              Human Resources
            </div>
            <h1 className="font-bold text-4xl tracking-tight">
              Onboard Technician
            </h1>
            <p className="text-zinc-500">
              Create a verified service provider account.
            </p>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-900/40 p-10 shadow-2xl backdrop-blur-2xl"
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 -mt-32 -mr-32 h-64 w-64 rounded-full bg-amber-500/5 blur-[100px]" />

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-8 flex items-start gap-4 rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-red-400"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="font-medium text-sm">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-8 flex items-start gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-emerald-400"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="space-y-1">
                  <p className="font-bold text-sm">
                    Technician Successfully Created
                  </p>
                  <p className="text-xs opacity-70">
                    Redirecting to dashboard...
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
            <div className="grid grid-cols-1 gap-x-10 gap-y-8 md:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-2.5">
                <label className="ml-1 font-bold text-xs text-zinc-500 uppercase tracking-widest">
                  Full Name
                </label>
                <div className="group relative">
                  <User className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-amber-500" />
                  <input
                    type="text"
                    name="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/5 bg-black/40 py-4 pr-4 pl-12 text-white transition-all placeholder:text-zinc-700 focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    placeholder="e.g. Sharad Pandey"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2.5">
                <label className="ml-1 font-bold text-xs text-zinc-500 uppercase tracking-widest">
                  Login Email
                </label>
                <div className="group relative">
                  <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-amber-500" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/5 bg-black/40 py-4 pr-4 pl-12 text-white transition-all placeholder:text-zinc-700 focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    placeholder="tech@homebuddy.local"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2.5">
                <label className="ml-1 font-bold text-xs text-zinc-500 uppercase tracking-widest">
                  Access Password
                </label>
                <div className="group relative">
                  <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-amber-500" />
                  <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/5 bg-black/40 py-4 pr-4 pl-12 text-white transition-all placeholder:text-zinc-700 focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2.5">
                <label className="ml-1 font-bold text-xs text-zinc-500 uppercase tracking-widest">
                  Mobile Number
                </label>
                <div className="group relative">
                  <Phone className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-amber-500" />
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/5 bg-black/40 py-4 pr-4 pl-12 text-white transition-all placeholder:text-zinc-700 focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    placeholder="+91 00000 00000"
                  />
                </div>
              </div>

              {/* Specialization */}
              <div className="space-y-2.5">
                <label className="ml-1 font-bold text-xs text-zinc-500 uppercase tracking-widest">
                  Service Domain
                </label>
                <div className="group relative">
                  <Briefcase className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-amber-500" />
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full cursor-pointer appearance-none rounded-2xl border border-white/5 bg-black/40 py-4 pr-4 pl-12 text-white transition-all focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  >
                    <option value="plumbing">Plumbing Specialists</option>
                    <option value="electrical">Electrical Engineering</option>
                    <option value="pest_control">Pest Management</option>
                    <option value="hvac">HVAC & Cooling</option>
                    <option value="structural">Structural Work</option>
                    <option value="painting">Professional Painting</option>
                    <option value="waterproofing">
                      Waterproofing Solutions
                    </option>
                    <option value="appliance">Appliance Diagnostics</option>
                  </select>
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-2.5">
                <label className="ml-1 font-bold text-xs text-zinc-500 uppercase tracking-widest">
                  Industry Experience
                </label>
                <div className="group relative">
                  <CheckCircle2 className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-amber-500" />
                  <input
                    type="text"
                    name="experienceYears"
                    value={formData.experienceYears}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/5 bg-black/40 py-4 pr-4 pl-12 text-white transition-all placeholder:text-zinc-700 focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    placeholder="e.g. 5 Years"
                  />
                </div>
              </div>

              {/* City */}
              <div className="space-y-2.5">
                <label className="ml-1 font-bold text-xs text-zinc-500 uppercase tracking-widest">
                  Operational City
                </label>
                <div className="group relative">
                  <Building className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-amber-500" />
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/5 bg-black/40 py-4 pr-4 pl-12 text-white transition-all placeholder:text-zinc-700 focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    placeholder="e.g. Bangalore"
                  />
                </div>
              </div>

              {/* Pincode */}
              <div className="space-y-2.5">
                <label className="ml-1 font-bold text-xs text-zinc-500 uppercase tracking-widest">
                  Postal Code
                </label>
                <div className="group relative">
                  <MapPin className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-amber-500" />
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/5 bg-black/40 py-4 pr-4 pl-12 text-white transition-all placeholder:text-zinc-700 focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    placeholder="560001"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end border-white/5 border-t pt-8">
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-3 rounded-2xl bg-amber-500 px-10 py-4 font-bold text-black shadow-[0_10px_30px_rgba(232,167,65,0.2)] transition-all hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Finalize Onboarding"
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
