"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

export default function TechnicianForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "otp" | "reset">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendOTP = async () => {
    if (!email) {
      alert("Please enter your email");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to send OTP
      console.log("TODO: Send OTP to technician", email);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      alert(`OTP sent to ${email}! Check your inbox.`);
      setStep("otp");
    } catch (error) {
      console.error("Failed to send OTP:", error);
      alert("Failed to send OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      alert("Please enter the 6-digit OTP");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to verify OTP
      console.log("TODO: Verify OTP", otp);

      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStep("reset");
    } catch (error) {
      console.error("Failed to verify OTP:", error);
      alert("Invalid OTP. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Call API to reset password
      console.log("TODO: Reset technician password");

      await new Promise((resolve) => setTimeout(resolve, 1500));

      alert(
        "Password reset successful! You can now login with your new password.",
      );
      window.location.href = "/login";
    } catch (error) {
      console.error("Failed to reset password:", error);
      alert("Failed to reset password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <Link href="/" className="mb-4 inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 font-bold text-white text-xl">
              🔧
            </div>
            <h1 className="font-bold text-3xl text-white">HomeBuddy</h1>
          </Link>
          <h2 className="mb-2 font-bold text-2xl text-white">Reset Password</h2>
          <p className="mb-1 text-sm text-white/60">Technician Portal</p>
          <p className="text-white/40">
            {step === "email" && "Enter your email to receive OTP"}
            {step === "otp" && "Enter the OTP sent to your email"}
            {step === "reset" && "Create a new password"}
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-8">
          {/* Step 1: Email */}
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
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-white transition-all placeholder:text-white/40 focus:border-amber-500/50 focus:outline-none"
                  onKeyPress={(e) => e.key === "Enter" && handleSendOTP()}
                />
              </div>

              <button
                onClick={handleSendOTP}
                disabled={isSubmitting || !email}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-white transition-all hover:from-amber-600 hover:to-amber-700 disabled:opacity-50"
              >
                {isSubmitting ? "Sending..." : "Send OTP"}
              </button>
            </motion.div>
          )}

          {/* Step 2: OTP Verification */}
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
                  maxLength={6}
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-center text-2xl text-white tracking-widest transition-all placeholder:text-white/40 focus:border-amber-500/50 focus:outline-none"
                  onKeyPress={(e) => e.key === "Enter" && handleVerifyOTP()}
                />
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={isSubmitting || otp.length !== 6}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-white transition-all hover:from-amber-600 hover:to-amber-700 disabled:opacity-50"
              >
                {isSubmitting ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                onClick={() => setStep("email")}
                className="w-full text-sm text-white/40 transition-colors hover:text-white/60"
              >
                ← Back to email
              </button>
            </motion.div>
          )}

          {/* Step 3: Reset Password */}
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
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-white transition-all placeholder:text-white/40 focus:border-amber-500/50 focus:outline-none"
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
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-white transition-all placeholder:text-white/40 focus:border-amber-500/50 focus:outline-none"
                  onKeyPress={(e) => e.key === "Enter" && handleResetPassword()}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="mt-1 text-red-400 text-xs">
                    Passwords don't match
                  </p>
                )}
              </div>

              <button
                onClick={handleResetPassword}
                disabled={
                  isSubmitting ||
                  !newPassword ||
                  !confirmPassword ||
                  newPassword !== confirmPassword
                }
                className="w-full rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 font-semibold text-white transition-all hover:from-green-600 hover:to-green-700 disabled:opacity-50"
              >
                {isSubmitting ? "Resetting..." : "Reset Password"}
              </button>
            </motion.div>
          )}
        </div>

        {/* Back to Login */}
        <p className="mt-6 text-center text-sm text-white/40">
          Remember your password?{" "}
          <Link
            href="/login"
            className="font-medium text-amber-400 hover:text-amber-300"
          >
            Login here
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
