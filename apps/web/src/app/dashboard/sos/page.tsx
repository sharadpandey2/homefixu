"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

// SOS Emergency Types
interface EmergencyCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  examples: string[];
  color: string;
  borderColor: string;
  textColor: string;
}

interface RecentSOS {
  id: string;
  type: string;
  icon: string;
  status: "resolved" | "active" | "cancelled";
  date: string;
  responseTime: string;
}

// Emergency Categories
const EMERGENCY_CATEGORIES: EmergencyCategory[] = [
  {
    id: "health",
    name: "Health Emergency",
    icon: "🏥",
    description: "Medical emergencies requiring immediate assistance",
    examples: [
      "Cardiac arrest",
      "Severe injury",
      "Unconscious person",
      "Allergic reaction",
    ],
    color: "from-red-500/10 to-red-600/5",
    borderColor: "border-red-500/30",
    textColor: "text-red-400",
  },
  {
    id: "plumbing",
    name: "Burst Pipe / Flood",
    icon: "💧",
    description: "Urgent plumbing failures causing water damage",
    examples: [
      "Burst pipe",
      "Severe water leak",
      "Overflowing tank",
      "Drain blockage",
    ],
    color: "from-blue-500/10 to-blue-600/5",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-400",
  },
  {
    id: "electrical",
    name: "Electrical Fault",
    icon: "⚡",
    description: "Dangerous electrical failures needing urgent repair",
    examples: [
      "Short circuit",
      "Sparking wires",
      "Power outage",
      "Electrical fire risk",
    ],
    color: "from-yellow-500/10 to-yellow-600/5",
    borderColor: "border-yellow-500/30",
    textColor: "text-yellow-400",
  },
  {
    id: "structural",
    name: "Structural Damage",
    icon: "🏚️",
    description: "Immediate structural threats to your home",
    examples: [
      "Ceiling collapse risk",
      "Wall crack",
      "Gas leak",
      "Fire hazard",
    ],
    color: "from-orange-500/10 to-orange-600/5",
    borderColor: "border-orange-500/30",
    textColor: "text-orange-400",
  },
];

// Recent SOS history
const RECENT_SOS: RecentSOS[] = [
  {
    id: "sos-001",
    type: "Burst Pipe",
    icon: "💧",
    status: "resolved",
    date: "Mar 15, 2026",
    responseTime: "12 min",
  },
  {
    id: "sos-002",
    type: "Electrical Fault",
    icon: "⚡",
    status: "resolved",
    date: "Feb 2, 2026",
    responseTime: "18 min",
  },
];

// SOS Button Component
function SOSButton({ onActivate }: { onActivate: () => void }) {
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const HOLD_DURATION = 3000; // 3 seconds

  const startHold = useCallback(() => {
    if (isCompleted) return;
    setIsHolding(true);
    startTimeRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - (startTimeRef.current ?? Date.now());
      const progress = Math.min((elapsed / HOLD_DURATION) * 100, 100);
      setHoldProgress(progress);
      if (progress >= 100) {
        clearInterval(intervalRef.current!);
        setIsCompleted(true);
        setIsHolding(false);
        onActivate();
      }
    }, 16);
  }, [isCompleted, onActivate]);

  const stopHold = useCallback(() => {
    if (isCompleted) return;
    setIsHolding(false);
    setHoldProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [isCompleted]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Pulse rings behind button */}
      <div className="relative flex items-center justify-center">
        {/* Outer pulse rings */}
        {isHolding && (
          <>
            <motion.div
              className="absolute rounded-full border-2 border-red-500/20"
              animate={{ scale: [1, 1.8], opacity: [0.4, 0] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 1.2,
                ease: "easeOut",
              }}
              style={{ width: 220, height: 220 }}
            />
            <motion.div
              className="absolute rounded-full border-2 border-red-500/30"
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                duration: 1.2,
                delay: 0.3,
                ease: "easeOut",
              }}
              style={{ width: 220, height: 220 }}
            />
          </>
        )}

        {/* Progress ring SVG */}
        <svg
          className="absolute"
          width={220}
          height={220}
          style={{ transform: "rotate(-90deg)" }}
        >
          {/* Background ring */}
          <circle
            cx={110}
            cy={110}
            r={100}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={6}
          />
          {/* Progress ring */}
          <circle
            cx={110}
            cy={110}
            r={100}
            fill="none"
            stroke={isCompleted ? "#22c55e" : "#ef4444"}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 100}`}
            strokeDashoffset={`${2 * Math.PI * 100 * (1 - holdProgress / 100)}`}
            style={{ transition: "stroke-dashoffset 0.016s linear" }}
          />
        </svg>

        {/* Main SOS Button */}
        <motion.button
          onMouseDown={startHold}
          onMouseUp={stopHold}
          onMouseLeave={stopHold}
          onTouchStart={startHold}
          onTouchEnd={stopHold}
          animate={
            isCompleted
              ? { scale: 1, backgroundColor: "#16a34a" }
              : isHolding
                ? { scale: 0.95 }
                : { scale: 1 }
          }
          whileHover={!isCompleted ? { scale: 1.03 } : {}}
          className="relative z-10 flex h-44 w-44 cursor-pointer select-none flex-col items-center justify-center gap-2 rounded-full shadow-2xl"
          style={{
            background: isCompleted
              ? "linear-gradient(135deg, #15803d, #166534)"
              : "linear-gradient(135deg, #dc2626, #991b1b)",
            boxShadow: isHolding
              ? "0 0 60px rgba(239,68,68,0.5), 0 0 120px rgba(239,68,68,0.2)"
              : isCompleted
                ? "0 0 60px rgba(34,197,94,0.4)"
                : "0 8px 40px rgba(239,68,68,0.3)",
          }}
        >
          <span className="text-5xl">{isCompleted ? "✅" : "🆘"}</span>
          <span className="font-black text-white text-xl tracking-widest">
            {isCompleted ? "CALLED" : "SOS"}
          </span>
          {!isCompleted && (
            <span className="font-medium text-red-200 text-xs">Hold 3 sec</span>
          )}
        </motion.button>
      </div>

      {/* Progress label */}
      <AnimatePresence mode="wait">
        {isHolding && !isCompleted && (
          <motion.p
            key="holding"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="animate-pulse font-semibold text-red-400 text-sm"
          >
            Hold to confirm... {Math.round(holdProgress)}%
          </motion.p>
        )}
        {isCompleted && (
          <motion.p
            key="completed"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-semibold text-green-400 text-sm"
          >
            Emergency call initiated!
          </motion.p>
        )}
        {!isHolding && !isCompleted && (
          <motion.p
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-sm text-white/30"
          >
            Press and hold for 3 seconds to activate
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// Emergency Category Card
function CategoryCard({ category }: { category: EmergencyCategory }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`rounded-2xl bg-gradient-to-br p-5 ${category.color} border ${category.borderColor} group relative overflow-hidden transition-all hover:scale-[1.02]`}
    >
      <div className="flex items-start gap-4">
        <div
          className={
            "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-2xl transition-transform group-hover:scale-110"
          }
        >
          {category.icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={"mb-1 font-bold text-white"}>{category.name}</h3>
          <p className="text-sm text-white/50">{category.description}</p>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 border-white/[0.06] border-t pt-4">
              <p className={`font-semibold text-xs ${category.textColor} mb-2`}>
                Common Scenarios:
              </p>
              <div className="grid grid-cols-2 gap-1">
                {category.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 text-white/50 text-xs"
                  >
                    <div
                      className={`h-1 w-1 rounded-full bg-current ${category.textColor}`}
                    />
                    {ex}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`mt-3 text-xs ${category.textColor} flex items-center gap-1 transition-opacity hover:opacity-80`}
      >
        {isExpanded ? "Show Less" : "See Examples"}
        <svg
          className={`h-3.5 w-3.5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
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
    </motion.div>
  );
}

// Active SOS Modal
function ActiveSOSModal({ onDismiss }: { onDismiss: () => void }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="w-full max-w-sm rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-900/60 to-black p-8 text-center shadow-2xl"
      >
        {/* Animated pulse indicator */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <motion.div
              className="absolute inset-0 rounded-full bg-red-500/30"
              animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
              transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
            />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-red-600 text-4xl">
              📞
            </div>
          </div>
        </div>

        <h2 className="mb-1 font-black text-2xl text-white">SOS Activated</h2>
        <p className="mb-6 text-red-300 text-sm">
          Connecting to emergency response team...
        </p>

        {/* Timer */}
        <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.04] p-4">
          <p className="mb-1 text-white/40 text-xs">Call Duration</p>
          <p className="font-bold font-mono text-3xl text-white">
            {formatTime(elapsed)}
          </p>
        </div>

        {/* Info */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.03] p-3 text-sm">
            <span className="text-white/40">Avg. Response Time</span>
            <span className="font-semibold text-amber-400">~15 min</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.03] p-3 text-sm">
            <span className="text-white/40">Location Shared</span>
            <span className="font-semibold text-green-400">✓ Enabled</span>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="w-full rounded-xl bg-white/[0.06] py-3 font-semibold text-sm text-white/60 transition-all hover:bg-white/[0.10]"
        >
          Cancel SOS Request
        </button>
      </motion.div>
    </motion.div>
  );
}

// Main SOS Page
export default function SOSPage() {
  const [showModal, setShowModal] = useState(false);
  const [_selectedCategory, _setSelectedCategory] = useState<string | null>(
    null,
  );

  const handleActivate = () => {
    setShowModal(true);
  };

  return (
    <>
      <AnimatePresence>
        {showModal && <ActiveSOSModal onDismiss={() => setShowModal(false)} />}
      </AnimatePresence>

      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-2 flex items-center gap-3">
            <span className="text-3xl">🆘</span>
            <h1 className="font-bold text-3xl text-white tracking-tight">
              SOS Emergency
            </h1>
          </div>
          <p className="text-white/40">
            Instant emergency assistance for health crises and urgent home
            failures
          </p>
        </motion.div>

        {/* Alert Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-500/10 to-red-600/5 p-4"
        >
          <span className="flex-shrink-0 text-xl">⚠️</span>
          <div>
            <p className="mb-1 font-semibold text-red-400 text-sm">
              Mobile App Feature
            </p>
            <p className="text-white/50 text-xs">
              The SOS button is available on the HomeBuddy mobile app. Hold it
              for 3 seconds to trigger an emergency call. This page provides a
              preview and history of your SOS usage.
            </p>
          </div>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="grid grid-cols-3 gap-4"
        >
          <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/10 to-red-600/5 p-4 text-center">
            <p className="font-bold text-2xl text-white">24/7</p>
            <p className="mt-1 text-red-400 text-xs">Always Available</p>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-4 text-center">
            <p className="font-bold text-2xl text-white">
              ~15<span className="font-normal text-base"> min</span>
            </p>
            <p className="mt-1 text-amber-400 text-xs">Avg. Response</p>
          </div>
          <div className="rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-green-600/5 p-4 text-center">
            <p className="font-bold text-2xl text-white">Free</p>
            <p className="mt-1 text-green-400 text-xs">All Plans</p>
          </div>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left: SOS Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="flex flex-col items-center rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-8">
              <p className="mb-6 text-center font-semibold text-sm text-white/60">
                Tap & hold to activate emergency call
              </p>

              <SOSButton onActivate={handleActivate} />

              <div className="mt-8 w-full space-y-2">
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] p-2.5 text-white/40 text-xs">
                  <span>📍</span>
                  <span>Your location will be shared automatically</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] p-2.5 text-white/40 text-xs">
                  <span>📞</span>
                  <span>Direct call to response team on activation</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] p-2.5 text-white/40 text-xs">
                  <span>🔒</span>
                  <span>3-second hold prevents accidental triggers</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Categories + History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="space-y-6 lg:col-span-3"
          >
            {/* Emergency Category Selector */}
            <div>
              <h2 className="mb-3 font-semibold text-sm text-white/60 uppercase tracking-wider">
                Emergency Type
              </h2>
              <div className="space-y-3">
                {EMERGENCY_CATEGORIES.map((cat) => (
                  <CategoryCard key={cat.id} category={cat} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* SOS History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
        >
          <h2 className="mb-3 font-semibold text-sm text-white/60 uppercase tracking-wider">
            SOS History
          </h2>
          {RECENT_SOS.length === 0 ? (
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] py-10 text-center">
              <p className="mb-3 text-4xl">🛡️</p>
              <p className="text-sm text-white/40">
                No SOS events recorded. Stay safe!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {RECENT_SOS.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-4"
                >
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-2xl">
                    {item.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm text-white">
                      {item.type}
                    </p>
                    <p className="text-white/40 text-xs">{item.date}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span
                      className={`rounded-full border px-3 py-1 font-bold text-xs ${
                        item.status === "resolved"
                          ? "border-green-500/20 bg-green-500/10 text-green-400"
                          : item.status === "active"
                            ? "border-red-500/20 bg-red-500/10 text-red-400"
                            : "border-white/[0.06] bg-white/[0.04] text-white/40"
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                    <p className="mt-1 text-white/30 text-xs">
                      Response: {item.responseTime}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 to-amber-600/5 p-6 text-center"
        >
          <h3 className="mb-2 font-bold text-lg text-white">How SOS Works</h3>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                step: "1",
                icon: "👆",
                label: "Hold 3 Seconds",
                desc: "Press and hold the SOS button in the mobile app",
              },
              {
                step: "2",
                icon: "📞",
                label: "Call Initiated",
                desc: "Active call placed to HomeBuddy emergency team",
              },
              {
                step: "3",
                icon: "🚀",
                label: "Help Dispatched",
                desc: "Team dispatched to your registered address",
              },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-amber-500/30 bg-amber-500/20 text-xl">
                  {s.icon}
                </div>
                <p className="font-semibold text-sm text-white">{s.label}</p>
                <p className="text-white/40 text-xs">{s.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}
