"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client"; // Ensure this path matches your setup

// Base API URL for custom backend settings (like phone or notifications)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  bookingReminders: boolean;
  reportReady: boolean;
  packageExpiry: boolean;
}

export default function SettingsPage() {
  const router = useRouter();

  // ─── BETTER AUTH SESSION ────────────────────────────────────────────────
  const { data: session, isPending: isLoading } = authClient.useSession();
  const user = session?.user;

  // Form states
  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>(
    {},
  );

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>(
    {},
  );

  // Email verification state
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  // Notification settings
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    bookingReminders: true,
    reportReady: true,
    packageExpiry: true,
  });

  // Sync session data to local state when loaded
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        phone: (user as any).phone || "", // Cast to any if phone is a custom DB field
      });
    }
  }, [user]);

  // ─── PROFILE HANDLERS ───────────────────────────────────────────────────
  const validateProfile = () => {
    const errors: Record<string, string> = {};
    if (!profileData.name.trim()) errors.name = "Name is required";
    if (profileData.phone && !/^\+?[\d\s-]{10,15}$/.test(profileData.phone)) {
      errors.phone = "Invalid phone number";
    }
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSave = async () => {
    if (!validateProfile()) return;

    try {
      // 1. Update Better Auth User
      await authClient.updateUser({
        name: profileData.name,
      });

      // 2. (Optional) Update custom fields in your NestJS backend
      await fetch(`${API_BASE_URL}/api/customer/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phone: profileData.phone }),
      });

      setIsEditingProfile(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  const handleProfileCancel = () => {
    setProfileData({
      name: user?.name || "",
      phone: (user as any)?.phone || "",
    });
    setIsEditingProfile(false);
    setProfileErrors({});
  };

  // ─── EMAIL VERIFICATION HANDLER ─────────────────────────────────────────
  const handleSendVerification = async () => {
    if (!user?.email) return;
    setIsVerifyingEmail(true);
    try {
      await authClient.sendVerificationEmail({
        email: user.email,
        callbackURL: "/dashboard/settings",
      });
      setVerificationSent(true);
      alert("Verification email sent! Check your inbox.");
    } catch (error) {
      console.error("Failed to send verification:", error);
      alert("Failed to send verification email. Please try again.");
    } finally {
      setIsVerifyingEmail(false);
    }
  };

  // ─── PASSWORD HANDLERS ──────────────────────────────────────────────────
  const validatePassword = () => {
    const errors: Record<string, string> = {};
    if (!passwordData.currentPassword)
      errors.currentPassword = "Current password is required";
    if (!passwordData.newPassword)
      errors.newPassword = "New password is required";
    else if (passwordData.newPassword.length < 8)
      errors.newPassword = "Password must be at least 8 characters";
    if (passwordData.newPassword !== passwordData.confirmPassword)
      errors.confirmPassword = "Passwords do not match";

    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async () => {
    if (!validatePassword()) return;
    setIsChangingPassword(true);

    try {
      const { error } = await authClient.changePassword({
        newPassword: passwordData.newPassword,
        currentPassword: passwordData.currentPassword,
        revokeOtherSessions: true,
      });

      if (error) throw new Error(error.message);

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      alert("Password changed successfully!");
    } catch (error: any) {
      console.error("Failed to change password:", error);
      alert(
        error.message ||
          "Failed to change password. Please check your current password.",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  // ─── NOTIFICATION HANDLERS ──────────────────────────────────────────────
  const handleNotificationToggle = async (key: keyof NotificationSettings) => {
    const newSettings = { ...notifications, [key]: !notifications[key] };
    setNotifications(newSettings);

    try {
      await fetch(`${API_BASE_URL}/api/customer/settings/notifications`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newSettings),
      });
    } catch (error) {
      console.error("Failed to update notifications:", error);
    }
  };

  // ─── LOGOUT HANDLER ─────────────────────────────────────────────────────
  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        await authClient.signOut();
        router.push("/login");
      } catch (error) {
        console.error("Failed to logout:", error);
      }
    }
  };

  // ─── RENDER ─────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-amber-500/20 border-t-amber-500" />
            <p className="text-white/40">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl py-12 text-center">
        <p className="text-white/40">
          Failed to load user data. Please log in again.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="mt-4 rounded-xl bg-amber-500 px-4 py-2 font-semibold text-white"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-2 font-bold text-3xl text-white tracking-tight">
          Settings
        </h1>
        <p className="text-white/40">Manage your account and preferences</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="rounded-2xl border border-white/6 bg-linear-to-br from-white/4 to-white/2 p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-bold text-white text-xl">Profile</h2>
          {!isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="rounded-xl px-4 py-2 font-medium text-amber-400 text-sm transition-all hover:bg-amber-500/10"
            >
              Edit
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-2 block font-medium text-sm text-white/40">
              Full Name
            </label>
            {isEditingProfile ? (
              <input
                type="text"
                value={profileData.name}
                onChange={(e) =>
                  setProfileData({ ...profileData, name: e.target.value })
                }
                className={`w-full rounded-xl border bg-white/2 px-4 py-3 ${profileErrors.name ? "border-red-500/50" : "border-white/6"} text-white transition-colors placeholder:text-white/30 focus:border-amber-500/30 focus:outline-none`}
              />
            ) : (
              <p className="text-white">{user.name}</p>
            )}
            {profileErrors.name && (
              <p className="mt-1 text-red-400 text-xs">{profileErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="mb-2 block font-medium text-sm text-white/40">
              Email Address
            </label>
            <div className="flex items-center justify-between">
              <p className="text-white">{user.email}</p>
              {user.emailVerified ? (
                <span className="rounded-full border border-green-500/30 bg-green-500/20 px-3 py-1 font-semibold text-green-400 text-xs">
                  ✓ Verified
                </span>
              ) : (
                <button
                  onClick={handleSendVerification}
                  disabled={isVerifyingEmail || verificationSent}
                  className="rounded-xl bg-amber-500/10 px-4 py-2 font-medium text-amber-400 text-sm transition-all hover:bg-amber-500/20 disabled:opacity-50"
                >
                  {isVerifyingEmail
                    ? "Sending..."
                    : verificationSent
                      ? "Sent!"
                      : "Verify Email"}
                </button>
              )}
            </div>
            {!user.emailVerified && (
              <p className="mt-1 text-amber-400 text-xs">
                Please verify your email to enable all features
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="mb-2 block font-medium text-sm text-white/40">
              Phone Number (Optional)
            </label>
            {isEditingProfile ? (
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
                placeholder="+91 98765 43210"
                className={`w-full rounded-xl border bg-white/2 px-4 py-3 ${profileErrors.phone ? "border-red-500/50" : "border-white/6"} text-white transition-colors placeholder:text-white/30 focus:border-amber-500/30 focus:outline-none`}
              />
            ) : (
              <p className="text-white">
                {(user as any).phone || "Not provided"}
              </p>
            )}
            {profileErrors.phone && (
              <p className="mt-1 text-red-400 text-xs">{profileErrors.phone}</p>
            )}
          </div>

          {/* Edit Actions */}
          {isEditingProfile && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleProfileCancel}
                className="flex-1 rounded-xl px-4 py-3 font-semibold text-sm text-white/70 transition-all hover:bg-white/4"
              >
                Cancel
              </button>
              <button
                onClick={handleProfileSave}
                className="flex-1 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 px-4 py-3 font-semibold text-sm text-white transition-all hover:from-amber-600 hover:to-amber-700"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Password Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="rounded-2xl border border-white/6 bg-linear-to-br from-white/4 to-white/2 p-6"
      >
        <h2 className="mb-6 font-bold text-white text-xl">Change Password</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-medium text-sm text-white/40">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              className={`w-full rounded-xl border bg-white/2 px-4 py-3 ${passwordErrors.currentPassword ? "border-red-500/50" : "border-white/6"} text-white transition-colors placeholder:text-white/30 focus:border-amber-500/30 focus:outline-none`}
            />
            {passwordErrors.currentPassword && (
              <p className="mt-1 text-red-400 text-xs">
                {passwordErrors.currentPassword}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block font-medium text-sm text-white/40">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              className={`w-full rounded-xl border bg-white/2 px-4 py-3 ${passwordErrors.newPassword ? "border-red-500/50" : "border-white/6"} text-white transition-colors placeholder:text-white/30 focus:border-amber-500/30 focus:outline-none`}
            />
            {passwordErrors.newPassword && (
              <p className="mt-1 text-red-400 text-xs">
                {passwordErrors.newPassword}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block font-medium text-sm text-white/40">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              className={`w-full rounded-xl border bg-white/2 px-4 py-3 ${passwordErrors.confirmPassword ? "border-red-500/50" : "border-white/6"} text-white transition-colors placeholder:text-white/30 focus:border-amber-500/30 focus:outline-none`}
            />
            {passwordErrors.confirmPassword && (
              <p className="mt-1 text-red-400 text-xs">
                {passwordErrors.confirmPassword}
              </p>
            )}
          </div>

          <button
            onClick={handlePasswordChange}
            disabled={isChangingPassword}
            className="w-full rounded-xl bg-white/4 px-4 py-3 font-semibold text-sm text-white transition-all hover:bg-white/8 disabled:opacity-50"
          >
            {isChangingPassword ? "Changing Password..." : "Change Password"}
          </button>
        </div>
      </motion.div>

      {/* Notification Preferences */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="rounded-2xl border border-white/6 bg-linear-to-br from-white/4 to-white/2 p-6"
      >
        <h2 className="mb-6 font-bold text-white text-xl">Notifications</h2>
        <div className="space-y-4">
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/6 bg-white/2 p-4 transition-all hover:bg-white/4">
            <div>
              <p className="font-medium text-sm text-white">
                Email Notifications
              </p>
              <p className="text-white/40 text-xs">Receive updates via email</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.emailNotifications}
              onChange={() => handleNotificationToggle("emailNotifications")}
              className="h-5 w-5 rounded border-white/10 bg-white/6 text-amber-500 focus:ring-2 focus:ring-amber-500/50"
            />
          </label>
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/6 bg-white/2 p-4 transition-all hover:bg-white/4">
            <div>
              <p className="font-medium text-sm text-white">
                SMS Notifications
              </p>
              <p className="text-white/40 text-xs">Receive updates via SMS</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.smsNotifications}
              onChange={() => handleNotificationToggle("smsNotifications")}
              className="h-5 w-5 rounded border-white/10 bg-white/6 text-amber-500 focus:ring-2 focus:ring-amber-500/50"
            />
          </label>
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/6 bg-white/2 p-4 transition-all hover:bg-white/4">
            <div>
              <p className="font-medium text-sm text-white">
                Push Notifications
              </p>
              <p className="text-white/40 text-xs">
                Receive push notifications
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifications.pushNotifications}
              onChange={() => handleNotificationToggle("pushNotifications")}
              className="h-5 w-5 rounded border-white/10 bg-white/6 text-amber-500 focus:ring-2 focus:ring-amber-500/50"
            />
          </label>

          <div className="mt-4 border-white/6 border-t pt-4">
            <p className="mb-3 font-medium text-sm text-white/60">
              Notification Types
            </p>
            <label className="mb-3 flex cursor-pointer items-center justify-between rounded-xl border border-white/6 bg-white/2 p-4 transition-all hover:bg-white/4">
              <div>
                <p className="font-medium text-sm text-white">
                  Booking Reminders
                </p>
                <p className="text-white/40 text-xs">
                  Reminders for upcoming service bookings
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.bookingReminders}
                onChange={() => handleNotificationToggle("bookingReminders")}
                className="h-5 w-5 rounded border-white/10 bg-white/6 text-amber-500 focus:ring-2 focus:ring-amber-500/50"
              />
            </label>
            <label className="mb-3 flex cursor-pointer items-center justify-between rounded-xl border border-white/6 bg-white/2 p-4 transition-all hover:bg-white/4">
              <div>
                <p className="font-medium text-sm text-white">Report Ready</p>
                <p className="text-white/40 text-xs">
                  When your home health report is ready
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.reportReady}
                onChange={() => handleNotificationToggle("reportReady")}
                className="h-5 w-5 rounded border-white/10 bg-white/6 text-amber-500 focus:ring-2 focus:ring-amber-500/50"
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/6 bg-white/2 p-4 transition-all hover:bg-white/4">
              <div>
                <p className="font-medium text-sm text-white">Package Expiry</p>
                <p className="text-white/40 text-xs">
                  10 days before subscription expires
                </p>
              </div>
              <input
                type="checkbox"
                checked={notifications.packageExpiry}
                onChange={() => handleNotificationToggle("packageExpiry")}
                className="h-5 w-5 rounded border-white/10 bg-white/6 text-amber-500 focus:ring-2 focus:ring-amber-500/50"
              />
            </label>
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="rounded-2xl border border-red-500/20 bg-linear-to-br from-red-500/10 to-red-600/5 p-6"
      >
        <h2 className="mb-4 font-bold text-white text-xl">Danger Zone</h2>
        <button
          onClick={handleLogout}
          className="w-full rounded-xl bg-red-500/20 px-4 py-3 font-semibold text-red-400 text-sm transition-all hover:bg-red-500/30"
        >
          Logout
        </button>
      </motion.div>
    </div>
  );
}
