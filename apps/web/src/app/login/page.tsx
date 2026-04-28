"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Hammer, Lock, Mail, Shield, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
type LoginValues = z.infer<typeof loginSchema>;

type UserRole = "customer" | "technician" | "admin";

export default function UnifiedLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [_googleLoading, _setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [_focusedField, _setFocusedField] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("customer");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  const roleConfigs = {
    customer: {
      title: "Customer Login",
      subtitle: "Sign in to manage your bookings",
      icon: <User className="h-6 w-6" />,
      color: "#E8A741",
      redirect: "/dashboard",
    },
    technician: {
      title: "Technician Portal",
      subtitle: "Access your schedule and requests",
      icon: <Hammer className="h-6 w-6" />,
      color: "#3B82F6",
      redirect: "/technician/dashboard",
    },
    admin: {
      title: "Admin Command",
      subtitle: "Restricted Access Portal",
      icon: <Shield className="h-6 w-6" />,
      color: "#F59E0B",
      redirect: "/admin/dashboard",
    },
  };

  async function onSubmit(data: LoginValues) {
    setError(null);
    setLoading(true);
    try {
      const { data: session, error: authError } = await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
        },
      );

      if (authError) {
        setError(authError.message ?? "Invalid credentials. Please try again.");
        return;
      }

      // Check if user has the required role for the selected portal
      // Note: Middleware will also protect these routes
      const actualRole = session.user.role;

      if (selectedRole !== "customer" && actualRole !== selectedRole) {
        setError(`Access denied. You do not have ${selectedRole} privileges.`);
        return;
      }

      const redirectPath =
        selectedRole === "admin"
          ? "/admin/dashboard"
          : selectedRole === "technician"
            ? "/technician/dashboard"
            : "/dashboard";
      window.location.href = redirectPath;
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Dynamic Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full opacity-20 blur-[120px]"
          animate={{
            backgroundColor: [roleConfigs[selectedRole].color, "#E8A741"],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY }}
        />
        <motion.div
          className="absolute -right-[10%] -bottom-[10%] h-[40%] w-[40%] rounded-full opacity-10 blur-[120px]"
          animate={{
            backgroundColor: ["#E8A741", roleConfigs[selectedRole].color],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY }}
        />
      </div>

      <motion.div
        className="relative z-10 w-full max-w-[480px] px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="rounded-[2.5rem] border border-white/[0.05] bg-white/[0.02] p-8 shadow-2xl backdrop-blur-2xl md:p-10">
          {/* Header */}
          <div className="mb-8 text-center">
            <motion.div
              key={selectedRole}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mb-4 inline-flex rounded-2xl p-4"
              style={{
                backgroundColor: `${roleConfigs[selectedRole].color}20`,
              }}
            >
              {roleConfigs[selectedRole].icon}
            </motion.div>
            <h1 className="mb-1 font-bold text-2xl text-white transition-all">
              {roleConfigs[selectedRole].title}
            </h1>
            <p className="text-sm text-zinc-500">
              {roleConfigs[selectedRole].subtitle}
            </p>
          </div>

          {/* Role Selector Tabs */}
          <div className="mb-8 flex rounded-2xl border border-white/[0.05] bg-white/[0.03] p-1.5">
            {(["customer", "technician", "admin"] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`flex-1 rounded-xl py-2.5 font-bold text-xs uppercase tracking-widest transition-all duration-300 ${
                  selectedRole === role
                    ? "bg-white/[0.07] text-white shadow-lg"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* Error Message */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="group relative">
                <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-amber-500" />
                <input
                  {...register("email")}
                  placeholder="Email Address"
                  className="w-full rounded-2xl border border-white/5 bg-black/40 py-4 pr-4 pl-12 text-white outline-none transition-all placeholder:text-zinc-700 focus:border-white/10 focus:ring-4 focus:ring-white/[0.02]"
                />
              </div>
              <div className="group relative">
                <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-600 transition-colors group-focus-within:text-amber-500" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Access Passcode"
                  className="w-full rounded-2xl border border-white/5 bg-black/40 py-4 pr-12 pl-12 text-white outline-none transition-all placeholder:text-zinc-700 focus:border-white/10 focus:ring-4 focus:ring-white/[0.02]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-zinc-600 hover:text-white"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-2xl py-4 font-bold text-white transition-all"
              style={{
                background: `linear-gradient(135deg, ${roleConfigs[selectedRole].color} 0%, ${roleConfigs[selectedRole].color}dd 100%)`,
                boxShadow: `0 10px 30px -10px ${roleConfigs[selectedRole].color}60`,
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                  />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </motion.button>
          </form>

          {/* Social Login (Only for Customers) */}
          {selectedRole === "customer" && (
            <div className="mt-8 space-y-4 border-white/[0.05] border-t pt-8">
              <button
                onClick={() => authClient.signIn.social({ provider: "google" })}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/[0.05] bg-white/[0.03] py-4 font-semibold text-white transition-all hover:bg-white/[0.05]"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.92.45 3.73 1.18 5.33l3.66-2.84z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/register"
              className="text-sm text-zinc-500 transition-colors hover:text-amber-500"
            >
              Don't have an account?{" "}
              <span className="font-semibold text-white">Join HomeBuddy</span>
            </Link>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 flex items-center justify-center gap-8 font-medium text-xs text-zinc-600 uppercase tracking-widest">
          <Link href="/terms" className="transition-colors hover:text-zinc-400">
            Terms
          </Link>
          <Link
            href="/privacy"
            className="transition-colors hover:text-zinc-400"
          >
            Privacy
          </Link>
          <Link
            href="/support"
            className="transition-colors hover:text-zinc-400"
          >
            Support
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
