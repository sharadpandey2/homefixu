"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

// Types (aligned with customer booking schema)
interface ServiceRequest {
  id: string;
  booking_id: string;
  service_name: string;
  service_category: string;
  customer_name: string;
  customer_phone: string;
  property_address: string;
  property_city: string;
  scheduled_date: string;
  scheduled_slot: string;
  status: "pending" | "confirmed" | "in_progress" | "completed";
  total_price: number;
  special_instructions?: string;
  created_at: string;
}

// Sample data (TODO: Replace with API)
const ALL_REQUESTS: ServiceRequest[] = [
  {
    id: "req_1",
    booking_id: "booking_123",
    service_name: "Monthly Plumbing Inspection",
    service_category: "Plumbing",
    customer_name: "Sharad Pandey",
    customer_phone: "+91 98765 43210",
    property_address: "Flat 301, Tower A, Green Valley Apartments, Sector 43",
    property_city: "Gurgaon, Haryana - 122001",
    scheduled_date: "2026-03-30",
    scheduled_slot: "14:00-16:00",
    status: "pending",
    total_price: 599,
    special_instructions: "Please call before arriving",
    created_at: "2026-03-28T10:30:00Z",
  },
  {
    id: "req_2",
    booking_id: "booking_124",
    service_name: "Electrical Safety Check",
    service_category: "Electrical",
    customer_name: "John Doe",
    customer_phone: "+91 98111 22333",
    property_address: "B-204, Golf Course Road",
    property_city: "Gurgaon, Haryana - 122002",
    scheduled_date: "2026-03-30",
    scheduled_slot: "10:00-12:00",
    status: "pending",
    total_price: 699,
    created_at: "2026-03-28T11:00:00Z",
  },
  {
    id: "req_3",
    booking_id: "booking_125",
    service_name: "Pest Control Treatment",
    service_category: "Pest Control",
    customer_name: "Amit Sharma",
    customer_phone: "+91 99999 11111",
    property_address: "Villa 12, DLF Phase 4",
    property_city: "Gurgaon, Haryana - 122009",
    scheduled_date: "2026-03-31",
    scheduled_slot: "09:00-11:00",
    status: "pending",
    total_price: 1299,
    created_at: "2026-03-28T12:15:00Z",
  },
  {
    id: "req_4",
    booking_id: "booking_126",
    service_name: "Monthly Plumbing Inspection",
    service_category: "Plumbing",
    customer_name: "Priya Singh",
    customer_phone: "+91 98888 77777",
    property_address: "A-101, Cyber City",
    property_city: "Gurgaon, Haryana - 122018",
    scheduled_date: "2026-04-01",
    scheduled_slot: "16:00-18:00",
    status: "pending",
    total_price: 599,
    created_at: "2026-03-28T14:00:00Z",
  },
  {
    id: "req_5",
    booking_id: "booking_127",
    service_name: "Electrical Safety Check",
    service_category: "Electrical",
    customer_name: "Rahul Verma",
    customer_phone: "+91 97777 66666",
    property_address: "C-45, Sohna Road",
    property_city: "Gurgaon, Haryana - 122103",
    scheduled_date: "2026-04-02",
    scheduled_slot: "11:00-13:00",
    status: "pending",
    total_price: 699,
    created_at: "2026-03-29T09:30:00Z",
  },
];

const SERVICE_CATEGORIES = [
  "All",
  "Plumbing",
  "Electrical",
  "Pest Control",
  "HVAC",
  "Structural",
  "Security",
  "Painting",
  "Waterproofing",
  "Appliance",
];

function ServiceRequestCard({
  request,
  onAccept,
  onReject,
  isSelected,
  onToggleSelect,
}: {
  request: ServiceRequest;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
}) {
  const getServiceIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "plumbing":
        return "🔧";
      case "electrical":
        return "⚡";
      case "pest control":
        return "🐛";
      case "hvac":
        return "❄️";
      case "structural":
        return "🏗️";
      case "security":
        return "🔒";
      case "painting":
        return "🎨";
      case "waterproofing":
        return "💧";
      case "appliance":
        return "🔌";
      default:
        return "🔨";
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (d.toDateString() === today.toDateString()) return "Today";
    if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`rounded-2xl border bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6 transition-all ${
        isSelected
          ? "border-amber-500/50 bg-amber-500/5"
          : "border-white/[0.06] hover:border-amber-500/20"
      }`}
    >
      {/* Header with Checkbox */}
      <div className="mb-4 flex items-start gap-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(request.id)}
          className="mt-1 h-5 w-5 cursor-pointer rounded border-2 border-white/20 bg-white/5 checked:border-amber-500 checked:bg-amber-500"
        />

        <div className="flex flex-1 items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-2xl">
              {getServiceIcon(request.service_category)}
            </div>
            <div>
              <h3 className="mb-1 font-semibold text-lg text-white">
                {request.service_name}
              </h3>
              <div className="flex items-center gap-3">
                <p className="text-sm text-white/40">
                  {request.service_category}
                </p>
                <span className="text-white/30 text-xs">•</span>
                <p className="text-white/30 text-xs">
                  {timeAgo(request.created_at)}
                </p>
              </div>
            </div>
          </div>
          <span className="font-bold text-amber-400 text-lg">
            ₹{request.total_price}
          </span>
        </div>
      </div>

      {/* Customer Info */}
      <div className="mb-4 ml-9 space-y-3">
        <div className="flex items-center gap-2 text-sm text-white/70">
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
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span className="font-medium">{request.customer_name}</span>
          <span className="text-white/40">• {request.customer_phone}</span>
        </div>

        <div className="flex items-start gap-2 text-sm text-white/70">
          <svg
            className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <div>
            <p>{request.property_address}</p>
            <p className="text-white/40 text-xs">{request.property_city}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-white/70">
          <div className="flex items-center gap-2">
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
              {formatDate(request.scheduled_date)}
            </span>
          </div>
          <div className="flex items-center gap-2">
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
            <span>{request.scheduled_slot}</span>
          </div>
        </div>

        {request.special_instructions && (
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3">
            <p className="mb-1 font-semibold text-blue-400 text-xs">
              Special Instructions:
            </p>
            <p className="text-sm text-white/70">
              {request.special_instructions}
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="ml-9 flex gap-3 border-white/[0.06] border-t pt-4">
        <button
          onClick={() => onReject(request.id)}
          className="flex-1 rounded-xl border border-red-500/20 px-4 py-3 font-semibold text-red-400 text-sm transition-all hover:bg-red-500/10"
        >
          Reject
        </button>
        <button
          onClick={() => onAccept(request.id)}
          className="flex-1 rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 font-semibold text-sm text-white transition-all hover:from-green-600 hover:to-green-700"
        >
          Accept Job
        </button>
      </div>
    </motion.div>
  );
}

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState(ALL_REQUESTS);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  // Filter requests
  const filteredRequests = requests.filter((request) => {
    const matchesCategory =
      selectedCategory === "All" ||
      request.service_category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      request.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.property_address
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      request.service_name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleAccept = (id: string) => {
    // TODO: Call API to accept request
    console.log("TODO: Accept request", id);
    setRequests(requests.filter((r) => r.id !== id));
    setSelectedRequests(selectedRequests.filter((sid) => sid !== id));
    alert("Request accepted! Added to your schedule.");
  };

  const handleReject = (id: string) => {
    if (window.confirm("Are you sure you want to reject this request?")) {
      // TODO: Call API to reject request
      console.log("TODO: Reject request", id);
      setRequests(requests.filter((r) => r.id !== id));
      setSelectedRequests(selectedRequests.filter((sid) => sid !== id));
      alert("Request rejected.");
    }
  };

  const handleBulkAccept = () => {
    if (selectedRequests.length === 0) return;
    if (
      window.confirm(`Accept ${selectedRequests.length} selected request(s)?`)
    ) {
      // TODO: Call API to accept multiple requests
      console.log("TODO: Bulk accept", selectedRequests);
      setRequests(requests.filter((r) => !selectedRequests.includes(r.id)));
      setSelectedRequests([]);
      alert(`${selectedRequests.length} requests accepted!`);
    }
  };

  const handleBulkReject = () => {
    if (selectedRequests.length === 0) return;
    if (
      window.confirm(`Reject ${selectedRequests.length} selected request(s)?`)
    ) {
      // TODO: Call API to reject multiple requests
      console.log("TODO: Bulk reject", selectedRequests);
      setRequests(requests.filter((r) => !selectedRequests.includes(r.id)));
      setSelectedRequests([]);
      alert(`${selectedRequests.length} requests rejected.`);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedRequests((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  const handleSelectAll = () => {
    if (selectedRequests.length === filteredRequests.length) {
      setSelectedRequests([]);
    } else {
      setSelectedRequests(filteredRequests.map((r) => r.id));
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
              Service Requests
            </h1>
            <p className="text-white/40">
              {requests.length} pending request
              {requests.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Bulk Actions */}
          {selectedRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3"
            >
              <span className="text-sm text-white/60">
                {selectedRequests.length} selected
              </span>
              <button
                onClick={handleBulkReject}
                className="rounded-xl border border-red-500/20 px-4 py-2 font-semibold text-red-400 text-sm transition-all hover:bg-red-500/10"
              >
                Reject All
              </button>
              <button
                onClick={handleBulkAccept}
                className="rounded-xl bg-gradient-to-r from-green-500 to-green-600 px-4 py-2 font-semibold text-sm text-white transition-all hover:from-green-600 hover:to-green-700"
              >
                Accept All
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="space-y-4"
      >
        {/* Search Bar */}
        <div className="relative">
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
            placeholder="Search by customer name, address, or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/[0.06] bg-white/[0.04] py-3 pr-4 pl-12 text-white transition-all placeholder:text-white/40 focus:border-amber-500/50 focus:outline-none"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={handleSelectAll}
            className="flex-shrink-0 rounded-xl border border-white/[0.06] bg-white/[0.04] px-4 py-2 font-medium text-sm text-white/60 transition-all hover:border-amber-500/30 hover:text-white"
          >
            {selectedRequests.length === filteredRequests.length &&
            filteredRequests.length > 0
              ? "Deselect All"
              : "Select All"}
          </button>

          {SERVICE_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex-shrink-0 rounded-xl px-4 py-2 font-medium text-sm transition-all ${
                selectedCategory === category
                  ? "border border-amber-500/30 bg-amber-500/20 text-amber-400"
                  : "border border-white/[0.06] bg-white/[0.04] text-white/60 hover:border-white/20 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Requests List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="space-y-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredRequests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-12 text-center"
            >
              <div className="mb-4 text-6xl">
                {searchQuery || selectedCategory !== "All" ? "🔍" : "✅"}
              </div>
              <h3 className="mb-2 font-semibold text-white text-xl">
                {searchQuery || selectedCategory !== "All"
                  ? "No matching requests"
                  : "All caught up!"}
              </h3>
              <p className="text-white/40">
                {searchQuery || selectedCategory !== "All"
                  ? "Try adjusting your filters"
                  : "No new service requests at the moment"}
              </p>
            </motion.div>
          ) : (
            filteredRequests.map((request) => (
              <ServiceRequestCard
                key={request.id}
                request={request}
                onAccept={handleAccept}
                onReject={handleReject}
                isSelected={selectedRequests.includes(request.id)}
                onToggleSelect={handleToggleSelect}
              />
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
