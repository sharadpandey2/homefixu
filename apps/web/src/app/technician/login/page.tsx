"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation"; // Removed useRouter
import { Suspense, useState } from "react";
import { authClient } from "@/lib/auth-client";

function TechnicianLoginInner() {
  const searchParams = useSearchParams();
  const justRegistered = searchParams.get("registered") === "1";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  function validate() {
    const e: Record<string, string> = {};
    if (!formData.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = "Invalid email format";
    if (!formData.password) e.password = "Password is required";
    else if (formData.password.length < 8)
      e.password = "Password must be at least 8 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // 1. Sign in via Better Auth Client
      const { error: authError } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        setErrors({ submit: authError.message ?? "Invalid credentials" });
        setIsLoading(false);
        return;
      }

      // 2. THE FIX: Force hard navigation so the middleware reads the fresh cookie
      window.location.href = "/technician/dashboard";
    } catch (err) {
      console.error("Login error:", err);
      setErrors({ submit: "Something went wrong. Please try again." });
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="mb-2 font-bold text-3xl text-white">
            Technician Portal
          </h1>
          <p className="text-white/40">Sign in to access your dashboard</p>
        </div>

        {justRegistered && (
          <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <p className="text-emerald-400 text-sm">
              ✓ Registration successful! Please sign in with your credentials.
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block font-medium text-sm text-white/60">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="technician@homebuddy.com"
                className={`w-full rounded-xl border bg-white/[0.02] px-4 py-3 ${
                  errors.email ? "border-red-500/50" : "border-white/[0.06]"
                } text-white transition-colors placeholder:text-white/30 focus:border-amber-500/30 focus:outline-none`}
              />
              {errors.email && (
                <p className="mt-1 text-red-400 text-xs">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block font-medium text-sm text-white/60">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter your password"
                className={`w-full rounded-xl border bg-white/[0.02] px-4 py-3 ${
                  errors.password ? "border-red-500/50" : "border-white/[0.06]"
                } text-white transition-colors placeholder:text-white/30 focus:border-amber-500/30 focus:outline-none`}
              />
              {errors.password && (
                <p className="mt-1 text-red-400 text-xs">{errors.password}</p>
              )}
            </div>

            {errors.submit && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                <p className="text-red-400 text-sm">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-3 font-semibold text-sm text-white transition-all hover:from-amber-600 hover:to-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/technician/forgot-password"
              className="text-amber-400 text-sm transition-colors hover:text-amber-300"
            >
              Forgot your password?
            </Link>
          </div>
        </div>

        <div className="mt-6 space-y-3 text-center">
          <p className="text-sm text-white/40">
            Need an account? Contact your administrator to create one.
          </p>
          <p className="text-sm text-white/40">
            For customer login,{" "}
            <Link href="/login" className="text-amber-400 hover:text-amber-300">
              click here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function TechnicianLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950" />}>
      <TechnicianLoginInner />
    </Suspense>
  );
}
