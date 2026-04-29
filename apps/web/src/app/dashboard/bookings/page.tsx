"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Types
interface Booking {
  id: string;
  serviceName: string;
  serviceCategory: string;
  propertyName: string;
  scheduledDate: string;
  scheduledSlot: string;
  status: "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
  totalPrice: number;
  providerName?: string;
  providerPhone?: string;
  completedAt?: string;
  notes?: string;
}

// Service Categories for Filters
const SERVICE_CATEGORIES = [
  "All Services",
  "Plumbing",
  "Electrical",
  "Pest Control",
  "Paint & Sealant",
  "Tank Cleaning",
  "CCTV",
  "Doorbell",
  "Interior Design",
];

// Time Slots for Reschedule
const TIME_SLOTS = [
  "09:00-11:00",
  "11:00-13:00",
  "13:00-15:00",
  "15:00-17:00",
  "17:00-19:00",
];

// Tab for filtering bookings
type BookingTab = "upcoming" | "past" | "all";

// Base API URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  "https://server-production-c3c4.up.railway.app";

// Helper Functions
function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(slot: string) {
  return slot;
}

function getStatusColor(status: string) {
  switch (status) {
    case "confirmed":
      return "bg-green-500/15 text-green-400 border-green-500/30";
    case "pending":
      return "bg-amber-500/15 text-amber-400 border-amber-500/30";
    case "in_progress":
      return "bg-blue-500/15 text-blue-400 border-blue-500/30";
    case "completed":
      return "bg-purple-500/15 text-purple-400 border-purple-500/30";
    case "cancelled":
      return "bg-red-500/15 text-red-400 border-red-500/30";
    default:
      return "bg-white/10 text-white/40 border-white/20";
  }
}

function getServiceIcon(category: string) {
  switch (category?.toLowerCase()) {
    case "plumbing":
      return "🔧";
    case "electrical":
      return "⚡";
    case "pest control":
    case "pest_control":
      return "🐛";
    case "paint & sealant":
    case "paint_and_sealant":
      return "🎨";
    case "tank cleaning":
    case "tank_cleaning":
      return "💧";
    case "cctv":
      return "📹";
    case "doorbell":
      return "🔔";
    case "interior design":
    case "interior_design":
      return "✨";
    default:
      return "🏠";
  }
}

// Booking Card Component
function BookingCard({
  booking,
  onReschedule,
  onCancel,
  onViewDetails,
}: {
  booking: Booking;
  onReschedule: (booking: Booking) => void;
  onCancel: (booking: Booking) => void;
  onViewDetails: (booking: Booking) => void;
}) {
  const _isPast =
    booking.status === "completed" || booking.status === "cancelled";
  const canReschedule =
    booking.status === "pending" || booking.status === "confirmed";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="rounded-2xl border border-white/6 bg-linear-to-br from-white/4 to-white/2 p-5 transition-all hover:border-amber-500/20"
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-amber-500/20 to-amber-600/10 text-2xl">
            {getServiceIcon(booking.serviceCategory)}
          </div>
          <div>
            <h3 className="mb-1 font-semibold text-lg text-white">
              {booking.serviceName}
            </h3>
            <p className="text-sm text-white/40">{booking.propertyName}</p>
          </div>
        </div>
        <span
          className={`rounded-full border px-3 py-1 font-semibold text-xs ${getStatusColor(
            booking.status,
          )}`}
        >
          {booking.status.replace("_", " ")}
        </span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2 text-sm text-white/60">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{formatDate(booking.scheduledDate)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/60">
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{formatTime(booking.scheduledSlot)}</span>
        </div>
      </div>

      {booking.providerName && (
        <div className="mb-4 rounded-xl border border-white/4 bg-white/2 p-3">
          <p className="mb-1 text-white/40 text-xs">Service Provider</p>
          <p className="font-medium text-sm text-white">
            {booking.providerName}
          </p>
          {booking.providerPhone && (
            <p className="mt-1 text-white/40 text-xs">
              {booking.providerPhone}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-white/6 border-t pt-4">
        <div className="font-bold text-lg text-white">
          ₹{booking.totalPrice}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(booking)}
            className="rounded-lg px-4 py-2 font-medium text-sm text-white/70 transition-all hover:bg-white/4 hover:text-white"
          >
            View Details
          </button>
          {canReschedule && (
            <>
              <button
                onClick={() => onReschedule(booking)}
                className="rounded-lg bg-amber-500/10 px-4 py-2 font-medium text-amber-400 text-sm transition-all hover:bg-amber-500/20"
              >
                Reschedule
              </button>
              <button
                onClick={() => onCancel(booking)}
                className="rounded-lg px-4 py-2 font-medium text-red-400 text-sm transition-all hover:bg-red-500/10"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// Reschedule Modal Component
function RescheduleModal({
  booking,
  onClose,
  onConfirm,
  isProcessing,
}: {
  booking: Booking;
  onClose: () => void;
  onConfirm: (date: string, slot: string) => void;
  isProcessing: boolean;
}) {
  const [selectedDate, setSelectedDate] = useState(booking.scheduledDate);
  const [selectedSlot, setSelectedSlot] = useState(booking.scheduledSlot);

  // Generate next 30 days
  const availableDates = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i + 1);
    return date.toISOString().split("T")[0];
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-white/6 bg-linear-to-br from-zinc-900 to-zinc-950 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-bold text-2xl text-white">Reschedule Booking</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-white/4"
          >
            <svg
              className="h-5 w-5 text-white/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-6 rounded-xl border border-white/4 bg-white/2 p-4">
          <p className="mb-1 text-sm text-white/40">Current Schedule</p>
          <p className="font-medium text-white">
            {formatDate(booking.scheduledDate)} • {booking.scheduledSlot}
          </p>
        </div>

        <div className="space-y-6">
          {/* Date Selection */}
          <div>
            <label className="mb-3 block font-medium text-sm text-white/60">
              Select New Date
            </label>
            <div className="grid max-h-48 grid-cols-3 gap-2 overflow-y-auto pr-2">
              {availableDates.map((date) => {
                const dateObj = new Date(date);
                const dayName = dateObj.toLocaleDateString("en-IN", {
                  weekday: "short",
                });
                const dayNum = dateObj.getDate();
                const month = dateObj.toLocaleDateString("en-IN", {
                  month: "short",
                });

                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`rounded-xl border p-3 transition-all ${
                      selectedDate === date
                        ? "border-amber-500/50 bg-amber-500/20 text-amber-400"
                        : "border-white/6 bg-white/2 text-white/60 hover:bg-white/4"
                    }`}
                  >
                    <div className="mb-1 text-xs">{dayName}</div>
                    <div className="font-bold text-lg">{dayNum}</div>
                    <div className="text-xs">{month}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slot Selection */}
          <div>
            <label className="mb-3 block font-medium text-sm text-white/60">
              Select Time Slot
            </label>
            <div className="space-y-2">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className={`w-full rounded-xl border p-3 transition-all ${
                    selectedSlot === slot
                      ? "border-amber-500/50 bg-amber-500/20 text-amber-400"
                      : "border-white/6 bg-white/2 text-white/60 hover:bg-white/4"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{slot}</span>
                    {selectedSlot === slot && (
                      <svg
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl px-4 py-3 font-semibold text-sm text-white/70 transition-all hover:bg-white/4"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedDate, selectedSlot)}
            disabled={isProcessing}
            className="flex-1 rounded-xl bg-linear-to-r from-amber-500 to-amber-600 px-4 py-3 font-semibold text-sm text-white transition-all hover:from-amber-600 hover:to-amber-700 disabled:opacity-50"
          >
            {isProcessing ? "Rescheduling..." : "Confirm Reschedule"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Booking Details Modal
function BookingDetailsModal({
  booking,
  onClose,
}: {
  booking: Booking;
  onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-lg rounded-2xl border border-white/6 bg-linear-to-br from-zinc-900 to-zinc-950 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-bold text-2xl text-white">Booking Details</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-white/4"
          >
            <svg
              className="h-5 w-5 text-white/40"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-xl border border-white/4 bg-white/2 p-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-linear-to-br from-amber-500/20 to-amber-600/10 text-3xl">
              {getServiceIcon(booking.serviceCategory)}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">
                {booking.serviceName}
              </h3>
              <p className="text-sm text-white/40">
                {booking.serviceCategory.replace("_", " ")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/4 bg-white/2 p-4">
              <p className="mb-1 text-white/40 text-xs">Property</p>
              <p className="font-medium text-sm text-white">
                {booking.propertyName}
              </p>
            </div>
            <div className="rounded-xl border border-white/4 bg-white/2 p-4">
              <p className="mb-1 text-white/40 text-xs">Status</p>
              <span
                className={`inline-block rounded-full border px-2 py-1 font-semibold text-xs ${getStatusColor(booking.status)}`}
              >
                {booking.status.replace("_", " ")}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-white/4 bg-white/2 p-4">
            <p className="mb-2 text-white/40 text-xs">Scheduled For</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-white">
                <svg
                  className="h-4 w-4 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="font-medium">
                  {formatDate(booking.scheduledDate)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <svg
                  className="h-4 w-4 text-amber-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="font-medium">{booking.scheduledSlot}</span>
              </div>
            </div>
          </div>

          {booking.providerName && (
            <div className="rounded-xl border border-white/4 bg-white/2 p-4">
              <p className="mb-2 text-white/40 text-xs">Service Provider</p>
              <p className="font-medium text-white">{booking.providerName}</p>
              {booking.providerPhone && (
                <p className="mt-1 text-sm text-white/40">
                  {booking.providerPhone}
                </p>
              )}
            </div>
          )}

          {booking.notes && (
            <div className="rounded-xl border border-white/4 bg-white/2 p-4">
              <p className="mb-2 text-white/40 text-xs">Notes</p>
              <p className="text-sm text-white/70">{booking.notes}</p>
            </div>
          )}

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
            <div className="flex items-center justify-between">
              <p className="text-white/60">Total Amount</p>
              <p className="font-bold text-2xl text-white">
                ₹{booking.totalPrice}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full rounded-xl bg-white/4 px-4 py-3 font-semibold text-sm text-white transition-all hover:bg-white/8"
        >
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}

// Main Bookings Page
export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<BookingTab>("upcoming");
  const [selectedCategory, setSelectedCategory] = useState("All Services");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(
    null,
  );
  const [detailsBooking, setDetailsBooking] = useState<Booking | null>(null);
  const [cancelBooking, setCancelBooking] = useState<Booking | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // FETCH BOOKINGS FROM BACKEND
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/customer/bookings`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Essential for Better Auth session
        });

        if (res.ok) {
          // TS FIX: Cast res.json() to 'any'
          const data = (await res.json()) as any[];

          // Map backend format to frontend state
          const mappedBookings = data.map((b: any) => ({
            id: b.id,
            serviceName: b.service?.name || "Service",
            serviceCategory: b.service?.category || "general",
            propertyName: b.property?.name || "Property",
            scheduledDate: b.scheduledDate.split("T")[0], // Convert to YYYY-MM-DD
            scheduledSlot: b.scheduledSlot,
            status: b.status,
            totalPrice: b.totalPriceRupees || b.totalPricePaise / 100,
            providerName: b.technician?.name,
            providerPhone: b.technician?.phone,
            completedAt: b.completedAt,
            notes: b.notes,
          }));
          setBookings(mappedBookings);
        }
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, []);

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "upcoming" &&
        ["pending", "confirmed", "in_progress"].includes(booking.status)) ||
      (activeTab === "past" &&
        ["completed", "cancelled"].includes(booking.status));

    const formattedCat = booking.serviceCategory
      .replace("_", " ")
      .toLowerCase();
    const matchesCategory =
      selectedCategory === "All Services" ||
      formattedCat === selectedCategory.toLowerCase();

    const matchesSearch =
      searchQuery === "" ||
      booking.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.propertyName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesCategory && matchesSearch;
  });

  const handleReschedule = async (date: string, slot: string) => {
    if (!rescheduleBooking) return;
    setIsProcessing(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/customer/bookings/${rescheduleBooking.id}/reschedule`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            scheduledDate: date,
            scheduledSlot: slot,
            reason: "Rescheduled via user dashboard",
          }),
        },
      );

      if (res.ok) {
        setBookings(
          bookings.map((b) =>
            b.id === rescheduleBooking.id
              ? { ...b, scheduledDate: date, scheduledSlot: slot }
              : b,
          ),
        );
        setRescheduleBooking(null);
      } else {
        // TS FIX: Cast res.json() to 'any'
        const errorData = (await res.json()) as any;
        alert(errorData.message || "Failed to reschedule booking");
      }
    } catch (_error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const confirmCancel = async () => {
    if (!cancelBooking) return;
    setIsProcessing(true);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/customer/bookings/${cancelBooking.id}/cancel`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            reason: "Cancelled by user via dashboard",
          }),
        },
      );

      if (res.ok) {
        setBookings(
          bookings.map((b) =>
            b.id === cancelBooking.id ? { ...b, status: "cancelled" } : b,
          ),
        );
        setCancelBooking(null);
      } else {
        // TS FIX: Cast res.json() to 'any'
        const errorData = (await res.json()) as any;
        alert(errorData.message || "Failed to cancel booking");
      }
    } catch (_error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 font-bold text-3xl text-white tracking-tight">
              My Bookings
            </h1>
            <p className="text-white/40">
              Manage your service bookings and appointments
            </p>
          </div>
          <Link href="/dashboard/services" as={"/dashboard/services" as never}>
            <button className="rounded-xl bg-linear-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-white transition-all hover:from-amber-600 hover:to-amber-700">
              + Book Service
            </button>
          </Link>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="flex w-fit items-center gap-2 rounded-2xl border border-white/6 bg-white/2 p-1"
      >
        {(["upcoming", "past", "all"] as BookingTab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`relative rounded-xl px-6 py-2.5 font-medium text-sm transition-all ${
              activeTab === tab
                ? "text-white"
                : "text-white/50 hover:text-white/70"
            }`}
          >
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-xl border border-amber-500/30 bg-amber-500/20"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            <span className="relative z-10 capitalize">{tab}</span>
          </button>
        ))}
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="flex flex-col gap-4 sm:flex-row"
      >
        {/* Search */}
        <div className="relative flex-1">
          <svg
            className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-white/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/6 bg-white/2 py-3 pr-4 pl-12 text-white transition-colors placeholder:text-white/30 focus:border-amber-500/30 focus:outline-none"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="rounded-xl border border-white/6 bg-white/2 px-4 py-3 text-white transition-colors focus:border-amber-500/30 focus:outline-none [&>option]:bg-zinc-900"
        >
          {SERVICE_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Bookings List */}
      <motion.div layout className="space-y-4">
        {isLoading ? (
          <div className="py-12 text-center text-white/40">
            Loading bookings...
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredBookings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="rounded-2xl border border-white/6 bg-white/2 py-12 text-center"
              >
                <div className="mb-4 text-6xl">📅</div>
                <h3 className="mb-2 font-semibold text-white text-xl">
                  No bookings found
                </h3>
                <p className="mb-6 text-white/40">
                  {searchQuery || selectedCategory !== "All Services"
                    ? "Try adjusting your filters"
                    : "Book a service to get started"}
                </p>
                <Link
                  href="/dashboard/services"
                  as={"/dashboard/services" as never}
                >
                  <button className="rounded-xl bg-amber-500/10 px-6 py-3 font-semibold text-amber-400 transition-all hover:bg-amber-500/20">
                    Browse Services
                  </button>
                </Link>
              </motion.div>
            ) : (
              filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onReschedule={setRescheduleBooking}
                  onCancel={setCancelBooking}
                  onViewDetails={setDetailsBooking}
                />
              ))
            )}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Modals */}
      <AnimatePresence>
        {rescheduleBooking && (
          <RescheduleModal
            booking={rescheduleBooking}
            onClose={() => setRescheduleBooking(null)}
            onConfirm={handleReschedule}
            isProcessing={isProcessing}
          />
        )}

        {detailsBooking && (
          <BookingDetailsModal
            booking={detailsBooking}
            onClose={() => setDetailsBooking(null)}
          />
        )}

        {cancelBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => !isProcessing && setCancelBooking(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md rounded-2xl border border-white/6 bg-linear-to-br from-zinc-900 to-zinc-950 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                  <svg
                    className="h-8 w-8 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 font-bold text-white text-xl">
                  Cancel Booking?
                </h3>
                <p className="text-white/40">
                  Are you sure you want to cancel this booking? This action
                  cannot be undone.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCancelBooking(null)}
                  disabled={isProcessing}
                  className="flex-1 rounded-xl px-4 py-3 font-semibold text-sm text-white/70 transition-all hover:bg-white/4 disabled:opacity-50"
                >
                  Keep Booking
                </button>
                <button
                  onClick={confirmCancel}
                  disabled={isProcessing}
                  className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-sm text-white transition-all hover:bg-red-600 disabled:opacity-50"
                >
                  {isProcessing ? "Cancelling..." : "Yes, Cancel"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
