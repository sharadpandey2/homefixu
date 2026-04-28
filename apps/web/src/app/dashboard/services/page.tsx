"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

// ─── TYPES ──────────────────────────────────────────────────────────────
interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  basePrice: number;
  frequency: string;
  duration: string;
  includes: string[];
  excludes: string[];
  isPopular?: boolean;
  isFree?: boolean;
}

interface Property {
  id: string;
  name: string;
  address: string;
  isDefault: boolean;
}

const CATEGORIES = [
  "All Services",
  "Plumbing",
  "Electrical",
  "Pest Control",
  "Paint & Sealant",
  "Doorbell",
  "CCTV",
  "Tank Cleaning",
  "Interior Design",
  "General",
];

const TIME_SLOTS = [
  "09:00-11:00",
  "11:00-13:00",
  "13:00-15:00",
  "15:00-17:00",
  "17:00-19:00",
];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000";

// Helpers
function getServiceIcon(category: string, iconKey?: string) {
  if (iconKey) return iconKey;
  switch (category.toLowerCase()) {
    case "plumbing":
      return "🔧";
    case "electrical":
      return "⚡";
    case "pest_control":
      return "🐛";
    case "paint_and_sealant":
      return "🎨";
    case "tank_cleaning":
      return "💧";
    case "cctv":
      return "📹";
    case "doorbell":
      return "🔔";
    case "interior_design":
      return "✨";
    default:
      return "🏠";
  }
}

function formatDuration(minutes: number) {
  if (!minutes) return "Instant";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours} hr ${mins} min`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
  return `${mins} mins`;
}

// ─── SERVICE CARD COMPONENT ─────────────────────────────────────────────
function ServiceCard({
  service,
  onBook,
}: {
  service: Service;
  onBook: (s: Service) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative overflow-hidden rounded-2xl border border-white/6 bg-linear-to-br from-white/4 to-white/2 p-6 transition-all hover:border-amber-500/20"
    >
      {/* Badges */}
      <div className="absolute top-4 right-4 flex gap-2">
        {service.isPopular && (
          <span className="rounded-full border border-amber-500/30 bg-amber-500/20 px-3 py-1 font-bold text-amber-400 text-xs">
            POPULAR
          </span>
        )}
        {service.isFree && (
          <span className="rounded-full border border-green-500/30 bg-green-500/20 px-3 py-1 font-bold text-green-400 text-xs">
            FREE
          </span>
        )}
      </div>

      <div className="mb-4 flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-amber-500/20 to-amber-600/10 text-4xl transition-transform group-hover:scale-110">
          {service.icon}
        </div>
        <div className="flex-1 pr-16">
          <h3 className="mb-1 font-bold text-white text-xl">{service.name}</h3>
          <p className="text-sm text-white/40 capitalize">
            {service.category.replace("_", " ")}
          </p>
        </div>
      </div>

      <p className="mb-4 text-sm text-white/60">{service.description}</p>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-white/4 bg-white/2 p-3">
          <p className="mb-1 text-white/40 text-xs">Frequency</p>
          <p className="font-medium text-sm text-white capitalize">
            {service.frequency.replace("_", " ")}
          </p>
        </div>
        <div className="rounded-xl border border-white/4 bg-white/2 p-3">
          <p className="mb-1 text-white/40 text-xs">Duration</p>
          <p className="font-medium text-sm text-white">{service.duration}</p>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="space-y-3">
              {service.includes && service.includes.length > 0 && (
                <div>
                  <p className="mb-2 font-semibold text-green-400 text-xs">
                    ✓ What's Included
                  </p>
                  <div className="space-y-1">
                    {service.includes.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-white/60 text-xs"
                      >
                        <span className="mt-0.5 text-green-500">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {service.excludes && service.excludes.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 font-semibold text-red-400 text-xs">
                    ✗ Not Included
                  </p>
                  <div className="space-y-1">
                    {service.excludes.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-white/60 text-xs"
                      >
                        <span className="mt-0.5 text-red-500">✗</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mb-4 flex w-full items-center justify-center gap-1 text-amber-400 text-xs transition-colors hover:text-amber-300"
      >
        {isExpanded ? "Show Less" : "Show Details"}
        <svg
          className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div className="flex items-center justify-between border-white/6 border-t pt-4">
        <div>
          {service.isFree || service.basePrice === 0 ? (
            <span className="font-bold text-2xl text-green-400">FREE</span>
          ) : (
            <span className="font-bold text-2xl text-white">
              ₹{service.basePrice}
            </span>
          )}
        </div>
        <button
          onClick={() => onBook(service)}
          className="rounded-xl bg-linear-to-r from-amber-500 to-amber-600 px-6 py-3 font-semibold text-white shadow-amber-500/20 shadow-lg transition-all hover:from-amber-600 hover:to-amber-700"
        >
          Book Now
        </button>
      </div>
    </motion.div>
  );
}

// ─── BOOKING MODAL COMPONENT ────────────────────────────────────────────
function BookingModal({
  service,
  properties,
  onClose,
  onConfirm,
}: {
  service: Service;
  properties: Property[];
  onClose: () => void;
  onConfirm: (data: {
    propertyId: string;
    scheduledDate: string;
    scheduledSlot: string;
    notes: string;
  }) => Promise<void>;
}) {
  const [selectedPropertyId, setSelectedPropertyId] = useState(
    properties.find((p) => p.isDefault)?.id || properties[0]?.id || "",
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableDates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d.toISOString().split("T")[0];
  });

  const handleSubmit = async () => {
    if (!selectedPropertyId || !selectedDate || !selectedSlot) {
      alert("Please select a property, date, and time slot.");
      return;
    }
    setIsSubmitting(true);
    await onConfirm({
      propertyId: selectedPropertyId,
      scheduledDate: selectedDate,
      scheduledSlot: selectedSlot,
      notes,
    });
    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="my-auto w-full max-w-lg rounded-2xl border border-white/6 bg-linear-to-br from-zinc-900 to-zinc-950 p-6"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-2xl text-white">Book Appointment</h2>
            <p className="text-amber-400 text-sm">{service.name}</p>
          </div>
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

        {properties.length === 0 ? (
          <div className="mb-6 rounded-xl border border-white/6 bg-white/2 p-6 text-center">
            <p className="mb-4 text-white/60">
              You need to add a property before booking a service.
            </p>
            <Link
              href="/dashboard/properties"
              as={"/dashboard/properties" as never}
            >
              <button className="rounded-lg bg-amber-500 px-4 py-2 font-semibold text-white">
                Add Property
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="mb-2 block font-medium text-sm text-white/60">
                Select Property
              </label>
              <select
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="w-full rounded-xl border border-white/6 bg-white/2 px-4 py-3 text-white transition-colors focus:border-amber-500/30 focus:outline-none [&>option]:bg-zinc-900"
              >
                <option value="" disabled>
                  Select your property...
                </option>
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - {p.address}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-medium text-sm text-white/60">
                Select Date
              </label>
              <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
                {availableDates.map((date) => {
                  const d = new Date(date);
                  return (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`flex min-w-16 shrink-0 flex-col items-center rounded-xl border p-3 transition-all ${selectedDate === date ? "border-amber-500/50 bg-amber-500/20 text-amber-400" : "border-white/6 bg-white/2 text-white/60 hover:bg-white/4"}`}
                    >
                      <span className="text-xs uppercase">
                        {d.toLocaleDateString("en-IN", { weekday: "short" })}
                      </span>
                      <span className="font-bold text-lg">{d.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="mb-2 block font-medium text-sm text-white/60">
                Select Time Slot
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded-xl border p-3 transition-all ${selectedSlot === slot ? "border-amber-500/50 bg-amber-500/20 text-amber-400" : "border-white/6 bg-white/2 text-white/60 hover:bg-white/4"}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block font-medium text-sm text-white/60">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific instructions for the technician?"
                rows={2}
                className="w-full rounded-xl border border-white/6 bg-white/2 px-4 py-3 text-white transition-colors placeholder:text-white/30 focus:border-amber-500/30 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between border-white/6 border-t pt-4">
              <div>
                <p className="text-white/40 text-xs">Total Amount</p>
                <p className="font-bold text-white text-xl">
                  {service.isFree ? "Free" : `₹${service.basePrice}`}
                </p>
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || properties.length === 0}
                className="rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white shadow-amber-500/20 shadow-lg transition-colors hover:bg-amber-600 disabled:opacity-50"
              >
                {isSubmitting ? "Confirming..." : "Confirm Booking"}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── MAIN PAGE ──────────────────────────────────────────────────────────
export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("All Services");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState<"all" | "free" | "paid">(
    "all",
  );

  // Modal State
  const [bookingService, setBookingService] = useState<Service | null>(null);

  // Fetch Services & Properties
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesRes, propertiesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/customer/services`, {
            credentials: "include",
          }),
          fetch(`${API_BASE_URL}/api/customer/properties`, {
            credentials: "include",
          }),
        ]);

        if (servicesRes.ok) {
          const data = (await servicesRes.json()) as any[];
          const mappedServices = data.map((s: any) => ({
            id: s.id,
            name: s.name,
            category: s.category,
            description: s.description,
            icon: getServiceIcon(s.category, s.iconKey),
            basePrice: (s.basePricePaise || 0) / 100,
            frequency: s.frequency,
            duration: formatDuration(s.durationMinutes),
            includes: s.inclusions || [],
            excludes: s.exclusions || [],
            isFree:
              (s.basePricePaise || 0) === 0 || s.materialPolicy === "no_charge",
            isPopular: ["plumbing", "electrical", "ai_interior"].includes(
              s.category,
            ),
          }));
          setServices(mappedServices);
        }

        if (propertiesRes.ok) {
          const propsData = (await propertiesRes.json()) as any[];
          setProperties(
            propsData.map((p) => ({
              id: p.id,
              name: p.name,
              address: p.addressLine1 || p.address,
              isDefault: p.isDefault,
            })),
          );
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateBooking = async (bookingData: {
    propertyId: string;
    scheduledDate: string;
    scheduledSlot: string;
    notes: string;
  }) => {
    if (!bookingService) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/customer/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          serviceId: bookingService.id,
          propertyId: bookingData.propertyId,
          scheduledDate: bookingData.scheduledDate,
          scheduledSlot: bookingData.scheduledSlot,
          notes: bookingData.notes,
        }),
      });

      if (res.ok) {
        alert("Booking Confirmed! Check your bookings tab.");
        setBookingService(null);
      } else {
        const error = (await res.json()) as any;
        alert(error.message || "Failed to create booking");
      }
    } catch (_error) {
      alert("Network error. Please try again.");
    }
  };

  const filteredServices = services.filter((service) => {
    const formattedCat = service.category.replace("_", " ").toLowerCase();
    const matchesCategory =
      selectedCategory === "All Services" ||
      formattedCat === selectedCategory.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice =
      priceFilter === "all" ||
      (priceFilter === "free" && service.isFree) ||
      (priceFilter === "paid" && !service.isFree);
    return matchesCategory && matchesSearch && matchesPrice;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="mb-2 font-bold text-3xl text-white tracking-tight">
          Service Catalog
        </h1>
        <p className="text-white/40">
          Professional home services tailored for your property
        </p>
      </motion.div>

      {/* Stats Cards & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-3"
      >
        <div className="rounded-2xl border border-amber-500/20 bg-linear-to-br from-amber-500/10 to-amber-600/5 p-4">
          <p className="mb-1 text-amber-400 text-sm">Total Services</p>
          <p className="font-bold text-3xl text-white">{services.length}</p>
        </div>
        <div className="rounded-2xl border border-green-500/20 bg-linear-to-br from-green-500/10 to-green-600/5 p-4">
          <p className="mb-1 text-green-400 text-sm">Free Services</p>
          <p className="font-bold text-3xl text-white">
            {services.filter((s) => s.isFree).length}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-500/20 bg-linear-to-br from-blue-500/10 to-blue-600/5 p-4">
          <p className="mb-1 text-blue-400 text-sm">Starting From</p>
          <p className="font-bold text-3xl text-white">₹0</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <div className="flex flex-col gap-4 sm:flex-row">
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
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-white/6 bg-white/2 py-3 pr-4 pl-12 text-white focus:border-amber-500/30 focus:outline-none"
            />
          </div>
          <div className="flex w-fit gap-2 rounded-xl border border-white/6 bg-white/2 p-1">
            {(["all", "free", "paid"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setPriceFilter(filter)}
                className={`relative rounded-lg px-4 py-2 font-medium text-sm transition-all ${priceFilter === filter ? "text-white" : "text-white/50 hover:text-white/70"}`}
              >
                {priceFilter === filter && (
                  <motion.div
                    layoutId="priceFilter"
                    className="absolute inset-0 rounded-lg border border-amber-500/30 bg-amber-500/20"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="relative z-10 capitalize">{filter}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap rounded-xl px-4 py-2 font-medium text-sm transition-all ${selectedCategory === category ? "border border-amber-500/30 bg-amber-500/20 text-amber-400" : "border border-white/6 bg-white/2 text-white/60 hover:bg-white/4"}`}
            >
              {category}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-white/40">
            Loading services from catalog...
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onBook={setBookingService}
              />
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      <AnimatePresence>
        {bookingService && (
          <BookingModal
            service={bookingService}
            properties={properties}
            onClose={() => setBookingService(null)}
            onConfirm={handleCreateBooking}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
