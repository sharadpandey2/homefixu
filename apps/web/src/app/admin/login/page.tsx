"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";

function Particle({
  delay,
  size,
  x,
  duration,
}: {
  delay: number;
  size: number;
  x: number;
  duration: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        bottom: "-20px",
        background: `radial-gradient(circle, rgba(232,167,65,${0.1 + Math.random() * 0.15}) 0%, transparent 70%)`,
      }}
      animate={{
        y: [0, -1000],
        x: [0, (Math.random() - 0.5) * 150],
        opacity: [0, 0.6, 0.4, 0],
        scale: [0.5, 1, 0.8, 0.4],
      }}
      transition={{
        duration,
        delay,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeOut",
      }}
    />
  );
}

function GridLines() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={`h-${i}`}
          className="absolute left-0 h-px w-full"
          style={{
            top: `${(i + 1) * 10}%`,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(232,167,65,0.05) 20%, rgba(232,167,65,0.05) 80%, transparent 100%)",
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Generate particles only on the client to avoid hydration mismatch
    const newParticles = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      delay: Math.random() * 5,
      size: 2 + Math.random() * 8,
      x: Math.random() * 100,
      duration: 10 + Math.random() * 10,
    }));
    setParticles(newParticles);
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error: authError } = await authClient.signIn.email({
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", { data, authError });

      if (authError) {
        setError(
          authError.message || "Invalid admin credentials. Access denied.",
        );
        setIsLoading(false);
      } else {
        // Successful login
        console.log("Login successful, redirecting to /admin/dashboard");
        await router.push("/admin/dashboard");
        // Reset loading in case middleware redirects back to this page
        setIsLoading(false);
      }
    } catch (_err) {
      setError("An unexpected error occurred. Please check your connection.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] p-4 text-white selection:bg-amber-500/30">
      {/* Background Effects */}
      <GridLines />
      <div className="pointer-events-none absolute inset-0">
        {particles.map((p) => (
          <Particle key={p.id} {...p} />
        ))}
        <div className="absolute top-[10%] left-[10%] h-[40%] w-[40%] animate-pulse rounded-full bg-amber-900/10 blur-[120px]" />
        <div
          className="absolute right-[10%] bottom-[10%] h-[30%] w-[30%] animate-pulse rounded-full bg-orange-900/10 blur-[120px]"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Back to Site */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-8 left-8 z-50"
      >
        <Link
          href="/"
          className="group flex items-center gap-2 font-medium text-sm text-zinc-500 transition-colors hover:text-amber-400"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Public Site
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-10 flex flex-col items-center text-center">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-500/20 bg-zinc-900/80 shadow-[0_0_50px_rgba(232,167,65,0.15)] backdrop-blur-md"
          >
            <ShieldCheck className="h-10 w-10 text-amber-500" />
          </motion.div>
          <h1 className="mb-2 font-bold text-3xl text-white tracking-tight">
            Admin Command
          </h1>
          <p className="font-medium text-sm text-zinc-500 uppercase tracking-widest">
            Restricted Access Portal
          </p>
        </div>

        {/* Login Form */}
        <div className="group relative overflow-hidden rounded-[2.5rem] border border-white/5 bg-zinc-900/40 p-10 shadow-2xl backdrop-blur-2xl">
          {/* Subtle border glow */}
          <div className="absolute inset-0 rounded-[2.5rem] border border-amber-500/0 transition-colors duration-500 group-hover:border-amber-500/10" />

          <form onSubmit={handleAdminLogin} className="relative z-10 space-y-6">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4"
                >
                  <p className="font-medium text-red-400 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="ml-1 font-bold text-xs text-zinc-500 uppercase tracking-widest">
                Admin Identity
              </label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-600" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-white/5 bg-black/40 py-4 pr-4 pl-12 text-white transition-all placeholder:text-zinc-700 focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="admin@homebuddy.local"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="ml-1 font-bold text-xs text-zinc-500 uppercase tracking-widest">
                Access Passcode
              </label>
              <div className="relative">
                <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-zinc-600" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/5 bg-black/40 py-4 pr-12 pl-12 text-white transition-all placeholder:text-zinc-700 focus:border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-4 -translate-y-1/2 text-zinc-600 transition-colors hover:text-zinc-400"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-4 font-bold text-black shadow-[0_10px_20px_rgba(232,167,65,0.2)] transition-all hover:from-amber-400 hover:to-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Authorize Access"
              )}
            </motion.button>
          </form>
        </div>

        <p className="mt-8 text-center font-medium text-xs text-zinc-600 tracking-wide">
          HOMEBUDDY SECURITY PROTOCOL v4.2
        </p>
      </motion.div>
    </div>
  );
}
