"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Define an interface for your API responses to satisfy TypeScript
interface ApiResponse {
  message?: string;
  verified?: boolean;
}

export default function CustomerForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendOTP = async () => {
    if (!email) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      // Type cast 'data' to ApiResponse
      const data = (await res.json()) as ApiResponse;

      if (!res.ok) throw new Error(data.message || "Failed to send OTP");

      alert(data.message);
      setStep("otp");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode: otp }),
      });

      const data = (await res.json()) as ApiResponse;

      if (!res.ok) throw new Error(data.message || "Invalid OTP");
      setStep("reset");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otpCode: otp, newPassword }),
      });

      const data = (await res.json()) as ApiResponse;

      if (!res.ok) throw new Error(data.message || "Reset failed");
      alert("Password reset successful!");
      router.push("/login");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-flex items-center gap-3">
            {/* Tailwind v4: bg-linear-to-br */}
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-amber-500 to-amber-600 font-bold text-white text-xl">
              🏠
            </div>
            <h1 className="font-bold text-3xl text-white">HomeBuddy</h1>
          </Link>
          <h2 className="mb-2 font-bold text-2xl text-white">Reset Password</h2>
          <p className="text-white/40">
            {step === "email" && "Enter your email to receive OTP"}
            {step === "otp" && "Enter the OTP sent to your email"}
            {step === "reset" && "Create a new password"}
          </p>
        </div>

        {/* Tailwind v4: bg-linear-to-br, from-white/4, to-white/2, border-white/6 */}
        <div className="rounded-2xl border border-white/6 bg-linear-to-br from-white/4 to-white/2 p-8">
          {step === "email" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="mb-2 block font-medium text-sm text-white/60">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full rounded-xl border border-white/6 bg-white/4 px-4 py-3 text-white transition-all focus:border-amber-500/50 focus:outline-none"
                />
              </div>
              <button
                onClick={handleSendOTP}
                disabled={isSubmitting || !email}
                className="w-full rounded-xl bg-linear-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Send OTP"}
              </button>
            </motion.div>
          )}

          {step === "otp" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-green-400 text-sm">
                OTP sent to {email}
              </div>
              <div>
                <label className="mb-2 block font-medium text-sm text-white/60">
                  Enter 6-digit OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  className="w-full rounded-xl border border-white/6 bg-white/4 px-4 py-3 text-center text-2xl text-white tracking-widest transition-all focus:border-amber-500/50 focus:outline-none"
                />
              </div>
              <button
                onClick={handleVerifyOTP}
                disabled={isSubmitting || otp.length !== 6}
                className="w-full rounded-xl bg-linear-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
              >
                {isSubmitting ? "Verifying..." : "Verify OTP"}
              </button>
            </motion.div>
          )}

          {step === "reset" && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="mb-2 block font-medium text-sm text-white/60">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full rounded-xl border border-white/6 bg-white/4 px-4 py-3 text-white transition-all focus:border-amber-500/50 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block font-medium text-sm text-white/60">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full rounded-xl border border-white/6 bg-white/4 px-4 py-3 text-white transition-all focus:border-amber-500/50 focus:outline-none"
                />
              </div>
              <button
                onClick={handleResetPassword}
                disabled={
                  isSubmitting ||
                  !newPassword ||
                  newPassword !== confirmPassword
                }
                className="w-full rounded-xl bg-linear-to-r from-green-500 to-green-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
