"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
type RegisterValues = z.infer<typeof registerSchema>;

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
        background: `radial-gradient(circle, rgba(232,167,65,${0.15 + Math.random() * 0.2}) 0%, transparent 70%)`,
      }}
      animate={{
        y: [0, -800 - Math.random() * 400],
        x: [0, (Math.random() - 0.5) * 200],
        opacity: [0, 0.8, 0.6, 0],
        scale: [0.5, 1.2, 0.8, 0.3],
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
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`h-${i}`}
          className="absolute left-0 h-px w-full"
          style={{
            top: `${(i + 1) * 12}%`,
            background:
              "linear-gradient(90deg, transparent 0%, rgba(232,167,65,0.06) 20%, rgba(232,167,65,0.06) 80%, transparent 100%)",
          }}
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 2, delay: i * 0.15, ease: "easeOut" }}
        />
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={`v-${i}`}
          className="absolute top-0 h-full w-px"
          style={{
            left: `${(i + 1) * 16}%`,
            background:
              "linear-gradient(180deg, transparent 0%, rgba(232,167,65,0.04) 30%, rgba(232,167,65,0.04) 70%, transparent 100%)",
          }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 2.5, delay: 0.5 + i * 0.12, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function GlowingOrbs() {
  return (
    <>
      <motion.div
        className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, rgba(232,167,65,0.15) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -40, 50, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 20,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -right-32 -bottom-48 h-[600px] w-[600px] rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, rgba(200,120,40,0.2) 0%, transparent 70%)",
        }}
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 60, -30, 0],
          scale: [1, 0.85, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    </>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
    { label: "Symbol", ok: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="mt-2.5 overflow-hidden"
    >
      <div className="mb-2 flex gap-1.5">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1 flex-1 overflow-hidden rounded-full bg-white/10"
          >
            <motion.div
              className="h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: i <= score ? "100%" : "0%" }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              style={{ background: colors[score] }}
            />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-3">
          {checks.map((c) => (
            <span
              key={c.label}
              className="flex items-center gap-1 text-[11px]"
              style={{ color: c.ok ? "#34d399" : "rgba(255,255,255,0.25)" }}
            >
              <span>{c.ok ? "✓" : "·"}</span>
              {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span
            className="font-semibold text-[11px]"
            style={{ color: colors[score] }}
          >
            {labels[score]}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, dirtyFields },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const passwordValue = watch("password") ?? "";
  const confirmValue = watch("confirmPassword") ?? "";
  const nameValue = watch("name") ?? "";
  const emailValue = watch("email") ?? "";

  const particles = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    delay: Math.random() * 8,
    size: 4 + Math.random() * 12,
    x: Math.random() * 100,
    duration: 8 + Math.random() * 12,
  }));

  async function onSubmit(data: RegisterValues) {
    setError(null);
    setLoading(true);
    try {
      const { error: authError } = await authClient.signUp.email({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      if (authError) {
        setError(authError.message ?? "Registration failed. Please try again.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({ provider: "google" });
    } catch {
      setError("Google sign-in is not configured yet.");
      setGoogleLoading(false);
    }
  }

  return (
    <div
      className="relative flex min-h-dvh items-center justify-center overflow-hidden py-10"
      style={{
        background:
          "linear-gradient(145deg, #0a0a0a 0%, #111111 30%, #0d0d0d 60%, #0a0a0a 100%)",
      }}
    >
      <GridLines />
      <GlowingOrbs />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      <div className="pointer-events-none absolute inset-0">
        {particles.map((p) => (
          <Particle key={p.id} {...p} />
        ))}
      </div>

      <motion.div
        className="relative z-10 w-full max-w-[440px] px-5"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="relative overflow-hidden rounded-3xl p-8 sm:p-10"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
            backdropFilter: "blur(40px)",
            WebkitBackdropFilter: "blur(40px)",
            border: "1px solid rgba(232,167,65,0.12)",
            boxShadow:
              "0 0 80px rgba(232,167,65,0.06), 0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <motion.div
            className="pointer-events-none absolute -inset-px rounded-3xl"
            style={{
              background:
                "conic-gradient(from 0deg, transparent, rgba(232,167,65,0.3), transparent, rgba(232,167,65,0.15), transparent)",
            }}
            animate={{ opacity: focusedField ? 0.6 : 0, rotate: [0, 360] }}
            transition={{
              opacity: { duration: 0.4 },
              rotate: {
                duration: 8,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              },
            }}
          />

          <div className="relative z-10">
            {/* Header */}
            <motion.div
              className="mb-8 flex flex-col items-center"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.div
                className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, #E8A741 0%, #D4872D 100%)",
                  boxShadow:
                    "0 8px 32px rgba(232,167,65,0.3), 0 0 0 1px rgba(232,167,65,0.1)",
                }}
                whileHover={{ scale: 1.08, rotate: 3 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </motion.div>
              <h1 className="font-bold text-[26px] text-white tracking-tight">
                Create account
              </h1>
              <p className="mt-1.5 text-sm text-white/40">
                Start your home health journey
              </p>
            </motion.div>

            {/* Success state */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6 overflow-hidden rounded-xl"
                  style={{
                    background: "rgba(34,197,94,0.1)",
                    border: "1px solid rgba(34,197,94,0.2)",
                  }}
                >
                  <div className="flex items-center gap-2.5 px-4 py-3">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#34d399"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                    <p className="text-emerald-400 text-sm">
                      Account created! Redirecting...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google */}
            <motion.button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="group relative mb-6 flex h-[52px] w-full items-center justify-center gap-3 overflow-hidden rounded-xl font-semibold text-sm text-white transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.div
                className="absolute inset-0 opacity-0 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(232,167,65,0.08), transparent)",
                }}
                animate={{ x: ["-100%", "200%"] }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "linear",
                }}
              />
              {googleLoading ? (
                <motion.div
                  className="rounded-full border-2 border-white/20 border-t-amber-400"
                  style={{ width: 20, height: 20 }}
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 0.8,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                />
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.92.45 3.73 1.18 5.33l3.66-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span className="relative z-10">Continue with Google</span>
                </>
              )}
            </motion.button>

            {/* Divider */}
            <motion.div
              className="relative mb-6 flex items-center gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5 }}
            >
              <div
                className="h-px flex-1"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                }}
              />
              <span className="font-medium text-white/25 text-xs uppercase tracking-widest">
                or
              </span>
              <div
                className="h-px flex-1"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                }}
              />
            </motion.div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: "auto", marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden rounded-xl"
                  style={{
                    background: "rgba(220,38,38,0.1)",
                    border: "1px solid rgba(220,38,38,0.2)",
                  }}
                >
                  <div className="flex items-center gap-2.5 px-4 py-3">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45, duration: 0.5 }}
              >
                <label
                  htmlFor="name"
                  className="mb-2 block font-semibold text-white/40 text-xs uppercase tracking-wider"
                >
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Rahul Sharma"
                    className="peer h-[52px] w-full rounded-xl bg-white/[0.04] px-4 pl-11 text-[15px] text-white outline-none ring-1 ring-white/[0.08] transition-all duration-300 placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-amber-500/50"
                    {...register("name")}
                    onFocus={() => setFocusedField("name")}
                    onBlur={(e) => {
                      register("name").onBlur(e);
                      setFocusedField(null);
                    }}
                  />
                  <div className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-white/25 transition-colors duration-300 peer-focus:text-amber-400/70">
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <AnimatePresence>
                    {dirtyFields.name &&
                      !errors.name &&
                      nameValue.length >= 2 && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.5 }}
                          className="absolute top-1/2 right-3.5 -translate-y-1/2"
                        >
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#34d399"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          </div>
                        </motion.div>
                      )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {errors.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="mt-1.5 text-red-400 text-xs"
                    >
                      {errors.name.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <label
                  htmlFor="email"
                  className="mb-2 block font-semibold text-white/40 text-xs uppercase tracking-wider"
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="peer h-[52px] w-full rounded-xl bg-white/[0.04] px-4 pl-11 text-[15px] text-white outline-none ring-1 ring-white/[0.08] transition-all duration-300 placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-amber-500/50"
                    {...register("email")}
                    onFocus={() => setFocusedField("email")}
                    onBlur={(e) => {
                      register("email").onBlur(e);
                      setFocusedField(null);
                    }}
                  />
                  <div className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-white/25 transition-colors duration-300 peer-focus:text-amber-400/70">
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="3" />
                      <polyline points="22,7 12,14 2,7" />
                    </svg>
                  </div>
                  <AnimatePresence>
                    {dirtyFields.email && !errors.email && emailValue && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute top-1/2 right-3.5 -translate-y-1/2"
                      >
                        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#34d399"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="mt-1.5 text-red-400 text-xs"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55, duration: 0.5 }}
              >
                <label
                  htmlFor="password"
                  className="mb-2 block font-semibold text-white/40 text-xs uppercase tracking-wider"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a strong password"
                    className="peer h-[52px] w-full rounded-xl bg-white/[0.04] px-4 pr-12 pl-11 text-[15px] text-white outline-none ring-1 ring-white/[0.08] transition-all duration-300 placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-amber-500/50"
                    {...register("password")}
                    onFocus={() => setFocusedField("password")}
                    onBlur={(e) => {
                      register("password").onBlur(e);
                      setFocusedField(null);
                    }}
                  />
                  <div className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-white/25 transition-colors duration-300 peer-focus:text-amber-400/70">
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="3" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3.5 -translate-y-1/2 text-white/25 transition-colors hover:text-white/50"
                  >
                    {showPassword ? (
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
                <AnimatePresence>
                  {passwordValue && (
                    <PasswordStrength password={passwordValue} />
                  )}
                </AnimatePresence>
                <AnimatePresence>
                  {errors.password && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="mt-1.5 text-red-400 text-xs"
                    >
                      {errors.password.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Confirm Password */}
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block font-semibold text-white/40 text-xs uppercase tracking-wider"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    className="peer h-[52px] w-full rounded-xl bg-white/[0.04] px-4 pr-12 pl-11 text-[15px] text-white outline-none ring-1 ring-white/[0.08] transition-all duration-300 placeholder:text-white/20 focus:bg-white/[0.07] focus:ring-amber-500/50"
                    {...register("confirmPassword")}
                    onFocus={() => setFocusedField("confirm")}
                    onBlur={(e) => {
                      register("confirmPassword").onBlur(e);
                      setFocusedField(null);
                    }}
                  />
                  <div className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-white/25 transition-colors duration-300 peer-focus:text-amber-400/70">
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="3" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute top-1/2 right-3.5 -translate-y-1/2 text-white/25 transition-colors hover:text-white/50"
                  >
                    {showConfirm ? (
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="17"
                        height="17"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                  {/* match indicator */}
                  <AnimatePresence>
                    {confirmValue && passwordValue && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute top-1/2 right-10 -translate-y-1/2"
                      >
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full ${confirmValue === passwordValue ? "bg-emerald-500/20" : "bg-red-500/20"}`}
                        >
                          {confirmValue === passwordValue ? (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#34d399"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          ) : (
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="#f87171"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <AnimatePresence>
                  {errors.confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="mt-1.5 text-red-400 text-xs"
                    >
                      {errors.confirmPassword.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Terms */}
              <motion.p
                className="text-center text-white/25 text-xs leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65 }}
              >
                By creating an account, you agree to our{" "}
                <Link
                  href={"/terms" as never}
                  className="text-amber-400/60 no-underline transition-colors hover:text-amber-400"
                >
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  href={"/privacy" as never}
                  className="text-amber-400/60 no-underline transition-colors hover:text-amber-400"
                >
                  Privacy Policy
                </Link>
              </motion.p>

              {/* Submit */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <motion.button
                  type="submit"
                  disabled={loading || success}
                  className="group relative mt-1 flex h-[52px] w-full items-center justify-center overflow-hidden rounded-xl font-bold text-sm text-white tracking-wide disabled:cursor-not-allowed"
                  style={{
                    background:
                      "linear-gradient(135deg, #E8A741 0%, #D4872D 50%, #C47525 100%)",
                    boxShadow:
                      "0 8px 32px rgba(232,167,65,0.25), 0 0 0 1px rgba(232,167,65,0.15), inset 0 1px 0 rgba(255,255,255,0.15)",
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100"
                    style={{
                      background:
                        "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)",
                    }}
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                      repeatDelay: 1,
                    }}
                  />
                  {loading ? (
                    <div className="flex items-center gap-2.5">
                      <motion.div
                        className="rounded-full border-2 border-white/30 border-t-white"
                        style={{ width: 18, height: 18 }}
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 0.7,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "linear",
                        }}
                      />
                      <span className="text-white/80">Creating account...</span>
                    </div>
                  ) : success ? (
                    <div className="flex items-center gap-2">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      <span>Account created!</span>
                    </div>
                  ) : (
                    <span className="relative z-10">Create Account</span>
                  )}
                </motion.button>
              </motion.div>
            </form>

            <motion.p
              className="mt-7 text-center text-sm text-white/30"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.85, duration: 0.5 }}
            >
              Already have an account?{" "}
              <Link
                href={"/login" as never}
                className="font-semibold text-amber-400/80 no-underline transition-all hover:text-amber-300 hover:underline"
              >
                Sign in
              </Link>
            </motion.p>
          </div>
        </div>

        <motion.div
          className="mt-6 flex items-center justify-center gap-2 text-white/15"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span className="font-medium text-xs tracking-wider">HomeBuddy</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
