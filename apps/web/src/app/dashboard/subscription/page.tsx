"use client";

import { motion } from "motion/react";
import { useState } from "react";

// Pricing Plans
const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    description: "Perfect for trying out HomeBuddy",
    features: [
      "1 property",
      "Basic health reports",
      "Smart doorbell (with ads)",
      "Email support",
    ],
    buttonText: "Current Plan",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 999,
    period: "month",
    description: "Most popular for homeowners",
    features: [
      "Up to 3 properties",
      "5 service bookings/month",
      "Advanced health reports",
      "Smart doorbell (ad-free)",
      "CCTV access",
      "AI interior designer",
      "Priority support",
      "SOS emergency service",
    ],
    buttonText: "Subscribe Now",
    highlighted: true,
    popular: true,
  },
  {
    id: "premium",
    name: "Premium",
    price: 1999,
    period: "month",
    description: "For property managers",
    features: [
      "Unlimited properties",
      "Unlimited bookings",
      "Real-time monitoring",
      "Unlimited CCTV",
      "AI interior designer (unlimited)",
      "Dedicated manager",
      "24/7 priority support",
      "Custom integrations",
    ],
    buttonText: "Subscribe Now",
    highlighted: false,
  },
];

function PlanCard({
  plan,
  isActive,
  onActivate,
}: {
  plan: (typeof PLANS)[0];
  isActive: boolean;
  onActivate: () => void;
}) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async () => {
    if (isActive) return;

    setIsProcessing(true);

    try {
      // TODO: Call your payment API here

      console.log("Subscribe to:", plan.id);

      // Simulating a successful payment delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      alert(`Payment successful for ${plan.name} plan`);
      onActivate(); // Activate the plan after successful payment
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      className={`relative rounded-2xl p-6 ${
        plan.highlighted
          ? "border-2 border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-amber-600/5"
          : "border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02]"
      } ${isActive ? "bg-green-500/5 ring-2 ring-green-500/50" : ""}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4 }}
    >
      {plan.popular && !isActive && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-1 font-bold text-white text-xs">
            MOST POPULAR
          </span>
        </div>
      )}

      {isActive && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <span className="rounded-full bg-green-500 px-4 py-1 font-bold text-white text-xs">
            ACTIVE PLAN
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="mb-2 font-bold text-2xl text-white">{plan.name}</h3>
        <p className="text-sm text-white/40">{plan.description}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="font-extrabold text-5xl text-white">
            ₹{plan.price}
          </span>
          <span className="text-white/40">/{plan.period}</span>
        </div>
      </div>

      <button
        onClick={handleSubscribe}
        disabled={isActive || isProcessing}
        className={`mb-6 w-full rounded-xl py-3 font-semibold text-sm transition-all ${
          isActive
            ? "cursor-not-allowed border border-green-500/20 bg-white/[0.04] text-green-400"
            : plan.highlighted
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700"
              : "bg-white/[0.08] text-white hover:bg-white/[0.12]"
        }`}
      >
        {isProcessing
          ? "Processing..."
          : isActive
            ? "Currently Active"
            : plan.buttonText}
      </button>

      <div className="space-y-3">
        {plan.features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-2">
            <svg
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-sm text-white/70">{feature}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export default function SubscriptionPage() {
  const [activePlanId, setActivePlanId] = useState("free"); // Default active plan
  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState<{
    message: string;
    type: "success" | "error" | null;
  }>({ message: "", type: null });

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      setCouponStatus({
        message: "Please enter a coupon code.",
        type: "error",
      });
      return;
    }

    // Example logic for activating plans via coupon
    if (code === "FREEPRO") {
      setActivePlanId("pro");
      setCouponStatus({
        message: "Success! Pro plan activated via coupon.",
        type: "success",
      });
      setCouponCode("");
    } else if (code === "FREEPREMIUM") {
      setActivePlanId("premium");
      setCouponStatus({
        message: "Success! Premium plan activated via coupon.",
        type: "success",
      });
      setCouponCode("");
    } else {
      setCouponStatus({
        message: "Invalid or expired coupon code.",
        type: "error",
      });
    }

    // Clear message after 4 seconds
    setTimeout(() => {
      setCouponStatus({ message: "", type: null });
    }, 4000);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center md:text-left"
      >
        <h1 className="mb-2 font-bold text-3xl text-white tracking-tight">
          Choose Your Plan
        </h1>
        <p className="text-white/40">
          Select the perfect plan for your home management needs
        </p>
      </motion.div>

      {/* Coupon Code Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6 md:flex-row"
      >
        <div>
          <h2 className="font-semibold text-lg text-white">
            Have a promo code?
          </h2>
          <p className="text-sm text-white/40">
            Enter it here to activate your subscription.
          </p>
        </div>
        <div className="flex w-full flex-col items-end md:w-auto">
          <div className="flex w-full gap-2 md:w-80">
            <input
              type="text"
              placeholder="e.g., FREEPRO"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-white uppercase placeholder-white/30 transition-all focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
            <button
              onClick={handleApplyCoupon}
              className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-6 py-2.5 font-semibold text-amber-500 transition-all hover:bg-amber-500 hover:text-white"
            >
              Apply
            </button>
          </div>
          {couponStatus.message && (
            <p
              className={`mt-2 w-full text-left text-sm md:text-right ${couponStatus.type === "error" ? "text-red-400" : "text-green-400"}`}
            >
              {couponStatus.message}
            </p>
          )}
        </div>
      </motion.div>

      {/* Pricing Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isActive={activePlanId === plan.id}
            onActivate={() => setActivePlanId(plan.id)}
          />
        ))}
      </div>

      {/* FAQs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mt-12 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.02] p-6"
      >
        <h2 className="mb-6 font-bold text-white text-xl">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between text-white/70 hover:text-white">
              <span className="font-medium">Can I cancel anytime?</span>
              <svg
                className="h-5 w-5 transition-transform group-open:rotate-180"
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
            </summary>
            <p className="mt-2 pl-4 text-sm text-white/40">
              Yes, you can cancel your subscription at any time. Your plan will
              remain active until the end of the billing period.
            </p>
          </details>

          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between text-white/70 hover:text-white">
              <span className="font-medium">
                What payment methods do you accept?
              </span>
              <svg
                className="h-5 w-5 transition-transform group-open:rotate-180"
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
            </summary>
            <p className="mt-2 pl-4 text-sm text-white/40">
              We accept all major credit/debit cards, UPI, net banking, and
              digital wallets through Razorpay.
            </p>
          </details>

          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between text-white/70 hover:text-white">
              <span className="font-medium">
                Can I upgrade or downgrade my plan?
              </span>
              <svg
                className="h-5 w-5 transition-transform group-open:rotate-180"
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
            </summary>
            <p className="mt-2 pl-4 text-sm text-white/40">
              Yes, you can upgrade or downgrade at any time. Changes take effect
              immediately, and billing is prorated.
            </p>
          </details>

          <details className="group">
            <summary className="flex cursor-pointer items-center justify-between text-white/70 hover:text-white">
              <span className="font-medium">Is there a refund policy?</span>
              <svg
                className="h-5 w-5 transition-transform group-open:rotate-180"
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
            </summary>
            <p className="mt-2 pl-4 text-sm text-white/40">
              We offer a 30-day money-back guarantee for all paid plans. Contact
              support for a full refund.
            </p>
          </details>
        </div>
      </motion.div>

      {/* Contact Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="pt-8 text-center"
      >
        <p className="mb-4 text-white/40">Need help choosing a plan?</p>
        <a
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 text-amber-400 transition-colors hover:text-amber-300"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Contact Support
        </a>
      </motion.div>
    </div>
  );
}
