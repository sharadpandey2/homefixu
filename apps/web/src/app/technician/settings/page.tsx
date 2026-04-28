"use client";

import { motion } from "motion/react";
import { useState } from "react";

// Types
interface TechnicianProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  domain: string;
  experience_years: number;
  is_active: boolean;
}

interface Availability {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
  start_time: string;
  end_time: string;
}

interface NotificationSettings {
  new_requests: boolean;
  schedule_changes: boolean;
  payment_updates: boolean;
  customer_messages: boolean;
}

export default function TechnicianSettingsPage() {
  // Mock data (TODO: Replace with API)
  const [profile, setProfile] = useState<TechnicianProfile>({
    id: "tech_123",
    name: "Ravi Kumar",
    phone: "+91 98765 43210",
    email: "ravi.kumar@homebuddy.com",
    domain: "Plumbing",
    experience_years: 5,
    is_active: true,
  });

  const [availability, setAvailability] = useState<Availability>({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: false,
    start_time: "09:00",
    end_time: "18:00",
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    new_requests: true,
    schedule_changes: true,
    payment_updates: true,
    customer_messages: false,
  });

  const [profileData, setProfileData] = useState({
    name: profile.name,
    phone: profile.phone,
  });

  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleProfileUpdate = async () => {
    setIsSaving(true);
    try {
      // TODO: Call API to update profile
      console.log("TODO: Update profile", profileData);

      setProfile({ ...profile, ...profileData });
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new !== passwordData.confirm) {
      alert("New passwords don't match!");
      return;
    }

    if (passwordData.new.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    setIsSaving(true);
    try {
      // TODO: Call API to change password
      console.log("TODO: Change password");

      alert("Password changed successfully!");
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch (error) {
      console.error("Failed to change password:", error);
      alert("Failed to change password");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvailabilityUpdate = async () => {
    setIsSaving(true);
    try {
      // TODO: Call API to update availability
      console.log("TODO: Update availability", availability);

      alert("Availability updated successfully!");
    } catch (error) {
      console.error("Failed to update availability:", error);
      alert("Failed to update availability");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationsUpdate = async () => {
    setIsSaving(true);
    try {
      // TODO: Call API to update notifications
      console.log("TODO: Update notifications", notifications);

      alert("Notification settings updated!");
    } catch (error) {
      console.error("Failed to update notifications:", error);
      alert("Failed to update notifications");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async () => {
    const newStatus = !profile.is_active;
    if (
      window.confirm(
        `Are you sure you want to ${newStatus ? "activate" : "deactivate"} your account?`,
      )
    ) {
      setIsSaving(true);
      try {
        // TODO: Call API to toggle active status
        console.log("TODO: Toggle active status", newStatus);

        setProfile({ ...profile, is_active: newStatus });
        alert(
          `Account ${newStatus ? "activated" : "deactivated"} successfully!`,
        );
      } catch (error) {
        console.error("Failed to toggle status:", error);
        alert("Failed to update status");
      } finally {
        setIsSaving(false);
      }
    }
  };

  const DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ] as const;

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
        <p className="text-white/40">Manage your profile and preferences</p>
      </motion.div>

      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6"
      >
        <h2 className="mb-6 font-bold text-white text-xl">
          Profile Information
        </h2>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-medium text-sm text-white/60">
              Full Name
            </label>
            <input
              type="text"
              value={profileData.name}
              onChange={(e) =>
                setProfileData({ ...profileData, name: e.target.value })
              }
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-white transition-all focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-sm text-white/60">
              Phone Number
            </label>
            <input
              type="tel"
              value={profileData.phone}
              onChange={(e) =>
                setProfileData({ ...profileData, phone: e.target.value })
              }
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-white transition-all focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-sm text-white/60">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full cursor-not-allowed rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-white/40"
            />
            <p className="mt-1 text-white/40 text-xs">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label className="mb-2 block font-medium text-sm text-white/60">
              Service Domain
            </label>
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 font-semibold text-amber-400">
              {profile.domain}
            </div>
            <p className="mt-1 text-white/40 text-xs">Your service specialty</p>
          </div>

          <div>
            <label className="mb-2 block font-medium text-sm text-white/60">
              Experience
            </label>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-white">
              {profile.experience_years} years
            </div>
          </div>

          <button
            onClick={handleProfileUpdate}
            disabled={isSaving}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-white transition-all hover:from-amber-600 hover:to-amber-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </motion.div>

      {/* Password Change */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6"
      >
        <h2 className="mb-6 font-bold text-white text-xl">Change Password</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block font-medium text-sm text-white/60">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.current}
              onChange={(e) =>
                setPasswordData({ ...passwordData, current: e.target.value })
              }
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-white transition-all focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium text-sm text-white/60">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.new}
              onChange={(e) =>
                setPasswordData({ ...passwordData, new: e.target.value })
              }
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-white transition-all focus:border-amber-500/50 focus:outline-none"
            />
            <p className="mt-1 text-white/40 text-xs">Minimum 8 characters</p>
          </div>

          <div>
            <label className="mb-2 block font-medium text-sm text-white/60">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirm}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirm: e.target.value })
              }
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-white transition-all focus:border-amber-500/50 focus:outline-none"
            />
          </div>

          <button
            onClick={handlePasswordChange}
            disabled={isSaving}
            className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 font-semibold text-white transition-all hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
          >
            {isSaving ? "Changing..." : "Change Password"}
          </button>
        </div>
      </motion.div>

      {/* Availability */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6"
      >
        <h2 className="mb-6 font-bold text-white text-xl">Availability</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-3 block font-medium text-sm text-white/60">
              Working Days
            </label>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {DAYS.map((day) => (
                <label
                  key={day}
                  className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 transition-all ${
                    availability[day]
                      ? "border border-green-500/30 bg-green-500/20 text-green-400"
                      : "border border-white/[0.06] bg-white/[0.04] text-white/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={availability[day]}
                    onChange={(e) =>
                      setAvailability({
                        ...availability,
                        [day]: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded"
                  />
                  <span className="font-medium capitalize">
                    {day.slice(0, 3)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block font-medium text-sm text-white/60">
                Start Time
              </label>
              <input
                type="time"
                value={availability.start_time}
                onChange={(e) =>
                  setAvailability({
                    ...availability,
                    start_time: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-white transition-all focus:border-amber-500/50 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-sm text-white/60">
                End Time
              </label>
              <input
                type="time"
                value={availability.end_time}
                onChange={(e) =>
                  setAvailability({ ...availability, end_time: e.target.value })
                }
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-3 text-white transition-all focus:border-amber-500/50 focus:outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleAvailabilityUpdate}
            disabled={isSaving}
            className="w-full rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-6 py-3 font-semibold text-white transition-all hover:from-green-600 hover:to-green-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Availability"}
          </button>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6"
      >
        <h2 className="mb-6 font-bold text-white text-xl">Notifications</h2>

        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <label
              key={key}
              className="flex cursor-pointer items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:bg-white/[0.04]"
            >
              <span className="font-medium text-white capitalize">
                {key.replace(/_/g, " ")}
              </span>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) =>
                  setNotifications({
                    ...notifications,
                    [key]: e.target.checked,
                  })
                }
                className="h-5 w-5 rounded"
              />
            </label>
          ))}

          <button
            onClick={handleNotificationsUpdate}
            disabled={isSaving}
            className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-3 font-semibold text-white transition-all hover:from-purple-600 hover:to-purple-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Notification Settings"}
          </button>
        </div>
      </motion.div>

      {/* Account Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6"
      >
        <h2 className="mb-6 font-bold text-white text-xl">Account Status</h2>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-medium text-white">
              Status: {profile.is_active ? "Active" : "Inactive"}
            </p>
            <p className="text-sm text-white/40">
              {profile.is_active
                ? "You are accepting new service requests"
                : "You are not accepting new requests"}
            </p>
          </div>
          <div
            className={`rounded-full px-4 py-2 font-semibold ${
              profile.is_active
                ? "border border-green-500/30 bg-green-500/20 text-green-400"
                : "border border-red-500/30 bg-red-500/20 text-red-400"
            }`}
          >
            {profile.is_active ? "Active" : "Inactive"}
          </div>
        </div>

        <button
          onClick={handleToggleActive}
          disabled={isSaving}
          className={`w-full rounded-xl px-6 py-3 font-semibold transition-all disabled:opacity-50 ${
            profile.is_active
              ? "border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20"
              : "border border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20"
          }`}
        >
          {isSaving
            ? "Updating..."
            : profile.is_active
              ? "Deactivate Account"
              : "Activate Account"}
        </button>
      </motion.div>
    </div>
  );
}
